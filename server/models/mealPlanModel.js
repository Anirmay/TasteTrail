import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Weekly Meal Plan',
    },
    startDate: {
      type: Date,
      required: true,
    },
    // Days of the week: Monday to Sunday
    // Each day contains an array of recipe IDs
    meals: {
      monday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      tuesday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      wednesday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      thursday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      friday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      saturday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      sunday: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
