const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const populateShopkeeper = { path: 'shopkeeper', select: 'name email' };

const assertOwner = (product, user, res) => {
  if (product.shopkeeper.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this product');
  }
};

const removeImageFile = (imagePath) => {
  if (!imagePath?.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const price = Object.keys(priceFilter).length ? { price: priceFilter } : {};

  const filter = { ...keyword, ...category, ...price };

  const products = await Product.find(filter).populate(populateShopkeeper).sort({ createdAt: -1 });
  res.json(products);
});

const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ shopkeeper: req.user._id })
    .populate(populateShopkeeper)
    .sort({ createdAt: -1 });
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(populateShopkeeper);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, brand, countInStock } = req.body;
  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`);

  if (!name || price == null || !description || !category) {
    res.status(400);
    throw new Error('Please provide name, price, description, and category');
  }
  if (uploadedImages.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one product image (max 5)');
  }

  const product = await Product.create({
    name,
    price: Number(price),
    description,
    category,
    brand: brand || '',
    images: uploadedImages.slice(0, 5),
    countInStock: Number(countInStock) || 0,
    shopkeeper: req.user._id,
  });

  const populated = await Product.findById(product._id).populate(populateShopkeeper);
  res.status(201).json(populated);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  assertOwner(product, req.user, res);

  let existingImages = [];
  if (req.body.existingImages) {
    try {
      existingImages = JSON.parse(req.body.existingImages);
    } catch {
      existingImages = [];
    }
  }

  const newImages = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const mergedImages = [...existingImages, ...newImages].slice(0, 5);

  if (mergedImages.length === 0) {
    res.status(400);
    throw new Error('Product must have at least one image');
  }

  const removedImages = product.images.filter((img) => !mergedImages.includes(img));
  removedImages.forEach(removeImageFile);

  product.name = req.body.name ?? product.name;
  product.description = req.body.description ?? product.description;
  product.category = req.body.category ?? product.category;
  product.brand = req.body.brand ?? product.brand;
  if (req.body.price != null) product.price = Number(req.body.price);
  if (req.body.countInStock != null) product.countInStock = Number(req.body.countInStock);
  product.images = mergedImages;

  const updated = await product.save();
  const populated = await Product.findById(updated._id).populate(populateShopkeeper);
  res.json(populated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  assertOwner(product, req.user, res);
  product.images.forEach(removeImageFile);
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

module.exports = {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
