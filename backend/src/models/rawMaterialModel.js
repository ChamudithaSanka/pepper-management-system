import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
    rawMaterialId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ["Black Pepper", "Green Pepper"]
    },
    quantityKg: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    reorderLevelKg: {
        type: Number,
        required: true,
        min: 0
    },
    lowStockStatus: {
        type: String,
        enum: ["InStock", "LowStock"],
        default: "InStock"
    }
}, {
    timestamps: true
});

// Pre-save middleware to auto-update lowStockStatus
rawMaterialSchema.pre('save', function(next) {
    this.lowStockStatus = this.quantityKg <= this.reorderLevelKg ? "LowStock" : "InStock";
    next();
});

// Add this to handle findOneAndUpdate operations
rawMaterialSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.quantityKg !== undefined) {
        const doc = await this.model.findOne(this.getQuery());
        const newStatus = update.quantityKg <= doc.reorderLevelKg ? "LowStock" : "InStock";
        this.set('lowStockStatus', newStatus);
    }
    next();
});

export default mongoose.model('RawMaterial', rawMaterialSchema);