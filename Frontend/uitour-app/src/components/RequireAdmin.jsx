import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function RequireAdmin({ children }) {
  const { user, token } = useApp();
  const location = useLocation();
  
  // Case-insensitive check for admin role
  const userRole = user?.Role || user?.role || '';
  const isAdmin = !!user && !!token && userRole?.toUpperCase() === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}


