import User from '../models/userModel.js';

// STAFF LOGIN
export const loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if user is active
        if (user.status !== 'Active') {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is inactive. Please contact admin.' 
            });
        }
        
        // Simple password check (in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Don't send password in response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        // Store user info in session
        req.session.staff = {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            data: userResponse 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error during login', 
            error: error.message 
        });
    }
};

// STAFF LOGOUT
export const logoutStaff = async (req, res) => {
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

// CHECK STAFF SESSION
export const checkStaffSession = async (req, res) => {
    try {
        if (req.session.staff) {
            res.status(200).json({ 
                success: true, 
                isLoggedIn: true,
                staff: req.session.staff 
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

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            data: users 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
};


// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user', 
            error: error.message 
        });
    }
};


// GET USER STATS
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'Active' });
        const inactiveUsers = await User.countDocuments({ status: 'Inactive' });
        
        const stats = {
            totalUsers,
            activeUsers,
            inactiveUsers
        };
        
        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user stats', 
            error: error.message 
        });
    }
};


// CREATE USER
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;
        
        // Check if user with this email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        
        // Generate userId
        const lastUser = await User.findOne({}, {}, { sort: { userId: -1 } });
        const nextUserId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1;
        
        // Create new user with generated userId
        const user = new User({ 
            userId: nextUserId,
            name, 
            email, 
            password, 
            role, 
            status: status || 'Active' 
        });
        
        await user.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully', 
            data: user 
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
            message: 'Error creating user', 
            error: error.message 
        });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;
        
        // Check if email is being changed and conflicts with another user
        if (email) {
            const existingEmail = await User.findOne({ 
                email, 
                _id: { $ne: req.params.id } 
            });
            if (existingEmail) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Another user with this email already exists' 
                });
            }
        }
        
        // Update user
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, password, role, status },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User updated successfully', 
            data: user 
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
            message: 'Error updating user', 
            error: error.message 
        });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully', 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user', 
            error: error.message 
        });
    }
};
