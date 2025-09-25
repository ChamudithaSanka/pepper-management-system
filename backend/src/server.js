import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import rawMaterialRoutes from './routes/rawMaterialRoutes.js';
import rawMaterialOrderRoutes from './routes/rawMaterialOrderRoutes.js';
import inventoryHistoryRoutes from './routes/inventoryHistoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import farmerPaymentRoutes from './routes/farmerPaymentRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';

import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pepper-management-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/products', productRoutes); 
app.use('/api/raw-materials', rawMaterialRoutes); 
app.use('/api/rm-orders', rawMaterialOrderRoutes);
app.use('/api/inventory-history', inventoryHistoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/farmer-payments', farmerPaymentRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use('/api/users', userRoutes); 
app.use('/api/customers', customerRoutes); 

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Pepper Management System API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});