import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

import './TripsPage.css';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingTrip, setReviewingTrip] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comments: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  // modal state for cancel notice
  const [showCancelNotice, setShowCancelNotice] = useState(true);
  const [persistShowCancelNotice, setPersistShowCancelNotice] = useState(true);
  const [doNotShowChecked, setDoNotShowChecked] = useState(false);
  // cancel booking confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, success, removeToast } = useToast();
  const { user, dispatch } = useApp();
  const { convertToCurrent, format } = useCurrency();
  const { language } = useLanguage();
  const [toast, setToast] = useState({ show: false, message: '' });

  // Persist preference per-user so switching accounts/logging in shows the notice for the new user
  const noticeStorageKey = useMemo(() => {
    return user?.UserID ? `showTripCancelNotice:user:${user.UserID}` : 'showTripCancelNotice:anon';
  }, [user?.UserID]);

  // Helper function to normalize image URL
  const normalizeImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return null;
    }

    const trimmedUrl = url.trim();

    // If it's base64 or invalid, skip
    if (trimmedUrl.startsWith('data:image') || trimmedUrl.length < 10) {
      return null;
    }

    // If it's already a full URL (http/https), use directly
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    // If it's a relative path (starts with /), add base URL
    if (trimmedUrl.startsWith('/')) {
      return `http://localhost:5069${trimmedUrl}`;
    }

    // If it doesn't start with /, add / and base URL
    return `http://localhost:5069/${trimmedUrl}`;
  }, []);

  // Helper function to get first photo URL from property/tour
  const getFirstPhotoUrl = useCallback((item) => {
    if (!item) return null;

    // Try multiple ways to get photos: Photos (PascalCase) or photos (camelCase)
    const photos = item.Photos || item.photos || item.media?.photos || item.media?.Photos || [];

    if (!Array.isArray(photos) || photos.length === 0) {
      return null;
    }

    // Sort by SortIndex if available, otherwise use first photo
    const sortedPhotos = [...photos].sort((a, b) => {
      const aIndex = a.sortIndex ?? a.SortIndex ?? 0;
      const bIndex = b.sortIndex ?? b.SortIndex ?? 0;
      return aIndex - bIndex;
    });

    const firstPhoto = sortedPhotos[0];

    // Try multiple ways to get URL
    const url = firstPhoto?.url ||
      firstPhoto?.Url ||
      firstPhoto?.serverUrl ||
      firstPhoto?.ServerUrl ||
      firstPhoto?.imageUrl ||
      firstPhoto?.ImageUrl ||
      null;

    return normalizeImageUrl(url);
  }, [normalizeImageUrl]);

  const findUserReview = useCallback((item) => {
    if (!item) return null;
    const reviews = item.Reviews || item.reviews || [];
    if (!Array.isArray(reviews)) return null;
    return reviews.find((review) => {
      const reviewerId =
        review.userId ??
        review.UserId ??
        review.userID ??
        review.UserID ??
        review.user?.UserID ??
        review.User?.UserID;
      return reviewerId === user?.UserID;
    });
  }, [user?.UserID]);

  const getHostEmail = async (hostId) => {
    try {
      const data = await authAPI.getHostById(hostId);
      return data.user.email;
    } catch (err) {
      console.error("Cannot fetch host email", err);
      return null;
    }
  };

  const formatDateRange = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '';
    try {
      const ci = new Date(checkIn);
      const co = new Date(checkOut);
      const fmt = (date) =>
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${fmt(ci)} - ${fmt(co)}`;
    } catch {
      return `${checkIn} - ${checkOut}`;
    }
  }, []);

  const loadTrips = useCallback(async () => {
    if (!user?.UserID) return;
    setLoading(true);
    setError('');
    try {
      const bookings = await authAPI.getUserBookings(user.UserID);
      const confirmedBookings = (bookings || []).filter(
        (b) => (b.Status || b.status || '').toLowerCase() === 'confirmed'
      );

      const enriched = await Promise.all(
        confirmedBookings.map(async (booking) => {
          let propertyInfo = null;
          let tourInfo = null;

          if (booking.propertyID || booking.PropertyID) {
            try {
              propertyInfo = await authAPI.getPropertyById(
                booking.propertyID ?? booking.PropertyID
              );
            } catch (err) {
              console.error('Failed to fetch property detail', err);
            }
          } else if (booking.tourID || booking.TourID) {
            try {
              tourInfo = await authAPI.getTourById(booking.tourID ?? booking.TourID);
            } catch (err) {
              console.error('Failed to fetch tour detail', err);
            }
          }

          return {
            ...booking,
            propertyInfo,
            tourInfo,
          };
        })
      );
      setTrips(enriched);
      // Update trip count in AppContext with confirmed bookings only
      dispatch({ type: 'SET_TRIP_COUNT', payload: enriched.length });
    } catch (err) {
      setError(err.message || 'Unable to load trips list');
      setTrips([]);
      dispatch({ type: 'SET_TRIP_COUNT', payload: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  const openReviewModal = useCallback((trip) => {
    setReviewingTrip(trip);
    setReviewForm({ rating: 5, comments: '' });
    setReviewError('');
    setReviewSuccess('');
  }, []);

  const closeReviewModal = useCallback(() => {
    setReviewingTrip(null);
    setReviewForm({ rating: 5, comments: '' });
    setReviewError('');
    setReviewSuccess('');
    setReviewSubmitting(false);
  }, []);

  const handleReviewSubmit = useCallback(async () => {
    if (!reviewingTrip) return;

    const bookingId = reviewingTrip.bookingID ?? reviewingTrip.BookingID;
    if (!bookingId) {
      setReviewError('Unable to determine booking details for this trip.');
      return;
    }

    // Validate form
    if (!reviewForm.comments?.trim()) {
      setReviewError('Please enter your comments.');
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('Please select a valid rating (1-5).');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError('');
      setReviewSuccess('');

      // Submit review directly to backend
      const result = await authAPI.submitBookingReview(bookingId, {
        rating: reviewForm.rating,
        comments: reviewForm.comments.trim(),
        userId: user?.UserID,
      });

      if (result) {
        setReviewSuccess('Thanks! Your review has been submitted successfully.');
        // Reload trips to refresh the review status
        await loadTrips();
        // Close modal after a short delay
        setTimeout(() => {
          closeReviewModal();
        }, 1500);
      }
    } catch (err) {
      // Extract error message from response
      let errorMessage = 'Unable to submit review right now.';
      if (err.message) {
        // Try to parse JSON error if present
        try {
          const errorObj = JSON.parse(err.message);
          errorMessage = errorObj.error || errorObj.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      setReviewError(errorMessage);
    } finally {
      setReviewSubmitting(false);
    }
  }, [reviewForm, reviewingTrip, user?.UserID, loadTrips, closeReviewModal]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // load persisted preference for current user/account
  useEffect(() => {
    try {
      const stored = localStorage.getItem(noticeStorageKey);
      if (stored === 'false') {
        setPersistShowCancelNotice(false);
        setShowCancelNotice(false);
        setDoNotShowChecked(true);
      } else {
        // default: show notice for new users / new accounts
        setPersistShowCancelNotice(true);
        setShowCancelNotice(true);
        setDoNotShowChecked(false);
      }
    } catch (err) {
      // ignore storage errors
    }
  }, [noticeStorageKey]);

  // show modal on each navigation to /trips unless persisted opt-out
  useEffect(() => {
    if (location?.pathname === '/trips') {
      if (persistShowCancelNotice) {
        setShowCancelNotice(true);
        setDoNotShowChecked(false);
      } else {
        setShowCancelNotice(false);
      }
    }
  }, [location?.pathname, persistShowCancelNotice]);

  const closeCancelNotice = useCallback(() => {
    try {
      if (doNotShowChecked) {
        localStorage.setItem(noticeStorageKey, 'false');
        setPersistShowCancelNotice(false);
      } else {
        localStorage.setItem(noticeStorageKey, 'true');
        setPersistShowCancelNotice(true);
      }
    } catch (err) {
      // ignore storage errors
    }
    setShowCancelNotice(false);
  }, [doNotShowChecked, noticeStorageKey]);

  const openCancelConfirm = useCallback((booking) => {
    setBookingToCancel(booking);
    setConfirmOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!bookingToCancel) return;
    const bookingId = bookingToCancel.bookingID ?? bookingToCancel.BookingID;
    if (!bookingId) return;

    setCanceling(true);
    try {
      // ✅ PHẢI GỌI NHƯ NÀY
      await authAPI.cancelBooking(bookingId);
      
      await loadTrips();
      setConfirmOpen(false);
      setBookingToCancel(null);
      success(
        t(language, "trips.cancelRefunded") ||
          "Your refund has been credited back to your account."
      );
      setToast({ show: true, message: "Tiền của bạn đã được hoàn về tài khoản thành công." });
    } catch (err) {
      alert(err.message || 'Unable to cancel booking right now.');
    } finally {
      setCanceling(false); // ← QUAN TRỌNG: Phải tắt loading
    }
  }, [bookingToCancel, loadTrips]);

  const hasTrips = useMemo(() => trips.length > 0, [trips]);

  if (!user?.UserID) {
    return (
      <div className="trips-page">
        <div className="trips-title">{t(language, "homeTrips.title")}</div>
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>{t(language, "homeTrips.loginRequiredTitle")}</h2>
            <p>{t(language, "homeTrips.loginRequiredSubtitle")}</p>
            <button className="trips-btn" onClick={() => navigate('/login')}>
              {t(language, "homeTrips.loginButton")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="trips-page">
        <div className="trips-title">{t(language, "homeTrips.title")}</div>
        <div style={{ padding: 24 }}>{t(language, "homeTrips.loading")}</div>
      </div>
    );
  }

  return (
    <div className="trips-page">
      <h1 className="trips-title">{t(language, "homeTrips.title")}</h1>

      {showCancelNotice && (
        <div className="cancel-notice-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-notice-title">
          <div className="cancel-notice-modal" role="document">
            <div className="cancel-notice-header">
              <div className="cancel-notice-icon" aria-hidden="true">
                <Icon icon="mdi:alert-circle" width="36" height="36" />
              </div>
              <div className="cancel-notice-headerText">
                <h3 id="cancel-notice-title" className="cancel-notice-title">
                  {t(language, "trips.cancelNoticeTitle") || "Cancellation policy"}
                </h3>
                <p className="cancel-notice-subtitle">
                  {t(language, "trips.cancelNotice") || "You can only cancel tours or properties 48 hours after payment."}
                </p>
              </div>
            </div>

            <div className="cancel-notice-bodyActions">
              <label className="cancel-notice-checkbox">
                <input
                  type="checkbox"
                  checked={doNotShowChecked}
                  onChange={(e) => setDoNotShowChecked(e.target.checked)}
                />
                <span>{t(language, "trips.doNotShowLabel") || "Don't show this again"}</span>
              </label>

              <div className="cancel-notice-actions">
                <button className="trip-btn-primary" onClick={closeCancelNotice}>
                  {t(language, "trips.dismiss") || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!!error && (
        <div className="trips-feedback error">
          {error}
          <button className="trips-btn small" onClick={loadTrips}>
            {t(language, "homeTrips.retry")}
          </button>
        </div>
      )}

      {!error && !hasTrips && (
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>{t(language, "homeTrips.emptyTitle")}</h2>
            <p>{t(language, "homeTrips.emptySubtitle")}</p>
            <button className="trips-btn" onClick={() => navigate('/')}>
              {t(language, "homeTrips.emptyButton")}
            </button>
          </div>
        </div>
      )}

      {!error && hasTrips && (
        <div className="trips-list">
          {trips.map((trip) => {
            const propertyInfo = trip.propertyInfo;
            const tourInfo = trip.tourInfo;
            const isTour = !!tourInfo && !propertyInfo;

            // Get cover image using helper function
            const coverImage = propertyInfo
              ? (getFirstPhotoUrl(propertyInfo) || '/fallback.svg')
              : tourInfo
                ? (getFirstPhotoUrl(tourInfo) ||
                  tourInfo?.media?.cover?.url ||
                  tourInfo?.image?.url ||
                  '/fallback.svg')
                : '/fallback.svg';
            const title =
              propertyInfo?.listingTitle ||
              propertyInfo?.title ||
              tourInfo?.tourName ||
              tourInfo?.title ||
              `Booking #${trip.bookingID || trip.BookingID}`;
            const location =
              propertyInfo?.location ||
              propertyInfo?.Location ||
              tourInfo?.location ||
              '';
            const detailLink = propertyInfo
              ? `/property/${propertyInfo.PropertyID || propertyInfo.id || trip.propertyID || trip.PropertyID}`
              : tourInfo
                ? `/experience/${tourInfo.tourID || tourInfo.id || trip.tourID || trip.TourID}`
                : null;
            const dateRange = formatDateRange(trip.checkIn || trip.CheckIn, trip.checkOut || trip.CheckOut);
            // Always show as "Confirmed" status for display and review purposes
            const status = 'confirmed';
            const guests = trip.guestsCount ?? trip.GuestsCount ?? 1;
            const totalPrice = trip.totalPrice ?? trip.TotalPrice ?? 0;
            const nights = trip.nights ?? trip.Nights ?? null;
            const userReview = findUserReview(propertyInfo || tourInfo);
            // Always allow reviews (unless already reviewed)
            const canReview = !userReview;
            const reviewTooltip = !canReview
              ? 'You already shared a review for this trip.'
              : '';
            const hostEmail =
            propertyInfo?.host?.email ||
            propertyInfo?.hostEmail ||
            tourInfo?.host?.email ||
            tourInfo?.guide?.email ||
            null;
            return (
              <div key={trip.bookingID || trip.BookingID} className="trip-card">
                <div className="trip-cover">
                  <img src={coverImage} alt={title} />
                  <span className="trip-type-badge">
                    {isTour ? t(language, "homeTrips.type.experience") : t(language, "homeTrips.type.stay")}
                  </span>
                </div>
                <div className="trip-info">
                  <div className="trip-title">{title}</div>
                  <div className="trip-location">
                    <Icon icon="mdi:map-marker" width="16" height="16" />
                    <span>{location || t(language, "homeTrips.locationNotUpdated")}</span>
                  </div>
                  <div className="trip-dates">
                    <Icon icon="mdi:calendar" width="16" height="16" />
                    <span>{dateRange || t(language, "homeTrips.noSchedule")}</span>
                  </div>
                  <div className="trip-meta">
                    <span>
                      {nights ? t(language, "homeTrips.nights", { count: nights }) : ""}
                    </span>

                    <span>
                      {t(language, "homeTrips.guests", { count: guests })}
                    </span>
                    <span className={`trip-status ${status}`}>
                      {t(language, "homeTrips.statusConfirmed")}
                    </span>
                  </div>
                  <div className="trip-price">
                    {totalPrice ? format(convertToCurrent(totalPrice)) : ''}
                  </div>

                  <div className="trip-actions">
                    <button
                      className="trip-btn-primary"
                      disabled={!canReview}
                      title={!canReview ? t(language, "homeTrips.review.alreadyReviewed") : ""}
                      onClick={() => openReviewModal(trip)}
                    >
                      {userReview
                        ? t(language, "homeTrips.review.submitted")
                        : t(language, "homeTrips.review.write")}
                    </button>

                    {detailLink ? (
                      <button className="trip-btn-secondary" onClick={() => navigate(detailLink)}>
                        {t(language, "homeTrips.viewDetails")}
                      </button>
                    ) : (
                      <button className="trip-btn-secondary" onClick={() => navigate('/')}>
                        {t(language, "homeTrips.bookAnother")}
                      </button>
                    )}
                    
                   <button
                      className="trip-btn-secondary"
                      onClick={async () => {
                        const hostEmail = await getHostEmail(trip.hostID);

                        if (hostEmail) {
                          navigate(`/host/messages?email=${encodeURIComponent(hostEmail)}`);
                        } else {
                          alert("Cannot find host information.");
                        }
                      }}
                    >
                      Chat with Host
                    </button>
                    
                    <button
                      className="trip-btn-secondary trip-cancel-btn"
                      onClick={() => openCancelConfirm(trip)}
                      title={t(language, "trips.cancel") || "Cancel booking"}
                    >
                      {t(language, "trips.cancel") || "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewingTrip && (
        <div className="review-modal-overlay" role="dialog" aria-modal="true">
          <div className="review-modal">
            <button className="review-modal-close" onClick={closeReviewModal} aria-label="Close review form">
              ×
            </button>
            <h3>{t(language, "homeTrips.review.modalTitle")}</h3>
            <p>
              {reviewingTrip.propertyInfo
                ? `Tell future guests about your stay at ${reviewingTrip.propertyInfo?.listingTitle || reviewingTrip.propertyInfo?.ListingTitle || 'this stay'}.`
                : `Tell future travelers about ${reviewingTrip.tourInfo?.tourName || reviewingTrip.tourInfo?.TourName || 'this experience'}.`}
            </p>

            <div className="review-field">
              <label>{t(language, "homeTrips.review.ratingLabel")}</label>
              <div className="review-rating-input">
                <input
                  id="review-rating"
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                />
                <span>{reviewForm.rating} / 5</span>
              </div>
            </div>

            <div className="review-field">
              <label>{t(language, "homeTrips.review.commentLabel")}</label>
              <textarea
                id="review-comments"
                rows="4"
                maxLength="800"
                placeholder={t(language, "homeTrips.review.commentPlaceholder")}
                value={reviewForm.comments}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comments: e.target.value }))}
              />
            </div>

            {reviewError && <div className="review-feedback error">{reviewError}</div>}
            {reviewSuccess && (
              <div className="review-feedback success">
                {t(language, "homeTrips.review.submitSuccess")}
              </div>
            )}

            <button className="trip-btn-primary stretch" onClick={handleReviewSubmit}>
              {reviewSubmitting
                ? t(language, "homeTrips.review.submitting")
                : t(language, "homeTrips.review.submit")}
            </button>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => { if (!canceling) setConfirmOpen(false); }}
        onConfirm={handleConfirmCancel}
        title={t(language, "trips.cancelConfirmTitle") || "Cancel booking"}
        message={t(language, "trips.cancelConfirmMessage") || "Are you sure you want to cancel this booking? This action may be irreversible."}
        confirmText={t(language, "trips.cancel") || "Cancel booking"}
        cancelText={t(language, "common.cancel") || "Cancel"}
        type="danger"
        loading={canceling}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
