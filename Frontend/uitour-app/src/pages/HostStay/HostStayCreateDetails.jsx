import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateDetails() {
  const navigate = useNavigate();

  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);

  const handleNext = () => {
    console.log({
      guests,
      bedrooms,
      beds,
      bathrooms,
    });
    navigate("/host/stay/create/amenities");
  };

  return (
    <div className="hs-page">
      {/* ===== HEADER ===== */}
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

      {/* ===== MAIN ===== */}
      <main className="hs-main">
        <h1 className="hs-title">Let’s start with the basics</h1>
        <div className="hs-room-section">
          <h2 className="hs-room-title">How many people can stay here?</h2>

          <div className="hs-room-controls">
            <RoomControl
              label="Guests"
              value={guests}
              onIncrease={() => setGuests((v) => v + 1)}
              onDecrease={() => setGuests((v) => Math.max(1, v - 1))}
            />
            <RoomControl
              label="Bedrooms"
              value={bedrooms}
              onIncrease={() => setBedrooms((v) => v + 1)}
              onDecrease={() => setBedrooms((v) => Math.max(0, v - 1))}
            />
            <RoomControl
              label="Beds"
              value={beds}
              onIncrease={() => setBeds((v) => v + 1)}
              onDecrease={() => setBeds((v) => Math.max(0, v - 1))}
            />
            <RoomControl
              label="Bathrooms"
              value={bathrooms}
              onIncrease={() => setBathrooms((v) => v + 1)}
              onDecrease={() => setBathrooms((v) => Math.max(0, v - 1))}
            />
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="hs-footer">
        <button
          className="hs-footer-btn hs-footer-btn--white"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--black"
          onClick={handleNext}
        >
          Next
        </button>
      </footer>
    </div>
  );
}

/* ===== Room Control Component ===== */
function RoomControl({ label, value, onIncrease, onDecrease }) {
  return (
    <div className="hs-room-control">
      <span className="hs-room-label">{label}</span>
      <div className="hs-room-actions">
        <button className="hs-circle-btn" onClick={onDecrease}>
          –
        </button>
        <span className="hs-room-value">{value}</span>
        <button className="hs-circle-btn" onClick={onIncrease}>
          +
        </button>
      </div>
    </div>
  );
}
