import { useEffect, useMemo, useState, useCallback } from 'react';
import './ProfilePage.css';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import authAPI from '../services/authAPI';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export default function ProfilePage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('about'); // about | trips | connections
  const { user, profile, dispatch } = useApp();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const goToHomeForBooking = () => navigate('/');
  const { convertToCurrent, format } = useCurrency();

  const formatDateRange = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return t(language, 'profile.noSchedule');
    try {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const locale = language === 'vi' ? 'vi-VN' : 'en-US';
      const fmt = (date) =>
        date.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      return `${fmt(inDate)} - ${fmt(outDate)}`;
    } catch {
      return `${checkIn} - ${checkOut}`;
    }
  }, [language]);

  const statusLabel = useCallback((statusRaw) => {
    const status = (statusRaw || '').toLowerCase();
    switch (status) {
      case 'confirmed':
        return t(language, 'profile.confirmed');
      case 'completed':
        return t(language, 'profile.completed');
      case 'cancelled':
      case 'canceled':
        return t(language, 'profile.cancelled');
      case 'pending':
      default:
        return t(language, 'profile.pending');
    }
  }, [language]);

  const enrichTrips = useCallback(async (bookings) => {
    return Promise.all(
      bookings.map(async (booking) => {
        let propertyInfo = null;
        let tourInfo = null;

        if (booking.propertyID || booking.PropertyID) {
          try {
            propertyInfo = await authAPI.getPropertyById(
              booking.propertyID ?? booking.PropertyID
            );
          } catch (err) {
            console.error('Failed to fetch property for booking', err);
          }
        } else if (booking.tourID || booking.TourID) {
          try {
            tourInfo = await authAPI.getTourById(
              booking.tourID ?? booking.TourID
            );
          } catch (err) {
            console.error('Failed to fetch tour for booking', err);
          }
        }

        return {
          ...booking,
          propertyInfo,
          tourInfo,
        };
      })
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      if (!user || !(user.UserID ?? user.userID)) return;
      setLoading(true);
      setError('');
      try {
        const userId = user.UserID ?? user.userID;
        const detail = await authAPI.getUserById(userId);
        if (!isMounted) return;
        setUserData(detail);
        setAvatarError(false); // Reset avatar error khi load user mới
        // đẩy vào context để các màn khác dùng (edit, v.v.)
        const displayNameCtx = detail?.fullName ?? detail?.FullName ?? '';
        const aboutCtx = detail?.userAbout ?? detail?.about ?? '';
        const interestsRaw = detail?.interests;
        const interestsCtx = Array.isArray(interestsRaw)
          ? interestsRaw
          : (typeof interestsRaw === 'string'
              ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
              : []);
        dispatch({
          type: 'SET_PROFILE',
          payload: {
            displayName: displayNameCtx,
            about: aboutCtx,
            interests: interestsCtx,
          },
        });
      } catch (err) {
        if (isMounted) setError(err.message || t(language, 'profile.unableToLoadUserInfo'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUser();
    return () => { isMounted = false; };
  }, [user, dispatch, language]);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrips() {
      if (!user || !(user.UserID ?? user.userID)) return;
      setTripsLoading(true);
      setTripsError('');
      try {
        const userId = user.UserID ?? user.userID;
        const bookings = await authAPI.getUserBookings(userId);
        const normalized = await enrichTrips(bookings ?? []);
        if (!isMounted) return;
        setTrips(normalized);
        // Update trip count in AppContext
        dispatch({ type: 'SET_TRIP_COUNT', payload: normalized.length });
      } catch (err) {
        if (isMounted) {
          setTripsError(err.message || t(language, 'profile.unableToLoadTrips'));
          setTrips([]);
          dispatch({ type: 'SET_TRIP_COUNT', payload: 0 });
        }
      } finally {
        if (isMounted) setTripsLoading(false);
      }
    }
    fetchTrips();
    return () => {
      isMounted = false;
    };
  }, [user, enrichTrips, language, dispatch]);

  // ==== Lấy dữ liệu linh hoạt theo key hoa/thường (không normalize state) ====
  const displayName = userData?.fullName ?? userData?.FullName ?? t(language, 'profile.user');
  const email = userData?.email ?? userData?.Email ?? '';
  const about = userData?.userAbout ?? userData?.about ?? '';
  const roleRaw = userData?.role ?? userData?.Role ?? 'Guest';
  const roleLabel = roleRaw === 'Host' 
    ? t(language, 'profile.host') 
    : roleRaw === 'Admin' 
    ? t(language, 'profile.admin') 
    : t(language, 'profile.guest');
  const age = userData?.age ?? '';
  const gender = userData?.gender ?? '';
  const nationality = userData?.nationality ?? '';
  const normalizeImageUrl = (rawUrl) => {
      if (!rawUrl || typeof rawUrl !== "string") return "";
      const trimmed = rawUrl.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      if (trimmed.startsWith("/")) return `http://localhost:5069${trimmed}`;
      return `http://localhost:5069/${trimmed}`;
    };

  const avatarUrlRaw =
  userData?.Avatar ?? userData?.avatar ?? userData?.profilePicture ?? userData?.avatarUrl ?? "";

  const avatarUrl = normalizeImageUrl(avatarUrlRaw);


  const interestsRaw = userData?.interests;
  const interests = Array.isArray(interestsRaw)
    ? interestsRaw
    : (typeof interestsRaw === 'string'
        ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
        : []);

  const initial = useMemo(
    () => (displayName?.trim()?.charAt(0) || 'U').toUpperCase(),
    [displayName]
  );

  const hasProfileInfo = !!(
    (about && about.trim()) ||
    interests.length > 0 ||
    (displayName && displayName.trim())
  );

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <h1 className="profile-title">{t(language, 'profile.profile')}</h1>

        <nav className="profile-nav">
          <button
            className={`profile-nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="nav-icon nav-initial">{initial}</span>
            <span>{t(language, 'profile.about')}</span>
          </button>

          <button
            className={`profile-nav-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <Icon icon="mdi:suitcase" width="20" height="20" />
            <span>{t(language, 'profile.pastTrips')}</span>
          </button>

          <button
            className={`profile-nav-item ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <span className="nav-avatar-group">
              <span className="nav-avatar" />
              <span className="nav-avatar" />
            </span>
            <span>{t(language, 'profile.connections')}</span>
          </button>
        </nav>
      </aside>

      {/* Divider */}
      <div className="profile-divider" />

      {/* Main */}
      <main className="profile-main">
        {loading && <div className="profile-section" style={{ padding: 16 }}>{t(language, 'profile.loadingInformation')}</div>}
        {!!error && <div className="profile-section" style={{ padding: 16, color: '#c00' }}>{error}</div>}

        {activeTab === 'about' && (
          <section className="profile-section">
            {/* Card thông tin cơ bản */}
            <div className="profile-card">
              {avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="profile-avatar-large"
                  style={{ objectFit: 'cover' }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="profile-avatar-large">{initial}</div>
              )}
              <div className="profile-name-role">
                <div className="profile-display-name">{displayName}</div>
                {email && <div style={{ color: '#666', fontSize: 14 }}>{email}</div>}
                <div className="profile-role">{roleLabel}</div>
              </div>
            </div>

            {/* Hộp gợi ý hoàn tất hồ sơ */}
            <div className="profile-completion">
              <div className="profile-completion-title">{t(language, 'profile.completeYourProfile')}</div>
              <p className="profile-completion-text">
                {t(language, 'profile.profileDescription')}
              </p>
              <button className="profile-primary-btn" onClick={() => navigate('/profile/edit')}>
                {hasProfileInfo ? t(language, 'profile.edit') : t(language, 'profile.getStarted')}
              </button>
            </div>

            {/* Giới thiệu */}
            <div className="profile-subsection">
              <div className="profile-subtitle">
                <Icon icon="mdi:chat-outline" width="18" height="18" />
                <span>{t(language, 'profile.aboutSection')}</span>
              </div>
              <div className="profile-empty">
                {about || t(language, 'profile.noIntroductionYet')}
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="profile-subsection profile-subsection-info">
              <div className="profile-subtitle">
                <Icon icon="mdi:account-outline" width="18" height="18" />
                <span>{t(language, 'profile.personalInformation')}</span>
              </div>
              <div className="info-grid">
                <div><strong>{t(language, 'profile.age')}:</strong> {age || t(language, 'profile.notUpdated')}</div>
                <div><strong>{t(language, 'profile.gender')}:</strong> {gender || t(language, 'profile.notUpdated')}</div>
                <div><strong>{t(language, 'profile.nationality')}:</strong> {nationality || t(language, 'profile.notUpdated')}</div>
              </div>
            </div>

            {/* Sở thích */}
            {interests.length > 0 && (
              <div className="profile-subsection" style={{ marginTop: 16 }}>
                <div className="profile-subtitle">{t(language, 'profile.myInterests')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {interests.map((it, idx) => (
                    <span key={idx} className="interest-chip">{it}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'trips' && (
          <section className="profile-trips-section">
            {tripsLoading && (
              <div className="profile-trips-feedback">{t(language, 'profile.loadingTrips')}</div>
            )}
            {!!tripsError && (
              <div className="profile-trips-feedback error">{tripsError}</div>
            )}
            {!tripsLoading && !tripsError && trips.length === 0 && (
              <div className="profile-empty-state">
                <div className="empty-emoji suitcase" />
                <p className="empty-text">
                  {t(language, 'profile.noTripsYet')}
                </p>
                <button className="profile-primary-btn" onClick={goToHomeForBooking}>{t(language, 'profile.bookATrip')}</button>
              </div>
            )}
            {!tripsLoading && !tripsError && trips.length > 0 && (
              <div className="profile-trips-list">
                {trips.map((trip) => {
                  const propertyInfo = trip.propertyInfo;
                  const tourInfo = trip.tourInfo;
                  const isTour = !!tourInfo && !propertyInfo;
                  const coverImage =
                    propertyInfo?.photos?.[0]?.url ||
                    propertyInfo?.media?.photos?.[0]?.url ||
                    tourInfo?.media?.cover?.url ||
                    tourInfo?.image?.url ||
                    '/fallback.svg';
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

                  const checkIn = trip.checkIn || trip.CheckIn;
                  const checkOut = trip.checkOut || trip.CheckOut;
                  const totalPrice = trip.totalPrice ?? trip.TotalPrice ?? 0;
                  const guestsCount =
                    trip.guestsCount ?? trip.GuestsCount ?? 1;
                  const status = trip.status || trip.Status;

                  return (
                    <div
                      key={trip.bookingID || trip.BookingID || trip.id}
                      className="profile-trip-card"
                    >
                      <div className="trip-thumb">
                        <img 
                          src={coverImage} 
                          alt={title}
                          onError={(e) => {
                            e.currentTarget.src = '/fallback.svg';
                          }}
                        />
                        <span className="trip-type-badge">
                          {isTour ? t(language, 'profile.experience') : t(language, 'profile.stay')}
                        </span>
                      </div>
                      <div className="trip-info">
                        <div className="trip-title">{title}</div>
                        <div className="trip-location">{location}</div>
                        <div className="trip-dates">
                          {formatDateRange(checkIn, checkOut)}
                        </div>
                        <div className="trip-meta">
                          <span>{guestsCount} {t(language, 'profile.guests')}</span>
                          <span className={`trip-status ${status?.toLowerCase()}`}>
                            {statusLabel(status)}
                          </span>
                        </div>
                        <div className="trip-price">
                          {totalPrice
                            ? format(convertToCurrent(totalPrice))
                            : ''}
                        </div>
                        <div className="trip-actions">
                          {detailLink ? (
                            <button
                              className="profile-secondary-btn"
                              onClick={() => navigate(detailLink)}
                            >
                              {t(language, 'profile.viewDetails')}
                            </button>
                          ) : (
                            <button
                              className="profile-secondary-btn"
                              onClick={goToHomeForBooking}
                            >
                              {t(language, 'profile.bookAnotherTrip')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'connections' && (
          <section className="profile-empty-state">
            <div className="empty-emoji people" />
            <p className="empty-text">
              {t(language, 'profile.connectionsDescription')}
            </p>
            <button className="profile-primary-btn" onClick={goToHomeForBooking}>{t(language, 'profile.bookATrip')}</button>
          </section>
        )}
      </main>
    </div>
  );
}
