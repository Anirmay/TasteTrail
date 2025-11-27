import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  editReview,
  deleteReview,
} from '../controllers/recipeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Multer setup for review photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reviews');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  },
});
const upload = multer({ storage });

// Ensure recipes upload directory exists and setup multer for recipe images
const recipesDir = path.join(process.cwd(), 'uploads', 'recipes');
if (!fs.existsSync(recipesDir)) {
  fs.mkdirSync(recipesDir, { recursive: true });
}
const recipeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/recipes');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  },
});
const uploadRecipe = multer({ storage: recipeStorage });

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Private routes (require authentication)
router.post('/', verifyToken, uploadRecipe.single('image'), createRecipe);
router.put('/:id', verifyToken, uploadRecipe.single('image'), updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);
router.post('/:id/reviews', verifyToken, upload.single('photo'), addReview);
router.put('/:id/reviews/:reviewId', verifyToken, upload.array('photos', 5), editReview);
router.delete('/:id/reviews/:reviewId', verifyToken, deleteReview);

export default router;
