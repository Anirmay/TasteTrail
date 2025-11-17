import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_in_production';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  // 1. Get data from the request body
  const { name, email, password, dietaryPreferences, allergies, favoriteCuisines } =
    req.body;

  try {
    // 2. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400); // 400 = Bad Request
      throw new Error('User already exists');
    }

    // 3. Create the new user in the database
    const user = await User.create({
      name,
      email,
      password,
      dietaryPreferences,
      allergies,
      favoriteCuisines,
    });

    // 4. If user was created, send back user data and a token
    if (user) {
      // Create a token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d',
      });

      // Send response
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        favoriteCuisines: user.favoriteCuisines,
        token: token,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Check if user exists AND if password matches
    if (user && (await user.matchPassword(password))) {
      // 3. Create a token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d',
      });

      // 4. Send response
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        favoriteCuisines: user.favoriteCuisines,
        token: token,
      });
    } else {
      res.status(401); // 401 = Unauthorized
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { dietary, allergies, favoriteCuisines } = req.body;

  try {
    // Find and update user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (dietary) {
      user.dietaryPreferences = [dietary]; // Store as array but convert from string
    }
    
    if (allergies !== undefined && allergies !== null) {
      if (typeof allergies === 'string') {
        user.allergies = allergies.split(',').map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(allergies)) {
        user.allergies = allergies;
      }
    }
    
    if (favoriteCuisines !== undefined && favoriteCuisines !== null) {
      if (typeof favoriteCuisines === 'string') {
        user.favoriteCuisines = favoriteCuisines.split(',').map(c => c.trim()).filter(c => c);
      } else if (Array.isArray(favoriteCuisines)) {
        user.favoriteCuisines = favoriteCuisines;
      }
    }

    // Save updated user
    const updatedUser = await user.save();

    // Send response with updated user (without password)
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        dietary: updatedUser.dietaryPreferences[0] || 'None',
        allergies: updatedUser.allergies.join(', '),
        favoriteCuisines: updatedUser.favoriteCuisines.join(', '),
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password for security
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Delete user
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { registerUser, loginUser, updateUserProfile, changePassword, deleteAccount };