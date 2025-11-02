import React from "react";
import "./ExpInfoBookingBox.css";

function ExpInfoBookingBox({ booking }) {
  if (!booking) {
    booking = {
      price: 730000,
      currency: "VND",
      dates: "Daily",
      timeSlots: [
        { date: "2025-09-23", time: "1:00 - 5:00PM", spots: 10 },
        { date: "2025-09-23", time: "5:00 - 9:00PM", spots: 10 },
        { date: "2025-09-24", time: "6:00 - 10:00PM", spots: 10 }
      ]
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
          <span className="expib-price-text">
            From{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: booking.currency
            }).format(booking.price)}
          </span>
          <span className="expib-per">/ person</span>
        </div>

        <button className="expib-book-btn" onClick={handleBookNow}>
          Book now
        </button>
      </div>

      {/* ✅ Timeslot Select */}
      <div className="expib-slots">
        {booking.timeSlots.map((slot, i) => (
          <div className="expib-slot-item" key={i}>
            <div className="expib-slot-label">
              {new Date(slot.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric"
              })}
            </div>
            <div className="expib-slot-info">
              {slot.time} — {slot.spots} spots available
            </div>
          </div>
        ))}
      </div>

      <div className="expib-divider"></div>
    </div>
  );
}

export default ExpInfoBookingBox;
