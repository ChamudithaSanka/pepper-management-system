import CustomerPayment from '../models/customerPaymentModel.js';
import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';

// PROCESS PAYMENT
export const processPayment = async (req, res) => {
    try {
        console.log('💳 processPayment called');
        const { orderId } = req.params;
        const {
            paymentMethod,
            billingAddress,
            cardDetails,
            customerId
        } = req.body;
        
        console.log('💳 orderId:', orderId);
        console.log('💳 customerId from body:', customerId);
        console.log('💳 session customer:', req.session.customer);
        console.log('💳 paymentMethod:', paymentMethod);

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            console.log('💳 Authentication failed');
            return res.status(401).json({
                success: false,
                message: 'Please login to process payment'
            });
        }

        // Find the order
        const order = await Order.findOne({ orderId });
        console.log('💳 Order found:', order);
        if (!order) {
            console.log('💳 Order not found');
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to the customer
        console.log('💳 order.customerId:', order.customerId, 'type:', typeof order.customerId);
        console.log('💳 customerId from request:', customerId, 'type:', typeof customerId);
        
        if (order.customerId !== String(customerId)) {
            console.log('💳 Unauthorized access to order');
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to order'
            });
        }

        // Check if payment already exists for this order
        const existingPayment = await CustomerPayment.findOne({ orderId });
        if (existingPayment && existingPayment.paymentStatus === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed for this order'
            });
        }

        // Create payment record
        const paymentData = {
            orderId,
            customerId,
            amount: order.totalAmount,
            paymentMethod,
            billingAddress
        };

        // Add card details if payment method is credit/debit card
        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            if (!cardDetails) {
                return res.status(400).json({
                    success: false,
                    message: 'Card details required for card payments'
                });
            }

            paymentData.cardDetails = {
                cardholderName: cardDetails.cardholderName,
                cardType: cardDetails.cardType || 'Visa', // Default to Visa if empty
                lastFourDigits: cardDetails.cardNumber?.slice(-4) || '****',
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear
            };
        }

        // Create or update payment
        let payment;
        if (existingPayment) {
            // Update existing payment
            Object.assign(existingPayment, paymentData);
            payment = existingPayment;
        } else {
            // Create new payment
            payment = new CustomerPayment(paymentData);
        }

        // Simulate payment processing
        try {
            // In a real application, you would integrate with a payment gateway here
            // For demo purposes, we'll simulate different outcomes

            if (paymentMethod === 'Cash on Delivery') {
                payment.paymentStatus = 'Pending';
                payment.notes = 'Payment will be collected on delivery';
            } else {
                // Simulate payment gateway response
                const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

                if (isPaymentSuccessful) {
                    payment.paymentStatus = 'Completed';
                    payment.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                    payment.paymentDate = new Date();

                    // Update order payment status
                    order.paymentStatus = 'Completed';
                    order.orderStatus = 'Confirmed';
                    await order.save();
                } else {
                    payment.paymentStatus = 'Failed';
                    payment.failureReason = 'Payment declined by bank';
                }
            }

            await payment.save();

            res.status(200).json({
                success: true,
                message: payment.paymentStatus === 'Completed' 
                    ? 'Payment processed successfully' 
                    : payment.paymentStatus === 'Failed'
                    ? 'Payment failed'
                    : 'Payment initiated successfully',
                data: {
                    paymentId: payment.paymentId,
                    orderId: payment.orderId,
                    amount: payment.amount,
                    paymentStatus: payment.paymentStatus,
                    transactionId: payment.transactionId,
                    paymentMethod: payment.paymentMethod
                }
            });

        } catch (paymentError) {
            // Payment processing failed
            payment.paymentStatus = 'Failed';
            payment.failureReason = paymentError.message;
            await payment.save();

            res.status(400).json({
                success: false,
                message: 'Payment processing failed',
                error: paymentError.message
            });
        }

    } catch (error) {
        console.error('💳 Error in processPayment:', error);
        console.error('💳 Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};

// GET PAYMENT BY ID
export const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await CustomerPayment.findOne({ paymentId })
            .populate('customerId', 'name email');

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
        res.status(500).json({
            success: false,
            message: 'Error fetching payment',
            error: error.message
        });
    }
};

// GET CUSTOMER PAYMENTS
export const getCustomerPayments = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to view payments'
            });
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const payments = await CustomerPayment.find({ customerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPayments = await CustomerPayment.countDocuments({ customerId });

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPayments / limit),
                    totalPayments,
                    hasNextPage: page < Math.ceil(totalPayments / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer payments',
            error: error.message
        });
    }
};

// UPDATE PAYMENT STATUS (Admin only)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { paymentStatus, transactionId, failureReason } = req.body;

        const payment = await CustomerPayment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Update payment status
        payment.paymentStatus = paymentStatus;
        
        if (paymentStatus === 'Completed') {
            payment.transactionId = transactionId || payment.transactionId;
            payment.paymentDate = new Date();
            
            // Update corresponding order
            await Order.findOneAndUpdate(
                { orderId: payment.orderId },
                { paymentStatus: 'Completed', orderStatus: 'Confirmed' }
            );
        } else if (paymentStatus === 'Failed') {
            payment.failureReason = failureReason;
        }

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payment status',
            error: error.message
        });
    }
};

// GET ALL PAYMENTS (Admin only)
export const getAllPayments = async (req, res) => {
    try {
        const { status, method, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};
        if (status) query.paymentStatus = status;
        if (method) query.paymentMethod = method;

        // Calculate pagination
        const skip = (page - 1) * limit;

        const payments = await CustomerPayment.find(query)
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPayments = await CustomerPayment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPayments / limit),
                    totalPayments,
                    hasNextPage: page < Math.ceil(totalPayments / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

// PROCESS REFUND (Admin only)
export const processRefund = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { refundAmount, reason } = req.body;

        const payment = await CustomerPayment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.paymentStatus !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only refund completed payments'
            });
        }

        const refundAmountToProcess = refundAmount || payment.amount;
        
        if (refundAmountToProcess > payment.amount) {
            return res.status(400).json({
                success: false,
                message: 'Refund amount cannot exceed payment amount'
            });
        }

        // Process refund
        await payment.processRefund(refundAmountToProcess, reason);

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// GET PAYMENT STATISTICS (Admin only)
export const getPaymentStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Get total revenue
        const revenueData = await CustomerPayment.getTotalRevenue(startDate, endDate);
        const { totalRevenue = 0, totalTransactions = 0, averageTransaction = 0 } = 
            revenueData.length > 0 ? revenueData[0] : {};

        // Get payment method breakdown
        const paymentMethodStats = await CustomerPayment.aggregate([
            { $match: { paymentStatus: 'Completed' } },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get monthly revenue for current year
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await CustomerPayment.getRevenueByMonth(currentYear);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalTransactions,
                averageTransaction,
                paymentMethodStats,
                monthlyRevenue
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment statistics',
            error: error.message
        });
    }
};
