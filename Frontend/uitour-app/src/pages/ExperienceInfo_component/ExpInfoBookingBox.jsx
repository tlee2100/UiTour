import React from "react";
import "./ExpInfoBookingBox.css";

function ExpInfoBookingBox({ booking, price: propPrice, currency: propCurrency }) {
  // ✅ Chuẩn hóa booking object
  const safeBooking = booking && typeof booking === "object" ? booking : {};

  // ✅ Lấy giá từ props hoặc fallback từ pricing root của experience
  const basePrice = Number(propPrice || 0);
  const curr = propCurrency || "VND";

  const timeSlots = Array.isArray(safeBooking.timeSlots)
    ? safeBooking.timeSlots
    : [];

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
