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
    const [deletingId, setDeletingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
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
        loadListings();
    }, [user]);

    // Helper function to normalize image URL
    const normalizeImageUrl = (url) => {
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
    };

    // Helper function to extract first photo URL from property/tour
    const getFirstPhotoUrl = (item) => {
        // Try multiple ways to get photos: Photos (PascalCase) or photos (camelCase)
        const photos = item.Photos || item.photos || [];
        
        if (!Array.isArray(photos) || photos.length === 0) {
            return null;
        }
        
        // Get first photo and try multiple ways to get URL
        const firstPhoto = photos[0];
        const url = firstPhoto?.Url || firstPhoto?.url || firstPhoto?.serverUrl || null;
        
        return normalizeImageUrl(url);
    };

    const loadListings = async () => {
        try {
            setLoading(true);
            if (!user) {
                setListings([]);
                return;
            }

            // Get user's ID
            const userID = user.UserID || user.userID || user.id;
            if (!userID) {
                setListings([]);
                return;
            }

            // Get properties by userID (backend will automatically find host from user)
            const properties = await authAPI.getPropertiesByUser(userID);
            
            // Format listings for display
            const formatted = properties.map(p => {
                // Process image URL with helper function
                const imageUrl = getFirstPhotoUrl(p);
                
                // Process reviews - try both Reviews and reviews
                const reviews = p.Reviews || p.reviews || [];
                const avgRating = reviews.length > 0 
                    ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length 
                    : 0;
                
                return {
                    id: p.PropertyID || p.propertyID || p.id,
                    status: p.Active ? "Listed" : "Pending",
                    title: p.ListingTitle || p.listingTitle || "Untitled",
                    rating: avgRating,
                    image: imageUrl || sampleImg,
                    type: "property",
                    location: p.Location || p.location || ""
                };
            });

            // Also load tours if needed
            try {
                const tours = await authAPI.getToursByUser(userID);
                const formattedTours = tours.map(t => {
                    // Process image URL with helper function
                    const imageUrl = getFirstPhotoUrl(t);
                    
                    // Process reviews - try both Reviews and reviews
                    const reviews = t.Reviews || t.reviews || t.TourReviews || t.tourReviews || [];
                    const avgRating = reviews.length > 0
                        ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length
                        : 0;
                    
                    return {
                        id: t.TourID || t.tourID || t.id,
                        status: t.Active ? "Listed" : "Pending",
                        title: t.TourName || t.tourName || "Untitled",
                        rating: avgRating,
                        image: imageUrl || sampleImg,
                        type: "tour",
                        location: t.Location || t.location || ""
                    };
                });
                setListings([...formatted, ...formattedTours]);
            } catch (err) {
                console.error("Error loading tours:", err);
                setListings(formatted);
            }
        } catch (err) {
            console.error("Error loading listings:", err);
            setListings([]);
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

    const handleDeleteClick = (item) => {
        // Open confirmation dialog
        setDeleteConfirm({
            id: item.id,
            type: item.type,
            title: item.title
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        const item = {
            id: deleteConfirm.id,
            type: deleteConfirm.type,
            title: deleteConfirm.title
        };

        // Perform deletion
        try {
            setDeletingId(item.id);
            if (item.type === 'property') {
                await authAPI.deleteProperty(item.id);
            } else {
                await authAPI.deleteTour(item.id);
            }
            
            // Remove from local list
            setListings(prev => prev.filter(l => !(l.id === item.id && l.type === item.type)));
            setDeleteConfirm(null);
            alert(`${item.type === 'property' ? 'Property' : 'Tour'} has been deleted successfully!`);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting: ' + (err.message || 'An error occurred'));
        } finally {
            setDeletingId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
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
                <div className="listing-grid">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                        Loading...
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>
                        You don't have any listings yet. Create a new listing to get started!
                    </div>
                ) : (
                    listings.map((item) => (
                        <div className="listing-card" key={`${item.type}-${item.id}`}>
                            <div className={`listing-status ${item.status === "Pending" ? "pending" : ""}`}>
                                {item.status}
                            </div>
                            
                            {/* Type badge */}
                            <div className="listing-type-badge">
                                <Icon 
                                    icon={item.type === "property" ? "mdi:home" : "mdi:map-marker"} 
                                    width="14" 
                                    height="14" 
                                />
                                {item.type === "property" ? "Stay" : "Tour"}
                            </div>

                            {/* Delete button */}
                            <button
                                className="listing-delete-btn"
                                onClick={() => handleDeleteClick(item)}
                                disabled={deletingId === item.id}
                                aria-label={`Delete ${item.title}`}
                            >
                                {deletingId === item.id ? (
                                    <Icon icon="mdi:loading" width="18" height="18" className="spinning" />
                                ) : (
                                    <Icon icon="mdi:delete-outline" width="18" height="18" />
                                )}
                            </button>

                            <img 
                                src={item.image} 
                                alt={item.title}
                                className="listing-img"
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.src = sampleImg;
                                }}
                            />
                            <div className="listing-info">
                                <h3>
                                    {item.title}
                                    {item.rating > 0 && (
                                        <span className="listing-rating">★ {item.rating.toFixed(1)}</span>
                                    )}
                                </h3>
                                {item.location && (
                                    <p className="listing-location">
                                        <Icon icon="mdi:map-marker" width="14" height="14" />
                                        {item.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="delete-modal-backdrop" onClick={cancelDelete}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <Icon icon="mdi:alert-circle" width="24" height="24" className="delete-modal-icon" />
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="delete-modal-body">
                            <p>
                                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
                            </p>
                            <p className="delete-modal-warning">
                                This action cannot be undone. All related data will be permanently deleted.
                            </p>
                        </div>
                        <div className="delete-modal-actions">
                            <button
                                className="delete-modal-cancel"
                                onClick={cancelDelete}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-modal-confirm"
                                onClick={confirmDelete}
                                disabled={deletingId !== null}
                            >
                                {deletingId === deleteConfirm.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
