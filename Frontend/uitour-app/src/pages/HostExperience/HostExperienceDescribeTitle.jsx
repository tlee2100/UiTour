import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostExperience.css";

export default function HostExperienceDescribeTitle() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep } = useHost();
  const title = experienceData.tourName || "";
  const summary = experienceData.summary || "";


  const handleTitle = e => updateField("title", { tourName: e.target.value });
  const handleSummary = (e) =>
    updateField("description", {
      summary: e.target.value,
      description: e.target.value,
    });

  const handleNext = () => {
    if (!validateStep("describe-title")) return;
    navigate("/host/experience/create/itinerary");
  };

  return (
    <div className="he-page">
      <main className="he-main he-describe">
        <h1 className="he-title">Describe your experience</h1>
        <div className="he-describe-box">
          <div className="he-describe-label">Title</div>
          <input
            className="he-title-input-large"
            type="text"
            value={title}
            onChange={handleTitle}
            placeholder="Write here..."
          />
          <div className="he-describe-label">Content</div>
          <textarea
            className="he-subtitle-input"
            rows={3}
            value={summary}
            onChange={handleSummary}
            placeholder="Something about your experience..."
          />
        </div>
      </main>
    </div>
  );
}


