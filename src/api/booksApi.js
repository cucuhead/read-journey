import axiosInstance from './axiosInstance';



export const getRecommendedBooks = async (page = 1, limit = 10, title = '', author = '') => {
  const { data } = await axiosInstance.get('/books/recommend', {
    params: { page, limit, title, author },
  });
  return data;
};

export const addBookToLibrary = async bookId => {
  const { data } = await axiosInstance.post(`/books/add/${bookId}`);
  return data;
};

export const addCustomBook = async bookData => {
  const { data } = await axiosInstance.post('/books/add', bookData);
  return data;
};

export const removeBook = async bookId => {
  const { data } = await axiosInstance.delete(`/books/remove/${bookId}`);
  return data;
};

export const getMyBooks = async () => {
  const { data } = await axiosInstance.get('/books/own');
  
  return data;
};

export const startReading = async (bookId, page) => {
  const { data } = await axiosInstance.post('/books/reading/start', {
    id: bookId,
    page,
  });
  return data;
};

export const stopReading = async (bookId, page) => {
  const { data } = await axiosInstance.post('/books/reading/finish', {
    id: bookId,
    page,
  });
  return data;
};
export const deleteReadingSession = async (bookId, readingId) => {
  const { data } = await axiosInstance.delete('/books/reading', {
    params: { bookId, readingId },
  });
  return data;
};
