import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceDescribeTitle() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const handleNext = () => {
    // TODO: persist title/subtitle
    console.log({ title, subtitle });
    navigate("/host/experience/create/itinerary");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
      </header>

      <main className="he-main he-describe">
        <h1 className="he-title">Describe your experience</h1>

        <div className="he-describe-box">
          <div className="he-describe-label">Title</div>
          <input
            className="he-title-input-large"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write here..."
          />
          <div className="he-describe-label">Content</div>
          <textarea
            className="he-subtitle-input"
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Something about your experience..."
          />
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


