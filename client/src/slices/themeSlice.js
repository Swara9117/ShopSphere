import { createSlice } from '@reduxjs/toolkit';

const themeFromStorage = localStorage.getItem('theme')
  ? JSON.parse(localStorage.getItem('theme'))
  : 'light';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: themeFromStorage,
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', JSON.stringify(state.mode));
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', JSON.stringify(state.mode));
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
