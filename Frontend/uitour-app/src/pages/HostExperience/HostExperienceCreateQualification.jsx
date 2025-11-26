import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostExperienceCreateQualification() {
  const navigate = useNavigate();
  const { experienceData, updateField, type, setFlowType } = useHost();
  const { language } = useLanguage();

  // Ensure correct flow
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type]);

  const [values, setValues] = useState(experienceData.qualifications || {});
  const [activeId, setActiveId] = useState(null);
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    setValues(experienceData.qualifications || {});
  }, [experienceData.qualifications]);

  const items = [
    {
      id: "intro",
      title: t(language, "hostExperience.qualification.intro"),
      subtitle: t(language, "hostExperience.qualification.intro"),
      icon: "mdi:cards-heart-outline"
    },
    {
      id: "expertise",
      title: t(language, "hostExperience.qualification.expertise"),
      subtitle: t(language, "hostExperience.qualification.expertise"),
      icon: "mdi:star-outline"
    },
    {
      id: "recognition",
      title: t(language, "hostExperience.qualification.recognition"),
      subtitle: t(language, "hostExperience.qualification.recognition"),
      icon: "mdi:certificate-outline"
    }
  ];

  const saveEditor = () => {
    const newValues = { ...values, [activeId]: draftText };
    setValues(newValues);

    updateField("qualification", newValues);

    setActiveId(null);
    setDraftText("");
  };

  const openEditor = (id) => {
    setActiveId(id);
    setDraftText(values[id] || "");
  };

  const closeEditor = () => {
    setActiveId(null);
    setDraftText("");
  };

  return (
    <div className="he-page">
      <main className="he-main">

        {/* TITLE */}
        <h1 className="he-title">
          {t(language, "hostExperience.qualification.title")}
        </h1>

        {/* LIST */}
        <div className="he-list">
          {items.map((it) => (
            <button
              key={it.id}
              className="he-list-item"
              onClick={() => openEditor(it.id)}
            >
              <span className="he-list-icon">
                <Icon icon={it.icon} width="18" height="18" />
              </span>

              <span className="he-list-text">
                <span className="he-list-title">{it.title}</span>

                <span className="he-list-subtitle">
                  {values[it.id]
                    ? values[it.id].slice(0, 60)
                    : it.subtitle}
                </span>
              </span>

              <span className="he-list-chevron">
                <Icon icon="mdi:chevron-right" width="18" height="18" />
              </span>
            </button>
          ))}
        </div>

        {/* MODAL */}
        {activeId && (
          <div className="he-modal" role="dialog" aria-modal="true">
            <div className="he-modal-backdrop" onClick={closeEditor} />

            <div className="he-modal-card he-qual-modal-card">

              <div className="he-modal-header">
                <div className="he-modal-title">
                  {t(language, "hostExperience.qualification.addDetails")}
                </div>

                <button
                  className="he-modal-close"
                  onClick={closeEditor}
                  aria-label={t(language, "hostExperience.qualification.close")}
                >
                  <Icon icon="mdi:close" width="18" height="18" />
                </button>
              </div>

              <div className="he-modal-body">
                <textarea
                  className="he-textarea he-qual-textarea"
                  placeholder={t(language, "hostExperience.qualification.writeHere")}
                  value={draftText}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 150) setDraftText(v);
                  }}
                />

                <div className="he-qua-char-count">{draftText.length}/150</div>
              </div>

              <div className="he-modal-footer">
                <button className="he-tertiary-btn" onClick={closeEditor}>
                  {t(language, "common.cancel")}
                </button>

                <button className="he-primary-btn" onClick={saveEditor}>
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
