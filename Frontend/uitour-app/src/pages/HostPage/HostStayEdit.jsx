import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HostStayEdit.css";
import { t } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import sampleImg from "../../assets/sample-room.jpg";
import authAPI from "../../services/authAPI";

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

  const normalizeImage = (p) => {
    const raw =
      p?.url ||
      p?.serverUrl ||
      p?.imageUrl ||
      p?.photoUrl ||
      p?.preview ||
      "";

    if (!raw || typeof raw !== "string") return "";

    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `http://localhost:5069${raw}`;

    return `http://localhost:5069/${raw}`;
  };


  // -------------------------------
  // Fetch Stay From API
  // -------------------------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const apiUrl = `${API_BASE}/api/properties/${id}`;
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
            addressLine: json.location || "",
            city: json.city?.cityName || "",
            country: json.country?.countryName || "",
          },

          propertyType: json.propertyType || "",

          roomType: {
            id: json.roomTypeID ?? null,
            name: json.roomType?.name ?? ""
          },


          bedrooms: json.bedrooms ?? 1,
          beds: json.beds ?? 1,
          bathrooms: json.bathrooms ?? 1,
          accommodates: json.accommodates ?? 1,

          amenities: Array.isArray(json.propertyAmenities)
            ? json.propertyAmenities.map(pa => ({
              id: pa.amenity?.amenityID,
              name: pa.amenity?.amenityName
            }))
            : [],

          houseRules: (() => {
            try {
              return JSON.parse(json.houseRules || "[]");
            } catch {
              return [];
            }
          })(),

          rules: {
            selfCheckIn: json.selfCheckIn ?? false,
            self_checkin_method: json.self_checkin_method || "",

            no_smoking: json.no_smoking ?? false,
            no_open_flames: json.no_open_flames ?? false,
            pets_allowed: json.pets_allowed ?? false,

            covidSafety: json.covidSafety ?? false,
            surfacesSanitized: json.surfacesSanitized ?? false,
            carbonMonoxideAlarm: json.carbonMonoxideAlarm ?? false,
            smokeAlarm: json.smokeAlarm ?? false,
          },

          pricing: {
            basePrice: json.price ?? 0,
            weekendMultiplier: json.weekendMultiplier ?? 1,
            cleaningFee: json.cleaningFee ?? 0,
            extraPeopleFee: json.extraPeopleFee ?? 0,
            extraPeopleThreshold: json.extraPeopleThreshold ?? 1,

            serviceFee: {
              percent: json.serviceFee ?? 0,
            },
            taxFee: {
              percent: json.taxFee ?? 0,
            },

            discounts: {
              weekly: { percent: json.weeklyDiscount ?? 0 },
              monthly: { percent: json.monthlyDiscount ?? 0 },
              seasonalDiscounts: json.seasonalDiscounts ?? [],
              earlyBird: json.earlyBird ?? [],
            },
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
      const payload = {
        listingTitle: data.listingTitle,
        description: data.description,

        location: data.location.addressLine,
        cityID: data.cityID ?? 0,
        countryID: data.countryID ?? 0,

        bedrooms: data.bedrooms,
        beds: data.beds,
        bathrooms: data.bathrooms,
        accommodates: data.accommodates,

        basePrice: data.pricing.basePrice,
        cleaningFee: data.pricing.cleaningFee,
        extraPeopleFee: data.pricing.extraPeopleFee,
        weekendMultiplier: data.pricing.weekendMultiplier,
        extraPeopleThreshold: data.pricing.extraPeopleThreshold,

        currency: data.currency ?? "USD",
        active: true,

        propertyType: data.propertyType,      // string
        roomTypeID: data.roomType.id,         // ID

        lat: data.lat ?? "",
        lng: data.lng ?? "",

        houseRules: data.houseRules.map(r => ({ label: r.label })),
        selfCheckIn: data.rules.selfCheckIn,
        self_checkin_method: data.rules.self_checkin_method,

        no_smoking: data.rules.no_smoking,
        no_open_flames: data.rules.no_open_flames,
        pets_allowed: data.rules.pets_allowed,

        covidSafety: data.rules.covidSafety,
        surfacesSanitized: data.rules.surfacesSanitized,
        carbonMonoxideAlarm: data.rules.carbonMonoxideAlarm,
        smokeAlarm: data.rules.smokeAlarm,

        serviceFee: data.pricing.serviceFee.percent,
        taxFee: data.pricing.taxFee.percent,
        weeklyDiscount: data.pricing.discounts.weekly.percent,
        monthlyDiscount: data.pricing.discounts.monthly.percent,
        photos: photos.map((p, index) => ({
          url: p.url || p.imageUrl || "",
          caption: p.caption || "",
          sortIndex: index
        })),

        amenities: data.amenities.map(a => ({
          amenityID: a.amenityID || a.id
        }))
      };

      const updated = await authAPI.updateProperty(id, payload);

      console.log("✔ Updated:", updated);
      navigate(`/host/listings`);
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
                value={d.propertyType}
                onChange={(e) => onChange("propertyType", e.target.value)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.typeOfPlace")}:</b>
              <input
                className="hs-edit-input"
                value={d.roomType.name}
                disabled
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

          </div>
        </section>

        {/* AMENITIES */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.amenities")}</h2>

          <div className="hs-edit-card">
            {d.amenities.map((item, idx) => (
              <input
                key={idx}
                className="hs-edit-input"
                value={item.name}
                disabled
              />
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

        {/* DISCOUNTS */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.discounts")}
          </h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <b>Weekly discount (%)</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.discounts.weekly.percent}
                onChange={(e) =>
                  onChange("pricing.discounts.weekly.percent", Number(e.target.value))
                }
              />
            </div>

            <div className="hs-edit-row">
              <b>Monthly discount (%)</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.pricing.discounts.monthly.percent}
                onChange={(e) =>
                  onChange("pricing.discounts.monthly.percent", Number(e.target.value))
                }
              />
            </div>
          </div>
        </section>

        {/* RULES & SAFETY */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.rulesSafety")}
          </h2>

          <div className="hs-edit-card">

            {[
              ["no_smoking", "No smoking"],
              ["no_open_flames", "No open flames"],
              ["pets_allowed", "Pets allowed"],
            ].map(([key, label]) => (
              <label key={key} className="hs-edit-row">
                <input
                  type="checkbox"
                  checked={d.rules[key]}
                  onChange={(e) => onChange(`rules.${key}`, e.target.checked)}
                />
                {label}
              </label>
            ))}

            <hr />

            {[
              ["smokeAlarm", "Smoke alarm"],
              ["carbonMonoxideAlarm", "CO alarm"],
              ["covidSafety", "Enhanced cleaning"],
              ["surfacesSanitized", "Surfaces sanitized"],
            ].map(([key, label]) => (
              <label key={key} className="hs-edit-row">
                <input
                  type="checkbox"
                  checked={d.rules[key]}
                  onChange={(e) => onChange(`rules.${key}`, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </section>


        {/* SELF CHECK-IN */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.selfCheckin")}
          </h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <label>
                <input
                  type="checkbox"
                  checked={d.rules.selfCheckIn}
                  onChange={(e) =>
                    onChange("rules.selfCheckIn", e.target.checked)
                  }
                />
                {" "}Self check-in
              </label>
            </div>

            {d.rules.selfCheckIn && (
              <div className="hs-edit-row">
                <b>{t(language, "hostStay.preview.method")}:</b>
                <input
                  className="hs-edit-input"
                  value={d.rules.self_checkin_method}
                  onChange={(e) =>
                    onChange("rules.self_checkin_method", e.target.value)
                  }
                />
              </div>
            )}
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
