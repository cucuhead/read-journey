import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RecommendedPage from '../pages/RecommendedPage/RecommendedPage';
import LibraryPage from '../pages/LibraryPage/LibraryPage';
import ReadingPage from '../pages/ReadingPage/ReadingPage';
import MainLayout from '../components/layout/MainLayout/MainLayout';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/recommended" element={<RecommendedPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/reading" element={<ReadingPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;