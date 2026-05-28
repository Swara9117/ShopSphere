const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  const products = await Product.find({});
  const users = await User.countDocuments({ isAdmin: false });

  const totalSales = orders
    .filter((o) => o.isPaid)
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const salesByMonth = {};
  orders.forEach((order) => {
    if (!order.isPaid) return;
    const month = new Date(order.createdAt).toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });
    salesByMonth[month] = (salesByMonth[month] || 0) + order.totalPrice;
  });

  const lowStock = products.filter((p) => p.countInStock < 10);

  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalOrders: orders.length,
    totalProducts: products.length,
    totalUsers: users,
    totalSales,
    salesByMonth,
    lowStock,
    ordersByStatus,
    recentOrders: orders.slice(0, 5),
  });
});

module.exports = { getAnalytics };
