import mongoose from 'mongoose';

// Simple Customer Payment Method Schema
const customerPaymentMethodSchema = new mongoose.Schema({
    paymentMethodId: {
        type: String,
        unique: true
    },
    customerId: {
        type: String,
        required: true,
        ref: 'Customer'
    },
    cardholderName: {
        type: String,
        required: true,
        trim: true
    },
    cardType: {
        type: String,
        enum: ['Visa', 'MasterCard', 'American Express', 'Discover'],
        required: true
    },
    cardNumber: {
        type: String,
        required: true,
        trim: true
    },
    lastFourDigits: {
        type: String,
        required: true,
        length: 4
    },
    expiryMonth: {
        type: String,
        required: true
    },
    expiryYear: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate payment method ID before saving
customerPaymentMethodSchema.pre('save', async function(next) {
    if (!this.paymentMethodId) {
        try {
            const count = await this.constructor.countDocuments();
            this.paymentMethodId = `PM${String(count + 1).padStart(6, '0')}`;
        } catch (err) {
            return next(err);
        }
    }

    // Extract last 4 digits from card number
    if (this.cardNumber && !this.lastFourDigits) {
        this.lastFourDigits = this.cardNumber.slice(-4);
    }

    // If this is set as default, ensure no other payment method for this customer is default
    if (this.isDefault) {
        await this.constructor.updateMany(
            { customerId: this.customerId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }

    next();
});

const CustomerPaymentMethod = mongoose.model('CustomerPaymentMethod', customerPaymentMethodSchema);

export default CustomerPaymentMethod;
