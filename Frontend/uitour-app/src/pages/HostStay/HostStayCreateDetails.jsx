import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateDetails() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

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
    maxNights = 30,
    preparationTime = 0,
    advanceNotice = 0,
  } = pricing;

  // Update root details fields
  const handleChange = (field, value) => {
    updateField("details", { [field]: value });
  };

  // Update nested pricing
  const handlePricingChange = (field, value) => {
    updateField("pricing", {
      ...pricing,
      [field]: value,
    });
  };

  const handleNext = () => {
    if (!validateStep("details")) return;
    navigate("/host/stay/create/amenities");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">
          {t(language, "hostStay.details.title")}
        </h1>

        {/* Guests, Rooms, Bathrooms */}
        <div className="hs-room-section">
          <h2 className="hs-room-title">
            {t(language, "hostStay.details.guestCapacityTitle")}
          </h2>

          <p className="hs-room-subtitle">
            {t(language, "hostStay.details.guestCapacitySubtitle")}
          </p>

          <div className="hs-room-controls">

            <RoomControl
              label={t(language, "hostStay.details.maxGuests")}
              value={accommodates}
              onIncrease={() => handleChange("accommodates", accommodates + 1)}
              onDecrease={() =>
                handleChange("accommodates", Math.max(1, accommodates - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.bedrooms")}
              value={bedrooms}
              onIncrease={() => handleChange("bedrooms", bedrooms + 1)}
              onDecrease={() =>
                handleChange("bedrooms", Math.max(0, bedrooms - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.beds")}
              value={beds}
              onIncrease={() => handleChange("beds", beds + 1)}
              onDecrease={() =>
                handleChange("beds", Math.max(0, beds - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.bathrooms")}
              value={bathrooms}
              onIncrease={() => handleChange("bathrooms", bathrooms + 1)}
              onDecrease={() =>
                handleChange("bathrooms", Math.max(0, bathrooms - 1))
              }
            />
          </div>
        </div>

        {/* Stay duration */}
        <div className="hs-room-section">
          <h2 className="hs-room-title">
            {t(language, "hostStay.details.stayDurationTitle")}
          </h2>

          <div className="hs-room-controls">

            <RoomControl
              label={t(language, "hostStay.details.minNights")}
              value={minNights}
              onIncrease={() =>
                handlePricingChange("minNights", Math.min(minNights + 1, maxNights))
              }
              onDecrease={() =>
                handlePricingChange("minNights", Math.max(1, minNights - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.maxNights")}
              value={maxNights}
              onIncrease={() =>
                handlePricingChange("maxNights", Math.min(30, maxNights + 1))
              }
              onDecrease={() =>
                handlePricingChange("maxNights", Math.max(minNights, maxNights - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.prepDays")}
              value={preparationTime}
              onIncrease={() =>
                handlePricingChange("preparationTime", preparationTime + 1)
              }
              onDecrease={() =>
                handlePricingChange("preparationTime", Math.max(0, preparationTime - 1))
              }
            />

            <RoomControl
              label={t(language, "hostStay.details.advanceNotice")}
              value={advanceNotice}
              onIncrease={() =>
                handlePricingChange("advanceNotice", advanceNotice + 1)
              }
              onDecrease={() =>
                handlePricingChange("advanceNotice", Math.max(0, advanceNotice - 1))
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
