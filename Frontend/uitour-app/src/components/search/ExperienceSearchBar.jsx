import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ExperienceSearchDates from './ExperienceSearchDates';
import SearchGuests from './SearchGuests';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import './ExperienceSearchBar.css';

export default function ExperienceSearchBar({ 
  initialLocation = '', 
  initialDates = '', 
  initialGuests = '1',
  onSearch,
  searchPath = '/experiences/search'
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [location, setLocation] = useState(initialLocation);
  const [dates, setDates] = useState(initialDates);
  const [guests, setGuests] = useState(initialGuests);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const [guestsData, setGuestsData] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });

  // Sync state when props change (e.g., when URL params change)
  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    setDates(initialDates);
  }, [initialDates]);

  useEffect(() => {
    setGuests(initialGuests);
    // Update guestsData based on initialGuests
    if (initialGuests && initialGuests !== '1') {
      const count = Number(initialGuests);
      if (!isNaN(count) && count > 0) {
        setGuestsData({ adults: Math.max(1, count), children: 0, infants: 0, pets: 0 });
      }
    } else {
      setGuestsData({ adults: 1, children: 0, infants: 0, pets: 0 });
    }
  }, [initialGuests]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dates) params.set('dates', dates);
    if (guests) params.set('guests', guests);
    
    // If custom onSearch callback is provided, use it
    if (onSearch) {
      onSearch({ location, dates, guests, params });
    } else {
      // Otherwise, use default navigation
      navigate(`${searchPath}?${params.toString()}`);
    }
  };

  const handleClearDates = (e) => {
    e.stopPropagation();
    setDates('');
  };

  const handleClearGuests = (e) => {
    e.stopPropagation();
    setGuests('1');
    setGuestsData({ adults: 1, children: 0, infants: 0, pets: 0 });
  };

  const handleDateSelect = (dateRange) => {
    setDates(dateRange);
    setOpenDates(false);
  };

  const handleGuestsChange = (newGuests) => {
    setGuestsData(newGuests);
    const total = newGuests.adults + newGuests.children;
    setGuests(String(total));
  };

  return (
    <div className="experience-search-bar-container">
      <div className="experience-search-bar">
        {/* Where */}
        <div className="esb-field">
          <label>{t(language, 'search.where')}</label>
          <input
            type="text"
            placeholder={t(language, 'search.searchDestinations')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onClick={() => { setOpenDates(false); setOpenGuests(false); }}
          />
        </div>

        {/* When */}
        <div 
          className="esb-field esb-field-clickable"
          onClick={() => { setOpenDates(!openDates); setOpenGuests(false); }}
        >
          <label>{t(language, 'search.when')}</label>
          <div className="esb-field-value">
            {dates ? (
              <>
                <button className="esb-clear-btn" onClick={handleClearDates}>
                  <Icon icon="mdi:close" width="16" height="16" />
                </button>
                <span>{dates}</span>
              </>
            ) : (
              <span className="esb-placeholder">{t(language, 'search.addDates')}</span>
            )}
          </div>
        </div>

        {/* Who */}
        <div 
          className="esb-field esb-field-clickable"
          onClick={() => { setOpenGuests(!openGuests); setOpenDates(false); }}
        >
          <label>{t(language, 'search.who')}</label>
          <div className="esb-field-value">
            {guests !== '1' || guestsData.children > 0 || guestsData.infants > 0 ? (
              <>
                <button className="esb-clear-btn" onClick={handleClearGuests}>
                  <Icon icon="mdi:close" width="16" height="16" />
                </button>
                <span>{guests} {guests === '1' ? t(language, 'search.guest') : t(language, 'search.guests')}</span>
              </>
            ) : (
              <span className="esb-placeholder">{t(language, 'search.addGuests')}</span>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button className="esb-search-button" onClick={handleSearch}>
          <Icon icon="mdi:magnify" width="20" height="20" />
        </button>
      </div>

      {/* Date Picker Overlay */}
      <ExperienceSearchDates
        open={openDates}
        onClose={() => setOpenDates(false)}
        onSelect={handleDateSelect}
        value={dates}
      />

      {/* Guests Picker Overlay */}
      <SearchGuests
        open={openGuests}
        onClose={() => setOpenGuests(false)}
        guests={guestsData}
        onChange={handleGuestsChange}
      />
    </div>
  );
}

