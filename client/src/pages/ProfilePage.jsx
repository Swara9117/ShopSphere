import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProfilePage() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Profile</h1>
      <div className="card p-6">
        <p>
          <span className="font-medium">Name:</span> {userInfo?.name}
        </p>
        <p className="mt-2">
          <span className="font-medium">Email:</span> {userInfo?.email}
        </p>
        <p className="mt-2">
          <span className="font-medium">Account type:</span>{' '}
          {userInfo?.isAdmin ? 'Shopkeeper' : 'Customer'}
        </p>
        {!userInfo?.isAdmin && (
        <Link
          to="/orders"
          className="mt-6 inline-block text-primary-600 hover:underline dark:text-primary-400"
        >
          View My Orders &rarr;
        </Link>
        )}
        {userInfo?.isAdmin && (
          <Link
            to="/admin"
            className="mt-6 inline-block text-primary-600 hover:underline dark:text-primary-400"
          >
            Go to Shopkeeper Dashboard &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
