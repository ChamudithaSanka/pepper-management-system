import express from 'express';
import {
    getAllFarmers,
    getFarmerById,
    createFarmer,
    updateFarmer,
    deleteFarmer,
    getFarmerStats
} from '../controllers/farmerController.js';

const router = express.Router();

// Farmer Statistics - must come before /:id route
router.get('/stats', getFarmerStats);

// Get all farmers (with search and filter)
router.get('/', getAllFarmers);

// Get single farmer by ID
router.get('/:id', getFarmerById);

// Create new farmer
router.post('/', createFarmer);

// Update farmer
router.put('/:id', updateFarmer);

// Delete farmer
router.delete('/:id', deleteFarmer);

export default router;
