import BaseDropdown from "./BaseDropdown";
import { Icon } from "@iconify/react";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

const TYPE_OPTIONS = [
  { id: "art", labelKey: "hostExperience.choose.categories.art", icon: "mdi:palette" },
  { id: "fitness", labelKey: "hostExperience.choose.categories.fitness", icon: "mdi:arm-flex" },
  { id: "food", labelKey: "hostExperience.choose.categories.food", icon: "mdi:hamburger" },
  { id: "history", labelKey: "hostExperience.choose.categories.history", icon: "mdi:bank" },
  { id: "nature", labelKey: "hostExperience.choose.categories.nature", icon: "mdi:tree" }
];

export default function TourTypeFilter({ current, onSelect }) {
  const { language } = useLanguage();

  return (
    <BaseDropdown>
      <div className="filter-title">{t(language, "filters.type.title")}</div>

      <div className="tour-type-options">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`tour-type-chip ${current === opt.id ? "active" : ""}`}
            onClick={() => onSelect(opt.id)}
          >
            <Icon icon={opt.icon} width="18" height="18" />
            <span>{t(language, opt.labelKey)}</span>
          </button>
        ))}
      </div>
    </BaseDropdown>
  );
}
