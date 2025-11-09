import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import LocationPicker from "../../components/LocationPicker";
import "./HostExperience.css";

export default function HostExperienceCreateLocate() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState([10.8231, 106.6297]);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
    return null;
  };

  // Handle location change from map selection
  const handleLocationChange = async (loc) => {
    setLocation(loc);
    setCenter([loc.latitude, loc.longitude]);
    
    // Reverse geocode to get the address
    const address = await reverseGeocode(loc.latitude, loc.longitude);
    if (address) {
      setQuery(address);
    }
  };

  const handleNext = () => {
    // TODO: persist selected location to context/store
    if (location) {
      console.log("Selected location:", location);
    }
    navigate("/host/experience/create/photos");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
      </header>

      <main className="he-main">
        <h1 className="he-title">Where’s your place located?</h1>

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
                  // Geocode using OpenStreetMap Nominatim
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    if (data && data[0]) {
                      const lat = parseFloat(data[0].lat);
                      const lon = parseFloat(data[0].lon);
                      const address = data[0].display_name;
                      setCenter([lat, lon]);
                      setLocation({ latitude: lat, longitude: lon, address });
                      // Update query with the full address from geocoding
                      setQuery(address);
                    }
                  } catch (_) {
                    // ignore
                  }
                }
              }}
            />
          </div>
          <LocationPicker
            initialLocation={[10.8231, 106.6297]}
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

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={handleNext}>Next</button>
        </div>
      </footer>
    </div>
  );
}


