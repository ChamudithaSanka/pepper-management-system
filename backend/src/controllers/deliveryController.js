import Order from '../models/orderModel.js';
import RawMaterialOrder from '../models/rawMaterialOrderModel.js';
import DeliveryDriver from '../models/deliveryDriverModel.js';
import DeliveryTask from '../models/deliveryTaskModel.js';
import Farmer from '../models/farmerModel.js';
import Customer from '../models/customerModel.js';
import { SHOP_LOCATION } from '../config/deliveryConfig.js';

// Get all orders for delivery management (both farmer and customer orders)
export const getAllOrdersForDelivery = async (req, res) => {
    try {
        console.log('Fetching orders for delivery...');
        const { status, orderType, page = 1, limit = 20 } = req.query;
        
        let farmerOrders = [];
        let customerOrders = [];
        
        // Get farmer orders (raw material orders)
        if (!orderType || orderType === 'all' || orderType === 'FarmerOrder') {
            console.log('Fetching farmer orders...');
            let farmerQuery = {};
            if (status && status !== 'all') {
                farmerQuery.status = status === 'Delivered' ? 'Delivered' : 'Pending';
            }
            
            const farmerOrdersData = await RawMaterialOrder.find(farmerQuery)
                .populate('farmerId', 'name phone farm_location')
                .sort({ createdAt: -1 });
            
            console.log(`Found ${farmerOrdersData.length} farmer orders`);
            
            farmerOrders = farmerOrdersData.map(order => ({
                id: order._id,
                orderId: order.rmOrderId,
                orderType: 'FarmerOrder',
                customerName: order.farmerId.name,
                customerPhone: order.farmerId.phone,
                location: {
                    latitude: order.farmerId.farm_location.latitude,
                    longitude: order.farmerId.farm_location.longitude,
                    address: order.farmerId.farm_location?.address || 'No address available'
                },
                status: order.status,
                details: {
                    materialType: order.rawMaterialType,
                    requestedQty: order.requestedQtyKg,
                    deliveredQty: order.deliveredQtyKg
                },
                createdAt: order.createdAt,
                deliveredAt: order.deliveredAt
            }));
        }
        
        // Get customer orders
        if (!orderType || orderType === 'all' || orderType === 'CustomerOrder') {
            console.log('Fetching customer orders...');
            let customerQuery = {};
            if (status && status !== 'all') {
                customerQuery.orderStatus = status;
            }
            
            const customerOrdersData = await Order.find(customerQuery)
                .populate('customerId', 'name phone deliveryAddress')
                .sort({ createdAt: -1 });
            
            console.log(`Found ${customerOrdersData.length} customer orders`);
            
            customerOrders = customerOrdersData.map(order => ({
                id: order._id,
                orderId: order.orderId,
                orderType: 'CustomerOrder',
                customerName: order.customerId.name,
                customerPhone: order.customerId.phone,
                location: {
                    latitude: order.deliveryLocation.latitude,
                    longitude: order.deliveryLocation.longitude,
                    address: order.deliveryAddress?.fullAddress || order.customerId?.deliveryAddress?.address || 'No address available'
                },
                status: order.orderStatus,
                details: {
                    totalAmount: order.totalAmount,
                    itemCount: order.items.length,
                    items: order.items.map(item => ({
                        name: item.productName,
                        quantity: item.quantity,
                        price: item.price
                    }))
                },
                createdAt: order.createdAt,
                estimatedDeliveryDate: order.estimatedDeliveryDate,
                actualDeliveryDate: order.actualDeliveryDate
            }));
        }
        
        // Combine and sort orders
        const allOrders = [...farmerOrders, ...customerOrders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Apply pagination
        const skip = (page - 1) * limit;
        const paginatedOrders = allOrders.slice(skip, skip + parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: {
                orders: paginatedOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(allOrders.length / limit),
                    totalOrders: allOrders.length,
                    hasNextPage: page < Math.ceil(allOrders.length / limit),
                    hasPrevPage: page > 1
                },
                shopLocation: SHOP_LOCATION
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders for delivery',
            error: error.message
        });
    }
};

