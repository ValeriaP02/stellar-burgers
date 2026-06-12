import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useNavigate } from 'react-router-dom';
import { RootState, useDispatch, useSelector } from '../../services/store';

import {
  selectConstructorItems,
  selectOrderRequest,
  createOrder,
  clearConstructor
} from '../../services/slices/constructorSlice';
import { selectUser } from '../../services/slices/authSlice';
import { selectCurrentOrder } from '../../services/slices/orderSlice';
import { useLocation } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const user = useSelector(selectUser);
  const orderModalData = useSelector(selectCurrentOrder);
  const location = useLocation();

  const onOrderClick = async () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const ingredientIds = [
      ...(constructorItems.bun ? [constructorItems.bun._id] : []),
      ...constructorItems.ingredients.map((i) => i._id)
    ];

    const result = await dispatch(createOrder(ingredientIds)).unwrap();
    dispatch(clearConstructor());
    navigate(`/feed/${result.number}`);
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
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={() => dispatch(clearConstructor())}
    />
  );
};
