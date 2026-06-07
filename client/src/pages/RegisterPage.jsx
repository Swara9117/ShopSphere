import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../slices/authSlice';
import Message from '../components/Message';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.isAdmin ? '/admin' : '/');
    }
    return () => dispatch(clearError());
  }, [userInfo, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setMessage('');
    dispatch(register({ name, email, password, role }));
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold">Create Account</h1>
      <p className="mb-8 text-center text-sm muted">Choose how you want to use ShopSphere</p>
      {(error || message) && <Message>{error || message}</Message>}

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
          <p className="mt-1 text-xs muted">Browse and buy products</p>
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
          <p className="mt-1 text-xs muted">Sell products & manage store</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading
            ? 'Creating account...'
            : role === 'shopkeeper'
              ? 'Register as Shopkeeper'
              : 'Register as Customer'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">
          Sign In
        </Link>
      </p>
    </div>
  );
}
