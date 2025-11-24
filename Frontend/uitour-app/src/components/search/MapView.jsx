import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useCurrency } from '../../contexts/CurrencyContext';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom price marker icon
const createPriceMarker = (price, currency = 'USD') => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return L.divIcon({
    className: 'price-marker',
    html: `
      <div class="price-marker-content">
        <span class="price-marker-text">${formattedPrice}</span>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40],
  });
};

// Component to update map bounds when properties change
function MapBounds({ properties }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const validProperties = properties.filter(
      p => p.locationObj?.lat && p.locationObj?.lng
    );

    if (validProperties.length === 0) return;

    if (validProperties.length === 1) {
      const prop = validProperties[0];
      map.setView([prop.locationObj.lat, prop.locationObj.lng], 13);
    } else {
      const bounds = L.latLngBounds(
        validProperties.map(p => [p.locationObj.lat, p.locationObj.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, map]);

  return null;
}

export default function MapView({ properties = [], onMarkerClick }) {
  const { format, convertToCurrent } = useCurrency();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Filter properties with valid coordinates
  const validProperties = useMemo(() => {
    return properties.filter(
      p => p.locationObj?.lat && p.locationObj?.lng && 
           !isNaN(p.locationObj.lat) && !isNaN(p.locationObj.lng)
    );
  }, [properties]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (validProperties.length === 0) {
      // Default to Ho Chi Minh City if no properties
      return [10.8231, 106.6297];
    }

    if (validProperties.length === 1) {
      const prop = validProperties[0];
      return [prop.locationObj.lat, prop.locationObj.lng];
    }

    // Calculate center of all properties
    const sumLat = validProperties.reduce((sum, p) => sum + p.locationObj.lat, 0);
    const sumLng = validProperties.reduce((sum, p) => sum + p.locationObj.lng, 0);
    return [sumLat / validProperties.length, sumLng / validProperties.length];
  }, [validProperties]);

  if (!mapLoaded) {
    return (
      <div className="map-view-container">
        <div className="map-loading">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={validProperties.length === 1 ? 13 : 10}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '12px' }}
        >
          <MapBounds properties={validProperties} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validProperties.map((property) => {
            const lat = property.locationObj.lat;
            const lng = property.locationObj.lng;
            const price = property.price || 0;
            const currency = property.currency || 'USD';
            const displayPrice = convertToCurrent(price);

            return (
              <Marker
                key={property.id}
                position={[lat, lng]}
                icon={createPriceMarker(displayPrice, currency)}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) {
                      onMarkerClick(property);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="map-popup-content">
                    <img
                      src={property.mainImage || '/fallback.svg'}
                      alt={property.title || property.listingTitle}
                      className="map-popup-image"
                      onError={(e) => {
                        e.target.src = '/fallback.svg';
                      }}
                    />
                    <div className="map-popup-info">
                      <h4>{property.title || property.listingTitle || 'Untitled'}</h4>
                      <p className="map-popup-location">
                        {property.location || 'Location unavailable'}
                      </p>
                      <p className="map-popup-price">
                        {format(displayPrice)} <span>/night</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

