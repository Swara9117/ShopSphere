const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.wishlist);
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
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
  const index = user.wishlist.findIndex((id) => id.toString() === productId);

  if (index >= 0) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate('wishlist');
  res.json(populated.wishlist);
});

module.exports = { getWishlist, toggleWishlist };
