import express from 'express';
import {
    getAllFarmerPayments,
    updateFarmerPaymentStatus,
    getFarmerPaymentStatistics
} from '../controllers/farmerPaymentController.js';

const router = express.Router();

// Statistics route
router.get('/statistics', getFarmerPaymentStatistics);

// Get all farmer payments with filtering
router.get('/', getAllFarmerPayments);

// Update payment status
router.patch('/:paymentId/status', updateFarmerPaymentStatus);

export default router;