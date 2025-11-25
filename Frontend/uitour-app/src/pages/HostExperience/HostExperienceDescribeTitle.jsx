import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostExperience.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostExperienceDescribeTitle() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const title = experienceData.tourName || "";
  const summary = experienceData.summary || "";

  // Title handler (max 50 chars)
  const handleTitle = (e) => {
    const value = e.target.value.slice(0, 50);
    updateField("title", { tourName: value });

    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  // Summary handler (max 100 chars)
  const handleSummary = (e) => {
    const value = e.target.value.slice(0, 100);
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

        <h1 className="he-title">
          {t(language, "hostExperience.describe.title")}
        </h1>

        <div className="he-describe-box">

          {/* TITLE */}
          <div className="he-describe-label">
            {t(language, "hostExperience.describe.titleLabel")}{" "}
            <span style={{ fontSize: "11px", color: "#888" }}>
              ({title.length}/50)
            </span>
          </div>

          <textarea
            className="he-title-input-large he-title-textarea"
            value={title}
            onChange={handleTitle}
            placeholder={t(language, "hostExperience.describe.titlePlaceholder")}
            maxLength={50}
            rows={1}
          />

          {/* SUMMARY */}
          <div className="he-describe-label">
            {t(language, "hostExperience.describe.contentLabel")}{" "}
            <span style={{ fontSize: "11px", color: "#888" }}>
              ({summary.length}/100)
            </span>
          </div>

          <textarea
            className="he-subtitle-input"
            rows={3}
            value={summary}
            onChange={handleSummary}
            placeholder={t(language, "hostExperience.describe.summaryPlaceholder")}
            maxLength={100}
          />
        </div>
      </main>
    </div>
  );
}
