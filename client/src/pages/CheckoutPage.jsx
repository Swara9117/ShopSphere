import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../slices/orderSlice';
import { clearCart } from '../slices/cartSlice';
import Message from '../components/Message';

export default function CheckoutPage() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { loading, error } = useSelector((state) => state.orders);

  const itemsPrice = items.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.qty,
    0
  );
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderItems = items.map((item) => ({
      name: item.product.name,
      qty: item.qty,
      image: item.product.image,
      price: item.product.price,
      product: item.product._id,
    }));

    const result = await dispatch(
      createOrder({
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
      })
    );

    if (createOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      navigate(`/order/${result.payload._id}`);
    }
  };

  if (items.length === 0) {
    return <p className="py-16 text-center text-gray-500">No items to checkout.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>
      {error && <Message>{error}</Message>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
        <input
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          className="w-full rounded-lg border px-4 py-2"
        />
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full rounded-lg border px-4 py-2"
        >
          <option value="Razorpay">Razorpay</option>
          <option value="COD">Cash on Delivery</option>
        </select>

        <div className="rounded-lg bg-gray-50 p-4">
          <p>Items: ${itemsPrice.toFixed(2)}</p>
          <p>Tax: ${taxPrice.toFixed(2)}</p>
          <p>Shipping: ${shippingPrice.toFixed(2)}</p>
          <p className="mt-2 text-lg font-bold">Total: ${totalPrice.toFixed(2)}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
