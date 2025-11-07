import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreateDiscount() {
  const navigate = useNavigate();
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(true);
  const [customDiscounts, setCustomDiscounts] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formPercent, setFormPercent] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCondition, setFormCondition] = useState("");
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handlePublish = () => {
    // TODO: persist discounts
    console.log({
      earlyBirdEnabled,
      customDiscounts,
      selectedDiscounts
    });
    setSuccessOpen(true);
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
      </header>

      <main className="he-main he-discounts">
        <h1 className="he-title">Add discounts</h1>

        <div className="he-discount-list">
          <button
            className={`he-discount-card ${earlyBirdEnabled ? 'is-active' : ''}`}
            onClick={() => setEarlyBirdEnabled((prev) => !prev)}
          >
            <div className="he-discount-value">20%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">Early bird discount</div>
              <div className="he-discount-subtitle">Applies to all bookings made more than 2 weeks in advance.</div>
            </div>
            <div className="he-discount-action">
              {earlyBirdEnabled ? (
                <Icon icon="mdi:check" width="20" height="20" />
              ) : (
                <Icon icon="mdi:checkbox-blank-outline" width="20" height="20" />
              )}
            </div>
          </button>

          {customDiscounts.map((discount, index) => {
            const isSelected = selectedDiscounts.includes(index);
            return (
              <button
                key={index}
                className={`he-discount-card ${isSelected ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedDiscounts((prev) =>
                    prev.includes(index)
                      ? prev.filter((i) => i !== index)
                      : [...prev, index]
                  );
                }}
              >
                <div className="he-discount-value">{discount.percent}%</div>
                <div className="he-discount-body">
                  <div className="he-discount-title">{discount.title}</div>
                  <div className="he-discount-subtitle">{discount.condition}</div>
                </div>
                <div className="he-discount-action">
                  {isSelected ? (
                    <Icon icon="mdi:check" width="18" height="18" />
                  ) : (
                    <Icon icon="mdi:checkbox-blank-outline" width="18" height="18" />
                  )}
                </div>
              </button>
            );
          })}

          <button
            className="he-discount-card is-empty"
            onClick={() => {
              setFormPercent("");
              setFormTitle("");
              setFormCondition("");
              setFormOpen(true);
            }}
          >
            <div className="he-discount-value">--%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">Limited-time discount</div>
              <div className="he-discount-subtitle">Add a promotional offer for your experience</div>
            </div>
            <div className="he-discount-action">
              <span className="he-add-circle">+</span>
            </div>
          </button>
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={handlePublish}>Publish</button>
        </div>
      </footer>

      {formOpen && (
        <div className="he-modal" role="dialog" aria-modal="true">
          <div className="he-modal-backdrop" onClick={() => setFormOpen(false)} />
          <div className="he-modal-card he-discount-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">Add limited-time discount</div>
              <button className="he-modal-close" onClick={() => setFormOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="he-modal-body">
              <div className="he-field">
                <label>Discount percent (0-100)</label>
                <input
                  className="he-input"
                  type="number"
                  min="0"
                  max="100"
                  value={formPercent}
                  onChange={(e) => setFormPercent(e.target.value)}
                />
              </div>
              <div className="he-field">
                <label>Title</label>
                <input
                  className="he-input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="he-field">
                <label>Activation condition</label>
                <textarea
                  className="he-textarea"
                  rows={3}
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                />
              </div>
              {error && <div className="he-error-text">{error}</div>}
            </div>
            <div className="he-modal-footer">
              <button className="he-tertiary-btn" onClick={() => setFormOpen(false)}>Cancel</button>
              <button
                className="he-primary-btn"
                onClick={() => {
                  const val = Number(formPercent);
                  if (Number.isNaN(val) || val < 0 || val > 100) {
                    setError('Discount percent must be between 0 and 100');
                    return;
                  }
                  setError("");
                  setCustomDiscounts((prev) => [
                    ...prev,
                    {
                      percent: val,
                      title: formTitle || 'Limited-time discount',
                      condition: formCondition || 'Applies during the promotional window'
                    }
                  ]);
                  setFormOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {successOpen && (
  <div className="he-modal" role="alertdialog" aria-modal="true">
    
    {/* Click ra ngoài → về trang chính */}
    <div className="he-modal-backdrop" onClick={() => navigate('/')} />

    <div
      className="he-modal-card he-success-modal"
      onClick={(e) => e.stopPropagation()} 
    >
      <div className="he-modal-header">
        <div className="he-modal-title">Success!</div>

        {/* Bấm dấu X → về trang chính */}
        <button className="he-modal-close" onClick={() => navigate('/')} aria-label="Close">×</button>
      </div>

      <div className="he-modal-body">
        You have successfully hosted. Please check your information in your profile!
      </div>

      <div className="he-modal-footer">
        {/* Nút Done cũng → về trang chính */}
        <button className="he-primary-btn" onClick={() => navigate('/')}>
          Done
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}


