const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    populate: { path: 'shopkeeper', select: 'name' },
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.countInStock < qty) {
    res.status(400);
    throw new Error(`Only ${product.countInStock} items in stock`);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const existing = user.cart.find((item) => item.product.toString() === productId);

  const newQty = existing ? existing.qty + qty : qty;
  if (newQty > product.countInStock) {
    res.status(400);
    throw new Error(`Only ${product.countInStock} items in stock`);
  }

  if (existing) {
    existing.qty = newQty;
  } else {
    user.cart.push({ product: productId, qty });
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate({
    path: 'cart.product',
    populate: { path: 'shopkeeper', select: 'name' },
  });
  res.json(populated.cart);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const item = user.cart.find((i) => i.product.toString() === req.params.productId);

  if (item) {
    const qty = Number(req.body.qty);
    const product = await Product.findById(req.params.productId);
    if (product && qty > product.countInStock) {
      res.status(400);
      throw new Error(`Only ${product.countInStock} items in stock`);
    }
    item.qty = qty;
    if (item.qty <= 0) {
      user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    }
    await user.save();
    const populated = await User.findById(req.user._id).populate({
    path: 'cart.product',
    populate: { path: 'shopkeeper', select: 'name' },
  });
    res.json(populated.cart);
  } else {
    res.status(404);
    throw new Error('Item not in cart');
  }
});

const removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
  await user.save();
  const populated = await User.findById(req.user._id).populate({
    path: 'cart.product',
    populate: { path: 'shopkeeper', select: 'name' },
  });
  res.json(populated.cart);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
