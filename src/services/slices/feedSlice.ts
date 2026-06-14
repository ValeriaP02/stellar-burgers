import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';
import { RootState } from '../store';

interface FeedState {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

const getErrorMessage = (payload: unknown, fallback: string) =>
  typeof payload === 'string' ? payload : fallback;

export const fetchFeeds = createAsyncThunk<
  { orders: TOrder[]; total: number; totalToday: number },
  void,
  { rejectValue: string }
>('feed/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getFeedsApi();
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : 'Ошибка загрузки ленты'
    );
  }
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getErrorMessage(action.payload, 'Ошибка загрузки ленты');
      });
  }
});

export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedLoading = (state: RootState) => state.feed.isLoading;
export const selectFeedTotals = (state: RootState) => ({
  total: state.feed.total,
  totalToday: state.feed.totalToday
});

export default feedSlice.reducer;
