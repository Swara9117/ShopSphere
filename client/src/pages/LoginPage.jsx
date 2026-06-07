import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../slices/authSlice';
import Message from '../components/Message';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate(userInfo.isAdmin ? '/admin' : '/');
    return () => dispatch(clearError());
  }, [userInfo, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password, role }));
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">Sign In</h1>
      <p className="mb-8 text-center text-sm muted">Select your account type to continue</p>
      {error && <Message>{error}</Message>}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`rounded-xl border-2 p-4 text-left transition ${
            role === 'customer'
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
              : 'border-gray-200 dark:border-gray-600'
          }`}
        >
          <p className="font-semibold">Customer</p>
          <p className="mt-1 text-xs muted">Shop & track orders</p>
        </button>
        <button
          type="button"
          onClick={() => setRole('shopkeeper')}
          className={`rounded-xl border-2 p-4 text-left transition ${
            role === 'shopkeeper'
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
              : 'border-gray-200 dark:border-gray-600'
          }`}
        >
          <p className="font-semibold">Shopkeeper</p>
          <p className="mt-1 text-xs muted">Manage your store</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : role === 'shopkeeper' ? 'Sign In as Shopkeeper' : 'Sign In as Customer'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm muted">
        New here?{' '}
        <Link to="/register" className="text-primary-600 hover:underline dark:text-primary-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
