import ShoppingList from '../models/shoppingListModel.js';
import Recipe from '../models/recipeModel.js';
import User from '../models/userModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '../error.log');

// Helper function to parse ingredient strings and categorize them
const parseAndCategorizeIngredients = (ingredientString) => {
  // Valid units that match the schema
  const validUnits = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pcs', 'item'];
  
  // Basic parsing - assuming format like "200g pasta" or "1 cup flour"
  const match = ingredientString.match(/^([\d.]+)\s*(\w+)\s+(.+)$/);

  if (match) {
    const [, quantity, unit, name] = match;
    const parsedQuantity = parseFloat(quantity);
    const normalizedUnit = unit.toLowerCase().trim();
    const finalUnit = validUnits.includes(normalizedUnit) ? normalizedUnit : 'item';
    
    return {
      name: (name || '').toLowerCase().trim(),
      quantity: isNaN(parsedQuantity) ? 1 : parsedQuantity,
      unit: finalUnit,
    };
  }

  // If no quantity/unit, try to extract just a name, fallback to 'item' and 1
  let name = ingredientString;
  let quantity = 1;
  let unit = 'item';
  // Try to match things like "Eggs" or "Salt"
  if (typeof ingredientString === 'string') {
    name = ingredientString.toLowerCase().trim();
  } else {
    name = 'item';
  }
  return {
    name,
    quantity,
    unit,
  };
};

// Categorize ingredient by name
const categorizeIngredient = (ingredientName) => {
  const vegetableKeywords = [
    'potato',
    'carrot',
    'onion',
    'garlic',
    'broccoli',
    'spinach',
    'tomato',
    'pepper',
    'cucumber',
    'lettuce',
    'cabbage',
  ];
  const fruitKeywords = [
    'apple',
    'banana',
    'orange',
    'lemon',
    'strawberry',
    'blueberry',
  ];
  const dairyKeywords = [
    'milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'mozzarella',
    'feta',
  ];
  const meatKeywords = [
    'chicken',
    'beef',
    'pork',
    'turkey',
    'ham',
    'bacon',
    'sausage',
    'guanciale',
    'pancetta',
  ];
  const seafoodKeywords = ['fish', 'salmon', 'shrimp', 'crab', 'lobster'];
  const grainKeywords = [
    'rice',
    'pasta',
    'bread',
    'flour',
    'wheat',
    'quinoa',
    'oats',
    'cereal',
  ];
  const spiceKeywords = [
    'salt',
    'pepper',
    'cinnamon',
    'cumin',
    'paprika',
    'oregano',
    'basil',
    'thyme',
  ];
  const oilKeywords = ['oil', 'vinegar', 'soy sauce', 'sauce', 'dressing'];

  const lower = ingredientName.toLowerCase();

  if (vegetableKeywords.some((k) => lower.includes(k))) return 'Vegetables';
  if (fruitKeywords.some((k) => lower.includes(k))) return 'Fruits';
  if (dairyKeywords.some((k) => lower.includes(k))) return 'Dairy';
  if (meatKeywords.some((k) => lower.includes(k))) return 'Meat & Poultry';
  if (seafoodKeywords.some((k) => lower.includes(k))) return 'Seafood';
  if (grainKeywords.some((k) => lower.includes(k))) return 'Grains & Cereals';
  if (spiceKeywords.some((k) => lower.includes(k))) return 'Spices & Seasonings';
  if (oilKeywords.some((k) => lower.includes(k))) return 'Oils & Condiments';

  return 'Other';
};

