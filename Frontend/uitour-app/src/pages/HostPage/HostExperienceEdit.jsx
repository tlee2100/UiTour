import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HostExperienceEdit.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import authAPI from "../../services/authAPI";

const API_BASE = "http://localhost:5069"; // 🎯 ALWAYS use BE port, not FE port

export default function HostExperienceEdit() {
    const { id } = useParams();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    // Helpers
    const isValidUrl = (u) => u && typeof u === "string" && !u.startsWith("blob:");

    const normalizeImage = (p) =>
        p?.url ||
        p?.serverUrl ||
        p?.imageUrl ||
        p?.photoUrl ||
        p?.preview ||
        "";

    // ---------------------------------------------
    // LOAD EXPERIENCE (HARDENED, NO CRASH)
    // ---------------------------------------------
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setErr("");

                if (!id) {
                    setErr("Invalid ID");
                    return;
                }

                // 🎯 ALWAYS call correct backend URL
                const apiUrl = `${API_BASE}/api/Tour/${id}`;

                const res = await fetch(apiUrl, {
                    headers: { Accept: "application/json" }
                });

                const text = await res.text();

                // ❌ If server returns HTML → reject
                if (!res.ok || text.startsWith("<")) {
                    console.error("❌ Backend returned HTML instead of JSON:", text);
                    setErr("Server returned invalid response");
                    return;
                }

                let json;
                try {
                    json = JSON.parse(text);
                } catch (e) {
                    console.error("❌ Cannot parse JSON:", text);
                    setErr("Invalid JSON from server");
                    return;
                }

                // SAFE NORMALIZED MODEL
                const safe = {
                    tourName: json.tourName || "",
                    summary: json.summary || "",
                    description: json.description || "",
                    mainCategory: json.mainCategory || "",
                    durationDays: json.durationDays ?? 0,

                    location: {
                        addressLine: json.location?.addressLine || json.addressLine || "",
                        city: json.location?.city || json.city || "",
                        country: json.location?.country || json.country || "",
                    },

                    pricing: {
                        basePrice: json.pricing?.basePrice ?? 0,
                        priceUnit: json.pricing?.priceUnit || "",
                    },

                    capacity: {
                        maxGuests: json.capacity?.maxGuests ?? 1,
                    },

                    booking: {
                        timeSlots: Array.isArray(json.booking?.timeSlots)
                            ? json.booking.timeSlots
                            : [],
                    },

                    qualifications: {
                        intro: json.qualifications?.intro || "",
                        expertise: json.qualifications?.expertise || "",
                        recognition: json.qualifications?.recognition || "",
                    },

                    experienceDetails: Array.isArray(json.experienceDetails)
                        ? json.experienceDetails
                        : [],

                    photos: Array.isArray(json.photos) ? json.photos : [],
                };

                setData(safe);

            } catch (e) {
                setErr(e.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    // ---------------------------------------------
    // SAVE CHANGE
    // ---------------------------------------------
    async function handleSave() {
        try {
            const payload = {
                tourName: data.tourName,
                description: data.description,
                mainCategory: data.mainCategory,
                durationDays: data.durationDays,
                location: data.location.addressLine,
                price: data.pricing.basePrice,
                maxGuests: data.capacity.maxGuests,
                experienceDetails: data.experienceDetails,
                photos: data.photos
            };

            const updated = await authAPI.updateTour(id, payload);
            console.log("✔ Updated:", updated);
            navigate(`/host/listings`);

        } catch (e) {
            alert("❌ Update failed: " + e.message);
        }
    }


    // SAFE DEEP UPDATE
    const onChange = (path, value) => {
        setData((prev) => {
            const clone = structuredClone(prev);
            const keys = path.split(".");

            let obj = clone;
            keys.slice(0, -1).forEach((k) => {
                if (obj[k] == null || typeof obj[k] !== "object") obj[k] = {};
                obj = obj[k];
            });

            obj[keys[keys.length - 1]] = value;
            return clone;
        });
    };

    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------
    if (loading) return <LoadingSpinner />;
    if (err) return <ErrorMessage message={err} />;
    if (!data) return null;

    const d = data;
    const photos = d.photos || [];
    const cover = photos.length > 0 ? normalizeImage(photos[0]) : "";
    const itinerary = d.experienceDetails || [];

    return (
        <div className="he-edit-page">
            <div className="he-edit-container">

                {/* HERO ------------------------------------------------ */}
                <div className="he-edit-hero">
                    {isValidUrl(cover) && (
                        <img src={cover} className="he-edit-cover" />
                    )}

                    <input
                        className="he-edit-title-input"
                        value={d.tourName}
                        onChange={(e) => onChange("tourName", e.target.value)}
                    />

                    <textarea
                        className="he-edit-summary-input"
                        value={d.summary}
                        onChange={(e) => onChange("summary", e.target.value)}
                    />

                    <input
                        className="he-edit-location-input"
                        value={d.location.addressLine}
                        onChange={(e) => onChange("location.addressLine", e.target.value)}
                    />
                </div>

                {/* BASIC INFO ---------------------------------------- */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.basicInfo")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.category")}:</b>
                            <input
                                className="he-edit-input"
                                value={d.mainCategory}
                                onChange={(e) => onChange("mainCategory", e.target.value)}
                            />
                        </div>

                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.yearsOfExperience")}:</b>
                            <input
                                type="number"
                                className="he-edit-input"
                                value={d.durationDays}
                                onChange={(e) => onChange("durationDays", Number(e.target.value))}
                            />
                        </div>

                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.description")}:</b>
                            <textarea
                                className="he-edit-textarea"
                                value={d.description}
                                onChange={(e) => onChange("description", e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* QUALIFICATIONS ------------------------------------ */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.qualifications")}
                    </h2>

                    <div className="he-edit-card">
                        {["intro", "expertise", "recognition"].map((field) => (
                            <div className="he-edit-row" key={field}>
                                <b>{t(language, `hostExperience.qualification.${field}`)}:</b>
                                <textarea
                                    className="he-edit-textarea"
                                    value={d.qualifications[field] || ""}
                                    onChange={(e) => onChange(`qualifications.${field}`, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* LOCATION ------------------------------------------ */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.location")}
                    </h2>

                    <div className="he-edit-card">
                        {["addressLine", "city", "country"].map((field) => (
                            <div className="he-edit-row" key={field}>
                                <b>{t(language, `hostExperience.preview.${field}`)}:</b>
                                <input
                                    className="he-edit-input"
                                    value={d.location[field] || ""}
                                    onChange={(e) => onChange(`location.${field}`, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* PRICING ------------------------------------------- */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.pricing")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.basePrice")}:</b>
                            <input
                                type="number"
                                className="he-edit-input"
                                value={d.pricing.basePrice}
                                onChange={(e) => onChange("pricing.basePrice", Number(e.target.value))}
                            />
                        </div>

                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.pricePer")}:</b>
                            <input
                                className="he-edit-input"
                                value={d.pricing.priceUnit}
                                onChange={(e) => onChange("pricing.priceUnit", e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* CAPACITY ------------------------------------------ */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.capacity")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.maxGuests")}:</b>
                            <input
                                type="number"
                                className="he-edit-input"
                                value={d.capacity.maxGuests}
                                onChange={(e) => onChange("capacity.maxGuests", Number(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                {/* TIME SLOTS ---------------------------------------- */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.timeSlots")}
                    </h2>

                    <div className="he-edit-card">
                        {(d.booking.timeSlots || []).map((slot, idx) => (
                            <div key={idx} className="he-edit-row">
                                <input
                                    className="he-edit-input"
                                    value={slot.startTime || ""}
                                    onChange={(e) => {
                                        const clone = [...d.booking.timeSlots];
                                        clone[idx].startTime = e.target.value;
                                        onChange("booking.timeSlots", clone);
                                    }}
                                />
                            </div>
                        ))}

                        {d.booking.timeSlots.length === 0 && (
                            <p style={{ opacity: 0.6 }}>No time slots available.</p>
                        )}
                    </div>
                </section>

                {/* ITINERARY ----------------------------------------- */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.itinerary")}
                    </h2>

                    <div className="he-edit-card">
                        {itinerary.map((item, idx) => {
                            const img = normalizeImage(item);
                            return (
                                <div key={idx} className="he-edit-itinerary-item">

                                    {isValidUrl(img) && (
                                        <img src={img} className="he-edit-itinerary-photo" />
                                    )}

                                    <div className="he-edit-itinerary-body">
                                        <input
                                            className="he-edit-input"
                                            value={item.title || ""}
                                            onChange={(e) => {
                                                const clone = [...itinerary];
                                                clone[idx].title = e.target.value;
                                                onChange("experienceDetails", clone);
                                            }}
                                        />

                                        <textarea
                                            className="he-edit-textarea"
                                            value={item.content || ""}
                                            onChange={(e) => {
                                                const clone = [...itinerary];
                                                clone[idx].content = e.target.value;
                                                onChange("experienceDetails", clone);
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {itinerary.length === 0 && (
                            <p style={{ opacity: 0.6 }}>No itinerary items.</p>
                        )}
                    </div>
                </section>

                {/* SAVE BUTTON ---------------------------------------- */}
                <button className="he-edit-save-btn" onClick={handleSave}>
                    💾 Save Changes
                </button>
            </div>
        </div>
    );
}
