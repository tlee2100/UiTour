import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ProfileMenu from './ProfileMenu';
import logo from '../assets/UiTour.png';
import './HeaderInfo.css';
import { useApp } from '../contexts/AppContext';

export default function HeaderInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navigate = useNavigate();
  const { user, token } = useApp();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
  };

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

  return (
    <header className="headerif">
      
      {/* Logo */}
      <div className="headerif_logo">
        <button className="headerif_logoButton" onClick={handleLogoClick}>
          <img src={logo} alt="UiTour Logo" />
        </button>
      </div>

      {/* Search */}
      <form className="headerif_search" onSubmit={handleSearch}>
        <input
          className="headerif_searchInput"
          placeholder="Start your search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="headerif_searchButton">
          <Icon icon="mdi:magnify" width="20" height="20" color='#fff'/>
        </button>
      </form>

      {/* Right side */}
      <div className="headerif_right">
        <button
          className="headerif_title"
          onClick={() => {
            if (!user || !token) {
              navigate('/login');
            } else {
              navigate('/host/becomehost');
            }
          }}
        >
          Become a Host
        </button>

        <button className="headerif_globe">
          <Icon className='globe-icon' icon="mdi:earth" width="26" height="26"/>
        </button>

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
