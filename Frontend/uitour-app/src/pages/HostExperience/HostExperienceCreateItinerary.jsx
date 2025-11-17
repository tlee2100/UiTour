import { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostExperience.css";

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function HostExperienceCreateItinerary() {
  const navigate = useNavigate();
  const { experienceData, updateField, validateStep } = useHost();

  // 🔥 luôn load từ context (draft)
  const activities = experienceData.experienceDetails || [];

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // { preview: base64 }

  const inputRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");



  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // -----------------------------
  // ADD NEW
  // -----------------------------
  const startAdd = () => {
    setEditing(true);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);
  };

  // -----------------------------
  // EDIT
  // -----------------------------
  const startEdit = (item) => {
    setEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setImage(item.image ? { preview: item.image } : null);
  };

  // -----------------------------
  // SAVE
  // -----------------------------
  const saveActivity = () => {
    if (!title.trim() || !content.trim()) return;

    const newItem = {
      id: editingId ?? Date.now(),
      title,
      content,
      image: image ? image.preview : null, // base64
    };

    let newActivities;

    if (editingId) {
      // update
      newActivities = activities.map((a) =>
        a.id === editingId ? newItem : a
      );
    } else {
      // add new
      newActivities = [...activities, newItem];
    }

    updateField("experienceDetails", { experienceDetails: newActivities });

    setEditing(false);
    setEditingId(null);
  };

  // -----------------------------
  // PICK IMAGE (BASE64 FIX)
  // -----------------------------
  const onPick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const base64 = await fileToBase64(f);

    setImage({
      preview: base64, // <---- không dùng blob nữa
      file: f,
    });
  };

  const handleNext = () => {
    if (!validateStep("itinerary")) {
      setToast("Please add at least one activity");
      return;
    }

    navigate("/host/experience/create/max-guests");
  };

  const handleContextDelete = (id, e) => {
    e.preventDefault();
    setConfirmId(id);
  };

  const confirmDelete = () => {
    const newActivities = activities.filter((a) => a.id !== confirmId);
    updateField("experienceDetails", { experienceDetails: newActivities });

    // 🟡 QUAN TRỌNG: reset editor để khôi phục nút Add Activity
    setEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);

    setConfirmId(null);
    setToast("Activity deleted");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Your itinerary</h1>

        <div className="he-itinerary">

          {activities.map((a) => (
            <div key={a.id}>

              {/* ----- ACTIVITY ITEM ----- */}
              <div
                className="he-activity"
                onClick={() => startEdit(a)}
                onContextMenu={(e) => handleContextDelete(a.id, e)}
              >
                <div className="he-activity-thumb">
                  {a.image ? (
                    <img src={a.image} alt={a.title} />
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

              {/* ----- EDITOR NGAY DƯỚI ACTIVITY NÀY ----- */}
              {editing && editingId === a.id && (
                <div className="he-activity-editor he-editor-inline">
                  <div className="he-editor-left">
                    <div
                      className="he-editor-thumb"
                      onClick={() => inputRef.current?.click()}
                    >
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
                      style={{ display: "none" }}
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
                      <button
                        className="he-tertiary-btn"
                        onClick={() => {
                          setEditing(false);
                          setEditingId(null);
                        }}
                      >
                        Cancel
                      </button>

                      {editingId !== null && (
                        <button
                          className="he-danger-btn"
                          onClick={() => setConfirmId(editingId)}
                          style={{ marginLeft: "auto" }}
                        >
                          Delete
                        </button>
                      )}

                      <button className="he-primary-btn" onClick={saveActivity}>
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}

          {/* ----- EDITOR CUỐI CÙNG DÙNG CHO "ADD NEW" ----- */}
          {!editing && (
            <button className="he-add-activity" onClick={startAdd}>
              <span className="he-add-icon">+</span>
              Add Activity
            </button>
          )}

          {editing && editingId === null && (
            <div className="he-activity-editor">
              <div className="he-editor-left">
                <div
                  className="he-editor-thumb"
                  onClick={() => inputRef.current?.click()}
                >
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
                  style={{ display: "none" }}
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
                  <button
                    className="he-tertiary-btn"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                  <button className="he-primary-btn" onClick={saveActivity}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {confirmId && (
        <div className="he-modal" role="dialog" aria-modal="true">
          <div
            className="he-modal-backdrop"
            onClick={() => setConfirmId(null)}
          />
          <div className="he-modal-card he-confirm-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">Delete activity</div>
              <button
                className="he-modal-close"
                onClick={() => setConfirmId(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="he-modal-body">
              Are you sure you want to delete this activity?
            </div>
            <div className="he-modal-footer">
              <button
                className="he-tertiary-btn"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
              <button className="he-danger-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="he-toast">{toast}</div>}
    </div>
  );
}
