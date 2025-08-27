import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';  // Add this line

dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);  // Add this line

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Pepper Management System API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});