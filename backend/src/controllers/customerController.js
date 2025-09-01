import Customer from '../models/customerModel.js';
import Product from '../models/productModel.js';


// CUSTOMER REGISTRATION
export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, phone, deliveryAddress } = req.body;
        
        // Check if customer with this email already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ 
                success: false, 
                message: 'Customer with this email already exists' 
            });
        }
        
        // Check if customer with this phone already exists
        const existingPhone = await Customer.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Customer with this phone number already exists' 
            });
        }
        
        // Generate unique customer ID
        const lastCustomer = await Customer.findOne().sort({ customerId: -1 });
        const customerId = lastCustomer ? lastCustomer.customerId + 1 : 1001;
        
        // Create new customer
        const customer = new Customer({ 
            customerId,
            name, 
            email, 
            password, 
            phone, 
            deliveryAddress 
        });
        
        await customer.save();
        
        // Don't send password in response
        const customerResponse = customer.toObject();
        delete customerResponse.password;
        
        res.status(201).json({ 
            success: true, 
            message: 'Customer registered successfully', 
            data: customerResponse 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error', 
                errors 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Error registering customer', 
            error: error.message 
        });
    }
};


// CUSTOMER LOGIN
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find customer by email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if customer is active
        if (customer.status !== 'Active') {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is inactive. Please contact support.' 
            });
        }
        
        // Simple password check (in production, use bcrypt)
        if (customer.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Don't send password in response
        const customerResponse = customer.toObject();
        delete customerResponse.password;
        
        // Store customer info in session
        req.session.customer = {
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email
        };
        
        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            data: customerResponse 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error during login', 
            error: error.message 
        });
    }
};

// CUSTOMER LOGOUT
export const logoutCustomer = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error during logout' 
                });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ 
                success: true, 
                message: 'Logout successful' 
            });
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error during logout', 
            error: error.message 
        });
    }
};

// CHECK SESSION
export const checkSession = async (req, res) => {
    try {
        if (req.session.customer) {
            res.status(200).json({ 
                success: true, 
                isLoggedIn: true,
                customer: req.session.customer 
            });
        } else {
            res.status(200).json({ 
                success: true, 
                isLoggedIn: false 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error checking session', 
            error: error.message 
        });
    }
};

// GET CUSTOMER PROFILE
export const getCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-password');
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: customer 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching customer profile', 
            error: error.message 
        });
    }
};

// UPDATE CUSTOMER PROFILE
export const updateCustomerProfile = async (req, res) => {
    try {
        const { name, phone, deliveryAddress } = req.body;
        
        // Check if phone is being changed and conflicts with another customer
        if (phone) {
            const existingPhone = await Customer.findOne({ 
                phone, 
                _id: { $ne: req.params.id } 
            });
            if (existingPhone) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Another customer with this phone number already exists' 
                });
            }
        }
        
        // Update customer (excluding email and password)
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { name, phone, deliveryAddress },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully', 
            data: customer 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error', 
                errors 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
};

// GET ALL CUSTOMERS (ADMIN ONLY)
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            count: customers.length,
            data: customers 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching customers', 
            error: error.message 
        });
    }
};

// GET CUSTOMER STATS (ADMIN ONLY)
export const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: 'Active' });
        const inactiveCustomers = await Customer.countDocuments({ status: 'Inactive' });
        const recentCustomers = await Customer.countDocuments({
            registrationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        
        const stats = {
            totalCustomers,
            activeCustomers,
            inactiveCustomers,
            recentCustomers
        };
        
        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching customer stats', 
            error: error.message 
        });
    }
};

// PRODUCT BROWSING FOR CUSTOMERS
// GET ALL AVAILABLE PRODUCTS (CUSTOMER VIEW)
export const getAvailableProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        // Build filter query - only active products with stock > 0
        const filter = {
            status: 'Active',
            currentStock: { $gt: 0 }
        };
        
        // Add category filter if provided
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }
        
        // Add search filter if provided (search in name and description)
        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments(filter);
        
        // Get products with pagination
        const products = await Product.find(filter)
            .select('productId productName description category unit price currentStock expiryDate stockStatus')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available products',
            error: error.message
        });
    }
};

// GET SINGLE PRODUCT DETAILS (CUSTOMER VIEW)
export const getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .select('productId productName description category unit price currentStock expiryDate stockStatus');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if product is available for customers
        if (product.status !== 'Active' || product.currentStock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Product is currently unavailable'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
};

// GET PRODUCT CATEGORIES (FOR FILTER DROPDOWN)
export const getProductCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', {
            status: 'Active',
            currentStock: { $gt: 0 }
        });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product categories',
            error: error.message
        });
    }
};

// SEARCH PRODUCTS BY NAME
export const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const products = await Product.find({
            status: 'Active',
            currentStock: { $gt: 0 },
            $or: [
                { productName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        })
        .select('productId productName description category unit price currentStock stockStatus')
        .sort({ productName: 1 })
        .limit(20);
        
        res.status(200).json({
            success: true,
            count: products.length,
            searchQuery: query,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};
