import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import LocationPicker from "../../components/LocationPicker";
import "./HostStay.css";

export default function HostStayCreateLocate() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState([10.8231, 106.6297]); // default: Ho Chi Minh City

  const handleNext = () => {
    if (location) {
      console.log("📍 Selected location:", location);
    }
    navigate("/host/stay/create/details");
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!query.trim()) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCenter([lat, lon]);
          setLocation({
            latitude: lat,
            longitude: lon,
            address: data[0].display_name,
          });
        }
      } catch (_) {
        console.warn("Geocode failed");
      }
    }
  };

  return (
    <div className="hs-page">
      {/* Header */}
      <header className="hs-header">
        <div className="hs-header-left">
          <img
            src={logo}
            alt="UiTour Logo"
            className="hs-logo"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="hs-header-right">
          <button className="hs-save-btn">Save & Exit</button>
        </div>
      </header>

      {/* Main */}
      <main className="hs-main">
        <h1 className="hs-title">Where’s your place located?</h1>

        <div className="hs-map-card">
          <div className="hs-map-search">
            <div className="hs-map-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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

          <LocationPicker
            initialLocation={[10.8231, 106.6297]}
            height="520px"
            zoom={10}
            onLocationChange={setLocation}
            externalLocation={center}
            showHeader={false}
            showManualInputs={false}
            showInfo={false}
            showQuickButtons={false}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="hs-footer">
        <button className="hs-footer-btn hs-footer-btn--white" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--black"
          onClick={handleNext}
          disabled={!location}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
