import FarmerPayment from '../models/farmerPaymentModel.js';
import RawMaterialOrder from '../models/rawMaterialOrderModel.js';
import Farmer from '../models/farmerModel.js';

// Get all farmer payments with filtering options
export const getAllFarmerPayments = async (req, res) => {
    try {
        const { status } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.paymentStatus = status;

        const payments = await FarmerPayment.find(filter)
            .sort({ generatedDate: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching farmer payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer payments'
        });
    }
};

// Update payment status to paid
export const updateFarmerPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { paymentStatus } = req.body;

        if (!['Pending', 'Paid'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }

        const updateData = { paymentStatus };
        
        // Set paid date when status is paid
        if (paymentStatus === 'Paid') {
            updateData.paidDate = new Date();
        }

        const payment = await FarmerPayment.findOneAndUpdate(
            { paymentId },
            updateData,
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status'
        });
    }
};

// Get farmer payment statistics
export const getFarmerPaymentStatistics = async (req, res) => {
    try {
        const stats = await FarmerPayment.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    pendingPayments: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0]
                        }
                    },
                    paidPayments: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$totalAmount', 0]
                        }
                    },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalAmount', 0]
                        }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalPayments: 0,
            totalAmount: 0,
            pendingPayments: 0,
            paidPayments: 0,
            pendingAmount: 0,
            paidAmount: 0
        };

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment statistics'
        });
    }
};