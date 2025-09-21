import Product from '../models/productModel.js';
import RawMaterial from '../models/rawMaterialModel.js';
import upload from '../middleware/uploadMiddleware.js';
import path from 'path';
import fs from 'fs';
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

        // Check raw materials BEFORE creating product
        if (currentStock > 0) {
            try {
                // Validate raw materials first
                await deductRawMaterials(rawMaterialRecipe, currentStock);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
        }

        // Only create product if raw material check passes
        const product = await Product.create({
            ...productData,
            currentStock: currentStock || 0,
            rawMaterialRecipe
        });

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

// ------------------ Image upload endpoint ------------------
export const uploadProductImage = (req, res) => {
    // Use multer middleware
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size too large. Maximum size is 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Return the file path that can be used in the database
        const imageUrl = `/uploads/products/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    });
};

// ------------------ Delete product image ------------------
export const deleteProductImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(process.cwd(), 'uploads', 'products', filename);
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ------------------ Customer-facing product functions ------------------

// GET ALL AVAILABLE PRODUCTS (CUSTOMER VIEW)
export const getAvailableProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        // Build filter query - only active products with available stock
        const filter = {
            status: { $in: ['Active', 'Expiring Soon'] },
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
            .select('productId productName description category unit price currentStock safetyStock expiryDate status imageUrl')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        
        // Calculate available stock (currentStock - safetyStock) for customers
        const productsWithAvailableStock = products.map(product => ({
            ...product.toObject(),
            availableStock: Math.max(0, product.currentStock - (product.safetyStock || 0))
        }));
        
        res.status(200).json({
            success: true,
            count: productsWithAvailableStock.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
            data: productsWithAvailableStock
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
            .select('productId productName description category unit price currentStock safetyStock expiryDate status imageUrl');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Calculate available stock for customer
        const productWithAvailableStock = {
            ...product.toObject(),
            availableStock: Math.max(0, product.currentStock - (product.safetyStock || 0))
        };
        
        res.status(200).json({
            success: true,
            data: productWithAvailableStock
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
            status: { $in: ['Active', 'Expiring Soon'] },
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
            status: { $in: ['Active', 'Expiring Soon'] },
            currentStock: { $gt: 0 },
            $or: [
                { productName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        })
        .select('productId productName description category unit price currentStock safetyStock status imageUrl')
        .sort({ productName: 1 })
        .limit(20);
        
        // Calculate available stock for customers
        const productsWithAvailableStock = products.map(product => ({
            ...product.toObject(),
            availableStock: Math.max(0, product.currentStock - (product.safetyStock || 0))
        }));
        
        res.status(200).json({
            success: true,
            count: productsWithAvailableStock.length,
            searchQuery: query,
            data: productsWithAvailableStock
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

