import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../api/api'; // Usa el método `post` de la API
import { Transaction } from '../types/types';

interface TransactionState {
  items: Transaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export const createTransaction = createAsyncThunk<Transaction, { productId: number; amount: number; token: string }>(
  'transactions/createTransaction',
  async (paymentData) => {
    const response = await post('/transactions', paymentData); // Llama al endpoint de transacciones
    return response;
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initialState: TransactionState = JSON.parse(localStorage.getItem('transactions') || '{"items": [], "status": "idle"}');

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'succeeded';
        localStorage.setItem('transactions', JSON.stringify(state)); // Persistir el estado
      })
      .addCase(createTransaction.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default transactionSlice.reducer;