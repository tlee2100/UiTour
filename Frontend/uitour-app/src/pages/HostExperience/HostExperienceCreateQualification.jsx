import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateQualification() {
  const navigate = useNavigate();
  const { experienceData, updateField, type, setFlowType } = useHost();

  // Đặt flow là experience
  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type]);

  // Lấy giá trị ban đầu từ context
  const [values, setValues] = useState(experienceData.qualifications || {});
  const [activeId, setActiveId] = useState(null);
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    setValues(experienceData.qualifications || {});
  }, [experienceData.qualifications]);

  const items = [
    { id: "intro", title: "Intro", subtitle: "Intro", icon: "mdi:cards-heart-outline" },
    { id: "expertise", title: "Expertise", subtitle: "Expertise", icon: "mdi:star-outline" },
    { id: "recognition", title: "Recognition", subtitle: "Recognition", icon: "mdi:certificate-outline" },
  ];

  // Khi bấm Save trong modal
  const saveEditor = () => {
    const newValues = { ...values, [activeId]: draftText };
    setValues(newValues);

    // 🔥 SAVE vào context ngay lập tức
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
        <h1 className="he-title">Share your qualifications</h1>

        <div className="he-list">
          {items.map((it) => (
            <button key={it.id} className="he-list-item" onClick={() => openEditor(it.id)}>
              <span className="he-list-icon">
                <Icon icon={it.icon} width="18" height="18" />
              </span>

              <span className="he-list-text">
                <span className="he-list-title">{it.title}</span>

                <span className="he-list-subtitle">
                  {values[it.id] ? values[it.id].slice(0, 60) : it.subtitle}
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
                <div className="he-modal-title">Add details</div>
                <button className="he-modal-close" onClick={closeEditor} aria-label="Close">
                  <Icon icon="mdi:close" width="18" height="18" />
                </button>
              </div>

              {/* BODY */}
              <div className="he-modal-body">
                <textarea
                  className="he-textarea he-qual-textarea"
                  placeholder="Write here..."
                  value={draftText}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 150) setDraftText(v);
                  }}
                />

                <div className="he-qua-char-count">{draftText.length}/150</div>
              </div>

              {/* FOOTER */}
              <div className="he-modal-footer">
                <button className="he-tertiary-btn" onClick={closeEditor}>Cancel</button>
                <button className="he-primary-btn" onClick={saveEditor}>Save</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
