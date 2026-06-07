import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaHeart, FaStore, FaMoon, FaSun } from 'react-icons/fa';
import { logout } from '../slices/authSlice';
import { clearCart } from '../slices/cartSlice';
import { clearWishlist } from '../slices/wishlistSlice';
import { toggleTheme } from '../slices/themeSlice';

export default function Header() {
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
          <FaStore />
          ShopSphere
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
            Home
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
            Products
          </Link>
          {userInfo?.isAdmin && (
            <Link to="/admin" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              Shopkeeper Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
          >
            {mode === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {userInfo && (
            <Link to="/wishlist" className="relative text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              <FaHeart className="text-xl" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
            <FaShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                <FaUser />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
