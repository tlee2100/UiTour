import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './Header.css';
import ProfileMenu from './ProfileMenu';

export default function Header() {
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

  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

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
          <Link to="/" className="nav_link active">Stays</Link>
          <Link to="/tours" className="nav_link">Experiences</Link>
        </nav>

        {/* Search box */}
        <form className="header_search" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="header_searchInput" 
              placeholder="Start your search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="header_searchButton">
                <Icon icon="mdi:magnify" width="24" height="24" />
            </button>
        </form>

        {/* Right side */}
        <div className="header_right">
            <button className="header_title">
                Become a Host
            </button>
            <button className="header_globe">
                <Icon icon="mdi:earth" width="24" height="24" />
            </button>
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
                    <button className="header_avatarButton">
                        <Icon icon="mdi:account" width="32" height="32" />
                    </button>
                </div>
              {menuOpen && (
                <ProfileMenu ref={menuRef} onClose={closeMenu} />
              )}
            </div>
        </div>
    </header>
  );
}