import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import './SearchWhere.css';

export default function SearchWhere({ open, onClose, onSelectRegion }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const allRegions = [
    { id: 'ho-chi-minh', title: 'Ho Chi Minh City', icon: 'mdi:city-variant', popular: true },
    { id: 'ha-noi', title: 'Ha Noi', icon: 'mdi:city', popular: true },
    { id: 'da-nang', title: 'Da Nang', icon: 'mdi:beach', popular: true },
    { id: 'nha-trang', title: 'Nha Trang', icon: 'mdi:waves', popular: true },
    { id: 'da-lat', title: 'Da Lat', icon: 'mdi:mountain', popular: true },
    { id: 'vung-tau', title: 'Vung Tau', icon: 'mdi:beach', popular: false },
    { id: 'can-tho', title: 'Can Tho', icon: 'mdi:water', popular: false },
    { id: 'hue', title: 'Hue', icon: 'mdi:castle', popular: false },
    { id: 'phu-quoc', title: 'Phu Quoc', icon: 'mdi:island', popular: true },
    { id: 'sapa', title: 'Sapa', icon: 'mdi:terrain', popular: false },
    { id: 'halong', title: 'Ha Long', icon: 'mdi:island', popular: true },
    { id: 'hoi-an', title: 'Hoi An', icon: 'mdi:city-variant-outline', popular: true }
  ];

  const filteredRegions = allRegions.filter(region =>
    region.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularRegions = filteredRegions.filter(r => r.popular);
  const otherRegions = filteredRegions.filter(r => !r.popular);

  return (
    <div className="sw-popover" role="dialog" aria-label={t(language, 'search.searchByRegion')}>
      <div className="sw-header">
        <div className="sw-header-title">{t(language, 'search.whereTo')}</div>
        <button className="sw-close-btn" onClick={onClose}>
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>
      
      <div className="sw-search-box">
        <Icon icon="mdi:magnify" width="20" height="20" className="sw-search-icon" />
        <input
          type="text"
          className="sw-search-input"
          placeholder={t(language, 'search.searchDestinationsPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <button className="sw-clear-search" onClick={() => setSearchQuery('')}>
            <Icon icon="mdi:close-circle" width="20" height="20" />
          </button>
        )}
      </div>

      <div className="sw-content">
        {popularRegions.length > 0 && (
          <div className="sw-section">
            <div className="sw-section-title">
              <Icon icon="mdi:star" width="16" height="16" />
              {t(language, 'search.popularDestinations')}
            </div>
            <div className="sw-grid">
              {popularRegions.map((r) => (
                <button
                  key={r.id}
                  className="sw-card"
                  onClick={() => {
                    onSelectRegion?.(r);
                    onClose?.();
                  }}
                >
                  <div className="sw-thumb">
                    <Icon icon={r.icon} width="24" height="24" />
                  </div>
                  <div className="sw-title">{r.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {otherRegions.length > 0 && (
          <div className="sw-section">
            <div className="sw-section-title">{t(language, 'search.allDestinations')}</div>
            <div className="sw-list">
              {otherRegions.map((r) => (
                <button
                  key={r.id}
                  className="sw-list-item"
                  onClick={() => {
                    onSelectRegion?.(r);
                    onClose?.();
                  }}
                >
                  <Icon icon={r.icon} width="20" height="20" className="sw-list-icon" />
                  <span className="sw-list-title">{r.title}</span>
                  <Icon icon="mdi:chevron-right" width="20" height="20" className="sw-list-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredRegions.length === 0 && (
          <div className="sw-empty">
            <Icon icon="mdi:magnify" width="48" height="48" style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <p>{t(language, 'search.noDestinationsFound')}</p>
            <p className="sw-empty-subtitle">{t(language, 'search.trySearchingDifferentLocation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}


