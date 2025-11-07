import express from 'express'
import { createProduct, deleteProduct, getAllproducts, getSingleproduct, updateProduct,  } from '../controller/productController.js';
const router = express.Router();
import { roleBasedAccess, verifyUserAuth } from '../middleware/userAuth.js';

router.route('/products').get(verifyUserAuth,getAllproducts).post(verifyUserAuth,roleBasedAccess("admin"),createProduct);
router.route('/product/:id').put(verifyUserAuth,roleBasedAccess("admin"),updateProduct).delete(roleBasedAccess("admin"),verifyUserAuth,deleteProduct).get(verifyUserAuth,getSingleproduct)



export default router;