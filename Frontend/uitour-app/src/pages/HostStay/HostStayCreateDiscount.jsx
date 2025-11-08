import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 thêm dòng này
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateDiscount() {
  const navigate = useNavigate(); // 👈 khởi tạo hook điều hướng

  const [discounts, setDiscounts] = useState({
    newListing: false,
    lastMinute: false,
    weekly: false,
    monthly: false,
  });

  const toggleDiscount = (key) => {
    setDiscounts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="hs-page">
      {/* ===== Header ===== */}
      <header className="hs-header">
        <div className="hs-header-logo">
          <img src={logo} alt="UiTour logo" />
        </div>
        <button className="hs-header-save">Save & Exit</button>
      </header>

      {/* ===== Main Content ===== */}
      <main className="hs-discount-main">
        <h1 className="hs-discount-heading">Add discounts</h1>

        <div className="hs-discount-list">
          {/* New Listing Promotion */}
          <div
            className={`hs-discount-card ${
              discounts.newListing ? "is-selected" : ""
            }`}
            onClick={() => toggleDiscount("newListing")}
          >
            <div className="hs-discount-value">20%</div>
            <div className="hs-discount-info">
              <h3>New listing promotion</h3>
              <p>Offer 20% off your first 3 bookings</p>
            </div>
            <input
              type="checkbox"
              checked={discounts.newListing}
              readOnly
              className="hs-discount-checkbox"
            />
          </div>

          {/* Last Minute Discount */}
          <div
            className={`hs-discount-card ${
              discounts.lastMinute ? "is-selected" : ""
            }`}
            onClick={() => toggleDiscount("lastMinute")}
          >
            <div className="hs-discount-value">6%</div>
            <div className="hs-discount-info">
              <h3>Last-minute discount</h3>
              <p>For stays booked 14 days or less before arrival</p>
            </div>
            <input
              type="checkbox"
              checked={discounts.lastMinute}
              readOnly
              className="hs-discount-checkbox"
            />
          </div>

          {/* Weekly Discount */}
          <div
            className={`hs-discount-card ${
              discounts.weekly ? "is-selected" : ""
            }`}
            onClick={() => toggleDiscount("weekly")}
          >
            <div className="hs-discount-value">10%</div>
            <div className="hs-discount-info">
              <h3>Weekly discount</h3>
              <p>For stays of 7 nights or more</p>
            </div>
            <input
              type="checkbox"
              checked={discounts.weekly}
              readOnly
              className="hs-discount-checkbox"
            />
          </div>

          {/* Monthly Discount */}
          <div
            className={`hs-discount-card ${
              discounts.monthly ? "is-selected" : ""
            }`}
            onClick={() => toggleDiscount("monthly")}
          >
            <div className="hs-discount-value">20%</div>
            <div className="hs-discount-info">
              <h3>Monthly discount</h3>
              <p>For stays of 28 days or more</p>
            </div>
            <input
              type="checkbox"
              checked={discounts.monthly}
              readOnly
              className="hs-discount-checkbox"
            />
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="hs-footer">
        <button
          className="hs-footer-btn hs-footer-btn--white"
          onClick={() => navigate("/host/stay/create/weekend-price")} // 👈 đi về bước trước
        >
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--uitour"
          onClick={() => navigate("/")} // 👈 hoặc trang tiếp theo
        >
          Publish
        </button>
      </footer>
    </div>
  );
}
