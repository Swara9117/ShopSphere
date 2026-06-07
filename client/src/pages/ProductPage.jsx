import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearProduct } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { toggleWishlist } from '../slices/wishlistSlice';
import { getProductImage, getShopkeeperName } from '../utils/productImage';
import Loader from '../components/Loader';
import Message from '../components/Message';

export default function ProductPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  const { items: wishlist } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearProduct());
  }, [dispatch, id]);

  const isWishlisted = product && wishlist.some((p) => p._id === product._id);
  const images = product?.images?.length ? product.images : [getProductImage(product)];

  const handleAddToCart = () => {
    if (!userInfo) return navigate('/login');
    dispatch(addToCart({ productId: product._id, qty }));
  };

  if (loading) return <Loader />;
  if (error) return <Message>{error}</Message>;
  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img
            src={images[activeImage]}
            alt={product.name}
            className="w-full rounded-xl object-cover"
          />
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 rounded-lg border-2 ${activeImage === i ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-primary-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-sm">
            Sold by <span className="font-medium">{getShopkeeperName(product)}</span>
          </p>
          <p className="mt-4 muted">{product.description}</p>
          <p className="mt-6 text-3xl font-bold">${product.price.toFixed(2)}</p>
          <p className="mt-2 text-sm muted">
            Status: {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>

          {product.countInStock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="input w-auto"
              >
                {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>
                    {x + 1}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddToCart}
                className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700"
              >
                Add to Cart
              </button>
              {userInfo && (
                <button
                  onClick={() => dispatch(toggleWishlist(product._id))}
                  className={`rounded-lg border px-4 py-2 dark:border-gray-600 ${isWishlisted ? 'border-red-300 text-red-500 dark:border-red-700' : ''}`}
                >
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
