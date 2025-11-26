import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayTypeOfPlace() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const options = [
    {
      id: 1,
      icon: "mdi:home-outline",
      title: t(language, "hostStay.typePlace.entire"),
      desc: t(language, "hostStay.typePlace.entireDesc"),
    },
    {
      id: 2,
      icon: "fluent:door-32-regular",
      title: t(language, "hostStay.typePlace.room"),
      desc: t(language, "hostStay.typePlace.roomDesc"),
    },
  ];

  const handleSelect = (opt) => {
    updateField("typeofplace", {
      roomTypeID: opt.id,
      roomTypeLabel: opt.title,
    });
  };

  const handleNext = () => {
    if (!validateStep("typeofplace")) return;
    navigate("/host/stay/create/location");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">
          {t(language, "hostStay.typePlace.title")}
        </h1>

        <div className="hs-list">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`hs-list-item ${
                stayData.roomTypeID === opt.id ? "is-selected" : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              <div className="hs-list-icon">
                <Icon icon={opt.icon} width="32" height="32" />
              </div>

              <div className="hs-list-text">
                <div className="hs-list-title">{opt.title}</div>
                <div className="hs-list-subtitle">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
