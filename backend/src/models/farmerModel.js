import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
    farmerId: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required:true,
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
        required: true,
        trim: true,
        match: [/^[0-9]{8,15}$/, 'Please enter a valid phone number (8-15 digits)']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please enter a valid email']
        // Note: do not set unique immediately to avoid migration issues
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    farm_location: {
        latitude: {
            type: Number,
            required: true,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        longitude: {
            type: Number,
            required: true,
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
    pepper_capacitypermonth: {
        green: {
            type: Number,
            required: [true, 'Green pepper capacity is required'],
            min: [0, 'Capacity cannot be negative'],
            max: [10000, 'Capacity cannot exceed 10,000 kg']
        },
        black: {
            type: Number,
            required: [true, 'Black pepper capacity is required'],
            min: [0, 'Capacity cannot be negative'],
            max: [10000, 'Capacity cannot exceed 10,000 kg']
        }
    },
    price_per_unit: {
        green: {
            type: Number,
            required: [true, 'Green pepper price per kg is required'],
            min: [0, 'Price cannot be negative']
        },
        black: {
            type: Number,
            required: [true, 'Black pepper price per kg is required'],
            min: [0, 'Price cannot be negative']
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    registrationdate: {
        type: Date,
        default: Date.now
    },
    lastsupplydate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Create indexes for better search performance
farmerSchema.index({ name: 'text', farm_location: 'text' });
farmerSchema.index({ status: 1 });
farmerSchema.index({ farmerId: 1 });
farmerSchema.index({ nic: 1 });

// Pre-save middleware to generate incremental farmerId
farmerSchema.pre('save', async function(next) {
    if (!this.farmerId) {
        try {
            // Find the highest farmerId and increment by 1
            const lastFarmer = await this.constructor.findOne({}, {}, { sort: { farmerId: -1 } });
            this.farmerId = lastFarmer ? lastFarmer.farmerId + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

export default mongoose.model('Farmer', farmerSchema);
