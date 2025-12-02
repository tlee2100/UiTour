import "./InfoThingsToKnow.css";
import { t } from "../../utils/translations";
import { useLanguage } from "../../contexts/LanguageContext";

export default function InfoThingsToKnow({ property }) {
  const { language } = useLanguage();

  if (!property) return null;

  const formatRuleText = (rule) => {
    if (rule.label) return rule.label;

    if (rule.value === true) {
      const text = rule.id.replace(/_/g, " ");
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    return rule.value;
  };

  const rules = property.houseRules ?? [];
  const safety = property.healthAndSafety ?? {};
  const cancellation = property.cancellationPolicy ?? null;

  return (
    <div className="itk-wrapper">
      <div className="itk-title">
        {t(language, "homeThings.title")}
      </div>

      <div className="itk-columns">

        {/* House Rules */}
        <div className="itk-column">
          <div className="itk-heading">
            {t(language, "homeThings.rules.title")}
          </div>

          <div className="itk-list">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <div key={rule.id} className="itk-item">
                  <div className="itk-text">{formatRuleText(rule)}</div>
                </div>
              ))
            ) : (
              <div className="itk-item">
                <div className="itk-text">
                  {t(language, "homeThings.rules.none")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health & Safety */}
        <div className="itk-column">
          <div className="itk-heading">
            {t(language, "homeThings.health.title")}
          </div>

          <div className="itk-list">
            {safety.covidSafety && (
              <div className="itk-item">
                <div className="itk-text">
                  {t(language, "homeThings.health.covid")}
                </div>
              </div>
            )}

            {safety.surfacesSanitized && (
              <div className="itk-item">
                <div className="itk-text">
                  {t(language, "homeThings.health.sanitized")}
                </div>
              </div>
            )}

            <div className="itk-item">
              <div className="itk-text">
                {safety.carbonMonoxideAlarm
                  ? t(language, "homeThings.health.carbonOn")
                  : t(language, "homeThings.health.carbonOff")}
              </div>
            </div>

            <div className="itk-item">
              <div className="itk-text">
                {safety.smokeAlarm
                  ? t(language, "homeThings.health.smokeOn")
                  : t(language, "homeThings.health.smokeOff")}
              </div>
            </div>

            {safety.securityDepositRequired && (
              <div className="itk-item">
                <div className="itk-text">
                  {t(language, "homeThings.health.deposit", {
                    amount: safety.securityDepositAmount,
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="itk-link">
            <span className="itk-link-text">
              {t(language, "homeThings.showMore")}
            </span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="itk-column">
          <div className="itk-heading">
            {t(language, "homeThings.cancel.title")}
          </div>

          {cancellation && cancellation.name ? (
            <>
              <div className="itk-subtext" style={{ fontWeight: "bold" }}>
                {cancellation.name}
              </div>

              <div className="itk-subtext">{cancellation.description}</div>
            </>
          ) : (
            <div className="itk-subtext">
              {t(language, "homeThings.cancel.none")}
            </div>
          )}

          <div className="itk-link">
            <span className="itk-link-text">
              {t(language, "homeThings.cancel.showDetails")}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
