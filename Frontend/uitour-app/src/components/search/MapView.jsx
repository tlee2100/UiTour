import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './MapView.css';

export default function MapView({ properties }) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    setMapLoaded(true);
  }, []);

  // Generate price bubbles for map
  const priceBubbles = properties.map((prop, index) => ({
    id: prop.id,
    price: prop.price || (200 + index * 50),
    lat: 44.84 + (Math.random() - 0.5) * 0.1,
    lng: -0.58 + (Math.random() - 0.5) * 0.1
  }));

  return (
    <div className="map-view-container">
      {!mapLoaded ? (
        <div className="map-loading">Loading map...</div>
      ) : (
        <div className="map-wrapper">
          {/* Map placeholder - In production, integrate with Google Maps or Mapbox */}
          <div className="map-placeholder">
            <div className="map-image">
              {/* Map visualization would go here */}
              <div className="map-overlay">
                <div className="map-region">
                  <div className="map-labels">
                    <div className="map-label">France</div>
                    <div className="map-label">Bordeaux</div>
                  </div>
                  
                  {/* Price bubbles */}
                  {priceBubbles.map((bubble, index) => (
                    <div
                      key={bubble.id}
                      className="price-bubble"
                      style={{
                        left: `${20 + (index % 10) * 8}%`,
                        top: `${30 + Math.floor(index / 10) * 15}%`
                      }}
                    >
                      ${bubble.price}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map controls */}
          <div className="map-controls-bottom">
            <button className="map-zoom-in">
              <Icon icon="mdi:plus" width="16" height="16" />
            </button>
            <button className="map-zoom-out">
              <Icon icon="mdi:minus" width="16" height="16" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

