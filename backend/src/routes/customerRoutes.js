import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    checkSession,
    getCustomerProfile,
    updateCustomerProfile,
    getAllCustomers,
    getCustomerStats,
    getAvailableProducts,
    getProductDetails,
    getProductCategories,
    searchProducts
} from '../controllers/customerController.js';

const router = express.Router();

// Customer self-service routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/session', checkSession);
router.get('/profile/:id', getCustomerProfile);
router.put('/profile/:id', updateCustomerProfile);

// Product browsing routes for customers
router.get('/products', getAvailableProducts);
router.get('/products/categories', getProductCategories);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProductDetails);

// Admin routes for customer management
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);

export default router;
