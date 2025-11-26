import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HostExperience.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostExperienceCreateYears() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const years = experienceData.yearsOfExperience ?? 10;

  const decrement = () =>
    updateField("years", { yearsOfExperience: Math.max(0, years - 1) });

  const increment = () =>
    updateField("years", { yearsOfExperience: Math.min(60, years + 1) });

  const handleNext = () => {
    if (!validateStep("years")) return;
    navigate("/host/experience/create/qualification");
  };

  return (
    <div className="he-page">
      <main className="he-main">

        <h1 className="he-title">
          {t(language, "hostExperience.years.title")}
        </h1>

        <div className="he-counter">
          <button
            className="he-circle-btn"
            onClick={decrement}
            aria-label={t(language, "hostExperience.years.decrease")}
          >
            <Icon icon="mdi:minus" width="18" height="18" />
          </button>

          <div className="he-counter-value">{years}</div>

          <button
            className="he-circle-btn"
            onClick={increment}
            aria-label={t(language, "hostExperience.years.increase")}
          >
            <Icon icon="mdi:plus" width="18" height="18" />
          </button>
        </div>

      </main>
    </div>
  );
}
