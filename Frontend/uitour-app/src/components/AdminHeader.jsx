import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import ProfileMenu from './ProfileMenu';
import './AdminHeader.css';

export default function AdminHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleSwitchToTraveling = () => {
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* Top Dark Grey Strip */}
      <div className="admin-header-top"></div>
      
      {/* Main Header Section */}
      <header className="admin-header-main">
        {/* Left - Logo */}
        <div className="admin-header-logo">
          <img src={logo} alt="UiTour Logo" className="admin-logo-img" />
        </div>

        {/* Center - Navigation Tabs */}
        <nav className="admin-header-nav">
          <NavLink to="/admin/dashboard" className="admin-nav-item">
            <Icon icon="mdi:chart-pie" width="20" height="20" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/posts" className="admin-nav-item">
            <Icon icon="mdi:home" width="20" height="20" />
            <span>Post</span>
          </NavLink>
          <NavLink to="/admin/users" className="admin-nav-item">
            <Icon icon="mdi:account-group" width="20" height="20" />
            <span>User</span>
          </NavLink>
          <NavLink to="/admin/reports" className="admin-nav-item">
            <Icon icon="mdi:flag" width="20" height="20" />
            <span>Report</span>
          </NavLink>
          <NavLink to="/admin/transactions" className="admin-nav-item">
            <Icon icon="mdi:arrow-right-circle" width="20" height="20" />
            <span>Transaction</span>
          </NavLink>
        </nav>

        {/* Right - User Controls */}
        <div className="admin-header-right">
          <button 
            className="admin-switch-btn"
            onClick={handleSwitchToTraveling}
          >
            Switch to travelling
          </button>
          <button className="admin-globe-btn">
            <Icon icon="mdi:earth" width="20" height="20" />
          </button>
          <div className="admin-profile-wrapper">
            <button
              ref={menuButtonRef}
              className="admin-profile-btn"
              onClick={toggleMenu}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Icon icon="mdi:menu" width="20" height="20" />
              <Icon icon="mdi:account" width="20" height="20" />
            </button>
            {menuOpen && <ProfileMenu ref={menuRef} onClose={closeMenu} />}
          </div>
        </div>
      </header>
    </>
  );
}

