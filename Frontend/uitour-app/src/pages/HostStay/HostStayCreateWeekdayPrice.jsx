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

  // base price stored in USD (from context/BE)
  const baseUSD = Number(pricing.basePrice || 0);

  // Local input state (raw, no formatting)
  const [draftValue, setDraftValue] = useState("");

  // Setup initial input value ONLY on first mount or when currency changes
  useEffect(() => {
    const display = convertToCurrent(baseUSD);

    setDraftValue(
      currency === "VND"
        ? String(Math.round(display))
        : display.toString() // no .00, no formatting
    );
  }, [currency]); // ❗ removed baseUSD to avoid loop

  // percent fees
  const servicePercent = pricing.serviceFee?.percent || 0;
  const taxPercent = pricing.taxFee?.percent || 0;

  const serviceRate = servicePercent / 100;
  const taxRate = taxPercent / 100;

  // total for display (convert USD → currency)
  const totalUSD = baseUSD * (1 + serviceRate + taxRate);
  const totalDisplay = convertToCurrent(totalUSD);

  // Handle input (NO updateField here!)
  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDraftValue(raw);
  };

  // When Next → convert and save into context
  const handleNext = () => {
    const num = Number(draftValue || 0);

    const usd = convertToUSD(num);

    updateField("weekday-price", {
      pricing: {
        ...pricing,
        basePrice: Number(usd.toFixed(2)),
      },
    });

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
              value={draftValue}
              onChange={handleInputChange}
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

        <button
          onClick={handleNext}
          className="hs-primary-btn"
          style={{ marginTop: 40 }}
        >
          {t(language, "common.next")}
        </button>
      </main>
    </div>
  );
}
