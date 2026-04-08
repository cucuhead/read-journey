import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function PublicRoute() {
  const token = useSelector(state => state.auth.token);

  return token ? <Navigate to="/recommended" replace /> : <Outlet />;
}

export default PublicRoute;