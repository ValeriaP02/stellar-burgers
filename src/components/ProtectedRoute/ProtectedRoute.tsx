import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import {
  selectUser,
  selectIsAuthChecked,
  selectIsAuthenticated
} from '../../services/slices/authSlice';

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false
}: {
  children: React.ReactElement;
  onlyUnAuth?: boolean;
}) => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const location = useLocation();

  if (!isAuthChecked) return null;

  // только неавторизованные
  if (onlyUnAuth && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // только авторизованные
  if (!onlyUnAuth && !isAuthenticated) {
    return (
      <Navigate
        to='/login'
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  return children;
};
