import { Icon } from "@iconify/react";
import { useState } from "react";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";

export default function HostStayCreateFees() {
  const { stayData, updateField } = useHost();
  const fees = stayData.pricing || {};

  const [activeId, setActiveId] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");


  // ──────────────────────────────────────
  // 1. ITEMS LIST (PRIMARY FEES)
  // ──────────────────────────────────────
  const items_primary = [
    {
      id: "cleaningFee",
      title: "Cleaning fee",
      subtitle: "A fixed cleaning charge per booking",
      icon: "mdi:broom",
      editable: true,
    },
    {
      id: "serviceFee",
      title: "Service fee (%)",
      subtitle: "Platform service fee (locked)",
      icon: "mdi:percent-outline",
      editable: false,
    },
    {
      id: "taxFee",
      title: "Tax fee (%)",
      subtitle: "Government tax (locked)",
      icon: "mdi:cash-plus",
      editable: false,
    },
  ];

  // ──────────────────────────────────────
  // 2. EXTRA PEOPLE FEES
  // ──────────────────────────────────────
  const items_extra = [
    {
      id: "extraPeopleThreshold",
      title: "Extra guest threshold",
      subtitle: "Guests after this number will be charged",
      icon: "mdi:account-multiple-outline",
      editable: true,
    },
    {
      id: "extraPeopleFee",
      title: "Extra guest fee",
      subtitle: "Fee applied per additional guest",
      icon: "mdi:cash",
      editable: true,
    },
  ];

  // ──────────────────────────────────────
  // OPEN MODAL
  // ──────────────────────────────────────
  const openEditor = (id, editable) => {
    if (!editable) return;

    setActiveId(id);

    const v = fees[id];
    // serviceFee, taxFee có kiểu {percent}
    setDraftValue(v?.percent ?? v ?? "");
  };

  const closeEditor = () => {
    setActiveId(null);
    setDraftValue("");
  };

  // ──────────────────────────────────────
  // SAVE VALUE
  // ──────────────────────────────────────
  const saveFee = () => {
    let value = Number(draftValue);
    if (isNaN(value) || value < 0) value = 0;

    // VALIDATE: threshold không được > max guests
    if (errorMsg) return;
    const updated = { ...fees };

    // CLEANING
    if (activeId === "cleaningFee") {
      updated.cleaningFee = value;
    }

    // SERVICE FEE (locked)
    if (activeId === "serviceFee") {
      updated.serviceFee = { type: "percentage", percent: value };
    }

    // TAX FEE (locked)
    if (activeId === "taxFee") {
      updated.taxFee = { type: "percentage", percent: value };
    }

    // EXTRA PEOPLE
    if (activeId === "extraPeopleThreshold") {
      updated.extraPeopleThreshold = value;
    }
    if (activeId === "extraPeopleFee") {
      updated.extraPeopleFee = value;
    }

    // ✔ UPDATE TO CONTEXT — step = "pricing"
    updateField("pricing", updated);

    closeEditor();
  };

  // ──────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────
  return (
    <div className="hs-page">
      <main className="hs-fee-main">

        <h1 className="hs-fee-title">Add fees for your place</h1>

        {/* ───────────── STANDARD FEES ───────────── */}
        <div className="hs-fee-section-title">Standard fees</div>

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

        {/* ───────────── Extra Guests ───────────── */}
        <div className="hs-fee-section-title" style={{ marginTop: 40 }}>
          Additional guest charges
        </div>

        <div className="hs-fee-list">
          {items_extra.map((item) => {
            const v = fees[item.id] ?? 0;
            const showValue =
              item.id === "extraPeopleThreshold"
                ? `${v} guests`
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

        {/* ───────────── MODAL ───────────── */}
        {activeId && (
          <div className="hs-modal">
            <div className="hs-modal-backdrop" onClick={closeEditor} />

            <div className="hs-modal-card">
              <div className="hs-modal-header">
                <div className="hs-modal-title">Set value</div>
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
                        setErrorMsg("Threshold must be at least 1");
                      } else if (val > maxGuests) {
                        setErrorMsg(`Cannot exceed max guests (${maxGuests})`);
                      } else {
                        setErrorMsg("");
                      }
                    }
                  }}
                  className="hs-input"
                />
                {errorMsg && (
                  <div style={{ color: "red", marginTop: "6px", fontSize: "14px" }}>
                    {errorMsg}
                  </div>
                )}
              </div>

              <div className="hs-modal-footer">
                <button className="hs-tertiary-btn" onClick={closeEditor}>
                  Cancel
                </button>
                <button
                  className="hs-primary-btn"
                  onClick={saveFee}
                  disabled={!!errorMsg}
                  style={{ opacity: errorMsg ? 0.5 : 1 }}
                >
                  Save
                </button>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
