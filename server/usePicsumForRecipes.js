import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './models/recipeModel.js';

dotenv.config();

const updateRecipesWithPicsum = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const recipes = await Recipe.find();
    console.log(`Found ${recipes.length} recipes to update`);

    const dummyImages = {
      'Greek Salad': 'https://dummyimage.com/800x480/2ecc71/ffffff&text=Greek+Salad',
      'Classic Spaghetti Carbonara': 'https://dummyimage.com/800x480/e74c3c/ffffff&text=Carbonara',
      'Chicken Tikka Masala': 'https://dummyimage.com/800x480/f39c12/ffffff&text=Tikka+Masala',
      'Vegan Buddha Bowl': 'https://dummyimage.com/800x480/9b59b6/ffffff&text=Buddha+Bowl',
      'Homemade Pizza Margherita': 'https://dummyimage.com/800x480/c0392b/ffffff&text=Pizza+Margherita',
      'Asian Stir-Fry with Tofu': 'https://dummyimage.com/800x480/34495e/ffffff&text=Stir+Fry',
    };

    for (const recipe of recipes) {
      const dummyUrl = dummyImages[recipe.name] || 'https://dummyimage.com/800x480/95a5a6/ffffff&text=Recipe';
      recipe.image = dummyUrl;
      await recipe.save();
      console.log(`Updated ${recipe.name}: 1 → ${dummyUrl}`);
    }

    console.log('✅ All recipes updated with Picsum Photos!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating recipes:', error);
    process.exit(1);
  }
};

updateRecipesWithPicsum();
