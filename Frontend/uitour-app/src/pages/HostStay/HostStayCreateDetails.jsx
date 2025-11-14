import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateDetails() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  // Rooms & Guests
  const {
    bedrooms = 1,
    beds = 1,
    bathrooms = 1,
    accommodates = 1,
    pricing = {},
  } = stayData;

  const {
    minNights = 1,
    maxNights = 30
  } = pricing;

  // 🟢 Update field in root (details fields)
  const handleChange = (field, value) => {
    updateField("details", { [field]: value });
  };

  // 🟢 Update nested pricing fields
  const handlePricingChange = (field, value) => {
    updateField("pricing", {
      ...pricing,
      [field]: value
    });
  };

  const handleNext = () => {
    if (!validateStep("details")) return;
    navigate("/host/stay/create/amenities");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">Let’s start with the basics</h1>

        {/* Guests, Rooms, Bathrooms */}
        <div className="hs-room-section">
          <h2 className="hs-room-title">How many people can stay here?</h2>
          <p className="hs-room-subtitle">
            Set the number of guests, bedrooms, beds and bathrooms available in your place.
          </p>
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

        {/* 🟦 Min / Max Nights Section */}
        <div className="hs-room-section">
          <h2 className="hs-room-title">Guest stay duration</h2>

          <div className="hs-room-controls">
            {/* MIN NIGHTS */}
            <RoomControl
              label="Min nights"
              value={minNights}
              onIncrease={() =>
                handlePricingChange("minNights", Math.min(minNights + 1, maxNights))
              }
              onDecrease={() =>
                handlePricingChange("minNights", Math.max(1, minNights - 1))
              }
            />

            {/* MAX NIGHTS */}
            <RoomControl
              label="Max nights"
              value={maxNights}
              onIncrease={() =>
                handlePricingChange("maxNights", Math.min(30, maxNights + 1))
              }
              onDecrease={() =>
                handlePricingChange(
                  "maxNights",
                  Math.max(minNights, maxNights - 1)
                )
              }
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
