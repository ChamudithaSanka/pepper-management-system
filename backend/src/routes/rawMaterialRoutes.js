import express from 'express';
import {
    getAllRawMaterials,
    getRawMaterial,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    getLowStockRawMaterials
} from '../controllers/rawMaterialController.js';

const router = express.Router();

router.route('/')
    .get(getAllRawMaterials)
    .post(createRawMaterial);

router.get('/low-stock', getLowStockRawMaterials);

router.route('/:id')
    .get(getRawMaterial)
    .put(updateRawMaterial)
    .delete(deleteRawMaterial);

export default router;