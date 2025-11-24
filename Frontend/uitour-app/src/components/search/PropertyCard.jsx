import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './PropertyCard.css';
import { useCurrency } from '../../contexts/CurrencyContext';

// Helper function to normalize image URL
const normalizeImageUrl = (url) => {
  if (!url || url.trim().length === 0) return '/fallback.svg';
  // If already a full URL (http/https), use as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If relative path starting with /, prepend backend base URL
  if (url.startsWith('/')) {
    return `http://localhost:5069${url}`;
  }
  // Otherwise, assume it's a relative path and prepend backend base URL
  return `http://localhost:5069/${url}`;
};

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { convertToCurrent, format } = useCurrency();

  const handleClick = () => {
    navigate(`/property/${property.id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Normalize image URL
  const imageUrl = normalizeImageUrl(property.mainImage);

  // Giả sử giá trong property là USD, convert sang currency hiện tại
  const priceUSD = property.price || 0;
  const displayPrice = convertToCurrent(priceUSD);

  return (
    <div className="property-card-result" onClick={handleClick}>
      <div className="property-image-result">
        <img 
          src={imageUrl} 
          alt={property.listingTitle || property.title || 'Property'} 
          onError={(e) => {
            e.target.src = '/fallback.svg';
          }}
        />
        <button 
          className="favorite-button-result"
          onClick={toggleFavorite}
        >
          <Icon 
            icon={isFavorite ? "mdi:heart" : "mdi:heart-outline"} 
            width="20" 
            height="20"
            style={{ color: isFavorite ? '#ff385c' : 'currentColor' }}
          />
        </button>
      </div>

      <div className="property-info-result">
        <div className="property-type-location">
          <span>{property.propertyType || 'Entire home'}</span>
          <span className="property-location-text"> in {property.location || 'Unknown location'}</span>
        </div>

        <h3 className="property-title-result">{property.listingTitle || property.title || 'Untitled'}</h3>

        <div className="property-details-result">
          <span>{property.maxGuests || property.accommodates || '4'} guests</span>
          {property.bedrooms && (
            <>
              <span>·</span>
              <span>{property.bedrooms} bedrooms</span>
            </>
          )}
          {property.beds && (
            <>
              <span>·</span>
              <span>{property.beds} beds</span>
            </>
          )}
          {property.bathrooms && (
            <>
              <span>·</span>
              <span>{property.bathrooms} bath</span>
            </>
          )}
        </div>

        <div className="property-rating-result">
          <Icon icon="mdi:star" width="14" height="14" />
          <span className="rating-value">{(property.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({property.reviewsCount || property.reviewCount || 0} reviews)</span>
        </div>

        <div className="property-price-result">
          <span className="price-value">{format(displayPrice)}</span>
          <span className="price-unit-result"> /night</span>
        </div>
      </div>
    </div>
  );
}

