import React from "react";
import "./HIBookingBox.css";

function HIBookingBox({
  property,
  checkInDate,
  checkOutDate,
  guests,
  onDatesChange,
  onGuestsChange,
  onBook,
  bookingLoading = false,
  bookingFeedback = null,
}) {
  // Nếu chưa có dữ liệu, tạo dữ liệu mặc định
  if (!property) return null;

  // ✅ Mapping dữ liệu từ Experience format → Booking UI
  const basePrice = property.pricing?.basePrice ?? property.price ?? 0;
  const currency = property.pricing?.currency ?? property.currency ?? "USD";
  const pricePerNight = basePrice;


  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.round(
            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : property.nights ?? 1;
  const rating = property.rating ?? 0;
  const reviewsCount = property.reviewsCount ?? 0;
  const maxGuests = property.maxGuests ?? property.booking?.maxGuests ?? 2;

  // ✅ fallback phí (nếu backend thật sẽ điều chỉnh sau)
  const cleaningFee = property.cleaningFee ?? 0;
  const serviceFee = property.serviceFee ?? 0;
  const taxFee = property.taxFee ?? 0;
  const discount = property.discount ?? 0;

  // ✅ Tính tổng
  const totalPrice = basePrice * nights;
  const discountedTotal =
    totalPrice - discount + cleaningFee + serviceFee + taxFee;

  // ✅ Check-in/out fallback
  const checkIn = checkInDate || property.checkIn || "";
  const checkOut = checkOutDate || property.checkOut || "";

  const handleDateChange = (field, value) => {
    onDatesChange?.(field, value);
  };

  const handleGuestsChange = (value) => {
    const parsed = Number(value) || 1;
    onGuestsChange?.(Math.min(Math.max(parsed, 1), maxGuests));
  };

  return (
    <div className="hib-booking-box">
      {/* Header */}
      <div className="hib-header">
        <div className="hib-price">
          <span className="hib-price-value">${pricePerNight.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="hib-price-slash">/</span>
          <span className="hib-price-night">night</span>
        </div>
        <div className="hib-rating">
          <div className="hib-rating-star">⭐</div>
          <span className="hib-rating-score">{rating}</span>
          <div className="hib-rating-dot"></div>
          <span className="hib-rating-reviews">{reviewsCount} reviews</span>
        </div>
      </div>

      {/* Details */}
      <div className="hib-details">
        <div className="hib-details-row">
          <div className="hib-attribute">
            <span className="hib-attribute-label">CHECK-IN</span>
            <input
              type="date"
              className="hib-input"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange("checkIn", e.target.value)}
            />
          </div>
          <div className="hib-attribute">
            <span className="hib-attribute-label">CHECKOUT</span>
            <input
              type="date"
              className="hib-input"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange("checkOut", e.target.value)}
            />
          </div>
        </div>

        <div className="hib-details-row">
          <div className="hib-guests">
            <div className="hib-guests-label">
              <span className="hib-guests-title">GUESTS</span>
              <input
                type="number"
                className="hib-input"
                value={guests}
                min={1}
                max={maxGuests}
                onChange={(e) => handleGuestsChange(e.target.value)}
              />
            </div>
            <div className="hib-chevron">max {maxGuests}</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        className="hib-book-button"
        onClick={onBook}
        disabled={bookingLoading}
      >
        <span className="hib-book-text">
          {bookingLoading ? "Processing..." : "Book now"}
        </span>
      </button>

      <div className="hib-note">You won't be charged yet</div>

      {bookingFeedback?.message && (
        <div className={`hib-feedback ${bookingFeedback.type}`}>
          {bookingFeedback.message}
        </div>
      )}

      {/* Price Details */}
      <div className="hib-price-details">
        <div className="hib-row">
          <span className="hib-row-label">
            ${pricePerNight.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} x {nights} night{nights > 1 ? 's' : ''}
          </span>
          <span className="hib-row-value">${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Discount</span>
          <span className="hib-row-value hib-discount">
            -${discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Cleaning fee</span>
          <span className="hib-row-value">${cleaningFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Service fee</span>
          <span className="hib-row-value">${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Taxes and fees</span>
          <span className="hib-row-value">${taxFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="hib-divider"></div>

        <div className="hib-row hib-total">
          <span className="hib-row-label">Total</span>
          <span className="hib-row-value">${discountedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

export default HIBookingBox;
