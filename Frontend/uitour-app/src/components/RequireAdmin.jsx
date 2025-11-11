import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function RequireAdmin({ children }) {
  const { user, token } = useApp();
  const location = useLocation();
  const isAdmin = !!user && !!token && (user.role === 'ADMIN' || user.Role === 'ADMIN');

  //if (!isAdmin) {
    //return <Navigate to="/login" replace state={{ from: location }} />;
  //}

  return children;
}


