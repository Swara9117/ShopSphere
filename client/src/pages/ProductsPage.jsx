import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category !== 'All') params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    dispatch(fetchProducts(params));
  }, [dispatch, keyword, category, minPrice, maxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Products</h1>

      <div className="mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="input min-w-[200px] flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input w-auto"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="input w-24"
        />
        <input
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="input w-24"
        />
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-center muted">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
