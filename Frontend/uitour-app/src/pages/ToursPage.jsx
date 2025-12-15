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
import { useLanguage } from "../contexts/LanguageContext";
import { t } from "../utils/translations";


export default function ToursPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const { experiences, loading, error, fetchExperiences } = useExperience();
  const [savedTourIds, setSavedTourIds] = useState(new Set());
  const { convertToCurrent, format, currency } = useCurrency();
  const [openFilter, setOpenFilter] = useState(null);
  const { language } = useLanguage();

  // Price brackets in VND (same as Stay Filters)
  const PRICE_BRACKETS = {
    under20: [0, 20],
    "20to80": [20, 80],
    "80to200": [80, 200],
    over200: [200, Infinity],
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

  const parsePriceVND = (price) => {
    if (!price) return 0;

    // Nếu price là số
    if (typeof price === "number") return price;

    // Nếu price là string dạng "1,000,000"
    if (typeof price === "string") {
      return Number(price.replace(/[^0-9]/g, ""));
    }

    // Nếu price là object dạng { amount: 1000000 }
    if (typeof price === "object" && price.amount) {
      return Number(price.amount);
    }

    return 0;
  };


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
          if (time === "fullday") {
            return true;
          }
          return false;
        }

        const hour = Number(dateString.substring(11, 13));

        if (time === "morning" && !(hour >= 0 && hour < 12)) return false;
        if (time === "afternoon" && !(hour >= 12 && hour < 18)) return false;
        if (time === "evening" && !(hour >= 18 && hour < 22)) return false;
        if (time === "night" && !(hour >= 22 || hour < 5)) return false;

        // fullday → luôn pass (trừ khi bạn muốn logic khác)

      }

      // PRICE OPTION FILTER
      // PRICE FILTER — ALWAYS USE ORIGINAL VND PRICE
      // PRICE FILTER — ALWAYS USE RAW VND PRICE (CANONICAL)
      if (price && PRICE_BRACKETS[price]) {
        const tourPriceUSD = Number(tour.price ?? 0); // USD gốc
        const [min, max] = PRICE_BRACKETS[price];

        if (tourPriceUSD < min || tourPriceUSD >= max) return false;
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
    return <LoadingSpinner message={t(language, "tourPage.loading")} />;
  }

  if (error) {
    return <ErrorMessage message={t(language, "tourPage.error")} />;
  }

  const formatAmount = (vndValue) => {
    if (currency === "VND") {
      return vndValue.toLocaleString("vi-VN") + "đ";
    }
    const usd = vndValue / 25000;
    return "$" + usd.toFixed(2);
  };

  const TYPE_LABELS = {
    art: t(language, "hostExperience.choose.categories.art"),
    fitness: t(language, "hostExperience.choose.categories.fitness"),
    food: t(language, "hostExperience.choose.categories.food"),
    history: t(language, "hostExperience.choose.categories.history"),
    nature: t(language, "hostExperience.choose.categories.nature"),
  };

  const TIME_LABELS = {
    morning: t(language, "filters.time.morning"),
    afternoon: t(language, "filters.time.afternoon"),
    evening: t(language, "filters.time.evening"),
    fullday: t(language, "filters.time.fullday"),
  };

  const priceLabels = {
    under20: `${t(language, "filters.price.under")} ${format(20)}`,
    "20to80": `${format(20)} – ${format(80)}`,
    "80to200": `${format(80)} – ${format(200)}`,
    over200: `${format(200)}+`,
  };


  const PRICE_OPTIONS = [
    { key: "under500" },
    { key: "500to2m" },
    { key: "2to5" },
    { key: "5to10" },
    { key: "over10" },
  ];

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
              <span>{t(language, "tourPage.filters.original")}</span>
            </button>


            {/* TYPE FILTER */}
            <div className="filter-btn-wrapper">
              <button
                className="filter-btn"
                onClick={() =>
                  setOpenFilter(openFilter === "type" ? null : "type")
                }
              >
                <span>
                  {type ? TYPE_LABELS[type] : t(language, "tourPage.filters.type")}
                </span>
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
                <span>
                  {time ? TIME_LABELS[time] : t(language, "tourPage.filters.time")}
                </span>
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
                <span>
                  {price ? priceLabels[price] : t(language, "tourPage.filters.price")}
                </span>

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
              <span>{t(language, "tourPage.filters.clear")}</span>
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
                        alt={tour.title || t(language, "tourPage.tourImageAlt")}
                      />
                      <button
                        className="favorite-button"
                        onClick={async (e) => {
                          e.stopPropagation();

                          if (!user || !user.UserID) {
                            alert(t(language, "tourPage.wishlist.loginRequired"));
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
                            alert(t(language, "tourPage.wishlist.updateFailed"));
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
                          ({t(language, "tourPage.ratingReviews", { count: tour.reviews ?? 0 })})
                        </span>
                      </div>

                      <div className="tour-footer">
                        <div className="tour-price">
                          <span className="price">
                            {format(convertToCurrent(tour.price ?? 0))}
                          </span>
                          <span className="price-unit">
                            {t(language, "tourPage.cta.perPerson")}
                          </span>
                        </div>

                        <button
                          className="book-button"
                          onClick={() => navigate(`/experience/${tour.id}`)}
                        >
                          {t(language, "tourPage.cta.book")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <p>{t(language, "tourPage.noResults")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
