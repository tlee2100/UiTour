import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreateChoose() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const categories = [
    { id: "art", label: "Art and design", icon: "mdi:palette" },
    { id: "fitness", label: "Fitness and wellness", icon: "mdi:arm-flex" },
    { id: "food", label: "Food and drink", icon: "mdi:hamburger" },
    { id: "history", label: "History and culture", icon: "mdi:bank" },
    { id: "nature", label: "Nature and outdoors", icon: "mdi:tree" },
  ];

  const handleNext = () => {
    if (!selectedId) return;
    // TODO: persist selectedId if needed
    navigate("/host/experience/create/years");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
      </header>

      <main className="he-main">
        <h1 className="he-title">What experience will you offer guests</h1>

        <div className="he-card-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`he-card ${selectedId === c.id ? "is-selected" : ""}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="he-card-icon">
                <Icon icon={c.icon} width="48" height="48" />
              </div>
              <div className="he-card-label">{c.label}</div>
            </button>
          ))}
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button
            className="he-primary-btn"
            disabled={!selectedId}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}


