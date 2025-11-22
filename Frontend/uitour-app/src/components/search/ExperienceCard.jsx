import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './ExperienceCard.css';
import { useCurrency } from '../../contexts/CurrencyContext';

export default function ExperienceCard({ experience }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { convertToCurrent, format } = useCurrency();

  const handleClick = () => {
    navigate(`/experience/${experience.id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Giả sử giá trong experience là USD, convert sang currency hiện tại
  // Nếu không có giá, dùng giá mặc định (ví dụ: $30 USD)
  const priceUSD = experience.price || 30;
  const displayPrice = convertToCurrent(priceUSD);

  return (
    <div className="experience-card-result" onClick={handleClick}>
      <div className="experience-image-result">
        <img 
          src={experience.image?.url || experience.image || '/src/assets/mockdata/images/img01.png'} 
          alt={experience.title || 'Experience'} 
        />
        <div className="experience-badge">Phổ biến</div>
        <button 
          className="experience-favorite-button"
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

      <div className="experience-info-result">
        <h3 className="experience-title-result">
          {experience.title || 'Experience Title'}
        </h3>

        <div className="experience-details-result">
          <span>Cách {experience.distance || '1'} km</span>
          <span>·</span>
          <span>{experience.duration || '4'} giờ</span>
          <span>·</span>
          <span>Ngày {experience.availableDates || '8 và 9 Tháng 11'}</span>
        </div>

        <div className="experience-price-rating-result">
          <div className="experience-price-result">
            <span className="price-label">Từ </span>
            <span className="price-value">{format(displayPrice)}</span>
            <span className="price-unit-result">/khách</span>
          </div>
          <div className="experience-rating-result">
            <Icon icon="mdi:star" width="14" height="14" />
            <span className="rating-value-result">{experience.rating?.toFixed(2) || '4.98'}</span>
            <span className="rating-count-result"> - {experience.reviewsCount || experience.reviews || '2.428'} đánh giá</span>
          </div>
        </div>
      </div>
    </div>
  );
}

