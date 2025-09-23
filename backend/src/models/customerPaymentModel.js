import mongoose from 'mongoose';

// Customer Payment Schema
const customerPaymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true
    },
    orderId: {
        type: String,
        required: true,
        ref: 'Order'
    },
    customerId: {
        type: Number,  // Changed from String to Number to match Customer model
        required: true,
        ref: 'Customer'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    transactionId: {
        type: String,
        sparse: true // Allows null values but ensures uniqueness when not null
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Sri Lanka' },
        fullAddress: String
    },
    cardDetails: {
        // Note: In production, never store actual card numbers
        // Use tokenization or encryption
        cardholderName: String,
        cardType: {
            type: String,
            enum: ['Visa', 'MasterCard', 'American Express', 'Discover']
        },
        lastFourDigits: String, // Only store last 4 digits
        expiryMonth: {
            type: Number,
            min: 1,
            max: 12
        },
        expiryYear: {
            type: Number,
            min: new Date().getFullYear()
        }
    },
    paymentDate: {
        type: Date
    },
    failureReason: {
        type: String
    },
    refundAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    refundDate: {
        type: Date
    },
    processingFee: {
        type: Number,
        min: 0,
        default: 0
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Generate payment ID before saving
customerPaymentSchema.pre('save', async function(next) {
    if (!this.paymentId) {
        const count = await mongoose.model('CustomerPayment').countDocuments();
        this.paymentId = `PAY${String(count + 1).padStart(6, '0')}`;
    }

    // Set payment date when status changes to completed
    if (this.paymentStatus === 'Completed' && !this.paymentDate) {
        this.paymentDate = new Date();
    }

    next();
});

// Instance methods
customerPaymentSchema.methods.markAsCompleted = function(transactionId) {
    this.paymentStatus = 'Completed';
    this.paymentDate = new Date();
    if (transactionId) {
        this.transactionId = transactionId;
    }
    return this.save();
};

customerPaymentSchema.methods.markAsFailed = function(reason) {
    this.paymentStatus = 'Failed';
    this.failureReason = reason;
    return this.save();
};

customerPaymentSchema.methods.processRefund = function(refundAmount, reason) {
    this.paymentStatus = 'Refunded';
    this.refundAmount = refundAmount || this.amount;
    this.refundDate = new Date();
    this.notes = reason || this.notes;
    return this.save();
};

// Static methods
customerPaymentSchema.statics.getCustomerPayments = function(customerId) {
    return this.find({ customerId })
        .sort({ createdAt: -1 });
};

customerPaymentSchema.statics.getPaymentsByStatus = function(status) {
    return this.find({ paymentStatus: status })
        .populate('customerId')
        .sort({ createdAt: -1 });
};

customerPaymentSchema.statics.getTotalRevenue = function(startDate, endDate) {
    const matchStage = {
        paymentStatus: 'Completed'
    };

    if (startDate || endDate) {
        matchStage.paymentDate = {};
        if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
        if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                averageTransaction: { $avg: '$amount' }
            }
        }
    ]);
};

customerPaymentSchema.statics.getRevenueByMonth = function(year) {
    return this.aggregate([
        {
            $match: {
                paymentStatus: 'Completed',
                paymentDate: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$paymentDate' },
                totalRevenue: { $sum: '$amount' },
                transactionCount: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

// Indexes for better performance
customerPaymentSchema.index({ customerId: 1, createdAt: -1 });
customerPaymentSchema.index({ orderId: 1 });
customerPaymentSchema.index({ paymentStatus: 1 });
customerPaymentSchema.index({ paymentDate: 1 });

const CustomerPayment = mongoose.model('CustomerPayment', customerPaymentSchema);

export default CustomerPayment;
