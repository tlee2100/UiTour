import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="host-listings">
            {/* ================= HEADER ================= */}
            <header className="host-header">
                {/* LOGO */}
                <div className="header-logo">
                    <img src={logo} alt="UiTour logo" />
                </div>

                {/* NAVBAR */}
                <nav className="nav-tabs">
                    <Link to="/host/today">Today</Link>
                    <a href="#">Calendar</a>
                    <Link to="/host/listings" className="active">
                        Listings
                    </Link>
                    <a href="#">Messages</a>
                </nav>

                {/* RIGHT SIDE */}
                <div className="header-right">
                    <button
                        className="switch-title"
                        onClick={() => navigate("/")}
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
            <div className="listing-content">
                <div className="listing-header">
                    <div>
                        <h1>Your listings</h1>
                        <p>Publish a new stay or update an existing one.</p>
                    </div>
                    <button
                        className="listing-create-btn"
                        onClick={() => navigate("/host/becomehost")}
                    >
                        <Icon icon="mdi:plus" width="20" height="20" />
                        Create new listing
                    </button>
                </div>
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
        </div>
    );
}
