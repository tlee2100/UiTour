import React, { useState } from "react";
import "./HostDashboard.css";
import HostHHeader from "../../components/headers/HostHHeader";

export default function HostDashboard() {
  // =========================
  //     MOCK DATA
  // =========================
  const yearlyStay = [1800, 2000, 2100, 2200, 1900, 2500, 2600, 2400, 2300, 2600, 2500, 2800];
  const yearlyExp = [1000, 1200, 1400, 1600, 1700, 1600, 1700, 1500, 1900, 1900, 1600, 2050];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const yearlyTotal = yearlyStay.map((v, i) => v + yearlyExp[i]);

  // =========================
  //     UI STATES
  // =========================
  const [barMode, setBarMode] = useState("all");
  const [pieMode, setPieMode] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0, label: "" });


  // =========================
  // BAR CHART DATA
  // =========================
  const barData =
    barMode === "stay" ? yearlyStay :
      barMode === "exp" ? yearlyExp :
        yearlyTotal;

  const maxVal = Math.max(...barData);

  // =========================
  // PIE DATA
  // =========================
  const totalStayYear = yearlyStay.reduce((a, b) => a + b, 0);
  const totalExpYear = yearlyExp.reduce((a, b) => a + b, 0);

  const yearStayPercent = (totalStayYear / (totalStayYear + totalExpYear)) * 100;
  const yearExpPercent = 100 - yearStayPercent;

  const monthStay = selectedMonth != null ? yearlyStay[selectedMonth] : 0;
  const monthExp = selectedMonth != null ? yearlyExp[selectedMonth] : 0;
  const monthTotal = monthStay + monthExp;

  const monthStayPercent = monthTotal ? (monthStay / monthTotal) * 100 : 0;
  const monthExpPercent = monthTotal ? (monthExp / monthTotal) * 100 : 0;

  const stayPercent = pieMode === "year" ? yearStayPercent : monthStayPercent;
  const expPercent = pieMode === "year" ? yearExpPercent : monthExpPercent;

  // SVG circle radius
  const R = 90;
  const CIRC = 2 * Math.PI * R;

  const stayDash = (stayPercent / 100) * CIRC;
  const expDash = (expPercent / 100) * CIRC;

  // =========================
  // HANDLE BAR CLICK
  // =========================
  const onMonthClick = (i) => {
    const total = yearlyStay[i] + yearlyExp[i];
    if (!total) return;

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
      label: months[i]
    });
  };

  const hideTooltip = () => {
    setTooltip({ ...tooltip, visible: false });
  };


  return (
    <>
      <HostHHeader />
      <div className="hostd-dashboard">
        <div className="hostd-charts-section">

          {/* BAR CHART */}
          <div className="hostd-chart-card">
            <h2 className="hostd-chart-title">Yearly Revenue</h2>

            <div className="hostd-toggle">
              <button className={barMode === "all" ? "active" : ""} onClick={() => setBarMode("all")}>All</button>
              <button className={barMode === "stay" ? "active" : ""} onClick={() => setBarMode("stay")}>Stay</button>
              <button className={barMode === "exp" ? "active" : ""} onClick={() => setBarMode("exp")}>Experience</button>
            </div>

            <div className="hostd-bar-chart-container">
              {barData.map((value, i) => {
                const heightPercent = (value / maxVal) * 100;
                const hasRevenue = yearlyStay[i] + yearlyExp[i] > 0;

                return (
                  <div className="hostd-bar-wrapper" key={i}>
                    <div
                      className="hostd-bar"
                      style={{ height: `${heightPercent}%`, opacity: hasRevenue ? 1 : 0.3 }}
                      title=""
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

          {/* PIE CHART */}
          <div className="hostd-chart-card">
            <h2 className="hostd-chart-title">Stay vs Experience</h2>

            <div className="hostd-toggle">
              <button className={pieMode === "year" ? "active" : ""} onClick={() => setPieMode("year")}>Yearly</button>
              <button className={pieMode === "month" ? "active" : ""} onClick={() => monthTotal && setPieMode("month")} disabled={!monthTotal}>Monthly</button>
            </div>

            <div className="hostd-pie-wrapper">
              <svg className="hostd-pie-svg" width="240" height="240" viewBox="0 0 240 240">
                {/* Experience circle (background) */}
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

                {/* Stay circle (top layer) */}
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
                    <div className="hostd-legend-label">Stay</div>
                    <div className="hostd-legend-value">
                      {pieMode === "year" ? `$${totalStayYear.toLocaleString()}` : `$${monthStay.toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <div className="hostd-legend-item">
                  <span className="hostd-legend-color hostd-legend-color--exp" />
                  <div>
                    <div className="hostd-legend-label">Experience</div>
                    <div className="hostd-legend-value">
                      {pieMode === "year" ? `$${totalExpYear.toLocaleString()}` : `$${monthExp.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>

              {pieMode === "month" && (
                <div className="hostd-pie-month-label">
                  Month: {months[selectedMonth]}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SUMMARY DATA */}
        <section className="hostd-stats-grid">
          <div className="hostd-stat-card">
            <div className="hostd-stat-label">Total Income (YTD)</div>
            <div className="hostd-stat-value">${(totalStayYear + totalExpYear).toLocaleString()}</div>
            <div className="hostd-stat-change">↑ 12% from last year</div>
          </div>

          <div className="hostd-stat-card">
            <div className="hostd-stat-label">Income This Month</div>
            <div className="hostd-stat-value">$4,850</div>
            <div className="hostd-stat-change">↑ 8% from last month</div>
          </div>

          <div className="hostd-stat-card">
            <div className="hostd-stat-label">Bookings This Month</div>
            <div className="hostd-stat-value">12</div>
            <div className="hostd-stat-change">↑ 3 from last month</div>
          </div>

          <div className="hostd-stat-card">
            <div className="hostd-stat-label">Upcoming Bookings</div>
            <div className="hostd-stat-value">8</div>
            <div className="hostd-stat-change">Next 30 days</div>
          </div>
        </section>
        {tooltip.visible && (
          <div
            className="hostd-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="hostd-tooltip-month">{tooltip.label}</div>
            <div className="hostd-tooltip-value">${tooltip.value.toLocaleString()}</div>
          </div>
        )}
      </div>
    </>
  );
}
