import React, { useEffect, useState } from "react";
import "./HostDashboard.css";
import HostHHeader from "../../components/headers/HostHHeader";

import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";

export default function HostDashboard() {
  const { language } = useLanguage();
  const { format, convertToCurrent } = useCurrency();
  const { user } = useApp();

  // ============ STATE DÙNG DATA THẬT ============
  const [summary, setSummary] = useState(null);
  const [yearlyStay, setYearlyStay] = useState(Array(12).fill(0));
  const [yearlyExp, setYearlyExp] = useState(Array(12).fill(0));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============ UI STATE ============
  const [barMode, setBarMode] = useState("all");      // all | stay | exp
  const [pieMode, setPieMode] = useState("year");     // year | month
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: "",
  });

  // ============ LABEL THÁNG ============
  const months = [
    t(language, "hostDashboard.months.jan"),
    t(language, "hostDashboard.months.feb"),
    t(language, "hostDashboard.months.mar"),
    t(language, "hostDashboard.months.apr"),
    t(language, "hostDashboard.months.may"),
    t(language, "hostDashboard.months.jun"),
    t(language, "hostDashboard.months.jul"),
    t(language, "hostDashboard.months.aug"),
    t(language, "hostDashboard.months.sep"),
    t(language, "hostDashboard.months.oct"),
    t(language, "hostDashboard.months.nov"),
    t(language, "hostDashboard.months.dec"),
  ];

  // Helper: chuẩn hoá mảng 12 tháng
  const normalize12 = (arr) => {
    const result = Array(12).fill(0);
    if (!Array.isArray(arr)) return result;
    for (let i = 0; i < 12 && i < arr.length; i++) {
      const v = Number(arr[i]);
      result[i] = Number.isNaN(v) ? 0 : v;
    }
    return result;
  };

  // ============ LOAD DATA TỪ API ============
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("Bạn cần đăng nhập để xem dashboard.");
        }

        // Resolve hostId giống HostToday
        let hostId =
          user.HostID ??
          user.hostID ??
          user?.Host?.HostID ??
          user?.host?.HostID ??
          null;

        if (!hostId) {
          const userId = user.UserID ?? user.userID ?? user.id ?? null;
          if (userId) {
            try {
              const host = await authAPI.getHostByUserId(userId);
              hostId = host?.HostID ?? host?.hostID ?? null;
            } catch (e) {
              console.error("getHostByUserId error:", e);
            }
          }
        }

        if (!hostId) {
          throw new Error("Tài khoản này chưa là host.");
        }

        const data = await authAPI.getHostDashboard(hostId);
        // data: { summary, yearlyStay, yearlyExp }

        setSummary(data.summary || null);
        setYearlyStay(normalize12(data.yearlyStay));
        setYearlyExp(normalize12(data.yearlyExp));
      } catch (err) {
        console.error("loadDashboard error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, language]);

  // ============ TÍNH TOÁN CHO BIỂU ĐỒ ============
  const yearlyTotal = yearlyStay.map((v, i) => v + yearlyExp[i]);

  const barData =
    barMode === "stay"
      ? yearlyStay
      : barMode === "exp"
      ? yearlyExp
      : yearlyTotal;

  const maxVal = Math.max(...barData, 1); // tránh chia 0

  const totalStayYear = yearlyStay.reduce((a, b) => a + b, 0);
  const totalExpYear = yearlyExp.reduce((a, b) => a + b, 0);

  const yearStayPercent =
    totalStayYear + totalExpYear > 0
      ? (totalStayYear / (totalStayYear + totalExpYear)) * 100
      : 0;
  const yearExpPercent = 100 - yearStayPercent;

  const monthStay =
    selectedMonth != null ? yearlyStay[selectedMonth] || 0 : 0;
  const monthExp =
    selectedMonth != null ? yearlyExp[selectedMonth] || 0 : 0;
  const monthTotal = monthStay + monthExp;

  const monthStayPercent = monthTotal ? (monthStay / monthTotal) * 100 : 0;
  const monthExpPercent = monthTotal ? (monthExp / monthTotal) * 100 : 0;

  const stayPercent = pieMode === "year" ? yearStayPercent : monthStayPercent;
  const expPercent = pieMode === "year" ? yearExpPercent : monthExpPercent;

  const R = 90;
  const CIRC = 2 * Math.PI * R;

  const stayDash = (stayPercent / 100) * CIRC;
  const expDash = (expPercent / 100) * CIRC;

  // ============ HANDLERS ============
  const onMonthClick = (i) => {
    if (!(yearlyStay[i] + yearlyExp[i])) return;
    setSelectedMonth(i);
    setPieMode("month");
  };

  const handleBarHover = (event, value, i) => {
    const rect = event.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      value,
      label: months[i],
    });
  };

  const hideTooltip = () => {
    setTooltip((old) => ({ ...old, visible: false }));
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="hostd-dashboard">
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hostd-dashboard">
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="hostd-dashboard">
      {/* Nếu muốn dùng header */}
      {/* <HostHHeader /> */}

      <div className="hostd-charts-section">
        {/* ========== BAR CHART ========== */}
        <div className="hostd-chart-card">
          <h2 className="hostd-chart-title">
            {t(language, "hostDashboard.yearlyRevenue")}
          </h2>

          <div className="hostd-toggle">
            <button
              className={barMode === "all" ? "active" : ""}
              onClick={() => setBarMode("all")}
            >
              {t(language, "hostDashboard.all")}
            </button>
            <button
              className={barMode === "stay" ? "active" : ""}
              onClick={() => setBarMode("stay")}
            >
              {t(language, "hostDashboard.stay")}
            </button>
            <button
              className={barMode === "exp" ? "active" : ""}
              onClick={() => setBarMode("exp")}
            >
              {t(language, "hostDashboard.experience")}
            </button>
          </div>

          <div className="hostd-bar-chart-container">
            {barData.map((value, i) => {
              const heightPercent = (value / maxVal) * 100;
              const hasRevenue = yearlyStay[i] + yearlyExp[i] > 0;

              return (
                <div className="hostd-bar-wrapper" key={i}>
                  <div
                    className="hostd-bar"
                    style={{
                      height: `${heightPercent}%`,
                      opacity: hasRevenue ? 1 : 0.3,
                    }}
                    onMouseMove={(e) => handleBarHover(e, value, i)}
                    onMouseLeave={hideTooltip}
                    onClick={() => onMonthClick(i)}
                  />
                  <div className="hostd-bar-label">{months[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== PIE CHART ========== */}
        <div className="hostd-chart-card">
          <h2 className="hostd-chart-title">
            {t(language, "hostDashboard.stayVsExp")}
          </h2>

          <div className="hostd-toggle">
            <button
              className={pieMode === "year" ? "active" : ""}
              onClick={() => setPieMode("year")}
            >
              {t(language, "hostDashboard.yearly")}
            </button>
            <button
              className={pieMode === "month" ? "active" : ""}
              onClick={() => monthTotal && setPieMode("month")}
              disabled={!monthTotal}
            >
              {t(language, "hostDashboard.monthly")}
            </button>
          </div>

          <div className="hostd-pie-wrapper">
            <svg
              className="hostd-pie-svg"
              width="240"
              height="240"
              viewBox="0 0 240 240"
            >
              <circle
                className="pie-anim"
                cx="120"
                cy="120"
                r={R}
                fill="none"
                stroke="#7DEFFF"
                strokeWidth="30"
                strokeDasharray={`${expDash} ${CIRC}`}
                strokeDashoffset={stayDash * -1}
              />
              <circle
                className="pie-anim"
                cx="120"
                cy="120"
                r={R}
                fill="none"
                stroke="#00C0E8"
                strokeWidth="30"
                strokeDasharray={`${stayDash} ${CIRC}`}
                strokeDashoffset="0"
              />
            </svg>

            <div className="hostd-pie-center-text">
              {Math.round(stayPercent)}% / {Math.round(expPercent)}%
            </div>

            <div className="hostd-pie-legend">
              <div className="hostd-legend-item">
                <span className="hostd-legend-color hostd-legend-color--stay" />
                <div>
                  <div className="hostd-legend-label">
                    {t(language, "hostDashboard.stay")}
                  </div>
                  <div className="hostd-legend-value">
                    {pieMode === "year"
                      ? format(convertToCurrent(totalStayYear))
                      : format(convertToCurrent(monthStay))}
                  </div>
                </div>
              </div>

              <div className="hostd-legend-item">
                <span className="hostd-legend-color hostd-legend-color--exp" />
                <div>
                  <div className="hostd-legend-label">
                    {t(language, "hostDashboard.experience")}
                  </div>
                  <div className="hostd-legend-value">
                    {pieMode === "year"
                      ? format(convertToCurrent(totalExpYear))
                      : format(convertToCurrent(monthExp))}
                  </div>
                </div>
              </div>
            </div>

            {pieMode === "month" && selectedMonth != null && (
              <div className="hostd-pie-month-label">
                {t(language, "hostDashboard.month")}: {months[selectedMonth]}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== SUMMARY CARDS ========== */}
      <section className="hostd-stats-grid">
        <div className="hostd-stat-card">
          <div className="hostd-stat-label">
            {t(language, "hostDashboard.totalIncome")}
          </div>
          <div className="hostd-stat-value">
            {summary
              ? format(convertToCurrent(summary.totalIncomeYTD || 0))
              : "--"}
          </div>
          <div className="hostd-stat-change">
            ↑ {summary?.totalIncomeYTDChange ?? 0}%{" "}
            {t(language, "hostDashboard.changeFromLastYear")}
          </div>
        </div>

        <div className="hostd-stat-card">
          <div className="hostd-stat-label">
            {t(language, "hostDashboard.incomeThisMonth")}
          </div>
          <div className="hostd-stat-value">
            {summary
              ? format(convertToCurrent(summary.incomeThisMonth || 0))
              : "--"}
          </div>
          <div className="hostd-stat-change">
            ↑ {summary?.incomeThisMonthChange ?? 0}%{" "}
            {t(language, "hostDashboard.changeFromLastMonth")}
          </div>
        </div>

        <div className="hostd-stat-card">
          <div className="hostd-stat-label">
            {t(language, "hostDashboard.bookingsThisMonth")}
          </div>
          <div className="hostd-stat-value">
            {summary?.bookingsThisMonth ?? 0}
          </div>
          <div className="hostd-stat-change">
            ↑ {summary?.bookingsThisMonthChange ?? 0}{" "}
            {t(language, "hostDashboard.moreThanLastMonthUnit")}
          </div>
        </div>

        <div className="hostd-stat-card">
          <div className="hostd-stat-label">
            {t(language, "hostDashboard.upcomingBookings")}
          </div>
          <div className="hostd-stat-value">
            {summary?.upcomingBookings ?? 0}
          </div>
          <div className="hostd-stat-change">
            {t(language, "hostDashboard.next30days")}
          </div>
        </div>
      </section>

      {tooltip.visible && (
        <div
          className="hostd-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="hostd-tooltip-month">{tooltip.label}</div>
          <div className="hostd-tooltip-value">
            {format(convertToCurrent(tooltip.value))}
          </div>
        </div>
      )}
    </div>
  );
}
