import { useState } from 'react';
import { Icon } from '@iconify/react';
import './ToursPage.css';

export default function ToursPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tours = [
    {
      id: 1,
      title: "Halong Bay Cruise",
      description: "2 days, 1 night cruise through the stunning limestone karsts",
      price: 89,
      rating: 4.8,
      reviews: 156,
      image: "/src/assets/mockdata/images/img04.png",
      category: "cruise",
      duration: "2 days",
      location: "Halong Bay"
    },
    {
      id: 2,
      title: "Hoi An Walking Tour",
      description: "Explore the ancient town with a local guide",
      price: 25,
      rating: 4.9,
      reviews: 89,
      image: "/src/assets/mockdata/images/img05.png",
      category: "walking",
      duration: "4 hours",
      location: "Hoi An"
    },
    {
      id: 3,
      title: "Saigon Food Tour",
      description: "Taste authentic Vietnamese cuisine in local markets",
      price: 35,
      rating: 4.7,
      reviews: 203,
      image: "/src/assets/mockdata/images/img01.png",
      category: "food",
      duration: "3 hours",
      location: "Ho Chi Minh City"
    },
    {
      id: 4,
      title: "Mekong Delta Adventure",
      description: "Boat trip through floating markets and villages",
      price: 65,
      rating: 4.6,
      reviews: 127,
      image: "/src/assets/mockdata/images/img02.png",
      category: "adventure",
      duration: "1 day",
      location: "Mekong Delta"
    },
    {
      id: 5,
      title: "Hue Imperial City",
      description: "Discover the ancient capital's royal heritage",
      price: 45,
      rating: 4.5,
      reviews: 94,
      image: "/src/assets/mockdata/images/img03.png",
      category: "cultural",
      duration: "6 hours",
      location: "Hue"
    },
    {
      id: 6,
      title: "Sapa Trekking",
      description: "Hike through terraced rice fields and ethnic villages",
      price: 75,
      rating: 4.9,
      reviews: 178,
      image: "/src/assets/mockdata/images/img01.png",
      category: "adventure",
      duration: "2 days",
      location: "Sapa"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tours' },
    { id: 'cruise', name: 'Cruise' },
    { id: 'walking', name: 'Walking' },
    { id: 'food', name: 'Food' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'cultural', name: 'Cultural' }
  ];

  const filteredTours = selectedCategory === 'all' 
    ? tours 
    : tours.filter(tour => tour.category === selectedCategory);

  return (
    <div className="tours-page">
      {/* Hero Section */}
      <section className="tours-hero">
        <div className="container">
          <h1 className="tours-title">Discover Amazing Tours</h1>
          <p className="tours-subtitle">
            Experience Vietnam like never before with our curated selection of tours
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="tours-filter">
        <div className="container">
          <div className="filter-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="tours-grid-section">
        <div className="container">
          <div className="tours-grid">
            {filteredTours.map(tour => (
              <div key={tour.id} className="tour-card">
                <div className="tour-image">
                  <img src={tour.image} alt={tour.title} />
                  <button className="favorite-button">
                    <Icon icon="mdi:heart-outline" width="20" height="20" />
                  </button>
                  <div className="tour-badge">
                    <span>{tour.duration}</span>
                  </div>
                </div>
                
                <div className="tour-content">
                  <div className="tour-location">
                    <Icon icon="mdi:map-marker" width="16" height="16" />
                    <span>{tour.location}</span>
                  </div>
                  
                  <h3 className="tour-title">{tour.title}</h3>
                  <p className="tour-description">{tour.description}</p>
                  
                  <div className="tour-rating">
                    <Icon icon="mdi:star" width="16" height="16" />
                    <span>{tour.rating}</span>
                    <span className="rating-count">({tour.reviews} reviews)</span>
                  </div>
                  
                  <div className="tour-footer">
                    <div className="tour-price">
                      <span className="price">${tour.price}</span>
                      <span className="price-unit">/ person</span>
                    </div>
                    <button className="book-button">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="tours-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Can't find what you're looking for?</h2>
            <p>Contact us to create a custom tour experience just for you</p>
            <button className="cta-button">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
