import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PaymentPage.css";
import { useLanguage } from "../contexts/LanguageContext";
import { t } from "../utils/translations";
import authAPI from "../services/authAPI";
import LoadingSpinner from "../components/LoadingSpinner";
import qrCodeImage from "../assets/qr-code.png";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Format USD currency (always display USD on payment page)
  const formatUSD = (value) => {
    return "$" + Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  // Get booking data from navigation state
  const bookingData = location.state?.bookingData;
  const propertyData = location.state?.propertyData;
  const tourData = location.state?.tourData;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Generate random invoice number
  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `${prefix}-${randomNum}`;
  };

  // Generate invoice number once on component mount
  const [invoiceNumber] = useState(() => generateInvoiceNumber());

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      navigate("/");
    }
  }, [bookingData, navigate]);

  if (!bookingData) {
    return <LoadingSpinner message={t(language, "payment.loadingPaymentDetails")} />;
  }

  const isProperty = !!bookingData.PropertyID;
  const itemData = isProperty ? propertyData : tourData;
  const itemTitle = isProperty 
    ? (propertyData?.listingTitle || propertyData?.title || "Property")
    : (tourData?.tourName || tourData?.title || "Tour");

  // Calculate price breakdown (handle both camelCase and PascalCase)
  // Always use USD values (no conversion) for payment page
  const basePrice = Number(bookingData.BasePrice || bookingData.basePrice || 0);
  const nights = Number(bookingData.Nights || bookingData.nights || 1);
  const cleaningFee = Number(bookingData.CleaningFee || bookingData.cleaningFee || 0);
  const serviceFee = Number(bookingData.ServiceFee || bookingData.serviceFee || 0);
  const totalPrice = Number(bookingData.TotalPrice || bookingData.totalPrice || 0);
  
  // For property: basePrice * nights, for tour: basePrice (already per person)
  const subtotal = isProperty ? basePrice * nights : basePrice;
  const discount = 0; // Can be calculated from discountPercentage if needed
  
  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get booking ID from the booking data (handle both camelCase and PascalCase)
      const bookingId = bookingData.BookingID || bookingData.bookingID || bookingData.id;
      
      if (!bookingId) {
        throw new Error(t(language, "payment.bookingIdNotFound"));
      }
      
      // Call backend to confirm transfer
      const result = await authAPI.confirmTransfer(bookingId);
      
      if (result) {
        setSuccess(true);
        // Redirect to trips page after 2 seconds
        setTimeout(() => {
          navigate("/trips");
        }, 2000);
      }
    } catch (err) {
      console.error("Error confirming transfer:", err);
      setError(err.message || t(language, "payment.failedToConfirmTransfer"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const locale = language === "vi" ? "vi-VN" : "en-US";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Generate payment content based on booking
  const getPaymentContent = () => {
    return invoiceNumber;
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>{t(language, "payment.completeYourPayment")}</h1>
          <p className="payment-subtitle">{t(language, "payment.reviewBookingDetails")}</p>
        </div>

        <div className="payment-content">
          {/* Booking Summary */}
          <div className="payment-section">
            <h2 className="section-title">{t(language, "payment.bookingSummary")}</h2>
            <div className="booking-summary">
              <div className="summary-item">
                <span className="summary-label">{t(language, "payment.item")}:</span>
                <span className="summary-value">{itemTitle}</span>
              </div>
              {isProperty && (
                <>
                  <div className="summary-item">
                    <span className="summary-label">{t(language, "payment.checkIn")}:</span>
                    <span className="summary-value">{formatDate(bookingData.CheckIn || bookingData.checkIn)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{t(language, "payment.checkOut")}:</span>
                    <span className="summary-value">{formatDate(bookingData.CheckOut || bookingData.checkOut)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{t(language, "booking.nights")}:</span>
                    <span className="summary-value">{nights}</span>
                  </div>
                </>
              )}
              {!isProperty && (
                <div className="summary-item">
                  <span className="summary-label">{t(language, "payment.date")}:</span>
                  <span className="summary-value">{formatDate(bookingData.CheckIn || bookingData.checkIn)}</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-label">{t(language, "payment.guests")}:</span>
                <span className="summary-value">{bookingData.GuestsCount || bookingData.guestsCount || 1}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t(language, "payment.invoiceNumber")}:</span>
                <span className="summary-value">{invoiceNumber}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t(language, "payment.paymentContent")}:</span>
                <span className="summary-value payment-content-text">{getPaymentContent()}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="payment-section">
            <h2 className="section-title">{t(language, "payment.paymentQrCode")}</h2>
            <div className="payment-notification">
              <span className="notification-icon">ℹ️</span>
              <span className="notification-text">
                {t(language, "payment.paymentNotification")}
              </span>
            </div>
            <div className="qr-code-container">
              <img 
                src={qrCodeImage} 
                alt="QR Code for Payment" 
                className="qr-code-image"
                onError={(e) => {
                  // Fallback to placeholder if image not found
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="qr-code-placeholder" style={{ display: 'none' }}>
                <div className="qr-code-icon">📱</div>
                <p className="qr-code-text">{t(language, "payment.qrCodeWillBeDisplayed")}</p>
                <p className="qr-code-note">{t(language, "payment.scanQrCode")}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="payment-section">
            <h2 className="section-title">{t(language, "payment.priceBreakdown")}</h2>
            <div className="price-breakdown">
              <div className="price-row">
                <span className="price-label">
                  {isProperty 
                    ? `${formatUSD(basePrice)} x ${nights} ${nights > 1 ? t(language, "booking.nights") : t(language, "booking.night")}`
                    : `${formatUSD(basePrice)} x ${bookingData.GuestsCount || bookingData.guestsCount || 1} ${(bookingData.GuestsCount || bookingData.guestsCount || 1) > 1 ? t(language, "payment.guests") : t(language, "payment.guest")}`
                  }
                </span>
                <span className="price-value">{formatUSD(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="price-row">
                  <span className="price-label">{t(language, "booking.discount")}</span>
                  <span className="price-value discount">-{formatUSD(discount)}</span>
                </div>
              )}
              
              {cleaningFee > 0 && (
                <div className="price-row">
                  <span className="price-label">{t(language, "booking.cleaningFee")}</span>
                  <span className="price-value">{formatUSD(cleaningFee)}</span>
                </div>
              )}
              
              {serviceFee > 0 && (
                <div className="price-row">
                  <span className="price-label">{t(language, "booking.serviceFee")}</span>
                  <span className="price-value">{formatUSD(serviceFee)}</span>
                </div>
              )}
              
              <div className="price-divider"></div>
              
              <div className="price-row total">
                <span className="price-label">{t(language, "payment.total")}</span>
                <span className="price-value">{formatUSD(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="payment-error">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="payment-success">
              {t(language, "payment.paymentConfirmed")}
            </div>
          )}

          {/* Action Buttons */}
          <div className="payment-actions">
            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading || success}
            >
              {t(language, "payment.back")}
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmTransfer}
              disabled={loading || success}
            >
              {loading ? t(language, "booking.processing") : success ? t(language, "payment.confirmed") : t(language, "payment.confirmTransfer")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

