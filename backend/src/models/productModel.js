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
    size: {
        type: String,
        required: false // Optional for backward compatibility
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
        enum: ["InStock", "LowStock"], // Removed "OutOfStock"
        default: "InStock"
    },
    rawMaterialRecipe: [rawMaterialRecipeSchema],
    imageUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"], // Allow both Active and Inactive
        default: "Active"
    }
}, {
    timestamps: true
});

// Create index on productId for faster queries
productSchema.index({ productId: 1 });

// ------------------ Pre-save hooks ------------------

// Generate productId before validation so required check passes
productSchema.pre('validate', async function(next) {
    if (!this.productId && this.isNew) {
        try {
            const count = await this.constructor.countDocuments({});
            this.productId = `PID-${String(count + 1).padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Update stockStatus before save
productSchema.pre('save', function(next) {
    // Stock status check
    if (this.currentStock <= this.reorderLevel) {
        this.stockStatus = "LowStock";
    } else {
        this.stockStatus = "InStock";
    }

    next();
});

// ------------------ Virtuals ------------------

// Only availableStock (no “Not Available” status)
productSchema.virtual('availableStock').get(function () {
  const avail = (this.currentStock ?? 0) - (this.safetyStock ?? 0);
  return Math.max(avail, 0); // Always show 0 if negative
});

productSchema.set('toJSON', { virtuals: false });
productSchema.set('toObject', { virtuals: false });

const Product = mongoose.model('Product', productSchema);

export default Product;
