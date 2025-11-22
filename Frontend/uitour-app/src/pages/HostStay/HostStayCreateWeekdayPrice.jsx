import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateWeekdayPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();

  const basePrice = stayData.pricing?.basePrice || "";

  // ======= LẤY FEE TỪ CONTEXT (KHÔNG HARD CODE) =======
  const servicePercent = stayData.pricing?.serviceFee?.percent || 0;
  const taxPercent = stayData.pricing?.taxFee?.percent || 0;

  const serviceRate = servicePercent / 100;
  const taxRate = taxPercent / 100;

  const numericPrice = Number(basePrice) || 0;

  // Tổng giá khách phải trả
  const totalGuestPrice = Math.round(
    numericPrice * (1 + serviceRate + taxRate)
  );

  // Khi Host nhập giá
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    updateField("weekday-price", {
      pricing: {
        ...stayData.pricing,
        basePrice: value,
      },
    });
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
            <input
              type="text"
              className="hs-price-input"
              placeholder="200"
              value={basePrice}
              onChange={handleInputChange}
            />
          </div>

          <div className="hs-price-subtext">
            Guests will see approximately:{" "}
            <strong>${totalGuestPrice.toLocaleString("vi-VN")}</strong>
          </div>

          <div className="hs-price-extra">
            (Includes {servicePercent}% service fee + {taxPercent}% tax)
          </div>
        </div>
      </main>
    </div>
  );
}
