import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayTypeOfPlace() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const options = [
    {
      id: "entire",
      icon: "mdi:home-outline",
      title: "An entire place",
      desc: "Guests have the whole place to themselves.",
    },
    {
      id: "room",
      icon: "fluent:door-32-regular",
      title: "A room",
      desc: "Guests have their own room plus access to shared spaces.",
    },
  ];

  const handleSelect = (id) => {
    updateField("typeofplace", { roomType: id });
  };
  const handleNext = () => {
    if (!validateStep("typeofplace")) return;
    navigate("/host/stay/create/location");
  };

  return (
    <div className="hs-page">
      {/* Header */}
      {/* Main */}
      <main className="hs-main">
        <h1 className="hs-title">What type of place do guests have?</h1>
        <div className="hs-list">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`hs-list-item ${stayData.roomType === opt.id ? "is-selected" : ""}`}
              onClick={() => handleSelect(opt.id)}
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
