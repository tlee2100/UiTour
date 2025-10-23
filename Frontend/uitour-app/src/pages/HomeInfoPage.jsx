import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProperty } from "../contexts/PropertyContext";
import './HomeInfoPage.css';
import Gallery from "./HomeInfo_component/Gallery";
import InfoHeader from "./Info_components/InfoHeader";
import Content from "./HomeInfo_component/Content";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import InfoThingsToKnow from "./HomeInfo_component/InfoThingsToKnow";
import PropertyMap from "../components/PropertyMap";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

// Trang HomeInfoPage hiển thị thông tin chi tiết về một chỗ ở cụ thể
export default function HomeInfoPage() {
  const { id } = useParams(); // Lấy ID từ URL params
  const { 
    currentProperty, 
    loading, 
    error, 
    fetchPropertyById 
  } = useProperty();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Memoize fetch function để tránh re-render
  const loadProperty = useCallback(async (propertyId) => {
    if (!propertyId || hasLoaded) return;
    
    setLocalLoading(true);
    setHasLoaded(true);
    try {
      await fetchPropertyById(propertyId);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchPropertyById, hasLoaded]);

  // Fetch property data khi component mount hoặc ID thay đổi
  useEffect(() => {
    if (id && !hasLoaded) {
      loadProperty(id);
    }
  }, [id, loadProperty, hasLoaded]);

  // Reset hasLoaded khi ID thay đổi
  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  // Loading state
  if (loading || localLoading) {
    return <LoadingSpinner message="Đang tải thông tin chỗ ở..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // No property found
  if (!currentProperty) {
    return <ErrorMessage message="Không tìm thấy chỗ ở này" />;
  }

  // Render property details
  return (
    <div className="home-info-page">
      <InfoHeader 
        title={currentProperty.listingTitle}
        info={{
          rating: currentProperty.rating?.toString() || "0",
          reviews: `${currentProperty.reviewsCount || 0} reviews`,
          hostStatus: currentProperty.hostStatus || "Host",
          location: currentProperty.location
        }}
      />
      
      <Gallery images={currentProperty.photos || []} />
      
      <Content property={currentProperty} />
      
      <InfoReview 
        rating={currentProperty.rating || 0} 
        reviewsCount={currentProperty.reviewsCount || 0}
        reviews={currentProperty.reviews || []}
      />

      <div className="homeif-divider" />

      <InfoHost host={currentProperty.host} />

      <div className="homeif-divider" />

      <InfoThingsToKnow property={currentProperty} />

      <div className="homeif-divider" />

      {/* Property Map Section */}
      <PropertyMap 
        property={currentProperty}
        height="500px"
        zoom={16}
        showPopup={true}
      />

      <div className="homeif-end-divider" />
    </div>
  );
}