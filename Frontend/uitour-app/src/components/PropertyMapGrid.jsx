import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMapGrid.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for search results
const createSearchMarkerIcon = (color = '#FF5A5F') => {
  return L.divIcon({
    className: 'search-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">🏨</div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
};

// Component để fit bounds khi properties thay đổi
const MapBounds = ({ properties }) => {
  const map = useMap();
  
  useEffect(() => {
    if (properties && properties.length > 0) {
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      
      if (validProperties.length === 0) return;
      
      if (validProperties.length === 1) {
        // Nếu chỉ có 1 property, center vào đó
        map.setView([validProperties[0].latitude, validProperties[0].longitude], 15);
      } else {
        // Nếu có nhiều properties, fit bounds
        const group = new L.featureGroup();
        validProperties.forEach(property => {
          const marker = L.marker([property.latitude, property.longitude]);
          group.addLayer(marker);
        });
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [properties, map]);
  
  return null;
};

const PropertyMapGrid = ({ 
  properties = [], 
  center = [10.8231, 106.6297], // [lat, lng] format for Leaflet
  zoom = 12,
  height = '400px',
  onPropertyClick = null,
  searchLocation = null
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Update map center when search location changes
  useEffect(() => {
    if (searchLocation?.latitude && searchLocation?.longitude) {
      setMapCenter([searchLocation.latitude, searchLocation.longitude]);
      setMapZoom(13);
    } else if (properties && properties.length > 0) {
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      if (validProperties.length > 0) {
        setMapCenter([validProperties[0].latitude, validProperties[0].longitude]);
        setMapZoom(12);
      }
    }
  }, [searchLocation, properties]);

  // Filter properties that have coordinates
  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);

  const handleMarkerClick = (property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  return (
    <div className="property-map-grid-container" style={{ height }}>
      <div className="map-grid-header">
        <h3>Tìm thấy {propertiesWithCoords.length} chỗ ở</h3>
        {searchLocation && (
          <p className="search-location">Tại: {searchLocation.name}</p>
        )}
      </div>
      
      <div className="map-grid-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%', borderRadius: '8px' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          boxZoom={false}
          keyboard={false}
          attributionControl={true}
        >
          <MapBounds properties={propertiesWithCoords} />
          
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Search Location Marker (if provided) */}
          {searchLocation?.latitude && searchLocation?.longitude && (
            <Marker 
              position={[searchLocation.latitude, searchLocation.longitude]}
              icon={L.divIcon({
                className: 'search-location-marker',
                html: `
                  <div style="
                    background-color: #4285F4;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      color: white;
                      font-weight: bold;
                      font-size: 10px;
                    ">🔍</div>
                  </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div className="popup-content">
                  <h4>🔍 {searchLocation.name}</h4>
                  <p>Vị trí tìm kiếm</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Property Markers */}
          {propertiesWithCoords.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={createSearchMarkerIcon()}
              eventHandlers={{
                click: () => handleMarkerClick(property)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{property.listingTitle || property.name || 'Chỗ ở'}</h4>
                  <p className="popup-address">{property.location || 'Địa chỉ không xác định'}</p>
                  {property.price && (
                    <p className="popup-price">${property.price}/đêm</p>
                  )}
                  <div className="popup-actions">
                    <button 
                      className="popup-btn"
                      onClick={() => {
                        // Navigate to property detail page
                        window.location.href = `/property/${property.id}`;
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Info */}
      <div className="map-grid-info">
        <p>💡 Nhấn vào marker để xem thông tin chi tiết</p>
        <p>📍 Zoom để xem rõ hơn vị trí các chỗ ở</p>
      </div>
    </div>
  );
};

export default PropertyMapGrid;
