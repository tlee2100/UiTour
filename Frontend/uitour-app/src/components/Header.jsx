import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
        {/* Logo */}
        <div className="header_logo">
            <button className="header_logoButton">
                <img src={logo} alt="UiTour Logo" className="logo" />
            </button>
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