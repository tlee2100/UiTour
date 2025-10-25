import { useState } from 'react';
import './HomePage.css';
import { Icon } from '@iconify/react';

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search:', { searchLocation, checkIn, checkOut, guests });
  };

  const properties = [
    {
      id: 1,
      title: "Apartment in Quận Ba Đình",
      location: "Hanoi, Vietnam",
      rating: 4.33,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img01.png",
      isGuestFavourite: true
    },
    {
      id: 2,
      title: "Tiny home, Finland",
      location: "Finland",
      rating: 4.8,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img02.png",
      isGuestFavourite: true
    },
    {
      id: 3,
      title: "Cabin Lohusalu, Estonia",
      location: "Estonia",
      rating: 4.9,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img03.png",
      isGuestFavourite: true
    },
    {
      id: 4,
      title: "Oraşul Sovata, Romania",
      location: "Romania",
      rating: 4.7,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img04.png",
      isGuestFavourite: true
    },
    {
      id: 5,
      title: "Home in Greece",
      location: "Greece",
      rating: 4.6,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img05.png",
      isGuestFavourite: true
    },
    {
      id: 6,
      title: "Room in London",
      location: "London, UK",
      rating: 4.5,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img01.png",
      isGuestFavourite: true
    },
    {
      id: 7,
      title: "Apartment in Vietnam",
      location: "Ho Chi Minh City, Vietnam",
      rating: 4.8,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img02.png",
      isGuestFavourite: true
    },
    {
      id: 8,
      title: "Flat in Warsaw, Poland",
      location: "Warsaw, Poland",
      rating: 4.4,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img03.png",
      isGuestFavourite: true
    },
    {
      id: 9,
      title: "Cabo de Paso, Spain",
      location: "Spain",
      rating: 4.9,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img04.png",
      isGuestFavourite: true
    },
    {
      id: 10,
      title: "Cottage in Sweden",
      location: "Sweden",
      rating: 4.7,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img05.png",
      isGuestFavourite: true
    },
    {
      id: 11,
      title: "Wadi Rum Village, Jordan",
      location: "Jordan",
      rating: 4.6,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img01.png",
      isGuestFavourite: true
    },
    {
      id: 12,
      title: "Koh Chang, Thailand",
      location: "Thailand",
      rating: 4.8,
      distance: "2,321 kilometres away",
      dates: "18-25 Jun",
      price: "₫1.440.000",
      priceUnit: "cho 2 đêm",
      image: "/src/assets/mockdata/images/img02.png",
      isGuestFavourite: true
    }
  ];

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
                <img src={property.image} alt={property.title} />
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
                <div className="property-title">{property.title}</div>
                <div className="property-rating">
                  <Icon icon="mdi:star" width="14" height="14" />
                  <span>{property.rating}</span>
                </div>
                <div className="property-distance">{property.distance}</div>
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
