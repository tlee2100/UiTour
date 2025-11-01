import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './Header.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

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



        {/* Right side */}
        <div className="header_right">
            <button className="header_title">
                Become a Host
            </button>
            <button className="header_globe">
                <Icon icon="mdi:earth" width="24" height="24" />
            </button>
            <div className="header_profile">
                <button className="header_menu">
                    <Icon icon="mdi:menu" width="24" height="24" />
                </button>
                <div className="header_avatar">
                    <button className="header_avatarButton">
                        <Icon icon="mdi:account" width="32" height="32" />
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
}