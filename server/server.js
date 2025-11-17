import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

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

// --- API Routes ---
app.use('/api/users', userRoutes);

// --- Listen ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});