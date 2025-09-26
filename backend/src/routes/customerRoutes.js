import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    updateCustomerProfile,
    getAllCustomers,
    getCustomerStats
} from '../controllers/customerController.js';

const router = express.Router();

// Customer self-service routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/profile/:id', getCustomerProfile);
router.put('/profile/:id', updateCustomerProfile);

// Admin routes for customer management
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);

export default router;
