import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreateYears() {
  const navigate = useNavigate();
  const [years, setYears] = useState(10);

  const decrement = () => setYears((y) => Math.max(0, y - 1));
  const increment = () => setYears((y) => Math.min(60, y + 1));

  const handleNext = () => {
    // TODO: persist years and go to next step
    console.log("Years of experience:", years);
    navigate("/host/experience/create/qualification");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" />
        </div>
        <button className="he-tertiary-btn">Save & exit</button>
      </header>

      <main className="he-main">
        <h1 className="he-title">How many years have you worked in?</h1>

        <div className="he-counter">
          <button className="he-circle-btn" onClick={decrement} aria-label="decrease">
            <Icon icon="mdi:minus" width="18" height="18" />
          </button>

          <div className="he-counter-value">{years}</div>

          <button className="he-circle-btn" onClick={increment} aria-label="increase">
            <Icon icon="mdi:plus" width="18" height="18" />
          </button>
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={handleNext}>Next</button>
        </div>
      </footer>
    </div>
  );
}


