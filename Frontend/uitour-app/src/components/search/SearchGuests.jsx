import { useEffect } from 'react';
import './SearchGuests.css';

export default function SearchGuests({ open, onClose, guests, onChange }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rows = [
    { key: 'adults', label: 'Adults', desc: 'Ages 13 or above' },
    { key: 'children', label: 'Children', desc: 'Ages 2-12' },
    { key: 'infants', label: 'Infants', desc: 'Under 2' },
    { key: 'pets', label: 'Pets', desc: 'Bringing a service animal?' }
  ];

  const value = guests || { adults: 1, children: 0, infants: 0, pets: 0 };

  function setVal(key, next) {
    const v = Math.max(0, next);
    if (key === 'adults' && v === 0) return; // at least 1 adult
    onChange?.({ ...value, [key]: v });
  }

  return (
    <div className="sg-popover" role="dialog" aria-label="Guests selector">
      <div className="sg-list">
        {rows.map((r) => (
          <div key={r.key} className="sg-row">
            <div className="sg-info">
              <div className="sg-label">{r.label}</div>
              <div className="sg-desc">{r.desc}</div>
            </div>
            <div className="sg-ctrl">
              <button
                className="sg-btn"
                onClick={() => setVal(r.key, value[r.key] - 1)}
              >−</button>
              <div className="sg-num">{value[r.key]}</div>
              <button
                className="sg-btn"
                onClick={() => setVal(r.key, value[r.key] + 1)}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


