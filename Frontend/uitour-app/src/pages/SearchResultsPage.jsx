import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResultsPage.css';
import { Icon } from '@iconify/react';
import { useProperty } from '../contexts/PropertyContext';
import { useCurrency } from "../contexts/CurrencyContext";
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MapView from '../components/search/MapView';
import PropertyCard from '../components/search/PropertyCard';
import StayFilterModal from '../components/modals/StayFilterModal';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(true);
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { convertToUSD } = useCurrency();   // ⭐ dùng để convert filter sang USD

  // ===== Base Search =====
  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';

  // ===== Stay Filters =====
  const placeType = searchParams.get('placeType') || 'any';
  const priceRange = searchParams.get('priceRange') || '';
  const beds = Number(searchParams.get('beds') || 0);
  const bedrooms = Number(searchParams.get('bedrooms') || 0);
  const bathrooms = Number(searchParams.get('bathrooms') || 0);
  const amenities = (searchParams.get('amenities') || '').split(',').filter(x => x);
  const propertyType = searchParams.get('propertyType') || '';

  const { properties, loading, error, fetchProperties } = useProperty();

  // ============================
  //  🔥 FETCH RAW PROPERTIES
  // ============================
  useEffect(() => {
    fetchProperties({
      location,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: guests ? Number(guests) : null
    });
  }, [location, checkIn, checkOut, guests, fetchProperties]);

  // =============================
  //  ⭐ PRICE FILTER BASE VND
  // =============================
  const PRICE_FILTERS = {
    under500: { min: 0, max: 500000 },
    "500to2m": { min: 500000, max: 2000000 },
    "2to5": { min: 2000000, max: 5000000 },
    "5to10": { min: 5000000, max: 10000000 },
    over10: { min: 10000000, max: Infinity }
  };

  // Convert VND range → USD range
  const convertFilterRangeToUSD = (range) => {
    const minUSD = convertToUSD(range.min);
    const maxUSD = range.max === Infinity ? Infinity : convertToUSD(range.max);
    return { minUSD, maxUSD };
  };

  // ===============================================
  //  🔥 FILTER PROPERTIES CLIENT-SIDE
  // ===============================================
  const filteredProperties = useMemo(() => {
    let list = [...properties];

    // --- PLACE TYPE
    if (placeType === "room") {
      list = list.filter(p => 
        p.propertyType?.toLowerCase() === "room" ||
        p.roomType?.toLowerCase() === "private room"
      );
    }
    if (placeType === "entire") {
      list = list.filter(p =>
        p.propertyType?.toLowerCase().includes("entire") ||
        p.roomType?.toLowerCase().includes("entire")
      );
    }

    // --- PRICE RANGE (convert option VND → USD → filter)
    if (PRICE_FILTERS[priceRange]) {
      const { minUSD, maxUSD } = convertFilterRangeToUSD(PRICE_FILTERS[priceRange]);

      list = list.filter(p => {
        const priceUSD = p.price || 0;
        return priceUSD >= minUSD && priceUSD <= maxUSD;
      });
    }

    // --- BEDS
    if (beds > 0) list = list.filter(p => p.beds >= beds);
    if (bedrooms > 0) list = list.filter(p => p.bedrooms >= bedrooms);
    if (bathrooms > 0) list = list.filter(p => p.bathrooms >= bathrooms);

    // --- PROPERTY TYPE
    if (propertyType) {
      list = list.filter(
        p => p.propertyType?.toLowerCase() === propertyType.toLowerCase()
      );
    }

    // --- AMENITIES (BE chưa có)
    if (amenities.length > 0) {
      // list = list.filter(p => amenities.every(a => p.amenities?.includes(a)));
    }

    return list;

  }, [
    properties,
    placeType,
    priceRange,
    beds,
    bedrooms,
    bathrooms,
    amenities,
    propertyType
  ]);

  // =====================
  //  HANDLERS
  // =====================
  const handleSearch = () => {
    navigate(`/?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  return (
    <div className="search-results-page">
      {/* Header */}
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

      {/* Content */}
      <div className="search-results-content">
        {loading && <LoadingSpinner message="Đang tìm kiếm..." />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <>
            <div className={`results-panel ${showMap ? 'with-map' : 'full-width'}`}>
              <div className="results-header">
                <h2>{filteredProperties.length}+ stays in {location || 'your search'}</h2>
              </div>

              <div className="property-list">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>

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
                  properties={filteredProperties}
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

      {/* Filter Modal */}
      {showFilterModal && (
        <StayFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}
