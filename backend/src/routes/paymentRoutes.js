import express from 'express';
import {
    processPayment,
    getPaymentById,
    getCustomerPayments,
    updatePaymentStatus,
    getAllPayments,
    getPaymentStatistics,
    deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

// Customer payment routes
router.post('/process/:orderId', processPayment);
router.get('/customer/:customerId', getCustomerPayments);
router.get('/:paymentId', getPaymentById);

// Admin payment management routes
router.get('/', getAllPayments);
router.put('/:paymentId/status', updatePaymentStatus);
router.delete('/:paymentId', deletePayment);
router.get('/admin/statistics', getPaymentStatistics);

export default router;
