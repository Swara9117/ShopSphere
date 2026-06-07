import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartQty, removeFromCart } from '../slices/cartSlice';
import Loader from '../components/Loader';
import { getProductImage, getShopkeeperName } from '../utils/productImage';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) dispatch(fetchCart());
  }, [dispatch, userInfo]);

  const subtotal = items.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.qty,
    0
  );

  if (!userInfo) {
    return (
      <div className="py-16 text-center">
        <p className="muted">Please sign in to view your cart.</p>
        <Link to="/login" className="mt-4 inline-block text-primary-600 hover:underline dark:text-primary-400">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>
      {items.length === 0 ? (
        <p className="muted">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="card flex items-center gap-4 p-4"
              >
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  className="h-20 w-20 rounded object-cover"
                />
                <div className="flex-1">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="font-medium hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs muted">Sold by {getShopkeeperName(item.product)}</p>
                  <p className="text-primary-600 dark:text-primary-400">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <select
                  value={item.qty}
                  onChange={(e) =>
                    dispatch(
                      updateCartQty({ productId: item.product._id, qty: Number(e.target.value) })
                    )
                  }
                  className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {[...Array(10).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => dispatch(removeFromCart(item.product._id))}
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="card mt-8 p-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-4 w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
