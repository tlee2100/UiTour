import { useEffect } from 'react';
import './SearchWhere.css';

export default function SearchWhere({ open, onClose, onSelectRegion }) {
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

  const regions = [
    { id: 'nearby', title: 'Nearby' },
    { id: 'europe', title: 'Vung Tau' },
    { id: 'thailand', title: 'Da Lat' },
    { id: 'sea', title: 'Can Tho' },
    { id: 'indonesia', title: 'Ho Chi Minh City' },
    { id: 'me', title: 'Nha Trang' }
  ];

  return (
    <div className="sw-popover" role="dialog" aria-label="Search by region">
      <div className="sw-header">Search by region</div>
      <div className="sw-grid">
        {regions.map((r) => (
          <button
            key={r.id}
            className="sw-card"
            onClick={() => {
              onSelectRegion?.(r);
              onClose?.();
            }}
          >
            <div className="sw-thumb" />
            <div className="sw-title">{r.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


