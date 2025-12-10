import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateChoose() {
  const { stayData, updateField } = useHost();
  const { language } = useLanguage();

  const categories = [
    { id: 1, label: t(language, "hostStay.choose.house"), icon: "mdi:home-outline" },
    { id: 2, label: t(language, "hostStay.choose.apartment"), icon: "ph:building-apartment-light" },
    { id: 3, label: t(language, "hostStay.choose.guestHouse"), icon: "hugeicons:house-04" },
    { id: 4, label: t(language, "hostStay.choose.homestay"), icon: "hugeicons:hotel-01" }
  ];

  const handleSelect = (id, label) => {
    updateField("choose", {
      propertyTypeID: id,
      propertyTypeLabel: label
    });
  };

  return (
    <div className="hs-page hs-choose">
      <main className="hs-main hs-choose-main">
        <h1 className="hs-choose-title">
          {t(language, "hostStay.choose.title")}
        </h1>

        <div className="hs-choose-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id, c.label)}
              className={`hs-card ${
                stayData.propertyTypeID === c.id ? "hs-card--active" : ""
              }`}
            >
              <Icon icon={c.icon} width="48" height="48" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
