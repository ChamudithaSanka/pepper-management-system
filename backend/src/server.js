import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import rawMaterialRoutes from './routes/rawMaterialRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import rawMaterialOrderRoutes from './routes/rawMaterialOrderRoutes.js';
import inventoryHistoryRoutes from './routes/inventoryHistoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';

dotenv.config();

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
app.use('/api/farmers', farmerRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/customers', customerRoutes); 
app.use('/api/employees', employeeRoutes);
app.use('/api/rm-orders', rawMaterialOrderRoutes);
app.use('/api/inventory-history', inventoryHistoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/salaries', salaryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Pepper Management System API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});