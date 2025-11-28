import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import Recipe from '../models/recipeModel.js';

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
        role: user.role || 'user',
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
        role: user.role || 'user',
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

    // Send response with updated user (without password) using structured arrays
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        dietaryPreferences: updatedUser.dietaryPreferences || [],
        allergies: updatedUser.allergies || [],
        favoriteCuisines: updatedUser.favoriteCuisines || [],
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

// Note: exports for core user functions are declared at the end of this file together with new collection endpoints

// -------------------- Saved Recipes & Collections --------------------

// @desc    Get saved recipes for current user
// @route   GET /api/users/saved
// @access  Private
const getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('savedRecipes');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ saved: user.savedRecipes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Save a recipe for the current user
// @route   POST /api/users/saved/:recipeId
// @access  Private
const saveRecipe = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (!user.savedRecipes.includes(recipeId)) {
      user.savedRecipes.push(recipeId);
      await user.save();
    }

    res.status(200).json({ message: 'Recipe saved', savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove a saved recipe
// @route   DELETE /api/users/saved/:recipeId
// @access  Private
const removeSavedRecipe = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedRecipes = user.savedRecipes.filter((r) => r.toString() !== recipeId);
    await user.save();

    res.status(200).json({ message: 'Recipe removed', savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a collection
// @route   POST /api/users/collections
// @access  Private
const createCollection = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) return res.status(400).json({ message: 'Collection name is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.collections.push({ name, recipes: [] });
    await user.save();

    res.status(201).json({ message: 'Collection created', collections: user.collections });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get collections for user
// @route   GET /api/users/collections
// @access  Private
const getCollections = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('collections.recipes');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ collections: user.collections });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add a recipe to a collection
// @route   PUT /api/users/collections/:collectionId/add/:recipeId
// @access  Private
const addRecipeToCollection = async (req, res) => {
  const { collectionId, recipeId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const collection = user.collections.id(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    // Ensure recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    if (!collection.recipes.map(String).includes(String(recipeId))) {
      collection.recipes.push(recipeId);
      await user.save();
    }

    res.status(200).json({ message: 'Added to collection', collection });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove a recipe from a collection
// @route   PUT /api/users/collections/:collectionId/remove/:recipeId
// @access  Private
const removeRecipeFromCollection = async (req, res) => {
  const { collectionId, recipeId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const collection = user.collections.id(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    collection.recipes = collection.recipes.filter((r) => r.toString() !== recipeId);
    await user.save();

    res.status(200).json({ message: 'Removed from collection', collection });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/users/collections/:collectionId
// @access  Private
const deleteCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.collections = user.collections.filter((c) => c._id.toString() !== collectionId);
    await user.save();

    res.status(200).json({ message: 'Collection deleted', collections: user.collections });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename a collection
// @route   PUT /api/users/collections/:collectionId
// @access  Private
const renameCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { name } = req.body;

  console.log('[renameCollection] incoming request', {
    userId: req.userId,
    collectionId,
    body: req.body,
    method: req.method,
    url: req.originalUrl,
  });

  try {
    if (!name) return res.status(400).json({ message: 'New collection name is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const collection = user.collections.id(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    collection.name = name;
    await user.save();

    // Return updated collection and full list for convenience
    res.status(200).json({ message: 'Collection renamed', collection, collections: user.collections });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Exports are defined at the end of the file

// @desc    Get profile for current user
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// -------------------- Admin: User Management --------------------

// @desc    Get list of users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 50, search = '', role } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a user's role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private (admin)
const updateUserRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    // Prevent demoting oneself via API accidentally
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role updated', user: { _id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Disable or enable a user account (admin only)
// @route   PUT /api/users/:id/disable
// @access  Private (admin)
const toggleUserDisabled = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { id } = req.params;
    const { disabled } = req.body; // boolean

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.disabled = !!disabled;
    await user.save();

    res.status(200).json({ message: 'User status updated', user: { _id: user._id, email: user.email, disabled: user.disabled } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUserByAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { id } = req.params;
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword,
  deleteAccount,
  getUserProfile,
  getSavedRecipes,
  saveRecipe,
  removeSavedRecipe,
  createCollection,
  getCollections,
  addRecipeToCollection,
  removeRecipeFromCollection,
  deleteCollection,
  renameCollection,
  // Admin actions
  getUsers,
  updateUserRole,
  toggleUserDisabled,
  deleteUserByAdmin,
};
