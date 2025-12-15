import BaseDropdown from "./BaseDropdown";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function TourPriceFilter({ current, onSelect }) {
  const { language } = useLanguage();
  const { currency } = useCurrency();

  // INPUT = USD (CANONICAL)
  const formatAmount = (usd) => {
    if (currency === "USD") {
      return "$" + usd.toFixed(2);
    }
    const vnd = usd * 25000;
    return vnd.toLocaleString("vi-VN") + "đ";
  };

  const priceLabels = {
    under20: `${t(language, "filters.price.under")} ${formatAmount(20)}`,
    "20to80": `${formatAmount(20)} – ${formatAmount(80)}`,
    "80to200": `${formatAmount(80)} – ${formatAmount(200)}`,
    over200: `${formatAmount(200)}+`,
  };

  const PRICE_OPTIONS = [
    { key: "under20" },
    { key: "20to80" },
    { key: "80to200" },
    { key: "over200" },
  ];

  return (
    <BaseDropdown>
      <div className="filter-title">{t(language, "filters.price.title")}</div>

      <div className="tour-price-options">
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`tour-price-chip ${current === opt.key ? "active" : ""}`}
            onClick={() => onSelect(opt.key)}
          >
            {priceLabels[opt.key]}
          </button>
        ))}
      </div>
    </BaseDropdown>
  );
}
