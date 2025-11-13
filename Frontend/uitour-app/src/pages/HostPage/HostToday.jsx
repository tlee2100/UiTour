import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HostToday.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";
    
const bookings = [
  {
    id: 1,
    status: "Staying",
    title: "Apartment in Quận Ba Đình",
    rating: 4.33,
    guest: "Tony Stark",
    duration: "18–25 Jun",
  },
  {
    id: 2,
    status: "Check-in today",
    title: "Apartment in Quận Ba Đình",
    rating: 4.33,
    guest: "Tony Stark",
    duration: "18–25 Jun",
  },
  {
    id: 3,
    status: "Upcoming",
    title: "Apartment in Quận Ba Đình",
    rating: 4.33,
    guest: "Tony Stark",
    duration: "18–25 Jun",
  },
];

export default function HostToday() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const closeMenu = () => setMenuOpen(false);

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
          <a href="#">Calendar</a>
          <Link to="/host/listings">Listings</Link>
          <a href="#">Messages</a>
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
              <button className="host-menu-link">
                <Icon icon="mdi:plus-circle-outline" width="20" height="20" />
                <span>Create a new listing</span>
              </button>
              <button className="host-menu-link">
                <Icon icon="mdi:gift-outline" width="20" height="20" />
                <span>Refer another host</span>
              </button>
              <div className="host-menu-divider" />
              <button className="host-menu-link host-menu-link-secondary">
                <Icon icon="mdi:logout" width="20" height="20" />
                <span>Log out</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* ================= CONTENT ================= */}
      <div className="booking-list">
        {bookings.map((b) => (
          <div className="booking-card" key={b.id}>
            <div
              className={`status-badge ${b.status
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
            >
              {b.status}
            </div>
            <img src={sampleImg} alt={b.title} className="booking-img" />
            <div className="booking-info">
              <h3>
                {b.title} <span>★ {b.rating}</span>
              </h3>
              <p>Guest name: {b.guest}</p>
              <p>Stay duration: {b.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
