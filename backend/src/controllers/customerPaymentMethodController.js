import CustomerPaymentMethod from '../models/customerPaymentMethodModel.js';

// GET - Get customer's payment methods
export const getPaymentMethods = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const paymentMethods = await CustomerPaymentMethod.find({ customerId })
            .sort({ isDefault: -1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            message: 'Payment methods retrieved successfully',
            data: paymentMethods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment methods',
            error: error.message
        });
    }
};

// POST - Add new payment method
export const addPaymentMethod = async (req, res) => {
    try {
        const { customerId } = req.params;
        const {
            cardholderName,
            cardType,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            isDefault = false
        } = req.body;

        // Validate required fields
        if (!cardholderName || !cardType || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
            return res.status(400).json({
                success: false,
            });
        }

        // Extract last 4 digits
        const lastFourDigits = cardNumber.slice(-4);

        // Create new payment method
        const paymentMethod = new CustomerPaymentMethod({
            customerId,
            cardholderName: cardholderName.trim(),
            cardType,
            cardNumber,
            lastFourDigits,
            expiryMonth,
            expiryYear,
            cvv,
            isDefault
        });

        await paymentMethod.save();

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            data: paymentMethod
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding payment method',
            error: error.message
        });
    }
};

// PUT - Update payment method
export const updatePaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.params;
        const updateData = req.body;
        
        const paymentMethod = await CustomerPaymentMethod.findOneAndUpdate(
            { paymentMethodId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment method updated successfully'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating payment method',
            error: error.message
        });
    }
};

// DELETE - Remove payment method
export const deletePaymentMethod = async (req, res) => {
    try {
        const { paymentMethodId } = req.params;

        const paymentMethod = await CustomerPaymentMethod.findOneAndDelete({ paymentMethodId });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting payment method',
            error: error.message
        });
    }
};
