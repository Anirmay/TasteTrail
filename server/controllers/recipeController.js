import Recipe from '../models/recipeModel.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Helper: normalize ingredient strings -> tokens for ingredientTags
const normalizeIngredientText = (text) => {
  if (!text) return [];
  // Lowercase
  let s = String(text).toLowerCase();

  // Remove parenthetical content
  s = s.replace(/\([^\)]*\)/g, ' ');
  // Remove fractions and numbers like 1/2 or 2.5
  s = s.replace(/\b\d+[\d\/.]*\b/g, ' ');
  // Remove common measurement units
  s = s.replace(/\b(cups?|cup|tbsp|tablespoons?|tablespoon|tbsps?|tsp|teaspoons?|grams?|g|kg|ml|l|oz|ounces?|pounds?|lbs?)\b/g, ' ');
  // Remove punctuation
  s = s.replace(/[^a-z\s]/g, ' ');
  // Split into tokens
  const tokens = s.split(/\s+/).map(t => t.trim()).filter(Boolean);

  // Stopwords / noise words commonly in ingredient lines
  const stop = new Set(['and','or','of','the','a','an','fresh','large','small','chopped','diced','minced','to','taste','optional','into','for','with','in','on','about']);

  const normalized = tokens.filter(t => t.length > 2 && !stop.has(t));
  // Return unique tokens
  return Array.from(new Set(normalized));
};

// Helper: from ingredients array produce ingredientTags array
const buildIngredientTagsFromIngredients = (ingredients) => {
  if (!ingredients) return [];
  const arr = Array.isArray(ingredients) ? ingredients : String(ingredients).split(',');
  const tags = new Set();
  arr.forEach(item => {
    normalizeIngredientText(item).forEach(tok => tags.add(tok));
  });
  return Array.from(tags);
};

