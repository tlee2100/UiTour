import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HostListings.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";

export default function HostListings() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [listings, setListings] = useState([]);
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
        const fetchListings = async () => {
            if (!user || !user.UserID) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await authAPI.getHostListingsByUserId(user.UserID);
                setListings(data || []);
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError(err.message || 'Failed to load listings');
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [user]);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        closeMenu();
        navigate('/');
    };

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
                    <Link to="/host/listings" className="active">
                        Listings
                    </Link>
                    <Link to="/host/messages">Messages</Link>
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
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Loading listings...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                        <p>Error: {error}</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>No listings found. Create your first listing to get started!</p>
                    </div>
                ) : (
                    <div className="listing-grid">
                        {listings.map((item) => (
                            <div 
                                className="listing-card" 
                                key={`${item.type}-${item.id}`}
                                onClick={() => {
                                    if (item.type === 'Property') {
                                        navigate(`/property/${item.id}`);
                                    } else if (item.type === 'Tour') {
                                        navigate(`/experience/${item.id}`);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="listing-status">{item.status}</div>
                                <img 
                                    src={item.imageUrl || sampleImg} 
                                    alt={item.title} 
                                    className="listing-img"
                                    onError={(e) => {
                                        e.target.src = sampleImg;
                                    }}
                                />
                                <div className="listing-info">
                                    <h3>
                                        {item.title} 
                                        {item.rating > 0 && <span>★ {item.rating.toFixed(2)}</span>}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                        {item.type}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
