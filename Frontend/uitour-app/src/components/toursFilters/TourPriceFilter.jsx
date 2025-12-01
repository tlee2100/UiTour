import BaseDropdown from "./BaseDropdown";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function TourPriceFilter({ current, onSelect }) {
  const { language } = useLanguage();
  const { currency } = useCurrency();

  const formatAmount = (vndValue) => {
    if (currency === "VND") {
      return vndValue.toLocaleString("vi-VN") + "đ";
    }
    const usd = vndValue / 25000;
    return "$" + usd.toFixed(2);
  };

  const priceLabels = {
    under500: `${t(language, "filters.price.under")} ${formatAmount(500000)}`,
    "500to2m": `${formatAmount(500000)} – ${formatAmount(2000000)}`,
    "2to5": `${formatAmount(2000000)} – ${formatAmount(5000000)}`,
    "5to10": `${formatAmount(5000000)} – ${formatAmount(10000000)}`,
    over10: `${formatAmount(10000000)}+`,
  };

  const PRICE_OPTIONS = [
    { key: "under500" },
    { key: "500to2m" },
    { key: "2to5" },
    { key: "5to10" },
    { key: "over10" },
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
