import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../slices/orderSlice';
import Loader from '../components/Loader';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/order/${order._id}`}
              className="card block p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-6)}</p>
                  <p className="text-sm muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                    {order.shopkeeper?.name && ` · ${order.shopkeeper.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.totalPrice.toFixed(2)}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
