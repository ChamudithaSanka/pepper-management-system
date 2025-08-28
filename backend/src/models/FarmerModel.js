import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact_info: {
        phone: {
            type: String,
            required: true
        }
    },
    location: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    remarks: String
}, {
    timestamps: true
});

export default mongoose.model('Farmer', farmerSchema);