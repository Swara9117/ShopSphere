const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.route('/:productId').put(updateCartItem).delete(removeFromCart);

module.exports = router;
