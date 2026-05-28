import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProfilePage() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Profile</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p>
          <span className="font-medium">Name:</span> {userInfo?.name}
        </p>
        <p className="mt-2">
          <span className="font-medium">Email:</span> {userInfo?.email}
        </p>
        <p className="mt-2">
          <span className="font-medium">Role:</span> {userInfo?.isAdmin ? 'Admin' : 'Customer'}
        </p>
        <Link
          to="/orders"
          className="mt-6 inline-block text-primary-600 hover:underline"
        >
          View My Orders &rarr;
        </Link>
      </div>
    </div>
  );
}
