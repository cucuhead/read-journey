import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/auth/authSlice';
import { getCurrentUser } from './api/authApi';
import AppRouter from './router/AppRouter';

function App() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(setUser({ name: data.name, email: data.email }));
      } catch {
        // token geçersizse axiosInstance zaten logout yapacak
      }
    };

    fetchUser();
  }, [token, dispatch]);

  return <AppRouter />;
}

export default App;