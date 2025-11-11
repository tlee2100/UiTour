import React from "react";
import { useHost } from "../../contexts/HostContext";
import LocationPicker from "../../components/LocationPicker";
import "./HostStay.css";

export default function HostStayCreateLocate() {
  const { stayData, updateField } = useHost();
  const location = stayData.location || {};
  const [query, setQuery] = React.useState(location.addressLine || "");
  const [center, setCenter] = React.useState([location.lat || 10.8231, location.lng || 106.6297]);

  const handleMapChange = (loc) => {
    // 🔹 Cập nhật dữ liệu trực tiếp, không lồng thêm cấp 'location'
    updateField("location", {
      lat: loc.latitude,
      lng: loc.longitude,
      addressLine: loc.address || query,
      city: location.city || "Ho Chi Minh",
      country: location.country || "Vietnam",
    });

    // 🔹 Cập nhật state hiển thị
    setCenter([loc.latitude, loc.longitude]);
    setQuery(loc.address || query);
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">Where’s your place located?</h1>

        <div className="hs-map-card">
          <div className="hs-map-search">
            <div className="hs-map-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="lucide lucide-map-pin">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Enter your address"
              className="hs-map-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
