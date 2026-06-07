import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchAllOrders, updateOrderStatus } from '../slices/orderSlice';
import {
  fetchMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError as clearProductError,
} from '../slices/productSlice';
import { getProductImage } from '../utils/productImage';
import Loader from '../components/Loader';
import Message from '../components/Message';

const TABS = ['Analytics', 'Products', 'Orders'];
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'General'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const MAX_IMAGES = 5;

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'General',
  brand: '',
  countInStock: '',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('Analytics');
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const dispatch = useDispatch();
  const { analytics, adminOrders, adminLoading, error: orderError } = useSelector(
    (state) => state.orders
  );
  const { myProducts, adminLoading: productLoading, error: productError } = useSelector(
    (state) => state.products
  );

  const error = orderError || productError;
  const loading = adminLoading || productLoading;

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchMyProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setShowForm(false);
    setNewImages([]);
    setExistingImages([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    dispatch(clearProductError());
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newImages.length + files.length;
    if (total > MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images total`);
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[existingImages.length + index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== existingImages.length + index));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('brand', form.brand);
    formData.append('countInStock', form.countInStock);
    if (editingId) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }
    newImages.forEach((file) => formData.append('images', file));
    return formData;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      alert('Please upload at least one product image');
      return;
    }

    const formData = buildFormData();
    const result = editingId
      ? await dispatch(updateProduct({ id: editingId, formData }))
      : await dispatch(createProduct(formData));

    if ((editingId ? updateProduct : createProduct).fulfilled.match(result)) {
      resetForm();
      dispatch(fetchAnalytics());
      dispatch(fetchMyProducts());
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      brand: product.brand || '',
      countInStock: String(product.countInStock),
    });
    setExistingImages(product.images || []);
    setNewImages([]);
    setImagePreviews([]);
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) {
      dispatch(fetchAnalytics());
    }
  };

  const handleStatusChange = async (orderId, status) => {
    const payload = { id: orderId, status };
    if (status === 'delivered') payload.isDelivered = true;
    if (status === 'processing') payload.isPaid = true;
    await dispatch(updateOrderStatus(payload));
    dispatch(fetchAnalytics());
  };

  if (tab === 'Analytics' && adminLoading && !analytics) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shopkeeper Dashboard</h1>
          <p className="text-sm muted">Manage your products, orders, and sales</p>
        </div>
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <Message>{error}</Message>}

      {tab === 'Analytics' && analytics && (
        <div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Your Sales', value: `$${analytics.totalSales.toFixed(2)}` },
              { label: 'Your Orders', value: analytics.totalOrders },
              { label: 'Your Products', value: analytics.totalProducts },
              { label: 'Platform Customers', value: analytics.totalUsers },
            ].map((stat) => (
              <div key={stat.label} className="card rounded-xl p-6">
                <p className="text-sm muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="card rounded-xl p-6">
              <h2 className="mb-4 font-semibold">Sales by Month</h2>
              {Object.entries(analytics.salesByMonth).map(([month, amount]) => (
                <div key={month} className="flex justify-between border-b py-2 text-sm dark:border-gray-700">
                  <span>{month}</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(analytics.salesByMonth).length === 0 && (
                <p className="text-sm muted">No paid orders yet.</p>
              )}
            </div>

            <div className="card rounded-xl p-6">
              <h2 className="mb-4 font-semibold">Orders by Status</h2>
              {Object.entries(analytics.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between border-b py-2 text-sm dark:border-gray-700">
                  <span className="capitalize">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(analytics.ordersByStatus || {}).length === 0 && (
                <p className="text-sm muted">No orders yet.</p>
              )}
            </div>

            <div className="card rounded-xl p-6">
              <h2 className="mb-4 font-semibold">Low Stock Alert</h2>
              {analytics.lowStock.length === 0 ? (
                <p className="text-sm muted">All your products are well stocked.</p>
              ) : (
                analytics.lowStock.map((p) => (
                  <div key={p._id} className="flex justify-between border-b py-2 text-sm dark:border-gray-700">
                    <span>{p.name}</span>
                    <span className="text-red-600">{p.countInStock} left</span>
                  </div>
                ))
              )}
            </div>

            <div className="card rounded-xl p-6">
              <h2 className="mb-4 font-semibold">Recent Orders</h2>
              {(analytics.recentOrders || []).length === 0 ? (
                <p className="text-sm muted">No orders yet.</p>
              ) : (
                analytics.recentOrders.map((order) => (
                  <div key={order._id} className="flex justify-between border-b py-2 text-sm dark:border-gray-700">
                    <span>#{order._id.slice(-6)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'Products' && (
        <div>
          <div className="mb-6 flex justify-between">
            <h2 className="text-lg font-semibold">Your Products ({myProducts.length})</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleProductSubmit} className="card mb-8 rounded-xl p-6">
              <h3 className="mb-4 font-semibold">{editingId ? 'Edit Product' : 'New Product'}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input"
                />
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Stock quantity"
                  value={form.countInStock}
                  onChange={(e) => setForm({ ...form, countInStock: e.target.value })}
                  required
                  className="input"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="col-span-full">
                  <label className="mb-2 block text-sm font-medium">
                    Product Images ({existingImages.length + newImages.length}/{MAX_IMAGES})
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={existingImages.length + newImages.length >= MAX_IMAGES}
                    className="input"
                  />
                  <p className="mt-1 text-xs muted">Upload up to 5 images. First image is the cover.</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {existingImages.map((src, i) => (
                      <div key={`existing-${i}`} className="relative">
                        <img src={src} alt="" className="h-20 w-20 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {imagePreviews.slice(existingImages.length).map((src, i) => (
                      <div key={`new-${i}`} className="relative">
                        <img src={src} alt="" className="h-20 w-20 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="input col-span-full"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-6 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="card overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((product) => (
                  <tr key={product._id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={product.countInStock < 10 ? 'font-medium text-red-600' : ''}>
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myProducts.length === 0 && (
              <p className="p-8 text-center muted">
                No products yet. Add your first product to start selling.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === 'Orders' && (
        <div>
          <h2 className="mb-6 text-lg font-semibold">Your Orders ({adminOrders.length})</h2>
          {adminLoading && adminOrders.length === 0 ? (
            <Loader />
          ) : (
            <div className="card overflow-x-auto rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map((order) => (
                    <tr key={order._id} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3 font-mono">#{order._id.slice(-6)}</td>
                      <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {order.paymentMethod}
                        <span className="ml-1 text-xs muted">
                          ({order.isPaid ? 'Paid' : 'Unpaid'})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adminOrders.length === 0 && (
                <p className="p-8 text-center muted">No orders for your products yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
