import { TOrder, TOrderNumberResponse } from '@utils-types';

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrderNumberResponse | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
