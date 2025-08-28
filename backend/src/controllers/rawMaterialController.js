import RawMaterial from '../models/rawMaterialModel.js';

// Get all raw materials
export const getAllRawMaterials = async (req, res) => {
    try {
        const rawMaterials = await RawMaterial.find();
        res.status(200).json({
            success: true,
            count: rawMaterials.length,
            data: rawMaterials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single raw material
export const getRawMaterial = async (req, res) => {
    try {
        const rawMaterial = await RawMaterial.findById(req.params.id);
        if (!rawMaterial) {
            return res.status(404).json({
                success: false,
                error: 'Raw material not found'
            });
        }
        res.status(200).json({
            success: true,
            data: rawMaterial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create raw material
export const createRawMaterial = async (req, res) => {
    try {
        const rawMaterial = await RawMaterial.create(req.body);
        res.status(201).json({
            success: true,
            data: rawMaterial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update raw material
export const updateRawMaterial = async (req, res) => {
    try {
        const rawMaterial = await RawMaterial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!rawMaterial) {
            return res.status(404).json({
                success: false,
                error: 'Raw material not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rawMaterial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get low stock raw materials
export const getLowStockRawMaterials = async (req, res) => {
    try {
        const lowStockMaterials = await RawMaterial.find({ lowStockStatus: "LowStock" });
        res.status(200).json({
            success: true,
            count: lowStockMaterials.length,
            data: lowStockMaterials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};