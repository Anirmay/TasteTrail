import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No two users can share an email
    },
    password: {
      type: String,
      required: true,
    },
    // --- TasteTrail Specific Fields ---
    dietaryPreferences: {
      type: [String], // e.g., ['vegan', 'gluten-free']
      default: [],
    },
    allergies: {
      type: [String], // e.g., ['peanuts', 'shellfish']
      default: [],
    },
    favoriteCuisines: {
      type: [String], // e.g., ['Italian', 'Mexican']
      default: [],
    },
    // Role for permissions (user/admin)
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Saved recipes and personal collections
    savedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    collections: [
      {
        name: { type: String, required: true },
        recipes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt'
  }
);

// --- Password Hashing ---
// This code runs *before* a new user is saved to the database
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified('password')) {
    next();
  }

  // Generate a 'salt' to hash the password
  const salt = await bcrypt.genSalt(10);
  // Hash the password and replace the plain-text one
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare plain-text password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;