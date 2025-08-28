import express from 'express';
import {
    getAllRawMaterials,
    getRawMaterial,
    createRawMaterial,
    updateRawMaterial,
    getLowStockRawMaterials
} from '../controllers/rawMaterialController.js';

const router = express.Router();

router.route('/')
    .get(getAllRawMaterials)
    .post(createRawMaterial);

router.get('/low-stock', getLowStockRawMaterials);

router.route('/:id')
    .get(getRawMaterial)
    .put(updateRawMaterial);

export default router;