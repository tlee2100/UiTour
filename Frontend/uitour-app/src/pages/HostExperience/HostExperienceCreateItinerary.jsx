import { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreateItinerary() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const inputRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast("") , 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const startAdd = () => {
    setEditing(true);
    setTitle("");
    setContent("");
    setImage(null);
  };

  const saveActivity = () => {
    if (!title.trim() || !content.trim()) return;
    setActivities((prev) => [
      ...prev,
      { id: Date.now(), title, content, image }
    ]);
    setEditing(false);
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) setImage(Object.assign(f, { preview: URL.createObjectURL(f) }));
  };

  const handleNext = () => {
    // TODO: persist activities
    console.log("itinerary", activities);
    navigate("/host/experience/create/max-guests");
  };

  const handleContextDelete = (id, e) => {
    e.preventDefault();
    setConfirmId(id);
  };

  const confirmDelete = () => {
    setActivities((prev) => prev.filter((a) => a.id !== confirmId));
    setConfirmId(null);
    setToast("Activity deleted");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
        <button className="he-tertiary-btn">Save & exit</button>
      </header>

      <main className="he-main">
        <h1 className="he-title">Your itinerary</h1>

        <div className="he-itinerary">
          {activities.map((a) => (
            <div key={a.id} className="he-activity" onContextMenu={(e) => handleContextDelete(a.id, e)}>
              <div className="he-activity-thumb">
                {a.image ? (
                  <img src={a.image.preview || a.image} alt={a.title} />
                ) : (
                  <div className="he-activity-placeholder">
                    <Icon icon="mdi:image-outline" width="18" height="18" />
                  </div>
                )}
              </div>
              <div className="he-activity-body">
                <div className="he-activity-title">{a.title}</div>
                <div className="he-activity-content">{a.content}</div>
              </div>
            </div>
          ))}

          {!editing && (
            <button className="he-add-activity" onClick={startAdd}>
              <span className="he-add-icon">+</span>
              Add Activity
            </button>
          )}

          {editing && (
            <div className="he-activity-editor">
              <div className="he-editor-left">
                <div className="he-editor-thumb" onClick={() => inputRef.current?.click()}>
                  {image ? (
                    <img src={image.preview} alt="preview" />
                  ) : (
                    <Icon icon="mdi:camera-outline" width="32" height="32" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onPick}
                />
              </div>
              <div className="he-editor-right">
                <input
                  className="he-editor-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Activity title"
                />
                <textarea
                  className="he-editor-content"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Activity details"
                />
                <div className="he-editor-actions">
                  <button className="he-tertiary-btn" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="he-primary-btn" onClick={saveActivity}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={handleNext}>Next</button>
        </div>
      </footer>

      {confirmId && (
        <div className="he-modal" role="dialog" aria-modal="true">
          <div className="he-modal-backdrop" onClick={() => setConfirmId(null)} />
          <div className="he-modal-card he-confirm-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">Delete activity</div>
              <button className="he-modal-close" onClick={() => setConfirmId(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="he-modal-body">
              Are you sure you want to delete this activity? This action cannot be undone.
            </div>
            <div className="he-modal-footer">
              <button className="he-tertiary-btn" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="he-danger-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="he-toast" role="status">{toast}</div>
      )}
    </div>
  );
}


