import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateWeekdayPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const basePrice = stayData.pricing?.basePrice || "";
  const TAX_RATE = 0.066;
  const numericPrice = Number(basePrice) || 0;
  const total = Math.round(numericPrice * (1 + TAX_RATE));

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // chỉ giữ lại số
    updateField("weekday-price", { pricing: { ...stayData.pricing, basePrice: value } });
  };

  const handleNext = () => {
    if (!validateStep("weekday-price")) return;
    navigate("/host/stay/create/weekend-price");
  };

  return (
    <div className="hs-page">
      <main className="hs-price-main">
        <h1 className="hs-price-heading">Now, set a weekday base price</h1>
        <div className="hs-price-center">
          <div className="hs-price-box">
            <span className="hs-price-symbol">đ</span>
            <input
              type="text"
              className="hs-price-input"
              placeholder="500000"
              value={basePrice}
              onChange={handleInputChange}
            />
          </div>
          <div className="hs-price-subtext">
            Guest price before taxes <strong>đ{total.toLocaleString("vi-VN")}</strong>
          </div>
        </div>
      </main>
    </div>
  );
}
