import { useState, useEffect } from "react";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostExperience.css";
import { useCurrency } from "../../contexts/CurrencyContext";   // ⭐ ADD

export default function HostExperienceCreateMaxGuests() {
  const { updateField, experienceData, loadingDraft } = useHost();
  const { language } = useLanguage();
  const { currency, convertToCurrent, convertToUSD, format } = useCurrency(); // ⭐ ADD

  // Load từ context
  const initialTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
  const initialMax = experienceData.capacity?.maxGuests || 1;

  // base price stored in USD
  const baseUSD = Number(experienceData.pricing?.basePrice || 1);
  useEffect(() => {
    // Nếu chưa từng set basePrice → set mặc định
    if (!experienceData.pricing?.basePrice) {
      updateField("pricing", { basePrice: 1 });
    }
  }, []);


  // local input hiển thị
  const [priceInput, setPriceInput] = useState("");

  // Sync initial price → giá theo currency
  useEffect(() => {
    const display = convertToCurrent(baseUSD);

    setPriceInput(
      currency === "VND"
        ? String(Math.round(display))
        : display.toString()
    );
  }, [currency, baseUSD]);

  const initialDuration = experienceData.durationHours || 1;

  // Parse time
  const now = new Date();
  const parsed = initialTime ? initialTime.split(/[: ]/) : null;

  const [hour, setHour] = useState(
    parsed ? parsed[0] : String(((now.getHours() + 11) % 12) + 1).padStart(2, "0")
  );
  const [minute, setMinute] = useState(
    parsed ? parsed[1] : String(now.getMinutes()).padStart(2, "0")
  );
  const [ampm, setAmpm] = useState(parsed ? parsed[2] : now.getHours() >= 12 ? "PM" : "AM");

  const [maxGuests, setMaxGuests] = useState(initialMax);
  const [durationHours, setDurationHours] = useState(initialDuration);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesArr = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  // Sync draft from context
  useEffect(() => {
    if (loadingDraft) return;

    const savedTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
    const savedMax = experienceData.capacity?.maxGuests || 1;
    const savedDuration = experienceData.durationHours || 1;

    setMaxGuests(savedMax);
    setDurationHours(savedDuration);

    if (savedTime) {
      const parts = savedTime.split(/[: ]/);
      setHour(parts[0] || "01");
      setMinute(parts[1] || "00");
      setAmpm(parts[2] || "AM");
    }
  }, [loadingDraft, experienceData]);

  // Auto save time
  useEffect(() => {
    const startTime = `${hour}:${minute} ${ampm}`;
    updateField("booking", { timeSlots: [{ startTime }] });
  }, [hour, minute, ampm]);

  // Auto save max guests
  useEffect(() => {
    updateField("capacity", { maxGuests });
  }, [maxGuests]);

  // Auto save duration
  useEffect(() => {
    if (durationHours === "") return;
    updateField("durationHours", { durationHours });
  }, [durationHours]);

  // HANDLE PRICE INPUT — SIMILAR TO WEEKDAY PRICE
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPriceInput(raw);
  };

  const handlePriceBlur = () => {
    const num = Number(priceInput || 0);

    // convert current currency → USD
    const usd = convertToUSD(num);

    updateField("pricing", {
      basePrice: Number(usd.toFixed(2)),
    });

    // format lại input hiển thị cho đẹp
    const display = convertToCurrent(usd);
    setPriceInput(currency === "VND" ? String(Math.round(display)) : display.toString());
  };

  return (
    <div className="he-page">
      <main className="he-main he-time">

        {/* TITLE */}
        <h1 className="he-title">
          {t(language, "hostExperience.maxGuests.title")}
        </h1>

        {/* START TIME */}
        <div className="he-time-card">
          <div className="he-time-label">
            {t(language, "hostExperience.maxGuests.startTime")}
          </div>

          <div className="he-time-columns">
            <select className="he-time-select" value={hour} onChange={(e) => setHour(e.target.value)}>
              {hours.map(h => <option key={h}>{h}</option>)}
            </select>

            <div className="he-time-sep">:</div>

            <select className="he-time-select" value={minute} onChange={(e) => setMinute(e.target.value)}>
              {minutesArr.map(m => <option key={m}>{m}</option>)}
            </select>

            <select className="he-time-ampm" value={ampm} onChange={(e) => setAmpm(e.target.value)}>
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* CAPACITY + PRICE */}
        <div className="he-price-card">

          <div className="he-time-label">
            {t(language, "hostExperience.maxGuests.capacityPricing")}
          </div>

          <div className="he-price-grid">

            {/* MAX GUESTS */}
            <div className="he-field">
              <label>{t(language, "hostExperience.maxGuests.maxGuests")}</label>
              <select
                className="he-input"
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* DURATION */}
            <div className="he-field">
              <label>{t(language, "hostExperience.maxGuests.durationHours")}</label>

              <input
                type="number"
                className="he-input"
                min={1}
                max={24}
                value={durationHours}
                placeholder={t(language, "hostExperience.maxGuests.enterDuration")}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setDurationHours("");
                    return;
                  }
                  setDurationHours(Number(val));
                }}
                onBlur={() => {
                  let v = Number(durationHours);
                  if (!v || v < 1) v = 1;
                  if (v > 24) v = 24;
                  setDurationHours(v);
                }}
              />

              <div className="he-time-hint">
                {t(language, "hostExperience.maxGuests.durationHint")}
              </div>
            </div>

            {/* PRICE */}
            <div className="he-field">
              <label>
                {t(
                  language,
                  currency === "USD"
                    ? "hostExperience.maxGuests.pricePerGuestUSD"
                    : "hostExperience.maxGuests.pricePerGuestVND"
                )}
              </label>

              <input
                className="he-input"
                type="text"
                value={priceInput}
                placeholder={t(language, "hostExperience.maxGuests.enterPrice")}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
