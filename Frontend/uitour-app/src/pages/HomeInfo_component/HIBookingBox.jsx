import React from "react";
import "./HIBookingBox.css";

function HIBookingBox({ property }) {
  // Nếu chưa có dữ liệu, tạo dữ liệu mặc định
  if (!property) return null;

  // ✅ Mapping dữ liệu từ Experience format → Booking UI
  const basePrice = property.pricing?.basePrice ?? property.price ?? 0;
  const currency = property.pricing?.currency ?? "VND";
  const pricePerNight = basePrice;


  const nights = property.nights ?? 1;
  const rating = property.rating ?? 0;
  const reviewsCount = property.reviewsCount ?? 0;
  const guests = property.booking?.maxGuests ?? 2;

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
  const checkIn = property.checkIn || "Chọn ngày";
  const checkOut = property.checkOut || "Chọn ngày";


  // Xử lý click "Book now"
  const handleBook = () => {
    alert("Booking confirmed! (Bạn có thể thay bằng xử lý thực tế sau)");
  };

  return (
    <div className="hib-booking-box">
      {/* Header */}
      <div className="hib-header">
        <div className="hib-price">
          <span className="hib-price-value">₫ {pricePerNight.toLocaleString()}</span>
          <span className="hib-price-slash">/</span>
          <span className="hib-price-night">đêm</span>
        </div>
        <div className="hib-rating">
          <div className="hib-rating-star">⭐</div>
          <span className="hib-rating-score">{rating}</span>
          <div className="hib-rating-dot"></div>
          <span className="hib-rating-reviews">{reviewsCount} đánh giá</span>
        </div>
      </div>

      {/* Details */}
      <div className="hib-details">
        <div className="hib-details-row">
          <div className="hib-attribute">
            <span className="hib-attribute-label">CHECK-IN</span>
            <span className="hib-attribute-value">{checkIn}</span>
          </div>
          <div className="hib-attribute">
            <span className="hib-attribute-label">CHECKOUT</span>
            <span className="hib-attribute-value">{checkOut}</span>
          </div>
        </div>

        <div className="hib-details-row">
          <div className="hib-guests">
            <div className="hib-guests-label">
              <span className="hib-guests-title">KHÁCH</span>
              <span className="hib-guests-value">{guests} khách</span>
            </div>
            <div className="hib-chevron">⌄</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="hib-book-button" onClick={handleBook}>
        <span className="hib-book-text">Đặt ngay</span>
      </button>

      <div className="hib-note">Bạn chưa bị trừ tiền</div>

      {/* Price Details */}
      <div className="hib-price-details">
        <div className="hib-row">
          <span className="hib-row-label">
            ₫{pricePerNight.toLocaleString()} x {nights} đêm
          </span>
          <span className="hib-row-value">₫{totalPrice.toLocaleString()}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Giảm giá</span>
          <span className="hib-row-value hib-discount">
            -₫{discount.toLocaleString()}
          </span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Phí dọn dẹp</span>
          <span className="hib-row-value">₫{cleaningFee.toLocaleString()}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Phí dịch vụ</span>
          <span className="hib-row-value">₫{serviceFee.toLocaleString()}</span>
        </div>

        <div className="hib-row">
          <span className="hib-row-label">Thuế và phí</span>
          <span className="hib-row-value">₫{taxFee.toLocaleString()}</span>
        </div>

        <div className="hib-divider"></div>

        <div className="hib-row hib-total">
          <span className="hib-row-label">Tổng cộng</span>
          <span className="hib-row-value">₫{discountedTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default HIBookingBox;
