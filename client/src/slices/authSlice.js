import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const getUserInfoFromStorage = () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  } catch {
    localStorage.removeItem('userInfo');
    return null;
  }
};

export const login = createAsyncThunk('auth/login', async ({ email, password, role }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users/login', { email, password });
    const isShopkeeper = data.isAdmin;
    if (role === 'shopkeeper' && !isShopkeeper) {
      return rejectWithValue('This account is registered as a customer. Please select Customer to sign in.');
    }
    if (role === 'customer' && isShopkeeper) {
      return rejectWithValue('This account is registered as a shopkeeper. Please select Shopkeeper to sign in.');
    }
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users', userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: getUserInfoFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
