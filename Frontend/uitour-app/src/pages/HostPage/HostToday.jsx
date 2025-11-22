import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HostToday.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";

export default function HostToday() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, dispatch } = useApp();

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
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setBookings([]);
        return;
      }

      const userID = user.UserID || user.userID || user.id;
      if (!userID) {
        setBookings([]);
        return;
      }

      // Lấy bookings theo host ID (userID)
      const bookingsData = await authAPI.getBookingsByHost(userID);
      
      // Format bookings để hiển thị
      const formatted = bookingsData.map(booking => {
        const checkIn = new Date(booking.CheckIn || booking.checkIn);
        const checkOut = new Date(booking.CheckOut || booking.checkOut);
        
        // Xác định status
        const now = new Date();
        let status = "Upcoming";
        if (checkIn <= now && checkOut >= now) {
          status = "Staying";
        } else if (checkIn.toDateString() === now.toDateString()) {
          status = "Check-in today";
        } else if (checkIn < now && checkOut < now) {
          status = "Completed";
        }

        // Format duration
        const duration = `${checkIn.getDate()} ${checkIn.toLocaleDateString('en-US', { month: 'short' })} – ${checkOut.getDate()} ${checkOut.toLocaleDateString('en-US', { month: 'short' })}`;

        // Lấy thông tin property hoặc tour
        const property = booking.Property || booking.property;
        const tour = booking.Tour || booking.tour;
        const listing = property || tour;
        
        const title = listing 
          ? (property ? (listing.ListingTitle || listing.listingTitle || "Property") : (listing.TourName || listing.tourName || "Tour"))
          : "Unknown Listing";
        
        // Lấy ảnh
        const photos = listing?.Photos || listing?.Photos || [];
        const image = photos?.[0]?.Url || photos?.[0]?.url || null;
        let imageUrl = image;
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `http://localhost:5069${imageUrl}`;
        }
        if (!imageUrl || imageUrl.startsWith('data:image')) {
          imageUrl = sampleImg;
        }

        // Lấy thông tin guest
        const guest = booking.User || booking.user;
        const guestName = guest 
          ? (guest.FullName || guest.fullName || guest.Email || guest.email || "Guest")
          : "Guest";

        // Lấy rating từ reviews nếu có
        const reviews = listing?.Reviews || listing?.reviews || [];
        const rating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length
          : 0;

        return {
          id: booking.BookingID || booking.bookingID || booking.id,
          status,
          title,
          rating: rating > 0 ? rating.toFixed(2) : null,
          guest: guestName,
          duration,
          image: imageUrl,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          type: property ? "property" : "tour"
        };
      });

      // Sắp xếp: Check-in today > Staying > Upcoming > Completed
      const statusOrder = { "Check-in today": 0, "Staying": 1, "Upcoming": 2, "Completed": 3 };
      formatted.sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
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

  return (
    <div className="host-today">
      {/* ================= HEADER ================= */}
      <header className="host-header">
        {/* LOGO */}
        <div className="header-logo">
          <img src={logo} alt="UiTour logo" />
        </div>

        {/* NAVBAR */}
        <nav className="nav-tabs">
          <Link to="/host/today" className="active">
            Today
          </Link>
          <Link to="/host/listings">Listings</Link>
          <Link to="/host/messages">Messages</Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="header-right">
          <button
            className="switch-title"
            onClick={() => navigate('/')}
          >
            Switch to traveling
          </button>

          {/* Globe */}
          <button className="globe-btn">
            <Icon icon="mdi:earth" width="24" height="24" />
          </button>

          {/* User Menu */}
          <div className="header_profile">
            <button
              className="header_menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Open host navigation menu"
              aria-expanded={menuOpen}
            >
              <Icon icon="mdi:menu" width="22" height="22" />
            </button>

            <button
              className="header_avatarButton"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Open host navigation menu"
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
            aria-label="Host navigation menu"
          >
            <div className="host-menu-header">
              <h2>Menu</h2>
              <button
                className="host-menu-close"
                onClick={closeMenu}
                aria-label="Close menu"
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
                <h3>New to hosting?</h3>
                <p>
                  Discover best practices shared by top-rated hosts and start
                  welcoming guests with confidence.
                </p>
                <button className="host-menu-card-action">Get started</button>
              </div>
            </div>

            <nav className="host-menu-links">
              <button className="host-menu-link">
                <Icon icon="mdi:cog-outline" width="20" height="20" />
                <span>Account settings</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:earth" width="20" height="20" />
                <span>Language & currency</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:book-open-page-variant" width="20" height="20" />
                <span>Hosting resources</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:lifebuoy" width="20" height="20" />
                <span>Get support</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:account-group-outline" width="20" height="20" />
                <span>Find a co-host</span>
              </button>
              <button 
                className="host-menu-link"
                onClick={() => {
                  closeMenu();
                  navigate("/host/becomehost");
                }}
              >
                <Icon icon="mdi:plus-circle-outline" width="20" height="20" />
                <span>Create a new listing</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:gift-outline" width="20" height="20" />
                <span>Refer another host</span>
              </button>
              <div className="host-menu-divider" />
              <button 
                className="host-menu-link host-menu-link-secondary"
                onClick={handleLogout}
              >
                <Icon icon="mdi:logout" width="20" height="20" />
                <span>Log out</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* ================= CONTENT ================= */}
      <div className="booking-list">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Đang tải bookings...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
            <p>Lỗi: {error}</p>
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
              Thử lại
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>Bạn chưa có booking nào.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Các booking sẽ xuất hiện ở đây khi có khách đặt phòng/tour của bạn.
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
                <p>Guest name: {b.guest}</p>
                <p>Stay duration: {b.duration}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
