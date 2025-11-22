import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostStay.css";

export default function HostStayPreview() {
    const { stayData, sendHostData, stayPhotosRAM, validateAll } = useHost();
    const navigate = useNavigate();

    const d = stayData;
    const photos = stayPhotosRAM || [];

    // =============================
    // Amenities dictionary
    // =============================
    const AMENITY_NAME = {
        1: "Wi-Fi", 7: "TV", 6: "Air conditioning", 8: "Kitchen",
        2: "Washer", 15: "Dryer", 3: "Heating", 4: "Iron",
        9: "Gym", 11: "Free parking", 17: "Hot tub", 14: "Pool",
        19: "BBQ grill", 18: "EV charger", 13: "Smoke alarm",
        12: "Breakfast", 10: "Dedicated Workspace", 5: "King bed",
        16: "Hair dryer",
    };

    const QUICK_RULES = {
        no_smoking: "No smoking",
        no_open_flames: "No open flames",
        pets_allowed: "Pets allowed",
    };

    const SAFETY = {
        covidSafety: "Enhanced cleaning (COVID)",
        surfacesSanitized: "Surfaces sanitized regularly",
        carbonMonoxideAlarm: "Carbon monoxide alarm",
        smokeAlarm: "Smoke alarm",
    };

    // =============================
    // FINAL PUBLISH HANDLER
    // =============================
    const handlePublish = async () => {
        const result = validateAll();

        if (!result.ok) {
            // ERROR HANDLING — hiện alert chi tiết
            alert(`❌ Cannot publish: ${result.message}`);

            // Nếu muốn tự động đưa người dùng về đúng step bị lỗi:
            // navigate(`/host/stay/create/${result.step}`);

            return;
        }

        // If valid -> send request
        await sendHostData();
    };

    return (
        <div className="hs-preview-page">
            <div className="hs-preview-container">

                {/* ========================= */}
                {/*   COVER + TITLE           */}
                {/* ========================= */}
                <div className="hs-preview-hero">

                    {(() => {
                        let cover = photos.find(p => p.isCover)
                            || photos.find(p => p.category === "bedroom")
                            || photos.find(p => p.category === "bathroom")
                            || photos[0];

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

                {/* ========================= */}
                {/*   BASIC INFO              */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Basic information</h2>

                    <div className="hs-preview-card">
                        <div><b>Property type:</b> {d.propertyTypeLabel}</div>
                        {d.roomTypeLabel && (
                            <div><b>Type of place:</b> {d.roomTypeLabel}</div>
                        )}
                        <div><b>Bedrooms:</b> {d.bedrooms}</div>
                        <div><b>Beds:</b> {d.beds}</div>
                        <div><b>Bathrooms:</b> {d.bathrooms}</div>
                        <div><b>Accommodates:</b> {d.accommodates}</div>
                    </div>
                </section>

                {/* ========================= */}
                {/*   LOCATION                */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Location</h2>
                    <div className="hs-preview-card">
                        <div><b>Address</b>: {d.location.addressLine}</div>
                        <div><b>City</b>: {d.location.city}</div>
                        <div><b>Country</b>: {d.location.country}</div>
                    </div>
                </section>

                {/* ========================= */}
                {/*   AMENITIES               */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Amenities</h2>
                    <div className="hs-preview-card">
                        {d.amenities.length === 0 && <div>No amenities selected</div>}
                        {d.amenities.map((id, i) => (
                            <div key={i}>• {AMENITY_NAME[id] || `Amenity ${id}`}</div>
                        ))}
                    </div>
                </section>

                {/* ========================= */}
                {/*   PRICING                 */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Pricing & Fees</h2>
                    <div className="hs-preview-card">

                        <div><b>Base price:</b> ${d.pricing.basePrice}</div>
                        <div><b>Weekend multiplier:</b> {d.pricing.weekendMultiplier}x</div>
                        <div><b>Cleaning fee:</b> ${d.pricing.cleaningFee}</div>
                        <div><b>Extra people fee:</b> ${d.pricing.extraPeopleFee}</div>
                        <div><b>Extra threshold:</b> {d.pricing.extraPeopleThreshold} guests</div>
                        <div><b>Service fee:</b> {d.pricing.serviceFee.percent}%</div>
                        <div><b>Tax:</b> {d.pricing.taxFee.percent}%</div>

                    </div>
                </section>

                {/* ========================= */}
                {/*   DISCOUNTS               */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Discounts</h2>

                    <div className="hs-preview-card">

                        <div><b>Weekly discount:</b> {d.pricing.discounts.weekly.percent}%</div>
                        <div><b>Monthly discount:</b> {d.pricing.discounts.monthly.percent}%</div>

                        {d.pricing.discounts.seasonalDiscounts.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">Seasonal</h3>
                                {d.pricing.discounts.seasonalDiscounts.map((s, i) => (
                                    <div key={i} className="hs-preview-discount-item">
                                        <b>{s.from} → {s.to}:</b> {s.percentage}%
                                    </div>
                                ))}
                            </>
                        )}

                        {d.pricing.discounts.earlyBird.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">Early-bird</h3>
                                {d.pricing.discounts.earlyBird.map((e, i) => (
                                    <div key={i} className="hs-preview-discount-item">
                                        <b>Book ≥ {e.daysBefore} days early →</b> {e.percent}%
                                    </div>
                                ))}
                            </>
                        )}

                    </div>
                </section>

                {/* ========================= */}
                {/*   RULES & SAFETY          */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Rules & Safety</h2>

                    <div className="hs-preview-card">
                        {d.houseRules.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">House rules</h3>
                                {d.houseRules.map((r, i) => (
                                    <div key={i}>✔ {r.label}</div>
                                ))}
                            </>
                        )}

                        {Object.keys(QUICK_RULES).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">Quick rules</h3>
                                {Object.keys(QUICK_RULES)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {QUICK_RULES[k]}</div>
                                    ))}
                            </>
                        )}

                        {Object.keys(SAFETY).some(k => d.rules[k]) && (
                            <>
                                <h3 className="hs-preview-subtitle">Safety</h3>
                                {Object.keys(SAFETY)
                                    .filter(k => d.rules[k])
                                    .map((k, i) => (
                                        <div key={i}>✔ {SAFETY[k]}</div>
                                    ))}
                            </>
                        )}

                        {d.rules.selfCheckIn && (
                            <>
                                <h3 className="hs-preview-subtitle">Self check-in</h3>
                                <div>Method: <b>{d.rules.self_checkin_method}</b></div>
                            </>
                        )}
                    </div>
                </section>

                {/* ========================= */}
                {/*   PHOTOS                  */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Photos</h2>

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
