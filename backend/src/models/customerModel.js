import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    customerId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    deliveryAddress: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastOrderDate: {
        type: Date,
        default: null
    },
    totalOrders: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Auto-increment customerId before saving
customerSchema.pre('save', async function(next) {
    if (!this.customerId) {
        const lastCustomer = await this.constructor.findOne({}, {}, { sort: { customerId: -1 } });
        this.customerId = lastCustomer ? lastCustomer.customerId + 1 : 1;
    }
    next();
});

// Create index on customerId for faster queries
customerSchema.index({ customerId: 1 });

export default mongoose.model('Customer', customerSchema);
