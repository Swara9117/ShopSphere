const express = require('express');
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).put(protect, admin, updateOrderStatus);
router.post('/:id/pay', protect, createRazorpayOrder);
router.post('/:id/verify', protect, verifyPayment);

module.exports = router;
