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
        trim: true
    },
    basicSalary: {
        type: Number,
        required: true,
        min: 0
    },
    // epfNo removed; use employeeId for EPF purposes
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