import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateDetails() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const { capacity = {} } = stayData;

  const handleChange = (field, value) => {
    updateField("details", { capacity: { ...capacity, [field]: value } });
  };

  const handleNext = () => {
    // (Bạn có thể viết validate cụ thể hơn ở file context)
    navigate("/host/stay/create/amenities");
  };

  return (
    <div className="hs-page">
      {/* ===== HEADER ===== */}

      {/* ===== MAIN ===== */}
      <main className="hs-main">
        <h1 className="hs-title">Let’s start with the basics</h1>
        <div className="hs-room-section">
          <h2 className="hs-room-title">How many people can stay here?</h2>
          <div className="hs-room-controls">
            <RoomControl
              label="Guests"
              value={capacity.maxGuests || 1}
              onIncrease={() => handleChange("maxGuests", (capacity.maxGuests || 1) + 1)}
              onDecrease={() => handleChange("maxGuests", Math.max(1, (capacity.maxGuests || 1) - 1))}
            />
            <RoomControl
              label="Bedrooms"
              value={capacity.bedrooms || 1}
              onIncrease={() => handleChange("bedrooms", (capacity.bedrooms || 1) + 1)}
              onDecrease={() => handleChange("bedrooms", Math.max(0, (capacity.bedrooms || 1) - 1))}
            />
            <RoomControl
              label="Beds"
              value={capacity.beds || 1}
              onIncrease={() => handleChange("beds", (capacity.beds || 1) + 1)}
              onDecrease={() => handleChange("beds", Math.max(0, (capacity.beds || 1) - 1))}
            />
            <RoomControl
              label="Bathrooms"
              value={capacity.bathrooms || 1}
              onIncrease={() => handleChange("bathrooms", (capacity.bathrooms || 1) + 1)}
              onDecrease={() => handleChange("bathrooms", Math.max(0, (capacity.bathrooms || 1) - 1))}
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
