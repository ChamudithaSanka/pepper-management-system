import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema({
    inventoryId: { 
        type: String, 
        required: true 
    },
    productId: { 
        type: String, 
        required: true 
    },
    productName: { 
        type: String, 
        required: true 
    },
    changeType: { 
        type: String, 
        enum: ['Added', 'Removed', 'Sold', 'Updated'], 
        required: true 
    },
    changeAmount: { 
        type: Number, 
        required: true 
    },
    previousStock: { 
        type: Number, 
        required: true 
    },
    newStock: { 
        type: Number, 
        required: true 
    },
    safetyStock: { 
        type: Number, 
        required: true 
    },
    reorderLevel: { 
        type: Number, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('InventoryHistory', inventoryHistorySchema);
