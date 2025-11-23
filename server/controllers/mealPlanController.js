import MealPlan from '../models/mealPlanModel.js';
import Recipe from '../models/recipeModel.js';

// @desc    Create a new meal plan
// @route   POST /api/meal-plans
// @access  Private
export const createMealPlan = async (req, res) => {
  try {
    const { name, startDate, notes } = req.body;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required',
      });
    }

    const mealPlan = new MealPlan({
      user: req.user._id,
      name: name || 'Weekly Meal Plan',
      startDate: new Date(startDate),
      notes: notes || '',
      meals: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    });

    await mealPlan.save();
    await mealPlan.populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image');

    res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Error in createMealPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meal plan',
    });
  }
};

// @desc    Get all meal plans for a user
// @route   GET /api/meal-plans
// @access  Private
export const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user._id })
      .populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      mealPlans,
    });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meal plans',
    });
  }
};

// @desc    Get a single meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Private
export const getMealPlanById = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image description ingredients');

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this meal plan',
      });
    }

    res.status(200).json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meal plan',
    });
  }
};

// @desc    Add recipe to a specific day
// @route   POST /api/meal-plans/:id/add-recipe
// @access  Private
export const addRecipeToDay = async (req, res) => {
  try {
    const { day, recipeId } = req.body;

    if (!day || !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Day and recipe ID are required',
      });
    }

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week',
      });
    }

    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this meal plan',
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Add recipe to the day if not already added
    const dayKey = day.toLowerCase();
    if (!mealPlan.meals[dayKey].includes(recipeId)) {
      mealPlan.meals[dayKey].push(recipeId);
      await mealPlan.save();
    }

    await mealPlan.populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image');

    res.status(200).json({
      success: true,
      message: `Recipe added to ${day}`,
      mealPlan,
    });
  } catch (error) {
    console.error('Error adding recipe to day:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding recipe to day',
    });
  }
};

// @desc    Remove recipe from a specific day
// @route   DELETE /api/meal-plans/:id/remove-recipe
// @access  Private
export const removeRecipeFromDay = async (req, res) => {
  try {
    const { day, recipeId } = req.body;

    if (!day || !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Day and recipe ID are required',
      });
    }

    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this meal plan',
      });
    }

    const dayKey = day.toLowerCase();
    mealPlan.meals[dayKey] = mealPlan.meals[dayKey].filter(
      (id) => id.toString() !== recipeId.toString()
    );

    await mealPlan.save();
    await mealPlan.populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image');

    res.status(200).json({
      success: true,
      message: `Recipe removed from ${day}`,
      mealPlan,
    });
  } catch (error) {
    console.error('Error removing recipe from day:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing recipe from day',
    });
  }
};

// @desc    Update meal plan details (name, notes)
// @route   PUT /api/meal-plans/:id
// @access  Private
export const updateMealPlan = async (req, res) => {
  try {
    const { name, notes } = req.body;

    let mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this meal plan',
      });
    }

    if (name) mealPlan.name = name;
    if (notes !== undefined) mealPlan.notes = notes;

    await mealPlan.save();
    await mealPlan.populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday', 'name image');

    res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meal plan',
    });
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this meal plan',
      });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Meal plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meal plan',
    });
  }
};

// @desc    Generate shopping list from entire meal plan
// @route   POST /api/meal-plans/:id/generate-shopping-list
// @access  Private
export const generateShoppingListFromMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('meals.monday meals.tuesday meals.wednesday meals.thursday meals.friday meals.saturday meals.sunday');

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Check ownership
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this meal plan',
      });
    }

    // Collect all recipe IDs from the entire week
    const allRecipeIds = [
      ...mealPlan.meals.monday,
      ...mealPlan.meals.tuesday,
      ...mealPlan.meals.wednesday,
      ...mealPlan.meals.thursday,
      ...mealPlan.meals.friday,
      ...mealPlan.meals.saturday,
      ...mealPlan.meals.sunday,
    ].map((meal) => meal._id);

    if (allRecipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipes in meal plan to generate shopping list',
      });
    }

    // Return recipe IDs to be used for shopping list generation
    res.status(200).json({
      success: true,
      message: 'Shopping list data prepared',
      recipeIds: allRecipeIds,
      mealPlanName: mealPlan.name,
    });
  } catch (error) {
    console.error('Error generating shopping list from meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating shopping list',
    });
  }
};

// All functions are exported above as named exports
