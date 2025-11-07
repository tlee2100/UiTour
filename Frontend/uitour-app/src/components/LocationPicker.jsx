import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for location picker
const createLocationPickerIcon = () => {
  return L.divIcon({
    className: 'location-picker-marker',
    html: `
      <div style="
        background-color: #FF5A5F;
        width: 35px;
        height: 35px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">📍</div>
      </div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  });
};

// Component để handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

// Cập nhật center khi vị trí thay đổi từ bên ngoài
const CenterUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ 
  initialLocation = [10.8231, 106.6297], // [lat, lng]
  zoom = 13,
  height = '400px',
  onLocationChange = null,
  disabled = false,
  externalLocation = null,
  showHeader = true,
  showManualInputs = true,
  showInfo = true,
  showQuickButtons = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isValidLocation, setIsValidLocation] = useState(true);

  // Nếu có externalLocation, đồng bộ vào state và map
  useEffect(() => {
    if (externalLocation && Array.isArray(externalLocation) && externalLocation.length === 2) {
      setSelectedLocation(externalLocation);
      setIsValidLocation(true);
    }
  }, [externalLocation]);

  // Handle location selection
  const handleLocationSelect = (lat, lng) => {
    if (disabled) return;
    
    const newLocation = [lat, lng];
    setSelectedLocation(newLocation);
    setIsValidLocation(true);
    
    if (onLocationChange) {
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` // Placeholder address
      });
    }
  };

  // Handle manual coordinate input
  const handleManualInput = (type, value) => {
    if (disabled) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newLocation = [...selectedLocation];
    if (type === 'lat') {
      newLocation[0] = numValue;
    } else {
      newLocation[1] = numValue;
    }
    
    setSelectedLocation(newLocation);
    setIsValidLocation(true);
    
    if (onLocationChange) {
      onLocationChange({
        latitude: newLocation[0],
        longitude: newLocation[1],
        address: `Lat: ${newLocation[0].toFixed(6)}, Lng: ${newLocation[1].toFixed(6)}`
      });
    }
  };

  // Validate coordinates
  const validateCoordinates = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  return (
    <div className="location-picker-container" style={{ height }}>
      {showHeader && (
        <div className="location-picker-header">
          <h3>📍 Chọn vị trí chỗ ở</h3>
          <p className="location-picker-subtitle">
            Nhấn vào bản đồ để đặt marker hoặc nhập tọa độ thủ công
          </p>
        </div>
      )}

      <div className="location-picker-map">
        <MapContainer
          center={selectedLocation}
          zoom={zoom}
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
          <CenterUpdater position={selectedLocation} />
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Map Click Handler */}
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {/* Selected Location Marker */}
          <Marker 
            position={selectedLocation}
            icon={createLocationPickerIcon()}
          />
        </MapContainer>
      </div>

      {/* Manual Input Section */}
      {showManualInputs && (
        <div className="location-picker-inputs">
          <div className="input-group">
            <label htmlFor="latitude">Vĩ độ (Latitude):</label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={selectedLocation[0].toFixed(6)}
              onChange={(e) => handleManualInput('lat', e.target.value)}
              disabled={disabled}
              placeholder="10.8231"
              min="-90"
              max="90"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="longitude">Kinh độ (Longitude):</label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={selectedLocation[1].toFixed(6)}
              onChange={(e) => handleManualInput('lng', e.target.value)}
              disabled={disabled}
              placeholder="106.6297"
              min="-180"
              max="180"
            />
          </div>
        </div>
      )}

      {/* Location Info */}
      {showInfo && (
        <div className="location-picker-info">
          <div className="location-info-item">
            <span className="info-label">📍 Vị trí đã chọn:</span>
            <span className="info-value">
              {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
            </span>
          </div>
          
          <div className="location-info-item">
            <span className="info-label">✅ Trạng thái:</span>
            <span className={`info-value ${isValidLocation ? 'valid' : 'invalid'}`}>
              {isValidLocation ? 'Hợp lệ' : 'Không hợp lệ'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Location Buttons */}
      {showQuickButtons && (
        <div className="location-picker-quick">
          <h4>Vị trí nhanh:</h4>
          <div className="quick-buttons">
            <button 
              className="quick-btn"
              onClick={() => handleLocationSelect(10.8231, 106.6297)}
              disabled={disabled}
            >
              🏙️ TP.HCM
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleLocationSelect(21.0285, 105.8542)}
              disabled={disabled}
            >
              🏛️ Hà Nội
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleLocationSelect(11.9404, 108.4583)}
              disabled={disabled}
            >
              🌸 Đà Lạt
            </button>
            <button 
              className="quick-btn"
              onClick={() => handleLocationSelect(16.0544, 108.2022)}
              disabled={disabled}
            >
              🏖️ Đà Nẵng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
