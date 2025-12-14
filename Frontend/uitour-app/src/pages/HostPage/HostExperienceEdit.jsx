import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HostExperienceEdit.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import EditableRow from "../../components/modals/EditableRow";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import authAPI from "../../services/authAPI";

const API_BASE = "http://localhost:5069";

const LOCKED_HINT =
    "Trường này không thể chỉnh sửa. Nếu có thay đổi lớn, vui lòng tạo listing mới.";

export default function HostExperienceEdit() {
    const { id } = useParams();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

    const [activeField, setActiveField] = useState(null);
    const [draftValue, setDraftValue] = useState("");
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [photosModalOpen, setPhotosModalOpen] = useState(false);
    const [photosDraft, setPhotosDraft] = useState([]);
    const [itineraryDraft, setItineraryDraft] = useState(null);
    const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
    const [itineraryImageRAM, setItineraryImageRAM] = useState({});

    const fileInputRef = useRef(null);


    const inputRef = useRef(null);


    /* ================= HELPERS ================= */

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }


    const normalizeImage = (p) => {
        if (p?.preview) return p.preview;

        const raw = p?.url || p?.imageUrl || "";
        if (!raw) return "";
        if (raw.startsWith("http")) return raw;
        if (raw.startsWith("/")) return `${API_BASE}${raw}`;
        return `${API_BASE}/${raw}`;
    };


    /* ================= LOAD ================= */

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(`${API_BASE}/api/Tour/${id}`, {
                    headers: { Accept: "application/json" },
                });

                const text = await res.text();
                if (!res.ok || text.startsWith("<")) {
                    setErr("Invalid server response");
                    return;
                }

                const json = JSON.parse(text);

                const safe = {
                    tourName: json.tourName || "",
                    summary: json.summary || "",
                    description: json.description || "",
                    mainCategory: json.mainCategory || "",
                    durationDays: json.durationDays ?? 0,

                    location: {
                        addressLine: json.location || "",
                        city: json.city?.cityName || "",
                        country: json.country?.countryName || "",
                    },

                    pricing: {
                        basePrice: json.price ?? 0,
                        priceUnit: json.priceUnit || "",
                    },

                    capacity: {
                        maxGuests: json.maxGuests ?? 1,
                    },

                    qualifications: {
                        intro: json.qualifications?.intro || "",
                        expertise: json.qualifications?.expertise || "",
                        recognition: json.qualifications?.recognition || "",
                    },

                    booking: {
                        timeSlots: Array.isArray(json.booking?.timeSlots)
                            ? json.booking.timeSlots
                            : [],
                    },

                    experienceDetails: Array.isArray(json.experienceDetails)
                        ? json.experienceDetails
                        : [],

                    photos: Array.isArray(json.photos) ? json.photos : [],
                };

                setData(safe);
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    /* ================= SAVE ================= */

    const uploadPhoto = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_BASE}/api/photos/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Upload itinerary image failed");
        }

        const data = await res.json();
        return data.url; // BE trả về { url }
    };


    async function handleSave() {
        try {
            /* ======================
               1️⃣ PROCESS PHOTOS
            ====================== */
            const finalPhotos = [];

            for (const p of data.photos) {
                let url = p.url || p.imageUrl;

                if (!url && p.file) {
                    const formData = new FormData();
                    formData.append("file", p.file);

                    const res = await fetch(`${API_BASE}/api/photos/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        throw new Error("Upload experience photo failed");
                    }

                    const result = await res.json();
                    url = result.url;
                }

                finalPhotos.push({
                    url,
                    caption: p.caption || "",
                    sortIndex: p.sortIndex,
                });
            }

            /* ======================
               2️⃣ PROCESS ITINERARY
            ====================== */
            const processedDetails = [];

            for (const it of data.experienceDetails) {
                const ram = itineraryImageRAM[it.id];
                let imageUrl = it.imageUrl || "";

                if (!imageUrl && ram?.file) {
                    const formData = new FormData();
                    formData.append("file", ram.file);

                    const res = await fetch(`${API_BASE}/api/photos/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        throw new Error("Upload itinerary image failed");
                    }

                    const result = await res.json();
                    imageUrl = result.url;
                }

                processedDetails.push({
                    ...it,
                    imageUrl,
                });
            }

            /* ======================
               3️⃣ PAYLOAD (QUAN TRỌNG)
            ====================== */
            const payload = {
                tourName: data.tourName,
                summary: data.summary,
                description: data.description,
                mainCategory: data.mainCategory,
                durationDays: data.durationDays,
                location: data.location.addressLine,
                price: data.pricing.basePrice,
                maxGuests: data.capacity.maxGuests,
                experienceDetails: processedDetails,
                photos: finalPhotos,
            };

            /* ======================
               4️⃣ CALL API
            ====================== */
            await authAPI.updateTour(id, payload);
            navigate("/host/listings");

        } catch (e) {
            alert("❌ Update failed: " + e.message);
        }
    }



    /* ================= STATE UPDATE ================= */

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

    /* ================= MODAL ================= */

    const openPhotosModal = () => {
        const draft = (data.photos || []).map(p => ({
            ...p,
            preview: normalizeImage(p),
            isCover: p.sortIndex === 1,
        }));

        setPhotosDraft(draft);
        setPhotosModalOpen(true);
    };

    const handleAddPhotos = (e) => {
        const files = Array.from(e.target.files || []);

        const added = files.map(file => ({
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
            if (!list.some(p => p.isCover)) list[0].isCover = true;
            return list;
        });
    };

    const savePhotos = () => {
        const ordered = [
            ...photosDraft.filter(p => p.isCover),
            ...photosDraft.filter(p => !p.isCover),
        ];

        setData(prev => ({
            ...prev,
            photos: ordered.map((p, i) => ({
                url: p.url,
                imageUrl: p.imageUrl,
                file: p.file,
                preview: p.preview,
                caption: p.caption || "",
                sortIndex: i + 1,
            })),

        }));

        setPhotosModalOpen(false);
    };

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

    const startEditActivity = (item) => {
        setEditing(true);
        setEditingId(item.id);
        setTitle(item.title || "");
        setContent(item.description || "");

        setItineraryImageRAM(prev => ({
            ...prev,
            [item.id]: {
                file: null,
                preview: item.imageUrl
                    ? normalizeImage({ imageUrl: item.imageUrl })
                    : "",
                serverUrl: item.imageUrl || "",
            }
        }));
    };


    /* ================= RENDER ================= */

    if (loading) return <LoadingSpinner />;
    if (err) return <ErrorMessage message={err} />;
    if (!data) return null;

    const d = data;
    const cover = d.photos[0] ? normalizeImage(d.photos[0]) : "";

    return (
        <div className="he-edit-page">
            <div className="he-edit-container">

                {/* HERO */}
                <div className="he-edit-hero">
                    {cover && <img src={cover} className="he-edit-cover" />}

                    <EditableRow
                        value={d.tourName}
                        editable
                        variant="title"
                        className="he-hero-title"
                        onEdit={() => openEditor("tourName", d.tourName)}
                    />

                    <EditableRow
                        value={d.description}
                        editable
                        variant="description"
                        className="he-hero-description"
                        onEdit={() => openEditor("summary", d.description)}
                    />

                    <input
                        className="he-edit-location-input"
                        value={d.location.addressLine}
                        disabled
                    />
                </div>

                {/* BASIC INFO */}
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
                                disabled
                                title={LOCKED_HINT}
                            />
                        </div>

                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.yearsOfExperience")}:</b>
                            <EditableRow
                                value={d.durationDays}
                                editable
                                onEdit={() => openEditor("durationDays", d.durationDays)}
                            />
                        </div>

                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.description")}:</b>
                            <EditableRow
                                value={d.description}
                                editable
                                onEdit={() => openEditor("description", d.description)}
                            />
                        </div>
                    </div>
                </section>

                {/* LOCATION */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.location")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.address")}:</b>
                            <input
                                className="he-edit-input"
                                value={d.location.addressLine}
                                disabled
                                title={LOCKED_HINT}
                            />
                        </div>

                        {d.location.city && (
                            <div className="he-edit-row">
                                <b>{t(language, "hostExperience.preview.city")}:</b>
                                <span>{d.location.city}</span>
                            </div>
                        )}

                        {d.location.country && (
                            <div className="he-edit-row">
                                <b>{t(language, "hostExperience.preview.country")}:</b>
                                <span>{d.location.country}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* PRICING */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.pricing")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.basePrice")}:</b>
                            <EditableRow
                                value={d.pricing.basePrice}
                                editable
                                onEdit={() =>
                                    openEditor("pricing.basePrice", d.pricing.basePrice)
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* CAPACITY */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.capacity")}
                    </h2>

                    <div className="he-edit-card">
                        <div className="he-edit-row">
                            <b>{t(language, "hostExperience.preview.maxGuests")}:</b>
                            <EditableRow
                                value={d.capacity.maxGuests}
                                editable
                                onEdit={() =>
                                    openEditor("capacity.maxGuests", d.capacity.maxGuests)
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* ITINERARY */}
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.itinerary")}
                    </h2>

                    <div className="he-edit-card">
                        {d.experienceDetails.length === 0 ? (
                            <div>—</div>
                        ) : (
                            d.experienceDetails.map((it) => (
                                <div key={it.id}>
                                    {/* VIEW */}
                                    <div
                                        className="he-edit-itinerary-item"
                                        onClick={() => startEditActivity(it)}
                                    >
                                        <img
                                            src={
                                                itineraryImageRAM[it.id]?.preview
                                                || (it.imageUrl
                                                    ? normalizeImage({ imageUrl: it.imageUrl })
                                                    : "/placeholder.png")
                                            }
                                            className="he-edit-itinerary-photo"
                                            alt=""
                                        />

                                        <div className="he-edit-itinerary-body">
                                            <div className="he-itinerary-title">{it.title}</div>
                                            <div className="he-itinerary-description">{it.description}</div>
                                        </div>
                                    </div>

                                    {/* EDITOR */}
                                    {editing && editingId === it.id && (
                                        <div className="he-activity-editor he-editor-inline">
                                            <div className="he-editor-left">
                                                <div
                                                    className="he-editor-thumb"
                                                    onClick={() => inputRef.current?.click()}
                                                >
                                                    {itineraryImageRAM[editingId]?.preview
                                                        ? <img src={itineraryImageRAM[editingId].preview} />
                                                        : <span>📷</span>}
                                                </div>

                                                <input
                                                    ref={inputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (!f) return;

                                                        setItineraryImageRAM(prev => ({
                                                            ...prev,
                                                            [editingId]: {
                                                                file: f,
                                                                preview: URL.createObjectURL(f),
                                                                serverUrl: prev[editingId]?.serverUrl || "",
                                                            }
                                                        }));

                                                        e.target.value = "";
                                                    }}
                                                />
                                            </div>

                                            <div className="he-editor-right">
                                                <input
                                                    className="he-editor-title"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                />

                                                <textarea
                                                    className="he-editor-content"
                                                    rows={3}
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                />

                                                <div className="he-editor-actions">
                                                    <button
                                                        className="he-tertiary-btn"
                                                        onClick={() => {
                                                            setEditing(false);
                                                            setEditingId(null);
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        className="he-primary-btn"
                                                        onClick={() => {
                                                            setData((prev) => {
                                                                const clone = structuredClone(prev);
                                                                const idx = clone.experienceDetails.findIndex(
                                                                    (x) => x.id === editingId
                                                                );

                                                                if (idx !== -1) {
                                                                    clone.experienceDetails[idx] = {
                                                                        ...clone.experienceDetails[idx],
                                                                        title,
                                                                        description: content,
                                                                        imageUrl:
                                                                            itineraryImageRAM[editingId]?.serverUrl
                                                                            || clone.experienceDetails[idx].imageUrl
                                                                            || "",
                                                                    };
                                                                }
                                                                return clone;
                                                            });

                                                            setEditing(false);
                                                            setEditingId(null);
                                                            setImage(null);
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <section className="he-edit-section">
                    <h2 className="he-edit-section-title">
                        {t(language, "hostExperience.preview.photos")}
                        <button
                            className="hs-edit-icon-btn"
                            onClick={openPhotosModal}
                            title="Edit photos"
                        >
                            ✎
                        </button>
                    </h2>

                    <div className="he-edit-photo-grid">
                        {data.photos.map((p, i) => (
                            <img
                                key={i}
                                src={normalizeImage(p)}
                                className="he-edit-photo-item"
                                alt=""
                            />
                        ))}
                    </div>
                </section>

                <button className="he-edit-save-btn" onClick={handleSave}>
                    💾 Save Changes
                </button>
            </div>

            {/* EDIT MODAL */}
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
                                className="hs-input"
                                value={draftValue}
                                onChange={(e) => setDraftValue(e.target.value)}
                            />
                        </div>

                        <div className="hs-modal-footer">
                            <button onClick={closeEditor}>Cancel</button>
                            <button onClick={saveEditor}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            {photosModalOpen && (
                <div className="hs-modal">
                    <div
                        className="hs-modal-backdrop"
                        onClick={() => setPhotosModalOpen(false)}
                    />

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
                                {photosDraft.map((p) => (
                                    <div
                                        key={p.url || p.preview}
                                        className="hs-edit-photo-wrapper"
                                    >
                                        <img
                                            src={p.preview || normalizeImage(p)}
                                            className={`hs-edit-photo-item ${p.isCover ? "is-cover" : ""
                                                }`}
                                            onClick={() => setAsCover(p)}
                                        />

                                        {p.isCover && (
                                            <span className="hs-cover-badge">Cover</span>
                                        )}

                                        <button
                                            className="hs-photo-remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
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
                            <button onClick={() => setPhotosModalOpen(false)}>
                                Cancel
                            </button>
                            <button onClick={savePhotos}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
