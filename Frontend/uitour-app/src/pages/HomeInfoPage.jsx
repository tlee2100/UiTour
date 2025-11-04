import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProperty } from "../contexts/PropertyContext";
import "./HomeInfoPage.css";

import InfoHeader from "./Info_components/InfoHeader";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import Gallery from "./HomeInfo_component/Gallery";
import Content from "./HomeInfo_component/Content";
import InfoThingsToKnow from "./HomeInfo_component/InfoThingsToKnow";
import PropertyMap from "../components/PropertyMap";
import HIBookingBox from "./HomeInfo_component/HIBookingBox";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function HomeInfoPage() {
  const { id } = useParams();
  const {
    currentProperty,
    loading,
    error,
    fetchPropertyById
  } = useProperty();

  const [localLoading, setLocalLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadProperty = useCallback(async (propertyId) => {
    if (!propertyId || hasLoaded) return;

    setLocalLoading(true);
    setHasLoaded(true);

    try {
      await fetchPropertyById(propertyId);
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchPropertyById, hasLoaded]);

  useEffect(() => {
    if (id && !hasLoaded) {
      loadProperty(id);
    }
  }, [id, loadProperty, hasLoaded]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  if (loading || localLoading) {
    return <LoadingSpinner message="Đang tải thông tin chỗ ở..." />;
  }

  if (error || !currentProperty) {
    return <ErrorMessage message={error || "Không tìm thấy chỗ ở này"} />;
  }

  const p = currentProperty;

  return (
    <div className="home-info-page">
      <div className="homeinfo-container">

        {/* ✅ Info Header */}
        <InfoHeader
          title={p.listingTitle || p.title}
          info={{
            rating: p.rating?.toString() || "0",
            reviews: `${p.reviewsCount || 0} reviews`,
            hostStatus: p.hostStatus || "Host",
            location: p.location || `${p.locationObj?.address}, ${p.locationObj?.city}`
          }}
        />

        {/* ✅ Gallery with fallback mapping */}
        <Gallery
          images={
            Array.isArray(p.photos) && p.photos.length > 0
              ? p.photos
              : p.media?.photos?.map(img => img.url) || []
          }
        />

        {/* ✅ Main layout */}
        <div className="homeinfo-main">
          <div className="homeinfo-left">
            <Content property={p} />
          </div>

          <div className="homeinfo-right">
            <HIBookingBox property={p} />
          </div>
        </div>

        <div className="homeif-divider" />

        {/* Reviews */}
        <InfoReview
          rating={p.rating}
          reviewsCount={p.reviewsCount}
          reviews={p.reviews || []}
        />

        <div className="homeif-divider" />

        {/* Host */}
        <InfoHost host={p.host} />

        <div className="homeif-divider" />

        {/* Rules */}
        <InfoThingsToKnow property={p} />

        <div className="homeif-divider" />

        {/* ✅ Map uses locationObj for accuracy */}
        <PropertyMap
          property={{
            ...p,
            location: p.locationObj || {
              address: p.location,
              city: "-"
            },
            latitude: p.locationObj?.lat || p.latitude,
            longitude: p.locationObj?.lng || p.longitude
          }}
          height="500px"
          zoom={16}
          showPopup={true}
        />

        <div className="homeif-end-divider" />

      </div>
    </div>
  );
}
