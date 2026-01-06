import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import testRouter from './routes/testRouter.js';
import fs from 'fs';
import path from 'path';

// Validate meal plan routes immediately after import
console.log('[VALIDATION] mealPlanRoutes type:', typeof mealPlanRoutes);
if (!mealPlanRoutes || typeof mealPlanRoutes !== 'function') {
  console.error('[ERROR] mealPlanRoutes is not a valid router! Value:', mealPlanRoutes);
}
console.log('[VALIDATION] mealPlanRoutes stack:', mealPlanRoutes?.stack?.length || 0, 'routes defined');
if (mealPlanRoutes?.stack) {
  mealPlanRoutes.stack.forEach((layer, idx) => {
    console.log(`  [Route ${idx}]:`, layer.route?.path || '(middleware)');
  });
}

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// Allows us to accept JSON data in the body
app.use(express.json());
// Allows cross-origin requests from your React client
const allowedOrigins = [
  'https://nimble-dusk-4dd9d7.netlify.app',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// Ensure uploads directory exists and serve it
try {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const reviewsDir = path.join(uploadsDir, 'reviews');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(reviewsDir)) fs.mkdirSync(reviewsDir, { recursive: true });
} catch (e) {
  console.error('Failed to ensure uploads directory exists', e.message);
}
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- API Test Route ---
app.get('/', (req, res) => {
  res.send('TasteTrail API is running...');
});

// Debug route to list registered routes (dev only)
// Removed debug route that listed registered routes (cleanup for production)
// app.get('/api/debug/routes', (req, res) => {
//   const routes = [];
//   app._router.stack.forEach((middleware) => {
//     if (middleware.route) {
//       // routes registered directly on the app
//       routes.push({ path: middleware.route.path, methods: middleware.route.methods });
//     } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
//       // router middleware
//       middleware.handle.stack.forEach(function(handler) {
//         const route = handler.route;
//         if (route) {
//           routes.push({ path: route.path, methods: route.methods });
//         }
//       });
//     }
//   });
//   res.json(routes);
// });

// --- API Routes ---
console.log('Registering API routes...');
app.use('/api/users', userRoutes);
console.log('✓ User routes registered');
app.use('/api/recipes', recipeRoutes);
console.log('✓ Recipe routes registered');
app.use('/api/shopping-lists', shoppingListRoutes);
console.log('✓ Shopping list routes registered');
console.log('[DEBUG] About to register meal-plans, mealPlanRoutes type:', typeof mealPlanRoutes, 'value:', mealPlanRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
console.log('✓ Meal plan routes registered');
app.use('/api/test-router', testRouter);
console.log('✓ Test router registered');
console.log('[DEBUG] After meal-plans registration');

// Test route
app.get('/api/test/routes', (req, res) => {
  res.json({ mealPlanRoutesLoaded: !!mealPlanRoutes });
});

// --- Listen ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});