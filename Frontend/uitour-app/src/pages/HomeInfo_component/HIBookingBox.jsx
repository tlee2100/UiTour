import React from "react";
import "./HIBookingBox.css";

function HIBookingBox({ property }) {
  // Nếu chưa có dữ liệu, tạo dữ liệu mặc định
  if (!property) {
    property = {
      pricePerNight: 0,
      nights: 1,
      rating: 0,
      reviewsCount: 0,
      discount: 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxFee: 0,
      checkIn: "Chọn ngày",
      checkOut: "Chọn ngày",
      guests: 2,
    };
  }

  // Giải nén dữ liệu từ property
  const {
    pricePerNight = 0,
    nights = 1,
    rating = 0,
    reviewsCount = 0,
    discount = 0,
    cleaningFee = 0,
    serviceFee = 0,
    taxFee = 0,
    checkIn = "Chọn ngày",
    checkOut = "Chọn ngày",
    guests = 2,
  } = property;

  // Tính toán giá trị
  const totalPrice = pricePerNight * nights;
  const discountedTotal = totalPrice - discount + cleaningFee + serviceFee + taxFee;

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
