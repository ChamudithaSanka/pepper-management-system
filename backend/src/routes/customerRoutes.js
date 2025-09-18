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
    deleteCustomer,
    getAvailableProducts,
    getProductDetails,
    getProductCategories,
    searchProducts
} from '../controllers/customerController.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
} from '../controllers/cartController.js';

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

// Cart management routes
router.post('/:customerId/cart', addToCart);
router.get('/:customerId/cart', getCart);
router.get('/:customerId/cart/count', getCartCount);
router.put('/:customerId/cart/:productId', updateCartItem);
router.delete('/:customerId/cart/:productId', removeFromCart);
router.delete('/:customerId/cart', clearCart);

// Admin routes for customer management
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.put('/:id', updateCustomerProfile);
router.delete('/:id', deleteCustomer);

export default router;
