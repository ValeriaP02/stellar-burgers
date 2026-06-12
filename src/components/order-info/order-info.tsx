import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';

import { useDispatch, useSelector } from '../../services/store';
import {
  fetchOrderById,
  selectCurrentOrder,
  selectOrderLoadingState,
  selectOrdersError
} from '../../services/slices/orderSlice';

import {
  fetchIngredients,
  selectIngredients
} from '../../services/slices/ingredientsSlice';

import { TIngredient } from '@utils-types';

type IngredientsInfo = Record<string, TIngredient & { count: number }>;

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const dispatch = useDispatch();

  const currentOrder = useSelector(selectCurrentOrder);
  const isLoading = useSelector(selectOrderLoadingState);
  const ingredients = useSelector(selectIngredients);

  useEffect(() => {
    if (ingredients.length === 0) dispatch(fetchIngredients());
  }, [dispatch, ingredients.length]);

  useEffect(() => {
    if (!number) return;
    const n = Number(number);
    if (Number.isNaN(n)) return;
    dispatch(fetchOrderById(n));
  }, [dispatch, number]);

  const orderInfo = useMemo(() => {
    if (!currentOrder) return null;

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc, ingredientId) => {
        const ingredient = ingredients.find((ing) => ing._id === ingredientId);
        if (!ingredient) return acc;

        const existing = acc[ingredientId];
        acc[ingredientId] = existing
          ? { ...existing, count: existing.count + 1 }
          : { ...ingredient, count: 1 };

        return acc;
      },
      {} as IngredientsInfo
    );

    const total = Object.values(ingredientsInfo).reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    return {
      ...currentOrder,
      ingredientsInfo,
      date: new Date(currentOrder.createdAt),
      total
    };
  }, [currentOrder, ingredients]);

  if (isLoading || !currentOrder || !orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
