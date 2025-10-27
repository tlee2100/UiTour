import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

/* ---------------- FIX ICON MẶC ĐỊNH ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ---------------- CUSTOM ICON ---------------- */
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
    popupAnchor: [0, -30],
  });
};

/* ---------------- AUTO CENTER (khi đổi chỗ ở) ---------------- */
const MapCenter = ({ center, zoom, property }) => {
  const map = useMap();

  useEffect(() => {
    if (!property || !center) return;

    // Nếu bản đồ chưa khởi tạo xong thì chờ 200ms rồi flyTo
    const timeout = setTimeout(() => {
      map.flyTo(center, zoom, { animate: true, duration: 0.8 });
    }, 200);

    return () => clearTimeout(timeout);
  }, [property?.id, center[0], center[1], zoom, map]);

  return null;
};


/* ---------------- FIX MAP SIZE (khi render lần đầu) ---------------- */
const MapFixSize = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
};

/* ---------------- MAIN COMPONENT ---------------- */
const PropertyMap = ({
  property = null,
  center = [10.8231, 106.6297],
  zoom = 15,
  height = '500px',
  width = '90%', // 👈 map chiếm 90% chiều ngang trang
  showPopup = true,
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Update center khi property đổi
  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      setMapCenter([property.latitude, property.longitude]);
      setMapZoom(16);
    } else {
      setMapCenter(center);
      setMapZoom(zoom);
    }
  }, [property, center, zoom]);

  const markerPosition =
    property?.latitude && property?.longitude
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
    <div
      className="property-map-container"
      style={{ width, margin: '32px auto' }}
    >
      <div className="map-header">
        <h3>Vị trí</h3>
        <p className="map-subtitle">{property?.location || 'Vị trí của chỗ ở'}</p>
      </div>

      <div className="map-wrapper" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            zIndex: 1,
          }}
          scrollWheelZoom={true}
          zoomControl={true}
          dragging={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <MapFixSize />
          <MapCenter center={mapCenter} zoom={mapZoom} property={property} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markerPosition && (
            <Marker position={markerPosition} icon={createCustomIcon()}>
              {showPopup && (
                <Popup>
                  <div className="popup-content">
                    <h4>{property?.listingTitle || 'Chỗ ở'}</h4>
                    <p className="popup-address">
                      {property?.location || 'Không rõ vị trí'}
                    </p>
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

      {/* Actions */}
      <div className="map-actions">
        <button
          className="map-action-btn"
          onClick={handleDirections}
          disabled={!markerPosition}
        >
          <span>🚗</span> Chỉ đường
        </button>
        <button
          className="map-action-btn"
          onClick={handleOpenMap}
          disabled={!markerPosition}
        >
          <span>📍</span> Mở OpenStreetMap
        </button>
      </div>
    </div>
  );
};

export default PropertyMap;