// @desc    Get all recipes with optional filtering
// @route   GET /api/recipes
// @access  Public
export const getRecipes = async (req, res) => {
  try {
    process.stdout.write(`\n[getRecipes] incoming query: ${JSON.stringify(req.query)}\n`);
    const {
      search,
      dietaryTags,
      cuisine,
      maxPrepTime,
      minRating,
      sortBy,
      debug,
    } = req.query;

    // Optionally apply preferences from logged-in user. Set ?applyPreferences=false to opt-out.
    const applyPrefParam = String(req.query.applyPreferences ?? 'true');
    const shouldApplyPrefs = applyPrefParam !== 'false';

    // If an Authorization token is present and prefs are allowed, attempt to load the user
    let prefUser = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token && shouldApplyPrefs) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_change_in_production');
        prefUser = await User.findById(decoded.id).lean();
      }
    } catch (err) {
      // Invalid token or user not found — ignore and continue as public
      prefUser = null;
    }

    // Build filter object
    let filter = {};

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by dietary tags (case-insensitive). If client provided dietary filters,
    // they should take precedence over user preferences.
    if (dietaryTags) {
      console.log('[getRecipes] dietaryTags input:', typeof dietaryTags, JSON.stringify(dietaryTags));
      // Normalize dietaryTags into an array when received as a string (comma-separated or JSON)
      let tagsArray = [];
      if (Array.isArray(dietaryTags)) {
        tagsArray = dietaryTags;
      } else if (typeof dietaryTags === 'string') {
        try {
          // attempt JSON parse (e.g., dietaryTags=["Vegan","Keto"]) or CSV
          const parsed = JSON.parse(dietaryTags);
          tagsArray = Array.isArray(parsed) ? parsed : [String(parsed)];
          console.log('[getRecipes] parsed as JSON:', tagsArray);
        } catch (e) {
          // fallback: split by comma
          tagsArray = dietaryTags.split(',').map(s => s.trim()).filter(Boolean);
          console.log('[getRecipes] parsed as CSV:', tagsArray);
        }
      } else {
        tagsArray = [String(dietaryTags)];
      }

      console.log('[getRecipes] final tagsArray:', tagsArray);
      
      // Build $or array with $regex conditions for case-insensitive partial-match
      // so values like 'Vegetarian-optional' match 'Vegetarian'
      const dietaryOrConditions = tagsArray.map(tag => ({
        dietaryTags: {
          $elemMatch: {
            $regex: String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            $options: 'i'
          }
        }
      }));
      console.log('[getRecipes] dietaryOrConditions:', JSON.stringify(dietaryOrConditions));
      
      // Use $or for dietary tags (match any dietary tag), but keep separate from search $or
      // We'll add this to $and to combine with search filter if needed
      if (filter.$or) {
        // If there's already a search $or, we need to AND it with dietary $or
        filter.$and = [
          { $or: filter.$or },
          { $or: dietaryOrConditions }
        ];
        delete filter.$or;
      } else {
        filter.$or = dietaryOrConditions;
      }
    }

    // If user preferences were loaded, apply them when the client didn't explicitly provide filters
    if (prefUser) {
      // Apply dietary preferences only if no dietaryTags query provided
      if ((!dietaryTags || (Array.isArray(dietaryTags) && dietaryTags.length === 0)) && Array.isArray(prefUser.dietaryPreferences) && prefUser.dietaryPreferences.length > 0) {
        const prefOrConditions = prefUser.dietaryPreferences.map(tag => ({
          dietaryTags: {
            $elemMatch: {
              $regex: String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i'
            }
          }
        }));
        console.log('[getRecipes] user pref orConditions:', JSON.stringify(prefOrConditions));
        
        // Add to $and if search exists, otherwise set as $or
        if (filter.$or && !filter.$and) {
          filter.$and = [
            { $or: filter.$or },
            { $or: prefOrConditions }
          ];
          delete filter.$or;
        } else if (filter.$and) {
          filter.$and.push({ $or: prefOrConditions });
        } else {
          filter.$or = prefOrConditions;
        }
      }

      // Apply cuisine preference only if client didn't pass a cuisine filter
      if (!cuisine && Array.isArray(prefUser.favoriteCuisines) && prefUser.favoriteCuisines.length > 0) {
        filter.cuisine = { $in: prefUser.favoriteCuisines };
      }

      // Exclude recipes that match any of the user's allergies (if provided)
      if (Array.isArray(prefUser.allergies) && prefUser.allergies.length > 0) {
        // Build a $nor array where each entry is an elemMatch regex on ingredients
        const allergyExclusions = prefUser.allergies
          .filter(a => a && a.trim())
          .map(a => ({ ingredients: { $elemMatch: { $regex: a.trim(), $options: 'i' } } }));
        if (allergyExclusions.length > 0) {
          filter.$nor = (filter.$nor || []).concat(allergyExclusions);
        }
      }
    }

    console.log('[getRecipes] built filter:', JSON.stringify(filter, (_k, v) => (v && v.toString ? v.toString() : v)));

    // Build a summary of applied filters for client-side debugging (regexes to strings)
    const appliedFilters = {};
    if (req.query.search) appliedFilters.search = req.query.search;
    if (req.query.ingredient) appliedFilters.ingredient = req.query.ingredient;
    if (dietaryTags) appliedFilters.dietaryTags = Array.isArray(dietaryTags) ? dietaryTags : String(dietaryTags).split(',').map(s => s.trim());
    if (cuisine) appliedFilters.cuisine = cuisine;
    if (maxPrepTime) appliedFilters.maxPrepTime = maxPrepTime;
    appliedFilters.applyPreferences = shouldApplyPrefs;

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = { $regex: cuisine, $options: 'i' };
    }

    // Ingredient tag search (client passes `ingredient=<term>`)
    if (req.query.ingredient) {
      // Normalize the incoming ingredient search into tokens and match any
      const searchTokens = buildIngredientTagsFromIngredients([req.query.ingredient]);
      if (searchTokens.length > 0) {
        filter.ingredientTags = { $in: searchTokens };
      }
    }

    // Filter by max prep time
    if (maxPrepTime) {
      filter.prepTime = { $lte: parseInt(maxPrepTime) };
    }

    // Filter by minimum rating
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: newest first

    if (sortBy === 'rating') {
      sortObj = { rating: -1 };
    } else if (sortBy === 'prepTime') {
      sortObj = { prepTime: 1 };
    } else if (sortBy === 'name') {
      sortObj = { name: 1 };
    }

    // Query recipes
    const recipes = await Recipe.find(filter)
      .populate('user', 'name email')
      .sort(sortObj)
      .lean();

    // If debug flag is set, include distinct dietary tags in response
    let debugInfo = null;
    if (debug === 'true') {
      const distinctTags = await Recipe.distinct('dietaryTags');
      debugInfo = { distinctDietaryTags: distinctTags };
    }

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
      appliedFilters,
      ...(debugInfo && { debug: debugInfo }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message,
    });
  }
};

