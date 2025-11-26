import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostExperience.css";

export default function HostExperienceCreateDiscount() {
  const { updateField, experienceData, loadingDraft } = useHost();
  const { language } = useLanguage();

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

  // ---- SYNC AFTER DRAFT LOAD ----
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

    if (
      old.earlyBird === next.earlyBird &&
      JSON.stringify(old.byDaysBefore) === JSON.stringify(next.byDaysBefore) &&
      JSON.stringify(old.byGroupSize) === JSON.stringify(next.byGroupSize)
    ) {
      return;
    }

    updateField("discounts", next);
  }, [loadingDraft, earlyBird, daysBefore, groupSize]);

  // Reset modal input
  const resetForm = () => {
    setPercent("");
    setValue("");
    setError("");
  };

  const maxGuests = experienceData.capacity?.maxGuests || 1;

  const submitAdd = () => {
    const p = Number(percent);
    const v = Number(value);

    setError("");

    // ===== VALIDATIONS =====
    if (isNaN(p) || p <= 0 || p > 100) {
      setError(t(language, "hostExperience.discount.errorPercent"));
      return;
    }

    if (formType === "days" && (isNaN(v) || v <= 0 || v > 365)) {
      setError(t(language, "hostExperience.discount.errorDays"));
      return;
    }

    if (formType === "group" && (isNaN(v) || v <= 1)) {
      setError(t(language, "hostExperience.discount.errorGroupMin"));
      return;
    }

    if (formType === "group" && v > maxGuests) {
      setError(
        t(language, "hostExperience.discount.errorGroupMax").replace(
          "{{value}}",
          maxGuests
        )
      );
      return;
    }

    // ===== NO DUPLICATES =====
    if (formType === "days") {
      const duplicated = daysBefore.some((d) => d.days === v);
      if (duplicated) {
        setError(
          t(language, "hostExperience.discount.errorDuplicateDays").replace(
            "{{value}}",
            v
          )
        );
        return;
      }
      setDaysBefore((prev) => [...prev, { days: v, percent: p }]);
    }

    if (formType === "group") {
      const duplicated = groupSize.some((g) => g.guests === v);
      if (duplicated) {
        setError(
          t(language, "hostExperience.discount.errorDuplicateGroup").replace(
            "{{value}}",
            v
          )
        );
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

        {/* TITLE */}
        <h1 className="he-title">
          {t(language, "hostExperience.discount.title")}
        </h1>

        {/* -------- EARLY BIRD -------- */}
        <div className="he-discount-card-group">
          <button
            className={`he-discount-card ${earlyBird ? "is-active" : ""}`}
            onClick={() => setEarlyBird((prev) => !prev)}
          >
            <div className="he-discount-value">20%</div>
            <div className="he-discount-body">
              <div className="he-discount-title">
                {t(language, "hostExperience.discount.earlyBirdTitle")}
              </div>
              <div className="he-discount-subtitle">
                {t(language, "hostExperience.discount.earlyBirdSubtitle")}
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

        {/* -------- DISCOUNT BY DAYS BEFORE BOOKING -------- */}
        <h2 className="he-subsection-title">
          {t(language, "hostExperience.discount.discountByDays")}
        </h2>

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
                {t(language, "hostExperience.discount.daysItemTitle")
                  .replace("{{value}}", d.days)}
              </div>
              <div className="he-discount-subtitle">
                {t(language, "hostExperience.discount.addEarlyBooking")}
              </div>
            </div>
            <div className="he-discount-action">
              <Icon icon="mdi:close" width="18" />
            </div>
          </button>
        ))}

        {/* ADD BUTTON FOR DAYS */}
        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setFormType("days");
          }}
        >
          <div className="he-add-discount-icon">+</div>

          <div className="he-add-discount-body">
            <div className="he-add-discount-title">
              {t(language, "hostExperience.discount.addEarlyBooking")}
            </div>
            <div className="he-add-discount-subtitle">
              {t(language, "hostExperience.discount.addEarlyBookingSubtitle")}
            </div>
          </div>
        </button>

        {/* -------- BY GROUP SIZE -------- */}
        <h2 className="he-subsection-title">
          {t(language, "hostExperience.discount.discountByGroups")}
        </h2>

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
                {t(language, "hostExperience.discount.groupItemTitle")
                  .replace("{{value}}", g.guests)}
              </div>
              <div className="he-discount-subtitle">
                {t(language, "hostExperience.discount.addGroupDiscount")}
              </div>
            </div>
            <div className="he-discount-action">
              <Icon icon="mdi:close" width="18" />
            </div>
          </button>
        ))}

        {/* ADD BUTTON FOR GROUP */}
        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setFormType("group");
          }}
        >
          <div className="he-add-discount-icon">+</div>

          <div className="he-add-discount-body">
            <div className="he-add-discount-title">
              {t(language, "hostExperience.discount.addGroupDiscount")}
            </div>
            <div className="he-add-discount-subtitle">
              {t(language, "hostExperience.discount.addGroupDiscountSubtitle")}
            </div>
          </div>
        </button>
      </main>

      {/* -------- MODAL ADD DISCOUNT -------- */}
      {formType && (
        <div className="he-modal">
          <div className="he-modal-backdrop" onClick={() => setFormType(null)} />

          <div className="he-modal-card he-discount-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">
                {formType === "days"
                  ? t(language, "hostExperience.discount.modalTitleDays")
                  : t(language, "hostExperience.discount.modalTitleGroup")}
              </div>
              <button className="he-modal-close" onClick={() => setFormType(null)}>
                ×
              </button>
            </div>

            <div className="he-modal-body">
              <div className="he-field">
                <label>
                  {t(language, "hostExperience.discount.labelPercent")}
                </label>
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
                    ? t(language, "hostExperience.discount.labelMinDays")
                    : t(language, "hostExperience.discount.labelMinGroup")}
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
              <button className="he-tertiary-btn" onClick={() => setFormType(null)}>
                {t(language, "hostExperience.discount.cancel")}
              </button>

              <button className="he-primary-btn" onClick={submitAdd}>
                {t(language, "hostExperience.discount.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
