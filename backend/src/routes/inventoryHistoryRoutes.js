import express from 'express';
import { getRecentInventoryHistory } from '../controllers/inventoryHistoryController.js';

const router = express.Router();

router.get('/recent', getRecentInventoryHistory);

export default router;