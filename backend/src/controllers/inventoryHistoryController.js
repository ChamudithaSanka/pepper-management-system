import InventoryHistory from '../models/inventoryHistoryModel.js';

// Get all inventory history records
export const getAllInventoryHistory = async (req, res) => {
    try {
        const history = await InventoryHistory.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get sold products history
export const getSoldProductsHistory = async (req, res) => {
    try {
        const soldHistory = await InventoryHistory.find({ 
            changeType: 'Sold' 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: soldHistory.length,
            data: soldHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add inventory history
export const addInventoryHistory = async (oldProduct, newProduct, forcedChangeType = null) => {
    try {
        const previousStock = oldProduct?.currentStock ?? 0;
        const newStock = newProduct.currentStock;

        let changeType = forcedChangeType || "Updated"; // use forcedChangeType if provided
        let changeAmount = Math.abs(newStock - previousStock);

        if (!forcedChangeType) { // only calculate if not forced
            if (!oldProduct) {
                // Case 1: No old product means this is a brand new product being created
                changeType = "Added";
            } else {
                // Case 2: Product already exists and is being updated
                // This covers ALL types of updates to existing products including:
                // - Price changes
                // - Description changes
                // - Category changes
                // - Stock level increases (restocking)
                // - Stock level decreases (manual adjustment)
                // - Any other attribute changes
                changeType = "Updated";
                
                // Note: "Sold" will be explicitly set via recordProductSold function
                // Note: "Removed" will be explicitly set when deleting a product
            }
        }

        await InventoryHistory.create({
            inventoryId: newProduct._id,
            productId: newProduct.productId,
            productName: newProduct.productName,
            changeType,
            changeAmount,
            previousStock,
            newStock,
            safetyStock: newProduct.safetyStock,
            reorderLevel: newProduct.reorderLevel
        });
    } catch (error) {
        console.error('Error adding inventory history:', error);
        throw error;
    }
};



// Record product sold in inventory history
export const recordProductSold = async (product, quantitySold) => {
    try {
        const previousStock = product.currentStock;
        const newStock = previousStock - quantitySold;
        
        await InventoryHistory.create({
            inventoryId: product._id,
            productId: product.productId,
            productName: product.productName,
            changeType: 'Sold',
            changeAmount: quantitySold,
            previousStock,
            newStock,
            safetyStock: product.safetyStock,
            reorderLevel: product.reorderLevel
        });
        
        return {
            success: true,
            message: 'Sold product recorded in inventory history'
        };
    } catch (error) {
        console.error('Error recording sold product:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Get recent inventory history (last 2 months)
export const getRecentInventoryHistory = async (req, res) => {
    try {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        const history = await InventoryHistory.find({
            createdAt: { $gte: twoMonthsAgo }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};