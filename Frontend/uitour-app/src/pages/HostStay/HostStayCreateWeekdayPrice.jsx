import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";

export default function HostStayCreateWeekdayPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const basePrice = stayData.pricing?.basePrice || "";

  // Fee lấy từ Context
  const servicePercent = stayData.pricing?.serviceFee?.percent || 0;
  const taxPercent = stayData.pricing?.taxFee?.percent || 0;

  const serviceRate = servicePercent / 100;
  const taxRate = taxPercent / 100;

  const numericPrice = Number(basePrice) || 0;

  // Tổng giá trả
  const totalGuestPrice = Math.round(
    numericPrice * (1 + serviceRate + taxRate)
  );

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
        <h1 className="hs-price-heading">
          {t(language, "hostStay.weekdayPrice.title")}
        </h1>

        <div className="hs-price-center">
          <div className="hs-price-box">
            <input
              type="text"
              className="hs-price-input"
              placeholder={t(language, "hostStay.weekdayPrice.placeholder")}
              value={basePrice}
              onChange={handleInputChange}
            />
          </div>

          <div className="hs-price-subtext">
            {t(language, "hostStay.weekdayPrice.guestSee")}{" "}
            <strong>
              ${totalGuestPrice.toLocaleString("vi-VN")}
            </strong>
          </div>

          <div className="hs-price-extra">
            {t(language, "hostStay.weekdayPrice.includes")
              .replace("{{service}}", servicePercent)
              .replace("{{tax}}", taxPercent)}
          </div>
        </div>
      </main>
    </div>
  );
}
