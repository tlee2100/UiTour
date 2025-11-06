import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/UiTour.png';
import './HeaderInfo.css';

export default function HeaderInfo() {
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
            <button className="headerif_title" onClick={() => navigate('/host/experience/create/choose')}>
                Become a Host
            </button>
            <button className="headerif_globe">
                <Icon icon="mdi:earth" width="24" height="24" />
            </button>
            <div className="headerif_profile">
                <button className="headerif_menu">
                    <Icon icon="mdi:menu" width="24" height="24" />
                </button>
                <div className="headerif_avatar">
                    <button className="headerif_avatarButton">
                        <Icon icon="mdi:account" width="32" height="32" />
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
}