import { useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import "./ToursPage.css";
import { useExperience } from "../contexts/ExperienceContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function ToursPage() {
  const navigate = useNavigate();
  const { experiences, loading, error, fetchExperiences } = useExperience();

  const loadExperiences = useCallback(async () => {
    try {
      await fetchExperiences();
    } catch (err) {
      console.error("Failed to load experiences:", err);
    }
  }, [fetchExperiences]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  if (loading) {
    return <LoadingSpinner message="Loading tours..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="tours-page">
      <section className="tours-hero">
        <div className="container">
          <h1 className="tours-title">Discover Amazing Tours</h1>
          <p className="tours-subtitle">
            Experience Vietnam like never before with our curated selection of tours
          </p>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="tours-grid-section">
        <div className="container">
          <div className="tours-grid">
            {experiences.map(tour => (
              <div key={tour.id} className="tour-card">

                <div className="tour-image"
                  onClick={() => navigate(`/experience/${tour.id}`)}>
                  <img src={tour.image} alt={tour.listingTitle || "Tour image"} />

                  <button className="favorite-button">
                    <Icon icon="mdi:heart-outline" width="20" height="20" />
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
                    <span>{tour.location}</span>
                  </div>

                  <h3 className="tour-title">{tour.title}</h3>
                  <p className="tour-description">{tour.description}</p>

                  <div className="tour-rating">
                    <Icon icon="mdi:star" width="16" height="16" />
                    <span>{tour.rating}</span>
                    <span className="rating-count">
                      ({tour.reviews} reviews)
                    </span>
                  </div>

                  <div className="tour-footer">
                    <div className="tour-price">
                      <span className="price">
                        {tour.price.toLocaleString()}₫
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
