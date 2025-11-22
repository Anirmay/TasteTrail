import express from 'express';
import {
  generateShoppingList,
  getShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  toggleItemChecked,
} from '../controllers/shoppingListController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/shopping-lists/generate
// @access  Private
router.post('/generate', verifyToken, generateShoppingList);

// Temporary debug route (no auth) to help reproduce generation errors locally
// REMOVE or protect this in production
// Production: only expose authenticated generate endpoint

// @route   GET /api/shopping-lists
// @access  Private
router.get('/', verifyToken, getShoppingLists);

// @route   GET /api/shopping-lists/:id
// @access  Private
router.get('/:id', verifyToken, getShoppingListById);

// @route   PUT /api/shopping-lists/:id
// @access  Private
router.put('/:id', verifyToken, updateShoppingList);

// @route   DELETE /api/shopping-lists/:id
// @access  Private
router.delete('/:id', verifyToken, deleteShoppingList);

// @route   PATCH /api/shopping-lists/:id/items/:itemIndex
// @access  Private
router.patch('/:id/items/:itemIndex', verifyToken, toggleItemChecked);

export default router;
