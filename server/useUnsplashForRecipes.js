import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Recipe from './models/recipeModel.js';

dotenv.config();

const recipes = [
  'Greek Salad',
  'Classic Spaghetti Carbonara',
  'Chicken Tikka Masala',
  'Vegan Buddha Bowl',
  'Homemade Pizza Margherita',
  'Asian Stir-Fry with Tofu',
];

const slugify = (s) => {
  return encodeURIComponent(s.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ','));
};

const run = async () => {
  await connectDB();
  for (const name of recipes) {
    const query = slugify(name);
    const url = `https://source.unsplash.com/800x480/?${query}`;
    const res = await Recipe.updateOne({ name }, { $set: { image: url } });
    console.log(`Updated ${name}:`, res.modifiedCount || res.nModified || 0, url);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
