import Customer from '../models/customerModel.js';


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
        
        res.status(201).json({ 
            success: true, 
            message: 'Customer registered successfully', 
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
        
        // Store customer info in session
        req.session.customer = {
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email
        };
        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            data: customer 
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
        // Use customerId instead of MongoDB _id
        const customer = await Customer.findOne({ customerId: parseInt(req.params.id) }).select('-password');
        
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
        const { name, phone, deliveryAddress, location } = req.body;
        const customerId = parseInt(req.params.id);
        
        // Check if phone is being changed and conflicts with another customer
        if (phone) {
            const existingPhone = await Customer.findOne({ 
                phone, 
                customerId: { $ne: customerId }
            });
            if (existingPhone) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Another customer with this phone number already exists' 
                });
            }
        }
        
        // Update customer using customerId instead of _id
        const customer = await Customer.findOneAndUpdate(
            { customerId: customerId },
            { name, phone, deliveryAddress, location },
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

// DELETE CUSTOMER (ADMIN ONLY)
export const deleteCustomer = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        
        // Find and delete customer using customerId instead of _id
        const customer = await Customer.findOneAndDelete({ customerId: customerId });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Customer deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting customer', 
            error: error.message 
        });
    }
};
