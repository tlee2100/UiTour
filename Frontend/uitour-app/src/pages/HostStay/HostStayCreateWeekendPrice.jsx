import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateWeekendPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const pricing = stayData.pricing || {};
  const basePrice = Number(pricing.basePrice) || 0;

  const premium = pricing.weekendPremium || 0;

  // LẤY FEE TỪ CONTEXT
  const servicePercent = pricing.serviceFee?.percent || 0;
  const taxPercent = pricing.taxFee?.percent || 0;
  const feeRate = (servicePercent + taxPercent) / 100;

  // TÍNH GIÁ WEEKEND
  const weekendPrice = Math.round(basePrice * (1 + premium / 100));

  // GIÁ KHÁCH PHẢI TRẢ
  const finalCustomerPrice = Math.round(weekendPrice * (1 + feeRate));

  const handlePremiumChange = (value) => {
    updateField("weekend-price", {
      pricing: { ...pricing, weekendPremium: Number(value) }
    });
  };

  const handleNext = () => {
    if (!validateStep("weekend-price")) return;
    navigate("/host/stay/create/discount");
  };

  return (
    <div className="hs-page">
      <main className="hs-weekend-main">
        <h1 className="hs-weekend-heading">
          Now, set your weekend base price
        </h1>

        <div className="hs-weekend-center">

          <div className="hs-weekend-box">
            <span className="hs-weekend-symbol">$</span>
            <span className="hs-weekend-price">
              {weekendPrice.toLocaleString("en-US")}
            </span>
          </div>

          <div className="hs-weekend-subtext">
            Guest price including fees:{" "}
            <strong>${finalCustomerPrice.toLocaleString("en-US")}</strong>
            <br />
            <small>
              (Service {servicePercent}% + Tax {taxPercent}%)
            </small>
          </div>
        </div>

        <div className="hs-weekend-premium">
          <span className="hs-weekend-label">Weekend premium</span>
          <div className="hs-weekend-control">
            <input
              type="range"
              min="0"
              max="100"
              value={premium}
              onChange={e => handlePremiumChange(e.target.value)}
              className="hs-weekend-slider"
            />
            <span className="hs-weekend-percent">{premium}%</span>
          </div>
        </div>

      </main>
    </div>
  );
}
