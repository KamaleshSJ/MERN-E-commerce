import express from 'express'
import { createProduct, createReviewForProduct, deleteProduct, deleteProductReview, getAdminProducts, getAllproducts, getProductReviews, getSingleproduct, updateProduct,  } from '../controller/productController.js';
const router = express.Router();
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';

router.route('/products').get(getAllproducts);
router.route('/admin/products').get(verifyUserAuth,roleBasedAccess("admin"),getAdminProducts);
router.route('/admin/product/create').post(verifyUserAuth,roleBasedAccess("admin"),createProduct);
router.route('/admin/product/:id').put(verifyUserAuth,roleBasedAccess("admin"),updateProduct).delete(verifyUserAuth,roleBasedAccess("admin"),deleteProduct)
router.route('/product/:id').get(getSingleproduct)
router.route('/review').put(verifyUserAuth,createReviewForProduct)
router.route('/reviews').get(getProductReviews).delete(verifyUserAuth,deleteProductReview)



export default router;