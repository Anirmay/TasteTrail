import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './models/recipeModel.js';

dotenv.config();

// ============================================
// PASTE YOUR IMAGE URLS HERE
// ============================================
// Replace each URL with your own image links
// Example: 'https://example.com/greek-salad.jpg'

const recipeImages = {
  'Greek Salad': 'https://i.postimg.cc/d1RSnnSX/Greek-Salad.png',
  'Classic Spaghetti Carbonara': 'https://i.postimg.cc/PqTX2V6m/wmremove-transformed.png',
  'Chicken Tikka Masala': 'https://i.postimg.cc/CKGNV5HG/Chicken-Tikka-Masala.png',
  'Vegan Buddha Bowl': 'https://i.postimg.cc/Y9QTZtjd/Vegan-Buddha-Bowl.png',
  'Homemade Pizza Margherita': 'https://i.postimg.cc/gjSsB7qx/Homemade-Pizza-Margherita.png',
  'Asian Stir-Fry with Tofu': 'https://i.postimg.cc/sfcNh6Wq/Asian-Stir-Fry-with-Tofu.png',
};

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

const updateRecipeImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    for (const [recipeName, imageUrl] of Object.entries(recipeImages)) {
      const result = await Recipe.updateOne(
        { name: recipeName },
        { $set: { image: imageUrl } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${recipeName}`);
        console.log(`   Image URL: ${imageUrl}\n`);
      } else {
        console.log(`⚠️  ${recipeName} - NOT FOUND in database\n`);
      }
    }

    console.log('✅ All recipe images updated!');
    console.log('📱 Refresh your browser to see the changes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating recipes:', error.message);
    process.exit(1);
  }
};

updateRecipeImages();
