import { FC, useMemo, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';

import { TIngredient } from '@utils-types';
import { useSelector, useDispatch } from '../../services/store';
import {
  selectCurrentOrder,
  fetchOrderById
} from '../../services/slices/orderSlice';
import { useParams } from 'react-router-dom';

import { selectIngredients } from '../../services/slices/ingredientsSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams<{ number: string }>();
  console.log('route param id=', number);

  const orderData = useSelector(selectCurrentOrder);
  const ingredients = useSelector(selectIngredients);

  useEffect(() => {
    if (number) dispatch(fetchOrderById(number));
  }, [dispatch, number]);

  const orderInfo = useMemo(() => {
    if (!orderData) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce<TIngredientsWithCount>(
      (acc, item) => {
        const ingredient = ingredients.find((ing) => ing._id === item);
        if (!ingredient) return acc;

        if (!acc[item]) acc[item] = { ...ingredient, count: 1 };
        else acc[item].count += 1;

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    return { ...orderData, ingredientsInfo, date, total };
  }, [orderData, ingredients]);

  if (!orderInfo) return <Preloader />;
  console.log(
    'fetching order by number =',
    number,
    'as Number =',
    Number(number)
  );

  return <OrderInfoUI orderInfo={orderInfo} />;
};
