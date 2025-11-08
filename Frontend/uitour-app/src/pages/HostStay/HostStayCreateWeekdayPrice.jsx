import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateWeekdayPrice() {
  const navigate = useNavigate();
  const [price, setPrice] = useState("");

  const TAX_RATE = 0.066; // ví dụ phí 6.6% (Airbnb khoảng đó)
  const numericPrice = Number(price) || 0;
  const total = Math.round(numericPrice * (1 + TAX_RATE));

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // chỉ giữ lại số
    setPrice(value);
  };

  const handleNext = () => {
    // TODO: save price
    navigate("/host/stay/create/weekend-price");
  };

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
      <main className="hs-price-main">
        <h1 className="hs-price-heading">Now, set a weekday base price</h1>

        <div className="hs-price-center">
          <div className="hs-price-box">
            <span className="hs-price-symbol">đ</span>
            <input
              type="text"
              className="hs-price-input"
              placeholder="500000"
              value={price}
              onChange={handleInputChange}
            />
          </div>

          <div className="hs-price-subtext">
            Guest price before taxes{" "}
            <strong>đ{total.toLocaleString("vi-VN")}</strong>
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
          onClick={handleNext}
          disabled={!price}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
