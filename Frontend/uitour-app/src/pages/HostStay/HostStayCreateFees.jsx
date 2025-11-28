import { Icon } from "@iconify/react";
import { useState } from "react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function HostStayCreateFees() {
  const { stayData, updateField } = useHost();
  const { language } = useLanguage();
  const { format, convertToCurrent, convertToUSD, currency } = useCurrency();

  const fees = stayData.pricing || {};

  const [activeId, setActiveId] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // FIELD IS MONEY?
  const isMoneyField = (id) =>
    id === "cleaningFee" || id === "extraPeopleFee";

  // OPEN MODAL
  const openEditor = (id, editable) => {
    if (!editable) return;

    setActiveId(id);

    const v = fees[id];

    // percentage fields
    if (id === "serviceFee" || id === "taxFee") {
      setDraftValue(v?.percent ?? "");
      return;
    }

    // threshold (guests)
    if (id === "extraPeopleThreshold") {
      setDraftValue(v ?? "");
      return;
    }

    // money fields → convert USD → display currency
    if (isMoneyField(id)) {
      const usd = v ?? 0;
      const displayVal = convertToCurrent(usd);

      setDraftValue(
        currency === "VND"
          ? String(Math.round(displayVal))
          : String(Number(displayVal).toFixed(2))
      );
      return;
    }

    setDraftValue(v ?? "");
  };

  const closeEditor = () => {
    setActiveId(null);
    setDraftValue("");
    setErrorMsg("");
  };

  // SAVE
  const saveFee = () => {
    let val = Number(draftValue);
    if (isNaN(val) || val < 0) val = 0;
    if (errorMsg) return;

    const updated = { ...fees };

    // MONEY → convert display currency -> USD
    if (activeId === "cleaningFee") {
      const usd = convertToUSD(val);
      updated.cleaningFee = Number(usd.toFixed(2));
    }

    if (activeId === "extraPeopleFee") {
      const usd = convertToUSD(val);
      updated.extraPeopleFee = Number(usd.toFixed(2));
    }

    // percentage
    if (activeId === "serviceFee") {
      updated.serviceFee = { type: "percentage", percent: val };
    }
    if (activeId === "taxFee") {
      updated.taxFee = { type: "percentage", percent: val };
    }

    // threshold guests
    if (activeId === "extraPeopleThreshold") {
      updated.extraPeopleThreshold = val;
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
          {[
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
          ].map((item) => {
            const current = fees[item.id];

            const showValue =
              item.id === "cleaningFee"
                ? format(convertToCurrent(current || 0))
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
          {[
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
          ].map((item) => {
            const v = fees[item.id] ?? 0;

            const showValue =
              item.id === "extraPeopleThreshold"
                ? `${v} ${t(language, "hostStay.fees.unit.guests")}`
                : format(convertToCurrent(v));

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
                    const valRaw = e.target.value;
                    const val = Number(valRaw);
                    setDraftValue(valRaw);

                    if (activeId === "extraPeopleThreshold") {
                      const maxGuests = stayData.accommodates ?? 1;

                      if (val < 1) {
                        setErrorMsg(t(language, "hostStay.fees.error.thresholdMin"));
                      } else if (val > maxGuests) {
                        setErrorMsg(
                          t(language, "hostStay.fees.error.thresholdMax").replace(
                            "{{max}}",
                            maxGuests
                          )
                        );
                      } else {
                        setErrorMsg("");
                      }
                    }
                  }}
                  className="hs-input"
                />

                {errorMsg && <div className="hs-error-text">{errorMsg}</div>}
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
