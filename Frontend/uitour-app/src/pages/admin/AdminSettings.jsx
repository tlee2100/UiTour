import './admin.css';

export default function AdminSettings() {
  return (
    <div className="admin-page">
      <div className="grid-3">
        <div className="settings-card">
          <div className="settings-title">Category management</div>
          <div className="settings-row">
            <label>Room type</label>
            <input placeholder="Villa" />
          </div>
          <div className="settings-row">
            <label>Tour type</label>
            <input placeholder="Beach travel" />
          </div>
          <div className="settings-row">
            <label>Location</label>
            <input placeholder="Hanoi" />
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-title">Service fee management (%)</div>
          <div className="settings-row">
            <label>Service fee (%)</label>
            <input defaultValue="7" />
          </div>
          <div className="settings-row">
            <label>VAT tax (%)</label>
            <input defaultValue="10" />
          </div>
          <button className="primary small">Save changes</button>
        </div>
        <div className="settings-card">
          <div className="settings-title">Banner & events</div>
          <div className="banner-item">Tet 2025 Banner</div>
          <button className="ghost small">+ Add new banner</button>
        </div>
      </div>
    </div>
  );
}


