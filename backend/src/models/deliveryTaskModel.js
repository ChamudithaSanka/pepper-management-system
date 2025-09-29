import mongoose from 'mongoose';

const deliveryTaskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        unique: true
    },
    orderId: {
        type: String,
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryDriver',
        required: true
    },
    driverName: {
        type: String,
        required: true
    },
    pickupLocation: {
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
        },
        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters']
        }
    },
    deliveryLocation: {
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
        },
        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters']
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Delivered'],
        default: 'Pending'
    },
    assignedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create indexes for better search performance
deliveryTaskSchema.index({ status: 1 });
deliveryTaskSchema.index({ driverId: 1 });

// Pre-save middleware to generate taskId
deliveryTaskSchema.pre('save', async function(next) {
    if (!this.taskId) {
        try {
            const count = await this.constructor.countDocuments();
            this.taskId = `TASK${String(count + 1).padStart(6, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Assigns a driver to this delivery task and updates status to Assigned
deliveryTaskSchema.methods.assignDriver = function(driverId, driverName) {
    this.driverId = driverId;
    this.driverName = driverName;
    this.status = 'Assigned';
    this.assignedAt = new Date();
    return this.save();
};

// Marks delivery as completed and sets delivery timestamp
deliveryTaskSchema.methods.completeDelivery = function() {
    this.status = 'Delivered';
    this.deliveredAt = new Date();
    return this.save();
};

// Gets all delivery tasks for a specific driver
deliveryTaskSchema.statics.getTasksByDriver = function(driverId) {
    return this.find({ driverId })
        .populate('driverId', 'name phone vehicleNumber')
        .sort({ createdAt: -1 });
};

// Gets all delivery tasks with a specific status
deliveryTaskSchema.statics.getTasksByStatus = function(status) {
    return this.find({ status })
        .populate('driverId', 'name phone vehicleNumber')
        .sort({ createdAt: -1 });
};

export default mongoose.model('DeliveryTask', deliveryTaskSchema);
