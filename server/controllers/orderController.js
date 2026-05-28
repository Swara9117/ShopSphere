const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Razorpay = require('razorpay');

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems?.length) {
    res.status(400);
    throw new Error('No order items');
  }

  const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock -= item.qty;
      await product.save();
    }
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.cart = [];
    await user.save();
  }

  const created = await order.save();
  res.status(201).json(created);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    const orderUserId = order.user?._id?.toString();
    if ((orderUserId && orderUserId === req.user._id.toString()) || req.user.isAdmin) {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('Not authorized');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    if (req.body.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'delivered';
    }
    if (req.body.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const razorpay = getRazorpay();
  const paymentOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'INR',
    receipt: order._id.toString(),
  });

  res.json({
    orderId: paymentOrder.id,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const crypto = require('crypto');
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected === razorpay_signature) {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString(),
    };
    order.status = 'processing';
    await order.save();
    res.json({ message: 'Payment successful', order });
  } else {
    res.status(400);
    throw new Error('Invalid payment signature');
  }
});

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
};
