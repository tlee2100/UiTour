import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HostToday.css";
import sampleImg from "../../assets/sample-room.jpg";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";

// ⭐ NEW HEADER
import HostHHeader from "../../components/headers/HostHHeader";

export default function HostToday() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, profile, dispatch } = useApp();
  const { language } = useLanguage();
  const { format, convertToCurrent } = useCurrency();
  const {
    isOpen: languageCurrencyOpen,
    openModal: openLanguageCurrency,
    closeModal: closeLanguageCurrency,
  } = useLanguageCurrencyModal();
  const globeButtonRef = React.useRef(null);

  const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith("data:image")) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
      return trimmed;
    if (trimmed.startsWith("/")) return `http://localhost:5069${trimmed}`;
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
    const handleEsc = (event) => event.key === "Escape" && setMenuOpen(false);
    if (menuOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [menuOpen]);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (!hostIdentifier) {
        const userId = user.UserID ?? user.userID ?? user.id ?? null;
        if (userId) {
          try {
            const host = await authAPI.getHostByUserId(userId);
            hostIdentifier = host?.HostID ?? host?.hostID ?? null;
          } catch {
            // ignore
          }
        }
      }

      if (!hostIdentifier) {
        setBookings([]);
        setError(t(language, "host.notHostYet"));
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

          if (isNaN(checkInOriginal) || isNaN(checkOut)) return null;

          const now = new Date();

          let statusKey = "upcoming";
          if (checkInOriginal.toDateString() === now.toDateString()) {
            statusKey = "check-in-today";
          } else if (checkInOriginal <= now && checkOut >= now) {
            statusKey = "staying";
          } else if (checkOut < now) {
            statusKey = "completed";
          }
          const statusLabel = t(
            language,
            statusKey === "check-in-today"
              ? "host.checkInToday"
              : statusKey === "completed"
                ? "host.completed"
                : statusKey === "staying"
                  ? "host.staying"
                  : "host.upcoming"
          );

          // =========================
          // PAYMENT STATUS (ĐÃ SỬA)
          // =========================
          const transaction = booking.Transaction || booking.transaction;
          let paymentStatus = "noPayment";

          if (transaction) {
            const rawStatus =
              transaction.PaymentStatus ||
              transaction.paymentStatus ||
              "";
            const low = rawStatus.toLowerCase().trim();

            // coi như đã thanh toán nếu status chứa paid/completed/success/confirm
            if (
              ["paid", "completed", "success", "confirm", "confirmed"].some(
                (s) => low.includes(s)
              )
            ) {
              paymentStatus = "paid";
            } else if (
              ["pending", "processing", "waiting"].some((s) =>
                low.includes(s)
              )
            ) {
              paymentStatus = "pending";
            } else if (
              ["failed", "declined", "error"].some((s) => low.includes(s))
            ) {
              paymentStatus = "failed";
            } else if (
              ["refunded", "refund"].some((s) => low.includes(s))
            ) {
              paymentStatus = "refunded";
            }
          } else {
            // Không có transaction nhưng Booking.Status đã Confirm/Paid
            const bookStatus =
              (booking.Status || booking.status || "").toLowerCase().trim();
            if (
              ["confirmed", "confirm", "paid", "completed"].some((s) =>
                bookStatus.includes(s)
              )
            ) {
              paymentStatus = "paid";
            }
          }

          const duration = `${checkInOriginal.getDate()} ${checkInOriginal.toLocaleDateString(
            "en-US",
            { month: "short" }
          )} – ${checkOut.getDate()} ${checkOut.toLocaleDateString("en-US", {
            month: "short",
          })}`;

          const nights = booking.Nights || booking.nights || 1;
          const guestsCount = booking.GuestsCount || booking.guestsCount || 1;

          const property = booking.Property || booking.property;
          const tour = booking.Tour || booking.tour;
          const listing = property || tour;

          let title = "Unknown Listing";
          if (listing) {
            if (property)
              title =
                listing.ListingTitle ||
                listing.listingTitle ||
                listing.Title ||
                listing.title ||
                "Property";
            else
              title =
                listing.TourName ||
                listing.tourName ||
                listing.Title ||
                listing.title ||
                "Tour";
          }

          const photos = listing?.Photos || listing?.photos || [];
          let imageUrl = null;

          if (photos.length > 0) {
            const sorted = [...photos].sort(
              (a, b) => (a.SortIndex ?? 0) - (b.SortIndex ?? 0)
            );
            const first = sorted[0];
            const rawUrl =
              first.Url ||
              first.url ||
              first.ImageUrl ||
              first.imageUrl ||
              first.serverUrl ||
              null;
            imageUrl = normalizeImageUrl(rawUrl);
          }

          if (!imageUrl) imageUrl = sampleImg;

          const guest = booking.User || booking.user;
          const guestName =
            guest?.FullName ||
            guest?.fullName ||
            guest?.Name ||
            guest?.name ||
            guest?.Email ||
            guest?.email ||
            guest?.UserName ||
            guest?.userName ||
            "Guest";

          const reviews = listing?.Reviews || listing?.reviews || [];
          const rating =
            reviews.length > 0
              ? reviews.reduce(
                  (s, r) => s + (r.Rating || r.rating || 0),
                  0
                ) / reviews.length
              : 0;

          const type = property ? "property" : "tour";
          const typeLabel = t(
            language,
            property ? "host.propertyListingLabel" : "host.tourListingLabel"
          );
          const location = listing?.Location || listing?.location || "";

          return {
            id: booking.BookingID || booking.bookingID,
            statusLabel,
            statusKey,
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
            location,
          };
        })
        .filter(Boolean);

      const checkInToday = t(language, "host.checkInToday");
      const staying = t(language, "host.staying");
      const upcoming = t(language, "host.upcoming");
      const completed = t(language, "host.completed");

      const statusOrder = {
        "check-in-today": 0,
        staying: 1,
        upcoming: 2,
        completed: 3,
      };
      const paymentOrder = {
        paid: 0,
        pending: 1,
        failed: 2,
        refunded: 3,
        noPayment: 4,
      };

      formatted.sort((a, b) => {
        if (statusOrder[a.statusKey] !== statusOrder[b.statusKey])
          return statusOrder[a.statusKey] - statusOrder[b.statusKey];
        if (paymentOrder[a.paymentStatus] !== paymentOrder[b.paymentStatus])
          return (
            paymentOrder[a.paymentStatus] - paymentOrder[b.paymentStatus]
          );
        return new Date(a.checkIn) - new Date(b.checkIn);
      });

      setBookings(formatted);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-today">
      {/* ================= CONTENT ================= */}
      <div className="booking-list">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            {t(language, "host.loadingBookings")}
          </div>
        ) : error ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}
          >
            <p>
              {t(language, "host.error")}: {error}
            </p>
            <button
              onClick={loadBookings}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "#111827",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {t(language, "host.tryAgain")}
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <p>{t(language, "host.noBookingsYet")}</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              {t(language, "host.bookingsWillAppear")}
            </p>
          </div>
        ) : (
          bookings.map((b) => (
            <div className="booking-card" key={b.id}>
              <div className={`status-badge ${b.statusKey}`}>
                {b.statusLabel}
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
                  {b.title} {b.rating && <span>★ {b.rating}</span>}
                </h3>

                {b.location && (
                  <p className="booking-location">{b.location}</p>
                )}

                <p>
                  {t(language, "host.guestName")}: {b.guest}
                </p>

                <p>
                  {t(language, "host.stayDuration")}: {b.duration}
                </p>

                <p>
                  {b.nights}{" "}
                  {b.nights === 1
                    ? t(language, "host.night")
                    : t(language, "host.nights")}
                  {" · "}
                  {b.guestsCount}{" "}
                  {b.guestsCount === 1
                    ? t(language, "host.guest")
                    : t(language, "host.guests")}
                </p>

                <p className="booking-price">
                  {b.totalPrice > 0 && format(convertToCurrent(b.totalPrice))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
