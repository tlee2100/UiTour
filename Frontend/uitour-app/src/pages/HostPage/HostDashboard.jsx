import React from "react";
import "./HostDashboard.css";

export default function HostDashboard() {
  const yearlyData = [2800, 3200, 3500, 3800, 3600, 4100, 4300, 3900, 4200, 4500, 4100, 4850];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const stayIncome = 30580;
  const expIncome = 12000;
  const total = stayIncome + expIncome;
  const stayPercent = (stayIncome / total) * 100;
  const expPercent = (expIncome / total) * 100;

  // SVG arc helper: returns path d for an arc slice
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleRad)),
      y: cy + (r * Math.sin(angleRad))
    };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      `M ${cx} ${cy}`,                       // move to center
      `L ${start.x} ${start.y}`,             // line to arc start
      `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, // arc
      "Z"                                    // close path
    ].join(" ");
  };

  const stayAngle = (stayPercent / 100) * 360;
  const expAngleStart = stayAngle;
  const expAngleEnd = 360;

  // max for bar height calculations
  const maxVal = Math.max(...yearlyData);

  return (
    <div className="hostd-dashboard">
      {/* TOP CHARTS */}
      <div className="hostd-charts-section">
        {/* BAR CHART CARD */}
        <div className="hostd-chart-card">
          <h2 className="hostd-chart-title">Yearly Revenue</h2>

          <div className="hostd-bar-chart-container" role="img" aria-label="Yearly revenue bar chart">
            {yearlyData.map((value, i) => {
              const heightPercent = (value / maxVal) * 100;
              return (
                <div className="hostd-bar-wrapper" key={i}>
                  <div
                    className="hostd-bar"
                    style={{ height: `${heightPercent}%` }}
                    title={`${months[i]}: $${value.toLocaleString()}`}
                  />
                  <div className="hostd-bar-label">{months[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIE CHART CARD */}
        <div className="hostd-chart-card">
          <h2 className="hostd-chart-title">Stay vs Experience</h2>

          <div className="hostd-pie-wrapper">
            <svg className="hostd-pie-svg" viewBox="0 0 200 200" role="img" aria-label="Stay vs Experience pie chart">
              {/* Stay slice */}
              <path
                d={describeArc(100, 100, 90, 0, stayAngle)}
                fill="#00C0E8"
              />
              {/* Experience slice */}
              <path
                d={describeArc(100, 100, 90, stayAngle, expAngleEnd)}
                fill="#7DEFFF"
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
                  <div className="hostd-legend-value">{Math.round(stayPercent)}% · ${stayIncome.toLocaleString()}</div>
                </div>
              </div>

              <div className="hostd-legend-item">
                <span className="hostd-legend-color hostd-legend-color--exp" />
                <div>
                  <div className="hostd-legend-label">Experience</div>
                  <div className="hostd-legend-value">{Math.round(expPercent)}% · ${expIncome.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <section className="hostd-stats-grid" aria-label="Summary cards">
        <div className="hostd-stat-card">
          <div className="hostd-stat-label">Total Income (YTD)</div>
          <div className="hostd-stat-value">$42,580</div>
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
    </div>
  );
}
