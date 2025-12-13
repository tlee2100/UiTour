import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HostListings.css";
import { Icon } from "@iconify/react";
import sampleImg from "../../assets/sample-room.jpg";
import { useApp } from "../../contexts/AppContext";
import authAPI from "../../services/authAPI";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

// ⭐ NEW HEADER
import HostHHeader from "../../components/headers/HostHHeader";

export default function HostListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const navigate = useNavigate();
    const { user } = useApp();
    const { language } = useLanguage();


    // ===========================
    // IMAGE HELPERS
    // ===========================
    const normalizeImageUrl = (url) => {
        if (!url || typeof url !== "string") return null;

        const trimmed = url.trim();
        if (trimmed.startsWith("data:image")) return null;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
        if (trimmed.startsWith("/")) return `http://localhost:5069${trimmed}`;
        return `http://localhost:5069/${trimmed}`;
    };

    const getFirstPhotoUrl = (item) => {
        const photos = item.Photos || item.photos || [];
        if (!Array.isArray(photos) || photos.length === 0) return null;

        const first = photos[0];
        const raw =
            first?.Url ||
            first?.url ||
            first?.serverUrl ||
            first?.ImageUrl ||
            first?.imageUrl ||
            null;

        return normalizeImageUrl(raw);
    };


    // ===========================
    // LOAD LISTINGS (original logic preserved)
    // ===========================
    useEffect(() => {
        loadListings();
    }, [user, language]);

    useEffect(() => {
        const refresh = () => user && loadListings();
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) refresh();
        });
        window.addEventListener("focus", refresh);

        return () => {
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, [user]);

    const loadListings = async () => {
        try {
            setLoading(true);

            if (!user) {
                setListings([]);
                return;
            }

            const userID = user.UserID || user.userID || user.id;
            if (!userID) {
                setListings([]);
                return;
            }

            // Load properties
            const properties = await authAPI.getPropertiesByUser(userID);

            const formattedProperties = properties.map((p) => {
                const img = getFirstPhotoUrl(p);

                const reviews = p.Reviews || p.reviews || [];
                const rating =
                    reviews.length > 0
                        ? reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length
                        : 0;

                const isActive = p.Active ?? p.active ?? false;
                const statusKey = isActive ? "approved" : "pending";

                return {
                    id: p.PropertyID || p.propertyID || p.id,
                    statusKey,
                    statusLabel: statusKey === "approved"
                        ? t(language, "hostListing.approved")
                        : t(language, "hostListing.pending"),
                    title: p.ListingTitle || p.listingTitle || "Untitled",
                    rating,
                    image: img || sampleImg,
                    type: "property",
                    location: p.Location || p.location || "",
                };
            });

            // Load tours
            let tours = [];
            try {
                tours = await authAPI.getToursByUser(userID);
            } catch {
                try {
                    tours = await authAPI.getToursByHost(userID);
                } catch {
                    // Fallback: filter all tours
                    const all = await authAPI.getTours();
                    tours = all.filter(
                        (t) =>
                            t.HostID === userID ||
                            t.UserID === userID ||
                            t.hostID === userID ||
                            t.userID === userID
                    );
                }
            }

            const formattedTours = (tours || []).map((tour) => {
                const img = getFirstPhotoUrl(tour);

                const reviews =
                    tour.Reviews ||
                    tour.reviews ||
                    tour.TourReviews ||
                    tour.tourReviews ||
                    [];

                const rating =
                    reviews.length > 0
                        ? reviews.reduce((s, r) => s + (r.Rating || r.rating || 0), 0) / reviews.length
                        : 0;

                const isActive = tour.Active ?? tour.active ?? false;
                const statusKey = isActive ? "approved" : "pending";

                return {
                    id: tour.TourID || tour.tourID || tour.id,
                    statusKey,
                    statusLabel: statusKey === "approved"
                        ? t(language, "hostListing.approved")
                        : t(language, "hostListing.pending"),
                    title: tour.TourName || tour.tourName || tour.title || "Untitled",
                    rating,
                    image: img || sampleImg,
                    type: "tour",
                    location: tour.Location || tour.location || "",
                };
            });

            setListings([...formattedProperties, ...formattedTours]);
        } catch (err) {
            console.error("Failed loading listings:", err);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // DELETE LISTING
    // ===========================
    const handleDeleteClick = (item) => {
        setDeleteConfirm({
            id: item.id,
            type: item.type,
            title: item.title,
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        const { id, type } = deleteConfirm;

        try {
            setDeletingId(id);

            if (type === "property") await authAPI.deleteProperty(id);
            else await authAPI.deleteTour(id);

            setListings((prev) => prev.filter((p) => !(p.id === id && p.type === type)));
            setDeleteConfirm(null);

            //alert(t(language, "host.hasBeenDeleted"));
        } catch (err) {
            console.error("Delete error:", err);
            //alert(t(language, "host.errorDeleting"));
        } finally {
            setDeletingId(null);
        }
    };

    // ===========================
    // JSX
    // ===========================
    return (
        <div className="host-listings">

            {/* ⭐⭐⭐ USE NEW HEADER ⭐⭐⭐ */}

            {/* ================= CONTENT ================= */}
            <div className="listing-content">
                <div className="listing-header">
                    <div>
                        <h1>{t(language, "hostListing.yourListings")}</h1>
                        <p>{t(language, "hostListing.publishNewStay")}</p>
                    </div>

                    <button
                        className="listing-create-btn"
                        onClick={() => navigate("/host/becomehost")}
                    >
                        <Icon icon="mdi:plus" width="20" height="20" />
                        {t(language, "hostListing.createNewListing")}
                    </button>
                </div>

                <div className="listing-grid">
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", gridColumn: "1 / -1" }}>
                            {t(language, "hostListing.loading")}
                        </div>
                    ) : listings.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#666", gridColumn: "1 / -1" }}>
                            {t(language, "hostListing.noListingsYet")}
                        </div>
                    ) : (
                        listings.map((item) => {
                            const canEdit = item.statusKey === "approved";

                            return (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className={`listing-card ${!canEdit ? "pending-card" : ""}`}
                                >
                                    <div
                                        className={`listing-status ${item.statusKey === "pending" ? "pending" : "approved"
                                            }`}
                                    >
                                        {item.statusLabel}
                                    </div>

                                    <div className="listing-type-badge">
                                        <Icon
                                            icon={item.type === "property" ? "mdi:home" : "mdi:map-marker"}
                                            width="14"
                                            height="14"
                                        />
                                        {item.type === "property"
                                            ? t(language, "hostListing.stay")
                                            : t(language, "hostListing.tour")}
                                    </div>

                                    {/* ✅ EDIT BUTTON */}
                                    <button
                                        className={`listing-edit-btn ${!canEdit ? "disabled" : ""}`}
                                        disabled={!canEdit}
                                        onClick={() => {
                                            if (!canEdit) return;
                                            navigate(
                                                item.type === "tour"
                                                    ? `/host/experience/edit/${item.id}`
                                                    : `/host/stay/edit/${item.id}`
                                            );
                                        }}
                                        title={!canEdit ? t(language, "hostListing.pendingEditDisabled") : ""}
                                    >
                                        <Icon icon="mdi:pencil-outline" width="18" height="18" />
                                    </button>

                                    {/* DELETE BUTTON */}
                                    <button
                                        className="listing-delete-btn"
                                        onClick={() => handleDeleteClick(item)}
                                        disabled={deletingId === item.id}
                                    >
                                        {deletingId === item.id ? (
                                            <Icon icon="mdi:loading" width="18" height="18" className="spinning" />
                                        ) : (
                                            <Icon icon="mdi:delete-outline" width="18" height="18" />
                                        )}
                                    </button>

                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="listing-img"
                                        onError={(e) => (e.target.src = sampleImg)}
                                    />

                                    <div className="listing-info">
                                        <h3>
                                            {item.title}
                                            {item.rating > 0 && (
                                                <span className="listing-rating">
                                                    ★ {item.rating.toFixed(1)}
                                                </span>
                                            )}
                                        </h3>

                                        {item.location && (
                                            <p className="listing-location">
                                                <Icon icon="mdi:map-marker" width="14" height="14" />
                                                {item.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ================= DELETE CONFIRM ================= */}
            {deleteConfirm && (
                <div className="delete-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <Icon icon="mdi:alert-circle" width="24" height="24" className="delete-modal-icon" />
                            <h3>{t(language, "host.confirmDeletion")}</h3>
                        </div>
                        <div className="delete-modal-body">
                            <p>
                                {t(language, "host.areYouSureDelete")} <strong>"{deleteConfirm.title}"</strong>?
                            </p>
                            <p className="delete-modal-warning">{t(language, "host.thisActionCannotBeUndone")}</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-cancel" onClick={() => setDeleteConfirm(null)}>
                                {t(language, "common.cancel")}
                            </button>
                            <button className="delete-modal-confirm" onClick={confirmDelete} disabled={deletingId !== null}>
                                {deletingId === deleteConfirm.id ? t(language, "host.deleting") : t(language, "common.delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