// Assign driver to order (creates delivery task)
export const assignDriverToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { driverId, orderType } = req.body;
        
        // Validate driver
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
        
        // Check if delivery task already exists
        const existingTask = await DeliveryTask.findOne({ 
            orderType, 
            orderId 
        });
        
        if (existingTask) {
            return res.status(400).json({
                success: false,
                message: 'Delivery task already exists for this order'
            });
        }
        
        // Get order details and create delivery task
        let orderData = null;
        let deliveryLocation = null;
        let customerInfo = null;
        
        if (orderType === 'FarmerOrder') {
            const farmerOrder = await RawMaterialOrder.findOne({ rmOrderId: orderId })
                .populate('farmerId', 'name phone farm_location');
            
            if (!farmerOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Farmer order not found'
                });
            }
            
            orderData = farmerOrder;
            deliveryLocation = {
                latitude: farmerOrder.farmerId.farm_location.latitude,
                longitude: farmerOrder.farmerId.farm_location.longitude,
                address: farmerOrder.farmerId.farm_location.address
            };
            customerInfo = {
                name: farmerOrder.farmerId.name,
                phone: farmerOrder.farmerId.phone
            };
        } else if (orderType === 'CustomerOrder') {
            const customerOrder = await Order.findOne({ orderId })
                .populate('customerId', 'name phone');
            
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
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid order type'
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
            orderType,
            orderId,
            driverId: driver._id,
            driverName: driver.name,
            pickupLocation,
            deliveryLocation,
            status: 'Assigned',
            assignedAt: new Date(),
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            orderDetails: orderData
        });
        
        await deliveryTask.save();
        
        // Update driver status
        await DeliveryDriver.findByIdAndUpdate(
            driver._id,
            { status: 'Busy' }
        );
        
        // Update customer order status to Shipped when driver assigned
        if (orderType === 'CustomerOrder') {
            await Order.findOneAndUpdate(
                { orderId },
                { orderStatus: 'Shipped' }
            );
        }
        
        res.status(201).json({
            success: true,
            message: 'Driver assigned successfully',
            data: deliveryTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning driver',
            error: error.message
        });
    }
};

// Get delivery dashboard statistics
export const getDeliveryDashboardStats = async (req, res) => {
    try {
        // Driver statistics
        const totalDrivers = await DeliveryDriver.countDocuments();
        const availableDrivers = await DeliveryDriver.countDocuments({ status: 'Available' });
        const busyDrivers = await DeliveryDriver.countDocuments({ status: 'Busy' });
        const assignedDrivers = await DeliveryDriver.countDocuments({ status: 'Assigned' });
        
        // Order statistics
        const totalFarmerOrders = await RawMaterialOrder.countDocuments();
        const pendingFarmerOrders = await RawMaterialOrder.countDocuments({ status: 'Pending' });
        const deliveredFarmerOrders = await RawMaterialOrder.countDocuments({ status: 'Delivered' });
        
        const totalCustomerOrders = await Order.countDocuments();
        const pendingCustomerOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const processingCustomerOrders = await Order.countDocuments({ orderStatus: 'Processing' });
        const deliveredCustomerOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        
        // Delivery task statistics
        const totalTasks = await DeliveryTask.countDocuments();
        const pendingTasks = await DeliveryTask.countDocuments({ status: 'Pending' });
        const assignedTasks = await DeliveryTask.countDocuments({ status: 'Assigned' });
        const deliveredTasks = await DeliveryTask.countDocuments({ status: 'Delivered' });
        
        // Recent activities
        const recentTasks = await DeliveryTask.find()
            .populate('driverId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const recentOrders = await Order.find()
            .populate('customerId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json({
            success: true,
            data: {
                drivers: {
                    total: totalDrivers,
                    available: availableDrivers,
                    busy: busyDrivers,
                    assigned: assignedDrivers
                },
                farmerOrders: {
                    total: totalFarmerOrders,
                    pending: pendingFarmerOrders,
                    delivered: deliveredFarmerOrders
                },
                customerOrders: {
                    total: totalCustomerOrders,
                    pending: pendingCustomerOrders,
                    processing: processingCustomerOrders,
                    delivered: deliveredCustomerOrders
                },
                deliveryTasks: {
                    total: totalTasks,
                    pending: pendingTasks,
                    assigned: assignedTasks,
                    delivered: deliveredTasks
                },
                recentActivities: {
                    tasks: recentTasks,
                    orders: recentOrders
                },
                shopLocation: SHOP_LOCATION
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery dashboard statistics',
            error: error.message
        });
    }
};
