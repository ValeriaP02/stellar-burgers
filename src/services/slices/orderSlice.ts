import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getOrdersApi,
  orderBurgerApi,
  getOrderByNumberApi,
  getFeedsApi
} from '../../utils/burger-api';
import { TOrder, TOrderNumberResponse } from '../../utils/types';
import { RootState } from '../store';

interface OrdersState {
  feed: TOrder[];
  total: number;
  totalToday: number;
  myOrders: TOrder[];
  currentOrder: TOrder | null;
  orderRequest: boolean;

  isLoading: boolean;
  loadingFeed: boolean;
  loadingMyOrders: boolean;

  error: string | null;
}

const initialState: OrdersState = {
  feed: [],
  total: 0,
  totalToday: 0,
  myOrders: [],
  currentOrder: null,
  orderRequest: false,

  loadingFeed: false,
  loadingMyOrders: false,
  isLoading: false,

  error: null
};

const getErrorMessage = (payload: unknown, fallback: string) =>
  typeof payload === 'string' ? payload : fallback;

export const fetchOrders = createAsyncThunk<
  { orders: TOrder[]; total: number; totalToday: number },
  void,
  { rejectValue: string }
>('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await getFeedsApi();
    return data;
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : 'Ошибка загрузки заказов'
    );
  }
});

export const fetchMyOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string }
>('orders/fetchMyAll', async (_, { rejectWithValue }) => {
  try {
    const data: any = await getOrdersApi();

    return data?.orders ?? data;
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : 'Ошибка загрузки моих заказов'
    );
  }
});

export const createOrder = createAsyncThunk<
  TOrderNumberResponse,
  string[],
  { rejectValue: string }
>('orders/create', async (data, { rejectWithValue }) => {
  try {
    const response = await orderBurgerApi(data);
    return response.order;
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : 'Ошибка создания заказа'
    );
  }
});

export const fetchOrderById = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('orders/fetchByNumber', async (number, { rejectWithValue }) => {
  try {
    const data: any = await getOrderByNumberApi(number);

    const order = data?.orders?.[0] as TOrder | undefined;

    console.log('getOrderByNumberApi raw:', data);
    console.log('picked order:', order);

    if (!order) {
      return rejectWithValue(`Заказ number=${number} не найден (orders=[]).`);
    }

    return order;
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : `Ошибка загрузки заказа ${number}`
    );
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loadingFeed = true;
        state.error = null;
      })
      .addCase(
        fetchOrders.fulfilled,
        (
          state,
          action: PayloadAction<{
            orders: TOrder[];
            total: number;
            totalToday: number;
          }>
        ) => {
          state.loadingFeed = false;
          state.feed = action.payload.orders;
          state.total = action.payload.total;
          state.totalToday = action.payload.totalToday;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loadingFeed = false;
        state.error = getErrorMessage(
          action.payload,
          'Ошибка загрузки заказов'
        );
      })

      .addCase(fetchMyOrders.pending, (state) => {
        state.loadingMyOrders = true;
        state.error = null;
      })
      .addCase(
        fetchMyOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.loadingMyOrders = false;
          state.myOrders = action.payload;
        }
      )
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loadingMyOrders = false;
        state.error = getErrorMessage(
          action.payload,
          'Ошибка загрузки моих заказов'
        );
      })

      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.orderRequest = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = getErrorMessage(action.payload, 'Ошибка создания заказа');
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.currentOrder = null;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          getErrorMessage(action.payload, 'Заказ не найден') ||
          action.error.message ||
          'Заказ не найден';
      });
  }
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;

export const selectOrders = (state: RootState) => state.orders.feed;
export const selectMyOrders = (state: RootState) => state.orders.myOrders;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;

export const selectOrderRequest = (state: RootState) =>
  state.orders.orderRequest;
export const selectOrdersError = (state: RootState) => state.orders.error;

export const selectOrdersLoading = (state: RootState) =>
  state.orders.loadingFeed;
export const selectMyOrdersLoading = (state: RootState) =>
  state.orders.loadingMyOrders;
export const selectOrderLoadingState = (state: RootState) =>
  state.orders.isLoading;

export const selectFeedTotals = (state: RootState) => ({
  total: state.orders.total,
  totalToday: state.orders.totalToday
});

export default orderSlice.reducer;
