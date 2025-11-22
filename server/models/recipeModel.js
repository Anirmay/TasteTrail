import mongoose from 'mongoose';

// A sub-schema for reviews
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Links this review to a user
    },
  },
  {
    timestamps: true,
  }
);

const recipeSchema = new mongoose.Schema(
  {
    // Link to the user who created this recipe (if it's not an admin)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true, // Removes whitespace
    },
    image: {
      type: String,
      required: true,
      default: '/images/default_recipe.svg', // A default placeholder (local)
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String], // An array of ingredient strings
      required: true,
    },
    instructions: {
      type: [String], // An array of instruction steps
      required: true,
    },
    prepTime: {
      type: Number, // Time in minutes
      required: true,
      default: 0,
    },
    cookTime: {
      type: Number, // Time in minutes
      required: true,
      default: 0,
    },
    // --- TasteTrail Specific Fields ---
    dietaryTags: {
      type: [String], // e.g., ['vegan', 'gluten-free']
      default: [],
    },
    cuisine: {
      type: String, // e.g., 'Italian'
      trim: true,
    },
    // --- Review Fields ---
    reviews: [reviewSchema], // Nests the review schema from above
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt'
  }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;