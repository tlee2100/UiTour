import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/UiTour.png';
import ProfileMenu from '../ProfileMenu';
import LanguageCurrencySelector from '../LanguageCurrencySelector';
import { useLanguageCurrencyModal } from '../../contexts/LanguageCurrencyModalContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import './AdminHeader.css';

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const highlightRef = useRef(null);
  const globeButtonRef = useRef(null);
  const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } =
    useLanguageCurrencyModal();
  const { language } = useLanguage();

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

  const updateHighlight = () => {
    const navEl = navRef.current;
    const highlightEl = highlightRef.current;
    if (!navEl || !highlightEl) return;

    // Prefer NavLink's aria-current attribute to find the exact active tab
    let activeLink = navEl.querySelector('.admin-nav-item[aria-current="page"]');
    if (!activeLink) {
      activeLink = navEl.querySelector('.admin-nav-item.active');
    }
    if (!activeLink) {
      highlightEl.style.width = '0px';
      highlightEl.style.transform = 'translateX(0)';
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offset = linkRect.left - navRect.left;
    highlightEl.style.width = `${linkRect.width}px`;
    highlightEl.style.transform = `translateX(${offset}px)`;
  };

  useEffect(() => {
    // Run after layout and once more shortly after to handle late font/layout changes
    let rafId = requestAnimationFrame(updateHighlight);
    const timeoutId = setTimeout(updateHighlight, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => updateHighlight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="admin-header-top"></div>

      <header className="admin-header-main">
        <div className="admin-header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="UiTour Logo" className="admin-logo-img" />
        </div>

        <nav className="admin-header-nav" ref={navRef}>
          <NavLink to="/admin/dashboard" className="admin-nav-item">
            <Icon icon="mdi:view-dashboard" width="18" height="18" />
            <span>{t(language, 'adminNav.dashboard')}</span>
          </NavLink>
          <NavLink to="/admin/posts" className="admin-nav-item">
            <Icon icon="mdi:home" width="18" height="18" />
            <span>{t(language, 'adminNav.posts')}</span>
          </NavLink>
          <NavLink to="/admin/users" className="admin-nav-item">
            <Icon icon="mdi:account-group" width="18" height="18" />
            <span>{t(language, 'adminNav.users')}</span>
          </NavLink>
          <NavLink to="/admin/reports" className="admin-nav-item">
            <Icon icon="mdi:file-document-alert-outline" width="18" height="18" />
            <span>{t(language, 'adminNav.reports')}</span>
          </NavLink>
          <NavLink to="/admin/transactions" className="admin-nav-item">
            <Icon icon="mdi:swap-horizontal" width="18" height="18" />
            <span>{t(language, 'adminNav.transactions')}</span>
          </NavLink>
          <span className="admin-nav-highlight" ref={highlightRef}></span>
        </nav>

        <div className="admin-header-right">
          <button
            ref={globeButtonRef}
            className="admin-globe-btn"
            onClick={openLanguageCurrency}
            aria-label={t(language, 'search.languageAndCurrency')}
          >
            <Icon icon="mdi:earth" width="20" height="20" />
          </button>

          {languageCurrencyOpen && (
            <LanguageCurrencySelector
              isOpen={languageCurrencyOpen}
              onClose={closeLanguageCurrency}
              triggerRef={globeButtonRef}
            />
          )}
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

