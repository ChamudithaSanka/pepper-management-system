import express from 'express';
import { 
    createFarmer, 
    getFarmers,
    getFarmerById,
    updateFarmer,
    deleteFarmer 
} from '../controllers/farmerController.js';

const router = express.Router();

router.route('/')
    .post(createFarmer)
    .get(getFarmers);

router.route('/:id')
    .get(getFarmerById)
    .put(updateFarmer)
    .delete(deleteFarmer);

export default router;