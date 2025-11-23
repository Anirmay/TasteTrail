import express from 'express';
import {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  addRecipeToDay,
  removeRecipeFromDay,
  updateMealPlan,
  deleteMealPlan,
  generateShoppingListFromMealPlan,
} from '../controllers/mealPlanController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/meal-plans
// @access  Private
router.post('/', verifyToken, createMealPlan);

// @route   GET /api/meal-plans
// @access  Private
router.get('/', verifyToken, getMealPlans);

// @route   GET /api/meal-plans/:id
// @access  Private
router.get('/:id', verifyToken, getMealPlanById);

// @route   POST /api/meal-plans/:id/add-recipe
// @access  Private
router.post('/:id/add-recipe', verifyToken, addRecipeToDay);

// @route   DELETE /api/meal-plans/:id/remove-recipe
// @access  Private
router.delete('/:id/remove-recipe', verifyToken, removeRecipeFromDay);

// @route   PUT /api/meal-plans/:id
// @access  Private
router.put('/:id', verifyToken, updateMealPlan);

// @route   DELETE /api/meal-plans/:id
// @access  Private
router.delete('/:id', verifyToken, deleteMealPlan);

// @route   POST /api/meal-plans/:id/generate-shopping-list
// @access  Private
router.post('/:id/generate-shopping-list', verifyToken, generateShoppingListFromMealPlan);

export default router;
