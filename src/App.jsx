import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/auth/authSlice';
import { setMyBooks } from './redux/books/booksSlice';
import { getCurrentUser } from './api/authApi';
import { getMyBooks } from './api/booksApi';
import AppRouter from './router/AppRouter';

function App() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        dispatch(setUser({ name: user.name, email: user.email }));

        const books = await getMyBooks();
        dispatch(setMyBooks(books));
      } catch {
        // token geçersizse axiosInstance zaten logout yapacak
      }
    };

    fetchUserData();
  }, [token, dispatch]);

  return <AppRouter />;
}

export default App;