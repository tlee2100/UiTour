import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import { useCurrency } from '../contexts/CurrencyContext';
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
  const navigate = useNavigate();
  const { user } = useApp();
  const { convertToCurrent, format } = useCurrency();

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
      const enriched = await Promise.all(
        (bookings || []).map(async (booking) => {
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
    } catch (err) {
      setError(err.message || 'Unable to load trips list');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

    try {
      setReviewSubmitting(true);
      setReviewError('');
      setReviewSuccess('');

      await authAPI.submitBookingReview(bookingId, {
        rating: reviewForm.rating,
        comments: reviewForm.comments,
        userId: user?.UserID,
      });

      setReviewSuccess('Thanks! Your review has been submitted.');
      await loadTrips();
      setTimeout(() => {
        closeReviewModal();
      }, 1000);
    } catch (err) {
      setReviewError(err.message || 'Unable to submit review right now.');
    } finally {
      setReviewSubmitting(false);
    }
  }, [reviewForm, reviewingTrip, user?.UserID, loadTrips, closeReviewModal]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const hasTrips = useMemo(() => trips.length > 0, [trips]);

  if (!user?.UserID) {
    return (
      <div className="trips-page">
        <div className="trips-title">Trips</div>
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>Log in to track your trips</h2>
            <p>Log in to view your bookings and continue exploring new experiences.</p>
            <button className="trips-btn" onClick={() => navigate('/login')}>
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="trips-page">
        <div className="trips-title">Trips</div>
        <div style={{ padding: 24 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="trips-page">
      <h1 className="trips-title">Trips</h1>

      {!!error && (
        <div className="trips-feedback error">
          {error}
          <button className="trips-btn small" onClick={loadTrips}>
            Try again
          </button>
        </div>
      )}

      {!error && !hasTrips && (
        <div className="trips-empty">
          <div className="trips-empty-illustration" />
          <div className="trips-empty-textBlock">
            <h2>Plan the perfect trip</h2>
            <p>
              Explore stays, experiences and services. After you book, your bookings will appear
              here.
            </p>
            <button className="trips-btn" onClick={() => navigate('/')}>
              Get started
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
            const status = (trip.status || trip.Status || '').toLowerCase();
            const guests = trip.guestsCount ?? trip.GuestsCount ?? 1;
            const totalPrice = trip.totalPrice ?? trip.TotalPrice ?? 0;
            const nights = trip.nights ?? trip.Nights ?? null;
            const userReview = findUserReview(propertyInfo || tourInfo);
            const canReview = status === 'confirmed' && !userReview;
            const reviewTooltip = !canReview
              ? userReview
                ? 'You already shared a review for this trip.'
                : status !== 'confirmed'
                ? 'Reviews unlock once your booking is confirmed.'
                : 'Review option unavailable.'
              : '';

            return (
              <div key={trip.bookingID || trip.BookingID} className="trip-card">
                <div className="trip-cover">
                  <img src={coverImage} alt={title} />
                  <span className="trip-type-badge">{isTour ? 'Experience' : 'Stay'}</span>
                </div>
                <div className="trip-info">
                  <div className="trip-title">{title}</div>
                  <div className="trip-location">
                    <Icon icon="mdi:map-marker" width="16" height="16" />
                    <span>{location || 'Location not updated'}</span>
                  </div>
                  <div className="trip-dates">
                    <Icon icon="mdi:calendar" width="16" height="16" />
                    <span>{dateRange || 'No schedule'}</span>
                  </div>
                  <div className="trip-meta">
                    <span>{nights ? `${nights} night${nights > 1 ? 's' : ''}` : ''}</span>
                    <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                    <span className={`trip-status ${status}`}>
                      {status === 'confirmed'
                        ? 'Confirmed'
                        : status === 'completed'
                        ? 'Completed'
                        : status === 'cancelled' || status === 'canceled'
                        ? 'Cancelled'
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="trip-price">
                    {totalPrice ? format(convertToCurrent(totalPrice)) : ''}
                  </div>

                  <div className="trip-actions">
                    <button
                      className="trip-btn-primary"
                      disabled={!canReview}
                      title={reviewTooltip}
                      onClick={() => openReviewModal(trip)}
                    >
                      {userReview ? 'Review submitted' : 'Write a review'}
                    </button>

                    {detailLink ? (
                      <button className="trip-btn-secondary" onClick={() => navigate(detailLink)}>
                        View details
                      </button>
                    ) : (
                      <button className="trip-btn-secondary" onClick={() => navigate('/')}>
                        Book another trip
                      </button>
                    )}
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
            <h3>Share your experience</h3>
            <p>
              {reviewingTrip.propertyInfo
                ? `Tell future guests about your stay at ${reviewingTrip.propertyInfo?.listingTitle || reviewingTrip.propertyInfo?.ListingTitle || 'this stay'}.`
                : `Tell future travelers about ${reviewingTrip.tourInfo?.tourName || reviewingTrip.tourInfo?.TourName || 'this experience'}.`}
            </p>

            <div className="review-field">
              <label htmlFor="review-rating">Rating</label>
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
              <label htmlFor="review-comments">Comments</label>
              <textarea
                id="review-comments"
                rows="4"
                maxLength="800"
                placeholder="What stood out during your stay or tour? Share highlights or tips."
                value={reviewForm.comments}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comments: e.target.value }))}
              />
            </div>

            {reviewError && <div className="review-feedback error">{reviewError}</div>}
            {reviewSuccess && <div className="review-feedback success">{reviewSuccess}</div>}

            <button
              className="trip-btn-primary stretch"
              onClick={handleReviewSubmit}
              disabled={reviewSubmitting || !reviewForm.comments.trim()}
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}