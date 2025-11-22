import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostExperience.css";

export default function HostExperienceDescribeTitle() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep } = useHost();
  const title = experienceData.tourName || "";
  const summary = experienceData.summary || "";

  // Title handler (max 50 chars)
  const handleTitle = (e) => {
    const value = e.target.value.slice(0, 50); // hard max 50
    updateField("title", { tourName: value });

    // Auto expand textarea height
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // Summary handler (max 100 chars)
  const handleSummary = (e) => {
    const value = e.target.value.slice(0, 100); // hard max 100
    updateField("description", {
      summary: value,
      description: value,
    });
  };

  const handleNext = () => {
    if (!validateStep("describe-title")) return;
    navigate("/host/experience/create/itinerary");
  };

  return (
    <div className="he-page">
      <main className="he-main he-describe">
        <h1 className="he-title">Describe your experience</h1>

        <div className="he-describe-box">
          <div className="he-describe-label">
            Title <span style={{ fontSize: "11px", color: "#888" }}>({title.length}/50)</span>
          </div>

          <textarea
            className="he-title-input-large he-title-textarea"
            value={title}
            onChange={handleTitle}
            placeholder="Write here..."
            maxLength={50}
            rows={1}
          />

          <div className="he-describe-label">
            Content <span style={{ fontSize: "11px", color: "#888" }}>({summary.length}/100)</span>
          </div>

          <textarea
            className="he-subtitle-input"
            rows={3}
            value={summary}
            onChange={handleSummary}
            placeholder="Something about your experience..."
            maxLength={100} // optional
          />
        </div>
      </main>
    </div>
  );
}
