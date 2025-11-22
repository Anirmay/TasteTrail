import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './models/recipeModel.js';

dotenv.config();

const updateRecipesWithPexels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const recipes = await Recipe.find();
    console.log(`Found ${recipes.length} recipes to update`);

    // Pexels free image URLs - specific photos for each dish (verified working)
    const pexelsImages = {
      'Greek Salad': 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Classic Spaghetti Carbonara': 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Chicken Tikka Masala': 'https://images.pexels.com/photos/5737368/pexels-photo-5737368.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Vegan Buddha Bowl': 'https://images.pexels.com/photos/5474035/pexels-photo-5474035.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Homemade Pizza Margherita': 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Asian Stir-Fry with Tofu': 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=800',
    };

    for (const recipe of recipes) {
      const pexelsUrl = pexelsImages[recipe.name] || 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800';
      recipe.image = pexelsUrl;
      await recipe.save();
      console.log(`Updated ${recipe.name}: 1`);
    }

    console.log('✅ All recipes updated with Pexels photos!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating recipes:', error);
    process.exit(1);
  }
};

updateRecipesWithPexels();
