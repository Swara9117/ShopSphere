import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function HomePage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const featured = products.slice(0, 4);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Welcome to ShopSphere</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Discover premium products with fast delivery, secure checkout, and seamless shopping.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary-700 hover:bg-primary-50"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Featured Products</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
