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

const buildOrderForShopkeeper = (shopkeeperId, shopkeeperName, items, userId, shippingAddress, paymentMethod) => {
  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  return new Order({
    orderItems: items,
    user: userId,
    shopkeeper: shopkeeperId,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: 'pending',
    isPaid: false,
  });
};

const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems?.length) {
    res.status(400);
    throw new Error('No order items');
  }

  const grouped = {};

  for (const item of orderItems) {
    const product = await Product.findById(item.product).populate('shopkeeper', 'name');
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (!product.shopkeeper) {
      res.status(400);
      throw new Error(`Product "${product.name}" has no shopkeeper assigned`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Only ${product.countInStock} left`);
    }

    const shopkeeperId = product.shopkeeper._id.toString();
    if (!grouped[shopkeeperId]) {
      grouped[shopkeeperId] = {
        shopkeeperId: product.shopkeeper._id,
        shopkeeperName: product.shopkeeper.name,
        items: [],
      };
    }

    grouped[shopkeeperId].items.push({
      name: product.name,
      qty: item.qty,
      image: product.images?.[0] || product.image,
      price: product.price,
      product: product._id,
      shopkeeperName: product.shopkeeper.name,
    });
  }

  const createdOrders = [];

  for (const group of Object.values(grouped)) {
    const order = buildOrderForShopkeeper(
      group.shopkeeperId,
      group.shopkeeperName,
      group.items,
      req.user._id,
      shippingAddress,
      paymentMethod
    );

    for (const item of group.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    createdOrders.push(await order.save());
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.cart = [];
    await user.save();
  }

  const populated = await Order.find({ _id: { $in: createdOrders.map((o) => o._id) } })
    .populate('shopkeeper', 'name')
    .populate('user', 'name email');

  res.status(201).json(populated.length === 1 ? populated[0] : { orders: populated });
});

const orderAccessible = (order, user) => {
  const isCustomer = order.user?._id?.toString() === user._id.toString() || order.user?.toString() === user._id.toString();
  const isShopkeeper =
    user.isAdmin &&
    (order.shopkeeper?._id?.toString() === user._id.toString() ||
      order.shopkeeper?.toString() === user._id.toString());
  return isCustomer || isShopkeeper;
};

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('shopkeeper', 'name email');
  if (order) {
    if (orderAccessible(order, req.user)) {
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
  const orders = await Order.find({ user: req.user._id })
    .populate('shopkeeper', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ shopkeeper: req.user._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.shopkeeper.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

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
