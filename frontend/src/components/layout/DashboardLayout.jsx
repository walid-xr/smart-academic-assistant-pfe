import AppNavbar from './AppNavbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <AppNavbar title={title} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
