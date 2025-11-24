import React, { useState } from "react";
import "./ExpInfoBookingBox.css";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

function ExpInfoBookingBox({ 
  booking, 
  price: propPrice, 
  currency: propCurrency,
  maxGuests = 10,
  onBook,
  bookingLoading = false,
  bookingFeedback = null
}) {
  const { convertToCurrent, format } = useCurrency();
  const { language } = useLanguage();
  
  // ✅ Chuẩn hóa booking object
  const safeBooking = booking && typeof booking === "object" ? booking : {};

  // ✅ Lấy giá từ props (giả sử là USD), convert sang currency hiện tại
  const basePriceUSD = Number(propPrice || 0);
  const basePrice = convertToCurrent(basePriceUSD);

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
            {t(language, "booking.from")} {format(basePrice)}
          </span>
          <span className="expib-per">{t(language, "booking.perPerson")}</span>
        </div>
      </div>

      {/* ✅ Date Selection */}
      <div className="expib-field">
        <label className="expib-label">{t(language, "booking.selectDate")}</label>
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
        <label className="expib-label">{t(language, "booking.numberOfGuests")}</label>
        <input
          type="number"
          className="expib-input"
          min="1"
          max={maxGuests}
          value={guests}
          onChange={handleGuestsChange}
        />
        <span className="expib-hint">{t(language, "booking.max")} {maxGuests} {t(language, "booking.guests")}</span>
      </div>

      {/* ✅ Total Price */}
      {guests > 1 && (
        <div className="expib-total">
          <span className="expib-total-label">{t(language, "booking.total")}:</span>
          <span className="expib-total-price">
            {format(totalPrice)}
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
        {bookingLoading ? t(language, "booking.processing") : t(language, "booking.bookNow")}
      </button>

      {/* ✅ Time Slots (if available) */}
      {timeSlots.length > 0 && (
        <>
          <div className="expib-divider" />
          <div className="expib-slots">
            <p className="expib-slots-title">{t(language, "booking.availableTimeSlots")}:</p>
            {timeSlots.map((slot) => (
              <div className="expib-slot-item" key={slot.id}>
                <div className="expib-slot-label">
                  {slot.date
                    ? new Date(slot.date).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
                        month: "long",
                        day: "numeric",
                      })
                    : t(language, "booking.flexible")}
                </div>
                <div className="expib-slot-info">
                  {slot.time} — {slot.spotsAvailable} {t(language, "booking.spotsLeft")}
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
