import DeliveryDriver from '../models/deliveryDriverModel.js';

// Get all drivers with search and filter
export const getAllDrivers = async (req, res) => {
    try {
        const { search, status, isActive } = req.query;
        
        let query = {};
        
        // Search by name, phone, or license number
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } },
                { vehicleNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const drivers = await DeliveryDriver.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: drivers,
            total: drivers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching drivers',
            error: error.message
        });
    }
};

// Get single driver by ID
export const getDriverById = async (req, res) => {
    try {
        const driver = await DeliveryDriver.findById(req.params.id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching driver',
            error: error.message
        });
    }
};

// Create new driver
export const createDriver = async (req, res) => {
    try {
        const { 
            name,
            nic,
            phone,
            email,
            licenseNumber,
            vehicleNumber,
            status
        } = req.body;
        
        // Check if driver with same NIC already exists
        const existingNIC = await DeliveryDriver.findOne({ nic });
        if (existingNIC) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this NIC number already exists'
            });
        }
        
        // Check if license number already exists
        const existingLicense = await DeliveryDriver.findOne({ licenseNumber });
        if (existingLicense) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this license number already exists'
            });
        }
        
        // Check if vehicle number already exists
        const existingVehicle = await DeliveryDriver.findOne({ vehicleNumber });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this vehicle number already exists'
            });
        }
        
        const driver = new DeliveryDriver({
            name,
            nic,
            phone,
            email,
            licenseNumber,
            vehicleNumber,
            status: status || 'Available'
        });
        
        await driver.save();
        
        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: driver
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
            message: 'Error creating driver',
            error: error.message
        });
    }
};

// Update driver
export const updateDriver = async (req, res) => {
    try {
        const { 
            name,
            nic,
            phone,
            email,
            licenseNumber,
            vehicleNumber,
            status,
            isActive
        } = req.body;
        
        // Check if NIC is being changed and if it conflicts with another driver
        if (nic) {
            const existingNIC = await DeliveryDriver.findOne({ 
                nic, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingNIC) {
                return res.status(400).json({
                    success: false,
                    message: 'Another driver with this NIC number already exists'
                });
            }
        }
        
        // Check if license number is being changed and if it conflicts
        if (licenseNumber) {
            const existingLicense = await DeliveryDriver.findOne({ 
                licenseNumber, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingLicense) {
                return res.status(400).json({
                    success: false,
                    message: 'Another driver with this license number already exists'
                });
            }
        }
        
        // Check if vehicle number is being changed and if it conflicts
        if (vehicleNumber) {
            const existingVehicle = await DeliveryDriver.findOne({ 
                vehicleNumber, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Another driver with this vehicle number already exists'
                });
            }
        }
        
        const driver = await DeliveryDriver.findByIdAndUpdate(
            req.params.id,
            {
                name,
                nic,
                phone,
                email,
                licenseNumber,
                vehicleNumber,
                status,
                isActive
            },
            { new: true, runValidators: true }
        );
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            data: driver
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
            message: 'Error updating driver',
            error: error.message
        });
    }
};

// Delete driver
export const deleteDriver = async (req, res) => {
    try {
        const driver = await DeliveryDriver.findByIdAndDelete(req.params.id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Driver deleted successfully',
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting driver',
            error: error.message
        });
    }
};

// Update driver status
export const updateDriverStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ['Available', 'Busy', 'Assigned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const driver = await DeliveryDriver.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Driver status updated successfully',
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating driver status',
            error: error.message
        });
    }
};

// Get driver statistics
export const getDriverStats = async (req, res) => {
    try {
        const totalDrivers = await DeliveryDriver.countDocuments();
        const availableDrivers = await DeliveryDriver.countDocuments({ status: 'Available' });
        const busyDrivers = await DeliveryDriver.countDocuments({ status: 'Busy' });
        const assignedDrivers = await DeliveryDriver.countDocuments({ status: 'Assigned' });
        const activeDrivers = await DeliveryDriver.countDocuments({ isActive: true });
        
        // Get top performing drivers
        const topDrivers = await DeliveryDriver.find({ isActive: true })
            .sort({ completedDeliveries: -1 })
            .limit(5)
            .select('name completedDeliveries totalDeliveries rating');
        
        res.status(200).json({
            success: true,
            data: {
                total_drivers: totalDrivers,
                available_drivers: availableDrivers,
                busy_drivers: busyDrivers,
                assigned_drivers: assignedDrivers,
                active_drivers: activeDrivers,
                top_drivers: topDrivers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching driver statistics',
            error: error.message
        });
    }
};
