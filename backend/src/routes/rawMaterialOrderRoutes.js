import express from 'express';
import {
    createOrder,
    listOrders,
    markDelivered,
    deleteOrder,
    getEligibleFarmers
} from '../controllers/rawMaterialOrderController.js';

const router = express.Router();

router.get('/eligible-farmers', getEligibleFarmers);

router.route('/')
    .post(createOrder)
    .get(listOrders);

router.patch('/:rmOrderId/deliver', markDelivered);
router.delete('/:rmOrderId', deleteOrder);


export default router;