const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
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

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const existing = user.cart.find((item) => item.product.toString() === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    user.cart.push({ product: productId, qty });
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate('cart.product');
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
    item.qty = Number(req.body.qty);
    if (item.qty <= 0) {
      user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    }
    await user.save();
    const populated = await User.findById(req.user._id).populate('cart.product');
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
  const populated = await User.findById(req.user._id).populate('cart.product');
  res.json(populated.cart);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
