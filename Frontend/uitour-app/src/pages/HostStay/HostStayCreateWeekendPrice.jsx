import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateWeekendPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const basePrice = Number(stayData.pricing?.basePrice) || 0;
  const premium = stayData.pricing?.weekendPremium !== undefined
    ? Number(stayData.pricing.weekendPremium)
    : 0;
  const weekendPrice = Math.round(basePrice * (1 + premium / 100));
  const totalWithTax = Math.round(weekendPrice * 1.066);

  const handlePremiumChange = (value) => {
    updateField("weekend-price", {
      pricing: { ...stayData.pricing, weekendPremium: value }
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
          Now, set your <br /> weekend base price
        </h1>
        <div className="hs-weekend-center">
          <div className="hs-weekend-box">
            <span className="hs-weekend-symbol">đ</span>
            <span className="hs-weekend-price">
              {weekendPrice.toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="hs-weekend-subtext">
            Guest price before taxes <strong>đ{totalWithTax.toLocaleString("vi-VN")}</strong>
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
              onChange={e => handlePremiumChange(Number(e.target.value))}
              className="hs-weekend-slider"
            />
            <span className="hs-weekend-percent">{premium}%</span>
          </div>
        </div>
      </main>
    </div>
  );
}
