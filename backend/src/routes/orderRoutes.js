import express from 'express';
import {
    createOrderFromCart,
    getOrderById,
    getCustomerOrders,
    updateOrderStatus,
    getAllOrders,
    getOrdersByStatus,
    getOrderStatistics
} from '../controllers/orderController.js';

const router = express.Router();

// Customer order routes
router.post('/create/:customerId', createOrderFromCart);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/:orderId', getOrderById);

// Admin order management routes
router.get('/', getAllOrders);
router.get('/status/:status', getOrdersByStatus);
router.put('/:orderId/status', updateOrderStatus);
router.get('/admin/statistics', getOrderStatistics);

export default router;
