import DeliveryTask from '../models/deliveryTaskModel.js';
import DeliveryDriver from '../models/deliveryDriverModel.js';
import Order from '../models/orderModel.js';
import { SHOP_LOCATION } from '../config/deliveryConfig.js';

// Get all delivery tasks
export const getAllDeliveryTasks = async (req, res) => {
    try {
        const { status, driverId, orderType, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Filter by driver

        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        const tasks = await DeliveryTask.find(query)
            .populate('driverId', 'name phone vehicleNumber vehicleType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalTasks = await DeliveryTask.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTasks / limit),
                    totalTasks,
                    hasNextPage: page < Math.ceil(totalTasks / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery tasks',
            error: error.message
        });
    }
};

// Get single delivery task by ID
export const getDeliveryTaskById = async (req, res) => {
    try {
        const task = await DeliveryTask.findById(req.params.id)
            .populate('driverId', 'name phone vehicleNumber vehicleType');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Delivery task not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery task',
            error: error.message
        });
    }
};

// Create delivery task from order
export const createDeliveryTask = async (req, res) => {
    try {
        const { orderId, driverId } = req.body;

        let orderData = null;
        let deliveryLocation = null;
        let customerInfo = null;

        // Only handle customer orders
        const customerOrder = await Order.findOne({ orderId }).populate('customerId', 'name phone');
        if (!customerOrder) {
            return res.status(404).json({
                success: false,
                message: 'Customer order not found'
            });
        }
        orderData = customerOrder;
        deliveryLocation = {
            latitude: customerOrder.deliveryLocation.latitude,
            longitude: customerOrder.deliveryLocation.longitude,
            address: customerOrder.deliveryAddress.fullAddress
        };
        customerInfo = {
            name: customerOrder.customerId.name,
            phone: customerOrder.customerId.phone
        };

        // Check if task already exists for this order
        const existingTask = await DeliveryTask.findOne({ orderId });
        if (existingTask) {
            return res.status(400).json({
                success: false,
                message: 'Delivery task already exists for this order'
            });
        }
        
        // Create pickup location (shop location)
        const pickupLocation = {
            latitude: SHOP_LOCATION.coordinates.latitude,
            longitude: SHOP_LOCATION.coordinates.longitude,
            address: SHOP_LOCATION.address
        };
        
        // Create delivery task
        const deliveryTask = new DeliveryTask({
            orderId,
            driverId: driverData ? driverData._id : null,
            driverName: driverData ? driverData.name : null,
            pickupLocation,
            deliveryLocation,
            assignedAt: driverData ? new Date() : null
        });
        
        await deliveryTask.save();
        
        // Update driver status if assigned
        if (driverData) {
            await DeliveryDriver.findByIdAndUpdate(
                driverData._id,
                { status: 'Busy' }
            );
        }
        
        res.status(201).json({
            success: true,
            message: 'Delivery task created successfully',
            data: deliveryTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating delivery task',
            error: error.message
        });
    }
};

// Assign driver to task
export const assignDriverToTask = async (req, res) => {
    try {
        const { driverId } = req.body;
        
        const task = await DeliveryTask.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Delivery task not found'
            });
        }
        
        const driver = await DeliveryDriver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        if (driver.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not available'
            });
        }
        
        // Update task
        task.driverId = driver._id;
        task.driverName = driver.name;
        task.status = 'Assigned';
        task.assignedAt = new Date();
        await task.save();
        
        // Update driver status
        await DeliveryDriver.findByIdAndUpdate(
            driver._id,
            { status: 'Busy' }
        );
        
        res.status(200).json({
            success: true,
            message: 'Driver assigned successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning driver',
            error: error.message
        });
    }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
    try {
        const { status, notes, deliveryProof } = req.body;
        
        const validStatuses = ['Pending', 'Assigned', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const task = await DeliveryTask.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Delivery task not found'
            });
        }
        
        // Update task status
        task.status = status;
        if (notes) task.notes = notes;
        if (deliveryProof) task.deliveryProof = deliveryProof;
        
        // Set timestamps based on status
        switch (status) {
            case 'Delivered':
                task.deliveredAt = new Date();
                task.actualDeliveryTime = new Date();
                break;
        }
        
        await task.save();
        
        // Update driver status if task is completed
        if (status === 'Delivered' && task.driverId) {
            await DeliveryDriver.findByIdAndUpdate(
                task.driverId,
                { 
                    status: 'Available',
                    $inc: { completedDeliveries: 1 }
                }
            );
        }
        
        res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating task status',
            error: error.message
        });
    }
};

// Get tasks by driver
export const getTasksByDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { status } = req.query;
        
        let query = { driverId };
        if (status) {
            query.status = status;
        }
        
        const tasks = await DeliveryTask.find(query)
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching driver tasks',
            error: error.message
        });
    }
};

// Get tasks by status
export const getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        const tasks = await DeliveryTask.find({ status })
            .populate('driverId', 'name phone vehicleNumber')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks by status',
            error: error.message
        });
    }
};

// Delete delivery task
export const deleteDeliveryTask = async (req, res) => {
    try {
        const task = await DeliveryTask.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Delivery task not found'
            });
        }
        
        // If task has an assigned driver, make them available again
        if (task.driverId && task.status !== 'Delivered') {
            await DeliveryDriver.findByIdAndUpdate(
                task.driverId,
                { status: 'Available' }
            );
        }
        
        await DeliveryTask.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Delivery task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting delivery task',
            error: error.message
        });
    }
};

// Get delivery statistics
export const getDeliveryStats = async (req, res) => {
    try {
        const totalTasks = await DeliveryTask.countDocuments();
        const pendingTasks = await DeliveryTask.countDocuments({ status: 'Pending' });
        const assignedTasks = await DeliveryTask.countDocuments({ status: 'Assigned' });
        const deliveredTasks = await DeliveryTask.countDocuments({ status: 'Delivered' });
        
        // Get recent tasks
        const recentTasks = await DeliveryTask.find()
            .populate('driverId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json({
            success: true,
            data: {
                total_tasks: totalTasks,
                pending_tasks: pendingTasks,
                assigned_tasks: assignedTasks,
                delivered_tasks: deliveredTasks,
                recent_tasks: recentTasks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery statistics',
            error: error.message
        });
    }
};
