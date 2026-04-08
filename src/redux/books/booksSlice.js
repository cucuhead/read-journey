import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recommended: [],
  totalPages: 0,
  currentPage: 1,
  myBooks: [],
  currentBook: null,
  isLoading: false,
  error: null,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
   setRecommended(state, action) {
  state.recommended = action.payload.results;
  state.totalPages = action.payload.totalPages;
  state.currentPage = action.payload.page;
},
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setMyBooks(state, action) {
      state.myBooks = action.payload;
    },
    setCurrentBook(state, action) {
      state.currentBook = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setRecommended,
  setCurrentPage,
  setMyBooks,
  setCurrentBook,
  setLoading,
  setError,
} = booksSlice.actions;

export default booksSlice.reducer;