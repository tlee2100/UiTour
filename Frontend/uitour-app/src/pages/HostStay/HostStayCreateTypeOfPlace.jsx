import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayTypeOfPlace() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const options = [
    {
      id: 1,
      icon: "mdi:home-outline",
      title: "An entire place",
      desc: "Guests have the whole place to themselves.",
    },
    {
      id: 2,
      icon: "fluent:door-32-regular",
      title: "A room",
      desc: "Guests have their own room plus access to shared spaces.",
    },
  ];

  const handleSelect = (option) => {
    updateField("typeofplace", {
      roomTypeID: option.id,     // ✅ dùng cho backend
      roomTypeLabel: option.title,    // ✅ dùng cho frontend hiển thị
    });
  };

  const handleNext = () => {
    if (!validateStep("typeofplace")) return;
    navigate("/host/stay/create/location");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">What type of place do guests have?</h1>

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
