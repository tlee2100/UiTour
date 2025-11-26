import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./HostToday.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";

export default function HostToday() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, profile, dispatch } = useApp();
  const { language } = useLanguage();
  const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } = useLanguageCurrencyModal();
  const globeButtonRef = React.useRef(null);
  const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") {
      return null;
    }
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith("data:image")) {
      return null;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `http://localhost:5069${trimmed}`;
    }
    return `http://localhost:5069/${trimmed}`;
  };

  const resolveHostIdentifier = (userData) => {
    if (!userData) return null;
    const hostId =
      userData.HostID ??
      userData.hostID ??
      userData?.Host?.HostID ??
      userData?.host?.HostID ??
      userData?.host?.hostID ??
      userData?.hostProfile?.HostID ??
      userData?.hostProfile?.hostID ??
      null;

    return typeof hostId === "number" && hostId > 0 ? hostId : null;
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [menuOpen]);

  useEffect(() => {
    loadBookings();
  }, [user, language]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        setBookings([]);
        return;
      }

      let hostIdentifier = resolveHostIdentifier(user);

      // If we still don't have a HostID, try resolving via userId -> host API
      if (!hostIdentifier) {
        const userId =
          user.UserID ??
          user.userID ??
          user.id ??
          null;

        if (userId) {
          try {
            const host = await authAPI.getHostByUserId(userId);
            hostIdentifier = host?.HostID ?? host?.hostID ?? null;
          } catch (e) {
            console.error("Failed to resolve host by user id:", e);
          }
        }
      }

      if (!hostIdentifier) {
        setBookings([]);
        setError(t(language, 'host.notHostYet'));
        return;
      }

      const bookingsData = await authAPI.getBookingsByHost(hostIdentifier);
      if (!Array.isArray(bookingsData)) {
        setBookings([]);
        return;
      }

      const formatted = bookingsData
        .map((booking) => {
          const checkInOriginal = new Date(booking.CheckIn || booking.checkIn);
          const checkOut = new Date(booking.CheckOut || booking.checkOut);
          if (isNaN(checkInOriginal.getTime()) || isNaN(checkOut.getTime())) {
            console.warn("Invalid booking dates", booking);
            return null;
          }

          const now = new Date();

          let status = t(language, "host.upcoming");
          if (checkInOriginal.toDateString() === now.toDateString()) {
            status = t(language, "host.checkInToday");
          } else if (checkInOriginal <= now && checkOut >= now) {
            status = t(language, "host.staying");
          } else if (checkInOriginal < now && checkOut < now) {
            status = t(language, "host.completed");
          }

          const transaction = booking.Transaction || booking.transaction;
          let paymentStatus = "noPayment";
          if (transaction) {
            const statusLower = (transaction.PaymentStatus || transaction.paymentStatus || "").toLowerCase();
            if (["paid", "completed", "success"].includes(statusLower)) {
              paymentStatus = "paid";
            } else if (["pending", "processing"].includes(statusLower)) {
              paymentStatus = "pending";
            } else if (["failed", "declined", "error"].includes(statusLower)) {
              paymentStatus = "failed";
            } else if (["refunded", "refund"].includes(statusLower)) {
              paymentStatus = "refunded";
            }
          }

          const duration = `${checkInOriginal.getDate()} ${checkInOriginal.toLocaleDateString("en-US", { month: "short" })} – ${checkOut.getDate()} ${checkOut.toLocaleDateString("en-US", { month: "short" })}`;

          const nights = booking.Nights || booking.nights || 1;
          const guestsCount = booking.GuestsCount || booking.guestsCount || 1;

          const property = booking.Property || booking.property;
          const tour = booking.Tour || booking.tour;
          const listing = property || tour;

          if (!listing) {
            console.warn("Booking has no Property or Tour:", booking);
          }

          let title = "Unknown Listing";
          if (listing) {
            if (property) {
              title =
                listing.ListingTitle ||
                listing.listingTitle ||
                listing.Title ||
                listing.title ||
                "Property";
            } else if (tour) {
              title =
                listing.TourName ||
                listing.tourName ||
                listing.Title ||
                listing.title ||
                "Tour";
            }
          }

          const photos = listing?.Photos || listing?.photos || [];
          let imageUrl = null;
          if (Array.isArray(photos) && photos.length > 0) {
            const sortedPhotos = [...photos].sort((a, b) => {
              const aIndex = a.SortIndex ?? a.sortIndex ?? 0;
              const bIndex = b.SortIndex ?? b.sortIndex ?? 0;
              return aIndex - bIndex;
            });

            const firstPhoto = sortedPhotos[0];
            const rawUrl =
              firstPhoto?.Url ||
              firstPhoto?.url ||
              firstPhoto?.ImageUrl ||
              firstPhoto?.imageUrl ||
              firstPhoto?.serverUrl ||
              null;
            imageUrl = normalizeImageUrl(rawUrl);
          }

          if (!imageUrl) {
            imageUrl = sampleImg;
          }

          const guest = booking.User || booking.user;
          let guestName = "Guest";
          if (guest) {
            guestName =
              guest.FullName ||
              guest.fullName ||
              guest.Name ||
              guest.name ||
              guest.Email ||
              guest.email ||
              guest.UserName ||
              guest.userName ||
              "Guest";
          } else {
            console.warn("No guest/user found for booking:", booking);
          }

          const reviews = listing?.Reviews || listing?.reviews || [];
          const rating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length
              : 0;

          const type = property ? "property" : "tour";
          const typeLabel = t(language, property ? "host.propertyListingLabel" : "host.tourListingLabel");
          const location = listing?.Location || listing?.location || "";

          return {
            id: booking.BookingID || booking.bookingID || booking.id,
            status,
            title,
            rating: rating > 0 ? rating.toFixed(2) : null,
            guest: guestName,
            duration,
            nights,
            guestsCount,
            image: imageUrl,
            checkIn: checkInOriginal.toISOString(),
            checkOut: checkOut.toISOString(),
            type,
            typeLabel,
            paymentStatus,
            totalPrice: booking.TotalPrice || booking.totalPrice || 0,
            currency: booking.Currency || booking.currency || "USD",
            location
          };
        })
        .filter(Boolean);

      // Sắp xếp: Check-in today > Staying > Upcoming > Completed, sau đó theo payment status
      const checkInToday = t(language, 'host.checkInToday');
      const staying = t(language, 'host.staying');
      const upcoming = t(language, 'host.upcoming');
      const completed = t(language, 'host.completed');
      const statusOrder = { [checkInToday]: 0, [staying]: 1, [upcoming]: 2, [completed]: 3 };
      const paymentStatusOrder = { paid: 0, pending: 1, failed: 2, refunded: 3, noPayment: 4 };
      
      formatted.sort((a, b) => {
        // Ưu tiên sắp xếp theo status trước
        const statusOrderA = statusOrder[a.status] ?? 99;
        const statusOrderB = statusOrder[b.status] ?? 99;
        if (statusOrderA !== statusOrderB) return statusOrderA - statusOrderB;
        
        // Sau đó sắp xếp theo payment status
        const paymentOrderA = paymentStatusOrder[a.paymentStatus] ?? 99;
        const paymentOrderB = paymentStatusOrder[b.paymentStatus] ?? 99;
        if (paymentOrderA !== paymentOrderB) return paymentOrderA - paymentOrderB;
        
        // Cuối cùng sắp xếp theo ngày check-in
        return new Date(a.checkIn) - new Date(b.checkIn);
      });

      setBookings(formatted);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    closeMenu();
    navigate('/');
  };

    // ========== NAVBAR REFS ==========
  const navRef = React.useRef(null);
  const highlightRef = React.useRef(null);

