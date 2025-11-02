import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ProfileMenu from './ProfileMenu';
import logo from '../assets/UiTour.png';
import './HeaderInfo.css';

export default function HeaderInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogoClick = () => navigate('/');

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  // ✅ Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuOpen) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="headerinfo">

      {/* Logo */}
      <div className="headerif_logo">
        <button className="headerif_logoButton" onClick={handleLogoClick}>
          <img src={logo} alt="UiTour Logo" className="logo" />
        </button>
      </div>

      {/* Search box */}
      <form className="headerif_search" onSubmit={handleSearch}>
        <input 
          type="text"
          className="headerif_searchInput"
          placeholder="Start your search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="headerif_searchButton">
          <Icon icon="mdi:magnify" width="24" height="24" />
        </button>
      </form>

      {/* Right side */}
      <div className="headerif_right">
        <button className="headerif_title">Become a Host</button>
        <button className="headerif_globe">
          <Icon icon="mdi:earth" width="24" height="24" />
        </button>

        {/* ✅ Dropdown Profile */}
        <div className="headerif_profile">
          <button
            ref={menuButtonRef}
            className="headerif_menu"
            onClick={toggleMenu}
          >
            <Icon icon="mdi:menu" width="24" height="24" />
          </button>

          <div className="headerif_avatar">
            <button className="headerif_avatarButton">
              <Icon icon="mdi:account" width="32" height="32" />
            </button>
          </div>

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
