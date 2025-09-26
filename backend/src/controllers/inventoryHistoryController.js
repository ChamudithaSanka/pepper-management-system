import InventoryHistory from '../models/inventoryHistoryModel.js';

// Add inventory history
export const addInventoryHistory = async (oldProduct, newProduct, forcedChangeType = null) => {
    try {
        const previousStock = oldProduct?.currentStock ?? 0;
        const newStock = newProduct.currentStock;

        let changeType = forcedChangeType || "Updated"; // use forcedChangeType if provided
        let changeAmount = Math.abs(newStock - previousStock);

        if (!forcedChangeType) { // only calculate if not forced
            if (newStock > previousStock) {
                changeType = "Added";
            } else if (newStock < previousStock) {
                changeType = "Removed"; 
                // "Sold" can be used in future when selling
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
            reorderLevel: newProduct.reorderLevel,
            stockStatus: newProduct.stockStatus,
            status: "Active" // Always set to Active since we removed expiry tracking
        });
    } catch (error) {
        console.error('Error adding inventory history:', error);
        throw error;
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