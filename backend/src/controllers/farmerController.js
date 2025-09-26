import Farmer from '../models/farmerModel.js';

// Get all farmers with search and filter
export const getAllFarmers = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let query = {};
        
        // Search by name or farm_location address
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'farm_location.address': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const farmers = await Farmer.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: farmers,
            total: farmers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farmers',
            error: error.message
        });
    }
};

// Get single farmer by ID
export const getFarmerById = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer',
            error: error.message
        });
    }
};

// Create new farmer
export const createFarmer = async (req, res) => {
    try {
        const { 
            name,
            nic,
            phone, 
            email,
            address, 
            farm_location, 
            pepper_capacitypermonth,
            price_per_unit,
            status 
        } = req.body;
        
        // Check if farmer with same NIC already exists
        const existingNIC = await Farmer.findOne({ nic });
        if (existingNIC) {
            return res.status(400).json({
                success: false,
                message: 'Farmer with this NIC number already exists'
            });
        }
        
        const farmer = new Farmer({
            name,
            nic,
            phone,
            email,
            address,
            farm_location,
            pepper_capacitypermonth,
            price_per_unit,
            status: status || 'Active'
        });
        
        await farmer.save();
        
        res.status(201).json({
            success: true,
            message: 'Farmer registered successfully',
            data: farmer
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
            message: 'Error creating farmer',
            error: error.message
        });
    }
};

// Update farmer
export const updateFarmer = async (req, res) => {
    try {
        const { 
            name,
            nic,
            phone, 
            email,
            address, 
            farm_location, 
            pepper_capacitypermonth,
            price_per_unit,
            status 
        } = req.body;
        
        // Check if NIC is being changed and if it conflicts with another farmer
        if (nic) {
            const existingNIC = await Farmer.findOne({ 
                nic, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingNIC) {
                return res.status(400).json({
                    success: false,
                    message: 'Another farmer with this NIC number already exists'
                });
            }
        }
        
        const farmer = await Farmer.findByIdAndUpdate(
            req.params.id,
            {
                name,
                nic,
                phone,
                email,
                address,
                farm_location,
                pepper_capacitypermonth,
                price_per_unit,
                status
            },
            { new: true, runValidators: true }
        );
        
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Farmer updated successfully',
            data: farmer
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
            message: 'Error updating farmer',
            error: error.message
        });
    }
};

// Delete farmer
export const deleteFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findByIdAndDelete(req.params.id);
        
        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Farmer deleted successfully',
            data: farmer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting farmer',
            error: error.message
        });
    }
};

// Get farmer statistics
export const getFarmerStats = async (req, res) => {
    try {
        const totalFarmers = await Farmer.countDocuments();
        const activeFarmers = await Farmer.countDocuments({ status: 'Active' });
        const inactiveFarmers = await Farmer.countDocuments({ status: 'Inactive' });
        
        const capacityStats = await Farmer.aggregate([
            { $match: { status: 'Active' } },
            { 
                $group: { 
                    _id: null, 
                    totalGreenCapacity: { $sum: '$pepper_capacitypermonth.green' },
                    totalBlackCapacity: { $sum: '$pepper_capacitypermonth.black' }
                } 
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                total_farmers: totalFarmers,
                active_farmers: activeFarmers,
                inactive_farmers: inactiveFarmers,
                monthly_capacity: {
                    green_pepper: capacityStats[0]?.totalGreenCapacity || 0,
                    black_pepper: capacityStats[0]?.totalBlackCapacity || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer statistics',
            error: error.message
        });
    }
};