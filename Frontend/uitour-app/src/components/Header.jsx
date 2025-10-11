import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
        {/* Logo */}
        <div className="header_logo">
            <img src={logo} alt="UiTour Logo" className="logo" />
        </div>

        {/* Search box */}
        <div className="header_search">
            <input type="text" className="header_searchInput" placeholder="Start your search..." />
            <button className="header_searchButton">
                <Icon icon="mdi:magnify" width="24" height="24" />
            </button>
        </div>

        {/* Right side */}
        <div className="header_right">
            <span className="header_title">Become a Host</span>
            <button className="header_globe">
                <Icon icon="mdi:earth" width="24" height="24" />
            </button>
            <div className="header_profile">
                <span className="header_menu">☰</span>
                <div className="header_avatar"></div>
            </div>
        </div>
    </header>
  );
}