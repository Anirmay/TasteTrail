import express from 'express';
import { registerUser, loginUser, updateUserProfile, changePassword, deleteAccount } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);
router.post('/login', loginUser);

// @route   PUT /api/users/profile
router.put('/profile', verifyToken, updateUserProfile);

// @route   PUT /api/users/password
router.put('/password', verifyToken, changePassword);

// @route   DELETE /api/users/account
router.delete('/account', verifyToken, deleteAccount);

export default router;