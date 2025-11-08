import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateTitle() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  const handleNext = () => {
    // TODO: save the title to context or API
    navigate("/host/stay/create/description"); // next step (for example)
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

      {/* MAIN SECTION */}
      <main className="hs-title-main">
        <h1 className="hs-title-heading">
          Now, let’s give your house a title
        </h1>

        <div className="hs-title-box">
          <textarea
            className="hs-title-input"
            placeholder="Write something..."
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="hs-title-count">{title.length}/50</div>
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
          disabled={title.trim().length === 0}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
