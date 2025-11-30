import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./StayFilterModal.css";
import { Icon } from "@iconify/react";

export default function StayFilterModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ======== STATES ========
  const [placeType, setPlaceType] = useState(searchParams.get("placeType") || "any");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [beds, setBeds] = useState(Number(searchParams.get("beds") || 0));
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get("bedrooms") || 0));
  const [bathrooms, setBathrooms] = useState(Number(searchParams.get("bathrooms") || 0));

  const [amenities, setAmenities] = useState(
    searchParams.get("amenities")?.split(",") || []
  );

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );

  // Toggle Amenity
  const toggleAmenity = (item) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((x) => x !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  // CLEAR ALL
  const clearAll = () => {
    setPlaceType("any");
    setMinPrice("");
    setMaxPrice("");
    setBeds(0);
    setBedrooms(0);
    setBathrooms(0);
    setAmenities([]);
    setPropertyType("");
  };

  // APPLY FILTER
  const applyFilter = () => {
    const updated = new URLSearchParams(searchParams);

    updated.set("placeType", placeType);
    updated.set("minPrice", minPrice);
    updated.set("maxPrice", maxPrice);
    updated.set("beds", beds);
    updated.set("bedrooms", bedrooms);
    updated.set("bathrooms", bathrooms);
    updated.set("amenities", amenities.join(","));
    updated.set("propertyType", propertyType);

    navigate(`/search?${updated.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay">
      <div className="filter-container">

        {/* HEADER */}
        <div className="filter-header">
          <span className="filter-title">Filter</span>

          <button className="filter-close-btn" onClick={onClose}>
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </div>

        {/* BODY START */}
        <div className="filter-scroll">

          {/* TYPE OF PLACE */}
          <div className="filter-section">
            <h3 className="section-title">Type of place</h3>

            <div className="place-type-group">
              <button
                className={`radio-chip ${placeType === "any" ? "active" : ""}`}
                onClick={() => setPlaceType("any")}
              >
                Any type
              </button>

              <button
                className={`radio-chip ${placeType === "room" ? "active" : ""}`}
                onClick={() => setPlaceType("room")}
              >
                Room
              </button>

              <button
                className={`radio-chip ${placeType === "entire" ? "active" : ""}`}
                onClick={() => setPlaceType("entire")}
              >
                Entire home
              </button>
            </div>
          </div>

          {/* PRICE RANGE */}
          <div className="filter-section">
            <h3 className="section-title">Price Range</h3>

            <div className="price-boxes">
              <div className="price-col">
                <label className="price-label">Minimum</label>
                <input
                  type="number"
                  className="price-input"
                  placeholder="0đ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="price-col">
                <label className="price-label">Maximum</label>
                <input
                  type="number"
                  className="price-input"
                  placeholder="999.999.999đ"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ROOMS & BEDS */}
          <div className="filter-section">
            <h3 className="section-title">Rooms and Beds</h3>

            <div className="counter-row">
              <span className="counter-label">Beds</span>

              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBeds(Math.max(0, beds - 1))}>-</button>
                <span className="counter-value">{beds === 0 ? "Any" : beds}</span>
                <button className="counter-btn" onClick={() => setBeds(beds + 1)}>+</button>
              </div>
            </div>

            <div className="counter-row">
              <span className="counter-label">Bedrooms</span>

              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}>-</button>
                <span className="counter-value">{bedrooms === 0 ? "Any" : bedrooms}</span>
                <button className="counter-btn" onClick={() => setBedrooms(bedrooms + 1)}>+</button>
              </div>
            </div>

            <div className="counter-row">
              <span className="counter-label">Bathrooms</span>

              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}>-</button>
                <span className="counter-value">{bathrooms === 0 ? "Any" : bathrooms}</span>
                <button className="counter-btn" onClick={() => setBathrooms(bathrooms + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* AMENITIES */}
          <div className="filter-section">
            <h3 className="section-title">Amenities</h3>

            <div className="amenities-grid">

              {[
                { id: "ac", label: "Air Conditioning", icon: "mynaui:snow" },
                { id: "tv", label: "TV", icon: "material-symbols-light:tv-outline" },
                { id: "wifi", label: "Wifi", icon: "clarity:wifi-line" },
                { id: "kitchen", label: "Kitchen", icon: "material-symbols-light:kitchen-outline-rounded" },
                { id: "gym", label: "Gym", icon: "iconoir:gym" },
                { id: "workspace", label: "Dedicated workspace", icon: "fluent:desk-28-regular" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`amenity-chip ${amenities.includes(item.id) ? "active" : ""}`}
                  onClick={() => toggleAmenity(item.id)}
                >
                  <Icon icon={item.icon} width="20" height="20" />
                  <span>{item.label}</span>
                </button>
              ))}

            </div>
          </div>

          {/* PROPERTY TYPE */}
          <div className="filter-section">
            <h3 className="section-title">Property type</h3>

            <div className="property-row">

              {[
                { id: "house", label: "House", icon: "lsicon:house-outline" },
                { id: "apartment", label: "Apartment", icon: "ph:building-apartment-light" },
                { id: "guesthouse", label: "Guest house", icon: "hugeicons:house-04" },
                { id: "hotel", label: "Hotel", icon: "hugeicons:hotel-01" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`property-chip ${propertyType === item.id ? "active" : ""}`}
                  onClick={() => setPropertyType(item.id)}
                >
                  <Icon icon={item.icon} width="20" height="20" />
                  <span>{item.label}</span>
                </button>
              ))}

            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="filter-footer">
          <button className="btn-clear" onClick={clearAll}>Clear</button>
          <button className="btn-apply" onClick={applyFilter}>Show</button>
        </div>

      </div>
    </div>
  );
}
