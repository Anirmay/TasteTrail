import express from 'express';
import {
	registerUser,
	loginUser,
	getUserProfile,
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
	getUsers,
	updateUserRole,
	toggleUserDisabled,
	deleteUserByAdmin,
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

// @route   GET /api/users/profile
router.get('/profile', verifyToken, getUserProfile);

// @route   PUT /api/users/password
router.put('/password', verifyToken, changePassword);

// @route   DELETE /api/users/account
router.delete('/account', verifyToken, deleteAccount);

// --- Admin user management routes ---
// GET /api/users/?page=&limit=&search=&role=
router.get('/', verifyToken, getUsers);
// Update role
router.put('/:id/role', verifyToken, updateUserRole);
// Disable / enable
router.put('/:id/disable', verifyToken, toggleUserDisabled);
// Delete user (admin)
router.delete('/:id', verifyToken, deleteUserByAdmin);

export default router;