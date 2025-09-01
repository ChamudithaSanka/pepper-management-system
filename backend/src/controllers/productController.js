import Product from '../models/productModel.js';
import RawMaterial from '../models/rawMaterialModel.js';
import { addInventoryHistory } from './inventoryHistoryController.js';

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

// ------------------ Get all products ------------------
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

// ------------------ Get single product by ID ------------------
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

// ------------------ Customer catalog ------------------
export const getCustomerCatalog = async (req, res) => {
    try {
        const products = await Product.find(
            { status: { $in: ['Active', 'Expiring Soon'] } },// include Expiring Soon
            'productName description price category currentStock safetyStock expiryDate status'
        ).sort({ category: 1, productName: 1 });

        const mapped = products.map((p) => {
            const stock = Math.max((p.currentStock ?? 0) - (p.safetyStock ?? 0), 0);
            return {
                category: p.category,
                productName: p.productName,
                description: p.description,
                price: p.price,
                stock,
                expiryDate: p.expiryDate, 
                status: p.status          
            };
        });

        const grouped = mapped.reduce((acc, item) => {
            (acc[item.category] ||= []).push({
                productName: item.productName,
                description: item.description,
                price: item.price,
                stock: item.stock,
                expiryDate: item.expiryDate, 
                status: item.status          
            });
            return acc;
        }, {});

        res.status(200).json({ success: true, data: grouped });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ------------------ Create product ------------------
export const createProduct = async (req, res) => {
    try {
        const { currentStock, rawMaterialRecipe, ...productData } = req.body;

        // create product first with 0 stock
        const product = await Product.create({
            ...productData,
            currentStock: 0,
            rawMaterialRecipe
        });

        // deduct raw materials if initial stock is provided
        if (currentStock > 0) {
            await deductRawMaterials(rawMaterialRecipe, currentStock);
            product.currentStock = currentStock;
            await product.save();
        }

        // inventory history tracking
        await addInventoryHistory(null, product);

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

// ------------------ Update product ------------------
export const updateProduct = async (req, res) => {
    try {
        const oldProduct = await Product.findById(req.params.id);
        if (!oldProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const { currentStock, expiryDate, ...updateData } = req.body;

        // deduct raw materials only if stock increased
        if (currentStock > oldProduct.currentStock) {
            const stockIncrease = currentStock - oldProduct.currentStock;
            await deductRawMaterials(oldProduct.rawMaterialRecipe, stockIncrease);
        }

        // calculate expiry status
        let status = oldProduct.status;
        if (expiryDate) {
            const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            status = daysUntilExpiry <= 10 ? "Expiring Soon" : "Active";
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...updateData, currentStock, expiryDate, status },
            { new: true, runValidators: true }
        );

        // inventory history tracking
        await addInventoryHistory(oldProduct, product);

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

// ------------------ Delete product ------------------
// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // ------------------ 🆕 Add inventory history for deletion ------------------
        await addInventoryHistory(product, {
            ...product.toObject(),   // preserve all fields
            currentStock: 0          // newStock = 0 because product is removed
        }, "Removed");               // explicitly set changeType to "Removed"

        // Delete the product
        await product.deleteOne();

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

