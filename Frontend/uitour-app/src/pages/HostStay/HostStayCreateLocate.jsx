import React, { useState, useEffect } from "react";
import { useHost } from "../../contexts/HostContext";
import LocationPicker from "../../components/LocationPicker";
import "./HostStay.css";

export default function HostStayCreateLocate() {
  const { stayData, updateField, setFlowType, type } = useHost();
  const location = stayData.location || {};

  // ✅ Đảm bảo context đang ở chế độ "stay"
  useEffect(() => {
    if (type !== "stay") setFlowType("stay");
  }, [type, setFlowType]);

  const [query, setQuery] = useState(location.addressLine || "");
  const [center, setCenter] = useState([location.lat || 10.8231, location.lng || 106.6297]);
  const [loading, setLoading] = useState(false);

  // 🔍 Reverse geocode: từ lat, lng → địa chỉ cụ thể
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

  // 📍 Khi người dùng chọn vị trí trên map
  const handleMapChange = async (loc) => {
    const { latitude, longitude } = loc;
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
  };

  // 🧭 Khi người dùng bấm "Lấy vị trí hiện tại"
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
      (err) => {
        console.error(err);
        alert("Không thể lấy vị trí hiện tại. Vui lòng thử lại.");
        setLoading(false);
      }
    );
  };

  // 🔎 Khi người dùng nhập và nhấn Enter để tìm kiếm
  const handleSearch = async (e) => {
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

          updateField("location", {
            lat,
            lng: lon,
            addressLine: address,
            city: "Ho Chi Minh",
            country: "Vietnam",
          });

          setCenter([lat, lon]);
          setQuery(address);
        } else {
          alert("Không tìm thấy địa điểm phù hợp.");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tìm kiếm địa điểm.");
      }
    }
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">Where’s your place located?</h1>

        <div className="hs-map-card">
          {/* Gộp input + button trong 1 hàng */}
          <div className="hs-map-search-row">
            <div className="hs-map-search">
              <div className="hs-map-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-map-pin"
                >
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
                onKeyDown={handleSearch}
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
