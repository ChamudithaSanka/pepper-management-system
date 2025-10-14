import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import Customer from '../models/customerModel.js';
import { recordProductSold } from './inventoryHistoryController.js';

// CREATE ORDER FROM CART
export const createOrderFromCart = async (req, res) => {
    try {
        console.log('🛒 createOrderFromCart called');
        const { customerId } = req.params;
        const { deliveryAddress, deliveryLocation, notes } = req.body;
        console.log('🛒 customerId:', customerId);
        console.log('🛒 session customer:', req.session.customer);
        console.log('🛒 request body:', { deliveryAddress, deliveryLocation, notes });

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            console.log('🛒 Authentication failed');
            return res.status(401).json({
                success: false,
                message: 'Please login to create order'
            });
        }

        console.log('🛒 Authentication passed, looking for cart...');
        // Get customer's cart
        const cart = await Cart.findOne({ customerId }).populate('items.productId');
        console.log('🛒 Cart found:', cart);
        if (!cart || cart.items.length === 0) {
            console.log('🛒 Cart is empty or not found');
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Verify all products are available
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product || product.currentStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product?.productName || 'unknown'} is not available in requested quantity`
                });
            }
        }

        // Create order items from cart
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            productName: item.productId.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
        }));

        // Generate orderId
        const orderCount = await Order.countDocuments();
        const orderId = `ORD${String(orderCount + 1).padStart(6, '0')}`;

        // Create new order
        const newOrder = new Order({
            orderId,
            customerId,
            items: orderItems,
            totalAmount: cart.totalPrice,
            deliveryAddress,
            deliveryLocation,
            notes
        });

        await newOrder.save();

        // Update product stock and record in inventory history
        for (const item of cart.items) {
            // Get the full product first
            const product = await Product.findById(item.productId._id);
            if (product) {
                // Record the sale in inventory history before updating stock
                await recordProductSold(product, item.quantity);
                
                // Update the product stock
                product.currentStock -= item.quantity;
                if (product.currentStock <= product.reorderLevel) {
                    product.stockStatus = "LowStock";
                }
                
                // Save the updated product
                await product.save();
            }
        }

        // Update customer's order count and last order date
        await Customer.findOneAndUpdate(
            { customerId },  // Use customerId field instead of _id
            {
                $inc: { totalOrders: 1 },
                lastOrderDate: new Date()
            }
        );

        // Clear cart after order creation
        await Cart.findOneAndUpdate(
            { customerId },
            { items: [], totalItems: 0, totalPrice: 0 }
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        console.error('🛒 Error in createOrderFromCart:', error);
        console.error('🛒 Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ orderId })
            .populate('customerId', 'name email phone')
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// GET CUSTOMER ORDERS
export const getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to view orders'
            });
        }

        // Build query
        const query = { customerId };
        if (status) {
            query.orderStatus = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('items.productId', 'productName category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNextPage: page < Math.ceil(totalOrders / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer orders',
            error: error.message
        });
    }
};

// UPDATE ORDER STATUS (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus, notes } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.orderStatus = orderStatus;
        if (notes) order.notes = notes;

        // Set delivery date if delivered
        if (orderStatus === 'Delivered') {
            order.actualDeliveryDate = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// GET ALL ORDERS (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;

        // Build query
        const query = {};
        if (status) {
            query.orderStatus = status;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'deliveryAddress.fullAddress': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('customerId', 'name email phone')
            .populate('items.productId', 'productName category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNextPage: page < Math.ceil(totalOrders / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// GET ORDERS BY STATUS
export const getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const orders = await Order.find({ orderStatus: status })
            .populate('customerId', 'name email phone')
            .populate('items.productId', 'productName category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders by status',
            error: error.message
        });
    }
};

// GET ORDER STATISTICS (Admin only)
export const getOrderStatistics = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        // Calculate total revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                totalRevenue,
                recentOrders
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order statistics',
            error: error.message
        });
    }
};
