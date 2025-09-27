import RawMaterialOrder from '../models/rawMaterialOrderModel.js';
import RawMaterial from '../models/rawMaterialModel.js';
import Farmer from '../models/farmerModel.js';
import FarmerPayment from '../models/farmerPaymentModel.js';

export const getEligibleFarmers = async (req, res) => {
    try {
        const { materialType, requestedQtyKg } = req.query;
        
        if (!materialType) {
            return res.status(400).json({
                success: false,
                error: 'Material type is required'
            });
        }

        // Build query based on material type and capacity
        let query = { status: 'Active' };
        
        // Add capacity filter based on material type
        if (materialType === 'Green Pepper') {
            if (requestedQtyKg) {
                query['pepper_capacitypermonth.green'] = { $gte: parseFloat(requestedQtyKg) };
            } else {
                query['pepper_capacitypermonth.green'] = { $gt: 0 };
            }
        } else if (materialType === 'Black Pepper') {
            if (requestedQtyKg) {
                query['pepper_capacitypermonth.black'] = { $gte: parseFloat(requestedQtyKg) };
            } else {
                query['pepper_capacitypermonth.black'] = { $gt: 0 };
            }
        }
        
        const farmers = await Farmer.find(query).select('_id name pepper_capacitypermonth farm_location');

        const formattedFarmers = farmers.map(farmer => ({
            _id: farmer._id,
            name: farmer.name,
            capacity: materialType === 'Green Pepper' 
                ? farmer.pepper_capacitypermonth.green 
                : farmer.pepper_capacitypermonth.black,
            materialType: materialType,
            location: farmer.farm_location?.address || 'Location not specified'
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
        const { rawMaterialType, requestedQtyKg, farmerId } = req.body;
        
        // Find farmer by ID
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found'
            });
        }

        // Check capacity based on material type
        let farmerCapacity;
        if (rawMaterialType === 'Green Pepper') {
            farmerCapacity = farmer.pepper_capacitypermonth.green;
        } else if (rawMaterialType === 'Black Pepper') {
            farmerCapacity = farmer.pepper_capacitypermonth.black;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid material type'
            });
        }

        if (farmerCapacity < requestedQtyKg) {
            return res.status(400).json({
                success: false,
                error: `Requested quantity (${requestedQtyKg}kg) exceeds farmer's ${rawMaterialType} capacity (${farmerCapacity}kg)`
            });
        }

        const order = await RawMaterialOrder.create({
            rawMaterialType,
            requestedQtyKg,
            farmerId: farmer._id
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

        const orders = await RawMaterialOrder.find(filter).populate('farmerId', 'name farm_location');
        
        // Format the orders to include farmer information
        const formattedOrders = orders.map(order => ({
            rmOrderId: order.rmOrderId,
            rawMaterialType: order.rawMaterialType,
            requestedQtyKg: order.requestedQtyKg,
            deliveredQtyKg: order.deliveredQtyKg,
            status: order.status,
            createdAt: order.createdAt,
            deliveredAt: order.deliveredAt,
            farmerName: order.farmerId ? order.farmerId.name : 'Unknown Farmer',
            farmerLocation: order.farmerId?.farm_location?.address || 'Location not specified'
        }));

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            data: formattedOrders
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

        // Find or create raw material inventory entry
        let rawMaterial = await RawMaterial.findOne({ type: order.rawMaterialType });
        
        if (rawMaterial) {
            // Add delivered quantity to existing inventory
            rawMaterial.quantityKg += parseFloat(req.body.deliveredQtyKg);
            await rawMaterial.save();
        } else {
            // Generate rawMaterialId for new entry
            const count = await RawMaterial.countDocuments();
            const rawMaterialId = `RM-${(count + 1).toString().padStart(3, '0')}`;
            
            // Create new raw material entry
            rawMaterial = await RawMaterial.create({
                rawMaterialId,
                type: order.rawMaterialType,
                quantityKg: parseFloat(req.body.deliveredQtyKg),
                reorderLevelKg: 50 // Default reorder level
            });
        }

        // Update order status
        order.deliveredQtyKg = req.body.deliveredQtyKg;
        order.status = "Delivered";
        order.deliveredAt = new Date();
        await order.save();

        // Auto-generate farmer payment for delivered order
        try {
            // Check if payment already exists for this order
            const existingPayment = await FarmerPayment.findOne({ rmOrderId: order.rmOrderId });
            
            if (!existingPayment) {
                // Get farmer details to determine price per kg
                const farmer = await Farmer.findById(order.farmerId);
                if (farmer) {
                    // Determine price per kg based on pepper type
                    const pricePerKg = order.rawMaterialType === 'Green Pepper' 
                        ? farmer.price_per_unit.green 
                        : farmer.price_per_unit.black;

                    // Create payment record
                    const payment = new FarmerPayment({
                        farmerId: order.farmerId,
                        rmOrderId: order.rmOrderId,
                        pepperType: order.rawMaterialType,
                        deliveredQuantityKg: parseFloat(req.body.deliveredQtyKg),
                        pricePerKg: pricePerKg
                    });

                    await payment.save();
                    console.log(`Payment ${payment.paymentId} generated for order ${order.rmOrderId}`);
                }
            }
        } catch (paymentError) {
            console.error('Error generating farmer payment:', paymentError);
            // Don't fail the entire request if payment generation fails
        }

        res.status(200).json({
            success: true,
            data: order,
            inventoryUpdated: {
                materialType: order.rawMaterialType,
                newQuantity: rawMaterial.quantityKg,
                addedQuantity: req.body.deliveredQtyKg
            }
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