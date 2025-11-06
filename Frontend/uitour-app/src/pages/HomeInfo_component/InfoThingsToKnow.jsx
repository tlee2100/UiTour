import "./InfoThingsToKnow.css";

export default function InfoThingsToKnow({ property }) {
  if (!property) return null;
  const formatRuleText = (rule) => {
    if (rule.label) return rule.label;

    if (rule.value === true) {
      const text = rule.id.replace(/_/g, " "); // "no smoking"
      return text.charAt(0).toUpperCase() + text.slice(1); // "No smoking"
    }

    return rule.value;
  };
  const rules = property.houseRules ?? [];
  const safety = property.healthAndSafety ?? {};
  const cancellation = property.cancellationPolicy ?? null;

  return (
    <div className="itk-wrapper">
      <div className="itk-title">Things to know</div>

      <div className="itk-columns">

        {/* ✅ House Rules */}
        <div className="itk-column">
          <div className="itk-heading">House rules</div>
          <div className="itk-list">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <div key={rule.id} className="itk-item">
                  <div className="itk-text">
                    {formatRuleText(rule)}
                  </div>
                </div>
              ))
            ) : (
              <div className="itk-item">
                <div className="itk-text">No specific rules</div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Health & Safety */}
        <div className="itk-column">
          <div className="itk-heading">Health & safety</div>
          <div className="itk-list">
            {safety.covidSafety && (
              <div className="itk-item">
                <div className="itk-text">COVID-19 safety practices apply</div>
              </div>
            )}
            {safety.surfacesSanitized && (
              <div className="itk-item">
                <div className="itk-text">Surfaces sanitized between stays</div>
              </div>
            )}

            <div className="itk-item">
              <div className="itk-text">
                {safety.carbonMonoxideAlarm
                  ? "Carbon monoxide alarm installed"
                  : "No carbon monoxide alarm"}
              </div>
            </div>

            <div className="itk-item">
              <div className="itk-text">
                {safety.smokeAlarm
                  ? "Smoke alarm installed"
                  : "No smoke alarm"}
              </div>
            </div>

            {safety.securityDepositRequired && (
              <div className="itk-item">
                <div className="itk-text">
                  Security deposit: ${safety.securityDepositAmount}
                </div>
              </div>
            )}
          </div>

          <div className="itk-link">
            <span className="itk-link-text">Show more</span>
          </div>
        </div>

        {/* ✅ Cancellation Policy */}
        <div className="itk-column">
          <div className="itk-heading">Cancellation policy</div>
          <div className="itk-subtext">
            {cancellation?.details || "See full policy"}
          </div>

          <div className="itk-link">
            <span className="itk-link-text">Show details</span>
          </div>
        </div>

      </div>
    </div>
  );
}
