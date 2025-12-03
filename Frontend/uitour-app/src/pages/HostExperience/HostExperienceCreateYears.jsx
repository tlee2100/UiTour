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

  const days = experienceData.durationDays ?? 1;

  const decrement = () =>
    updateField("duration", { durationDays: Math.max(1, days - 1) });

  const increment = () =>
    updateField("duration", { durationDays: Math.min(60, days + 1) });

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

          <div className="he-counter-value">{days}</div>

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
