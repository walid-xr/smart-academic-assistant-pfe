import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatRoleLabel } from '../../utils/labels';
import NotificationMenu from './NotificationMenu';

const AppNavbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div>
        <p className="eyebrow-text mb-1">Smart Academic Assistant</p>
        <h1 className="app-title">{title}</h1>
      </div>

      <div className="navbar-actions">
        <NotificationMenu />
        <div className="user-chip">
          <span className="user-chip__name">{user?.name}</span>
          <span className="user-chip__role">{formatRoleLabel(user?.role)}</span>
        </div>
        <button className="btn btn-outline-primary" onClick={handleLogout}>
          Deconnexion
        </button>
      </div>
    </header>
  );
};

export default AppNavbar;
