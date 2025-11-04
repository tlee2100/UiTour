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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  if (loading || localLoading) {
    return <LoadingSpinner message="Loading experience..." />;
  }

  if (error || !currentExperience) {
    return <ErrorMessage message={error || "Experience not found"} />;
  }

  const exp = currentExperience;

  return (
    <div className="experience-info-page">

      {/* Gallery + Overview */}
      <div className="expif-two-columns">
        <div className="expif-left-column">
          <ExpGallery
            images={
              Array.isArray(exp.photos) && exp.photos.length > 0
                ? exp.photos // ✅ lấy đúng ảnh từ normalizeExperience()
                : exp.media?.photos?.map(p => p.url) || [] // fallback để an toàn
            }
          />

        </div>

        <div className="expif-right-column">
          <ExpAboutSection
            title={exp.listingTitle || exp.title}
            summary={exp.summary}
            rating={exp.rating}
            reviewsCount={exp.reviewsCount}
            location={`${exp.location.address}, ${exp.location.city}`}
            duration={`${exp.durationHours} hours`}
            price={exp.price}
            currency={exp.currency}
            host={exp.host}
          />
        </div>
      </div>

      {/* Details + Booking */}
      <div className="expif-details-layout">
        <div className="expif-details-left">
          <ExpDetails
            title="What you’ll do"
            details={exp.details}
          />
        </div>

        <div className="expif-details-right">
          <ExpInfoBookingBox
            booking={exp.bookingInfo}
            price={exp.price}            // ✅ Thêm giá đúng UI cần
            currency={exp.currency}      // ✅ Thêm tiền tệ
          />
        </div>
      </div>

      <div className="expif-divider" />

      {/* Reviews */}
      <InfoReview
        rating={exp.rating}
        reviewsCount={exp.reviewsCount}
        reviews={exp.reviews}
      />

      <div className="expif-divider" />

      {/* Host */}
      <InfoHost host={exp.host} />

      <div className="expif-divider" />

      {/* Map */}
      <PropertyMap
        property={exp}    // ✅ TRUY NGUYÊN OBJECT TRONG CONTEXT
        height="500px"
        zoom={16}
        showPopup={true}
      />


      <div className="expif-end-divider" />
    </div>
  );
}
