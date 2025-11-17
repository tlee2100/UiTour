import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateChoose() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep, setFlowType, type } = useHost();

  // ✅ Bắt buộc: đặt flow là "experience" khi vào trang này
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type, setFlowType]);

  const categories = [
    { id: "art", label: "Art and design", icon: "mdi:palette" },
    { id: "fitness", label: "Fitness and wellness", icon: "mdi:arm-flex" },
    { id: "food", label: "Food and drink", icon: "mdi:hamburger" },
    { id: "history", label: "History and culture", icon: "mdi:bank" },
    { id: "nature", label: "Nature and outdoors", icon: "mdi:tree" },
  ];

  const handleSelect = (id) => {
    updateField("choose", { mainCategory: id });
  };

  const handleNext = () => {
    if (!validateStep("choose")) return;
    navigate("/host/experience/create/years");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">What experience will you offer guests?</h1>
        <div className="he-card-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`he-card ${
                experienceData.mainCategory === c.id ? "is-selected" : ""
              }`}
              onClick={() => handleSelect(c.id)}
            >
              <div className="he-card-icon">
                <Icon icon={c.icon} width="48" height="48" />
              </div>
              <div className="he-card-label">{c.label}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
