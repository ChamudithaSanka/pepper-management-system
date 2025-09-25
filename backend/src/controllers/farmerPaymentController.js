import FarmerPayment from '../models/farmerPaymentModel.js';
import RawMaterialOrder from '../models/rawMaterialOrderModel.js';
import Farmer from '../models/farmerModel.js';
import { sendMail } from '../utils/mailer.js';

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

        // Attempt to send email when marked as paid
        if (paymentStatus === 'Paid') {
            try {
                // Reload with populated farmer (hooks cover find, not findOneAndUpdate)
                const populated = await FarmerPayment.findOne({ paymentId }).populate('farmerId', 'name email');
                const farmerEmail = populated?.farmerId?.email;
                if (farmerEmail) {
                    const amount = (populated.totalAmount || (populated.deliveredQuantityKg * populated.pricePerKg)).toFixed(2);
                    const subject = `Payment Confirmed: ${populated.paymentId}`;
                    const html = `
                        <div>
                            <p>Dear ${populated.farmerId.name},</p>
                            <p>Your payment has been marked as <strong>Paid</strong>.</p>
                            <ul>
                                <li><strong>Payment ID:</strong> ${populated.paymentId}</li>
                                <li><strong>Order ID:</strong> ${populated.rmOrderId}</li>
                                <li><strong>Pepper Type:</strong> ${populated.pepperType}</li>
                                <li><strong>Quantity (kg):</strong> ${populated.deliveredQuantityKg}</li>
                                <li><strong>Price per kg (LKR):</strong> ${populated.pricePerKg}</li>
                                <li><strong>Total Amount (LKR):</strong> ${amount}</li>
                                <li><strong>Paid Date:</strong> ${new Date(populated.paidDate || new Date()).toLocaleString()}</li>
                            </ul>
                            <p>Thank you.</p>
                        </div>
                    `;
                    const text = `Payment ${populated.paymentId} marked as Paid. Order ${populated.rmOrderId}. Quantity ${populated.deliveredQuantityKg}kg at LKR ${populated.pricePerKg}/kg. Total LKR ${amount}.`;
                    await sendMail({ to: farmerEmail, subject, html, text });
                }
            } catch (mailErr) {
                // Log and continue; do not fail the response
                console.error('Email send failed:', mailErr.message);
            }
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