import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '../api/api';
import { Product } from '../types/types';

interface ProductState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Acción para obtener los productos desde el backend
export const fetchProducts = createAsyncThunk<Product[]>('products/fetchProducts', async () => {
  const data = await get('/products');
  return data;
});

const initialState: ProductState = JSON.parse(localStorage.getItem('products') || '{"items": [], "status": "idle", "error": null}');

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateStock: (state, action) => {
      const { productId, quantity } = action.payload;
      const product = state.items.find((item) => item.id === productId);
      if (product) {
        product.stock -= quantity;
        localStorage.setItem('products', JSON.stringify(state)); // Persistir el estado
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        localStorage.setItem('products', JSON.stringify(state)); // Persistir el estado
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error al cargar productos';
      });
  },
});

export const { updateStock } = productSlice.actions;
export default productSlice.reducer;