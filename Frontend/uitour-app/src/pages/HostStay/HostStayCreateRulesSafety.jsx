import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateRulesSafety() {
  const navigate = useNavigate();
  const { stayData, updateField } = useHost();
  const { language } = useLanguage();

  const [showSelect, setShowSelect] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const selectWrapperRef = useRef(null);

  const rules = stayData.rules || {};
  const houseRules = stayData.houseRules || [];

  const defaultHouseRules = [
    { id: "quiet_hours", label: t(language, "hostStay.rules.house.quietHours") },
    { id: "no_parties", label: t(language, "hostStay.rules.house.noParties") },
    { id: "no_visitors", label: t(language, "hostStay.rules.house.noVisitors") },
    { id: "no_children", label: t(language, "hostStay.rules.house.noChildren") },
    { id: "no_shoes_inside", label: t(language, "hostStay.rules.house.noShoes") },
    { id: "no_food_in_bedrooms", label: t(language, "hostStay.rules.house.noFoodBedrooms") }
  ];

  const toggleHouseRule = (id) => {
    let updated = [...houseRules];
    if (updated.some((r) => r.id === id)) {
      updated = updated.filter((r) => r.id !== id);
    } else {
      updated.push(defaultHouseRules.find((x) => x.id === id));
    }
    updateField("houseRules", updated);
  };

  const toggleFlag = (key) => {
    updateField("rules", {
      ...rules,
      [key]: !rules[key],
    });
  };

  return (
    <div className="hs-page">
      <div className="hs-main">

        <h1 className="hs-rs-title">
          {t(language, "hostStay.rules.title")}
        </h1>

        {/* CHECK-IN / OUT */}
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.checkInOut.title")}
        </h2>

        <div className="hs-rs-list">
          <div className="hs-rs-row disabled">
            <span>{t(language, "hostStay.rules.checkInOut.after")}</span>
            <span className="hs-rs-fixed-text">
              {stayData.rules?.checkin_after || "14:00"}
            </span>
          </div>

          <div className="hs-rs-row disabled">
            <span>{t(language, "hostStay.rules.checkInOut.before")}</span>
            <span className="hs-rs-fixed-text">
              {stayData.rules?.checkout_before || "11:00"}
            </span>
          </div>
        </div>

        {/* HOUSE RULES */}
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.house.title")}
        </h2>

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
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.quick.title")}
        </h2>

        <div className="hs-rs-list">

          <div
            className={`hs-rs-row ${rules.no_smoking ? "is-selected" : ""}`}
            onClick={() => toggleFlag("no_smoking")}
          >
            <span>{t(language, "hostStay.rules.quick.noSmoking")}</span>
            <input type="checkbox" checked={rules.no_smoking} readOnly className="hs-rs-toggle" />
          </div>

          <div
            className={`hs-rs-row ${rules.no_open_flames ? "is-selected" : ""}`}
            onClick={() => toggleFlag("no_open_flames")}
          >
            <span>{t(language, "hostStay.rules.quick.noFlames")}</span>
            <input type="checkbox" checked={rules.no_open_flames} readOnly className="hs-rs-toggle" />
          </div>

          <div
            className={`hs-rs-row ${rules.pets_allowed ? "is-selected" : ""}`}
            onClick={() => toggleFlag("pets_allowed")}
          >
            <span>{t(language, "hostStay.rules.quick.petsAllowed")}</span>
            <input type="checkbox" checked={rules.pets_allowed} readOnly className="hs-rs-toggle" />
          </div>
        </div>

        {/* SAFETY */}
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.safety.title")}
        </h2>

        <div className="hs-rs-list">

          <div
            className={`hs-rs-row ${rules.covidSafety ? "is-selected" : ""}`}
            onClick={() => toggleFlag("covidSafety")}
          >
            <span>{t(language, "hostStay.rules.safety.enhancedCleaning")}</span>
            <input type="checkbox" checked={rules.covidSafety} readOnly className="hs-rs-toggle" />
          </div>

          <div
            className={`hs-rs-row ${rules.surfacesSanitized ? "is-selected" : ""}`}
            onClick={() => toggleFlag("surfacesSanitized")}
          >
            <span>{t(language, "hostStay.rules.safety.sanitized")}</span>
            <input type="checkbox" checked={rules.surfacesSanitized} readOnly className="hs-rs-toggle" />
          </div>

          <div
            className={`hs-rs-row ${rules.carbonMonoxideAlarm ? "is-selected" : ""}`}
            onClick={() => toggleFlag("carbonMonoxideAlarm")}
          >
            <span>{t(language, "hostStay.rules.safety.coAlarm")}</span>
            <input type="checkbox" checked={rules.carbonMonoxideAlarm} readOnly className="hs-rs-toggle" />
          </div>

          <div
            className={`hs-rs-row ${rules.smokeAlarm ? "is-selected" : ""}`}
            onClick={() => toggleFlag("smokeAlarm")}
          >
            <span>{t(language, "hostStay.rules.safety.smokeAlarm")}</span>
            <input type="checkbox" checked={rules.smokeAlarm} readOnly className="hs-rs-toggle" />
          </div>
        </div>

        {/* SELF CHECK-IN */}
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.selfCheckIn.title")}
        </h2>

        <div className="hs-rs-list">

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
            <span>{t(language, "hostStay.rules.selfCheckIn.available")}</span>
            <input type="checkbox" checked={rules.selfCheckIn} readOnly className="hs-rs-toggle" />
          </div>

          {rules.selfCheckIn && (
            <div ref={selectWrapperRef} className="hs-rs-select-wrapper">

              <div
                className="hs-rs-select-display"
                onClick={() => {
                  const rect = selectWrapperRef.current.getBoundingClientRect();
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const dropdownHeight = 220;
                  setOpenUp(spaceBelow < dropdownHeight);
                  setShowSelect(!showSelect);
                }}
              >
                {rules.self_checkin_method || t(language, "hostStay.rules.selfCheckIn.select")}

                <span className={`hs-rs-select-arrow ${showSelect ? "arrow-up" : "arrow-down"}`}>
                  ⌄
                </span>
              </div>

              {showSelect && (
                <div className={`hs-rs-dropdown ${openUp ? "open-up" : "open-down"}`}>

                  {[
                    t(language, "hostStay.rules.selfCheckIn.methods.lockbox"),
                    t(language, "hostStay.rules.selfCheckIn.methods.smartlock"),
                    t(language, "hostStay.rules.selfCheckIn.methods.keypad"),
                    t(language, "hostStay.rules.selfCheckIn.methods.staff"),
                    t(language, "hostStay.rules.selfCheckIn.methods.other"),
                  ].map((opt) => (
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
