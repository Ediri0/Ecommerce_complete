import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    transactions: transactionReducer,
  },
});

// Exporta el tipo de `AppDispatch`
export type AppDispatch = typeof store.dispatch;