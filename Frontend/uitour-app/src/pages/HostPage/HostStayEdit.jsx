import React, { useEffect, useState, useRef } from "react";
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

const AMENITIES_LIST = [
  { id: 1, tKey: "wifi", icon: "amen_wifi" },
  { id: 7, tKey: "tv", icon: "amen_tv" },
  { id: 6, tKey: "ac", icon: "amen_ac" },
  { id: 8, tKey: "kitchen", icon: "amen_kitchen" },
  { id: 2, tKey: "washer", icon: "amen_washer" },
  { id: 15, tKey: "dryer", icon: "amen_dryer" },
  { id: 3, tKey: "heating", icon: "amen_heating" },
  { id: 4, tKey: "iron", icon: "amen_iron" },
  { id: 9, tKey: "gym", icon: "amen_gym" },
  { id: 11, tKey: "freeParking", icon: "amen_free_parking" },
  { id: 17, tKey: "hotTub", icon: "amen_hottub" },
  { id: 14, tKey: "pool", icon: "amen_pool" },
  { id: 19, tKey: "bbq", icon: "amen_bbq" },
  { id: 18, tKey: "evCharger", icon: "amen_ev_charger" },
  { id: 13, tKey: "smokeAlarm", icon: "amen_smoke_alarm" },
  { id: 12, tKey: "breakfast", icon: "amen_breakfast" },
  { id: 10, tKey: "workspace", icon: "amen_workspace" },
  { id: 5, tKey: "kingBed", icon: "amen_king_bed" },
  { id: 16, tKey: "hairDryer", icon: "amen_hair_dryer" },
];


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
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [amenitiesDraft, setAmenitiesDraft] = useState([]);
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [photosDraft, setPhotosDraft] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);


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
      "";

    // 🔥 blob preview → return trực tiếp
    if (p?.preview) return p.preview;

    if (!raw || typeof raw !== "string") return "";

    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `http://localhost:5069${raw}`;

    return `http://localhost:5069/${raw}`;
  };


  useEffect(() => {
    return () => {
      photos.forEach(p => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
      photosDraft.forEach(p => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []); // ⬅️ CHỈ CHẠY KHI UNMOUNT



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
      setUploading(true);

      const finalPhotos = [];

      for (const p of photos) {
        let url = p.url || p.imageUrl;

        // 🔥 CHỈ Ở ĐÂY MỚI UPLOAD
        if (!url && p.file) {
          const formData = new FormData();
          formData.append("file", p.file);

          const res = await fetch(`${API_BASE}/api/photos/upload`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Upload photo failed");
          }

          const data = await res.json();
          url = data.url;
        }

        finalPhotos.push({
          url,
          caption: p.caption || "",
          sortIndex: p.sortIndex,
        });
      }

      const payload = {
        // ===== BASIC =====
        listingTitle: data.listingTitle,
        description: data.description,
        PropertyType: data.propertyType,

        // ===== LOCATION (BE BẮT BUỘC) =====
        Location: data.location.addressLine,
        lat: data.location.lat ?? 0,
        lng: data.location.lng ?? 0,

        // ===== CURRENCY (BE BẮT BUỘC) =====
        Currency: "VND",

        // ===== CAPACITY =====
        accommodates: data.accommodates,

        // ===== PRICING =====
        basePrice: data.pricing.basePrice,
        cleaningFee: data.pricing.cleaningFee,
        extraPeopleFee: data.pricing.extraPeopleFee,
        weekendMultiplier: data.pricing.weekendMultiplier,
        extraPeopleThreshold: data.pricing.extraPeopleThreshold,
        serviceFee: data.pricing.serviceFee.percent,
        taxFee: data.pricing.taxFee.percent,
        discount: data.pricing.discount,
        discountPercentage: data.pricing.discountPercentage,

        // ===== HOUSE RULES (BE BẮT BUỘC) =====
        HouseRules: JSON.stringify(data.houseRules ?? []),

        // ===== STATUS =====
        active: true,

        // ===== MEDIA =====
        photos: finalPhotos,
        amenities: data.amenities.map(a => ({ amenityID: a.id })),
      };


      await authAPI.updateProperty(id, payload);
      navigate("/host/listings");
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
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

  const toggleAmenity = (id) => {
    setAmenitiesDraft(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const saveAmenities = () => {
    const updated = AMENITIES_LIST
      .filter(a => amenitiesDraft.includes(a.id))
      .map(a => ({
        id: a.id,
        name: t(language, `hostStay.amenities.${a.tKey}`),
        icon: a.icon
      }));

    onChange("amenities", updated);
    setAmenitiesModalOpen(false);
  };

  const openPhotosModal = () => {
    const draft = photos.map(p => ({
      ...p,
      isCover: p.sortIndex === 1
    }));

    setPhotosDraft(draft);
    setPhotosModalOpen(true);
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);

    const added = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      isCover: false,
    }));

    setPhotosDraft(prev => {
      const merged = [...prev, ...added];
      if (!merged.some(p => p.isCover) && merged.length > 0) {
        merged[0].isCover = true;
      }
      return merged;
    });

    e.target.value = "";
  };

  const setAsCover = (photo) => {
    setPhotosDraft(prev =>
      prev.map(p => ({ ...p, isCover: p === photo }))
    );
  };

  const removePhoto = (photo) => {
    setPhotosDraft(prev => {
      if (prev.length <= 1) return prev;
      const list = prev.filter(p => p !== photo);
      if (!list.some(p => p.isCover) && list.length > 0) {
        list[0].isCover = true;
      }
      return list;
    });
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/photos/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload photo failed");
    }

    const data = await res.json();
    return data.url; // BE phải trả về { url: "..." }
  };


  const savePhotos = () => {
    const ordered = [
      ...photosDraft.filter(p => p.isCover),
      ...photosDraft.filter(p => !p.isCover),
    ];

    setPhotos(
      ordered.map((p, i) => ({
        ...p,
        sortIndex: i + 1, // cover = 1
      }))
    );

    setPhotosModalOpen(false);
  };


  const openAmenitiesModal = () => {
    setAmenitiesDraft(data.amenities.map(a => a.id));
    setAmenitiesModalOpen(true);
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
              className="hs-hero-title"
              onEdit={() => openEditor("listingTitle", d.listingTitle)}
            />

            <EditableRow
              value={d.description}
              editable
              variant="description"
              className="hs-hero-description"
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
            <button
              className="hs-edit-icon-btn"
              onClick={openAmenitiesModal}
            >
              ✎
            </button>
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
          <h2 className="hs-edit-section-title">
            {t(language, "hostStay.preview.photos")}
            <button
              className="hs-edit-icon-btn"
              onClick={openPhotosModal}
            >
              ✎
            </button>
          </h2>

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

      {amenitiesModalOpen && (
        <div className="hs-modal">
          <div className="hs-modal-backdrop" onClick={() => setAmenitiesModalOpen(false)} />

          <div className="hs-modal-card large">
            <div className="hs-modal-header">
              <b>Edit amenities</b>
              <button onClick={() => setAmenitiesModalOpen(false)}>✕</button>
            </div>

            <div className="hs-modal-body">
              <div className="hs-amenities-grid">
                {AMENITIES_LIST.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    className={`hs-amenity-card ${amenitiesDraft.includes(a.id) ? "is-selected" : ""
                      }`}
                    onClick={() => toggleAmenity(a.id)}
                  >
                    <SvgIcon name={a.icon} className="hs-icon" />
                    <div className="hs-amenity-label">
                      {t(language, `hostStay.amenities.${a.tKey}`)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="hs-modal-footer">
              <button onClick={() => setAmenitiesModalOpen(false)}>Cancel</button>
              <button onClick={saveAmenities}>Save</button>
            </div>
          </div>
        </div>
      )}

      {photosModalOpen && (
        <div className="hs-modal">
          <div className="hs-modal-backdrop" onClick={() => setPhotosModalOpen(false)} />

          <div className="hs-modal-card large">
            <div className="hs-modal-header">
              <b>Edit photos</b>
              <button onClick={() => setPhotosModalOpen(false)}>✕</button>
            </div>

            <div className="hs-modal-body">
              <button
                className="hs-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                ➕ Upload photos
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleAddPhotos}
              />

              <div className="hs-edit-photo-grid">
                {photosDraft.map((p, idx) => (
                  <div key={p.url || p.preview}
                    className="hs-edit-photo-wrapper">
                    <img
                      src={p.preview || normalizeImage(p)}
                      className={`hs-edit-photo-item ${p.isCover ? "is-cover" : ""}`}
                      onClick={() => setAsCover(p)}
                    />

                    {p.isCover && <span className="hs-cover-badge">Cover</span>}

                    <button
                      className="hs-photo-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // ⛔ RẤT QUAN TRỌNG
                        removePhoto(p);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="hs-modal-footer">
              <button onClick={() => setPhotosModalOpen(false)}>Cancel</button>
              <button onClick={savePhotos} disabled={uploading}>
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
