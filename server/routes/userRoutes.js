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
	renameCollection,
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Debug middleware: log collection route requests for easier client/server tracing
router.use('/collections', (req, res, next) => {
	console.log('[userRoutes] collections request:', { method: req.method, path: req.originalUrl, headers: { authorization: req.headers.authorization } });
	next();
});

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
// rename collection
router.put('/collections/:collectionId', verifyToken, renameCollection);
router.delete('/collections/:collectionId', verifyToken, deleteCollection);

// @route   PUT /api/users/profile
router.put('/profile', verifyToken, updateUserProfile);

// @route   PUT /api/users/password
router.put('/password', verifyToken, changePassword);

// @route   DELETE /api/users/account
router.delete('/account', verifyToken, deleteAccount);

export default router;