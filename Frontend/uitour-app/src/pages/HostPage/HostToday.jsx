import React, { useState } from "react";
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
          <a href="#" className="active">
            Today
          </a>
          <a href="#">Calendar</a>
          <a href="#">Listings</a>
        </nav>

        {/* RIGHT SIDE */}
        <div className="header-right">
          <button className="switch-title">Switch to traveling</button>

          {/* Globe */}
          <button className="globe-btn">
            <Icon icon="mdi:earth" width="24" height="24" />
          </button>

          {/* User Menu */}
          <div
            className="header_profile"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <button className="header_menu">
              <Icon icon="mdi:menu" width="22" height="22" />
            </button>

            <button className="header_avatarButton">
              <Icon icon="mdi:account-circle" width="28" height="28" />
            </button>

            {menuOpen && (
              <div className="profile_dropdown">
                <ul>
                  <li>Profile</li>
                  <li>Settings</li>
                  <li>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

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
