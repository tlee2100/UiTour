import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function RequireAuth({ children }) {
  const { user, token } = useApp();
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}


