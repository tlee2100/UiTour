import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/headers/AdminHeader';
import Footer from '../components/footers/Footer';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <div className="admin-wrap">
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
}


