import mongoose from 'mongoose';

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      default: 'My Shopping List',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Array of recipe IDs that are used for this shopping list
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    // Aggregated ingredients with quantities
    ingredients: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        unit: {
          type: String,
          enum: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pcs', 'item'],
          default: 'item',
        },
        category: {
          type: String,
          enum: [
            'Vegetables',
            'Fruits',
            'Dairy',
            'Meat & Poultry',
            'Seafood',
            'Grains & Cereals',
            'Spices & Seasonings',
            'Oils & Condiments',
            'Beverages',
            'Other',
          ],
          default: 'Other',
        },
        checked: {
          type: Boolean,
          default: false, // To track if item is already bought
        },
      },
    ],
    // Dietary preferences of the user when list was created
    dietaryPreferences: [String],
    // Week number or meal plan reference
    weekNumber: {
      type: Number,
      default: null,
    },
    // Notes or special instructions
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

export default ShoppingList;
