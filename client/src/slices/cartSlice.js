import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, qty }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart', { productId, qty });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCartQty = createAsyncThunk(
  'cart/update',
  async ({ productId, qty }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { qty });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.loading = false;
      state.items = action.payload;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, setItems)
      .addCase(addToCart.fulfilled, setItems)
      .addCase(updateCartQty.fulfilled, setItems)
      .addCase(removeFromCart.fulfilled, setItems);
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
