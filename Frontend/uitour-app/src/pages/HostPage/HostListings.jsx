import React, { useState } from "react";
import "./HostListings.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";

const listings = [
    {
        id: 1,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 2,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 3,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 4,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 5,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 6,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 7,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
    {
        id: 8,
        status: "Listed",
        title: "Apartment in Quận Ba Đình",
        rating: 4.33,
    },
];

export default function HostListings() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="host-listings">
            {/* ================= HEADER ================= */}
            <header className="host-header">
                {/* LOGO */}
                <div className="header-logo">
                    <img src={logo} alt="UiTour logo" />
                </div>

                {/* NAVBAR */}
                <nav className="nav-tabs">
                    <a href="#">Today</a>
                    <a href="#">Calendar</a>
                    <a href="#" className="active">
                        Listings
                    </a>
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
            <div className="listing-grid">
                {listings.map((item) => (
                    <div className="listing-card" key={item.id}>
                        <div className="listing-status">{item.status}</div>
                        <img src={sampleImg} alt={item.title} className="listing-img" />
                        <div className="listing-info">
                            <h3>
                                {item.title} <span>★ {item.rating}</span>
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
