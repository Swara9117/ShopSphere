import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) dispatch(fetchWishlist());
  }, [dispatch, userInfo]);

  if (!userInfo) {
    return (
      <div className="py-16 text-center">
        <p className="muted">Please sign in to view your wishlist.</p>
        <Link to="/login" className="mt-4 inline-block text-primary-600 hover:underline dark:text-primary-400">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="muted">Your wishlist is empty.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
