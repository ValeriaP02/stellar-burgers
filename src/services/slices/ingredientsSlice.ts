import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';
import { getIngredientsApi } from '@api';
import { RootState } from '../../services/store';

interface IngredientsState {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
}

const initialState: IngredientsState = {
  items: [],
  loading: false,
  error: null
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    return await getIngredientsApi();
  } catch (e) {
    return rejectWithValue(
      e instanceof Error ? e.message : 'Ошибка загрузки ингредиентов'
    );
  }
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        console.log('ingredients pending reducer');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<TIngredient[]>) => {
          console.log(
            'ingredients fulfilled reducer',
            action.type,
            action.payload
          );
          state.loading = false;
          state.items = action.payload ?? [];
          state.error = null;
        }
      )
      .addCase(fetchIngredients.rejected, (state, action) => {
        console.log(
          'ingredients rejected reducer',
          action.type,
          action.payload
        );
        state.loading = false;
        state.error = action.payload ?? 'Ошибка загрузки ингредиентов';
      });
  }
});

export const selectIngredients = (state: RootState) => state.ingredients.items;

export const selectIngredientsLoading = (state: RootState) =>
  state.ingredients.loading;

export const selectIngredientsError = (state: RootState) =>
  state.ingredients.error;

export default ingredientsSlice.reducer;
