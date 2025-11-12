import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateDetails() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  // ✅ Truy cập trực tiếp dữ liệu ở root (không còn capacity)
  const {
    bedrooms = 1,
    beds = 1,
    bathrooms = 1,
    accommodates = 1,
  } = stayData;

  const handleChange = (field, value) => {
    // ✅ Cập nhật trực tiếp từng field
    updateField("details", { [field]: value });
  };

  const handleNext = () => {
    if (!validateStep("details")) return;
    navigate("/host/stay/create/amenities");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">Let’s start with the basics</h1>

        <div className="hs-room-section">
          <h2 className="hs-room-title">How many people can stay here?</h2>

          <div className="hs-room-controls">
            <RoomControl
              label="Guests"
              value={accommodates}
              onIncrease={() => handleChange("accommodates", accommodates + 1)}
              onDecrease={() => handleChange("accommodates", Math.max(1, accommodates - 1))}
            />
            <RoomControl
              label="Bedrooms"
              value={bedrooms}
              onIncrease={() => handleChange("bedrooms", bedrooms + 1)}
              onDecrease={() => handleChange("bedrooms", Math.max(0, bedrooms - 1))}
            />
            <RoomControl
              label="Beds"
              value={beds}
              onIncrease={() => handleChange("beds", beds + 1)}
              onDecrease={() => handleChange("beds", Math.max(0, beds - 1))}
            />
            <RoomControl
              label="Bathrooms"
              value={bathrooms}
              onIncrease={() => handleChange("bathrooms", bathrooms + 1)}
              onDecrease={() => handleChange("bathrooms", Math.max(0, bathrooms - 1))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function RoomControl({ label, value, onIncrease, onDecrease }) {
  return (
    <div className="hs-room-control">
      <span className="hs-room-label">{label}</span>
      <div className="hs-room-actions">
        <button className="hs-circle-btn" onClick={onDecrease}>–</button>
        <span className="hs-room-value">{value}</span>
        <button className="hs-circle-btn" onClick={onIncrease}>+</button>
      </div>
    </div>
  );
}
