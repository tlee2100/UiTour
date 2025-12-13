import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HostStayEdit.css";
import { t } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import sampleImg from "../../assets/sample-room.jpg";
import EditableRow from "../../components/modals/EditableRow";
import SvgIcon from "../../components/SvgIcon"
import authAPI from "../../services/authAPI";

const AMENITY_ICON_MAP = {
  1: "amen_wifi",
  7: "amen_tv",
  6: "amen_ac",
  8: "amen_kitchen",
  2: "amen_washer",
  15: "amen_dryer",
  3: "amen_heating",
  4: "amen_iron",
  9: "amen_gym",
  11: "amen_free_parking",
  17: "amen_hottub",
  14: "amen_pool",
  19: "amen_bbq",
  18: "amen_ev_charger",
  13: "amen_smoke_alarm",
  12: "amen_breakfast",
  10: "amen_workspace",
  5: "amen_king_bed",
  16: "amen_hair_dryer",
};



const API_BASE = "http://localhost:5069"; // 🎯 ALWAYS backend URL

export default function HostStayEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [draftValue, setDraftValue] = useState("");


  const LOCKED_HINT =
    "Trường này không thể chỉnh sửa. Nếu có thay đổi lớn, vui lòng tạo listing mới.";


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
              name: pa.amenity?.amenityName,
              icon: AMENITY_ICON_MAP[pa.amenity?.amenityID] || null
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

            discount: json.discount ?? 0,
            discountPercentage: json.discountPercentage ?? 0,

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

        accommodates: data.accommodates,

        basePrice: data.pricing.basePrice,
        cleaningFee: data.pricing.cleaningFee,
        extraPeopleFee: data.pricing.extraPeopleFee,
        weekendMultiplier: data.pricing.weekendMultiplier,
        extraPeopleThreshold: data.pricing.extraPeopleThreshold,

        currency: data.currency ?? "USD",
        active: true,

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
        discount: data.pricing.discount,
        discountPercentage: data.pricing.discountPercentage,
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

  const openEditor = (field, value) => {
    setActiveField(field);
    setDraftValue(value ?? "");
  };

  const closeEditor = () => {
    setActiveField(null);
    setDraftValue("");
  };

  const saveEditor = () => {
    onChange(activeField, draftValue);
    closeEditor();
  };


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

          <div className="hs-edit-hero-text">
            <EditableRow
              value={d.listingTitle}
              editable
              variant="title"
              onEdit={() => openEditor("listingTitle", d.listingTitle)}
            />

            <EditableRow
              value={d.description}
              editable
              variant="description"
              onEdit={() => openEditor("description", d.description)}
            />
          </div>


          <input
            className="hs-edit-location-input"
            value={d.location.addressLine}
            disabled
            title={LOCKED_HINT}
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
                disabled
                title={LOCKED_HINT}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.typeOfPlace")}:</b>
              <input
                className="hs-edit-input"
                value={d.roomType.name}
                disabled
                title={LOCKED_HINT}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.bedrooms")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.bedrooms}
                disabled
                title={LOCKED_HINT}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.beds")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.beds}
                disabled
                title={LOCKED_HINT}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.bathrooms")}:</b>
              <input
                type="number"
                className="hs-edit-input"
                value={d.bathrooms}
                disabled
                title={LOCKED_HINT}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.accommodates")}:</b>

              <div className="hs-edit-display hs-edit-display-editable">
                <span>{d.accommodates}</span>

                <button
                  className="hs-edit-icon-btn"
                  onClick={() => openEditor("accommodates", d.accommodates)}
                  title="Edit"
                >
                  ✎
                </button>
              </div>
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
                disabled
                title={LOCKED_HINT}
              />
            </div>

          </div>
        </section>

        {/* AMENITIES */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.amenities")}
          </h2>

          <div className="hs-edit-card hs-edit-amenities">
            {d.amenities.length > 0 ? (
              d.amenities.map((amenity, idx) => (
                <div key={idx} className="hs-edit-amenity-row">
                  {amenity.icon ? (
                    <SvgIcon
                      name={amenity.icon}
                      className="hs-edit-amenity-icon"
                    />
                  ) : (
                    <div className="hs-edit-amenity-icon-placeholder">•</div>
                  )}

                  <span className="hs-edit-amenity-text">
                    {amenity.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="hs-edit-amenity-empty">
                No amenities selected
              </div>
            )}
          </div>
        </section>


        {/* PRICING */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">{t(language, "hostStay.preview.pricing")}</h2>

          <div className="hs-edit-card">
            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.basePrice")}:</b>
              <EditableRow
                value={d.pricing.basePrice}
                editable
                onEdit={() => openEditor("pricing.basePrice", d.pricing.basePrice)}
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.weekendMultiplier")}:</b>
              <EditableRow
                value={d.pricing.weekendMultiplier}
                editable
                onEdit={() =>
                  openEditor("pricing.weekendMultiplier", d.pricing.weekendMultiplier)
                }
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.cleaningFee")}:</b>
              <EditableRow
                value={d.pricing.cleaningFee}
                editable
                onEdit={() =>
                  openEditor("pricing.cleaningFee", d.pricing.cleaningFee)
                }
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.extraFee")}:</b>
              <EditableRow
                value={d.pricing.extraPeopleFee}
                editable
                onEdit={() =>
                  openEditor("pricing.extraPeopleFee", d.pricing.extraPeopleFee)
                }
              />
            </div>

            <div className="hs-edit-row">
              <b>{t(language, "hostStay.preview.extraThreshold")}:</b>
              <EditableRow
                value={d.pricing.extraPeopleThreshold}
                editable
                onEdit={() =>
                  openEditor(
                    "pricing.extraPeopleThreshold",
                    d.pricing.extraPeopleThreshold
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* DISCOUNTS */}
        <section className="hs-edit-section">
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.discounts")}
          </h2>

          <div className="hs-edit-row">
            <b>Discount amount</b>
            <EditableRow
              value={d.pricing.discount}
              editable
              onEdit={() =>
                openEditor("pricing.discount", d.pricing.discount)
              }
            />
          </div>

          <div className="hs-edit-row">
            <b>Discount percentage (%)</b>
            <EditableRow
              value={d.pricing.discountPercentage}
              editable
              onEdit={() =>
                openEditor(
                  "pricing.discountPercentage",
                  d.pricing.discountPercentage
                )
              }
            />
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
      {activeField && (
        <div className="hs-modal">
          <div className="hs-modal-backdrop" onClick={closeEditor} />

          <div className="hs-modal-card">
            <div className="hs-modal-header">
              <b>Edit</b>
              <button onClick={closeEditor}>✕</button>
            </div>

            <div className="hs-modal-body">
              <input
                type={typeof draftValue === "number" ? "number" : "text"}
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="hs-input"
              />
            </div>

            <div className="hs-modal-footer">
              <button onClick={closeEditor}>Cancel</button>
              <button onClick={saveEditor}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
