import React, { useState, useEffect } from "react";
import { useHost } from "../../contexts/HostContext";
import LocationPicker from "../../components/LocationPicker";
import "./HostStay.css";

export default function HostStayCreateLocate() {
  const { stayData, updateField, setFlowType, type } = useHost();
  const location = stayData.location || {};

  // Ensure correct flow
  useEffect(() => {
    if (type !== "stay") setFlowType("stay");
  }, [type, setFlowType]);

  const [query, setQuery] = useState(location.addressLine || "");
  const [center, setCenter] = useState([
    location.lat || 10.8231,
    location.lng || 106.6297,
  ]);
  const [loading, setLoading] = useState(false);

  // Reverse geocode
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data?.display_name || "";
    } catch {
      return "";
    }
  };

  // When map changes
  const handleMapChange = async ({ latitude, longitude }) => {
    const address = await reverseGeocode(latitude, longitude);

    updateField("location", {
      lat: latitude,
      lng: longitude,
      addressLine: address,
      city: "Ho Chi Minh",
      country: "Vietnam",
    });

    setCenter([latitude, longitude]);
    setQuery(address); // readonly update only
  };

  // Use current GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);

        updateField("location", {
          lat: latitude,
          lng: longitude,
          addressLine: address,
          city: "Ho Chi Minh",
          country: "Vietnam",
        });

        setCenter([latitude, longitude]);
        setQuery(address);
        setLoading(false);
      },
      () => {
        alert("Không thể lấy vị trí hiện tại. Vui lòng thử lại.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">Where’s your place located?</h1>

        <div className="hs-map-card">

          {/* Input + Button row */}
          <div className="hs-map-search-row">
            <div className="hs-map-search">
              <div className="hs-map-icon">
                {/* MAP PIN ICON */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              {/* READ ONLY INPUT */}
              <input
                type="text"
                placeholder="Move the map to select a location"
                className="hs-map-search-input"
                value={query}
                readOnly
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  opacity: 0.9,
                }}
              />
            </div>

            <button
              className="hs-use-current-btn"
              onClick={handleUseCurrentLocation}
              disabled={loading}
            >
              {loading ? "Locating..." : "📍 Use current location"}
            </button>
          </div>

          <LocationPicker
            initialLocation={center}
            height="520px"
            zoom={10}
            onLocationChange={handleMapChange}
            externalLocation={center}
            showHeader={false}
            showManualInputs={false}
            showInfo={false}
            showQuickButtons={false}
          />
        </div>
      </main>
    </div>
  );
}
