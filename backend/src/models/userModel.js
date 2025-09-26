import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: {
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
    role: {
        type: String,
        enum: ['Admin', 'Inventory Manager', 'Finance Manager', 'Delivery Staff'],
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.userId) {
        const lastUser = await this.constructor.findOne({}, {}, { sort: { userId: -1 } });
        this.userId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1;
    }
    next();
});

export default mongoose.model('User', userSchema);
