import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector
} from '@reduxjs/toolkit';

import {
  TConstructorIngredient,
  TIngredient,
  TOrderCreateResponse,
  TOrderNumberResponse
} from '@utils-types';

import { orderBurgerApi } from '@api';
import { nanoid } from 'nanoid';

import { RootState } from '../../services/store';

interface ConstructorState {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  error: string | null;
  orderModalData: TOrderNumberResponse | null;
}

const initialState: ConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  error: null,
  orderModalData: null
};

export const createOrder = createAsyncThunk<
  TOrderNumberResponse,
  string[],
  { rejectValue: string }
>('constructor/createOrder', async (ingredientIds, { rejectWithValue }) => {
  try {
    const response: TOrderCreateResponse = await orderBurgerApi(ingredientIds);
    return response.order;
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Ошибка при создании заказа';
    return rejectWithValue(message);
  }
});

export const selectIngredientsCountByType = createSelector(
  [(state: RootState) => state.burgerConstructor.ingredients],
  (ingredients = []) => {
    const map: Record<string, number> = {};
    for (const item of ingredients) {
      map[item._id] = (map[item._id] ?? 0) + 1;
    }
    return map;
  }
);

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() } as TConstructorIngredient
      })
    },

    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (item) => item.id !== action.payload
      );
    },

    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const ingredients = [...state.ingredients];
      const [movedItem] = ingredients.splice(fromIndex, 1);
      ingredients.splice(toIndex, 0, movedItem);
      state.ingredients = ingredients;
    },

    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
      state.orderRequest = false;
      state.error = null;
      state.orderModalData = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload ?? 'Ошибка при создании заказа';
      });
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} = constructorSlice.actions;

export type { ConstructorState };

export const selectConstructorItems = (state: RootState) => ({
  bun: state.burgerConstructor.bun,
  ingredients: state.burgerConstructor.ingredients
});

export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor.orderRequest;

export const selectConstructorError = (state: RootState) =>
  state.burgerConstructor.error;

export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor.orderModalData;

export default constructorSlice.reducer;
