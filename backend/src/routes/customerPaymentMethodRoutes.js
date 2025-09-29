import express from 'express';
import {
    getPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
} from '../controllers/customerPaymentMethodController.js';

const router = express.Router();

// GET /api/paymentMethods/:customerId - Get customer's payment methods
router.get('/:customerId', getPaymentMethods);

// POST /api/paymentMethods/:customerId - Add new payment method
router.post('/:customerId', addPaymentMethod);

// PUT /api/paymentMethods/:paymentMethodId - Update payment method
router.put('/:paymentMethodId', updatePaymentMethod);

// DELETE /api/paymentMethods/:paymentMethodId - Delete payment method
router.delete('/:paymentMethodId', deletePaymentMethod);

export default router;
