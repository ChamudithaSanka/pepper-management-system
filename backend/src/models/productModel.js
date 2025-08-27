import mongoose from 'mongoose';

const rawMaterialRecipeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Black Pepper", "Green Pepper"],
        required: true
    },
    qtyPerUnitKg: {
        type: Number,
        required: true
    },
    wastePercentage: {
        type: Number,
        required: true
    }
});

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        default: 0
    },
    safetyStock: {
        type: Number,
        default: 0
    },
    reorderLevel: {
        type: Number,
        required: true
    },
    stockStatus: {
        type: String,
        enum: ["InStock", "LowStock"],
        default: "InStock"
    },
    rawMaterialRecipe: [rawMaterialRecipeSchema],
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["Active", "Expired"],
        default: "Active"
    }
}, {
    timestamps: true
});

// Create index on productId for faster queries
productSchema.index({ productId: 1 });

// Add a pre-save hook to update stockStatus
productSchema.pre('save', function(next) {
    if (this.currentStock <= this.reorderLevel) {
        this.stockStatus = "LowStock";
    } else {
        this.stockStatus = "InStock";
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;