import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function HostStayPreview() {
    const { stayData, sendHostData, stayPhotosRAM, validateAll } = useHost();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { format, convertToCurrent } = useCurrency();

    const d = stayData;
    const photos = stayPhotosRAM || [];

    // =============================
    // Translation-safe dictionaries
    // =============================
    const AMENITY_KEYS = {
        1: "hostStay.amenities.wifi",
        7: "hostStay.amenities.tv",
        6: "hostStay.amenities.ac",
        8: "hostStay.amenities.kitchen",
        2: "hostStay.amenities.washer",
        15: "hostStay.amenities.dryer",
        3: "hostStay.amenities.heating",
        4: "hostStay.amenities.iron",
        9: "hostStay.amenities.gym",
        11: "hostStay.amenities.freeParking",
        17: "hostStay.amenities.hotTub",
        14: "hostStay.amenities.pool",
        19: "hostStay.amenities.bbq",
        18: "hostStay.amenities.evCharger",
        13: "hostStay.amenities.smokeAlarm",
        12: "hostStay.amenities.breakfast",
        10: "hostStay.amenities.workspace",
        5: "hostStay.amenities.kingBed",
        16: "hostStay.amenities.hairDryer",
    };

    const QUICK_RULE_KEYS = {
        no_smoking: "hostStay.rules.quick.noSmoking",
        no_open_flames: "hostStay.rules.quick.noFlames",
        pets_allowed: "hostStay.rules.quick.petsAllowed",
    };

    const SAFETY_KEYS = {
        covidSafety: "hostStay.rules.safety.enhancedCleaning",
        surfacesSanitized: "hostStay.rules.safety.sanitized",
        carbonMonoxideAlarm: "hostStay.rules.safety.coAlarm",
        smokeAlarm: "hostStay.rules.safety.smokeAlarm",
    };

    const PROPERTY_TYPE_KEY = {
        "House": "hostStay.choose.house",
        "Apartment": "hostStay.choose.apartment",
        "Guest house": "hostStay.choose.guestHouse",
        "Hotel": "hostStay.choose.hotel",
    };

    const ROOM_TYPE_KEY = {
        "An entire place": "hostStay.typePlace.entire",
        "A room": "hostStay.typePlace.room",
    };

    const safeT = (key, fallback = "") =>
        key ? t(language, key) : fallback;

    // =============================
    // Publish
    // =============================
    const handlePublish = async () => {
        const result = validateAll();
        if (!result.ok) {
            alert(`❌ ${t(language, "hostStay.preview.cannotPublish")}: ${result.message}`);
            return;
        }

        await sendHostData();
    };

    return (
        <div className="hs-preview-page">
            <div className="hs-preview-container">

                {/* COVER + TITLE */}
                <div className="hs-preview-hero">
                    {(() => {
                        let cover =
                            photos.find(p => p.isCover) ||
                            photos.find(p => p.category === "bedroom") ||
                            photos.find(p => p.category === "bathroom") ||
                            photos[0];

                        return cover ? (
                            <img
                                src={cover.preview}
                                alt="cover"
                                className="hs-preview-cover"
                            />
                        ) : null;
                    })()}

                    <h1 className="hs-preview-title">{d.listingTitle}</h1>

                    {d.description && (
                        <p className="hs-preview-description">{d.description}</p>
                    )}

                    <div className="hs-preview-location">
                        📍 {d.location.addressLine}
                    </div>
                </div>

                {/* BASIC INFO */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.basicInfo")}
                    </h2>

                    <div className="hs-preview-card">

                        <div>
                            <b>{safeT("hostStay.preview.propertyType")}:</b>{" "}
                            {PROPERTY_TYPE_KEY[d.propertyTypeLabel]
                                ? safeT(PROPERTY_TYPE_KEY[d.propertyTypeLabel])
                                : d.propertyTypeLabel}
                        </div>

                        {d.roomTypeLabel && (
                            <div>
                                <b>{safeT("hostStay.preview.typeOfPlace")}:</b>{" "}
                                {ROOM_TYPE_KEY[d.roomTypeLabel]
                                    ? safeT(ROOM_TYPE_KEY[d.roomTypeLabel])
                                    : d.roomTypeLabel}
                            </div>
                        )}

                        <div><b>{safeT("hostStay.preview.bedrooms")}:</b> {d.bedrooms}</div>
                        <div><b>{safeT("hostStay.preview.beds")}:</b> {d.beds}</div>
                        <div><b>{safeT("hostStay.preview.bathrooms")}:</b> {d.bathrooms}</div>
                        <div><b>{safeT("hostStay.preview.accommodates")}:</b> {d.accommodates}</div>
                    </div>
                </section>

                {/* LOCATION */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.location")}
                    </h2>

                    <div className="hs-preview-card">
                        <div><b>{safeT("hostStay.preview.address")}:</b> {d.location.addressLine}</div>
                        <div><b>{safeT("hostStay.preview.city")}:</b> {d.location.city}</div>
                        <div><b>{safeT("hostStay.preview.country")}:</b> {d.location.country}</div>
                    </div>
                </section>

                {/* AMENITIES */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.amenities")}
                    </h2>

                    <div className="hs-preview-card">
                        {d.amenities.length === 0 &&
                            <div>{safeT("hostStay.preview.noAmenities")}</div>
                        }

                        {d.amenities.map((id, i) => {
                            const key = AMENITY_KEYS[id];
                            return (
                                <div key={i}>• {key ? safeT(key) : `Amenity ${id}`}</div>
                            );
                        })}
                    </div>
                </section>

                {/* PRICING */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.pricing")}
                    </h2>

                    <div className="hs-preview-card">

                        <div>
                            <b>{safeT("hostStay.preview.basePrice")}:</b>{" "}
                            {format(convertToCurrent(d.pricing.basePrice))}
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.weekendMultiplier")}:</b>{" "}
                            {d.pricing.weekendMultiplier}x
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.cleaningFee")}:</b>{" "}
                            {format(convertToCurrent(d.pricing.cleaningFee))}
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.extraFee")}:</b>{" "}
                            {format(convertToCurrent(d.pricing.extraPeopleFee))}
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.extraThreshold")}:</b>{" "}
                            {d.pricing.extraPeopleThreshold}
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.serviceFee")}:</b>{" "}
                            {d.pricing.serviceFee.percent}%
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.tax")}:</b>{" "}
                            {d.pricing.taxFee.percent}%
                        </div>
                    </div>
                </section>

                {/* DISCOUNTS */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.discounts")}
                    </h2>

                    <div className="hs-preview-card">

                        <div>
                            <b>{safeT("hostStay.preview.weekly")}:</b>{" "}
                            {d.pricing.discounts.weekly.percent}%
                        </div>

                        <div>
                            <b>{safeT("hostStay.preview.monthly")}:</b>{" "}
                            {d.pricing.discounts.monthly.percent}%
                        </div>

                        {d.pricing.discounts.seasonalDiscounts.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.seasonal")}</h3>

                                {d.pricing.discounts.seasonalDiscounts.map((s, i) => (
                                    <div key={i}>
                                        <b>{s.from} → {s.to}:</b> {s.percentage}%
                                    </div>
                                ))}
                            </>
                        )}

                        {d.pricing.discounts.earlyBird.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.earlyBird")}</h3>

                                {d.pricing.discounts.earlyBird.map((e, i) => (
                                    <div key={i}>
                                        <b>{safeT("hostStay.preview.bookBefore").replace("{{days}}", e.daysBefore)}</b>{" "}
                                        {e.percent}%
                                    </div>
                                ))}
                            </>
                        )}

                    </div>
                </section>

                {/* RULES & SAFETY */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.rulesSafety")}
                    </h2>

                    <div className="hs-preview-card">

                        {d.houseRules.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.houseRules")}</h3>

                                {d.houseRules.map((r, i) => (
                                    <div key={i}>✔ {r.label}</div>
                                ))}
                            </>
                        )}

                        {/* QUICK RULES */}
                        {Object.keys(QUICK_RULE_KEYS).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.quickRules")}</h3>

                                {Object.keys(QUICK_RULE_KEYS)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {safeT(QUICK_RULE_KEYS[k])}</div>
                                    ))}
                            </>
                        )}

                        {/* SAFETY */}
                        {Object.keys(SAFETY_KEYS).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.safety")}</h3>

                                {Object.keys(SAFETY_KEYS)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {safeT(SAFETY_KEYS[k])}</div>
                                    ))}
                            </>
                        )}

                        {/* SELF CHECK-IN */}
                        {d.rules.selfCheckIn && (
                            <>
                                <h3 className="hs-preview-subtitle">{safeT("hostStay.preview.selfCheckin")}</h3>

                                <div>
                                    {safeT("hostStay.preview.method")} <b>{d.rules.self_checkin_method}</b>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* PHOTOS */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {safeT("hostStay.preview.photos")}
                    </h2>

                    <div className="hs-preview-photo-grid">
                        {photos.map((p, i) => (
                            <img key={i} src={p.preview} alt="" className="hs-preview-photo-item" />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
