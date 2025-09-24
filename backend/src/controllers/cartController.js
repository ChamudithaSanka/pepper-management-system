import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { productId, quantity = 1 } = req.body;

        // Check if user is logged in (session check)
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to add items to cart'
            });
        }

        // Validate product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.status !== 'Active' || product.currentStock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        if (quantity > product.currentStock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.currentStock} ${product.unit}(s) available`
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ customerId });
        if (!cart) {
            cart = new Cart({ customerId, items: [] });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + parseInt(quantity);
            if (newQuantity > product.currentStock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Only ${product.currentStock} ${product.unit}(s) available`
                });
            }
            existingItem.quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity: parseInt(quantity),
                price: product.price
            });
        }

        await cart.save();

        // Return cart with populated product data
        const updatedCart = await Cart.findOne({ customerId }).populate('items.productId');

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

// GET CART
export const getCart = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to view cart'
            });
        }

        const cart = await Cart.findOne({ customerId }).populate('items.productId');
        
        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    customerId,
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            });
        }

        // Filter out items where productId is null (deleted products)
        cart.items = cart.items.filter(item => item.productId !== null);
        
        // Recalculate totals after filtering
        cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Save the cleaned cart
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
    try {
        const { customerId, productId } = req.params;
        const { quantity } = req.body;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to update cart'
            });
        }

        // Validate quantity
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Check product availability
        const product = await Product.findById(productId);
        if (!product || quantity > product.currentStock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product?.currentStock || 0} ${product?.unit || 'items'}(s) available`
            });
        }

        const cart = await Cart.findOne({ customerId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        item.quantity = parseInt(quantity);
        await cart.save();

        // Return cart with populated product data
        const updatedCart = await Cart.findOne({ customerId }).populate('items.productId');

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cart',
            error: error.message
        });
    }
};

// REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
    try {
        const { customerId, productId } = req.params;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to remove items from cart'
            });
        }

        const cart = await Cart.findOne({ customerId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        // Return cart with populated product data
        const updatedCart = await Cart.findOne({ customerId }).populate('items.productId');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

// CLEAR CART
export const clearCart = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to clear cart'
            });
        }

        await Cart.findOneAndUpdate(
            { customerId },
            { items: [], totalItems: 0, totalPrice: 0 },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

// GET CART ITEM COUNT
export const getCartCount = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Check if user is logged in
        if (!req.session.customer || req.session.customer.customerId != customerId) {
            return res.status(200).json({
                success: true,
                count: 0
            });
        }

        const cart = await Cart.findOne({ customerId });
        
        res.status(200).json({
            success: true,
            count: cart ? cart.totalItems : 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart count',
            error: error.message
        });
    }
};
