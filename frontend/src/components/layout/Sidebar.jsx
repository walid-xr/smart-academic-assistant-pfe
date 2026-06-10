import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Tableau de bord', match: (pathname) => pathname === '/teacher/dashboard' },
    {
      to: '/assignments/create',
      label: 'Creer un devoir',
      match: (pathname) => pathname === '/assignments/create'
    },
    {
      to: '/assignments',
      label: 'Devoirs',
      match: (pathname) =>
        pathname === '/assignments' ||
        (pathname.startsWith('/assignments/') && pathname !== '/assignments/create')
    },
    { to: '/homework', label: 'Toutes les soumissions', match: (pathname) => pathname.startsWith('/homework') }
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Tableau de bord', match: (pathname) => pathname === '/student/dashboard' },
    {
      to: '/assignments',
      label: 'Devoirs disponibles',
      match: (pathname) => pathname === '/assignments' || pathname.startsWith('/assignments/')
    },
    { to: '/homework', label: 'Mes soumissions', match: (pathname) => pathname.startsWith('/homework') }
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img
          className="app-logo app-logo--sidebar"
          src="/smart-academic-assistant-logo.svg"
          alt="Smart Academic Assistant logo"
        />
        <div>
          <h2>Portail academique</h2>
          <p>Gestion des devoirs</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={link.match(location.pathname) ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
