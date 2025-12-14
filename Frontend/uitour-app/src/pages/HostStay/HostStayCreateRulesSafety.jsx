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
    { id: "no_food_in_bedrooms", label: t(language, "hostStay.rules.house.noFoodBedrooms") },
    { id: "no_smoking", label: t(language, "hostStay.rules.quick.noSmoking") },
    { id: "no_open_flames", label: t(language, "hostStay.rules.quick.noFlames") },
    { id: "pets_allowed", label: t(language, "hostStay.rules.quick.petsAllowed") }
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

  const toggleSafety = (key) => {
    updateField("safety", {
      [key]: !stayData[key]
    });
  };
  console.log("SAFETY STATE", {
    covidSafety: stayData.covidSafety,
    surfacesSanitized: stayData.surfacesSanitized,
    carbonMonoxideAlarm: stayData.carbonMonoxideAlarm,
    smokeAlarm: stayData.smokeAlarm,
  });
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
              {stayData.checkin_after || "14:00"}
            </span>
          </div>

          <div className="hs-rs-row disabled">
            <span>{t(language, "hostStay.rules.checkInOut.before")}</span>
            <span className="hs-rs-fixed-text">
              {stayData.checkout_before || "11:00"}
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


        {/* SAFETY */}
        <h2 className="hs-rs-section-title">
          {t(language, "hostStay.rules.safety.title")}
        </h2>

        <div className="hs-rs-list">

          <div
            className={`hs-rs-row ${stayData.covidSafety ? "is-selected" : ""}`}
            onClick={() => toggleSafety("covidSafety")}
          >
            <span>{t(language, "hostStay.rules.safety.enhancedCleaning")}</span>
            <input
              type="checkbox"
              checked={!!stayData.covidSafety}
              readOnly
              className="hs-rs-toggle"
            />
          </div>

          <div
            className={`hs-rs-row ${stayData.surfacesSanitized ? "is-selected" : ""}`}
            onClick={() => toggleSafety("surfacesSanitized")}
          >
            <span>{t(language, "hostStay.rules.safety.sanitized")}</span>
            <input
              type="checkbox"
              checked={!!stayData.surfacesSanitized}
              readOnly
              className="hs-rs-toggle"
            />
          </div>

          <div
            className={`hs-rs-row ${stayData.carbonMonoxideAlarm ? "is-selected" : ""}`}
            onClick={() => toggleSafety("carbonMonoxideAlarm")}
          >
            <span>{t(language, "hostStay.rules.safety.coAlarm")}</span>
            <input
              type="checkbox"
              checked={!!stayData.carbonMonoxideAlarm}
              readOnly
              className="hs-rs-toggle"
            />
          </div>

          <div
            className={`hs-rs-row ${stayData.smokeAlarm ? "is-selected" : ""}`}
            onClick={() => toggleSafety("smokeAlarm")}
          >
            <span>{t(language, "hostStay.rules.safety.smokeAlarm")}</span>
            <input
              type="checkbox"
              checked={!!stayData.smokeAlarm}
              readOnly
              className="hs-rs-toggle"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
