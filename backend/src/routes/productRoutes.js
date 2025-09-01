import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCustomerCatalog,
} from '../controllers/productController.js';

const router = express.Router();

// Customer-facing catalog (only public fields, grouped by category)
router.get('/customer', getCustomerCatalog);   // <-- add this ABOVE '/:id'


router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

export default router;