// @desc    Get a single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe',
      error: error.message,
    });
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
export const createRecipe = async (req, res) => {
  try {
    console.log('[createRecipe] content-type:', req.headers['content-type']);
    console.log('[createRecipe] req.body keys:', Object.keys(req.body));
    console.log('[createRecipe] req.body sample:', {
      name: req.body.name,
      description: req.body.description,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
    });
    console.log('[createRecipe] req.file:', req.file ? { filename: req.file.filename, fieldname: req.file.fieldname } : null);

    const {
      name,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      dietaryTags,
      cuisine,
      image,
    } = req.body;

    // If an image file was uploaded via multer, prefer that
    const file = req.file;

    // Validate required fields with clearer messages
    const missing = [];
    if (!name || String(name).trim() === '') missing.push('name');
    if (!description || String(description).trim() === '') missing.push('description');
    if (!ingredients || String(ingredients).trim() === '') missing.push('ingredients');
    if (!instructions || String(instructions).trim() === '') missing.push('instructions');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
        missing,
      });
    }

    // Create recipe
    const recipe = new Recipe({
      user: req.user._id,
      name,
      description,
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : ingredients.split(',').map((i) => i.trim()),
      instructions: Array.isArray(instructions)
        ? instructions
        : instructions.split(',').map((i) => i.trim()),
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      dietaryTags: Array.isArray(dietaryTags)
        ? dietaryTags
        : dietaryTags
        ? [dietaryTags]
        : [],
      cuisine: cuisine || '',
      image: file ? `/uploads/recipes/${file.filename}` : (image || '/images/default_recipe.svg'),
      // compute ingredient tags for normalized search
      ingredientTags: buildIngredientTagsFromIngredients(Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())),
    });

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: error.message,
    });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
export const updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check if user is the owner or admin
    if (
      recipe.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe',
      });
    }

    // Update fields
    const updateFields = [
      'name',
      'description',
      'image',
      'ingredients',
      'instructions',
      'prepTime',
      'cookTime',
      'dietaryTags',
      'cuisine',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (
          (field === 'ingredients' || field === 'instructions') &&
          !Array.isArray(req.body[field])
        ) {
          recipe[field] = req.body[field]
            .split(',')
            .map((item) => item.trim());
        } else {
          recipe[field] = req.body[field];
        }
      }
    });

    // Recompute ingredientTags if ingredients updated
    if (req.body.ingredients !== undefined) {
      const ingredientsArr = Array.isArray(req.body.ingredients)
        ? req.body.ingredients
        : String(req.body.ingredients).split(',').map(i => i.trim());
      recipe.ingredientTags = buildIngredientTagsFromIngredients(ingredientsArr);
    }

    // If a new image file was uploaded, remove the old one (if it's a local upload)
    if (req.file) {
      try {
        if (recipe.image && recipe.image.startsWith('/uploads/recipes/')) {
          const oldFilename = path.basename(recipe.image);
          const oldPath = path.join(process.cwd(), 'uploads', 'recipes', oldFilename);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error('Error deleting old recipe image:', err.message);
      }
      recipe.image = `/uploads/recipes/${req.file.filename}`;
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating recipe',
      error: error.message,
    });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check if user is the owner or admin
    if (
      recipe.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe',
      });
    }

    // Delete local image file if present
    try {
      if (recipe.image && recipe.image.startsWith('/uploads/recipes/')) {
        const filename = path.basename(recipe.image);
        const filePath = path.join(process.cwd(), 'uploads', 'recipes', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting recipe image file:', err.message);
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe',
      error: error.message,
    });
  }
};

