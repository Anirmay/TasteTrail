import Recipe from '../models/recipeModel.js';

// @desc    Get all recipes with optional filtering
// @route   GET /api/recipes
// @access  Public
export const getRecipes = async (req, res) => {
  try {
    const {
      search,
      dietaryTags,
      cuisine,
      maxPrepTime,
      minRating,
      sortBy,
    } = req.query;

    // Build filter object
    let filter = {};

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by dietary tags
    if (dietaryTags) {
      const tagsArray = Array.isArray(dietaryTags)
        ? dietaryTags
        : [dietaryTags];
      filter.dietaryTags = { $in: tagsArray };
    }

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = { $regex: cuisine, $options: 'i' };
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

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
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

    // Validate required fields
    if (!name || !description || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
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
      image: image || '/images/default_recipe.svg',
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
    };

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

// @desc    Update recipe image (file upload or URL)
// @route   PUT /api/recipes/:id/image
// @access  Private
export const updateRecipeImage = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check ownership
    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe',
      });
    }

    let imageUrl = recipe.image;

    // If file was uploaded
    if (req.file) {
      // File is stored locally in uploads/recipes/
      imageUrl = `/uploads/recipes/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // If image URL was provided
      imageUrl = req.body.imageUrl;
    }

    recipe.image = imageUrl;
    await recipe.save();

    res.status(200).json({
      success: true,
      message: 'Recipe image updated successfully',
      image: imageUrl,
      recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating recipe image',
      error: error.message,
    });
  }
};

export default {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  updateRecipeImage,
};
