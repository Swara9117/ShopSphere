import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) return <Navigate to="/login" replace />;
  if (adminOnly && !userInfo.isAdmin) return <Navigate to="/" replace />;

  return children;
}
