import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";

export default function HostStayCreateWeekendPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const pricing = stayData.pricing || {};

  // Base price
  const basePrice = Number(pricing.basePrice) || 0;

  // USE ONLY weekendMultiplier
  const weekendMultiplier = Number(pricing.weekendMultiplier) || 1.0;

  // Weekend price = basePrice * multiplier
  const weekendPrice = Math.round(basePrice * weekendMultiplier);

  // Fees
  const servicePercent = pricing.serviceFee?.percent || 0;
  const taxPercent = pricing.taxFee?.percent || 0;
  const feeRate = (servicePercent + taxPercent) / 100;

  // Final guest price
  const finalCustomerPrice = Math.round(weekendPrice * (1 + feeRate));

  // Slider converts percent → multiplier
  const handleMultiplierChange = (percentValue) => {
    const p = Number(percentValue);
    const multiplier = 1 + p / 100;

    updateField("weekend-price", {
      pricing: {
        ...pricing,
        weekendMultiplier: multiplier
      }
    });
  };

  // Convert multiplier → slider percent
  const sliderPercent = Math.round((weekendMultiplier - 1) * 100);

  const handleNext = () => {
    if (!validateStep("weekend-price")) return;
    navigate("/host/stay/create/discount");
  };

  return (
    <div className="hs-page">
      <main className="hs-weekend-main">
        <h1 className="hs-weekend-heading">
          {t(language, "hostStay.weekendPrice.title")}
        </h1>

        <div className="hs-weekend-center">
          <div className="hs-weekend-box">
            <span className="hs-weekend-symbol">$</span>
            <span className="hs-weekend-price">
              {weekendPrice.toLocaleString("en-US")}
            </span>
          </div>

          <div className="hs-weekend-subtext">
            {t(language, "hostStay.weekendPrice.guestPrice")}{" "}
            <strong>
              ${finalCustomerPrice.toLocaleString("en-US")}
            </strong>
            <br />
            <small>
              {t(language, "hostStay.weekendPrice.fees")
                .replace("{{service}}", servicePercent)
                .replace("{{tax}}", taxPercent)}
            </small>
          </div>
        </div>

        <div className="hs-weekend-premium">
          <span className="hs-weekend-label">
            {t(language, "hostStay.weekendPrice.increase")}
          </span>

          <div className="hs-weekend-control">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPercent}
              onChange={(e) => handleMultiplierChange(e.target.value)}
              className="hs-weekend-slider"
            />
            <span className="hs-weekend-percent">{sliderPercent}%</span>
          </div>
        </div>
      </main>
    </div>
  );
}
