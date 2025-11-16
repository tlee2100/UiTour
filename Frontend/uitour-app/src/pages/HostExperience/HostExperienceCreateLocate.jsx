import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../components/LocationPicker";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateLocate() {
  const navigate = useNavigate();
  const { experienceData, updateField, setFlowType, type } = useHost();

  // Ensure correct flow
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type, setFlowType]);

  // LOCAL STATE
  const [query, setQuery] = useState(experienceData.location.addressLine || "");
  const [center, setCenter] = useState([
    experienceData.location.lat || 10.8231,
    experienceData.location.lng || 106.6297,
  ]);
  const [loadingGps, setLoadingGps] = useState(false);

  // Sync state from context
  useEffect(() => {
    const loc = experienceData.location;

    if (loc.addressLine && loc.addressLine !== query) {
      setQuery(loc.addressLine);
    }

    if (loc.lat && loc.lng) {
      if (loc.lat !== center[0] || loc.lng !== center[1]) {
        setCenter([loc.lat, loc.lng]);
      }
    }
  }, [experienceData.location]);

  // Reverse geocode
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      return await res.json();
    } catch {
      return null;
    }
  };

  // When map changes position
  const handleLocationChange = async ({ latitude, longitude }) => {
    const geo = await reverseGeocode(latitude, longitude);

    const address = geo?.display_name || "";
    const city =
      geo?.address?.city ||
      geo?.address?.town ||
      geo?.address?.village ||
      "";
    const country = geo?.address?.country || "";

    updateField("location", {
      lat: latitude,
      lng: longitude,
      addressLine: address,
      city,
      country,
    });

    setCenter([latitude, longitude]);
    setQuery(address); // Update readonly input
  };

  // Use current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      return alert("Your browser does not support GPS.");
    }

    setLoadingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const geo = await reverseGeocode(lat, lng);

        updateField("location", {
          lat,
          lng,
          addressLine: geo?.display_name || "",
          city:
            geo?.address?.city ||
            geo?.address?.town ||
            geo?.address?.village ||
            "",
          country: geo?.address?.country || "",
        });

        setCenter([lat, lng]);
        setQuery(geo?.display_name || "");
        setLoadingGps(false);
      },
      () => {
        alert("❌ Cannot access your location.");
        setLoadingGps(false);
      }
    );
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Where’s your experience located?</h1>

        <div className="he-map-card">

          {/* SEARCH + CURRENT LOCATION */}
          <div className="hs-map-search-row" style={{ marginBottom: 6 }}>
            <div className="he-map-search">

              {/* ICON ghim bản đồ */}
              <div className="he-map-icon">
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

              {/* READ-ONLY INPUT */}
              <input
                type="text"
                placeholder="Move the map to select a location"
                className="he-map-search-input"
                value={query}
                readOnly     // ⭐ không cho nhập
                style={{
                  userSelect: "none",
                  pointerEvents: "none", // ⭐ không cho click
                  opacity: 0.9,
                  background: "transparent",
                }}
              />
            </div>

            {/* BUTTON CURRENT LOCATION */}
            <button
              className="hs-use-current-btn"
              disabled={loadingGps}
              onClick={useMyLocation}
            >
              {loadingGps ? "Locating..." : "📍 Use current location"}
            </button>
          </div>

          <LocationPicker
            initialLocation={center}
            externalLocation={center}
            height="520px"
            zoom={10}
            onLocationChange={handleLocationChange}
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
