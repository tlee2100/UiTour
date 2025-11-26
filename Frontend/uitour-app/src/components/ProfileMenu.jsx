import { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageCurrencyModal } from '../contexts/LanguageCurrencyModalContext';
import { t } from '../utils/translations';
import authAPI from '../services/authAPI';
import './ProfileMenu.css';

// Accessible dropdown menu shown under the profile/hamburger button
const ProfileMenu = forwardRef(function ProfileMenu({ onClose }, ref) {
  const { user, dispatch } = useApp();
  const { language } = useLanguage();
  const { openModal: openLanguageCurrency } = useLanguageCurrencyModal();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!user;
  const [tripCount, setTripCount] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    async function loadTrips() {
      if (!isLoggedIn || !user?.UserID) {
        if (mounted) setTripCount(null);
        return;
      }
      setTripLoading(true);
      try {
        const data = await authAPI.getUserBookings(user.UserID);
        if (mounted) setTripCount((data || []).length);
      } catch {
        if (mounted) setTripCount(0);
      } finally {
        if (mounted) setTripLoading(false);
      }
    }
    loadTrips();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user?.UserID]);


  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    onClose();
    navigate('/');
  };

  // Menu khi đã đăng nhập
  if (isLoggedIn) {
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
      // Admin context: chỉ giữ Account (under AdminLayout), Language & Region, Logout
      return (
        <div ref={ref} className="profile-menu" role="menu" aria-label="Admin menu">
          <div className="profile-menu_section">
            <button
              className="profile-menu_item"
              onClick={() => { onClose(); navigate('/admin/account'); }}
              role="menuitem"
            >
              <Icon icon="mdi:cog-outline" width="20" height="20" />
              <span>{t(language, 'profile.account')}</span>
            </button>
            <button 
              className="profile-menu_item" 
              onClick={() => { 
                onClose(); 
                openLanguageCurrency(); 
              }} 
              role="menuitem"
            >
              <Icon icon="mdi:earth" width="20" height="20" />
              <span>{t(language, 'language.title')}</span>
            </button>
          </div>
          <div className="profile-menu_divider" />
          <div className="profile-menu_section">
            <button 
              className="profile-menu_item profile-menu_item-logout" 
              onClick={handleLogout} 
              role="menuitem"
            >
              <span>{t(language, 'profile.logout')}</span>
            </button>
          </div>
        </div>
      );
    }

    // Normal (non-admin) menu
    return (
      <div ref={ref} className="profile-menu" role="menu" aria-label="User menu">
        <div className="profile-menu_section">
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/wishlist'); }} role="menuitem">
            <Icon icon="mdi:heart-outline" width="20" height="20" />
            <span>{t(language, 'profile.wishlist')}</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/trips'); }} role="menuitem">
            <Icon icon="mdi:airplane" width="20" height="20" />
            <span className="profile-menu_item-label">
              {t(language, 'profile.trips')}
              {tripLoading ? (
                <span className="profile-menu_item-badge">...</span>
              ) : (
                typeof tripCount === 'number' && (
                  <span className="profile-menu_item-badge">{tripCount}</span>
                )
              )}
            </span>
          </button>
          <button
            className="profile-menu_item"
            onClick={() => { onClose(); navigate('/profile'); }}
            role="menuitem"
          >
            <Icon icon="mdi:account-outline" width="20" height="20" />
            <span>{t(language, 'profile.profile')}</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/notifications'); }} role="menuitem">
            <Icon icon="mdi:bell-outline" width="20" height="20" />
            <span>{t(language, 'profile.notifications')}</span>
          </button>
          <button className="profile-menu_item" onClick={() => { onClose(); navigate('/account'); }} role="menuitem">
            <Icon icon="mdi:cog-outline" width="20" height="20" />
            <span>{t(language, 'profile.account')}</span>
          </button>
          <button 
            className="profile-menu_item" 
            onClick={() => { 
              onClose(); 
              openLanguageCurrency(); 
            }} 
            role="menuitem"
          >
            <Icon icon="mdi:earth" width="20" height="20" />
            <span>{t(language, 'language.title')}</span>
          </button>
        </div>
        <div className="profile-menu_divider" />
        <div className="profile-menu_section">
          <button 
            className="profile-menu_item profile-menu_item-logout" 
            onClick={handleLogout} 
            role="menuitem"
          >
            <span>{t(language, 'profile.logout')}</span>
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
          <span>{t(language, 'profile.helpCenter')}</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_item-large" role="menuitem">
        <div className="profile-menu_item-large_text">
          <div className="title">{t(language, 'profile.becomeAHostTitle')}</div>
          <div className="subtitle">{t(language, 'profile.becomeAHostSubtitle')}</div>
        </div>
        <div className="profile-menu_item-large_illustration" aria-hidden>
          <Icon icon="mdi:account-tie" width="36" height="36" />
        </div>
      </div>
      <div className="profile-menu_section">
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>{t(language, 'profile.aboutTheHost')}</span>
        </button>
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>{t(language, 'profile.findSupportHost')}</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_section">
        <Link className="profile-menu_item" to="/login" role="menuitem" onClick={onClose}>
          <span>{t(language, 'profile.login')}</span>
        </Link>
        <Link className="profile-menu_item" to="/signup" role="menuitem" onClick={onClose}>
          <span>{t(language, 'profile.signup')}</span>
        </Link>
      </div>
    </div>
  );
});

export default ProfileMenu;


