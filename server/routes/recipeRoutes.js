import express from 'express';
import multer from 'multer';
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

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Private routes (require authentication)
router.post('/', verifyToken, createRecipe);
router.put('/:id', verifyToken, updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);
router.post('/:id/reviews', verifyToken, upload.single('photo'), addReview);
router.put('/:id/reviews/:reviewId', verifyToken, upload.array('photos', 5), editReview);
router.delete('/:id/reviews/:reviewId', verifyToken, deleteReview);

export default router;
