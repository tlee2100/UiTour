import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateChoose() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const categories = [
    { id: "house", label: "House", icon: "mdi:home-outline" },
    { id: "apartment", label: "Apartment", icon: "ph:building-apartment-light" },
    { id: "guesthouse", label: "Guest house", icon: "hugeicons:house-04" },
    { id: "hotel", label: "Hotel", icon: "hugeicons:hotel-01" },
  ];

  const handleSelect = (id) => {
    updateField('choose', { propertyType: id });
  };

  const handleNext = () => {
    if (!validateStep('choose')) return;
    navigate("/host/stay/create/typeofplace");
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
              className={`hs-card ${stayData.propertyType === c.id ? "hs-card--active" : ""}`}
              onClick={() => handleSelect(c.id)}
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
