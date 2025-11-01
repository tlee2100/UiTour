import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useExperience } from "../contexts/ExperienceContext";
import "./ExperienceInfoPage.css";

import InfoHeader from "./Info_components/InfoHeader";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import ExpGallery from "./ExperienceInfo_component/ExpGallery";
import ExpAboutSection from "./ExperienceInfo_component/ExpAboutSection";
import ExpDetails from "./ExperienceInfo_component/ExpDetails";
import PropertyMap from "../components/PropertyMap";
import ExpInfoBookingBox from "./ExperienceInfo_component/ExpInfoBookingBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";


export default function ExperienceInfoPage() {
  const { id } = useParams();
  const {
    currentExperience,
    loading,
    error,
    fetchExperienceById
  } = useExperience();

  const [localLoading, setLocalLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadExperience = useCallback(async (experienceId) => {
    if (!experienceId || hasLoaded) return;

    setLocalLoading(true);
    setHasLoaded(true);

    try {
      await fetchExperienceById(experienceId);
    } catch (e) {
      console.error("Failed to load experience", e);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchExperienceById, hasLoaded]);

  useEffect(() => {
    if (id && !hasLoaded) {
      loadExperience(id);
    }
  }, [id, loadExperience, hasLoaded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  if (loading || localLoading) {
    return <LoadingSpinner message="Loading experience..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!currentExperience) {
    return <ErrorMessage message="Experience not found" />;
  }

  return (
    <div className="experience-info-page">

      {/* Header */}
      <InfoHeader
        title={currentExperience.title}
        info={{
          rating: `${currentExperience.rating}`,
          reviews: `${currentExperience.reviewsCount} reviews`,
          hostStatus: currentExperience.hostStatus || "Host",
          location: currentExperience.location
        }}
      />

      {/* Gallery + Overview */}
      <div className="expif-two-columns">
        <div className="expif-left-column">
          <ExpGallery images={currentExperience.photos || []} />
        </div>

        <div className="expif-right-column">
          <ExpAboutSection data={currentExperience} />
        </div>
      </div>

      {/* Details + Sticky Booking */}
      <div className="expif-details-layout">
        <div className="expif-details-left">
          <ExpDetails
            title="What you’ll do"
            details={currentExperience.details || []}
          />
        </div>

        <div className="expif-details-right">
          <ExpInfoBookingBox priceData={currentExperience.bookingInfo} />
        </div>
      </div>

      <div className="expif-divider" />

      {/* Reviews */}
      <InfoReview
        rating={currentExperience.rating}
        reviewsCount={currentExperience.reviewsCount}
        reviews={currentExperience.reviews || []}
      />

      <div className="expif-divider" />

      {/* Host */}
      <InfoHost host={currentExperience.host} />

      <div className="expif-divider" />

      {/* Map */}
      <PropertyMap
        property={currentExperience}
        height="500px"
        zoom={16}
        showPopup={true}
      />

      <div className="expif-end-divider" />
    </div>
  );
}
