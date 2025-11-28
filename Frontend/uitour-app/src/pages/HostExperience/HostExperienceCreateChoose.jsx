import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostExperienceCreateChoose() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep, setFlowType, type } = useHost();
  const { language } = useLanguage();

  // Khi vào trang này phải đảm bảo flow type là "experience"
  useEffect(() => {
    setFlowType("experience");
  }, []);

  // 🔥 Categories đã được chuyển sang dùng key dịch
  const categories = [
    { id: "art", labelKey: "hostExperience.choose.categories.art", icon: "mdi:palette" },
    { id: "fitness", labelKey: "hostExperience.choose.categories.fitness", icon: "mdi:arm-flex" },
    { id: "food", labelKey: "hostExperience.choose.categories.food", icon: "mdi:hamburger" },
    { id: "history", labelKey: "hostExperience.choose.categories.history", icon: "mdi:bank" },
    { id: "nature", labelKey: "hostExperience.choose.categories.nature", icon: "mdi:tree" }
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

        {/* 🔥 Tiêu đề cũng chuyển sang i18n */}
        <h1 className="he-title">
          {t(language, "hostExperience.choose.title")}
        </h1>

        <div className="he-card-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`he-card ${experienceData.mainCategory === c.id ? "is-selected" : ""
                }`}
              onClick={() => handleSelect(c.id)}
            >
              <div className="he-card-icon">
                <Icon icon={c.icon} width="48" height="48" />
              </div>

              {/* 🔥 Nhãn category theo ngôn ngữ */}
              <div className="he-card-label">
                {t(language, c.labelKey)}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
