import Order from '../models/orderModel.js';
import DeliveryDriver from '../models/deliveryDriverModel.js';
import DeliveryTask from '../models/deliveryTaskModel.js';
import Farmer from '../models/farmerModel.js';
import Customer from '../models/customerModel.js';
import { SHOP_LOCATION } from '../config/deliveryConfig.js';

// Get all customer orders for delivery management
export const getAllOrdersForDelivery = async (req, res) => {
    try {
        console.log('Fetching customer orders for delivery...');
        const { status, page = 1, limit = 20 } = req.query;

        let customerQuery = {};
        if (status && status !== 'all') {
            customerQuery.orderStatus = status;
        }

        const customerOrdersData = await Order.find(customerQuery)
            .sort({ createdAt: -1 });

        console.log(`Found ${customerOrdersData.length} customer orders`);

        // For each order, fetch customer details if needed
        const customerOrders = await Promise.all(customerOrdersData.map(async order => {
            const customer = await Customer.findOne({ customerId: order.customerId });
            let customerName = customer ? customer.name : '';
            let customerPhone = customer ? customer.phone : '';
            let customerAddress = customer && customer.deliveryAddress ? customer.deliveryAddress.address : '';
            return {
                id: order._id,
                orderId: order.orderId,
                customerName,
                customerPhone,
                location: {
                    latitude: order.deliveryLocation?.latitude,
                    longitude: order.deliveryLocation?.longitude,
                    address: order.deliveryAddress?.fullAddress || customerAddress || 'No address available'
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
            };
        }));

        // Apply pagination
        const skip = (page - 1) * limit;
        const paginatedOrders = customerOrders.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                orders: paginatedOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(customerOrders.length / limit),
                    totalOrders: customerOrders.length,
                    hasNextPage: page < Math.ceil(customerOrders.length / limit),
                    hasPrevPage: page > 1
                },
                shopLocation: SHOP_LOCATION
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer orders for delivery',
            error: error.message
        });
    }
};

// Assign driver to order (creates delivery task)
export const assignDriverToOrder = async (req, res) => {
    console.log('assignDriverToOrder called', req.params.orderId, req.body);
    try {
        const { orderId } = req.params;
        const { driverId } = req.body;

        // Validate driver
        const driver = await DeliveryDriver.findById(driverId);
        console.log('Driver:', driver);
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        if (driver.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Driver is not available' });
        }

        // Get customer order details
        const customerOrder = await Order.findOne({ orderId }).populate('customerId', 'name phone');
        console.log('CustomerOrder:', customerOrder);
        if (!customerOrder) {
            return res.status(404).json({ success: false, message: 'Customer order not found' });
        }

        // Check if delivery task already exists
        let deliveryTask = await DeliveryTask.findOne({ orderId });
        console.log('ExistingTask:', deliveryTask);
        if (!deliveryTask) {
            // Create pickup location (shop location)
            const pickupLocation = {
                latitude: SHOP_LOCATION.coordinates.latitude,
                longitude: SHOP_LOCATION.coordinates.longitude,
                address: SHOP_LOCATION.address
            };
            const deliveryLocation = {
                latitude: customerOrder.deliveryLocation.latitude,
                longitude: customerOrder.deliveryLocation.longitude,
                address: customerOrder.deliveryAddress.fullAddress
            };
            const customerInfo = {
                id: customerOrder.customerId?._id || customerOrder.customerId,
                name: customerOrder.customerId.name,
                phone: customerOrder.customerId.phone
            };
            // Create delivery task
            deliveryTask = new DeliveryTask({
                orderId,
                driverId: driver._id,
                driverName: driver.name,
                pickupLocation,
                deliveryLocation,
                status: 'Assigned',
                assignedAt: new Date()
            });
        } else {
            // Update existing delivery task with driver info
            deliveryTask.driverId = driver._id;
            deliveryTask.driverName = driver.name;
            deliveryTask.status = 'Assigned';
            deliveryTask.assignedAt = new Date();
        }

        await deliveryTask.save();
        console.log('SavedTask:', deliveryTask);

        // Update driver status
        await DeliveryDriver.findByIdAndUpdate(driver._id, { status: 'Busy' });
        console.log('Driver status updated to Busy');

        // Update customer order status to Shipped when driver assigned
        await Order.findOneAndUpdate({ orderId }, { orderStatus: 'Shipped' });
        console.log('Order status updated to Shipped');

        res.status(201).json({ success: true, message: 'Driver assigned successfully', data: deliveryTask });
    } catch (error) {
        console.error('Error in assignDriverToOrder:', error);
        res.status(500).json({ success: false, message: 'Error assigning driver', error: error.message });
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

        // Customer order statistics
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
        res.status(500).json({ success: false, message: 'Error fetching delivery dashboard statistics', error: error.message });
    }
};
