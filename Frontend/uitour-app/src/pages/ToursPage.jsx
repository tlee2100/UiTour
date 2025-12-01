import { useEffect, useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ToursPage.css";
import { useExperience } from "../contexts/ExperienceContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ExperienceSearchBar from "../components/search/ExperienceSearchBar";
import TourTypeFilter from "../components/toursFilters/TourTypeFilter";
import TourTimeFilter from "../components/toursFilters/TourTimeFilter";
import TourPriceFilter from "../components/toursFilters/TourPriceFilter";
import { useApp } from "../contexts/AppContext";
import authAPI from "../services/authAPI";
import { useCurrency } from "../contexts/CurrencyContext";

export default function ToursPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const { experiences, loading, error, fetchExperiences } = useExperience();
  const [savedTourIds, setSavedTourIds] = useState(new Set());
  const { convertToCurrent, format } = useCurrency();
  const [openFilter, setOpenFilter] = useState(null);

  // Price brackets in VND (same as Stay Filters)
  const PRICE_BRACKETS = {
    under500: [0, 500000],
    "500to2m": [500000, 2000000],
    "2to5": [2000000, 5000000],
    "5to10": [5000000, 10000000],
    over10: [10000000, Infinity],
  };


  const deriveIdsFromWishlist = useCallback(
    (wishlistPayload, targetType = "property") => {
      if (!wishlistPayload) return new Set();
      const items = wishlistPayload.items || wishlistPayload.Items || [];
      return new Set(
        items
          .filter(
            (item) => (item.type || item.Type || "property") === targetType
          )
          .map((item) =>
            Number(item.id ?? item.Id ?? item.propertyId ?? item.PropertyID)
          )
          .filter((id) => !Number.isNaN(id))
      );
    },
    []
  );

  const location = searchParams.get("location") || "";
  const dates = searchParams.get("dates") || "";
  const guests = searchParams.get("guests") || "1";
  const type = searchParams.get("type");
  const time = searchParams.get("time");

  /** 🔥 FIX: price param (option-based) */
  const price = searchParams.get("price") || "";

  // Filter experiences
  const filteredExperiences =
    experiences?.filter((tour) => {
      if (!tour) return false;

      // Location
      if (location) {
        const tourLocation = tour.location || tour.locationObj?.city || "";
        if (!tourLocation.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }

      // Guests
      if (guests && guests !== "1") {
        const guestCount = Number(guests);
        if (!isNaN(guestCount) && tour.maxGuests) {
          if (tour.maxGuests < guestCount) {
            return false;
          }
        }
      }

      // Type
      if (type && tour.mainCategory?.toLowerCase() !== type.toLowerCase())
        return false;

      // Time — startDate or StartDate
      if (time) {
        const dateString = tour.startDate || tour.StartDate || null;

        if (!dateString) {
          // Nếu là tour full-day thì luôn pass khi chọn "full-day"
          if (time === "fullday") return true;
          return false;
        }

        const hour = new Date(dateString).getHours();

        if (time === "morning" && !(hour >= 5 && hour < 12)) return false;
        if (time === "afternoon" && !(hour >= 12 && hour < 18)) return false;
        if (time === "evening" && !(hour >= 18 && hour < 22)) return false;
        if (time === "night" && !(hour >= 22 || hour < 5)) return false;

        // fullday → luôn pass (trừ khi bạn muốn logic khác)
      }

      // PRICE OPTION FILTER
      // PRICE FILTER — ALWAYS USE ORIGINAL VND PRICE
      if (price) {
        const tourPriceVND = Number(tour.price || 0);
        const [min, max] = PRICE_BRACKETS[price] || [0, Infinity];

        if (!(tourPriceVND >= min && tourPriceVND < max)) return false;
      }


      return true;
    }) || [];

  const handleSearch = ({ location, dates, guests, params }) => {
    navigate(`/tours?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    // giữ nguyên location hoặc xoá luôn, bạn chọn 1 trong 2:

    // ❗ Nếu bạn *muốn giữ location/dates/guests*:
    // if (location) params.set("location", location);
    // if (dates) params.set("dates", dates);
    // if (guests) params.set("guests", guests);

    // ❗ Nếu bạn muốn *reset sạch 100%*:
    navigate("/tours");

    setOpenFilter(null);
  };

  const loadSavedProperties = useCallback(async () => {
    if (!user || !user.UserID) {
      setSavedTourIds(new Set());
      return;
    }

    try {
      const wishlist = await authAPI.getUserWishlist(user.UserID);
      setSavedTourIds(deriveIdsFromWishlist(wishlist, "tour"));
    } catch (err) {
      console.error("Error loading saved properties:", err);
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
            onSearch={handleSearch}
            searchPath="/tours"
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

            {/* TYPE FILTER */}
            <div className="filter-btn-wrapper">
              <button
                className="filter-btn"
                onClick={() =>
                  setOpenFilter(openFilter === "type" ? null : "type")
                }
              >
                <span>Type</span>
                <Icon icon="mdi:chevron-down" width="16" height="16" />
              </button>

              {openFilter === "type" && (
                <TourTypeFilter
                  current={type || ""}
                  onSelect={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("type", value);
                    navigate(`/tours?${params.toString()}`);
                    setOpenFilter(null);
                  }}
                />
              )}
            </div>

            {/* TIME FILTER */}
            <div className="filter-btn-wrapper">
              <button
                className="filter-btn"
                onClick={() =>
                  setOpenFilter(openFilter === "time" ? null : "time")
                }
              >
                <span>Time</span>
                <Icon icon="mdi:chevron-down" width="16" height="16" />
              </button>

              {openFilter === "time" && (
                <TourTimeFilter
                  current={time || ""}
                  onSelect={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("time", value);
                    navigate(`/tours?${params.toString()}`);
                    setOpenFilter(null);
                  }}
                />
              )}
            </div>

            {/* PRICE FILTER */}
            <div className="filter-btn-wrapper">
              <button
                className="filter-btn"
                onClick={() =>
                  setOpenFilter(openFilter === "price" ? null : "price")
                }
              >
                <span>Price</span>
                <Icon icon="mdi:chevron-down" width="16" height="16" />
              </button>

              {openFilter === "price" && (
                <TourPriceFilter
                  current={price}
                  onSelect={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("price", value);
                    navigate(`/tours?${params.toString()}`);
                    setOpenFilter(null);
                  }}
                />
              )}
            </div>

            <button
              className="filter-btn clear-filter-btn"
              onClick={handleClearFilters}
            >
              <Icon icon="mdi:close-circle-outline" width="16" height="16" />
              <span>Clear</span>
            </button>

          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="tours-grid-section">
        <div className="container">
          <div className="tours-grid">
            {filteredExperiences.length > 0 ? (
              filteredExperiences.map((tour) => {
                if (!tour) return null;

                const normalizeImageUrl = (url) => {
                  if (!url || url.trim().length === 0) return "/fallback.svg";
                  if (url.startsWith("http://") || url.startsWith("https://"))
                    return url.trim();
                  if (url.startsWith("/"))
                    return `http://localhost:5069${url}`;
                  return `http://localhost:5069/${url}`;
                };

                const imageUrl = tour.image?.url || tour.image || "/fallback.svg";
                const normalizedImageUrl = normalizeImageUrl(imageUrl);

                return (
                  <div key={tour.id} className="tour-card">
                    <div
                      className="tour-image"
                      onClick={() => navigate(`/experience/${tour.id}`)}
                    >
                      <img
                        src={normalizedImageUrl}
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

                          const isSaved = savedTourIds.has(tour.id);

                          try {
                            let updatedWishlist;
                            if (isSaved) {
                              updatedWishlist =
                                await authAPI.removeFromWishlist(
                                  user.UserID,
                                  tour.id,
                                  "tour"
                                );
                            } else {
                              updatedWishlist =
                                await authAPI.addToWishlist(
                                  user.UserID,
                                  tour.id,
                                  "tour"
                                );
                            }
                            setSavedTourIds(
                              deriveIdsFromWishlist(updatedWishlist, "tour")
                            );
                          } catch (error) {
                            console.error("Error updating wishlist:", error);
                            alert("Failed to update wishlist. Please try again.");
                          }
                        }}
                      >
                        <Icon
                          icon={
                            savedTourIds.has(tour.id)
                              ? "mdi:heart"
                              : "mdi:heart-outline"
                          }
                          width="20"
                          height="20"
                          style={{
                            color: savedTourIds.has(tour.id)
                              ? "#ff385c"
                              : "currentColor",
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
                            {format(convertToCurrent(tour.price ?? 0))}
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
              })
            ) : (
              <div className="no-results">
                <p>No tours found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
