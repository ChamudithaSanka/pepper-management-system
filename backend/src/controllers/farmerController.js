import Farmer from '../models/farmerModel.js';

export const createFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.create(req.body);
        res.status(201).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const getFarmers = async (req, res) => {
    try {
        const farmers = await Farmer.find();
        res.status(200).json({
            success: true,
            count: farmers.length,
            data: farmers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getFarmerById = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found'
            });
        }
        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found'
            });
        }
        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findByIdAndDelete(req.params.id);
        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Farmer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};