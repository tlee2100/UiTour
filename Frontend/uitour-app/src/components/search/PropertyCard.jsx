import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './PropertyCard.css';
import { useCurrency } from '../../contexts/CurrencyContext';

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

  // Giả sử giá trong property là USD, convert sang currency hiện tại
  const priceUSD = property.price || 325;
  const displayPrice = convertToCurrent(priceUSD);

  return (
    <div className="property-card-result" onClick={handleClick}>
      <div className="property-image-result">
        <img src={property.mainImage || '/src/assets/mockdata/images/img01.png'} alt={property.listingTitle} />
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
          <span className="property-location-text"> in {property.location || 'Bordeaux'}</span>
        </div>

        <h3 className="property-title-result">{property.listingTitle}</h3>

        <div className="property-details-result">
          <span>{property.guests || '4'}-{property.guests ? property.guests + 2 : '6'} guests</span>
          <span>·</span>
          <span>{property.propertyType || 'Entire Home'}</span>
          <span>·</span>
          <span>{property.beds || '5'} beds</span>
          <span>·</span>
          <span>{property.baths || '3'} bath</span>
          {property.amenities && property.amenities.length > 0 && (
            <>
              <span>·</span>
              <span>{property.amenities.slice(0, 2).join(', ')}</span>
            </>
          )}
        </div>

        <div className="property-rating-result">
          <Icon icon="mdi:star" width="14" height="14" />
          <span className="rating-value">{property.rating || '5.0'}</span>
          <span className="rating-count">({property.reviewCount || '318'} reviews)</span>
        </div>

        <div className="property-price-result">
          <span className="price-value">{format(displayPrice)}</span>
          <span className="price-unit-result"> /night</span>
        </div>
      </div>
    </div>
  );
}

