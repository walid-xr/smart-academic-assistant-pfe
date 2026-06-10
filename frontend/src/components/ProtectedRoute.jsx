import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loader">Verification de l'acces...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
