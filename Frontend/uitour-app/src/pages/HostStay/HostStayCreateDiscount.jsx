import React from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateDiscount() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const discounts = stayData.discounts || {
    newListing: false,
    lastMinute: false,
    weekly: false,
    monthly: false,
  };

  const toggleDiscount = (key) => {
    updateField("discount", {
      discounts: {
        ...discounts,
        [key]: !discounts[key],
      },
    });
  };

  const handleNext = () => {
    if (!validateStep("discount")) return;
    // Đây là bước cuối cùng trong flow Stay, sẽ ra button Publish!
    navigate("/host/demo-preview");
  };

  return (
    <div className="hs-page">
      <main className="hs-discount-main">
        <h1 className="hs-discount-heading">Add discounts</h1>
        <div className="hs-discount-list">
          <div
            className={`hs-discount-card ${discounts.newListing ? "is-selected" : ""}`}
            onClick={() => toggleDiscount("newListing")}
          >
            <div className="hs-discount-value">20%</div>
            <div className="hs-discount-info">
              <h3>New listing promotion</h3>
              <p>Offer 20% off your first 3 bookings</p>
            </div>
            <input type="checkbox" checked={discounts.newListing} readOnly className="hs-discount-checkbox" />
          </div>
          <div className={`hs-discount-card ${discounts.lastMinute ? "is-selected" : ""}`} onClick={() => toggleDiscount("lastMinute")}> <div className="hs-discount-value">6%</div> <div className="hs-discount-info"> <h3>Last-minute discount</h3> <p>For stays booked 14 days or less before arrival</p> </div><input type="checkbox" checked={discounts.lastMinute} readOnly className="hs-discount-checkbox"/> </div>
          <div className={`hs-discount-card ${discounts.weekly ? "is-selected" : ""}`} onClick={() => toggleDiscount("weekly")}> <div className="hs-discount-value">10%</div> <div className="hs-discount-info"> <h3>Weekly discount</h3> <p>For stays of 7 nights or more</p> </div><input type="checkbox" checked={discounts.weekly} readOnly className="hs-discount-checkbox"/> </div>
          <div className={`hs-discount-card ${discounts.monthly ? "is-selected" : ""}`} onClick={() => toggleDiscount("monthly")}> <div className="hs-discount-value">20%</div> <div className="hs-discount-info"> <h3>Monthly discount</h3> <p>For stays of 28 days or more</p> </div><input type="checkbox" checked={discounts.monthly} readOnly className="hs-discount-checkbox"/> </div>
        </div>
      </main>
    </div>
  );
}
