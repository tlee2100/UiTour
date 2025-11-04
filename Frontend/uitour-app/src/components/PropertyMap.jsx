import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';
import SvgIcon from './SvgIcon';

/* ---------------- FIX ICON MẶC ĐỊNH ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ---------------- CUSTOM ICON ---------------- */
const createCustomIcon = (color = '#FF5A5F') =>
  L.divIcon({
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
      transform: rotate(45deg); /* ✅ Xoay ngược lại để icon không bị nghiêng */
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H4a 1 1 0 0 1-1-1v-10.5z"/>
      </svg>
    </div>
  </div>
`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

/* ---------------- MOVE MAP WHEN ID CHANGES ---------------- */
const MapCenter = ({ lat, lng, zoom }) => {
  const map = useMap();
  const prev = useRef([null, null]);

  useEffect(() => {
    if (!lat || !lng) return;
    const [prevLat, prevLng] = prev.current;
    if (lat !== prevLat || lng !== prevLng) {
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
      prev.current = [lat, lng];
    }
  }, [lat, lng, zoom, map]);

  return null;
};

/* ---------------- MAIN ---------------- */
const PropertyMap = ({
  property = null, // giữ nguyên
  zoom = 15,
  height = '500px',
  width = '100%',
  showPopup = true,
}) => {
  // ✅ CHỈ FIX TRUY XUẤT DATA — giữ logic cũ
  // ✅ Ưu tiên locationObj mới — fallback vị trí cũ nếu có
  const lat =
    property?.locationObj?.lat ??
    property?.location?.lat ??
    property?.latitude ??
    null;

  const lng =
    property?.locationObj?.lng ??
    property?.location?.lng ??
    property?.longitude ??
    null;

  const mapCenter = lat && lng ? [lat, lng] : [10.8231, 106.6297];
  const markerPos = lat && lng ? [lat, lng] : null;

  const displayName = property?.title || property?.listingTitle || "Experience";

  const displayAddress =
    property?.locationObj
      ? `${property.locationObj.address || ""}, ${property.locationObj.city || ""}`
      : (typeof property?.location === "string"
        ? property.location
        : "Location unavailable");


  const displayPrice =
    property?.pricing?.basePrice
      ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: property?.pricing?.currency || "VND",
      }).format(property.pricing.basePrice)
      : property?.price
        ? `${property.price}`
        : null;

  const openMapExternal = () => {
    if (!markerPos) return;
    window.open(
      `https://www.openstreetmap.org/?mlat=${markerPos[0]}&mlon=${markerPos[1]}&zoom=16`,
      "_blank"
    );
  };

  return (
    <div className="property-map-container" style={{ width }}>
      <div className="map-header">
        <h3>Location</h3>
        <p className="map-subtitle">{displayAddress}</p>
      </div>

      <div className="map-wrapper" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          scrollWheelZoom
          style={{ width: "100%", height: "100%", borderRadius: "12px" }}
        >
          <MapCenter lat={mapCenter[0]} lng={mapCenter[1]} zoom={zoom} />

          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markerPos && (
            <Marker position={markerPos} icon={createCustomIcon()}>
              {showPopup && (
                <Popup>
                  <strong>{displayName}</strong>
                  <br />
                  {displayAddress}
                  {displayPrice && <p>From {displayPrice}/person</p>}
                </Popup>
              )}
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="map-actions">
        <button
          className="map-action-btn"
          disabled={!markerPos}
          onClick={openMapExternal}
        >
          📍 Open full map
        </button>
        <button
          className="map-action-btn"
          disabled={!markerPos}
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${markerPos[0]},${markerPos[1]}`,
              "_blank"
            )
          }
        >
          🚗 Directions
        </button>

      </div>
    </div>
  );
};

export default PropertyMap;
