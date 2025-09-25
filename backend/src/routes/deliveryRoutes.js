import express from 'express';
import {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    updateDriverStatus,
    getDriverStats
} from '../controllers/deliveryDriverController.js';

import {
    getAllDeliveryTasks,
    getDeliveryTaskById,
    createDeliveryTask,
    assignDriverToTask,
    updateTaskStatus,
    getTasksByDriver,
    getTasksByStatus,
    getDeliveryStats
} from '../controllers/deliveryTaskController.js';

import {
    getAllOrdersForDelivery,
    assignDriverToOrder,
    getDeliveryDashboardStats
} from '../controllers/deliveryController.js';

const router = express.Router();

// Driver routes
router.get('/drivers', getAllDrivers);
router.get('/drivers/stats', getDriverStats);
router.get('/drivers/:id', getDriverById);
router.post('/drivers', createDriver);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', deleteDriver);
router.patch('/drivers/:id/status', updateDriverStatus);

// Delivery task routes
router.get('/tasks', getAllDeliveryTasks);
router.get('/tasks/stats', getDeliveryStats);
router.get('/tasks/:id', getDeliveryTaskById);
router.post('/tasks', createDeliveryTask);
router.patch('/tasks/:id/assign', assignDriverToTask);
router.patch('/tasks/:id/status', updateTaskStatus);
router.get('/tasks/driver/:driverId', getTasksByDriver);
router.get('/tasks/status/:status', getTasksByStatus);

// Delivery management routes
router.get('/orders', getAllOrdersForDelivery);
router.post('/orders/:orderId/assign', assignDriverToOrder);
router.get('/dashboard/stats', getDeliveryDashboardStats);

export default router;
