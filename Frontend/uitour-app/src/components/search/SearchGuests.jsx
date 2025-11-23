import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import './SearchGuests.css';

export default function SearchGuests({ open, onClose, guests, onChange }) {
  const { language } = useLanguage();
  
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rows = [
    { key: 'adults', label: t(language, 'search.adults'), desc: t(language, 'search.ages13OrAbove'), icon: 'mdi:account' },
    { key: 'children', label: t(language, 'search.children'), desc: t(language, 'search.ages2To12'), icon: 'mdi:account-child' },
    { key: 'infants', label: t(language, 'search.infants'), desc: t(language, 'search.under2'), icon: 'mdi:baby-face-outline' },
    { key: 'pets', label: t(language, 'search.pets'), desc: t(language, 'search.bringingServiceAnimal'), icon: 'mdi:paw' }
  ];

  const value = guests || { adults: 1, children: 0, infants: 0, pets: 0 };

  function setVal(key, next) {
    const v = Math.max(0, next);
    if (key === 'adults' && v === 0) return; // at least 1 adult
    onChange?.({ ...value, [key]: v });
  }

  const totalGuests = value.adults + value.children;

  return (
    <div className="sg-popover" role="dialog" aria-label={t(language, 'search.guestsSelector')}>
      <div className="sg-header">
        <div className="sg-header-title">{t(language, 'search.whosComing')}</div>
        <button className="sg-close-btn" onClick={onClose}>
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>
      <div className="sg-list">
        {rows.map((r) => (
          <div key={r.key} className="sg-row">
            <div className="sg-info">
              <div className="sg-info-top">
                <Icon icon={r.icon} width="20" height="20" className="sg-icon" />
                <div>
                  <div className="sg-label">{r.label}</div>
                  <div className="sg-desc">{r.desc}</div>
                </div>
              </div>
            </div>
            <div className="sg-ctrl">
              <button
                className={`sg-btn ${value[r.key] === 0 ? 'sg-btn-disabled' : ''}`}
                onClick={() => setVal(r.key, value[r.key] - 1)}
                disabled={value[r.key] === 0 || (r.key === 'adults' && value[r.key] === 1)}
              >
                <Icon icon="mdi:minus" width="16" height="16" />
              </button>
              <div className="sg-num">{value[r.key]}</div>
              <button
                className="sg-btn"
                onClick={() => setVal(r.key, value[r.key] + 1)}
              >
                <Icon icon="mdi:plus" width="16" height="16" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {totalGuests > 0 && (
        <div className="sg-footer">
          <div className="sg-total">{t(language, 'search.total')}: {totalGuests} {totalGuests === 1 ? t(language, 'search.guest') : t(language, 'search.guests')}</div>
        </div>
      )}
    </div>
  );
}


