import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateChoose() {
  const { stayData, updateField, validateStep } = useHost();

  const categories = [
    { id: 1, label: "House", icon: "mdi:home-outline" },
    { id: 2, label: "Apartment", icon: "ph:building-apartment-light" },
    { id: 3, label: "Guest house", icon: "hugeicons:house-04" },
    { id: 4, label: "Hotel", icon: "hugeicons:hotel-01" },
  ];

  const handleSelect = (id, label) => {
    updateField("choose", {
      propertyTypeID: id,
      propertyTypeLabel: label
    });
  };

  return (
    <div className="hs-page hs-choose">
      {/* Header */}
      {/* Main */}
      <main className="hs-main hs-choose-main">
        <h1 className="hs-choose-title">
          Which of these best describes your place?
        </h1>

        <div className="hs-choose-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id, c.label)}
              className={`hs-card ${stayData.propertyTypeID === c.id ? "hs-card--active" : ""
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
