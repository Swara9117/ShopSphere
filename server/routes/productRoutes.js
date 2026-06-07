const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/mine', protect, admin, getMyProducts);
router.route('/').get(getProducts).post(protect, admin, upload.array('images', 5), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
