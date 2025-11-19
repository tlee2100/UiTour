import React from "react";
import { useHost } from "../../contexts/HostContext";
import { useNavigate } from "react-router-dom";
import "./HostStay.css";

export default function HostStayPreview() {
    const { stayData, sendHostData, stayPhotosRAM } = useHost();  // ⭐ thêm stayPhotosRAM
    const navigate = useNavigate();

    const d = stayData;
    const photos = stayPhotosRAM || [];                           // ⭐ dùng ảnh RAM

    return (
        <div className="hs-preview-page">
            <div className="hs-preview-container">

                {/* ========================= */}
                {/*   COVER + TITLE           */}
                {/* ========================= */}
                <div className="hs-preview-hero">

                    {(() => {
                        let cover = null;

                        // ⭐ 1) lấy ảnh cover từ RAM
                        cover = photos.find(p => p.isCover);

                        // ⭐ 2) fallback bedroom
                        if (!cover) cover = photos.find(p => p.category === "bedroom");

                        // ⭐ 3) fallback bathroom
                        if (!cover) cover = photos.find(p => p.category === "bathroom");

                        // ⭐ 4) fallback đầu tiên
                        if (!cover && photos.length > 0) cover = photos[0];

                        return cover ? (
                            <img
                                src={cover.preview}              // ⭐ preview từ RAM
                                alt="cover"
                                className="hs-preview-cover"
                            />
                        ) : null;
                    })()}

                    <h1 className="hs-preview-title">{d.listingTitle}</h1>
                    <div className="hs-preview-location">
                        📍 {d.location.addressLine}, {d.location.city}, {d.location.country}
                    </div>
                </div>

                {/* ========================= */}
                {/*   BASIC INFO              */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Basic information</h2>
                    <div className="hs-preview-card">
                        <div>🏠 Property type: <b>{d.propertyType}</b></div>
                        <div>🛏 Bedrooms: <b>{d.bedrooms}</b></div>
                        <div>🛌 Beds: <b>{d.beds}</b></div>
                        <div>🛁 Bathrooms: <b>{d.bathrooms}</b></div>
                        <div>👥 Accommodates: <b>{d.accommodates}</b></div>
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
                        <div><b>Lat/Lng</b>: {d.location.lat}, {d.location.lng}</div>
                    </div>
                </section>

                {/* ========================= */}
                {/*   PRICING                 */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Pricing & Fees</h2>
                    <div className="hs-preview-card">
                        <div>💲 Base price: <b>${d.pricing.basePrice}</b></div>
                        <div>📅 Weekend multiplier: <b>{d.pricing.weekendMultiplier}x</b></div>
                        <div>🧹 Cleaning fee: <b>${d.pricing.cleaningFee}</b></div>
                        <div>👤 Extra people fee: <b>${d.pricing.extraPeopleFee}</b></div>
                        <div>👥 Extra threshold: <b>{d.pricing.extraPeopleThreshold} guests</b></div>
                        <div>💼 Service fee: <b>{d.pricing.serviceFee.percent}%</b></div>
                        <div>💸 Tax: <b>{d.pricing.taxFee.percent}%</b></div>
                    </div>
                </section>

                {/* ========================= */}
                {/*   DISCOUNTS               */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">Discounts</h2>

                    <div className="hs-preview-card">
                        <div>📅 Weekly discount: <b>{d.pricing.discounts.weekly.percent}%</b></div>
                        <div>📆 Monthly discount: <b>{d.pricing.discounts.monthly.percent}%</b></div>

                        {/* Seasonal */}
                        {d.pricing.discounts.seasonalDiscounts.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">Seasonal</h3>
                                {d.pricing.discounts.seasonalDiscounts.map((s, i) => (
                                    <div key={i} className="hs-preview-discount-item">
                                        {s.from} → {s.to} : <b>{s.percentage}%</b>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Early Bird */}
                        {d.pricing.discounts.earlyBird.length > 0 && (
                            <>
                                <h3 className="hs-preview-subtitle">Early-bird</h3>
                                {d.pricing.discounts.earlyBird.map((e, i) => (
                                    <div key={i} className="hs-preview-discount-item">
                                        Book ≥ {e.daysBefore} days early → <b>{e.percent}%</b>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </section>

                {/* ========================= */}
                {/*   HOUSE RULES             */}
                {/* ========================= */}
                <section className="hs-preview-section">
                    <h2 className="hs-preview-section-title">House rules</h2>
                    <div className="hs-preview-card">
                        {d.houseRules?.length === 0 && <div>No rules selected</div>}
                        {d.houseRules?.map((r, i) => (
                            <div key={i}>✔ {r.label}</div>
                        ))}
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
                                src={p.preview}                 // ⭐ ảnh từ RAM
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
