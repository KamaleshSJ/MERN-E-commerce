import express from 'express'
import { createProduct, deleteProduct, getAllproducts, getSingleproduct, updateProduct,  } from '../controller/productController.js';
const router = express.Router();
// import { verifyUserAuth } from '../middleware/userAuth.js';

router.route('/products').get(getAllproducts).post(createProduct);
router.route('/product/:id').put(updateProduct).delete(deleteProduct).get(getSingleproduct)


export default router;