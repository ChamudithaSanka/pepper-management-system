import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'Drying Operator',
            'Cleaning Operator', 
            'Grinding Operator',
            'Packaging Operator',
            'Machine Operator',
            'Helper',
            'Raw Material Inspector'
        ]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        // match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    nic: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        // match: [/^\d{9}[vVxX]|\d{12}$/, 'Please enter a valid NIC']
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        // match: [/^(\+94|0)[1-9]\d{8}$/, 'Please enter a valid Sri Lankan phone number']
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Index for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ status: 1 });

export default mongoose.model('Employee', employeeSchema);