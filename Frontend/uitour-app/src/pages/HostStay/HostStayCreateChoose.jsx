import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateChoose() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const categories = [
    { id: "house", label: "House", icon: "mdi:home-outline" },
    { id: "apartment", label: "Apartment", icon: "ph:building-apartment-light" },
    { id: "guesthouse", label: "Guest house", icon: "hugeicons:house-04" },
    { id: "hotel", label: "Hotel", icon: "hugeicons:hotel-01" },
  ];

  const handleNext = () => {
    if (!selectedId) return;
    navigate("/host/stay/create/typeofplace");
  };

  return (
    <div className="hs-page hs-choose">
      {/* Header */}
      <header className="hs-header">
        <div className="hs-header-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="UiTour logo" />
        </div>
        <div className="hs-header-actions">
          <button className="hs-header-save">Save & Exit</button>
        </div>
      </header>

      {/* Main */}
      <main className="hs-main hs-choose-main">
        <h1 className="hs-choose-title">
          Which of these best describes your place?
        </h1>

        <div className="hs-choose-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`hs-card ${selectedId === c.id ? "hs-card--active" : ""}`}
              onClick={() => setSelectedId(c.id)}
            >
              <Icon icon={c.icon} width="48" height="48" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="hs-footer">
        <button className="hs-footer-btn hs-footer-btn--white" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--black"
          disabled={!selectedId}
          onClick={handleNext}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
