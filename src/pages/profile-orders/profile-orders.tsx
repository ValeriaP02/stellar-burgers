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

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (loading) return <Preloader />;
  if (error) return <p>Error: {error}</p>;

  return <ProfileOrdersUI orders={orders} />;
};
