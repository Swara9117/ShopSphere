import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { toggleWishlist } from '../slices/wishlistSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { items: wishlist } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlist.some((p) => p._id === product._id);

  const handleAddToCart = () => {
    if (!userInfo) return alert('Please sign in to add items to cart');
    dispatch(addToCart({ productId: product._id, qty: 1 }));
  };

  const handleWishlist = () => {
    if (!userInfo) return alert('Please sign in to use wishlist');
    dispatch(toggleWishlist(product._id));
  };

  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover transition group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <p className="text-xs font-medium uppercase text-primary-600">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-1 font-semibold text-gray-900 hover:text-primary-600">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">
            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <FaShoppingCart /> Add
          </button>
          <button
            onClick={handleWishlist}
            className={`rounded-lg border px-3 py-2 ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300'}`}
          >
            <FaHeart />
          </button>
        </div>
      </div>
    </div>
  );
}
