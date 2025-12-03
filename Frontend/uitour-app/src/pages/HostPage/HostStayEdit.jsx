import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HostStayEdit.css";
import { t } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import sampleImg from "../../assets/sample-room.jpg";

const API_BASE = "http://localhost:5069"; // 🎯 ALWAYS backend URL

export default function HostStayEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper: Check valid URL
  const isValidUrl = (u) => u && typeof u === "string" && !u.startsWith("blob:");

  const normalizeImage = (p) =>
    p?.url ||
    p?.serverUrl ||
    p?.imageUrl ||
    p?.photoUrl ||
    p?.preview ||
    "";

  // -------------------------------
  // Fetch Stay From API
  // -------------------------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const apiUrl = `${API_BASE}/api/host/stays/${id}`;
        const res = await fetch(apiUrl, { headers: { Accept: "application/json" } });

        const text = await res.text();

        // ❌ Check if backend returned HTML
        if (!res.ok || text.startsWith("<")) {
          console.error("❌ Backend returned HTML instead of JSON:", text);
          setError("Invalid server response");
          return;
        }

        let json;
        try {
          json = JSON.parse(text);
        } catch {
          console.error("❌ JSON parse failed:", text);
          setError("Server returned invalid JSON");
          return;
        }

        // SAFE NORMALIZE
        const safe = {
          listingTitle: json.listingTitle || "",
          description: json.description || "",

          location: {
            addressLine: json.location?.addressLine || json.addressLine || "",
            city: json.location?.city || json.city || "",
            country: json.location?.country || json.country || "",
          },

          propertyTypeLabel: json.propertyTypeLabel || "",
          roomTypeLabel: json.roomTypeLabel || "",

          bedrooms: json.bedrooms ?? 1,
          beds: json.beds ?? 1,
          bathrooms: json.bathrooms ?? 1,
          accommodates: json.accommodates ?? 1,

          amenities: Array.isArray(json.amenities) ? json.amenities : [],
          houseRules: Array.isArray(json.houseRules) ? json.houseRules : [],

          pricing: {
            basePrice: json.pricing?.basePrice ?? 0,
            weekendMultiplier: json.pricing?.weekendMultiplier ?? 1,
            cleaningFee: json.pricing?.cleaningFee ?? 0,
            extraPeopleFee: json.pricing?.extraPeopleFee ?? 0,
            extraPeopleThreshold: json.pricing?.extraPeopleThreshold ?? 1,
          },
        };

        setData(safe);
        setPhotos(Array.isArray(json.photos) ? json.photos : []);

      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // -------------------------------
  // Save Changes
  // -------------------------------
  async function handleSave() {
    try {
      const res = await fetch(`${API_BASE}/api/host/stays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photos: photos,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      navigate(`/host/stay/${id}/preview`);
    } catch (e) {
      alert("❌ Update failed: " + e.message);
    }
  }

  // Safe deep update
  const onChange = (path, value) => {
    setData((prev) => {
      const clone = structuredClone(prev);
      const keys = path.split(".");
      let obj = clone;
      keys.slice(0, -1).forEach((k) => {
        if (!obj[k] || typeof obj[k] !== "object") obj[k] = {};
        obj = obj[k];
      });
      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div style={{ padding: 40 }}>❌ {error}</div>;
  if (!data) return <div style={{ padding: 40 }}>Not found</div>;

  const d = data;

  return (
    <div className="hs-edit-page">
      <div className="hs-edit-container">

        {/* HERO */}
        <div className="hs-edit-hero">

          {/* Cover */}
          {photos[0] && (
            <img
              src={normalizeImage(photos[0]) || sampleImg}
              className="hs-edit-cover"
              alt="Cover"
            />
          )}

          {/* title */}
          <input
            className="hs-edit-title-input"
            value={d.listingTitle}
            onChange={(e) => onChange("listingTitle", e.target.value)}
          />

          {/* description */}
          <textarea
            className="hs-edit-summary-input"
            value={d.description}
            onChange={(e) => onChange("description", e.target.value)}
          />

          <input
            className="hs-edit-location-input"
            value={d.location.addressLine}
            onChange={(e) => onChange("location.addressLine", e.target.value)}
          />
        </div>

        {/* BASIC INFORMATION */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.basicInfo")}
          </h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.propertyType")}:</b>
              <input
                className="hs-edit-input"
                value={d.propertyTypeLabel}
                onChange={(e) => onChange("propertyTypeLabel", e.target.value)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.typeOfPlace")}:</b>
              <input
                className="hs-edit-input"
                value={d.roomTypeLabel}
                onChange={(e) => onChange("roomTypeLabel", e.target.value)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.bedrooms")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.bedrooms}
                onChange={(e) => onChange("bedrooms", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.beds")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.beds}
                onChange={(e) => onChange("beds", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.bathrooms")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.bathrooms}
                onChange={(e) => onChange("bathrooms", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.accommodates")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.accommodates}
                onChange={(e) => onChange("accommodates", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.location")}</h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.address")}:</b>
              <input
                className="hs-edit-input"
                value={d.location.addressLine}
                onChange={(e) => onChange("location.addressLine", e.target.value)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.city")}:</b>
              <input
                className="hs-edit-input"
                value={d.location.city}
                onChange={(e) => onChange("location.city", e.target.value)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.country")}:</b>
              <input
                className="hs-edit-input"
                value={d.location.country}
                onChange={(e) => onChange("location.country", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* AMENITIES */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.amenities")}</h2>

          <div className="hs-edit-card">
            {d.amenities.map((item, idx) => (
              <div key={idx} className="hs-edit-row">
                <input
                  className="hs-edit-input"
                  value={item}
                  onChange={(e) => {
                    const clone = [...d.amenities];
                    clone[idx] = e.target.value;
                    onChange("amenities", clone);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.pricing")}</h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.basePrice")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.basePrice}
                onChange={(e) => onChange("pricing.basePrice", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.weekendMultiplier")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.weekendMultiplier}
                onChange={(e) => onChange("pricing.weekendMultiplier", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.cleaningFee")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.cleaningFee}
                onChange={(e) => onChange("pricing.cleaningFee", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.extraFee")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.extraPeopleFee}
                onChange={(e) => onChange("pricing.extraPeopleFee", Number(e.target.value))}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.extraThreshold")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.extraPeopleThreshold}
                onChange={(e) => onChange("pricing.extraPeopleThreshold", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.rulesSafety")}</h2>

          <div className="hs-edit-card">
            {d.houseRules.map((rule, idx) => (
              <div key={idx} className="hs-edit-row">
                <input
                  className="hs-edit-input"
                  value={rule.label}
                  onChange={(e) => {
                    const arr = [...d.houseRules];
                    arr[idx].label = e.target.value;
                    onChange("houseRules", arr);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PHOTOS */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.photos")}</h2>

          <div className="hs-edit-photo-grid">
            {photos.map((p, idx) => (
              <div key={idx} className="hs-edit-photo-wrapper">
                <img
                  src={normalizeImage(p) || sampleImg}
                  className="hs-edit-photo-item"
                  alt=""
                />
              </div>
            ))}
          </div>
        </section>

        <button className="hs-edit-save-btn" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
}
