import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ExperienceSearchResultsPage.css';
import { Icon } from '@iconify/react';
import { useExperience } from '../contexts/ExperienceContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ExperienceSearchBar from '../components/search/ExperienceSearchBar';
import ExperienceCard from '../components/search/ExperienceCard';

export default function ExperienceSearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const location = searchParams.get('location') || '';
  const dates = searchParams.get('dates') || '';
  const guests = searchParams.get('guests') || '1';

  const { experiences, loading, error, fetchExperiences } = useExperience();

  useEffect(() => {
    // Fetch experiences based on search params
    fetchExperiences({
      location: location,
      guests: guests ? Number(guests) : null
    });
  }, [location, guests, fetchExperiences]);

  const categories = [
    { id: 'solo', title: 'Phù hợp cho khách du lịch một mình', icon: 'mdi:account' },
    { id: 'local', title: 'Trọn vị địa phương', icon: 'mdi:map-marker' },
    { id: 'outdoor', title: 'Hoạt động ngoài trời', icon: 'mdi:tree' },
    { id: 'food', title: 'Ẩm thực', icon: 'mdi:food' },
    { id: 'culture', title: 'Văn hóa', icon: 'mdi:palette' }
  ];

  const [activeCategory, setActiveCategory] = useState('solo');

  return (
    <div className="experience-search-results-page">
      {/* Header Search Bar */}
      <div className="esr-search-header">
        <div className="esr-search-header-content">
          <ExperienceSearchBar 
            initialLocation={location}
            initialDates={dates}
            initialGuests={guests}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="esr-filter-bar">
        <div className="container">
          <div className="filter-bar">
            <button className="filter-btn">
              <Icon icon="mdi:leaf" width="16" height="16" />
              <span>Originals</span>
            </button>
            <button className="filter-btn">
              <span>Type</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>
            <button className="filter-btn">
              <span>Time of day</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>
            <button className="filter-btn">
              <Icon icon="mdi:tune" width="16" height="16" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="esr-content">
        {loading && <LoadingSpinner message="Đang tìm kiếm trải nghiệm..." />}
        {error && <ErrorMessage message={error} />}
        
        {!loading && !error && (
          <div className="container">
            {/* Category Sections */}
            {categories.map(category => (
              <section key={category.id} className="esr-category-section">
                <div className="esr-category-header">
                  <h2 className="esr-category-title">
                    {category.title}
                    <Icon icon="mdi:chevron-right" width="20" height="20" />
                  </h2>
                </div>

                <div className="esr-experiences-scroll">
                  {experiences.map(experience => (
                    <ExperienceCard key={experience.id} experience={experience} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

