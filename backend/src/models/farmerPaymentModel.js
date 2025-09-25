import mongoose from 'mongoose';

// Farmer Payment Schema
const farmerPaymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    rmOrderId: {
        type: String,
        ref: 'RawMaterialOrder',
        required: true
    },
    pepperType: {
        type: String,
        enum: ["Black Pepper", "Green Pepper"],
        required: true
    },
    deliveredQuantityKg: {
        type: Number,
        required: true,
        min: 0
    },
    pricePerKg: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    paidDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate paymentId automatically
farmerPaymentSchema.pre('save', async function (next) {
    if (!this.paymentId) {
        try {
            const count = await this.constructor.countDocuments();
            this.paymentId = `FP-${(count + 1).toString().padStart(4, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

// Pre-save middleware to calculate total amount
farmerPaymentSchema.pre('save', function(next) {
    this.totalAmount = this.deliveredQuantityKg * this.pricePerKg;
    next();
});

// Add populate middleware to automatically populate farmer details
farmerPaymentSchema.pre('find', function() {
    this.populate('farmerId', 'name nic phone email');
});

farmerPaymentSchema.pre('findOne', function() {
    this.populate('farmerId', 'name nic phone email');
});

export default mongoose.model('FarmerPayment', farmerPaymentSchema);