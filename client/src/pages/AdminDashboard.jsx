import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../slices/orderSlice';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading || !analytics) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Sales', value: `$${analytics.totalSales.toFixed(2)}` },
          { label: 'Orders', value: analytics.totalOrders },
          { label: 'Products', value: analytics.totalProducts },
          { label: 'Users', value: analytics.totalUsers },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Sales by Month</h2>
          {Object.entries(analytics.salesByMonth).map(([month, amount]) => (
            <div key={month} className="flex justify-between border-b py-2 text-sm">
              <span>{month}</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
          ))}
          {Object.keys(analytics.salesByMonth).length === 0 && (
            <p className="text-sm text-gray-500">No sales data yet.</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Low Stock Alert</h2>
          {analytics.lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">All products well stocked.</p>
          ) : (
            analytics.lowStock.map((p) => (
              <div key={p._id} className="flex justify-between border-b py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-red-600">{p.countInStock} left</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
