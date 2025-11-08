import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayTypeOfPlace() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const options = [
    {
      id: "entire",
      icon: "mdi:home-outline",
      title: "An entire place",
      desc: "Guests have the whole place to themselves.",
    },
    {
      id: "room",
      icon: "fluent:door-32-regular",
      title: "A room",
      desc: "Guests have their own room plus access to shared spaces.",
    },
  ];

  const handleNext = () => {
    if (!selected) return;
    navigate("/host/stay/create/location");
  };

  return (
    <div className="hs-page">
      {/* Header */}
      <header className="hs-header">
        <div className="hs-header-left">
          <img
            src={logo}
            alt="UiTour Logo"
            className="hs-logo"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="hs-header-right">
          <button className="hs-save-btn">Save & Exit</button>
        </div>
      </header>

      {/* Main */}
      <main className="hs-main">
        <h1 className="hs-title">What type of place do guests have?</h1>

        <div className="hs-list">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`hs-list-item ${
                selected === opt.id ? "is-selected" : ""
              }`}
              onClick={() => setSelected(opt.id)}
            >
              <div className="hs-list-icon">
                <Icon icon={opt.icon} width="32" height="32" />
              </div>
              <div className="hs-list-text">
                <div className="hs-list-title">{opt.title}</div>
                <div className="hs-list-subtitle">{opt.desc}</div>
              </div>
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
          disabled={!selected}
          onClick={handleNext}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
