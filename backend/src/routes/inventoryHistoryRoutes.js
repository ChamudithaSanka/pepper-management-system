import express from 'express';
import { 
    getRecentInventoryHistory,
    getAllInventoryHistory,
    getSoldProductsHistory,
    getInventoryHistoryCounts
} from '../controllers/inventoryHistoryController.js';

const router = express.Router();

// Get all inventory history
router.get('/', getAllInventoryHistory);

// Get recent inventory history (last 2 months)
router.get('/recent', getRecentInventoryHistory);

// Get sold products history
router.get('/sold', getSoldProductsHistory);

// Get counts by change type for stat cards
router.get('/counts', getInventoryHistoryCounts);

export default router;