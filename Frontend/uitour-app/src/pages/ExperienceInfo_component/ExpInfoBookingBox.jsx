import React from "react";
import "./ExpInfoBookingBox.css";

function ExpInfoBookingBox({ priceData }) {
  if (!priceData) {
    priceData = {
      price: 730000,
      timeSlots: [
        { time: "1:00 - 5:00PM", spots: 10 },
        { time: "5:00 - 9:00PM", spots: 10 },
        { time: "5:30 - 9:30PM", spots: 10 },
        { time: "6:00 - 10:00PM", spots: 10 },
        { time: "1:00 - 5:00PM", spots: 10 },
      ],
      currency: "₫"
    };
  }

  const handleBookNow = () => {
    alert("✅ Booking success! (demo action)");
  };

  return (
    <div className="expib-box">
      
      {/* ✅ Header */}
      <div className="expib-header">
        <div className="expib-price">
          <span className="expib-price-text">From {priceData.currency}{priceData.price.toLocaleString()}</span>
          <span className="expib-per">/ person</span>
        </div>

        <button className="expib-book-btn" onClick={handleBookNow}>
          Book now
        </button>
      </div>

      {/* ✅ Timeslot Select */}
      <div className="expib-slots">
        {priceData.timeSlots.map((slot, i) => (
          <div className="expib-slot-item" key={i}>
            <div className="expib-slot-label">Today, September 23</div>
            <div className="expib-slot-info">
              {slot.time} — {slot.spots} spots available
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Divider */}
      <div className="expib-divider"></div>
    </div>
  );
}

export default ExpInfoBookingBox;
