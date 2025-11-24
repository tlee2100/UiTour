import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResultsPage.css';
import { Icon } from '@iconify/react';
import { useProperty } from '../contexts/PropertyContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MapView from '../components/search/MapView';
import PropertyCard from '../components/search/PropertyCard';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(true);
  const [searchAsMove, setSearchAsMove] = useState(true);
  
  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';

  const { properties, loading, error, fetchProperties } = useProperty();

  useEffect(() => {
    // Fetch properties based on search params
    fetchProperties({
      location: location,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: guests ? Number(guests) : null
    });
  }, [location, checkIn, checkOut, guests, fetchProperties]);

  const handleSearch = () => {
    // Navigate back to home with search params
    navigate(`/?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    console.log('Open filters');
  };

  return (
    <div className="search-results-page">
      {/* Header Search Bar */}
      <div className="search-header">
        <div className="search-header-content">
          <div className="search-bar-compact">
            <div className="search-field-compact" onClick={() => navigate('/')}>
              <label>Where</label>
              <div className="sf-value-compact">{location || 'Search destinations'}</div>
            </div>
            
            <div className="search-field-compact" onClick={() => navigate('/')}>
              <label>Check in</label>
              <div className="sf-value-compact">{checkIn || 'Add dates'}</div>
            </div>
            
            <div className="search-field-compact" onClick={() => navigate('/')}>
              <label>Check out</label>
              <div className="sf-value-compact">{checkOut || 'Add dates'}</div>
            </div>
            
            <div className="search-field-compact" onClick={() => navigate('/')}>
              <label>Who</label>
              <div className="sf-value-compact">{guests ? `${guests} guests` : 'Add guests'}</div>
            </div>
            
            <button className="search-button-compact" onClick={handleSearch}>
              <Icon icon="mdi:magnify" width="20" height="20" style={{ color: 'white' }} />
            </button>
          </div>

          <div className="header-actions">
            <button className="filter-button-header" onClick={handleFilter}>
              <Icon icon="mdi:tune" width="18" height="18" />
              Filters
            </button>
            <button 
              className="map-toggle-button" 
              onClick={() => setShowMap(!showMap)}
            >
              <Icon icon={showMap ? "mdi:view-list" : "mdi:map"} width="20" height="20" />
              {showMap ? 'Show list' : 'Show map'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="search-results-content">
        {loading && <LoadingSpinner message="Đang tìm kiếm..." />}
        {error && <ErrorMessage message={error} />}
        
        {!loading && !error && (
          <>
            {/* Left Panel - Property List */}
            <div className={`results-panel ${showMap ? 'with-map' : 'full-width'}`}>
              <div className="results-header">
                <h2>{properties.length}+ stays in {location || 'your search'}</h2>
              </div>

              <div className="property-list">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>

            {/* Right Panel - Map */}
            {showMap && (
              <div className="map-panel">
                <div className="map-controls">
                  <label className="map-checkbox">
                    <input 
                      type="checkbox" 
                      checked={searchAsMove}
                      onChange={(e) => setSearchAsMove(e.target.checked)}
                    />
                    <span>Search as I move the map</span>
                  </label>
                </div>
                <MapView 
                  properties={properties} 
                  onMarkerClick={(property) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate(`/property/${property.id}`);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

