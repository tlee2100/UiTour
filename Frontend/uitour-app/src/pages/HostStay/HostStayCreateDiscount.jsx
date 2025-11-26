import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";

export default function HostStayCreateDiscount() {
  const { stayData, updateField, loadingDraft } = useHost();
  const { language } = useLanguage();

  // ---- LOAD DISCOUNTS ----
  const initMonthly = stayData.pricing?.discounts?.monthly?.percent ?? 0;
  const initWeekly = stayData.pricing?.discounts?.weekly?.percent ?? 0;
  const initSeason = stayData.pricing?.discounts?.seasonalDiscounts ?? [];
  const initEarly = stayData.pricing?.discounts?.earlyBird ?? [];

  const [monthly, setMonthly] = useState(initMonthly);
  const [weekly, setWeekly] = useState(initWeekly);
  const [seasonList, setSeasonList] = useState(initSeason);
  const [earlyList, setEarlyList] = useState(initEarly);

  const [modalType, setModalType] = useState(null);
  const [percent, setPercent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [daysBefore, setDaysBefore] = useState("");
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const resetForm = () => {
    setPercent("");
    setFromDate("");
    setToDate("");
    setDaysBefore("");
    setError("");
  };

  // Sync draft
  useEffect(() => {
    if (loadingDraft) return;

    const d = stayData.pricing?.discounts || {};

    setMonthly(d.monthly?.percent ?? 0);
    setWeekly(d.weekly?.percent ?? 0);
    setSeasonList(d.seasonalDiscounts ?? []);
    setEarlyList(d.earlyBird ?? []);
  }, [loadingDraft]);

  // Sync to context
  useEffect(() => {
    if (loadingDraft) return;

    updateField("discounts", {
      monthly: { percent: monthly },
      weekly: { percent: weekly },
      seasonalDiscounts: seasonList,
      earlyBird: earlyList,
    });
  }, [monthly, weekly, seasonList, earlyList, loadingDraft]);

  // SUBMIT
  const submitModal = () => {
    const p = Number(percent);

    // MONTHLY / WEEKLY allow 0–100
    if (modalType === "monthly" || modalType === "weekly") {
      if (isNaN(p) || p < 0 || p > 100) {
        setError(t(language, "hostStay.discount.error.percent0to100"));
        return;
      }
    }

    // SEASON / EARLY require 1–100
    if ((modalType === "season" || modalType === "early") && (isNaN(p) || p <= 0 || p > 100)) {
      setError(t(language, "hostStay.discount.error.percent1to100"));
      return;
    }

    // MONTHLY
    if (modalType === "monthly") {
      setMonthly(p);
      setModalType(null);
      resetForm();
      return;
    }

    // WEEKLY
    if (modalType === "weekly") {
      setWeekly(p);
      setModalType(null);
      resetForm();
      return;
    }

    // SEASONAL
    if (modalType === "season") {
      if (!fromDate || !toDate) {
        setError(t(language, "hostStay.discount.error.selectDate"));
        return;
      }

      if (fromDate < today || toDate < today) {
        setError(t(language, "hostStay.discount.error.pastDate"));
        return;
      }

      if (fromDate > toDate) {
        setError(t(language, "hostStay.discount.error.startBeforeEnd"));
        return;
      }

      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diff = (to - from) / (1000 * 60 * 60 * 24);

      if (diff > 365) {
        setError(t(language, "hostStay.discount.error.seasonTooLong"));
        return;
      }

      const limit = new Date();
      limit.setFullYear(limit.getFullYear() + 1);

      if (from > limit) {
        setError(t(language, "hostStay.discount.error.seasonTooFar"));
        return;
      }

      // Overlap
      for (let s of seasonList) {
        const noOverlap = toDate < s.from || fromDate > s.to;
        if (!noOverlap) {
          setError(t(language, "hostStay.discount.error.seasonOverlap"));
          return;
        }
      }

      setSeasonList((prev) => [...prev, { from: fromDate, to: toDate, percentage: p }]);
      setModalType(null);
      resetForm();
      return;
    }

    // EARLY-BIRD
    if (modalType === "early") {
      const d = Number(daysBefore);
      if (isNaN(d) || d <= 0) {
        setError(t(language, "hostStay.discount.error.daysPositive"));
        return;
      }
      if (d > 365) {
        setError(t(language, "hostStay.discount.error.daysMax365"));
        return;
      }
      if (earlyList.some((e) => e.daysBefore === d)) {
        setError(t(language, "hostStay.discount.error.duplicateEarly"));
        return;
      }

      setEarlyList((prev) => [...prev, { daysBefore: d, percent: p }]);
      setModalType(null);
      resetForm();
      return;
    }
  };

  const DiscountCard = ({ value, title, subtitle, onClick, showDelete }) => (
    <button className="he-discount-card is-active" onClick={onClick}>
      <div className="he-discount-value">{value}%</div>
      <div className="he-discount-body">
        <div className="he-discount-title">{title}</div>
        <div className="he-discount-subtitle">{subtitle}</div>
      </div>
      <div className="he-discount-action">
        {showDelete ? (
          <Icon icon="mdi:close" width="18" />
        ) : (
          <Icon icon="mdi:chevron-right" width="18" />
        )}
      </div>
    </button>
  );

  return (
    <div className="he-page">
      <main className="he-main he-discounts">
        <h1 className="he-title">
          {t(language, "hostStay.discount.title")}
        </h1>

        {/* ==================== */}
        {/* MONTHLY + WEEKLY */}
        {/* ==================== */}
        <h2 className="he-subsection-title">
          {t(language, "hostStay.discount.longStay")}
        </h2>

        <div className="he-discount-card-group">
          <DiscountCard
            value={monthly}
            title={t(language, "hostStay.discount.monthly")}
            subtitle={t(language, "hostStay.discount.monthlyDesc")}
            onClick={() => {
              resetForm();
              setModalType("monthly");
              setPercent(monthly);
            }}
          />

          <DiscountCard
            value={weekly}
            title={t(language, "hostStay.discount.weekly")}
            subtitle={t(language, "hostStay.discount.weeklyDesc")}
            onClick={() => {
              resetForm();
              setModalType("weekly");
              setPercent(weekly);
            }}
          />
        </div>

        {/* ==================== */}
        {/* SEASONAL */}
        {/* ==================== */}
        <h2 className="he-subsection-title">
          {t(language, "hostStay.discount.seasonal")}
        </h2>

        {seasonList.map((s, i) => (
          <DiscountCard
            key={i}
            value={s.percentage}
            title={`${s.from} → ${s.to}`}
            subtitle={t(language, "hostStay.discount.seasonLabel")}
            showDelete={true}
            onClick={() =>
              setSeasonList((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}

        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setModalType("season");
          }}
        >
          <div className="he-add-discount-icon">+</div>
          <div className="he-add-discount-body">
            <div className="he-add-discount-title">
              {t(language, "hostStay.discount.addSeason")}
            </div>
            <div className="he-add-discount-subtitle">
              {t(language, "hostStay.discount.addSeasonDesc")}
            </div>
          </div>
        </button>

        {/* ==================== */}
        {/* EARLY-BIRD */}
        {/* ==================== */}
        <h2 className="he-subsection-title">
          {t(language, "hostStay.discount.earlyBird")}
        </h2>

        {earlyList.map((e, i) => (
          <DiscountCard
            key={i}
            value={e.percent}
            title={t(language, "hostStay.discount.earlyTitle")
              .replace("{{days}}", e.daysBefore)}
            subtitle={t(language, "hostStay.discount.earlyLabel")}
            showDelete={true}
            onClick={() =>
              setEarlyList((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}

        <button
          className="he-add-discount-card"
          onClick={() => {
            resetForm();
            setModalType("early");
          }}
        >
          <div className="he-add-discount-icon">+</div>
          <div className="he-add-discount-body">
            <div className="he-add-discount-title">
              {t(language, "hostStay.discount.addEarly")}
            </div>
            <div className="he-add-discount-subtitle">
              {t(language, "hostStay.discount.addEarlyDesc")}
            </div>
          </div>
        </button>
      </main>

      {/* ==================== */}
      {/* MODAL */}
      {/* ==================== */}
      {modalType && (
        <div className="he-modal">
          <div className="he-modal-backdrop" onClick={() => setModalType(null)} />

          <div className="he-modal-card he-discount-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">
                {t(language, `hostStay.discount.modal.${modalType}`)}
              </div>

              <button className="he-modal-close" onClick={() => setModalType(null)}>
                ×
              </button>
            </div>

            <div className="he-modal-body">
              <div className="he-field">
                <label>
                  {t(language, "hostStay.discount.label.percent")}
                </label>
                <input
                  className="he-input"
                  type="number"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </div>

              {modalType === "season" && (
                <>
                  <div className="he-field">
                    <label>{t(language, "hostStay.discount.label.from")}</label>
                    <input
                      type="date"
                      className="he-input"
                      value={fromDate}
                      onChange={(e) => {
                        const f = e.target.value;
                        setFromDate(f);
                      }}
                    />
                  </div>

                  <div className="he-field">
                    <label>{t(language, "hostStay.discount.label.to")}</label>
                    <input
                      type="date"
                      className="he-input"
                      value={toDate}
                      onChange={(e) => {
                        const t = e.target.value;
                        setToDate(t);
                      }}
                    />
                  </div>
                </>
              )}

              {modalType === "early" && (
                <div className="he-field">
                  <label>{t(language, "hostStay.discount.label.daysBefore")}</label>
                  <input
                    type="number"
                    className="he-input"
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(e.target.value)}
                  />
                </div>
              )}

              {error && <div className="he-error-text">{error}</div>}
            </div>

            <div className="he-modal-footer">
              <button className="he-tertiary-btn" onClick={() => setModalType(null)}>
                {t(language, "common.cancel")}
              </button>

              <button className="he-primary-btn" onClick={submitModal}>
                {t(language, "common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
