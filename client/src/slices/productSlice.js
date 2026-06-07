import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'products/fetchMyProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/mine');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    myProducts: [],
    product: null,
    loading: false,
    adminLoading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyProducts.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.myProducts = action.payload;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.myProducts = [action.payload, ...state.myProducts];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.myProducts = state.myProducts.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.myProducts = state.myProducts.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
