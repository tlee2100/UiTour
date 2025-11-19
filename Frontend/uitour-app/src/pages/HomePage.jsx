import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { Icon } from '@iconify/react';
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SearchWhere from '../components/search/SearchWhere';
import SearchDates from '../components/search/SearchDates';
import SearchGuests from '../components/search/SearchGuests';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchLocation, setSearchLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [openWhere, setOpenWhere] = useState(false);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());

  const deriveIdsFromWishlist = useCallback((wishlistPayload, targetType = 'property') => {
    if (!wishlistPayload) return;
    const items = wishlistPayload.items || wishlistPayload.Items || [];
    const ids = items
      .filter((item) => (item.type || item.Type || 'property') === targetType)
      .map((item) => Number(item.id ?? item.Id ?? item.propertyId ?? item.PropertyID))
      .filter((id) => !Number.isNaN(id));
    setSavedPropertyIds(new Set(ids));
  }, []);

  // -----------------------
  // Load saved property IDs from wishlist
  // -----------------------
  const loadSavedProperties = useCallback(async () => {
    if (!user || !user.UserID) {
      setSavedPropertyIds(new Set());
      return;
    }
    
    try {
      const wishlist = await authAPI.getUserWishlist(user.UserID);
      deriveIdsFromWishlist(wishlist, 'property');
    } catch (err) {
      // Silently fail - user might not have wishlist yet
      console.error('Error loading saved properties:', err);
      setSavedPropertyIds(new Set());
    }
  }, [deriveIdsFromWishlist, user]);

  // -----------------------
  // Load properties from API
  // -----------------------
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await authAPI.getProperties();
      // Normalize dữ liệu từ backend
      const normalized = list.map(p => {
    const reviews = Array.isArray(p.reviews) ? p.reviews : [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length 
      : 0;

    return {
      id: p.propertyID,
      title: p.listingTitle || 'Untitled',
      location: p.location || '',
      price: p.price ?? 0,
      currency: p.currency ?? "USD",
      rating: avgRating,
      reviewsCount: reviews.length,
      mainImage: Array.isArray(p.photos) && p.photos.length > 0 ? p.photos[0].url : "/fallback.png",
      isGuestFavourite: false,
      dates: null
    };
    });
      setProperties(normalized);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
      loadSavedProperties();
  }, [loadProperties, loadSavedProperties]);

  // -----------------------
  // Search handler
  // -----------------------
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    navigate(`/search?${params.toString()}`);
  };

  const categories = [
    { name: "Amazing views", icon: "mdi:mountain" },
    { name: "Farms", icon: "mdi:barn" },
    { name: "Earth Homes", icon: "mdi:home-variant" },
    { name: "Top of the world", icon: "mdi:peak" },
    { name: "Design", icon: "mdi:architecture" },
    { name: "Bread & breakfasts", icon: "mdi:coffee" },
    { name: "Iconic cities", icon: "mdi:city" },
    { name: "Treehouses", icon: "mdi:tree" },
    { name: "Courtyards", icon: "mdi:flower" }
  ];

  // 🔄 Loading state
  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách chỗ ở..." />;
  }

  // ⚠️ Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="homepage">
      {/* Search Bar */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <button className="search-field search-field-btn" onClick={() => { setOpenWhere(!openWhere); setOpenDates(false); setOpenGuests(false); }}>
              <label>Where</label>
              <div className="sf-value">{searchLocation || 'Search destinations'}</div>
            </button>

            <button className="search-field search-field-btn" onClick={() => { setOpenDates(!openDates); setOpenWhere(false); setOpenGuests(false); }}>
              <label>Check in</label>
              <div className="sf-value">{checkIn || 'Add dates'}</div>
            </button>

            <button className="search-field search-field-btn" onClick={() => { setOpenDates(!openDates); setOpenWhere(false); setOpenGuests(false); }}>
              <label>Check out</label>
              <div className="sf-value">{checkOut || 'Add dates'}</div>
            </button>

            <button className="search-field search-field-btn" onClick={() => { setOpenGuests(!openGuests); setOpenWhere(false); setOpenDates(false); }}>
              <label>Who</label>
              <div className="sf-value">{guests ? `${guests} guests` : 'Add guests'}</div>
            </button>

            <button className="search-button" onClick={handleSearch}>
              <Icon icon="mdi:magnify" width="20" height="20" style={{ color: 'white' }} />
            </button>
          </div>

          <SearchWhere
            open={openWhere}
            onClose={() => setOpenWhere(false)}
            onSelectRegion={(r) => setSearchLocation(r.title)}
          />

          <SearchDates
            open={openDates}
            onClose={() => setOpenDates(false)}
            value={{ checkIn, checkOut }}
            onChange={(v) => { setCheckIn(v.checkIn || ''); setCheckOut(v.checkOut || ''); }}
          />

          <SearchGuests
            open={openGuests}
            onClose={() => setOpenGuests(false)}
            guests={{ adults: Number(guests) || 1, children: 0, infants: 0, pets: 0 }}
            onChange={(g) => setGuests(String(g.adults + g.children))}
          />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="properties-section">
        <div className="properties-grid">
          {properties.map(property => (
            <div
              key={property.id}
              className="property-card"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate(`/property/${property.id}`);
              }}
            >
              <div className="property-image">
                <img src={property.mainImage} alt={property.title} />
                {property.isGuestFavourite && (
                  <div className="guest-favourite-badge">Guest favourite</div>
                )}
                <button
                  className="favorite-button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    
                    if (!user || !user.UserID) {
                      alert("Please log in to save properties to your wishlist");
                      return;
                    }

                    const isSaved = savedPropertyIds.has(property.id);
                    
                    try {
                      let updatedWishlist;
                      if (isSaved) {
                        updatedWishlist = await authAPI.removeFromWishlist(user.UserID, property.id, 'property');
                      } else {
                        updatedWishlist = await authAPI.addToWishlist(user.UserID, property.id, 'property');
                      }
                      deriveIdsFromWishlist(updatedWishlist, 'property');
                    } catch (error) {
                      console.error('Error updating wishlist:', error);
                      alert("Failed to update wishlist. Please try again.");
                    }
                  }}
                >
                  <Icon 
                    icon={savedPropertyIds.has(property.id) ? "mdi:heart" : "mdi:heart-outline"} 
                    width="20" 
                    height="20"
                    style={{ 
                      color: savedPropertyIds.has(property.id) ? '#ff385c' : 'currentColor' 
                    }}
                  />
                </button>

              </div>
              <div className="property-info">
                <div className="property-title">{property.title}</div>
                <div className="property-rating">
                  <Icon icon="mdi:star" width="14" height="14" />
                  <span>{(property.rating ?? 0).toFixed(1)}</span>
                  <span className="rating-count">({property.reviewsCount || 0})</span>
                </div>
                <div className="property-dates">{property.dates || "Available ✅"}</div>
                <div className="property-price">
                  <span className="price">₫{(property.price ?? 0).toLocaleString("vi-VN")}</span>
                  <span className="price-unit"> / đêm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Exploring */}
      <section className="continue-section">
        <div className="continue-content">
          <h2>Continue exploring amazing views</h2>
          <button className="show-more-button">Show more</button>
        </div>
      </section>
    </div>
  );
}
