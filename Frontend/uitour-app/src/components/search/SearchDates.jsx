import { useEffect, useState } from 'react';
import Calendar from '../../components/Calendar';
import './SearchDates.css';

export default function SearchDates({ open, onClose, value, onChange }) {
  const [mode, setMode] = useState('dates'); // dates | months | flexible

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sd-popover" role="dialog" aria-label="Select dates">
      <div className="sd-tabs">
        <button className={`sd-tab ${mode==='dates'?'active':''}`} onClick={() => setMode('dates')}>Dates</button>
        <button className={`sd-tab ${mode==='months'?'active':''}`} onClick={() => setMode('months')}>Months</button>
        <button className={`sd-tab ${mode==='flexible'?'active':''}`} onClick={() => setMode('flexible')}>Flexible</button>
      </div>

      <div className="sd-body">
        {mode === 'dates' && (
          <div className="sd-cal-wrap">
            <Calendar />
          </div>
        )}

        {mode === 'months' && (
          <div className="sd-months">Coming soon</div>
        )}

        {mode === 'flexible' && (
          <div className="sd-flexible">
            <button className="sd-chip">Exact dates</button>
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


