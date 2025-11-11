import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import LocationPicker from "../../components/LocationPicker";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateLocate() {
  const navigate = useNavigate();
  const { experienceData, updateField, setFlowType, type } = useHost();

  // ✅ Đảm bảo context đang ở chế độ "experience"
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type, setFlowType]);

  const [query, setQuery] = useState(experienceData.location.addressLine || "");
  const [center, setCenter] = useState([
    experienceData.location.lat || 10.8231,
    experienceData.location.lng || 106.6297,
  ]);

  // 🔍 Reverse geocode
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

  // ✅ Khi người dùng chọn vị trí mới
  const handleLocationChange = async (loc) => {
    const { latitude, longitude } = loc;
    const address = await reverseGeocode(latitude, longitude);

    // Lưu vào Context để Layout biết (validateStep mới pass)
    updateField("location", {
      lat: latitude,
      lng: longitude,
      addressLine: address,
      city: "Ho Chi Minh",
      country: "Vietnam",
    });

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
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!query.trim()) return;
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
                    );
                    const data = await res.json();
                    if (data?.[0]) {
                      const lat = parseFloat(data[0].lat);
                      const lon = parseFloat(data[0].lon);
                      const address = data[0].display_name;
                      setCenter([lat, lon]);
                      setQuery(address);
                      // ✅ Cập nhật luôn context
                      updateField("location", {
                        lat,
                        lng: lon,
                        addressLine: address,
                        city: "Ho Chi Minh",
                        country: "Vietnam",
                      });
                    }
                  } catch {}
                }
              }}
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
      {/* ❌ Không cần nút Next ở đây — đã có trong HostFooter */}
    </div>
  );
}
