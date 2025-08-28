import RawMaterialOrder from '../models/rawMaterialOrderModel.js';

// Create new order
export const createOrder = async (req, res) => {
    try {
        const { rawMaterialType, requestedQtyKg } = req.body;
        
        const order = await RawMaterialOrder.create({
            rawMaterialType,
            requestedQtyKg
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