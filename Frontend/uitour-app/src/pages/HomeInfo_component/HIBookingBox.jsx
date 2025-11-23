import React from "react";
import "./HIBookingBox.css";
import { useCurrency } from "../../contexts/CurrencyContext";

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

  const { convertToCurrent, format } = useCurrency();

  // ✅ Mapping dữ liệu từ Experience format → Booking UI
  // Giả sử giá trong database là USD, convert sang currency hiện tại
  const basePriceUSD = property.pricing?.basePrice ?? property.price ?? 0;
  const pricePerNight = convertToCurrent(basePriceUSD);


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

  // Debug: Log property fees
  console.log("🔍 HIBookingBox - Property fees:", {
    cleaningFee: property.cleaningFee,
    serviceFee: property.serviceFee,
    taxFee: property.taxFee,
    extraGuestFee: property.extraGuestFee,
    property: property
  });

  // ✅ Fees - Giả sử các phí trong database là USD, convert sang currency hiện tại
  const cleaningFee = convertToCurrent(property.cleaningFee ?? 0);
  // ServiceFee and TaxFee: if stored as percentage, calculate based on total price
  // Otherwise, use the fixed amount
  const baseTotal = pricePerNight * nights;
  const serviceFeePercent = property.serviceFee ?? 0;
  const taxFeePercent = property.taxFee ?? 0;
  
  console.log("🔍 HIBookingBox - Calculated fees:", {
    cleaningFee,
    serviceFeePercent,
    taxFeePercent,
    baseTotal,
    nights
  });
  const serviceFee = serviceFeePercent > 1 && serviceFeePercent <= 100 
    ? convertToCurrent(baseTotal * (serviceFeePercent / 100)) // Percentage
    : convertToCurrent(serviceFeePercent); // Fixed amount
  const taxFee = taxFeePercent > 1 && taxFeePercent <= 100
    ? convertToCurrent(baseTotal * (taxFeePercent / 100)) // Percentage
    : convertToCurrent(taxFeePercent); // Fixed amount

  // ✅ Calculate discount based on DiscountPercentage from database
  const calculateDiscount = () => {
    const discountPercentage = property.discountPercentage ?? 0;
    if (discountPercentage <= 0) return 0;
    
    const baseTotal = pricePerNight * nights;
    const discountAmount = baseTotal * (discountPercentage / 100);
    
    return convertToCurrent(discountAmount);
  };

  const discount = calculateDiscount();

  // ✅ Tính tổng
  const totalPrice = pricePerNight * nights;
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
          <span className="hib-price-value">{format(pricePerNight)}</span>
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
            {format(pricePerNight)} x {nights} night{nights > 1 ? 's' : ''}
          </span>
          <span className="hib-row-value">{format(totalPrice)}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Discount</span>
          <span className="hib-row-value hib-discount">
            -{format(discount)}
          </span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Cleaning fee</span>
          <span className="hib-row-value">{format(cleaningFee)}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Service fee</span>
          <span className="hib-row-value">{format(serviceFee)}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Taxes and fees</span>
          <span className="hib-row-value">{format(taxFee)}</span>
        </div>

        <div className="hib-divider"></div>

        <div className="hib-row hib-total">
          <span className="hib-row-label">Total</span>
          <span className="hib-row-value">{format(discountedTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default HIBookingBox;
