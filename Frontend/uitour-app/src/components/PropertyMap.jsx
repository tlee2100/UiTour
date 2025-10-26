import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color = '#FF5A5F') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">🏠</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Component để center map khi property thay đổi
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const PropertyMap = ({ 
  property = null, 
  center = [10.8231, 106.6297], // [lat, lng] format for Leaflet
  zoom = 15,
  height = '400px',
  showPopup = true 
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Update map center when property changes
  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      setMapCenter([property.latitude, property.longitude]);
      setMapZoom(16);
    } else {
      setMapCenter(center);
      setMapZoom(zoom);
    }
  }, [property, center, zoom]);

  // Determine marker position
  const markerPosition = property?.latitude && property?.longitude 
    ? [property.latitude, property.longitude]
    : null;

  const handleDirections = () => {
    if (markerPosition) {
      const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${markerPosition[0]},${markerPosition[1]}`;
      window.open(url, '_blank');
    }
  };

  const handleOpenMap = () => {
    if (markerPosition) {
      const url = `https://www.openstreetmap.org/?mlat=${markerPosition[0]}&mlon=${markerPosition[1]}&zoom=16`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="property-map-container" style={{ height }}>
      <div className="map-header">
        <h3>Vị trí</h3>
        <p className="map-subtitle">
          {property?.location || 'Vị trí của chỗ ở'}
        </p>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%', borderRadius: '12px' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          boxZoom={false}
          keyboard={false}
          attributionControl={true}
        >
          <MapCenter center={mapCenter} zoom={mapZoom} />
          
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Property Marker */}
          {markerPosition && (
            <Marker 
              position={markerPosition}
              icon={createCustomIcon()}
            >
              {showPopup && (
                <Popup>
                  <div className="popup-content">
                    <h4>{property?.listingTitle || property?.name || 'Chỗ ở'}</h4>
                    <p className="popup-address">{property?.location || 'Địa chỉ không xác định'}</p>
                    {property?.price && (
                      <p className="popup-price">${property.price}/đêm</p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Map Actions */}
      <div className="map-actions">
        <button 
          className="map-action-btn"
          onClick={handleDirections}
          disabled={!markerPosition}
        >
          <span>🚗</span>
          Chỉ đường
        </button>
        <button 
          className="map-action-btn"
          onClick={handleOpenMap}
          disabled={!markerPosition}
        >
          <span>📍</span>
          Mở OpenStreetMap
        </button>
      </div>
    </div>
  );
};

export default PropertyMap;
