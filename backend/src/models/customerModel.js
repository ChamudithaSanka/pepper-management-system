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
        street: {
            type: String,
            // required: true,
            trim: true,
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            // required: true,
            trim: true,
            maxlength: [100, 'City cannot exceed 100 characters']
        },
        zipCode: {
            type: String,
            // required: true,
            trim: true,
            maxlength: [20, 'Zip code cannot exceed 20 characters']
        },
        fullAddress: {
            type: String,
            // required: true,
            trim: true,
            maxlength: [500, 'Full address cannot exceed 500 characters']
        },
        latitude: {
            type: Number,
            // required: true,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        longitude: {
            type: Number,
            // required: true,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        }
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
