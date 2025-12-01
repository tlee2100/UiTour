import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ProfileMenu from '../ProfileMenu';
import logo from '../../assets/UiTour.png';
import './HeaderInfo.css';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLanguageCurrencyModal } from '../../contexts/LanguageCurrencyModalContext';
import { t } from '../../utils/translations';
import LanguageCurrencySelector from '../LanguageCurrencySelector';

export default function HeaderInfo({ searchActive = false, searchType = "stay" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const globeButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useApp();
  const { language } = useLanguage();
  const {
    isOpen: languageCurrencyOpen,
    openModal: openLanguageCurrency,
    closeModal: closeLanguageCurrency
  } = useLanguageCurrencyModal();

  const handleLogoClick = () => navigate('/');

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

  /** 🔥 Nút Search: Bắn event đúng loại */
  const handleSearchClick = () => {
    if (searchType === "exp") {
      window.dispatchEvent(new Event("open-experience-search"));
    } else {
      window.dispatchEvent(new Event("open-universal-search"));
    }
  };


  return (
    <header className="headerif">

      {/* Logo */}
      <div className="headerif_logo">
        <button className="headerif_logoButton" onClick={handleLogoClick}>
          <img src={logo} alt="UiTour Logo" />
        </button>
      </div>

      {/* SMALL SEARCH BUTTON */}
      <div className="headerif_searchWrapper">
        <button
          className={`headerif_smallSearch ${searchActive ? "active" : ""}`}
          onClick={handleSearchClick}
        >
          <Icon icon="mdi:magnify" width="18" height="18" />
          <span>Search</span>
        </button>
      </div>

      {/* Right side */}
      <div className="headerif_right">
        <button
          className="headerif_title"
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
          {((user && token && (user.role === 'ADMIN' || user.Role === 'ADMIN')) ||
            location.pathname.startsWith('/admin'))
            ? t(language, 'common.switchToTraveling')
            : t(language, 'common.becomeAHost')}
        </button>

        <button
          ref={globeButtonRef}
          className="headerif_globe"
          onClick={openLanguageCurrency}
          aria-label={t(language, 'search.languageAndCurrency')}
        >
          <Icon className='globe-icon' icon="mdi:earth" width="26" height="26" />
        </button>

        {languageCurrencyOpen && (
          <LanguageCurrencySelector
            isOpen={languageCurrencyOpen}
            onClose={closeLanguageCurrency}
            triggerRef={globeButtonRef}
          />
        )}

        <div className="headerif_profile">
          <button
            ref={menuButtonRef}
            className="headerif_menu"
            onClick={toggleMenu}
          >
            <Icon icon="mdi:menu" width="24" height="24" />
          </button>

          <button className="headerif_avatarButton">
            <Icon icon="mdi:account" width="28" height="28" />
          </button>

          {menuOpen && (
            <div ref={menuRef}>
              <ProfileMenu onClose={closeMenu} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
