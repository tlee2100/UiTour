import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreateMaxGuests() {
  const navigate = useNavigate();

  const now = new Date();
  const [hour, setHour] = useState(String(((now.getHours() + 11) % 12) + 1).padStart(2, '0'));
  const [minute, setMinute] = useState(String(now.getMinutes()).padStart(2, '0'));
  const [second, setSecond] = useState(String(now.getSeconds()).padStart(2, '0'));
  const [ampm, setAmpm] = useState(now.getHours() >= 12 ? 'PM' : 'AM');

  // Pricing / capacity state
  const [maxGuests, setMaxGuests] = useState(4);
  const [pricePerGuest, setPricePerGuest] = useState(25);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeLocked, setTimeLocked] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const seconds = minutes;

  const handleSave = () => {
    if (timeLocked) return;
    setConfirmOpen(true);
  };

  const confirmSaveTime = () => {
    setTimeLocked(true);
    setConfirmOpen(false);
    console.log(`Saved time: ${hour}:${minute}:${second} ${ampm}`);
    console.log({ maxGuests, pricePerGuest });
  };

  return (
    <>
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
        <button className="he-tertiary-btn">Save & exit</button>
      </header>

      <main className="he-main he-time">
        <h1 className="he-title">Pick a time and number of</h1>

        <div className="he-time-card">
          <div className="he-time-label">Set time</div>

          <div className="he-time-columns">
            <select className="he-time-select" value={hour} onChange={(e) => setHour(e.target.value)} disabled={timeLocked}>
              {hours.map(h => (<option key={h} value={h}>{h}</option>))}
            </select>
            <div className="he-time-sep">:</div>
            <select className="he-time-select" value={minute} onChange={(e) => setMinute(e.target.value)} disabled={timeLocked}>
              {minutes.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
            <div className="he-time-sep">:</div>
            <select className="he-time-select" value={second} onChange={(e) => setSecond(e.target.value)} disabled={timeLocked}>
              {seconds.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select className="he-time-ampm" value={ampm} onChange={(e) => setAmpm(e.target.value)} disabled={timeLocked}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="he-time-actions">
            <button className="he-tertiary-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button className="he-primary-btn" onClick={handleSave} disabled={timeLocked}>Save</button>
          </div>
        </div>

        <div className="he-price-card">
          <div className="he-time-label">Capacity & pricing</div>

          <div className="he-price-grid">
            <div className="he-field">
              <label>Max guests</label>
              <select
                className="he-input"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="he-field">
              <label>Price per guest ($)</label>
              <input
                className="he-input"
                type="number"
                min="0"
                max="100000"
                step="1"
                value={pricePerGuest}
                placeholder="Enter price (VND)"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPricePerGuest(Number.isNaN(val) ? 0 : Math.min(100000, Math.max(0, val)));
                }}
              />
            </div>

            
          </div>
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={() => navigate('/host/experience/create/discount')}>Next</button>
        </div>
      </footer>
    </div>

    {confirmOpen && (
      <div className="he-modal" role="dialog" aria-modal="true">
        <div className="he-modal-backdrop" onClick={() => setConfirmOpen(false)} />
        <div className="he-modal-card he-confirm-modal">
          <div className="he-modal-header">
            <div className="he-modal-title">Are you sure?</div>
            <button className="he-modal-close" onClick={() => setConfirmOpen(false)} aria-label="Close">×</button>
          </div>
          <div className="he-modal-body">Once saved, the start time cannot be changed.</div>
          <div className="he-modal-footer">
            <button className="he-tertiary-btn" onClick={() => setConfirmOpen(false)}>No</button>
            <button className="he-primary-btn" onClick={confirmSaveTime}>Yes</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}


