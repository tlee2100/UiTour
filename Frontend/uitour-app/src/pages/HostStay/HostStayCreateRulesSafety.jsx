import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateRulesSafety() {
    const navigate = useNavigate();
    const { stayData, updateField } = useHost();
    const [showSelect, setShowSelect] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const selectWrapperRef = useRef(null);


    const rules = stayData.rules || {};
    const houseRules = stayData.houseRules || [];

    const defaultHouseRules = [
        { id: "quiet_hours", label: "Quiet hours (22:00 – 07:00)" },
        { id: "no_parties", label: "No parties or events" },
        { id: "no_visitors", label: "No unregistered guests" },
        { id: "no_children", label: "Not suitable for children" },
        { id: "no_shoes_inside", label: "Remove shoes inside" },
        { id: "no_food_in_bedrooms", label: "No food in bedrooms" },
    ];

    // Toggle for houseRules array
    const toggleHouseRule = (id) => {
        let updated = [...houseRules];
        if (updated.some((r) => r.id === id)) {
            updated = updated.filter((r) => r.id !== id);
        } else {
            updated.push(defaultHouseRules.find((x) => x.id === id));
        }
        updateField("houseRules", updated);
    };

    // Toggle for rules object
    const toggleFlag = (key) => {
        updateField("rules", {
            ...rules,
            [key]: !rules[key],
        });
    };

    return (
        <div className="hs-page">
            <div className="hs-main">
                <h1 className="hs-rs-title">House rules & Safety</h1>

                {/* =========================================================
                    CHECK-IN / CHECK-OUT (REQUIRED, NO EDIT)
                ========================================================== */}
                <h2 className="hs-rs-section-title">Check-in & Check-out</h2>

                <div className="hs-rs-list">
                    <div className="hs-rs-row disabled">
                        <span>Check-in after</span>
                        <span className="hs-rs-fixed-text">{stayData.rules?.checkin_after || "14:00"}</span>
                    </div>

                    <div className="hs-rs-row disabled">
                        <span>Check-out before</span>
                        <span className="hs-rs-fixed-text">{stayData.rules?.checkout_before || "11:00"}</span>
                    </div>
                </div>

                {/* HOUSE RULES */}
                <h2 className="hs-rs-section-title">House Rules</h2>
                <div className="hs-rs-grid">
                    {defaultHouseRules.map((rule) => {
                        const selected = houseRules.some((r) => r.id === rule.id);
                        return (
                            <div
                                key={rule.id}
                                className={`hs-rs-row ${selected ? "is-selected" : ""}`}
                                onClick={() => toggleHouseRule(rule.id)}
                            >
                                <span className="hs-rs-label">{rule.label}</span>
                                <input type="checkbox" checked={selected} readOnly className="hs-rs-checkbox" />
                            </div>
                        );
                    })}
                </div>

                {/* QUICK RULES */}
                <h2 className="hs-rs-section-title">Quick Rules</h2>
                <div className="hs-rs-list">

                    <div
                        className={`hs-rs-row ${rules.no_smoking ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("no_smoking")}
                    >
                        <span>No smoking</span>
                        <input type="checkbox" checked={rules.no_smoking} readOnly className="hs-rs-toggle" />
                    </div>

                    <div
                        className={`hs-rs-row ${rules.no_open_flames ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("no_open_flames")}
                    >
                        <span>No open flames (candles, stoves)</span>
                        <input type="checkbox" checked={rules.no_open_flames} readOnly className="hs-rs-toggle" />
                    </div>

                    <div
                        className={`hs-rs-row ${rules.pets_allowed ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("pets_allowed")}
                    >
                        <span>Pets allowed</span>
                        <input type="checkbox" checked={rules.pets_allowed} readOnly className="hs-rs-toggle" />
                    </div>

                </div>

                {/* SAFETY */}
                <h2 className="hs-rs-section-title">Safety & Security</h2>
                <div className="hs-rs-list">

                    <div
                        className={`hs-rs-row ${rules.covidSafety ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("covidSafety")}
                    >
                        <span>Enhanced cleaning</span>
                        <input type="checkbox" checked={rules.covidSafety} readOnly className="hs-rs-toggle" />
                    </div>

                    <div
                        className={`hs-rs-row ${rules.surfacesSanitized ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("surfacesSanitized")}
                    >
                        <span>Surfaces sanitized</span>
                        <input type="checkbox" checked={rules.surfacesSanitized} readOnly className="hs-rs-toggle" />
                    </div>

                    <div
                        className={`hs-rs-row ${rules.carbonMonoxideAlarm ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("carbonMonoxideAlarm")}
                    >
                        <span>Carbon monoxide alarm</span>
                        <input type="checkbox" checked={rules.carbonMonoxideAlarm} readOnly className="hs-rs-toggle" />
                    </div>

                    <div
                        className={`hs-rs-row ${rules.smokeAlarm ? "is-selected" : ""}`}
                        onClick={() => toggleFlag("smokeAlarm")}
                    >
                        <span>Smoke alarm</span>
                        <input type="checkbox" checked={rules.smokeAlarm} readOnly className="hs-rs-toggle" />
                    </div>
                </div>

                {/* =========================================================
    SELF CHECK-IN
========================================================== */}
                <h2 className="hs-rs-section-title">Self check-in</h2>

                <div className="hs-rs-list">

                    {/* Toggle Self-check-in */}
                    <div
                        className={`hs-rs-row ${rules.selfCheckIn ? "is-selected" : ""}`}
                        onClick={() => {
                            updateField("rules", {
                                ...rules,
                                selfCheckIn: !rules.selfCheckIn,
                            });
                            setShowSelect(false);
                        }}
                    >
                        <span>Self check-in available</span>
                        <input type="checkbox" checked={rules.selfCheckIn} readOnly className="hs-rs-toggle" />
                    </div>

                    {rules.selfCheckIn && (
                        <div ref={selectWrapperRef} className="hs-rs-select-wrapper">

                            {/* Display box */}
                            <div
                                className="hs-rs-select-display"
                                onClick={(e) => {
                                    const rect = selectWrapperRef.current.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const dropdownHeight = 220;
                                    setOpenUp(spaceBelow < dropdownHeight);
                                    setShowSelect(!showSelect);
                                }}
                            >
                                {rules.self_checkin_method || "Select method"}

                                {/* Arrow */}
                                <span className={`hs-rs-select-arrow ${showSelect ? "arrow-up" : "arrow-down"}`}>
                                    ⌄
                                </span>
                            </div>

                            {/* Dropdown */}
                            {showSelect && (
                                <div className={`hs-rs-dropdown ${openUp ? "open-up" : "open-down"}`}>
                                    {["Lockbox", "Smart lock", "Keypad", "Building staff", "Other"].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={`hs-rs-dropdown-item ${rules.self_checkin_method === opt ? "active" : ""}`}
                                            onClick={() => {
                                                updateField("rules", {
                                                    ...rules,
                                                    self_checkin_method: opt,
                                                });
                                                setShowSelect(false);
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
