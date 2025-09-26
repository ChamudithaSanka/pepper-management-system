import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCustomerCatalog,
    uploadProductImage,
    deleteProductImage,
    getAvailableProducts,
    getProductDetails,
    getProductCategories,
    searchProducts
} from '../controllers/productController.js';

const router = express.Router();

// Image upload endpoints
router.post('/upload-image', uploadProductImage);
router.delete('/images/:filename', deleteProductImage);

// Customer-facing endpoints
router.get('/customer', getCustomerCatalog);   // Legacy endpoint (grouped by category)
router.get('/available', getAvailableProducts); // New paginated endpoint
router.get('/categories', getProductCategories);
router.get('/search', searchProducts);

router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

// Customer product details (should be after /:id to avoid conflicts)
router.get('/details/:id', getProductDetails);

export default router;