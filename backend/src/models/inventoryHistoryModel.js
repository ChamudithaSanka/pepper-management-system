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
    stockStatus: { 
        type: String, 
        enum: ['InStock', 'LowStock'],   
        required: true 
    },
    expiryDate: { 
        type: Date 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Expiring Soon'], 
        required: true 
    }
}, {
    timestamps: true
});

export default mongoose.model('InventoryHistory', inventoryHistorySchema);
