import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/recipeModel.js';

dotenv.config({ path: './.env' });

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/tastetrail';

const normalizeIngredientText = (text) => {
  if (!text) return [];
  let s = String(text).toLowerCase();
  s = s.replace(/\([^\)]*\)/g, ' ');
  s = s.replace(/\b\d+[\d\/.]*\b/g, ' ');
  s = s.replace(/\b(cups?|cup|tbsp|tablespoons?|tablespoon|tsp|teaspoons?|grams?|g|kg|ml|l|oz|ounces?|pounds?|lbs?)\b/g, ' ');
  s = s.replace(/[^a-z\s]/g, ' ');
  const tokens = s.split(/\s+/).map(t => t.trim()).filter(Boolean);
  const stop = new Set(['and','or','of','the','a','an','fresh','large','small','chopped','diced','minced','to','taste','optional','into','for','with','in','on','about']);
  const normalized = tokens.filter(t => t.length > 2 && !stop.has(t));
  return Array.from(new Set(normalized));
};

const buildIngredientTagsFromIngredients = (ingredients) => {
  if (!ingredients) return [];
  const arr = Array.isArray(ingredients) ? ingredients : String(ingredients).split(',');
  const tags = new Set();
  arr.forEach(item => {
    normalizeIngredientText(item).forEach(tok => tags.add(tok));
  });
  return Array.from(tags);
};

const run = async () => {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const recipes = await Recipe.find().lean();
  console.log(`Found ${recipes.length} recipes`);

  for (const r of recipes) {
    try {
      const ingredients = r.ingredients || [];
      const tags = buildIngredientTagsFromIngredients(ingredients);
      await Recipe.findByIdAndUpdate(r._id, { ingredientTags: tags });
      console.log(`Updated ${r._id} -> ${tags.join(', ')}`);
    } catch (err) {
      console.error('Error updating recipe', r._id, err.message);
    }
  }

  console.log('Done');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
