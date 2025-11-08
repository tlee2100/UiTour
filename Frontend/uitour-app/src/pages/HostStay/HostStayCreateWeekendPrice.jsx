import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateWeekendPrice() {
  const navigate = useNavigate();

  // ===== Mocked base price (weekday) =====
  const basePrice = 500000;

  // ===== Weekend premium (0–100%) =====
  const [premium, setPremium] = useState(4); // mặc định theo Figma là 4%
  const weekendPrice = Math.round(basePrice * (1 + premium / 100));
  const totalWithTax = Math.round(weekendPrice * 1.066); // cộng 6.6% thuế

  return (
    <div className="hs-page">
      {/* HEADER */}
      <header className="hs-header">
        <img
          src={logo}
          alt="UiTour Logo"
          className="hs-logo"
          onClick={() => navigate("/")}
        />
        <button className="hs-save-btn">Save & Exit</button>
      </header>

      {/* MAIN */}
      <main className="hs-weekend-main">
        <h1 className="hs-weekend-heading">
          Now, set your <br /> weekend base price
        </h1>

        <div className="hs-weekend-center">
          {/* Giá hiển thị */}
          <div className="hs-weekend-box">
            <span className="hs-weekend-symbol">đ</span>
            <span className="hs-weekend-price">
              {weekendPrice.toLocaleString("vi-VN")}
            </span>
          </div>

          <div className="hs-weekend-subtext">
            Guest price before taxes{" "}
            <strong>đ{totalWithTax.toLocaleString("vi-VN")}</strong>
          </div>
        </div>

        {/* Premium adjustment */}
        <div className="hs-weekend-premium">
          <span className="hs-weekend-label">Weekend premium</span>
          <div className="hs-weekend-control">
            <input
              type="range"
              min="0"
              max="100"
              value={premium}
              onChange={(e) => setPremium(Number(e.target.value))}
              className="hs-weekend-slider"
            />
            <span className="hs-weekend-percent">{premium}%</span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="hs-footer">
        <button
          className="hs-footer-btn hs-footer-btn--white"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--black"
          onClick={() => navigate("/host/stay/create/discount")}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
