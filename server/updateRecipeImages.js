import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Recipe from './models/recipeModel.js';

dotenv.config();

const mappings = [
  { name: 'Greek Salad', image: '/images/recipes/greek_salad.svg' },
  { name: 'Classic Spaghetti Carbonara', image: '/images/recipes/classic_spaghetti_carbonara.svg' },
  { name: 'Chicken Tikka Masala', image: '/images/recipes/chicken_tikka_masala.svg' },
  { name: 'Vegan Buddha Bowl', image: '/images/recipes/vegan_buddha_bowl.svg' },
  { name: 'Homemade Pizza Margherita', image: '/images/recipes/pizza_margherita.svg' },
  { name: 'Asian Stir-Fry with Tofu', image: '/images/recipes/stir_fry_tofu.svg' },
];

const run = async () => {
  await connectDB();
  for (const m of mappings) {
    const res = await Recipe.updateOne({ name: m.name }, { $set: { image: m.image } });
    console.log(`Updated ${m.name}:`, res.nModified || res.modifiedCount || 0);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
