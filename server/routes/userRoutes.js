import express from 'express';
import {
	registerUser,
	loginUser,
	updateUserProfile,
	changePassword,
	deleteAccount,
	getSavedRecipes,
	saveRecipe,
	removeSavedRecipe,
	createCollection,
	getCollections,
	addRecipeToCollection,
	removeRecipeFromCollection,
	deleteCollection,
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);
router.post('/login', loginUser);

// Saved recipes
router.get('/saved', verifyToken, getSavedRecipes);
router.post('/saved/:recipeId', verifyToken, saveRecipe);
router.delete('/saved/:recipeId', verifyToken, removeSavedRecipe);

// Collections
router.post('/collections', verifyToken, createCollection);
router.get('/collections', verifyToken, getCollections);
router.put('/collections/:collectionId/add/:recipeId', verifyToken, addRecipeToCollection);
router.put('/collections/:collectionId/remove/:recipeId', verifyToken, removeRecipeFromCollection);
router.delete('/collections/:collectionId', verifyToken, deleteCollection);

// @route   PUT /api/users/profile
router.put('/profile', verifyToken, updateUserProfile);

// @route   PUT /api/users/password
router.put('/password', verifyToken, changePassword);

// @route   DELETE /api/users/account
router.delete('/account', verifyToken, deleteAccount);

export default router;