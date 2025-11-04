import React from "react";
import "./ExpInfoBookingBox.css";

function ExpInfoBookingBox({ booking, price: propPrice, currency: propCurrency }) {

  const basePrice = Number(propPrice ?? booking?.pricing?.basePrice ?? 0);
  const curr = propCurrency ?? booking?.pricing?.currency ?? "VND";
  const timeSlots = booking?.timeSlots || [];

  const handleBookNow = () => {
    alert("✅ Booking success! (demo action)");
  };

  return (
    <div className="expib-box">

      {/* ✅ Pricing */}
      <div className="expib-header">
        <div className="expib-price">
          <span className="expib-price-text">
            From{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: curr
            }).format(basePrice)}
          </span>
          <span className="expib-per">/ person</span>
        </div>

        <button className="expib-book-btn" onClick={handleBookNow}>
          Book now
        </button>
      </div>

      {/* ✅ Time Slots */}
      <div className="expib-slots">
        {timeSlots.length > 0 ? (
          timeSlots.map((slot) => (
            <div className="expib-slot-item" key={slot.id}>
              <div className="expib-slot-label">
                {slot.date
                  ? new Date(slot.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })
                  : "Flexible"}
              </div>
              <div className="expib-slot-info">
                {slot.time} — {slot.spotsAvailable} spots left
              </div>
            </div>
          ))
        ) : (
          <p className="expib-no-slots">No time slots available</p>
        )}
      </div>

      <div className="expib-divider" />
    </div>
  );
}

export default ExpInfoBookingBox;
