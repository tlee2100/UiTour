import { useState, useEffect } from "react";
import { useHost } from "../../contexts/HostContext";
import "./HostExperience.css";

export default function HostExperienceCreateMaxGuests() {
  const { updateField, experienceData, loadingDraft } = useHost();

  // Load từ context
  const initialTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
  const initialMax = experienceData.capacity?.maxGuests || 1;
  const initialPrice = Number(experienceData.pricing?.basePrice) || 0;
  const initialDuration = experienceData.durationHours || 1;

  // Parse time
  const now = new Date();
  const parsed = initialTime ? initialTime.split(/[: ]/) : null;

  const [hour, setHour] = useState(parsed ? parsed[0] : String(((now.getHours() + 11) % 12) + 1).padStart(2, "0"));
  const [minute, setMinute] = useState(parsed ? parsed[1] : String(now.getMinutes()).padStart(2, "0"));
  const [ampm, setAmpm] = useState(parsed ? parsed[2] : now.getHours() >= 12 ? "PM" : "AM");

  const [maxGuests, setMaxGuests] = useState(initialMax);

  // ⚡ Price: dùng number, tránh NaN và tránh "" gây validate fail
  const [pricePerGuest, setPricePerGuest] = useState(initialPrice);

  // Duration Hours
  const [durationHours, setDurationHours] = useState(initialDuration);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesArr = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  // ===========================
  // Sync lại draft từ context
  // ===========================
  useEffect(() => {
    if (loadingDraft) return;

    const savedTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
    const savedMax = experienceData.capacity?.maxGuests || 1;
    const savedPrice = Number(experienceData.pricing?.basePrice) || 0;
    const savedDuration = experienceData.durationHours || 1;

    setMaxGuests(savedMax);
    setPricePerGuest(savedPrice);
    setDurationHours(savedDuration);

    if (savedTime) {
      const parts = savedTime.split(/[: ]/);
      setHour(parts[0] || "01");
      setMinute(parts[1] || "00");
      setAmpm(parts[2] || "AM");
    }
  }, [loadingDraft, experienceData]);

  // ===========================
  // Auto save time slot
  // ===========================
  useEffect(() => {
    const startTime = `${hour}:${minute} ${ampm}`;
    updateField("booking", { timeSlots: [{ startTime }] });
  }, [hour, minute, ampm]);

  // ===========================
  // Auto save max guests
  // ===========================
  useEffect(() => {
    updateField("capacity", { maxGuests });
  }, [maxGuests]);

  // ===========================
  // Auto save price
  // ===========================
  useEffect(() => {
    if (pricePerGuest === "") {
      // Khi user đang xoá, không save gì cả
      return;
    }

    // Bình thường thì save số
    updateField("pricing", {
      basePrice: Number(pricePerGuest)
    });
  }, [pricePerGuest]);


  // ===========================
  // Auto save duration
  // ===========================
  useEffect(() => {
    if (durationHours === "") return;

    updateField("durationHours", { durationHours });
  }, [durationHours]);

  return (
    <div className="he-page">
      <main className="he-main he-time">
        <h1 className="he-title">Pick a time, duration and number of guests</h1>

        {/* START TIME */}
        <div className="he-time-card">
          <div className="he-time-label">Start time</div>

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
          <div className="he-time-label">Capacity & pricing</div>

          <div className="he-price-grid">

            {/* Max Guests */}
            <div className="he-field">
              <label>Max guests</label>
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

            {/* Duration Hours */}
            <div className="he-field">
              <label>Duration (hours)</label>
              <input
                type="number"
                className="he-input"
                min={1}
                max={24}
                value={durationHours}
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
                placeholder="Enter duration..."
              />
              <div className="he-time-hint">Duration must be between 1–24</div>
            </div>

            {/* PRICE */}
            <div className="he-field">
              <label>Price per guest (USD)</label>

              <input
                className="he-input"
                type="number"
                min={1}
                value={pricePerGuest === 0 ? "" : pricePerGuest}
                placeholder="Enter price..."
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setPricePerGuest("");
                    return;
                  }
                  setPricePerGuest(Number(v));
                }}
                onBlur={() => {
                  let v = Number(pricePerGuest);
                  if (!v || v < 1) v = 1;   // nếu rỗng hoặc <1 → set 1
                  setPricePerGuest(v);
                }}

              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
