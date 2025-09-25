import mongoose from 'mongoose';

const deliveryDriverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Driver name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    nic: {
        type: String,
        required: [true, 'NIC number is required'],
        unique: true,
        trim: true,
        match: [/^(\d{8,9}[vVxX]|\d{12})$/, 'Please enter a valid NIC number (8-9 digits + V/X or 12 digits)']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{8,15}$/, 'Please enter a valid phone number (8-15 digits)']
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        trim: true,
        unique: true
    },
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle number is required'],
        trim: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Available', 'Busy', 'Assigned'],
        default: 'Available'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    completedDeliveries: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate driverId
deliveryDriverSchema.pre('save', async function(next) {
    if (!this.driverId) {
        try {
            const count = await this.constructor.countDocuments();
            this.driverId = `DRV${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Create indexes for better search performance
deliveryDriverSchema.index({ name: 'text' });
deliveryDriverSchema.index({ status: 1 });
deliveryDriverSchema.index({ driverId: 1 });
deliveryDriverSchema.index({ isActive: 1 });

// Updates driver status (Available, Busy, Assigned)
deliveryDriverSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

// Increments total delivery count when driver takes a new delivery
deliveryDriverSchema.methods.incrementDeliveries = function() {
    this.totalDeliveries += 1;
    return this.save();
};

// Increments completed delivery count when delivery is finished
deliveryDriverSchema.methods.completeDelivery = function() {
    this.completedDeliveries += 1;
    return this.save();
};

export default mongoose.model('DeliveryDriver', deliveryDriverSchema);
