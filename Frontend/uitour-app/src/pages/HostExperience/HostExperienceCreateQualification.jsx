import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";
import { useHost } from "../../contexts/HostContext";

export default function HostExperienceCreateQualification() {
  const navigate = useNavigate();
  const { experienceData, updateField } = useHost();

  const [activeId, setActiveId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [values, setValues] = useState(experienceData.qualifications || {});

  const items = [
    { id: "intro", title: "Intro", subtitle: "Intro", icon: "mdi:cards-heart-outline" },
    { id: "expertise", title: "Expertise", subtitle: "Expertise", icon: "mdi:star-outline" },
    { id: "recognition", title: "Recognition", subtitle: "Recognition", icon: "mdi:certificate-outline" }
  ];

  const handleNext = () => {
    updateField("qualification", { qualifications: values });
    navigate("/host/experience/create/locate");
  };

  const openEditor = (id) => {
    setActiveId(id);
    setDraftText(values[id] || "");
  };

  const closeEditor = () => {
    setActiveId(null);
    setDraftText("");
  };

  const saveEditor = () => {
    setValues((prev) => ({ ...prev, [activeId]: draftText }));
    closeEditor();
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
                <span className="he-list-subtitle">{values[it.id] ? values[it.id].slice(0, 60) : it.subtitle}</span>
              </span>
              <span className="he-list-chevron">
                <Icon icon="mdi:chevron-right" width="18" height="18" />
              </span>
            </button>
          ))}
        </div>
        {activeId && (
          <div className="he-modal" role="dialog" aria-modal="true">
            <div className="he-modal-backdrop" onClick={closeEditor} />
            <div className="he-modal-card">
              <div className="he-modal-header">
                <div className="he-modal-title">Add details</div>
                <button className="he-modal-close" onClick={closeEditor} aria-label="Close">
                  <Icon icon="mdi:close" width="18" height="18" />
                </button>
              </div>
              <div className="he-modal-body">
                <textarea
                  className="he-textarea"
                  rows={6}
                  placeholder="Write here..."
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                />
              </div>
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


