import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { toggleWishlist } from '../slices/wishlistSlice';
import { getProductImage, getShopkeeperName } from '../utils/productImage';

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
    <div className="card group overflow-hidden transition hover:shadow-md">
      <Link to={`/product/${product._id}`}>
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="h-48 w-full object-cover transition group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <p className="text-xs font-medium uppercase text-primary-600">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-1 font-semibold hover:text-primary-600 dark:hover:text-primary-400">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs muted">Sold by {getShopkeeperName(product)}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <span className="text-sm muted">
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
            className={`rounded-lg border px-3 py-2 ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500 dark:border-red-700 dark:bg-red-900/30' : 'border-gray-200 text-gray-500 hover:border-red-300 dark:border-gray-600 dark:text-gray-400'}`}
          >
            <FaHeart />
          </button>
        </div>
      </div>
    </div>
  );
}
