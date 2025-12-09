import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./PaymentPage.css";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import { t } from "../utils/translations";
import authAPI from "../services/authAPI";
import LoadingSpinner from "../components/LoadingSpinner";
import momoLogo from "../assets/momo-logo.svg";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user, token, dispatch } = useApp();

  const initialBookingData = location.state?.bookingData || null;
  const initialPropertyData = location.state?.propertyData || null;
  const initialTourData = location.state?.tourData || null;

  const [bookingData, setBookingData] = useState(initialBookingData);
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [tourData, setTourData] = useState(initialTourData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [autoConfirmStatus, setAutoConfirmStatus] = useState("idle");
  const [hasProcessedMomoReturn, setHasProcessedMomoReturn] = useState(false);

  const resultCodeFromQuery = searchParams.get("resultCode");
  const orderIdFromQuery = searchParams.get("orderId");
  const momoMessageFromQuery = searchParams.get("message");
  const queryBookingId = useMemo(() => {
    const id = searchParams.get("bookingId");
    return id ? Number(id) : null;
  }, [searchParams]);

  const bookingIdFromOrderId = useMemo(() => {
    if (!orderIdFromQuery) return null;
    const match = orderIdFromQuery.match(/booking-(\d+)/i);
    return match ? Number(match[1]) : null;
  }, [orderIdFromQuery]);

  const resolvedBookingId = useMemo(() => {
    if (bookingData) {
      return Number(bookingData.BookingID || bookingData.bookingID || bookingData.id) || null;
    }
    return queryBookingId || bookingIdFromOrderId || null;
  }, [bookingData, queryBookingId, bookingIdFromOrderId]);

  const isReturningFromMomo = Boolean(resultCodeFromQuery);

  // Generate random invoice number
  const generateInvoiceNumber = () => {
    const prefix = "INV";
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `${prefix}-${randomNum}`;
  };

  // Generate invoice number once on component mount
  const [invoiceNumber] = useState(() => orderIdFromQuery || generateInvoiceNumber());

  // Format USD currency (always display USD on payment page)
  const formatUSD = (value) => {
    return "$" + Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const safeDecode = (value) => {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const loadBookingDetails = useCallback(async (bookingIdValue) => {
    setLoadingBooking(true);
    setError(null);
    try {
      const booking = await authAPI.getBookingById(bookingIdValue);
      setBookingData(booking);

      if (booking.PropertyID) {
        const property = await authAPI.getPropertyById(booking.PropertyID);
        setPropertyData(property);
        setTourData(null);
      } else if (booking.TourID) {
        const tour = await authAPI.getTourById(booking.TourID);
        setTourData(tour);
        setPropertyData(null);
      }
    } catch (err) {
      setError(err.message || t(language, "payment.loadingPaymentDetails"));
    } finally {
      setLoadingBooking(false);
    }
  }, [language]);

  const confirmPayment = useCallback(async (bookingIdToConfirm, isAuto = false) => {
    if (!bookingIdToConfirm) {
      setError(t(language, "payment.bookingIdNotFound"));
      return;
    }

    setLoading(true);
    setError(null);

    if (isAuto) {
      setAutoConfirmStatus("processing");
    }

    try {
      await authAPI.confirmTransfer(bookingIdToConfirm);
      setSuccess(true);
      setAutoConfirmStatus(isAuto ? "success" : "manual-success");

      // Refresh trip count with confirmed bookings only
      if (user?.UserID) {
        try {
          const bookings = await authAPI.getUserBookings(user.UserID);
          const confirmed = (bookings || []).filter(
            (b) => (b.Status || b.status || "").toLowerCase() === "confirmed"
          );
          dispatch?.({ type: "SET_TRIP_COUNT", payload: confirmed.length });
        } catch (countErr) {
          console.error("Failed to refresh trip count after payment", countErr);
        }
      }

      setTimeout(() => {
        navigate("/trips");
      }, 2000);
    } catch (err) {
      setAutoConfirmStatus("error");
      setError(err.message || t(language, "payment.failedToConfirmTransfer"));
    } finally {
      setLoading(false);
    }
  }, [language, navigate]);

  const handleConfirmTransfer = useCallback(() => {
    confirmPayment(resolvedBookingId, false);
  }, [confirmPayment, resolvedBookingId]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!bookingData && resolvedBookingId && !loadingBooking) {
      loadBookingDetails(resolvedBookingId);
    }
  }, [bookingData, resolvedBookingId, loadingBooking, loadBookingDetails]);

  useEffect(() => {
    if (!initialBookingData && !resolvedBookingId && !loadingBooking) {
      navigate("/", { replace: true });
    }
  }, [initialBookingData, resolvedBookingId, navigate, loadingBooking]);

  useEffect(() => {
    if (!isReturningFromMomo || hasProcessedMomoReturn) {
      return;
    }

    if (!resolvedBookingId) {
      setError(t(language, "payment.bookingIdNotFound"));
      setAutoConfirmStatus("error");
      setHasProcessedMomoReturn(true);
      return;
    }

    setHasProcessedMomoReturn(true);

    if (resultCodeFromQuery === "0") {
      confirmPayment(resolvedBookingId, true);
    } else {
      const message = safeDecode(momoMessageFromQuery) || t(language, "payment.autoConfirmFailed");
      setError(`${t(language, "payment.momoReturnedError")} (${resultCodeFromQuery}) - ${message}`);
      setAutoConfirmStatus("error");
    }
  }, [
    confirmPayment,
    hasProcessedMomoReturn,
    isReturningFromMomo,
    language,
    momoMessageFromQuery,
    resolvedBookingId,
    resultCodeFromQuery
  ]);

  useEffect(() => {
    if (!hasProcessedMomoReturn) return;

    const keysToStrip = [
      "orderId",
      "requestId",
      "amount",
      "orderInfo",
      "orderType",
      "transId",
      "resultCode",
      "message",
      "payType",
      "extraData",
      "signature",
      "partnerCode",
      "responseTime"
    ];

    const params = new URLSearchParams(searchParams.toString());
    let mutated = false;

    keysToStrip.forEach((key) => {
      if (params.has(key)) {
        params.delete(key);
        mutated = true;
      }
    });

    if (mutated) {
      setSearchParams(params, { replace: true });
    }
  }, [hasProcessedMomoReturn, searchParams, setSearchParams]);

  if (!bookingData) {
    if (loadingBooking) {
      return <LoadingSpinner message={t(language, "payment.loadingPaymentDetails")} />;
    }

    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-content">
            <div className="payment-error">
              {error || t(language, "payment.loadingPaymentDetails")}
            </div>
            <div className="payment-actions">
              <button className="btn-secondary" onClick={() => navigate("/")}>
                {t(language, "payment.back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProperty = !!bookingData.PropertyID;
  const itemTitle = isProperty 
    ? (propertyData?.listingTitle || propertyData?.title || "Property")
    : (tourData?.tourName || tourData?.title || "Tour");

  // Read price breakdown directly from bookingData (all values calculated in HIBookingBox)
  // Handle both camelCase and PascalCase, and also check for breakdown fields
  const basePrice = Number(bookingData.BasePrice || bookingData.basePrice || 0);
  const nights = Number(bookingData.nights || bookingData.Nights || 1);
  const guests = Number(bookingData.guests || bookingData.GuestsCount || 1);
  
  // Read breakdown values from bookingData (passed from HIBookingBox via HomeInfoPage)
  const subtotal = Number(bookingData.subtotal || (isProperty ? basePrice * nights : basePrice));
  const discount = Number(bookingData.discount || 0);
  const cleaningFee = Number(bookingData.CleaningFee || bookingData.cleaningFee || 0);
  const serviceFee = Number(bookingData.ServiceFee || bookingData.serviceFee || 0);
  const taxFee = Number(bookingData.taxFee || 0); // TaxFee is passed via breakdown, not in Booking model
  
  // Calculate total price using the correct formula: subtotal - discount + cleaningFee + serviceFee + taxFee
  const totalPrice = subtotal - discount + cleaningFee + serviceFee + taxFee;

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

  const handleMethodSelect = (method) => {
    if (method === "momo") {
      setSelectedMethod("momo");
    }
  };

  const convertUsdToVnd = (usdAmount) => {
    if (!usdAmount || Number.isNaN(usdAmount)) return 0;
    return Math.max(1000, Math.round(Number(usdAmount) * 24000));
  };

  const formatVND = (value) => {
    return Number(value || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    });
  };

  const amountUsdForPayment = totalPrice;
  const amountVndForPayment = convertUsdToVnd(amountUsdForPayment);

  const handleInitiateMomoPayment = async () => {
    if (selectedMethod !== "momo") {
      return;
    }

    setInitiatingPayment(true);
    setError(null);

    try {
      const bookingId = resolvedBookingId;

      if (!bookingId) {
        throw new Error(t(language, "payment.bookingIdNotFound"));
      }

      const returnUrl = `${window.location.origin}/payment?bookingId=${bookingId}`;

      const payload = {
        amountUsd: amountUsdForPayment,
        amountVnd: amountVndForPayment,
        bookingId,
        orderId: invoiceNumber,
        description: `${itemTitle} - ${invoiceNumber}`,
        returnUrl
      };

      const response = await authAPI.createMomoPayment(payload);

      const redirectUrl = response?.payUrl || response?.deeplink;
      if (!redirectUrl) {
        throw new Error(t(language, "payment.payUrlMissing"));
      }

      // Mark booking as confirmed and refresh trips count before redirecting
      try {
        await authAPI.confirmTransfer(bookingId);

        if (user?.UserID) {
          const bookings = await authAPI.getUserBookings(user.UserID);
          const confirmed = (bookings || []).filter(
            (b) => (b.Status || b.status || "").toLowerCase() == "confirmed"
          );
          dispatch?.({ type: "SET_TRIP_COUNT", payload: confirmed.length });
        }
      } catch (confirmErr) {
        console.error("Failed to confirm booking before redirect", confirmErr);
      }

      // Continue to Momo payment page
      window.location.assign(redirectUrl);
    } catch (err) {
      console.error("Error initiating Momo payment:", err);
      setError(err.message || t(language, "payment.failedToConfirmTransfer"));
    } finally {
      setInitiatingPayment(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>{t(language, "payment.completeYourPayment")}</h1>
          <p className="payment-subtitle">{t(language, "payment.reviewBookingDetails")}</p>
        </div>

        <div className="payment-content">
          {isReturningFromMomo && autoConfirmStatus === "processing" && (
            <div className="payment-status info">
              {t(language, "payment.autoConfirmInProgress")}
            </div>
          )}

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

          {/* Payment Method Section */}
          <div className="payment-section">
            <h2 className="section-title">{t(language, "payment.paymentMethod")}</h2>
            <div className="payment-notification">
              <span className="notification-icon">ℹ️</span>
              <span className="notification-text">
                {t(language, "payment.paymentNotification")}
              </span>
            </div>
            <p className="payment-method-subtitle">
              {t(language, "payment.selectPaymentMethod")}
            </p>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method-card ${selectedMethod === "momo" ? "active" : ""}`}
                onClick={() => handleMethodSelect("momo")}
              >
                <div className="method-header">
                  <div className="method-title">
                    <span className="method-pill available">{t(language, "payment.availableNow")}</span>
                    <span>Momo</span>
                  </div>
                  <img
                    src={momoLogo}
                    alt="Momo logo"
                    className="method-logo"
                  />
                </div>
                <p className="method-description">
                  {t(language, "payment.momoDescription")}
                </p>
              </button>
              <div className="payment-method-card disabled" aria-disabled="true">
                <div className="method-header">
                  <div className="method-title">
                    <span className="method-pill unavailable">{t(language, "payment.comingSoon")}</span>
                    <span>{t(language, "payment.bankTransferLabel")}</span>
                  </div>
                </div>
                <p className="method-description">
                  {t(language, "payment.bankTransferUnavailable")}
                </p>
                <div className="method-overlay">
                  {t(language, "payment.methodUnavailableNote")}
                </div>
              </div>
            </div>
            <div className="method-cta-row">
              <div className="converted-amount">
                <span className="converted-label">{t(language, "payment.totalChargeLabel")}</span>
                <strong>{formatUSD(amountUsdForPayment)} ≈ {formatVND(amountVndForPayment)}</strong>
              </div>
              <button
                type="button"
                className="method-action-button"
                onClick={handleInitiateMomoPayment}
                disabled={initiatingPayment || selectedMethod !== "momo"}
              >
                {initiatingPayment ? t(language, "booking.processing") : t(language, "payment.initiateMomoPayment")}
              </button>
            </div>
            <p className="momo-note">{t(language, "payment.momoOnlyNote")}</p>
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
              
              <div className="price-row">
                <span className="price-label">{t(language, "booking.cleaningFee")}</span>
                <span className="price-value">{formatUSD(cleaningFee)}</span>
              </div>
              
              <div className="price-row">
                <span className="price-label">{t(language, "booking.serviceFee")}</span>
                <span className="price-value">{formatUSD(serviceFee)}</span>
              </div>
              
              <div className="price-row">
                <span className="price-label">{t(language, "booking.taxesAndFees")}</span>
                <span className="price-value">{formatUSD(taxFee)}</span>
              </div>
              
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
          <div className="payment-actions single">
            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading || success}
            >
              {t(language, "payment.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

