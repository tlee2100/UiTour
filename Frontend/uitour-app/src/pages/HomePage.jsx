import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { Icon } from '@iconify/react';
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import UniversalSearchBar from '../components/search/UniversalSearchBar';
import authAPI from '../services/authAPI';
import { useApp } from '../contexts/AppContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleSearchNavigate = (queryString) => {
    navigate(`/search?${queryString}`);
  }; // 🔥 ADD THIS

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());
  const { convertToCurrent, format } = useCurrency();

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
      const normalized = list.map(p => {
        const reviews = Array.isArray(p.reviews) ? p.reviews : [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
          : 0;

        const normalizeImageUrl = (url) => {
          if (!url || url.trim().length === 0) return "/fallback.svg";
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          if (url.startsWith('/')) return `http://localhost:5069${url}`;
          return `http://localhost:5069/${url}`;
        };

        const photos = p.photos || p.Photos || [];
        const firstPhoto = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;

        const imageUrl = firstPhoto
          ? (firstPhoto.url || firstPhoto.Url || firstPhoto.serverUrl || firstPhoto.ServerUrl || "/fallback.svg")
          : "/fallback.svg";

        return {
          id: p.propertyID,
          title: p.listingTitle || 'Untitled',
          location: p.location || '',
          price: p.price ?? 0,
          currency: p.currency ?? "USD",
          rating: avgRating,
          reviewsCount: reviews.length,
          mainImage: normalizeImageUrl(imageUrl),
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

  // 🔄 Loading state
  if (loading) {
    return <LoadingSpinner message="Loading accommodations..." />;
  }

  // ⚠️ Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="homepage">

      {/* ⭐ NEW UNIVERSAL SEARCH BAR ⭐ */}
      <section className="search-section">
        <UniversalSearchBar onSearch={handleSearchNavigate}/>
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
                <img
                  src={property.mainImage}
                  alt={property.title}
                  onError={(e) => {
                    e.target.src = '/fallback.svg';
                  }}
                />

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
                  <span className="price">{format(convertToCurrent(property.price ?? 0))}</span>
                  <span className="price-unit"> / night</span>
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
