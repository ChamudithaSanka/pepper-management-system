import mongoose from 'mongoose';

const otherExpenseSchema = new mongoose.Schema({
    expenseId: {
        type: String,
        unique: true
    },
    expenseType: {
        type: String,
        required: [true, 'Expense type is required'],
        enum: ['Transport', 'Electricity', 'Maintenance', 'Packaging', 'Miscellaneous'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Expense description is required'],
        trim: true,
        maxlength: [150, 'Description cannot exceed 150 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Expense amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    expenseDate: {
        type: Date,
        required: [true, 'Expense date is required'],
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Expense date cannot be in the future'
        }
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Cash', 'Bank Transfer', 'Card'],
        trim: true
    },
    receiptNumber: {
        type: String,
        trim: true,
        maxlength: [20, 'Receipt number cannot exceed 20 characters'],
        validate: {
            validator: function(receipt) {
                if (!receipt) return true; // Optional field
                return /^[A-Za-z0-9]+$/.test(receipt);
            },
            message: 'Receipt number must contain only alphanumeric characters'
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for better search performance
otherExpenseSchema.index({ expenseType: 1 });
otherExpenseSchema.index({ expenseDate: 1 });
otherExpenseSchema.index({ status: 1 });

// Pre-save middleware to generate expenseId
otherExpenseSchema.pre('save', async function(next) {
    if (!this.expenseId) {
        try {
            const count = await this.constructor.countDocuments();
            this.expenseId = `EXP${String(count + 1).padStart(6, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Static method to get expenses by type
otherExpenseSchema.statics.getExpensesByType = function(type) {
    return this.find({ expenseType: type, status: 'Active' });
};

// Static method to get expenses by date range
otherExpenseSchema.statics.getExpensesByDateRange = function(startDate, endDate) {
    return this.find({
        expenseDate: {
            $gte: startDate,
            $lte: endDate
        },
        status: 'Active'
    });
};

// Static method to get total expenses amount
otherExpenseSchema.statics.getTotalAmount = function() {
    return this.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
};

// Static method to get expenses by payment method
otherExpenseSchema.statics.getExpensesByPaymentMethod = function(method) {
    return this.find({ paymentMethod: method, status: 'Active' });
};

// Instance method to get formatted expense data
otherExpenseSchema.methods.getFormattedData = function() {
    return {
        expenseId: this.expenseId,
        expenseType: this.expenseType,
        description: this.description,
        amount: this.amount,
        expenseDate: this.expenseDate,
        paymentMethod: this.paymentMethod,
        receiptNumber: this.receiptNumber,
        status: this.status,
        createdBy: this.createdBy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const OtherExpense = mongoose.model('OtherExpense', otherExpenseSchema);

export default OtherExpense;
