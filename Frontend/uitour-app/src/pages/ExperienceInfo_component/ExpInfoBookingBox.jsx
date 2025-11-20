import React, { useState } from "react";
import "./ExpInfoBookingBox.css";

function ExpInfoBookingBox({ 
  booking, 
  price: propPrice, 
  currency: propCurrency,
  maxGuests = 10,
  onBook,
  bookingLoading = false,
  bookingFeedback = null
}) {
  // ✅ Chuẩn hóa booking object
  const safeBooking = booking && typeof booking === "object" ? booking : {};

  // ✅ Lấy giá từ props hoặc fallback từ pricing root của experience
  const basePrice = Number(propPrice || 0);
  const curr = propCurrency || "USD";

  const timeSlots = Array.isArray(safeBooking.timeSlots)
    ? safeBooking.timeSlots
    : [];

  const [guests, setGuests] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleBookNow = () => {
    if (!onBook) {
      alert("✅ Booking success! (demo action)");
      return;
    }
    onBook(guests, selectedDate);
  };

  const handleGuestsChange = (e) => {
    const value = Math.max(1, Math.min(Number(e.target.value) || 1, maxGuests));
    setGuests(value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const totalPrice = basePrice * guests;

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
      </div>

      {/* ✅ Date Selection */}
      <div className="expib-field">
        <label className="expib-label">Select Date</label>
        <input
          type="date"
          className="expib-input"
          value={selectedDate || ""}
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* ✅ Guests Selection */}
      <div className="expib-field">
        <label className="expib-label">Number of Guests</label>
        <input
          type="number"
          className="expib-input"
          min="1"
          max={maxGuests}
          value={guests}
          onChange={handleGuestsChange}
        />
        <span className="expib-hint">Max {maxGuests} guests</span>
      </div>

      {/* ✅ Total Price */}
      {guests > 1 && (
        <div className="expib-total">
          <span className="expib-total-label">Total:</span>
          <span className="expib-total-price">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: curr
            }).format(totalPrice)}
          </span>
        </div>
      )}

      {/* ✅ Booking Feedback */}
      {bookingFeedback && (
        <div className={`expib-feedback ${bookingFeedback.type === "error" ? "error" : "success"}`}>
          {bookingFeedback.message}
        </div>
      )}

      {/* ✅ Book Button */}
      <button 
        className="expib-book-btn" 
        onClick={handleBookNow}
        disabled={bookingLoading || !selectedDate}
      >
        {bookingLoading ? "Booking..." : "Book now"}
      </button>

      {/* ✅ Time Slots (if available) */}
      {timeSlots.length > 0 && (
        <>
          <div className="expib-divider" />
          <div className="expib-slots">
            <p className="expib-slots-title">Available Time Slots:</p>
            {timeSlots.map((slot) => (
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
            ))}
          </div>
        </>
      )}

      <div className="expib-divider" />
    </div>
  );
}

export default ExpInfoBookingBox;
