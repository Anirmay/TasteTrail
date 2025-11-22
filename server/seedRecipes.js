import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './models/recipeModel.js';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const sampleRecipes = [
  {
    name: 'Classic Spaghetti Carbonara',
    description: 'Creamy Italian pasta with bacon and eggs - a true Roman classic',
    ingredients: [
      '400g spaghetti',
      '200g guanciale or pancetta, cubed',
      '4 large eggs',
      '100g Pecorino Romano cheese, grated',
      'Black pepper to taste',
      'Salt for pasta water',
    ],
    instructions: [
      'Cook spaghetti in boiling salted water until al dente',
      'While pasta cooks, fry guanciale until crispy',
      'Beat eggs with cheese and black pepper in a bowl',
      'Drain pasta, reserving 1 cup pasta water',
      'Combine hot pasta with guanciale, then remove from heat',
      'Add egg mixture, tossing quickly and adding pasta water as needed',
      'Serve immediately with extra cheese',
    ],
    prepTime: 10,
    cookTime: 20,
    dietaryTags: ['Vegetarian-optional'],
    cuisine: 'Italian',
    image: 'https://via.placeholder.com/500x300?text=Carbonara',
  },
  {
    name: 'Chicken Tikka Masala',
    description:
      'Tender chicken in a creamy tomato-based sauce with aromatic Indian spices',
    ingredients: [
      '800g chicken breast, cubed',
      '1 cup Greek yogurt',
      '3 tbsp tikka paste',
      '400ml coconut milk',
      '400ml canned tomatoes',
      '2 onions, diced',
      '3 garlic cloves, minced',
      '2 tsp ginger paste',
      'Fresh coriander',
      'Basmati rice',
    ],
    instructions: [
      'Marinate chicken in yogurt and tikka paste for 2 hours',
      'Cook chicken in a hot pan until browned, then set aside',
      'Sauté onions, garlic, and ginger in the same pan',
      'Add tomatoes and coconut milk',
      'Simmer for 10 minutes to combine flavors',
      'Add cooked chicken back and simmer 15 more minutes',
      'Garnish with coriander and serve with basmati rice',
    ],
    prepTime: 30,
    cookTime: 45,
    dietaryTags: [],
    cuisine: 'Indian',
    image: 'https://via.placeholder.com/500x300?text=Tikka+Masala',
  },
  {
    name: 'Vegan Buddha Bowl',
    description: 'Colorful and nutritious bowl packed with vegetables, grains, and tahini dressing',
    ingredients: [
      '1 cup cooked quinoa',
      '1 can chickpeas, roasted',
      '2 cups mixed greens',
      '1 sweet potato, roasted and cubed',
      '1 cup shredded carrots',
      '1 avocado, sliced',
      '2 tbsp tahini',
      '2 tbsp lemon juice',
      'Garlic and salt to taste',
    ],
    instructions: [
      'Cook quinoa according to package directions',
      'Roast chickpeas with olive oil and spices until crispy',
      'Cube and roast sweet potato at 400°F for 25 minutes',
      'Whisk tahini with lemon juice, garlic, and water to make dressing',
      'Arrange greens in a bowl',
      'Top with quinoa, roasted chickpeas, sweet potato, and fresh veggies',
      'Drizzle with tahini dressing and serve',
    ],
    prepTime: 20,
    cookTime: 35,
    dietaryTags: ['Vegan', 'Gluten-Free'],
    cuisine: 'Mediterranean',
    image: 'https://via.placeholder.com/500x300?text=Buddha+Bowl',
  },
  {
    name: 'Homemade Pizza Margherita',
    description:
      'Simple yet elegant pizza with fresh mozzarella, basil, and tomatoes',
    ingredients: [
      '500g pizza dough',
      '200ml pizza sauce',
      '250g fresh mozzarella',
      'Fresh basil leaves',
      '4 ripe tomatoes, sliced',
      'Olive oil',
      'Salt and pepper',
    ],
    instructions: [
      'Preheat oven to 250°C (480°F)',
      'Roll out pizza dough to desired thickness',
      'Spread pizza sauce evenly',
      'Arrange tomato slices over sauce',
      'Tear mozzarella and distribute across pizza',
      'Drizzle with olive oil and season with salt and pepper',
      'Bake for 12-15 minutes until crust is golden',
      'Top with fresh basil before serving',
    ],
    prepTime: 15,
    cookTime: 20,
    dietaryTags: ['Vegetarian'],
    cuisine: 'Italian',
    image: 'https://via.placeholder.com/500x300?text=Pizza+Margherita',
  },
  {
    name: 'Asian Stir-Fry with Tofu',
    description: 'Quick and colorful stir-fry loaded with vegetables and crispy tofu',
    ingredients: [
      '400g firm tofu, cubed',
      '3 cups mixed vegetables (broccoli, bell peppers, snap peas)',
      '3 garlic cloves, minced',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '1 tsp ginger paste',
      '2 tbsp vegetable oil',
      'Sesame seeds',
      'Green onions',
      'Rice or noodles',
    ],
    instructions: [
      'Press tofu to remove excess moisture, then cube',
      'Heat oil in a wok over high heat',
      'Fry tofu until golden on all sides, set aside',
      'Stir-fry vegetables until tender-crisp',
      'Add garlic and ginger, cook for 1 minute',
      'Return tofu to the wok',
      'Add soy sauce and sesame oil, toss to combine',
      'Serve over rice or noodles, garnish with sesame seeds and green onions',
    ],
    prepTime: 20,
    cookTime: 15,
    dietaryTags: ['Vegan', 'Gluten-Free'],
    cuisine: 'Japanese',
    image: 'https://via.placeholder.com/500x300?text=Stir-Fry',
  },
  {
    name: 'Greek Salad',
    description: 'Fresh and light salad with feta cheese, olives, and vegetables',
    ingredients: [
      '3 large tomatoes, cubed',
      '1 cucumber, cubed',
      '1 red onion, thinly sliced',
      '1 cup Kalamata olives',
      '200g feta cheese, crumbled',
      '3 tbsp olive oil',
      '1 tbsp red wine vinegar',
      'Salt and pepper to taste',
      'Fresh oregano',
    ],
    instructions: [
      'Combine tomatoes, cucumber, and red onion in a large bowl',
      'Add olives and feta cheese',
      'Whisk together olive oil and red wine vinegar',
      'Pour dressing over salad',
      'Toss gently to combine',
      'Season with salt, pepper, and oregano',
      'Serve chilled or at room temperature',
    ],
    prepTime: 15,
    cookTime: 0,
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    cuisine: 'Mediterranean',
    image: 'https://via.placeholder.com/500x300?text=Greek+Salad',
  },
];

const seedRecipes = async () => {
  try {
    // Clear existing recipes
    await Recipe.deleteMany({});

    // Get a default admin user or create one
    let adminUser = await User.findOne({ email: 'admin@tastetrail.com' });

    if (!adminUser) {
      adminUser = await User.create({
        name: 'TasteTrail Admin',
        email: 'admin@tastetrail.com',
        password: 'admin123',
        dietaryPreferences: [],
        allergies: [],
        favoriteCuisines: [],
      });
    }

    // Add user reference to recipes
    const recipesWithUser = sampleRecipes.map((recipe) => ({
      ...recipe,
      user: adminUser._id,
    }));

    // Insert sample recipes
    const createdRecipes = await Recipe.insertMany(recipesWithUser);

    console.log(`✅ Successfully seeded ${createdRecipes.length} recipes!`);
    console.log('Sample recipes added to the database.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding recipes:', error);
    process.exit(1);
  }
};

seedRecipes();
