import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateDescription() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  const handleNext = () => {
    // TODO: Save description somewhere (context / backend)
    navigate("/host/stay/create/weekday-price");
  };

  return (
    <div className="hs-page">
      {/* HEADER (shared) */}
      <header className="hs-header">
        <img
          src={logo}
          alt="UiTour Logo"
          className="hs-logo"
          onClick={() => navigate("/")}
        />
        <button className="hs-save-btn">Save & Exit</button>
      </header>

      {/* MAIN */}
      <main className="hs-desc-main">
        <h1 className="hs-desc-heading">Create your description</h1>

        <div className="hs-desc-box">
          <textarea
            className="hs-desc-input"
            placeholder="The whole group will be comfortable in this spacious and unique space."
            value={description}
            maxLength={70}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="hs-desc-count">{description.length}/70</div>
        </div>
      </main>

      {/* FOOTER (shared) */}
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
          disabled={description.trim().length === 0}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
