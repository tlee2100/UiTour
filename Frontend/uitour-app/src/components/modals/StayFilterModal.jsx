import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./StayFilterModal.css";
import SvgIcon from "../SvgIcon";
import { Icon } from "@iconify/react";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function StayFilterModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { currency } = useCurrency();
  const { language } = useLanguage();

  // ======== STATES ========
  const [placeType, setPlaceType] = useState(searchParams.get("placeType") || "any");
  const [beds, setBeds] = useState(Number(searchParams.get("beds") || 0));
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get("bedrooms") || 0));
  const [bathrooms, setBathrooms] = useState(Number(searchParams.get("bathrooms") || 0));
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "");

  const [amenities, setAmenities] = useState(
    searchParams.get("amenities")?.split(",") || []
  );

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );

  // ==========================
  // ⭐ FORMAT FUNCTION
  // ==========================
  const formatAmount = (vndValue) => {
    if (currency === "VND") {
      return vndValue.toLocaleString("vi-VN") + "đ";
    }
    const usd = vndValue / 25000;
    return "$" + usd.toFixed(2);
  };

  // ==========================
  // ⭐ LABEL MULTI-LANGUAGE
  // ==========================
  const priceLabels = {
    under500: `${t(language, "stayFilter.price.under")} ${formatAmount(500000)}`,
    "500to2m": `${formatAmount(500000)} – ${formatAmount(2000000)}`,
    "2to5": `${formatAmount(2000000)} – ${formatAmount(5000000)}`,
    "5to10": `${formatAmount(5000000)} – ${formatAmount(10000000)}`,
    over10: `${formatAmount(10000000)}+`,
  };

  const amenityList = [
    { id: 1, labelKey: "stayFilter.amenities.wifi", icon: "amen_wifi" },
    { id: 7, labelKey: "stayFilter.amenities.tv", icon: "amen_tv" },
    { id: 6, labelKey: "stayFilter.amenities.ac", icon: "amen_ac" },
    { id: 8, labelKey: "stayFilter.amenities.kitchen", icon: "amen_kitchen" },
    { id: 2, labelKey: "stayFilter.amenities.washer", icon: "amen_washer" },
    { id: 15, labelKey: "stayFilter.amenities.dryer", icon: "amen_dryer" },
    { id: 3, labelKey: "stayFilter.amenities.heating", icon: "amen_heating" },
    { id: 4, labelKey: "stayFilter.amenities.iron", icon: "amen_iron" },
    { id: 9, labelKey: "stayFilter.amenities.gym", icon: "amen_gym" },
    { id: 11, labelKey: "stayFilter.amenities.parking", icon: "amen_free_parking" },
    { id: 17, labelKey: "stayFilter.amenities.hottub", icon: "amen_hottub" },
    { id: 14, labelKey: "stayFilter.amenities.pool", icon: "amen_pool" },
    { id: 19, labelKey: "stayFilter.amenities.bbq", icon: "amen_bbq" },
    { id: 18, labelKey: "stayFilter.amenities.ev", icon: "amen_ev_charger" },
    { id: 13, labelKey: "stayFilter.amenities.smoke", icon: "amen_smoke_alarm" },
    { id: 12, labelKey: "stayFilter.amenities.breakfast", icon: "amen_breakfast" },
    { id: 10, labelKey: "stayFilter.amenities.workspace", icon: "amen_workspace" },
    { id: 5, labelKey: "stayFilter.amenities.kingbed", icon: "amen_king_bed" },
    { id: 16, labelKey: "stayFilter.amenities.hairdryer", icon: "amen_hair_dryer" },
  ];

  const propertyTypes = [
    { id: "house", icon: "lsicon:house-outline", labelKey: "stayFilter.property.house" },
    { id: "apartment", icon: "ph:building-apartment-light", labelKey: "stayFilter.property.apartment" },
    { id: "guesthouse", icon: "hugeicons:house-04", labelKey: "stayFilter.property.guesthouse" },
    { id: "hotel", icon: "hugeicons:hotel-01", labelKey: "stayFilter.property.hotel" },
  ];

  // Toggle Amenity
  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  // CLEAR ALL
  const clearAll = () => {
    setPlaceType("any");
    setPriceRange("");
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
    updated.set("priceRange", priceRange);
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
          <span className="filter-title">{t(language, "stayFilter.title")}</span>

          <button className="filter-close-btn" onClick={onClose}>
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </div>

        {/* BODY */}
        <div className="filter-scroll">

          {/* TYPE OF PLACE */}
          <div className="filter-section">
            <h3 className="section-title">{t(language, "stayFilter.placeType.title")}</h3>

            <div className="place-type-group">
              <button
                className={`radio-chip ${placeType === "any" ? "active" : ""}`}
                onClick={() => setPlaceType("any")}
              >
                {t(language, "stayFilter.placeType.any")}
              </button>

              <button
                className={`radio-chip ${placeType === "room" ? "active" : ""}`}
                onClick={() => setPlaceType("room")}
              >
                {t(language, "stayFilter.placeType.room")}
              </button>

              <button
                className={`radio-chip ${placeType === "entire" ? "active" : ""}`}
                onClick={() => setPlaceType("entire")}
              >
                {t(language, "stayFilter.placeType.entire")}
              </button>
            </div>
          </div>

          {/* PRICE RANGE */}
          <div className="filter-section">
            <h3 className="section-title">{t(language, "stayFilter.price.title")}</h3>

            <div className="price-list">
              {[
                { key: "under500", label: priceLabels.under500 },
                { key: "500to2m", label: priceLabels["500to2m"] },
                { key: "2to5", label: priceLabels["2to5"] },
                { key: "5to10", label: priceLabels["5to10"] },
                { key: "over10", label: priceLabels.over10 },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`price-option ${priceRange === item.key ? "active" : ""}`}
                  onClick={() => setPriceRange(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ROOMS & BEDS */}
          <div className="filter-section">
            <h3 className="section-title">{t(language, "stayFilter.rooms.title")}</h3>

            <div className="counter-row">
              <span className="counter-label">{t(language, "stayFilter.rooms.beds")}</span>
              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBeds(Math.max(0, beds - 1))}>-</button>
                <span className="counter-value">{beds === 0 ? t(language, "stayFilter.any") : beds}</span>
                <button className="counter-btn" onClick={() => setBeds(beds + 1)}>+</button>
              </div>
            </div>

            <div className="counter-row">
              <span className="counter-label">{t(language, "stayFilter.rooms.bedrooms")}</span>
              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}>-</button>
                <span className="counter-value">{bedrooms === 0 ? t(language, "stayFilter.any") : bedrooms}</span>
                <button className="counter-btn" onClick={() => setBedrooms(bedrooms + 1)}>+</button>
              </div>
            </div>

            <div className="counter-row">
              <span className="counter-label">{t(language, "stayFilter.rooms.bathrooms")}</span>
              <div className="counter-right">
                <button className="counter-btn" onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}>-</button>
                <span className="counter-value">{bathrooms === 0 ? t(language, "stayFilter.any") : bathrooms}</span>
                <button className="counter-btn" onClick={() => setBathrooms(bathrooms + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* AMENITIES */}
          <div className="filter-section">
            <h3 className="section-title">{t(language, "stayFilter.amenities.title")}</h3>

            <div className="amenities-grid">
              {amenityList.map((item) => (
                <button
                  key={item.id}
                  className={`amenity-chip-modern ${amenities.includes(String(item.id)) ? "active" : ""}`}
                  onClick={() => toggleAmenity(String(item.id))}
                >
                  <SvgIcon name={item.icon} width={16} height={16} />
                  <span>{t(language, item.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PROPERTY TYPE */}
          <div className="filter-section">
            <h3 className="section-title">{t(language, "stayFilter.property.title")}</h3>

            <div className="property-row">
              {propertyTypes.map((item) => (
                <button
                  key={item.id}
                  className={`property-chip ${propertyType === item.id ? "active" : ""}`}
                  onClick={() => setPropertyType(item.id)}
                >
                  <Icon icon={item.icon} width="20" height="20" />
                  <span>{t(language, item.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="filter-footer">
          <button className="btn-clear" onClick={clearAll}>
            {t(language, "stayFilter.clear")}
          </button>
          <button className="btn-apply" onClick={applyFilter}>
            {t(language, "stayFilter.show")}
          </button>
        </div>

      </div>
    </div>
  );
}
