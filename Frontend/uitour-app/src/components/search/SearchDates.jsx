import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Calendar from '../../components/Calendar';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
import './SearchDates.css';

export default function SearchDates({ open, onClose, value, onChange }) {
  const [mode, setMode] = useState('dates'); // dates | months | flexible
  const { language } = useLanguage();

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ checkIn: '', checkOut: '' });
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  if (!open) return null;

  return (
    <div className="sd-popover" role="dialog" aria-label={t(language, 'search.selectDates')}>
      <div className="sd-tabs">
        <button className={`sd-tab ${mode==='dates'?'active':''}`} onClick={() => setMode('dates')}>
          <Icon icon="mdi:calendar" width="16" height="16" />
          {t(language, 'search.dates')}
        </button>
        <button className={`sd-tab ${mode==='months'?'active':''}`} onClick={() => setMode('months')}>
          <Icon icon="mdi:calendar-month" width="16" height="16" />
          {t(language, 'search.months')}
        </button>
        <button className={`sd-tab ${mode==='flexible'?'active':''}`} onClick={() => setMode('flexible')}>
          <Icon icon="mdi:calendar-clock" width="16" height="16" />
          {t(language, 'search.flexible')}
        </button>
      </div>

      <div className="sd-body">
        {mode === 'dates' && (
          <div className="sd-cal-wrap">
            <Calendar value={value} onChange={onChange} />
            {(value?.checkIn || value?.checkOut) && (
              <div className="sd-actions">
                <button className="sd-clear-btn" onClick={handleClear}>
                  <Icon icon="mdi:close" width="16" height="16" />
                  {t(language, 'search.clearDates')}
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'months' && (
          <div className="sd-months">
            <div className="sd-coming-soon">
              <Icon icon="mdi:calendar-clock" width="48" height="48" style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <p>{t(language, 'search.monthSelectionComingSoon')}</p>
            </div>
          </div>
        )}

        {mode === 'flexible' && (
          <div className="sd-flexible">
            <button className="sd-chip">
              <Icon icon="mdi:calendar-check" width="16" height="16" />
              {t(language, 'search.exactDates')}
            </button>
            <button className="sd-chip">± 1 day</button>
            <button className="sd-chip">± 2 days</button>
            <button className="sd-chip">± 3 days</button>
            <button className="sd-chip">± 7 days</button>
          </div>
        )}
      </div>
    </div>
  );
}


