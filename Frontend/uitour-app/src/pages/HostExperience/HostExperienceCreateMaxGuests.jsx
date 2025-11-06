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

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const seconds = minutes;

  const handleSave = () => {
    // TODO: persist the picked time or max guests if repurposed
    console.log(`Saved time: ${hour}:${minute}:${second} ${ampm}`);
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" />
        </div>
        <button className="he-tertiary-btn">Save & exit</button>
      </header>

      <main className="he-main he-time">
        <h1 className="he-title">Pick a start time</h1>

        <div className="he-time-card">
          <div className="he-time-label">Set time</div>

          <div className="he-time-columns">
            <select className="he-time-select" value={hour} onChange={(e) => setHour(e.target.value)}>
              {hours.map(h => (<option key={h} value={h}>{h}</option>))}
            </select>
            <div className="he-time-sep">:</div>
            <select className="he-time-select" value={minute} onChange={(e) => setMinute(e.target.value)}>
              {minutes.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
            <div className="he-time-sep">:</div>
            <select className="he-time-select" value={second} onChange={(e) => setSecond(e.target.value)}>
              {seconds.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select className="he-time-ampm" value={ampm} onChange={(e) => setAmpm(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="he-time-actions">
            <button className="he-tertiary-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button className="he-primary-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={() => navigate('/host/experience/create/complete')}>Next</button>
        </div>
      </footer>
    </div>
  );
}


