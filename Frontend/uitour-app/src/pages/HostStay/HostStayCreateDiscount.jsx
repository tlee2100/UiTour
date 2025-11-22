import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateDiscount() {
  const { stayData, updateField, loadingDraft } = useHost();

  // ---- LOAD DISCOUNTS FROM CONTEXT ----
  const initMonthly = stayData.pricing?.discounts?.monthly?.percent ?? 0;
  const initWeekly = stayData.pricing?.discounts?.weekly?.percent ?? 0;
  const initSeason = stayData.pricing?.discounts?.seasonalDiscounts ?? [];
  const initEarly = stayData.pricing?.discounts?.earlyBird ?? [];

  const [monthly, setMonthly] = useState(initMonthly);
  const [weekly, setWeekly] = useState(initWeekly);
  const [seasonList, setSeasonList] = useState(initSeason);
  const [earlyList, setEarlyList] = useState(initEarly);

  // Modal state
  const [modalType, setModalType] = useState(null); // "monthly" | "weekly" | "season" | "early"
  const [percent, setPercent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [daysBefore, setDaysBefore] = useState("");
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];


  // -------- RESET FORM --------
  const resetForm = () => {
    setPercent("");
    setFromDate("");
    setToDate("");
    setDaysBefore("");
    setError("");
  };

  // -------- SYNC FROM DRAFT --------
  useEffect(() => {
    if (loadingDraft) return;

    const d = stayData.pricing?.discounts || {};

    setMonthly(d.monthly?.percent ?? 0);
    setWeekly(d.weekly?.percent ?? 0);
    setSeasonList(d.seasonalDiscounts ?? []);
    setEarlyList(d.earlyBird ?? []);
  }, [loadingDraft]);

  // -------- SYNC TO CONTEXT --------
  useEffect(() => {
    if (loadingDraft) return;

    updateField("discounts", {
      monthly: { percent: monthly },
      weekly: { percent: weekly },
      seasonalDiscounts: seasonList,
      earlyBird: earlyList,
    });
  }, [monthly, weekly, seasonList, earlyList, loadingDraft]);

  // ==========================
  //  SUBMIT ADD / EDIT
  // ==========================
  const submitModal = () => {
    const p = Number(percent);

    // MONTHLY / WEEKLY cho phép = 0
    if (modalType === "monthly" || modalType === "weekly") {
      if (isNaN(p) || p < 0 || p > 100) {
        setError("Percent must be between 0 and 100");
        return;
      }
    }

    // SEASON & EARLY: percent > 0
    if ((modalType === "season" || modalType === "early") && (isNaN(p) || p <= 0 || p > 100)) {
      setError("Percent must be between 1 and 100");
      return;
    }

    // -----------------------------
    // MONTHLY / WEEKLY
    // -----------------------------
    if (modalType === "monthly") {
      setMonthly(p);
      setModalType(null);
      resetForm();
      return;
    }

    if (modalType === "weekly") {
      setWeekly(p);
      setModalType(null);
      resetForm();
      return;
    }

    // -----------------------------
    // ADD SEASONAL
    // -----------------------------
    if (modalType === "season") {
      if (!fromDate || !toDate) {
        setError("Select both start and end dates");
        return;
      }

      if (fromDate < today || toDate < today) {
        setError("Dates cannot be in the past");
        return;
      }

      if (fromDate > toDate) {
        setError("Start date must be earlier than end date");
        return;
      }

      // ❗ RULE 4: Check overlap
      for (let s of seasonList) {
        const existingFrom = s.from;
        const existingTo = s.to;

        // Nếu KHÔNG rơi vào 2 trường hợp: trước toàn bộ hoặc sau toàn bộ → overlap
        const noOverlap =
          toDate < existingFrom || fromDate > existingTo;

        if (!noOverlap) {
          setError("This date range overlaps an existing seasonal discount");
          return;
        }
      }

      const newItem = {
        from: fromDate,
        to: toDate,
        percentage: p,
      };

      setSeasonList((prev) => [...prev, newItem]);
      setModalType(null);
      resetForm();
      return;
    }

    // -----------------------------
    // ADD EARLY-BIRD
    // -----------------------------
    if (modalType === "early") {
      const d = Number(daysBefore);

      if (isNaN(d) || d <= 0) {
        setError("Days must be > 0");
        return;
      }

      // ❗ RULE 5: Check duplicate daysBefore
      if (earlyList.some((e) => e.daysBefore === d)) {
        setError("This early-bird rule already exists");
        return;
      }

      setEarlyList((prev) => [...prev, { daysBefore: d, percent: p }]);
      setModalType(null);
      resetForm();
      return;
    }
  };


  // ==========================
  // UI COMPONENTS
  // ==========================

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
        <h1 className="he-title">Add discounts</h1>

        {/* ===================== */}
        {/*   MONTHLY + WEEKLY    */}
        {/* ===================== */}
        <h2 className="he-subsection-title">Long-stay discounts</h2>

        <div className="he-discount-card-group">
          <DiscountCard
            value={monthly}
            title="Monthly discount"
            subtitle="For stays of 28 nights or more"
            onClick={() => {
              resetForm();
              setModalType("monthly");
              setPercent(monthly);
            }}
            showDelete={false}
          />

          <DiscountCard
            value={weekly}
            title="Weekly discount"
            subtitle="For stays of 7 nights or more"
            onClick={() => {
              resetForm();
              setModalType("weekly");
              setPercent(weekly);
            }}
            showDelete={false}
          />
        </div>

        {/* ===================== */}
        {/*  SEASONAL DISCOUNTS   */}
        {/* ===================== */}
        <h2 className="he-subsection-title">Seasonal discounts</h2>

        {seasonList.map((s, i) => (
          <DiscountCard
            key={i}
            value={s.percentage}
            title={`${s.from} → ${s.to}`}
            subtitle="Seasonal discount"
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
            <div className="he-add-discount-title">Add seasonal discount</div>
            <div className="he-add-discount-subtitle">
              Apply discounts during selected dates
            </div>
          </div>
        </button>

        {/* ===================== */}
        {/*   EARLY-BIRD          */}
        {/* ===================== */}
        <h2 className="he-subsection-title">Early-bird discounts</h2>

        {earlyList.map((e, i) => (
          <DiscountCard
            key={i}
            value={e.percent}
            title={`Book ≥ ${e.daysBefore} days early`}
            subtitle="Early-bird promotion"
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
            <div className="he-add-discount-title">Add early-bird discount</div>
            <div className="he-add-discount-subtitle">
              Discount for bookings made far in advance
            </div>
          </div>
        </button>
      </main>

      {/* ===================== */}
      {/*       MODAL          */}
      {/* ===================== */}
      {modalType && (
        <div className="he-modal">
          <div
            className="he-modal-backdrop"
            onClick={() => setModalType(null)}
          />

          <div className="he-modal-card he-discount-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">
                {modalType === "monthly" && "Edit monthly discount"}
                {modalType === "weekly" && "Edit weekly discount"}
                {modalType === "season" && "Add seasonal discount"}
                {modalType === "early" && "Add early-bird discount"}
              </div>
              <button
                className="he-modal-close"
                onClick={() => setModalType(null)}
              >
                ×
              </button>
            </div>

            <div className="he-modal-body">
              {/* Percent input */}
              <div className="he-field">
                <label>Discount percent (%)</label>
                <input
                  className="he-input"
                  type="number"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </div>

              {/* Seasonal fields */}
              {modalType === "season" && (
                <>
                  <div className="he-field">
                    <label>From date</label>
                    <input
                      className="he-input"
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        const newFrom = e.target.value;

                        if (newFrom < today) {
                          setError("Start date cannot be in the past");
                          return;
                        }

                        setFromDate(newFrom);

                        if (toDate && newFrom > toDate) {
                          setToDate(newFrom);
                        }
                      }}
                    />
                  </div>

                  <div className="he-field">
                    <label>To date</label>
                    <input
                      className="he-input"
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        const newTo = e.target.value;

                        if (newTo < today) {
                          setError("End date cannot be in the past");
                          return;
                        }

                        if (fromDate && newTo < fromDate) {
                          setError("End date must be after start date");
                          return;
                        }

                        setToDate(newTo);
                        setError("");
                      }}
                    />
                  </div>
                </>
              )}

              {/* Early bird field */}
              {modalType === "early" && (
                <div className="he-field">
                  <label>Days before booking</label>
                  <input
                    className="he-input"
                    type="number"
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(e.target.value)}
                  />
                </div>
              )}

              {error && <div className="he-error-text">{error}</div>}
            </div>

            <div className="he-modal-footer">
              <button
                className="he-tertiary-btn"
                onClick={() => setModalType(null)}
              >
                Cancel
              </button>

              <button className="he-primary-btn" onClick={submitModal}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
