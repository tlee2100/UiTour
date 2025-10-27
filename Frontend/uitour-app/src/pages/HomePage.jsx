import { useState, useEffect, useCallback } from 'react';
import './HomePage.css';
import { useProperty } from '../contexts/PropertyContext';
import { Icon } from '@iconify/react';
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const { properties, loading, error, fetchProperties } = useProperty();

  const loadProperties = useCallback(async () => {
    try {
      await fetchProperties(); // gọi mockAPI.getProperties()
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  }, [fetchProperties]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearch = async () => {
    console.log('Search:', { searchLocation, checkIn, checkOut, guests });
    await fetchProperties({
      location: searchLocation,
      guests: guests ? Number(guests) : null
    });
  };


  const categories = [
    { name: "Amazing views", icon: "mdi:mountain" },
    { name: "Farms", icon: "mdi:barn" },
    { name: "Earth Homes", icon: "mdi:home-variant" },
    { name: "Top of the world", icon: "mdi:peak" },
    { name: "Design", icon: "mdi:architecture" },
    { name: "Bread & breakfasts", icon: "mdi:coffee" },
    { name: "Iconic cities", icon: "mdi:city" },
    { name: "Treehouses", icon: "mdi:tree" },
    { name: "Courtyards", icon: "mdi:flower" }
  ];

  // 🔄 Loading state
  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách chỗ ở..." />;
  }

  // ⚠️ Error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="homepage">
      {/* Search Bar */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <div className="search-field">
              <label>Where</label>
              <input
                type="text"
                placeholder="Search destinations"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label>Check in</label>
              <input
                type="text"
                placeholder="Add dates"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label>Check out</label>
              <input
                type="text"
                placeholder="Add dates"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label>Who</label>
              <input
                type="text"
                placeholder="Add guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>

            <button className="search-button" onClick={handleSearch}>
              <Icon icon="mdi:magnify" width="20" height="20" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="categories-container">
          <div className="categories-scroll">
            {categories.map((category, index) => (
              <div key={index} className="category-item">
                <Icon icon={category.icon} width="24" height="24" />
                <span>{category.name}</span>
              </div>
            ))}
          </div>
          <div className="filter-buttons">
            <button className="filter-button">
              <Icon icon="mdi:tune" width="16" height="16" />
              Filters
            </button>
            <button className="display-button">
              Display total before taxes
            </button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="properties-section">
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-image">
                <img src={property.mainImage} alt={property.listingTitle} />
                {property.isGuestFavourite && (
                  <div className="guest-favourite-badge">
                    Guest favourite
                  </div>
                )}
                <button className="favorite-button">
                  <Icon icon="mdi:heart-outline" width="20" height="20" />
                </button>
              </div>
              <div className="property-info">
                <div className="property-title">{property.listingTitle}</div>
                <div className="property-rating">
                  <Icon icon="mdi:star" width="14" height="14" />
                  <span>{property.rating}</span>
                </div>
                <div className="property-dates">{property.dates}</div>
                <div className="property-price">
                  <span className="price">{property.price}</span>
                  <span className="price-unit"> {property.priceUnit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Exploring */}
      <section className="continue-section">
        <div className="continue-content">
          <h2>Continue exploring amazing views</h2>
          <button className="show-more-button">Show more</button>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="inspiration-section">
        <div className="inspiration-content">
          <h2>Inspiration for future getaways</h2>
          <div className="inspiration-tabs">
            <button className="tab active">Popular</button>
            <button className="tab">Arts and Culture</button>
            <button className="tab">Outdoors</button>
            <button className="tab">Mountains</button>
            <button className="tab">Beach</button>
            <button className="tab">Unique stays</button>
            <button className="tab">Categories</button>
            <button className="tab">Things to do</button>
          </div>
          <div className="locations-grid">
            <div className="location-item">Canmore - Apartment rentals</div>
            <div className="location-item">Benalmádena - Flat rentals</div>
            <div className="location-item">Marbella - Holiday rentals</div>
            <div className="location-item">Málaga - Holiday rentals</div>
            <div className="location-item">Torremolinos - Holiday rentals</div>
            <div className="location-item">Granada - Holiday rentals</div>
            <div className="location-item">Seville - Holiday rentals</div>
            <div className="location-item">Córdoba - Holiday rentals</div>
            <div className="location-item">Toledo - Holiday rentals</div>
            <div className="location-item">Madrid - Holiday rentals</div>
            <div className="location-item">Barcelona - Holiday rentals</div>
            <div className="location-item">Valencia - Holiday rentals</div>
            <div className="location-item">Bilbao - Holiday rentals</div>
            <div className="location-item">San Sebastián - Holiday rentals</div>
            <div className="location-item">Pamplona - Holiday rentals</div>
            <div className="location-item">Zaragoza - Holiday rentals</div>
            <div className="location-item">Salamanca - Holiday rentals</div>
            <div className="location-item">León - Holiday rentals</div>
            <div className="location-item">Burgos - Holiday rentals</div>
            <div className="location-item">Valladolid - Holiday rentals</div>
            <div className="location-item">Segovia - Holiday rentals</div>
            <div className="location-item">Ávila - Holiday rentals</div>
            <div className="location-item">Soria - Holiday rentals</div>
            <div className="location-item">Palencia - Holiday rentals</div>
            <div className="location-item">Zamora - Holiday rentals</div>
            <div className="location-item">Ourense - Holiday rentals</div>
            <div className="location-item">Lugo - Holiday rentals</div>
            <div className="location-item">A Coruña - Holiday rentals</div>
            <div className="location-item">Pontevedra - Holiday rentals</div>
            <div className="location-item">Vigo - Holiday rentals</div>
            <div className="location-item">Santiago de Compostela - Holiday rentals</div>
            <div className="location-item">Ferrol - Holiday rentals</div>
            <div className="location-item">Lugo - Holiday rentals</div>
            <div className="location-item">Ourense - Holiday rentals</div>
            <div className="location-item">Zamora - Holiday rentals</div>
            <div className="location-item">Palencia - Holiday rentals</div>
            <div className="location-item">Soria - Holiday rentals</div>
            <div className="location-item">Ávila - Holiday rentals</div>
            <div className="location-item">Segovia - Holiday rentals</div>
            <div className="location-item">Valladolid - Holiday rentals</div>
            <div className="location-item">Burgos - Holiday rentals</div>
            <div className="location-item">León - Holiday rentals</div>
            <div className="location-item">Salamanca - Holiday rentals</div>
            <div className="location-item">Zaragoza - Holiday rentals</div>
            <div className="location-item">Pamplona - Holiday rentals</div>
            <div className="location-item">San Sebastián - Holiday rentals</div>
            <div className="location-item">Bilbao - Holiday rentals</div>
            <div className="location-item">Valencia - Holiday rentals</div>
            <div className="location-item">Barcelona - Holiday rentals</div>
            <div className="location-item">Madrid - Holiday rentals</div>
            <div className="location-item">Toledo - Holiday rentals</div>
            <div className="location-item">Córdoba - Holiday rentals</div>
            <div className="location-item">Seville - Holiday rentals</div>
            <div className="location-item">Granada - Holiday rentals</div>
            <div className="location-item">Torremolinos - Holiday rentals</div>
            <div className="location-item">Málaga - Holiday rentals</div>
            <div className="location-item">Marbella - Holiday rentals</div>
            <div className="location-item">Benalmádena - Flat rentals</div>
            <div className="location-item">Canmore - Apartment rentals</div>
            <div className="location-item">Show more</div>
          </div>
        </div>
      </section>
    </div>
  );
}