const navItems = useMemo(() => [
    { id: "today", label: t(language, 'host.today'), path: "/host/today" },
    { id: "listings", label: t(language, 'host.listings'), path: "/host/listings" },
    { id: "messages", label: t(language, 'host.messages'), path: "/host/messages" }
  ], [language]);

  const isActiveNav = (path) => {
    if (path === "/host/listings" && location.pathname.startsWith("/host/stay")) return true;
    if (path === "/host/listings" && location.pathname.startsWith("/host/experience")) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="host-today">
      {/* ================= HEADER ================= */}
      <header className="host-header">
        {/* LOGO */}
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="UiTour logo" />
        </div>

        {/* NAVBAR */}
        <nav className="nav-tabs" ref={navRef}>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={isActiveNav(item.path) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
          <span className="nav-highlight" ref={highlightRef}></span>
        </nav>

        {/* RIGHT SIDE */}
        <div className="header-right">
          <button
            className="switch-title"
            onClick={() => navigate('/')}
          >
            {t(language, 'common.switchToTraveling')}
          </button>

          {/* Globe */}
          <button 
            ref={globeButtonRef}
            className="globe-btn"
            onClick={openLanguageCurrency}
            aria-label={t(language, 'search.languageAndCurrency')}
          >
            <Icon icon="mdi:earth" width="24" height="24" />
          </button>

          {languageCurrencyOpen && (
            <LanguageCurrencySelector
              isOpen={languageCurrencyOpen}
              onClose={closeLanguageCurrency}
              triggerRef={globeButtonRef}
            />
          )}

          {/* User Menu */}
          <div className="header_profile">
            <button
              className="header_menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={t(language, 'host.openHostNavigationMenu')}
              aria-expanded={menuOpen}
            >
              <Icon icon="mdi:menu" width="22" height="22" />
            </button>

            <button
              className="header_avatarButton"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={t(language, 'host.openHostNavigationMenu')}
              aria-expanded={menuOpen}
            >
              <Icon icon="mdi:account-circle" width="28" height="28" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="host-menu-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            className="host-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t(language, 'host.hostNavigationMenu')}
          >
            <div className="host-menu-header">
              <h2>{t(language, 'host.menu')}</h2>
              <button
                className="host-menu-close"
                onClick={closeMenu}
                aria-label={t(language, 'host.closeMenu')}
              >
                <Icon icon="mdi:close" width="24" height="24" />
              </button>
            </div>

            <div className="host-menu-card">
              <img
                src={sampleImg}
                alt="Host onboarding illustration"
                className="host-menu-card-img"
              />
              <div className="host-menu-card-content">
                <h3>{t(language, 'host.newToHosting')}</h3>
                <p>
                  {t(language, 'host.discoverBestPractices')}
                </p>
                <button className="host-menu-card-action">{t(language, 'host.getStarted')}</button>
              </div>
            </div>

            <nav className="host-menu-links">
              <button 
                className="host-menu-link"
                onClick={() => {
                  closeMenu();
                  navigate("/account");
                }}
              >
                <Icon icon="mdi:cog-outline" width="20" height="20" />
                <span>{t(language, 'host.accountSettings')}</span>
              </button>
              <button 
                className="host-menu-link"
                onClick={() => {
                  closeMenu();
                  openLanguageCurrency();
                }}
              >
                <Icon icon="mdi:earth" width="20" height="20" />
                <span>{t(language, 'host.languageCurrency')}</span>
              </button>
              <button
                className="host-menu-link"
                onClick={() => {
                  closeMenu();
                  navigate("/support");
                }}
              >
                <Icon icon="mdi:lifebuoy" width="20" height="20" />
                <span>{t(language, 'host.getSupport')}</span>
              </button>
              <button 
                className="host-menu-link"
                onClick={() => {
                  closeMenu();
                  navigate("/host/becomehost");
                }}
              >
                <Icon icon="mdi:plus-circle-outline" width="20" height="20" />
                <span>{t(language, 'host.createNewListing')}</span>
              </button>
              <div className="host-menu-divider" />
              <button 
                className="host-menu-link host-menu-link-secondary"
                onClick={handleLogout}
              >
                <Icon icon="mdi:logout" width="20" height="20" />
                <span>{t(language, 'host.logOut')}</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* ================= CONTENT ================= */}
      <div className="booking-list">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            {t(language, 'host.loadingBookings')}
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
            <p>{t(language, 'host.error')}: {error}</p>
            <button 
              onClick={loadBookings}
              style={{ 
                marginTop: '12px', 
                padding: '8px 16px', 
                background: '#111827', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {t(language, 'host.tryAgain')}
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>{t(language, 'host.noBookingsYet')}</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              {t(language, 'host.bookingsWillAppear')}
            </p>
          </div>
        ) : (
          bookings.map((b) => (
            <div className="booking-card" key={b.id}>
              <div
                className={`status-badge ${b.status
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
              >
                {b.status}
              </div>
              <div
                className={`payment-status-badge payment-status-${b.paymentStatus}`}
              >
                {t(language, `host.${b.paymentStatus}`)}
              </div>
              <div className={`listing-type-badge type-${b.type}`}>
                {b.typeLabel}
              </div>
              <img 
                src={b.image} 
                alt={b.title} 
                className="booking-img"
                onError={(e) => {
                  e.target.src = sampleImg;
                }}
              />
              <div className="booking-info">
                <h3>
                  {b.title} 
                  {b.rating && <span>★ {b.rating}</span>}
                </h3>
                {b.location && (
                  <p className="booking-location">{b.location}</p>
                )}
                <p>{t(language, 'host.guestName')}: {b.guest}</p>
                <p>{t(language, 'host.stayDuration')}: {b.duration}</p>
                <p>
                  {b.nights} {b.nights === 1 ? t(language, 'host.night') : t(language, 'host.nights')} · {b.guestsCount} {b.guestsCount === 1 ? t(language, 'host.guest') : t(language, 'host.guests')}
                </p>
                <p className="booking-price">
                  {b.totalPrice > 0 && (
                    <>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: b.currency || 'USD'
                      }).format(b.totalPrice)}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