// @desc    Generate shopping list from selected recipes
// @route   POST /api/shopping-lists/generate
// @access  Private
export const generateShoppingList = async (req, res) => {
  try {
    const { name, recipeIds, notes } = req.body;
    console.log('generateShoppingList called with:', req.body);

    if (!recipeIds || recipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one recipe',
      });
    }

    // Fetch all selected recipes
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recipes found',
      });
    }

    // Aggregate ingredients from all recipes
    const ingredientMap = new Map();

    recipes.forEach((recipe) => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ingredient) => {
          const parsed = parseAndCategorizeIngredients(ingredient);
          const key = parsed.name.toLowerCase();

          if (ingredientMap.has(key)) {
            // If same ingredient exists, try to add quantities
            const existing = ingredientMap.get(key);
            if (existing.unit === parsed.unit) {
              existing.quantity += parsed.quantity;
            } else {
              // Different units - just add as separate entries
              ingredientMap.set(key + '_' + Date.now(), parsed);
            }
          } else {
            ingredientMap.set(key, parsed);
          }
        });
      }
    });

    // Convert map to array and categorize
    const ingredients = Array.from(ingredientMap.values()).map((ing) => {
      const category = categorizeIngredient(ing.name);
      const validCategories = [
        'Vegetables',
        'Fruits',
        'Dairy',
        'Meat & Poultry',
        'Seafood',
        'Grains & Cereals',
        'Spices & Seasonings',
        'Oils & Condiments',
        'Beverages',
        'Other',
      ];
      
      const finalCategory = validCategories.includes(category) ? category : 'Other';
      
      console.log('Ingredient:', ing.name, 'Category:', category, 'FinalCategory:', finalCategory);
      return {
        name: ing.name || 'Unknown',
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit || 'item',
        category: finalCategory,
        checked: false,
      };
    });

    console.log('Ingredients before save:', JSON.stringify(ingredients, null, 2));

    // Create shopping list with validated data
    // Support requests that arrive without auth (debug route): fall back to admin user if needed
    let userId = req.user?._id;
    let dietaryPrefs = req.user?.dietaryPreferences || [];
    if (!userId) {
      try {
        const admin = await User.findOne({ email: 'admin@tastetrail.com' });
        if (admin) {
          userId = admin._id;
          dietaryPrefs = admin.dietaryPreferences || [];
        }
      } catch (e) {
        // ignore and allow null userId to surface as validation error
        console.error('Error finding admin user fallback:', e.message);
      }
    }

    const shoppingList = new ShoppingList({
      user: userId,
      name: name || 'My Shopping List',
      recipes: recipeIds,
      ingredients,
      dietaryPreferences: dietaryPrefs,
      notes: notes || '',
    });

    console.log('Shopping list object before save:', JSON.stringify(shoppingList, null, 2));

    await shoppingList.save();
    await shoppingList.populate('recipes', 'name image');

    res.status(201).json({
      success: true,
      message: 'Shopping list generated successfully',
      shoppingList,
    });
  } catch (error) {
    console.error('Error in generateShoppingList:', error);
    console.error('Request body:', req.body);
    console.error('Error stack:', error.stack);
    
    // Write to file for debugging
    const logMessage = `[${new Date().toISOString()}] Error generating shopping list\nRequest body: ${JSON.stringify(req.body)}\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(logFilePath, logMessage);
    
    res.status(500).json({
      success: false,
      message: 'Error generating shopping list',
      error: error.message,
      stack: error.stack,
    });
  }
};

// @desc    Get all shopping lists for a user
// @route   GET /api/shopping-lists
// @access  Private
export const getShoppingLists = async (req, res) => {
  try {
    console.log('getShoppingLists called for user:', req.user._id);
    const shoppingLists = await ShoppingList.find({ user: req.user._id })
      .populate('recipes', 'name image')
      .sort({ createdAt: -1 });

    console.log('Found shopping lists:', shoppingLists.length);
    res.status(200).json({
      success: true,
      count: shoppingLists.length,
      shoppingLists,
    });
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shopping lists',
      error: error.message,
    });
  }
};

// @desc    Get a single shopping list by ID
// @route   GET /api/shopping-lists/:id
// @access  Private
export const getShoppingListById = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id).populate(
      'recipes',
      'name image ingredients'
    );

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    // Check ownership
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this shopping list',
      });
    }

    res.status(200).json({
      success: true,
      shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shopping list',
      error: error.message,
    });
  }
};

// @desc    Update shopping list (toggle items, update notes, etc.)
// @route   PUT /api/shopping-lists/:id
// @access  Private
export const updateShoppingList = async (req, res) => {
  try {
    let shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    // Check ownership
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shopping list',
      });
    }

    const { name, notes, ingredients } = req.body;

    if (name) shoppingList.name = name;
    if (notes !== undefined) shoppingList.notes = notes;

    // Update ingredients (particularly the checked status)
    if (ingredients && Array.isArray(ingredients)) {
      shoppingList.ingredients = ingredients;
    }

    await shoppingList.save();
    await shoppingList.populate('recipes', 'name image');

    res.status(200).json({
      success: true,
      message: 'Shopping list updated successfully',
      shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shopping list',
      error: error.message,
    });
  }
};

// @desc    Delete a shopping list
// @route   DELETE /api/shopping-lists/:id
// @access  Private
export const deleteShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    // Check ownership
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shopping list',
      });
    }

    await ShoppingList.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Shopping list deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shopping list',
      error: error.message,
    });
  }
};

// @desc    Toggle item checked status
// @route   PATCH /api/shopping-lists/:id/items/:itemIndex
// @access  Private
export const toggleItemChecked = async (req, res) => {
  try {
    const { itemIndex } = req.params;
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    // Check ownership
    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (itemIndex < 0 || itemIndex >= shoppingList.ingredients.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item index',
      });
    }

    // Toggle checked status
    shoppingList.ingredients[itemIndex].checked =
      !shoppingList.ingredients[itemIndex].checked;

    await shoppingList.save();

    res.status(200).json({
      success: true,
      shoppingList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message,
    });
  }
};

export default {
  generateShoppingList,
  getShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  toggleItemChecked,
};
