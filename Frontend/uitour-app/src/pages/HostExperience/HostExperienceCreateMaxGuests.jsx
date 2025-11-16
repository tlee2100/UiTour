import { useState, useEffect } from "react";
import { useHost } from "../../contexts/HostContext";
import "./HostExperience.css";

export default function HostExperienceCreateMaxGuests() {
  const { updateField, experienceData, loadingDraft } = useHost();

  // Load từ context
  const initialTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
  const initialMax = experienceData.capacity?.maxGuests || 1;
  const initialPrice = experienceData.pricing?.basePrice || 0;

  // Parse time
  const now = new Date();
  const parsed = initialTime ? initialTime.split(/[: ]/) : null;

  const [hour, setHour] = useState(parsed ? parsed[0] : String(((now.getHours() + 11) % 12) + 1).padStart(2, "0"));
  const [minute, setMinute] = useState(parsed ? parsed[1] : String(now.getMinutes()).padStart(2, "0"));
  const [ampm, setAmpm] = useState(parsed ? parsed[2] : now.getHours() >= 12 ? "PM" : "AM");

  const [maxGuests, setMaxGuests] = useState(initialMax);
  const [pricePerGuest, setPricePerGuest] = useState(initialPrice);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesArr = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  // 🔄 Đồng bộ lại từ draft sau khi HostContext load xong
  useEffect(() => {
    if (loadingDraft) return; // chưa load xong thì kệ

    // Lấy lại giá trị mới nhất từ context
    const savedTime = experienceData.booking?.timeSlots?.[0]?.startTime || null;
    const savedMax = experienceData.capacity?.maxGuests || 1;
    const savedPrice = experienceData.pricing?.basePrice || 0;

    // Sync maxGuests + price
    setMaxGuests(savedMax);
    setPricePerGuest(savedPrice);

    // Nếu có time trong draft thì parse lại
    if (savedTime) {
      const parts = savedTime.split(/[: ]/); // ["HH","mm","AM/PM"]
      setHour(parts[0] || "01");
      setMinute(parts[1] || "00");
      setAmpm(parts[2] || "AM");
    }
  }, [loadingDraft, experienceData]);

  // Auto save time
  useEffect(() => {
    const startTime = `${hour}:${minute} ${ampm}`;

    updateField("booking", {
      timeSlots: [{ startTime }]
    });
  }, [hour, minute, ampm]);

  // Auto save capacity
  useEffect(() => {
    updateField("capacity", { maxGuests });
  }, [maxGuests]);

  // Auto save price
  useEffect(() => {
    updateField("pricing", { basePrice: pricePerGuest });
  }, [pricePerGuest]);

  // Format cho đẹp khi hiển thị (10.000)
  const formatVND = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Convert chuỗi "10.000" → số 10000
  const parseVND = (str) => {
    if (!str) return 0;
    return Number(str.replace(/\./g, ""));
  };

  return (
    <div className="he-page">
      <main className="he-main he-time">
        <h1 className="he-title">Pick a time and number of guests</h1>

        {/* TIME */}
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

        {/* CAPACITY */}
        <div className="he-price-card">
          <div className="he-time-label">Capacity & pricing</div>

          <div className="he-price-grid">
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

            <div className="he-field">
              <label>Price per guest (VND)</label>
              <input
                className="he-input"
                type="text"
                value={formatVND(pricePerGuest)}
                placeholder="Enter price..."
                onChange={(e) => {
                  const raw = parseVND(e.target.value);
                  setPricePerGuest(raw);
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
