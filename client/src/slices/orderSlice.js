import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', orderData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk('orders/my', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/myorders');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchOrderById = createAsyncThunk(
  'orders/byId',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk('orders/analytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/analytics');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAllOrders = createAsyncThunk('orders/all', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status, isDelivered, isPaid }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}`, { status, isDelivered, isPaid });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    order: null,
    orders: [],
    adminOrders: [],
    analytics: null,
    loading: false,
    adminLoading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAnalytics.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminOrders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
        if (state.analytics?.recentOrders) {
          state.analytics.recentOrders = state.analytics.recentOrders.map((o) =>
            o._id === action.payload._id ? action.payload : o
          );
        }
      });
  },
});

export const { clearOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
