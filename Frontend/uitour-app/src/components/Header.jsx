import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './Header.css';
import ProfileMenu from './ProfileMenu';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageCurrencyModal } from '../contexts/LanguageCurrencyModalContext';
import { t } from '../utils/translations';
import LanguageCurrencySelector from './LanguageCurrencySelector';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const globeButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useApp();
  const { language } = useLanguage();
  const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } = useLanguageCurrencyModal();

  const handleLogoClick = () => navigate('/');

  // ✅ Xác định tab active
  const active = location.pathname.startsWith("/tours") ? "tours" : "stays";

  // ✅ Cập nhật vị trí highlight
  const updateHighlight = () => {
    const activeLink = document.querySelector(".nav_link.active");
    const highlight = document.querySelector(".nav_highlight");
    if (!activeLink || !highlight) return;
    highlight.style.width = `${activeLink.offsetWidth}px`;
    highlight.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  };

  useEffect(() => {
    updateHighlight();
  }, [active]);

  useEffect(() => {
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, []);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      {/* Logo */}
      <div className="header_logo">
        <button className="header_logoButton" onClick={handleLogoClick}>
          <img src={logo} alt="UiTour Logo" className="logo" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="header_nav">
        <Link to="/" className={`nav_link ${active === "stays" ? "active" : ""}`}>
          {t(language, 'header.stays')}
        </Link>
        <Link to="/tours" className={`nav_link ${active === "tours" ? "active" : ""}`}>
          {t(language, 'header.experiences')}
        </Link>
        <span className="nav_highlight"></span>
      </nav>

      {/* Right side */}
      <div className="header_right">
        <button
          className="header_title"
          onClick={() => {
            const isAdmin = !!user && !!token && (user.role === 'ADMIN' || user.Role === 'ADMIN');
            if (isAdmin || location.pathname.startsWith('/admin')) {
              navigate('/');
              return;
            }
            if (!user || !token) {
              navigate('/login');
            } else {
              navigate('/host/today');
            }
          }}
        >
          {((user && token && (user.role === 'ADMIN' || user.Role === 'ADMIN')) || location.pathname.startsWith('/admin'))
            ? t(language, 'common.switchToTraveling')
            : t(language, 'common.becomeAHost')}
        </button>

        <button 
          ref={globeButtonRef}
          className="header_globe"
          onClick={openLanguageCurrency}
          aria-label="Language and Currency"
        >
          <Icon icon="mdi:earth" width="26" height="26" />
        </button>

        {languageCurrencyOpen && (
          <LanguageCurrencySelector
            isOpen={languageCurrencyOpen}
            onClose={closeLanguageCurrency}
            triggerRef={globeButtonRef}
          />
        )}

        <div className="header_profile">
          <button
            ref={menuButtonRef}
            className="header_menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <Icon icon="mdi:menu" width="24" height="24" />
          </button>

          <div className="header_avatar">
            <button className="header_avatarButton" onClick={() => navigate('/profile')}>
              <Icon icon="mdi:account" width="28" height="28" />
            </button>
          </div>

          {menuOpen && <ProfileMenu ref={menuRef} onClose={closeMenu} />}
        </div>
      </div>
    </header>
  );
}
