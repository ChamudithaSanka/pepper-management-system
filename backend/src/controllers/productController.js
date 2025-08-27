import Product from '../models/productModel.js';
import RawMaterial from '../models/rawMaterialModel.js';

// Helper function to deduct raw materials
const deductRawMaterials = async (recipe, unitsAdded) => {
    for (const item of recipe) {
        const requiredKg = unitsAdded * item.qtyPerUnitKg;
        const wasteKg = requiredKg * (item.wastePercentage / 100);
        const totalDeductKg = requiredKg + wasteKg;

        const rawMaterial = await RawMaterial.findOne({ type: item.type });
        if (!rawMaterial) {
            throw new Error(`Raw material ${item.type} not found`);
        }
        if (rawMaterial.quantityKg < totalDeductKg) {
            throw new Error(`Insufficient ${item.type} stock. Required: ${totalDeductKg}kg, Available: ${rawMaterial.quantityKg}kg`);
        }

        rawMaterial.quantityKg -= totalDeductKg;
        await rawMaterial.save();
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// Create new product
export const createProduct = async (req, res) => {
    try {
        const { currentStock, rawMaterialRecipe, ...productData } = req.body;
        
        // First create product without stock
        const product = await Product.create({
            ...productData,
            currentStock: 0,
            rawMaterialRecipe
        });

        // If initial stock is provided, add it and deduct raw materials
        if (currentStock > 0) {
            await deductRawMaterials(rawMaterialRecipe, currentStock);
            product.currentStock = currentStock;
            await product.save();
        }

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const { currentStock, ...updateData } = req.body;
        if (currentStock > oldProduct.currentStock) {
            const stockIncrease = currentStock - oldProduct.currentStock;
            await deductRawMaterials(oldProduct.rawMaterialRecipe, stockIncrease);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...updateData, currentStock },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};