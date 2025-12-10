import React from "react";
import "./HIBookingBox.css";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApp } from "../../contexts/AppContext";
import { t } from "../../utils/translations";

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
  availability, // ✅ ADDED: nhận trạng thái availability từ HomeInfoPage
}) {
  // Nếu chưa có dữ liệu, tạo dữ liệu mặc định
  if (!property) return null;

  const { convertToCurrent, format } = useCurrency();
  const { language } = useLanguage();
  const { tripCount, user, token } = useApp();

  // ✅ Mapping dữ liệu từ Experience format → Booking UI
  // Base price in USD (for calculations and API)
  const basePriceUSD = property.pricing?.basePrice ?? property.price ?? 0;
  // Display price (converted to current currency for UI)
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

  // ✅ Calculate all fees in USD (for API and breakdown)
  // Base total in USD (subtotal before discount)
  // Multiply nightly rate by number of nights and number of guests
  const baseTotalUSD = basePriceUSD * nights;
  const subtotalUSD = baseTotalUSD;
  
  // ✅ Calculate discount in USD (property discount + membership discount)
  const propertyDiscountPercentage = property.discountPercentage ?? 0;
  
  // ✅ Calculate membership discount percentage based on trip count
  const getMembershipDiscountPercent = () => {
    if (!user || !token || tripCount < 1) return 0;
    if (tripCount >= 1 && tripCount <= 5) return 5; // Bronze
    if (tripCount >= 6 && tripCount <= 10) return 10; // Silver
    if (tripCount > 10) return 15; // Gold
    return 0;
  };
  
  const membershipDiscountPercent = getMembershipDiscountPercent();
  
  const propertyDiscountUSD = propertyDiscountPercentage > 0
    ? baseTotalUSD * (propertyDiscountPercentage / 100)
    : 0;
  
  const membershipDiscountUSD = membershipDiscountPercent > 0
    ? baseTotalUSD * (membershipDiscountPercent / 100)
    : 0;
  
  const discountUSD = propertyDiscountUSD + membershipDiscountUSD;
  
  // Cleaning fee in USD (fixed amount, not percentage-based)
  const cleaningFeeUSD = Number(property.cleaningFee ?? 0);
  
  // Service fee calculation in USD
  // If percentage: calculate on ORIGINAL subtotal (before discount), otherwise use fixed amount
  const serviceFeePercent = property.serviceFee ?? 0;
  const serviceFeeUSD = (serviceFeePercent > 1 && serviceFeePercent <= 100)
    ? baseTotalUSD * (serviceFeePercent / 100) // Percentage on original subtotal
    : Number(serviceFeePercent || 0); // Fixed amount
  
  // Tax fee calculation in USD
  // If percentage: calculate on ORIGINAL subtotal (before discount), otherwise use fixed amount
  const taxFeePercent = property.taxFee ?? 0;
  const taxFeeUSD = (taxFeePercent > 1 && taxFeePercent <= 100)
    ? baseTotalUSD * (taxFeePercent / 100) // Percentage on original subtotal
    : Number(taxFeePercent || 0); // Fixed amount

  // ✅ Calculate total in USD
  // Formula: Subtotal - Discount + All Fees
  const totalPriceUSD = subtotalUSD - discountUSD + cleaningFeeUSD + serviceFeeUSD + taxFeeUSD;

  // ✅ Converted values for display (UI only)
  const cleaningFee = convertToCurrent(cleaningFeeUSD);
  const serviceFee = convertToCurrent(serviceFeeUSD);
  const taxFee = convertToCurrent(taxFeeUSD);
  const discount = convertToCurrent(discountUSD);
  const discountedTotal = convertToCurrent(totalPriceUSD);
  const totalPrice = convertToCurrent(subtotalUSD);

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

  // ✅ Handle Book button click - pass full breakdown data
  const handleBook = () => {
    const breakdown = {
      subtotal: subtotalUSD,
      discount: discountUSD,
      cleaningFee: cleaningFeeUSD,
      serviceFee: serviceFeeUSD,
      taxFee: taxFeeUSD,
      totalPrice: totalPriceUSD,
      nights: nights,
      guests: guests || 1,
      basePrice: basePriceUSD
    };
    
    // Call onBook with breakdown data
    onBook?.(breakdown);
  };

  return (
    <div className="hib-booking-box">
      {/* Header */}
      <div className="hib-header">
        <div className="hib-price">
          <span className="hib-price-value">{format(pricePerNight)}</span>
          <span className="hib-price-slash">/</span>
          <span className="hib-price-night">{t(language, "booking.night")}</span>
        </div>
        <div className="hib-rating">
          <div className="hib-rating-star">⭐</div>
          <span className="hib-rating-score">{rating}</span>
          <div className="hib-rating-dot"></div>
          <span className="hib-rating-reviews">{reviewsCount} {t(language, "booking.reviews")}</span>
        </div>
      </div>

      {/* Details */}
      <div className="hib-details">
        <div className="hib-details-row">
          <div className="hib-attribute">
            <span className="hib-attribute-label">{t(language, "booking.checkIn")}</span>
            <input
              type="date"
              className="hib-input"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange("checkIn", e.target.value)}
            />
          </div>
          <div className="hib-attribute">
            <span className="hib-attribute-label">{t(language, "booking.checkOut")}</span>
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
              <span className="hib-guests-title">{t(language, "booking.guests")}</span>
              <input
                type="number"
                className="hib-input"
                value={guests}
                min={1}
                max={maxGuests}
                onChange={(e) => handleGuestsChange(e.target.value)}
              />
            </div>
            <div className="hib-chevron">{t(language, "booking.max")} {maxGuests}</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        className="hib-book-button"
        onClick={handleBook}
        disabled={
          bookingLoading ||
          availability?.loading ||        
          availability?.isAvailable === false 
        }
      >
        <span className="hib-book-text">
          {availability?.loading
          ? "Checking availability..." // ✅ ADDED
          : bookingLoading
          ? t(language, "booking.processing")
          : t(language, "booking.bookNow")}
        </span>
      </button>

      <div className="hib-note">
        {availability?.error && (
        <div className="hib-feedback error"> {/* ✅ ADDED */}
          {availability.error}
        </div>
      )}
      {t(language, "booking.youWontBeChargedYet")}</div>

      {bookingFeedback?.message && (
        <div className={`hib-feedback ${bookingFeedback.type}`}>
          {bookingFeedback.message}
        </div>
      )}

      {/* Price Details */}
      <div className="hib-price-details">
        <div className="hib-row">
          <span className="hib-row-label">
            {format(pricePerNight)} x {nights} {nights > 1 ? t(language, "booking.nights") : t(language, "booking.night")}
          </span>
          <span className="hib-row-value">{format(totalPrice)}</span>
        </div>

        {discount > 0 && (
          <div className="hib-row">
            <span className="hib-row-label">{t(language, "booking.discount")}</span>
            <span className="hib-row-value hib-discount">
              -{format(discount)}
            </span>
          </div>
        )}

        <div className="hib-row">
          <span className="hib-row-label">{t(language, "booking.cleaningFee")}</span>
          <span className="hib-row-value">{format(cleaningFee)}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">{t(language, "booking.serviceFee")}</span>
          <span className="hib-row-value">{format(serviceFee)}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">{t(language, "booking.taxesAndFees")}</span>
          <span className="hib-row-value">{format(taxFee)}</span>
        </div>

        <div className="hib-divider"></div>

        <div className="hib-row hib-total">
          <span className="hib-row-label">{t(language, "booking.total")}</span>
          <span className="hib-row-value">{format(discountedTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default HIBookingBox;