// @desc    Add a review to a recipe
// @route   POST /api/recipes/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // If multipart/form-data was used, multer will have populated req.files
    const files = req.files || (req.file ? [req.file] : []);

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and comment',
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = recipe.reviews.some(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this recipe',
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      photos: [],
    };

    if (files && files.length > 0) {
      review.photos = files.slice(0, 5).map(f => `/uploads/reviews/${f.filename}`);
    }

    recipe.reviews.push(review);

    // Calculate average rating
    recipe.rating =
      recipe.reviews.reduce((acc, item) => item.rating + acc, 0) /
      recipe.reviews.length;
    recipe.numReviews = recipe.reviews.length;

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message,
    });
  }
};

// @desc    Edit a review (only owner or admin)
// @route   PUT /api/recipes/:id/reviews/:reviewId
// @access  Private
export const editReview = async (req, res) => {
  try {
    const { rating, comment, removePhoto } = req.body;
    const file = req.file;

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const review = recipe.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only review owner or admin can edit
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    // Update fields if provided
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    // Handle photo removal (removePhoto can be an array of URLs to remove)
    if (removePhoto) {
      let removeList = [];
      if (Array.isArray(removePhoto)) {
        removeList = removePhoto;
      } else if (typeof removePhoto === 'string') {
        try {
          removeList = JSON.parse(removePhoto);
        } catch {
          removeList = [removePhoto];
        }
      }
      if (review.photos && review.photos.length > 0) {
        removeList.forEach((url) => {
          const idx = review.photos.indexOf(url);
          if (idx !== -1) {
            const filename = path.basename(url);
            const filePath = path.join(process.cwd(), 'uploads', 'reviews', filename);
            try {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
              console.error('Error deleting review photo:', err.message);
            }
            review.photos.splice(idx, 1);
          }
        });
      }
    }

    // Handle new photo uploads (multiple)
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      // Limit to 5 total photos
      const currentPhotos = review.photos || [];
      const newPhotos = files.map(f => `/uploads/reviews/${f.filename}`);
      review.photos = [...currentPhotos, ...newPhotos].slice(0, 5);
    }

    // Recalculate aggregate rating
    recipe.rating =
      recipe.reviews.reduce((acc, item) => item.rating + acc, 0) /
      recipe.reviews.length;

    await recipe.save();

    res.status(200).json({ success: true, message: 'Review updated', recipe, review });
  } catch (error) {
    console.error('[editReview] ERROR:', error);
    res.status(500).json({ success: false, message: 'Error editing review', error: error.message });
  }
};

// @desc    Delete a review (only owner or admin)
// @route   DELETE /api/recipes/:id/reviews/:reviewId
// @access  Private
export const deleteReview = async (req, res) => {
  console.log('[deleteReview] recipeId:', req.params.id, 'reviewId:', req.params.reviewId);
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (recipe) {
      console.log('[deleteReview] recipe.reviews:', recipe.reviews.map(r => ({ _id: r._id, user: r.user, name: r.name })));
      const review = recipe.reviews.id(req.params.reviewId);
      console.log('[deleteReview] found review:', !!review, review ? review._id : null);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      // Only owner or admin can delete
      if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }
      // Delete photo file if exists
      if (review.photo) {
        const filename = path.basename(review.photo);
        const filePath = path.join(process.cwd(), 'uploads', 'reviews', filename);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error deleting review photo during delete:', err.message);
        }
      }
      // Remove review using pull
      recipe.reviews.pull(review._id);
      // Recalculate rating and counts
      if (recipe.reviews.length > 0) {
        recipe.rating = recipe.reviews.reduce((acc, item) => item.rating + acc, 0) / recipe.reviews.length;
      } else {
        recipe.rating = 0;
      }
      recipe.numReviews = recipe.reviews.length;
      await recipe.save();
      res.status(200).json({ success: true, message: 'Review deleted', recipe });
    } else {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
  } catch (error) {
    console.error('[deleteReview] ERROR:', error);
    res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
};

// Debug endpoint: inspect distinct dietaryTags in DB
export const debugDietaryTags = async (req, res) => {
  try {
    const distinct = await Recipe.distinct('dietaryTags');
    const allRecipes = await Recipe.find({}, { name: 1, dietaryTags: 1 }).limit(20).lean();
    res.status(200).json({
      distinctTags: distinct,
      sampleRecipes: allRecipes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  editReview,
  deleteReview,
  debugDietaryTags,
};
