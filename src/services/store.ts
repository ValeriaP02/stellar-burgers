import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';
import ingredientsReducer from './slices/ingredientsSlice';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/orderSlice';
import feedReducer from './slices/feedSlice';
import constructorReducer from './slices/constructorSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  auth: authReducer,
  orders: ordersReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => dispatchHook<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
