import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, clearOrder } from '../slices/orderSlice';
import Loader from '../components/Loader';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearOrder());
  }, [dispatch, id]);

  if (loading) return <Loader />;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/orders" className="text-primary-600 hover:underline">
        &larr; Back to Orders
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
      <span
        className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}
      >
        {order.status}
      </span>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Order Items</h2>
          <ul className="mt-4 space-y-2">
            {order.orderItems.map((item) => (
              <li key={item.product} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.qty}
                </span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Shipping</h2>
          <p className="mt-2 text-sm text-gray-600">
            {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>
          <h2 className="mt-6 font-semibold">Payment</h2>
          <p className="text-sm text-gray-600">
            {order.paymentMethod} — {order.isPaid ? 'Paid' : 'Not paid'}
          </p>
          <p className="mt-4 text-xl font-bold">Total: ${order.totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
