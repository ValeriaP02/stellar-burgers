import React, { FC, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';

import {
  selectConstructorItems,
  selectOrderRequest,
  createOrder,
  clearConstructor,
  selectOrderModalData
} from '../../services/slices/constructorSlice';
import { selectUser } from '../../services/slices/authSlice';

import { BurgerConstructorUI } from '@ui';
import { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const user = useSelector(selectUser);
  const orderModalData = useSelector(selectOrderModalData);

  const onOrderClick = async () => {
    if (!constructorItems?.bun || orderRequest) return;

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id
    ];

    const result = await dispatch(createOrder(ingredientIds)).unwrap();
    dispatch(clearConstructor());
    navigate(`/feed/${result.number}`, { state: { background: location } });
  };

  const price = useMemo(() => {
    const bunPrice = constructorItems.bun ? constructorItems.bun.price * 2 : 0;

    const ingredientsPrice = (constructorItems.ingredients || []).reduce(
      (total: number, ingredient: TConstructorIngredient) =>
        total + ingredient.price,
      0
    );

    return bunPrice + ingredientsPrice;
  }, [constructorItems]);

  if (!constructorItems) return null;

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      onOrderClick={onOrderClick}
      closeOrderModal={() => dispatch(clearConstructor())}
      orderModalData={orderModalData}
    />
  );
};
