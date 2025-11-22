import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  updateRecipeImage,
} from '../controllers/recipeController.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Private routes (require authentication)
router.post('/', verifyToken, createRecipe);
router.put('/:id', verifyToken, updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);
router.post('/:id/reviews', verifyToken, addReview);

// Image upload route - accepts file upload OR image URL
router.put('/:id/image', verifyToken, upload.single('image'), updateRecipeImage);

export default router;
