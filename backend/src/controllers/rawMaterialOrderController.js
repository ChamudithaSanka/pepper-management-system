import RawMaterialOrder from '../models/rawMaterialOrderModel.js';
import Farmer from '../models/farmerModel.js';

export const getEligibleFarmers = async (req, res) => {
    try {
        const { requestedQtyKg } = req.query;
        
        const farmers = await Farmer.find({
            status: 'Active',
            capacity: { $gte: parseFloat(requestedQtyKg || 0) }
        }).select('-_id name capacity location'); // Added -_id to exclude the ID

        const formattedFarmers = farmers.map(farmer => ({
            name: farmer.name,
            capacity: farmer.capacity,
            location: farmer.location
        }));

        res.status(200).json({
            success: true,
            count: formattedFarmers.length,
            data: formattedFarmers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { rawMaterialType, requestedQtyKg, farmerName } = req.body;
        
        // Find farmer by name instead of ID
        const farmer = await Farmer.findOne({ name: farmerName });
        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found'
            });
        }

        if (farmer.capacity < requestedQtyKg) {
            return res.status(400).json({
                success: false,
                error: 'Requested quantity exceeds farmer capacity'
            });
        }

        const order = await RawMaterialOrder.create({
            rawMaterialType,
            requestedQtyKg,
            farmerId: farmer._id  // Convert farmer name to ID internally
        });

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// List orders with optional filters
export const listOrders = async (req, res) => {
    try {
        const { status, rawMaterialType } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (rawMaterialType) filter.rawMaterialType = rawMaterialType;

        const orders = await RawMaterialOrder.find(filter);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mark order as delivered
export const markDelivered = async (req, res) => {
    try {
        const order = await RawMaterialOrder.findOne({ rmOrderId: req.params.rmOrderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status === "Delivered") {
            return res.status(400).json({
                success: false,
                error: 'Order is already delivered'
            });
        }

        if (req.body.deliveredQtyKg > order.requestedQtyKg) {
            return res.status(400).json({
                success: false,
                error: 'Delivered quantity cannot exceed requested quantity'
            });
        }

        order.deliveredQtyKg = req.body.deliveredQtyKg;
        order.status = "Delivered";
        order.deliveredAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete raw material order
export const deleteOrder = async (req, res) => {
    try {
        const order = await RawMaterialOrder.findOne({ rmOrderId: req.params.rmOrderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status === "Delivered") {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete delivered orders'
            });
        }

        await RawMaterialOrder.findByIdAndDelete(order._id);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};