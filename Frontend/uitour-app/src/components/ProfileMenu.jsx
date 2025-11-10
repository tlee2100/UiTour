import { forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import './ProfileMenu.css';

// Accessible dropdown menu shown under the profile/hamburger button
const ProfileMenu = forwardRef(function ProfileMenu({ onClose }, ref) {
  const { user, dispatch } = useApp();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    onClose();
    navigate('/');
  };

  // Menu khi đã đăng nhập
  if (isLoggedIn) {
    return (
      <div ref={ref} className="profile-menu" role="menu" aria-label="User menu">
        <div className="profile-menu_section">
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/wishlist'); }} role="menuitem">
            <Icon icon="mdi:heart-outline" width="20" height="20" />
            <span>Wishlist</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/trips'); }} role="menuitem">
            <Icon icon="mdi:airplane" width="20" height="20" />
            <span>Trips</span>
          </button>
          <button
            className="profile-menu_item"
            onClick={() => { onClose(); navigate('/profile'); }}
            role="menuitem"
          >
            <Icon icon="mdi:account-outline" width="20" height="20" />
            <span>Profile</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/notifications'); }} role="menuitem">
            <Icon icon="mdi:bell-outline" width="20" height="20" />
            <span>Notification</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/account'); }} role="menuitem">
            <Icon icon="mdi:cog-outline" width="20" height="20" />
            <span>Account setting</span>
          </button>
          <button className="profile-menu_item" onClick={onClose} role="menuitem">
            <Icon icon="mdi:earth" width="20" height="20" />
            <span>Languages & currency</span>
          </button>
        </div>
        <div className="profile-menu_divider" />
        <div className="profile-menu_section">
          <button 
            className="profile-menu_item profile-menu_item-logout" 
            onClick={handleLogout} 
            role="menuitem"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Menu khi chưa đăng nhập (menu cũ)
  return (
    <div ref={ref} className="profile-menu" role="menu" aria-label="User menu">
      <div className="profile-menu_section">
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <Icon icon="mdi:help-circle-outline" width="20" height="20" />
          <span>Help Center</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_item-large" role="menuitem">
        <div className="profile-menu_item-large_text">
          <div className="title">Become a Host</div>
          <div className="subtitle">Getting started hosting and earning extra income is easy.</div>
        </div>
        <div className="profile-menu_item-large_illustration" aria-hidden>
          <Icon icon="mdi:account-tie" width="36" height="36" />
        </div>
      </div>
      <div className="profile-menu_section">
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>About the host</span>
        </button>
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>Find support host</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_section">
        <Link className="profile-menu_item" to="/login" role="menuitem" onClick={onClose}>
          <span>Log in</span>
        </Link>
        <Link className="profile-menu_item" to="/signup" role="menuitem" onClick={onClose}>
          <span>Sign up</span>
        </Link>
      </div>
    </div>
  );
});

export default ProfileMenu;


