import { Icon } from "@iconify/react";
import { useState } from "react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateFees() {
  const { stayData, updateField } = useHost();
  const { language } = useLanguage();

  const fees = stayData.pricing || {};

  const [activeId, setActiveId] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ──────────────────────────────
  // PRIMARY FEES
  // ──────────────────────────────
  const items_primary = [
    {
      id: "cleaningFee",
      title: t(language, "hostStay.fees.cleaning.title"),
      subtitle: t(language, "hostStay.fees.cleaning.subtitle"),
      icon: "mdi:broom",
      editable: true,
    },
    {
      id: "serviceFee",
      title: t(language, "hostStay.fees.service.title"),
      subtitle: t(language, "hostStay.fees.service.subtitle"),
      icon: "mdi:percent-outline",
      editable: false,
    },
    {
      id: "taxFee",
      title: t(language, "hostStay.fees.tax.title"),
      subtitle: t(language, "hostStay.fees.tax.subtitle"),
      icon: "mdi:cash-plus",
      editable: false,
    },
  ];

  // ──────────────────────────────
  // EXTRA PEOPLE FEES
  // ──────────────────────────────
  const items_extra = [
    {
      id: "extraPeopleThreshold",
      title: t(language, "hostStay.fees.extraThreshold.title"),
      subtitle: t(language, "hostStay.fees.extraThreshold.subtitle"),
      icon: "mdi:account-multiple-outline",
      editable: true,
    },
    {
      id: "extraPeopleFee",
      title: t(language, "hostStay.fees.extraFee.title"),
      subtitle: t(language, "hostStay.fees.extraFee.subtitle"),
      icon: "mdi:cash",
      editable: true,
    },
  ];

  // OPEN MODAL
  const openEditor = (id, editable) => {
    if (!editable) return;

    setActiveId(id);

    const v = fees[id];
    setDraftValue(v?.percent ?? v ?? "");
  };

  const closeEditor = () => {
    setActiveId(null);
    setDraftValue("");
    setErrorMsg("");
  };

  // SAVE VALUE
  const saveFee = () => {
    let value = Number(draftValue);
    if (isNaN(value) || value < 0) value = 0;

    if (errorMsg) return;

    const updated = { ...fees };

    if (activeId === "cleaningFee") {
      updated.cleaningFee = value;
    }

    if (activeId === "serviceFee") {
      updated.serviceFee = { type: "percentage", percent: value };
    }

    if (activeId === "taxFee") {
      updated.taxFee = { type: "percentage", percent: value };
    }

    if (activeId === "extraPeopleThreshold") {
      updated.extraPeopleThreshold = value;
    }
    if (activeId === "extraPeopleFee") {
      updated.extraPeopleFee = value;
    }

    updateField("pricing", updated);
    closeEditor();
  };

  return (
    <div className="hs-page">
      <main className="hs-fee-main">
        <h1 className="hs-fee-title">
          {t(language, "hostStay.fees.title")}
        </h1>

        {/* STANDARD FEES */}
        <div className="hs-fee-section-title">
          {t(language, "hostStay.fees.section.standard")}
        </div>

        <div className="hs-fee-list">
          {items_primary.map((item) => {
            const current = fees[item.id];
            const showValue =
              item.id === "cleaningFee"
                ? `$${current || 0}`
                : `${current?.percent || 0}%`;

            return (
              <button
                key={item.id}
                className={`hs-fee-item ${!item.editable ? "disabled" : ""}`}
                onClick={() => openEditor(item.id, item.editable)}
              >
                <span className="hs-fee-icon">
                  <Icon icon={item.icon} />
                </span>

                <span className="hs-fee-text">
                  <span className="hs-fee-title-small">{item.title}</span>
                  <span className="hs-fee-subtitle">{showValue}</span>
                </span>

                <span className="hs-fee-chevron">
                  {item.editable && <Icon icon="mdi:chevron-right" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* EXTRA GUESTS */}
        <div className="hs-fee-section-title" style={{ marginTop: 40 }}>
          {t(language, "hostStay.fees.section.extra")}
        </div>

        <div className="hs-fee-list">
          {items_extra.map((item) => {
            const v = fees[item.id] ?? 0;
            const showValue =
              item.id === "extraPeopleThreshold"
                ? `${v} ${t(language, "hostStay.fees.unit.guests")}`
                : `$${v}`;

            return (
              <button
                key={item.id}
                className="hs-fee-item"
                onClick={() => openEditor(item.id, true)}
              >
                <span className="hs-fee-icon">
                  <Icon icon={item.icon} />
                </span>

                <span className="hs-fee-text">
                  <span className="hs-fee-title-small">{item.title}</span>
                  <span className="hs-fee-subtitle">{showValue}</span>
                </span>

                <span className="hs-fee-chevron">
                  <Icon icon="mdi:chevron-right" />
                </span>
              </button>
            );
          })}
        </div>

        {/* MODAL */}
        {activeId && (
          <div className="hs-modal">
            <div className="hs-modal-backdrop" onClick={closeEditor} />

            <div className="hs-modal-card">
              <div className="hs-modal-header">
                <div className="hs-modal-title">
                  {t(language, "hostStay.fees.modal.title")}
                </div>
                <button className="hs-modal-close" onClick={closeEditor}>
                  <Icon icon="mdi:close" />
                </button>
              </div>

              <div className="hs-modal-body">
                <input
                  type="number"
                  value={draftValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDraftValue(e.target.value);

                    if (activeId === "extraPeopleThreshold") {
                      const maxGuests = stayData.accommodates ?? 1;

                      if (val < 1) {
                        setErrorMsg(t(language, "hostStay.fees.error.thresholdMin"));
                      } else if (val > maxGuests) {
                        setErrorMsg(
                          t(language, "hostStay.fees.error.thresholdMax")
                            .replace("{{max}}", maxGuests)
                        );
                      } else {
                        setErrorMsg("");
                      }
                    }
                  }}
                  className="hs-input"
                />

                {errorMsg && (
                  <div className="hs-error-text">
                    {errorMsg}
                  </div>
                )}
              </div>

              <div className="hs-modal-footer">
                <button className="hs-tertiary-btn" onClick={closeEditor}>
                  {t(language, "common.cancel")}
                </button>

                <button
                  className="hs-primary-btn"
                  onClick={saveFee}
                  disabled={!!errorMsg}
                >
                  {t(language, "common.save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
