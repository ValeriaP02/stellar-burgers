import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../services/store';
import { fetchMyOrders } from '../../services/slices/orderSlice';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector((state: RootState) => state.orders.myOrders);
  const loading = useSelector(
    (state: RootState) => state.orders.loadingMyOrders
  );
  const error = useSelector((state: RootState) => state.orders.error);

  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    console.log('ProfileOrders auth:', { isAuthenticated, user });
    if (isAuthenticated && user) {
      console.log('dispatch fetchMyOrders');
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isAuthenticated, user]);

  if (loading) return <Preloader />;
  if (error) return <p>Error: {error}</p>;

  return <ProfileOrdersUI orders={orders} />;
};
