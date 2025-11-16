import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useHost } from "../../contexts/HostContext";
import "./HostExperience.css";

export default function HostExperienceCreateDiscount() {
  const { updateField, experienceData, loadingDraft } = useHost();

  // ---- LOAD FROM CONTEXT ----
  const initEarlyBird = experienceData.discounts?.earlyBird ?? false;
  const initDays = experienceData.discounts?.byDaysBefore ?? [];
  const initGroups = experienceData.discounts?.byGroupSize ?? [];

  const [earlyBird, setEarlyBird] = useState(initEarlyBird);
  const [daysBefore, setDaysBefore] = useState(initDays);
  const [groupSize, setGroupSize] = useState(initGroups);

  const [formType, setFormType] = useState(null); // "days", "group"
  const [percent, setPercent] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // ---- SYNC SAU KHI LOAD DRAFT ----
  // ---- SYNC SAU KHI LOAD DRAFT ----
  useEffect(() => {
    if (loadingDraft) return;

    const d = experienceData.discounts || {};

    setEarlyBird(d.earlyBird ?? false);
    setDaysBefore(d.byDaysBefore ?? []);
    setGroupSize(d.byGroupSize ?? []);

  }, [loadingDraft]);


  useEffect(() => {
    if (loadingDraft) return;

    const old = experienceData.discounts || {};

    const next = {
      earlyBird,
      byDaysBefore: daysBefore,
      byGroupSize: groupSize
    };

    // 🛑 STOP nếu không thay đổi gì → tránh loop
    if (
      old.earlyBird === next.earlyBird &&
      JSON.stringify(old.byDaysBefore) === JSON.stringify(next.byDaysBefore) &&
      JSON.stringify(old.byGroupSize) === JSON.stringify(next.byGroupSize)
    ) {
      return;
    }

    updateField("discounts", next);

  }, [loadingDraft, earlyBird, daysBefore, groupSize]);


  // Reset modal fields
  const resetForm = () => {
    setPercent("");
    setValue("");
    setError("");
  };

  // ---- ADD DISCOUNT ----
  const submitAdd = () => {
    const p = Number(percent);
    const v = Number(value);

    if (isNaN(p) || p <= 0 || p > 100) {
      setError("Percent must be 1–100");
      return;
    }

    if (formType === "days") {
      if (isNaN(v) || v <= 0) {
        setError("Days must be > 0");
        return;
      }
      setDaysBefore((prev) => [...prev, { days: v, percent: p }]);
    }

    if (formType === "group") {
      if (isNaN(v) || v <= 1) {
        setError("Group size must be > 1");
        return;
      }
      setGroupSize((prev) => [...prev, { guests: v, percent: p }]);
    }

    setFormType(null);
    resetForm();
  };

  return (
    <div className="he-page">
      <main className="he-main he-discounts">
        <h1 className="he-title">Add discounts</h1>

        {/* -------- EARLY BIRD -------- */}
        <div className="he-discount-card-group">
          <button
            className={`he-discount-card ${earlyBird ? "is-active" : ""}`}
            onClick={() => setEarlyBird((p) => !p)}
          >
            <div className="he-discount-value">20%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">Early bird discount</div>
              <div className="he-discount-subtitle">
                Applies to bookings made 2+ weeks early.
              </div>
            </div>
            <div className="he-discount-action">
              {earlyBird ? (
                <Icon icon="mdi:check" width="20" />
              ) : (
                <Icon icon="mdi:checkbox-blank-outline" width="20" />
              )}
            </div>
          </button>
        </div>

        {/* -------- BY DAYS BEFORE BOOKING -------- */}
        <h2 className="he-subsection-title">Discount by days booked early</h2>

        {daysBefore.map((d, i) => (
          <button
            key={i}
            className="he-discount-card is-active"
            onClick={() =>
              setDaysBefore((prev) => prev.filter((_, idx) => idx !== i))
            }
          >
            <div className="he-discount-value">{d.percent}%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">
                Book ≥ {d.days} days early
              </div>
              <div className="he-discount-subtitle">
                Early booking discount
              </div>
            </div>
            <div className="he-discount-action">
              <Icon icon="mdi:close" width="18" />
            </div>
          </button>
        ))}

        {/* ADD BUTTON */}
        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setFormType("days");
          }}
        >
          <div className="he-add-discount-icon">+</div>

          <div className="he-add-discount-body">
            <div className="he-add-discount-title">Add early-booking discount</div>
            <div className="he-add-discount-subtitle">
              Give a discount for booking early
            </div>
          </div>
        </button>

        {/* -------- BY GROUP SIZE -------- */}
        <h2 className="he-subsection-title">Discount by group size</h2>

        {groupSize.map((g, i) => (
          <button
            key={i}
            className="he-discount-card is-active"
            onClick={() =>
              setGroupSize((prev) => prev.filter((_, idx) => idx !== i))
            }
          >
            <div className="he-discount-value">{g.percent}%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">
                Group of ≥ {g.guests} people
              </div>
              <div className="he-discount-subtitle">
                Large group discount
              </div>
            </div>
            <div className="he-discount-action">
              <Icon icon="mdi:close" width="18" />
            </div>
          </button>
        ))}

        {/* ADD BUTTON */}
        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setFormType("group");
          }}
        >
          <div className="he-add-discount-icon">+</div>

          <div className="he-add-discount-body">
            <div className="he-add-discount-title">Add group discount</div>
            <div className="he-add-discount-subtitle">
              Give discount for large groups
            </div>
          </div>
        </button>
      </main>

      {/* -------- MODAL ADD DISCOUNT -------- */}
      {formType && (
        <div className="he-modal">
          <div
            className="he-modal-backdrop"
            onClick={() => setFormType(null)}
          />

          <div className="he-modal-card he-discount-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">
                {formType === "days"
                  ? "Add early-booking discount"
                  : "Add group discount"}
              </div>
              <button
                className="he-modal-close"
                onClick={() => setFormType(null)}
              >
                ×
              </button>
            </div>

            <div className="he-modal-body">
              <div className="he-field">
                <label>Discount percent (%)</label>
                <input
                  className="he-input"
                  type="number"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </div>

              <div className="he-field">
                <label>
                  {formType === "days"
                    ? "Minimum days before booking"
                    : "Minimum group size"}
                </label>
                <input
                  className="he-input"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              {error && <div className="he-error-text">{error}</div>}
            </div>

            <div className="he-modal-footer">
              <button
                className="he-tertiary-btn"
                onClick={() => setFormType(null)}
              >
                Cancel
              </button>

              <button className="he-primary-btn" onClick={submitAdd}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
