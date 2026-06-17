import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/authSlice';

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false
}: {
  children: React.ReactElement;
  onlyUnAuth?: boolean;
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (onlyUnAuth && user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
