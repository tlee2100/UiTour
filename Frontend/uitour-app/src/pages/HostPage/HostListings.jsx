import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HostListings.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import logo from "../../assets/UiTour.png";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";
import LanguageCurrencySelector from "../../components/LanguageCurrencySelector";

export default function HostListings() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();
    const { user, dispatch } = useApp();
    const { language } = useLanguage();
    const { isOpen: languageCurrencyOpen, openModal: openLanguageCurrency, closeModal: closeLanguageCurrency } = useLanguageCurrencyModal();
    const globeButtonRef = React.useRef(null);

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
                    status: p.Active ? t(language, 'host.listed') : t(language, 'host.pending'),
                    title: p.ListingTitle || p.listingTitle || "Untitled",
                    rating: avgRating,
                    image: imageUrl || sampleImg,
                    type: "property",
                    location: p.Location || p.location || ""
                };
            });

            // Also load tours - try multiple methods
            let tours = [];
            try {
                // First try: getToursByUser (if endpoint exists)
                try {
                    tours = await authAPI.getToursByUser(userID);
                    console.log("Tours loaded via getToursByUser:", tours);
                } catch (userErr) {
                    console.warn("getToursByUser failed, trying getToursByHost:", userErr);
                    // Second try: getToursByHost with userID (backend might map userID to hostID)
                    try {
                        tours = await authAPI.getToursByHost(userID);
                        console.log("Tours loaded via getToursByHost:", tours);
                    } catch (hostErr) {
                        console.warn("getToursByHost failed, trying getTours and filtering:", hostErr);
                        // Third try: get all tours and filter by host/user
                        const allTours = await authAPI.getTours();
                        // Filter tours where host matches current user
                        // Check if tour has HostID, Host, or userID that matches
                        tours = (allTours || []).filter(t => {
                            const tourHostID = t.HostID || t.hostID || t.Host?.HostID || t.host?.hostID;
                            const tourUserID = t.UserID || t.userID || t.Host?.UserID || t.host?.userID;
                            return tourHostID === userID || tourUserID === userID || 
                                   tourHostID === (user.HostID || user.hostID) ||
                                   tourUserID === (user.HostID || user.hostID);
                        });
                        console.log("Tours filtered from getAllTours:", tours);
                    }
                }

                // Format tours for display
                if (tours && Array.isArray(tours) && tours.length > 0) {
                    const formattedTours = tours.map(tour => {
                        // Process image URL with helper function
                        const imageUrl = getFirstPhotoUrl(tour);
                        
                        // Process reviews - try multiple field names
                        const reviews = tour.Reviews || tour.reviews || tour.TourReviews || tour.tourReviews || [];
                        const avgRating = reviews.length > 0
                            ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length
                            : 0;
                        
                        return {
                            id: tour.TourID || tour.tourID || tour.id,
                            status: tour.Active ? t(language, 'host.listed') : t(language, 'host.pending'),
                            title: tour.TourName || tour.tourName || tour.title || "Untitled",
                            rating: avgRating,
                            image: imageUrl || sampleImg,
                            type: "tour",
                            location: tour.Location || tour.location || ""
                        };
                    });
                    setListings([...formatted, ...formattedTours]);
                } else {
                    console.log("No tours found for user");
                    setListings(formatted);
                }
            } catch (err) {
                console.error("Error loading tours (all methods failed):", err);
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
            alert(`${item.type === 'property' ? t(language, 'host.property') : t(language, 'host.tour')} ${t(language, 'host.hasBeenDeleted')}`);
        } catch (err) {
            console.error('Delete error:', err);
            alert(`${t(language, 'host.errorDeleting')}: ` + (err.message || t(language, 'host.anErrorOccurred')));
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
                <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="UiTour logo" />
                </div>

                {/* NAVBAR */}
                <nav className="nav-tabs">
                    <Link to="/host/today">{t(language, 'host.today')}</Link>
                    <Link to="/host/listings" className="active">
                        {t(language, 'host.listings')}
                    </Link>
                    <Link to="/host/messages">{t(language, 'host.messages')}</Link>
                </nav>

                {/* RIGHT SIDE */}
                <div className="header-right">
                    <button
                        className="switch-title"
                        onClick={() => navigate("/")}
                    >
                        {t(language, 'common.switchToTraveling')}
                    </button>

                    {/* Globe */}
                    <button 
                        ref={globeButtonRef}
                        className="globe-btn"
                        onClick={() => {
                            if (menuOpen) {
                                setMenuOpen(false);
                            }
                            openLanguageCurrency();
                        }}
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
                            onClick={() => {
                                if (languageCurrencyOpen) {
                                    closeLanguageCurrency();
                                }
                                setMenuOpen((prev) => !prev);
                            }}
                            aria-label={t(language, 'host.openHostNavigationMenu')}
                            aria-expanded={menuOpen}
                        >
                            <Icon icon="mdi:menu" width="22" height="22" />
                        </button>

                        <button
                            className="header_avatarButton"
                            onClick={() => {
                                if (languageCurrencyOpen) {
                                    closeLanguageCurrency();
                                }
                                setMenuOpen((prev) => !prev);
                            }}
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
                                    navigate("/account/settings");
                                }}
                            >
                                <Icon icon="mdi:cog-outline" width="20" height="20" />
                                <span>{t(language, 'host.accountSettings')}</span>
                            </button>
                            <button 
                                className="host-menu-link"
                                onClick={() => {
                                    closeMenu();
                                    // Small delay to ensure menu closes before opening modal
                                    setTimeout(() => {
                                        openLanguageCurrency();
                                    }, 100);
                                }}
                            >
                                <Icon icon="mdi:earth" width="20" height="20" />
                                <span>{t(language, 'host.languageCurrency')}</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:book-open-page-variant" width="20" height="20" />
                                <span>{t(language, 'host.hostingResources')}</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:lifebuoy" width="20" height="20" />
                                <span>{t(language, 'host.getSupport')}</span>
                            </button>
                            <button className="host-menu-link">
                                <Icon icon="mdi:account-group-outline" width="20" height="20" />
                                <span>{t(language, 'host.findCoHost')}</span>
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
                            <button className="host-menu-link">
                                <Icon icon="mdi:gift-outline" width="20" height="20" />
                                <span>{t(language, 'host.referAnotherHost')}</span>
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
            <div className="listing-content">
                <div className="listing-header">
                    <div>
                        <h1>{t(language, 'host.yourListings')}</h1>
                        <p>{t(language, 'host.publishNewStay')}</p>
                    </div>
                    <button
                        className="listing-create-btn"
                        onClick={() => navigate("/host/becomehost")}
                    >
                        <Icon icon="mdi:plus" width="20" height="20" />
                        {t(language, 'host.createNewListing')}
                    </button>
                </div>
                <div className="listing-grid">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                        {t(language, 'host.loading')}
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>
                        {t(language, 'host.noListingsYet')}
                    </div>
                ) : (
                    listings.map((item) => (
                        <div className="listing-card" key={`${item.type}-${item.id}`}>
                            <div className={`listing-status ${item.status === t(language, 'host.pending') ? "pending" : ""}`}>
                                {item.status}
                            </div>
                            
                            {/* Type badge */}
                            <div className="listing-type-badge">
                                <Icon 
                                    icon={item.type === "property" ? "mdi:home" : "mdi:map-marker"} 
                                    width="14" 
                                    height="14" 
                                />
                                {item.type === "property" ? t(language, 'host.stay') : t(language, 'host.tour')}
                            </div>

                            {/* Delete button */}
                            <button
                                className="listing-delete-btn"
                                onClick={() => handleDeleteClick(item)}
                                disabled={deletingId === item.id}
                                aria-label={`${t(language, 'host.deleteItem')} ${item.title}`}
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
                            <h3>{t(language, 'host.confirmDeletion')}</h3>
                        </div>
                        <div className="delete-modal-body">
                            <p>
                                {t(language, 'host.areYouSureDelete')} <strong>"{deleteConfirm.title}"</strong>?
                            </p>
                            <p className="delete-modal-warning">
                                {t(language, 'host.thisActionCannotBeUndone')}
                            </p>
                        </div>
                        <div className="delete-modal-actions">
                            <button
                                className="delete-modal-cancel"
                                onClick={cancelDelete}
                                disabled={deletingId !== null}
                            >
                                {t(language, 'common.cancel')}
                            </button>
                            <button
                                className="delete-modal-confirm"
                                onClick={confirmDelete}
                                disabled={deletingId !== null}
                            >
                                {deletingId === deleteConfirm.id ? t(language, 'host.deleting') : t(language, 'common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
