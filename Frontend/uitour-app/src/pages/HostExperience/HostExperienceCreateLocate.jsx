import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../components/LocationPicker";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateLocate() {
  const navigate = useNavigate();
  const { experienceData, updateField, setFlowType, type } = useHost();

  // Đảm bảo đang ở flow "experience"
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type]);

  // LOCAL UI STATE
  const [query, setQuery] = useState(experienceData.location.addressLine || "");
  const [center, setCenter] = useState([
    experienceData.location.lat || 10.8231,
    experienceData.location.lng || 106.6297,
  ]);

  // 🟢 Sync lại local state khi reload và context đã load xong
  useEffect(() => {
    const loc = experienceData.location;

    if (loc.addressLine && loc.addressLine !== query) {
      setQuery(loc.addressLine);
    }

    if (loc.lat && loc.lng) {
      const next = [loc.lat, loc.lng];
      if (next[0] !== center[0] || next[1] !== center[1]) {
        setCenter(next);
      }
    }
  }, [experienceData.location]);

  // 🟢 Reverse geocode
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data;
    } catch (err) {
      return null;
    }
  };

  // 🟢 Khi user chọn vị trí mới trên map
  const handleLocationChange = async (loc) => {
    const { latitude, longitude } = loc;

    const geo = await reverseGeocode(latitude, longitude);

    const address = geo?.display_name || "";
    const city =
      geo?.address?.city ||
      geo?.address?.town ||
      geo?.address?.village ||
      "";
    const country = geo?.address?.country || "";

    // Update context
    updateField("location", {
      lat: latitude,
      lng: longitude,
      addressLine: address,
      city,
      country,
    });

    // Update UI state
    setCenter([latitude, longitude]);
    setQuery(address);
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Where’s your experience located?</h1>

        <div className="he-map-card">
          <div className="he-map-search">
            <input
              type="text"
              placeholder="Enter your address"
              className="he-map-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <LocationPicker
            initialLocation={center}
            height="520px"
            zoom={10}
            onLocationChange={handleLocationChange}
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
