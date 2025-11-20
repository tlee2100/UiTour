import { useEffect, useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ToursPage.css";
import { useExperience } from "../contexts/ExperienceContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ExperienceSearchBar from "../components/search/ExperienceSearchBar";
import { useApp } from "../contexts/AppContext";
import authAPI from "../services/authAPI";

export default function ToursPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const { experiences, loading, error, fetchExperiences } = useExperience();
  const [savedTourIds, setSavedTourIds] = useState(new Set());

  const deriveIdsFromWishlist = useCallback((wishlistPayload, targetType = 'property') => {
    if (!wishlistPayload) return new Set();
    const items = wishlistPayload.items || wishlistPayload.Items || [];
    return new Set(
      items
        .filter((item) => (item.type || item.Type || 'property') === targetType)
        .map((item) => Number(item.id ?? item.Id ?? item.propertyId ?? item.PropertyID))
        .filter((id) => !Number.isNaN(id))
    );
  }, []);
  
  const location = searchParams.get('location') || '';
  const dates = searchParams.get('dates') || '';
  const guests = searchParams.get('guests') || '1';

  // Load saved property IDs from wishlist
  const loadSavedProperties = useCallback(async () => {
    if (!user || !user.UserID) {
      setSavedTourIds(new Set());
      return;
    }
    
    try {
      const wishlist = await authAPI.getUserWishlist(user.UserID);
      setSavedTourIds(deriveIdsFromWishlist(wishlist, 'tour'));
    } catch (err) {
      console.error('Error loading saved properties:', err);
      setSavedTourIds(new Set());
    }
  }, [deriveIdsFromWishlist, user]);

  const loadExperiences = useCallback(async () => {
    try {
      await fetchExperiences();
    } catch (err) {
      console.error("Failed to load experiences:", err);
    }
  }, [fetchExperiences]);

  useEffect(() => {
    loadExperiences();
    loadSavedProperties();
  }, [loadExperiences, loadSavedProperties]);

  if (loading) {
    return <LoadingSpinner message="Loading tours..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="tours-page">
      {/* Search Bar */}
      <section className="tours-search-section">
        <div className="container">
          <ExperienceSearchBar 
            initialLocation={location}
            initialDates={dates}
            initialGuests={guests}
          />
        </div>
      </section>

      {/* Filter Bar */}
      <section className="tours-filter-section">
        <div className="container">
          <div className="filter-bar">
            <button className="filter-btn">
              <Icon icon="mdi:leaf" width="16" height="16" />
              <span>Original</span>
            </button>
            <button className="filter-btn">
              <span>Type</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>
            <button className="filter-btn">
              <span>Time of day</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>
            <button className="filter-btn">
              <Icon icon="mdi:tune" width="16" height="16" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="tours-grid-section">
        <div className="container">
          <div className="tours-grid">
            {experiences?.map(tour => {
              if (!tour) return null;
              return (
                <div key={tour.id} className="tour-card">

                  <div className="tour-image"
                    onClick={() => navigate(`/experience/${tour.id}`)}>
                    <img
                      src={tour.image?.url || tour.image || "/fallback.png"}
                      alt={tour.title || "Tour image"}
                    />
                    <button 
                      className="favorite-button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        
                        if (!user || !user.UserID) {
                          alert("Please log in to save tours to your wishlist");
                          return;
                        }

                        // Note: Tours are saved as properties in the current implementation
                        // If you have a separate tours wishlist, you'll need to create a different API
                        const isSaved = savedTourIds.has(tour.id);
                        
                        try {
                          let updatedWishlist;
                          if (isSaved) {
                            updatedWishlist = await authAPI.removeFromWishlist(user.UserID, tour.id, 'tour');
                          } else {
                            updatedWishlist = await authAPI.addToWishlist(user.UserID, tour.id, 'tour');
                          }
                          setSavedTourIds(deriveIdsFromWishlist(updatedWishlist, 'tour'));
                        } catch (error) {
                          console.error('Error updating wishlist:', error);
                          alert("Failed to update wishlist. Please try again.");
                        }
                      }}
                    >
                      <Icon 
                        icon={savedTourIds.has(tour.id) ? "mdi:heart" : "mdi:heart-outline"} 
                        width="20" 
                        height="20"
                        style={{ 
                          color: savedTourIds.has(tour.id) ? '#ff385c' : 'currentColor' 
                        }}
                      />
                    </button>

                    {tour.duration && (
                      <div className="tour-badge">
                        <span>{tour.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="tour-content">
                    <div className="tour-location">
                      <Icon icon="mdi:map-marker" width="16" height="16" />
                      <span>{tour.location || tour.locationObj?.city}</span>
                    </div>

                    <h3 className="tour-title">{tour.title}</h3>
                    <p className="tour-description">{tour.description}</p>

                    <div className="tour-rating">
                      <Icon icon="mdi:star" width="16" height="16" />
                      <span>{tour.rating?.toFixed?.(1) || "0.0"}</span>
                      <span className="rating-count">
                        ({tour.reviews ?? 0} reviews)
                      </span>
                    </div>

                    <div className="tour-footer">
                      <div className="tour-price">
                        <span className="price">
                          ${(tour.price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="price-unit">/ person</span>
                      </div>

                      <button
                        className="book-button"
                        onClick={() => navigate(`/experience/${tour.id}`)}
                      >
                        Book Now
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
