import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useEffect, useState } from "react";

export default function HostStayCreateWeekdayPrice() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();
  const { format, convertToCurrent, convertToUSD, currency } = useCurrency();

  const pricing = stayData.pricing || {};
  const baseUSD = Number(pricing.basePrice || 0);

  // raw number (no commas)
  const [rawValue, setRawValue] = useState("");
  // formatted version for display
  const [displayValue, setDisplayValue] = useState("");

  // Format function for input (NO decimals)
  const formatNumberForInput = (str) => {
    if (!str) return "";
    return Number(str).toLocaleString(currency === "VND" ? "vi-VN" : "en-US");
  };

  // init when currency changes
  useEffect(() => {
    const display = convertToCurrent(baseUSD);
    const raw = currency === "VND"
      ? String(Math.round(display))
      : String(Math.floor(display)); // USD no decimals in input

    setRawValue(raw);
    setDisplayValue(formatNumberForInput(raw));
  }, [currency]);

  // fees
  const servicePercent = pricing.serviceFee?.percent || 0;
  const taxPercent = pricing.taxFee?.percent || 0;

  const serviceRate = servicePercent / 100;
  const taxRate = taxPercent / 100;

  // compute total realtime from RAW
  const draftNumber = Number(rawValue || 0);
  const draftUSD = convertToUSD(draftNumber);
  const totalUSD = draftUSD * (1 + serviceRate + taxRate);
  const totalDisplay = convertToCurrent(totalUSD);

  // ============================================
  // INPUT ON CHANGE (FORMAT LIVE)
  // ============================================
  const handleInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, ""); // only numbers

    setRawValue(digits);
    setDisplayValue(formatNumberForInput(digits));
  };

  // SAVE WHEN LEAVE INPUT
  const handleBlur = () => {
    const num = Number(rawValue || 0);
    const usd = convertToUSD(num);

    updateField("weekday-price", {
      pricing: {
        ...pricing,
        basePrice: Number(usd.toFixed(2)),
      },
    });
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
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="hs-price-subtext">
            {t(language, "hostStay.weekdayPrice.guestSee")}{" "}
            <strong>{format(totalDisplay)}</strong>
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
