import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// Allows us to accept JSON data in the body
app.use(express.json());
// Allows cross-origin requests from your React client
app.use(cors());

// --- API Test Route ---
app.get('/', (req, res) => {
  res.send('TasteTrail API is running...');
});

// Debug route to list registered routes (dev only)
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push({ path: middleware.route.path, methods: middleware.route.methods });
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      // router middleware
      middleware.handle.stack.forEach(function(handler) {
        const route = handler.route;
        if (route) {
          routes.push({ path: route.path, methods: route.methods });
        }
      });
    }
  });
  res.json(routes);
});

// --- API Routes ---
console.log('Setting up API routes...');
app.use('/api/users', userRoutes);
console.log('✓ User routes registered');
app.use('/api/recipes', recipeRoutes);
console.log('✓ Recipe routes registered');
app.use('/api/shopping-lists', shoppingListRoutes);
console.log('✓ Shopping list routes registered');

// --- Listen ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});