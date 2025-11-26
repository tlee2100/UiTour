import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";

export default function HostStayPreview() {
    const { stayData, sendHostData, stayPhotosRAM, validateAll } = useHost();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const d = stayData;
    const photos = stayPhotosRAM || [];

    // =============================
    // Amenities; Quick Rules; Safety (keys for i18n)
    // =============================
    const AMENITY_NAME = {
        1: t(language, "hostStay.amenities.wifi"),
        7: t(language, "hostStay.amenities.tv"),
        6: t(language, "hostStay.amenities.ac"),
        8: t(language, "hostStay.amenities.kitchen"),
        2: t(language, "hostStay.amenities.washer"),
        15: t(language, "hostStay.amenities.dryer"),
        3: t(language, "hostStay.amenities.heating"),
        4: t(language, "hostStay.amenities.iron"),
        9: t(language, "hostStay.amenities.gym"),
        11: t(language, "hostStay.amenities.freeParking"),
        17: t(language, "hostStay.amenities.hotTub"),
        14: t(language, "hostStay.amenities.pool"),
        19: t(language, "hostStay.amenities.bbq"),
        18: t(language, "hostStay.amenities.evCharger"),
        13: t(language, "hostStay.amenities.smokeAlarm"),
        12: t(language, "hostStay.amenities.breakfast"),
        10: t(language, "hostStay.amenities.workspace"),
        5: t(language, "hostStay.amenities.kingBed"),
        16: t(language, "hostStay.amenities.hairDryer"),
    };

    const QUICK_RULES = {
        no_smoking: t(language, "hostStay.rules.quick.noSmoking"),
        no_open_flames: t(language, "hostStay.rules.quick.noFlames"),
        pets_allowed: t(language, "hostStay.rules.quick.petsAllowed"),
    };

    const SAFETY = {
        covidSafety: t(language, "hostStay.rules.safety.enhancedCleaning"),
        surfacesSanitized: t(language, "hostStay.rules.safety.sanitized"),
        carbonMonoxideAlarm: t(language, "hostStay.rules.safety.coAlarm"),
        smokeAlarm: t(language, "hostStay.rules.safety.smokeAlarm"),
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
                        {t(language, "hostStay.preview.basicInfo")}
                    </h2>

                    <div className="hs-preview-card">
                        <div>
                            <b>{t(language, "hostStay.preview.propertyType")}: </b>
                            {t(language, PROPERTY_TYPE_KEY[d.propertyTypeLabel]) || d.propertyTypeLabel}
                        </div>

                        {d.roomTypeLabel && (
                            <div>
                                <b>{t(language, "hostStay.preview.typeOfPlace")}: </b>
                                {t(language, ROOM_TYPE_KEY[d.roomTypeLabel]) || d.roomTypeLabel}
                            </div>
                        )}

                        <div><b>{t(language, "hostStay.preview.bedrooms")}:</b> {d.bedrooms}</div>
                        <div><b>{t(language, "hostStay.preview.beds")}:</b> {d.beds}</div>
                        <div><b>{t(language, "hostStay.preview.bathrooms")}:</b> {d.bathrooms}</div>
                        <div><b>{t(language, "hostStay.preview.accommodates")}:</b> {d.accommodates}</div>
                    </div>
                </section>

                {/* LOCATION */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {t(language, "hostStay.preview.location")}
                    </h2>

                    <div className="hs-preview-card">
                        <div><b>{t(language, "hostStay.preview.address")}:</b> {d.location.addressLine}</div>
                        <div><b>{t(language, "hostStay.preview.city")}:</b> {d.location.city}</div>
                        <div><b>{t(language, "hostStay.preview.country")}:</b> {d.location.country}</div>
                    </div>
                </section>

                {/* AMENITIES */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {t(language, "hostStay.preview.amenities")}
                    </h2>

                    <div className="hs-preview-card">
                        {d.amenities.length === 0 &&
                            <div>{t(language, "hostStay.preview.noAmenities")}</div>
                        }

                        {d.amenities.map((id, i) => (
                            <div key={i}>• {AMENITY_NAME[id] || `Amenity ${id}`}</div>
                        ))}
                    </div>
                </section>

                {/* PRICING */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {t(language, "hostStay.preview.pricing")}
                    </h2>

                    <div className="hs-preview-card">
                        <div><b>{t(language, "hostStay.preview.basePrice")}:</b> ${d.pricing.basePrice}</div>
                        <div><b>{t(language, "hostStay.preview.weekendMultiplier")}:</b> {d.pricing.weekendMultiplier}x</div>
                        <div><b>{t(language, "hostStay.preview.cleaningFee")}:</b> ${d.pricing.cleaningFee}</div>
                        <div><b>{t(language, "hostStay.preview.extraFee")}:</b> ${d.pricing.extraPeopleFee}</div>
                        <div><b>{t(language, "hostStay.preview.extraThreshold")}:</b> {d.pricing.extraPeopleThreshold}</div>
                        <div><b>{t(language, "hostStay.preview.serviceFee")}:</b> {d.pricing.serviceFee.percent}%</div>
                        <div><b>{t(language, "hostStay.preview.tax")}:</b> {d.pricing.taxFee.percent}%</div>
                    </div>
                </section>

                {/* DISCOUNTS */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {t(language, "hostStay.preview.discounts")}
                    </h2>

                    <div className="hs-preview-card">
                        <div><b>{t(language, "hostStay.preview.weekly")}:</b> {d.pricing.discounts.weekly.percent}%</div>
                        <div><b>{t(language, "hostStay.preview.monthly")}:</b> {d.pricing.discounts.monthly.percent}%</div>

                        {d.pricing.discounts.seasonalDiscounts.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.seasonal")}
                                </h3>
                                {d.pricing.discounts.seasonalDiscounts.map((s, i) => (
                                    <div key={i}>
                                        <b>{s.from} → {s.to}:</b> {s.percentage}%
                                    </div>
                                ))}
                            </>
                        )}

                        {d.pricing.discounts.earlyBird.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.earlyBird")}
                                </h3>
                                {d.pricing.discounts.earlyBird.map((e, i) => (
                                    <div key={i}>
                                        <b>{t(language, "hostStay.preview.bookBefore").replace("{{days}}", e.daysBefore)}</b>
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
                        {t(language, "hostStay.preview.rulesSafety")}
                    </h2>

                    <div className="hs-preview-card">
                        {d.houseRules.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.houseRules")}
                                </h3>
                                {d.houseRules.map((r, i) => (
                                    <div key={i}>✔ {r.label}</div>
                                ))}
                            </>
                        )}

                        {Object.keys(QUICK_RULES).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.quickRules")}
                                </h3>
                                {Object.keys(QUICK_RULES)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {QUICK_RULES[k]}</div>
                                    ))}
                            </>
                        )}

                        {Object.keys(SAFETY).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.safety")}
                                </h3>
                                {Object.keys(SAFETY)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {SAFETY[k]}</div>
                                    ))}
                            </>
                        )}

                        {d.rules.selfCheckIn && (
                            <>
                                <h3 className="hs-preview-subtitle">
                                    {t(language, "hostStay.preview.selfCheckin")}
                                </h3>
                                <div>
                                    {t(language, "hostStay.preview.method")}{" "}
                                    <b>{d.rules.self_checkin_method}</b>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* PHOTOS */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">
                        {t(language, "hostStay.preview.photos")}
                    </h2>

                    <div className="hs-preview-photo-grid">
                        {photos.map((p, i) => (
                            <img
                                key={i}
                                src={p.preview}
                                alt=""
                                className="hs-preview-photo-item"
                            />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
