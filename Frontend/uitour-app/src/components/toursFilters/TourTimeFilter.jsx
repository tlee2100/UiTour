import BaseDropdown from "./BaseDropdown";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

const TIME_OPTIONS = [
  { key: "morning", labelKey: "filters.time.morning" },
  { key: "afternoon", labelKey: "filters.time.afternoon" },
  { key: "evening", labelKey: "filters.time.evening" },
  { key: "fullday", labelKey: "filters.time.fullday" },
];

export default function TourTimeFilter({ current, onSelect }) {
  const { language } = useLanguage();

  return (
    <BaseDropdown>
      <div className="filter-title">
        {t(language, "filters.time.title")}
      </div>

      <div className="tour-time-options">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`tour-time-chip ${current === opt.key ? "active" : ""}`}
            onClick={() => onSelect(opt.key)}
          >
            {t(language, opt.labelKey)}
          </button>
        ))}
      </div>
    </BaseDropdown>
  );
}
