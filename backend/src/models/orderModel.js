import mongoose from 'mongoose';

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    customerId: {
        type: String,  // Changed from ObjectId to String to match our custom ID system
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Sri Lanka' },
        fullAddress: String
    },
    deliveryLocation: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `ORD${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate subtotals for items
    this.items.forEach(item => {
        item.subtotal = item.quantity * item.price;
    });

    // Calculate total amount
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);

    // Set estimated delivery date (3 days from order)
    if (!this.estimatedDeliveryDate) {
        this.estimatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    next();
});

// Instance methods
orderSchema.methods.updateStatus = function(newStatus) {
    this.orderStatus = newStatus;
    if (newStatus === 'Delivered') {
        this.actualDeliveryDate = new Date();
    }
    return this.save();
};

orderSchema.methods.markAsDelivered = function() {
    this.orderStatus = 'Delivered';
    this.actualDeliveryDate = new Date();
    return this.save();
};

// Static methods
orderSchema.statics.getCustomerOrders = function(customerId) {
    return this.find({ customerId })
        .populate('items.productId')
        .sort({ createdAt: -1 });
};

orderSchema.statics.getOrdersByStatus = function(status) {
    return this.find({ orderStatus: status })
        .populate('customerId')
        .populate('items.productId')
        .sort({ createdAt: -1 });
};

const Order = mongoose.model('Order', orderSchema);

export default Order;