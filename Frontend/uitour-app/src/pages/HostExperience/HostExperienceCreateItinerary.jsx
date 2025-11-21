// HostExperienceCreateItinerary.jsx — FIXED (keeps RAM previews after save)
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostExperience.css";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export default function HostExperienceCreateItinerary() {
  const navigate = useNavigate();
  const {
    experienceData,
    updateField,
    validateStep,
    experienceItineraryRAM,
    setExperienceItineraryRAM,
  } = useHost();

  // Build a quick lookup map for RAM by id (used for safe merging)
  const ramMap = useMemo(() => {
    const m = new Map();
    (experienceItineraryRAM || []).forEach((r) => m.set(r.id, r));
    return m;
  }, [experienceItineraryRAM]);

  // Merge persisted metadata (experienceData.experienceDetails) with RAM previews
  // image priority: RAM.preview (base64) -> RAM.file (createObjectURL) -> serverUrl -> null
  const activities = (experienceData.experienceDetails || []).map((item) => {
    const ram = ramMap.get(item.id);
    let image = null;
    if (ram?.preview) image = ram.preview;
    else if (ram?.file) {
      try {
        image = URL.createObjectURL(ram.file);
      } catch {
        image = null;
      }
    } else if (item.photo?.serverUrl) image = item.photo.serverUrl;
    return {
      ...item,
      image,
      _file: ram?.file || null,
    };
  });

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // image state for editor — contains { preview, file, name, caption, serverUrl }
  const [image, setImage] = useState(null);

  const inputRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  // START ADD
  const startAdd = () => {
    setEditing(true);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);
  };

  // START EDIT
  const startEdit = (item) => {
    setEditing(true);
    setEditingId(item.id);
    setTitle(item.title || "");
    setContent(item.content || "");

    const ram = ramMap.get(item.id);
    // prefer RAM preview -> RAM file (as blob URL) -> serverUrl
    if (ram?.preview) {
      setImage({
        preview: ram.preview,
        file: ram.file || null,
        name: item.photo?.name || "",
        caption: item.photo?.caption || "",
        serverUrl: item.photo?.serverUrl || "",
      });
    } else if (ram?.file) {
      // show createObjectURL for file in editor if no base64 preview available
      let blobUrl = null;
      try {
        blobUrl = URL.createObjectURL(ram.file);
      } catch (err) {
        blobUrl = null;
      }
      setImage({
        preview: blobUrl,
        file: ram.file,
        name: item.photo?.name || "",
        caption: item.photo?.caption || "",
        serverUrl: item.photo?.serverUrl || "",
      });
    } else if (item.photo?.serverUrl) {
      setImage({
        preview: item.photo.serverUrl,
        file: null,
        name: item.photo?.name || "",
        caption: item.photo?.caption || "",
        serverUrl: item.photo?.serverUrl || "",
      });
    } else {
      setImage(null);
    }
  };

  // FILE PICK
  const onPick = async (e) => {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const base64 = await fileToBase64(f);
      setImage({ preview: base64, file: f, name: f.name, caption: "", serverUrl: "" });
    } catch (err) {
      console.error("file read error", err);
      setToast("Cannot read file");
    }
  };

  // SAVE ACTIVITY
  const saveActivity = () => {
    if (!title.trim() || !content.trim()) {
      setToast("Please provide title and details");
      return;
    }

    const id = editingId ?? Date.now();

    // UI-level object (may include preview/file)
    const activityForUI = {
      id,
      title,
      content,
      photo: image
        ? {
            preview: image.preview || null,
            file: image.file || null,
            name: image.name || image.file?.name || "",
            caption: image.caption || "",
            serverUrl: image.serverUrl || "",
          }
        : null,
    };

    // Build new UI activities array (used to compute cleaned data)
    const newActivities = editingId
      ? activities.map((a) => (a.id === editingId ? activityForUI : a))
      : [...activities, activityForUI];

    // --- Build/merge RAM map locally so we can persist previews safely ---
    const nextRamMap = new Map(ramMap); // clone current RAM entries
    if (image && (image.preview || image.file)) {
      // set/overwrite this id's ram entry with latest preview/file
      nextRamMap.set(id, { id, preview: image.preview || null, file: image.file || null });
    } else {
      // if UI didn't provide image (e.g. user removed image) -> keep existing nextRamMap as-is
      if (!nextRamMap.has(id) && activityForUI.photo === null) {
        nextRamMap.set(id, { id, preview: null, file: null });
      }
    }

    // Convert nextRamMap to array to store into RAM state
    const nextRamArray = Array.from(nextRamMap.values());

    // 1) update RAM state immediately
    setExperienceItineraryRAM(nextRamArray);

    // 2) create cleaned array for context (strip preview/file for metadata)
    const cleanedForContext = newActivities.map((a) => {
      const existing = (experienceData.experienceDetails || []).find((x) => x.id === a.id);

      if (!a.photo) {
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          photo: existing?.photo ? { ...existing.photo } : null,
        };
      }

      return {
        id: a.id,
        title: a.title,
        content: a.content,
        photo: {
          name: a.photo.name || "",
          caption: a.photo.caption || "",
          serverUrl: a.photo.serverUrl || "",
        },
      };
    });

    // 3) Build values passed to updateField so context can both persist metadata
    //    and also derive RAM entries (we include preview/file into the object we pass,
    //    so context's setExperienceItineraryRAM (if it sets RAM from values) will pick them up).
    const valuesForContext = cleanedForContext.map((meta) => {
      const ramEntry = nextRamMap.get(meta.id);
      return {
        ...meta,
        // attach photo.preview & photo.file so context can reconstruct RAM if it uses values to set RAM
        photo: {
          ...(meta.photo || {}),
          preview: ramEntry?.preview ?? null,
          file: ramEntry?.file ?? null,
        },
      };
    });

    // 4) send to context (context will save metadata; because we included preview/file on `valuesForContext`
    //    any logic in context that creates RAM entries from values will preserve their preview/file)
    updateField("itinerary", valuesForContext);

    // Reset editor UI
    setEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);
    setToast("Saved");
  };

  // DELETE
  const handleContextDelete = (id, e) => {
    e.preventDefault();
    setConfirmId(id);
  };

  const confirmDelete = () => {
    const id = confirmId;
    if (!id) return;

    // Remove RAM preview first
    setExperienceItineraryRAM((prev = []) => prev.filter((r) => r.id !== id));

    // Remove from persisted metadata
    const newActivities = (experienceData.experienceDetails || []).filter((a) => a.id !== id);
    // Context expects an array for itinerary step; it will map accordingly
    updateField("itinerary", newActivities);

    // Reset editor
    setEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);

    setConfirmId(null);
    setToast("Activity deleted");
  };

  const handleNext = () => {
    if (!validateStep("itinerary")) {
      setToast("Please add at least one activity");
      return;
    }
    navigate("/host/experience/create/max-guests");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Your itinerary</h1>

        <div className="he-itinerary">
          {activities.map((a) => (
            <div key={a.id}>
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
                      <Icon icon="mdi:image-outline" width={18} height={18} />
                    </div>
                  )}
                </div>

                <div className="he-activity-body">
                  <div className="he-activity-title">{a.title}</div>
                  <div className="he-activity-content">{a.content}</div>
                </div>
              </div>

              {editing && editingId === a.id && (
                <div className="he-activity-editor he-editor-inline">
                  <div className="he-editor-left">
                    <div
                      className="he-editor-thumb"
                      onClick={() => inputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                    >
                      {image ? (
                        <img src={image.preview || image.serverUrl} alt="preview" />
                      ) : (
                        <Icon icon="mdi:camera-outline" width={32} height={32} />
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
                          setTitle("");
                          setContent("");
                          setImage(null);
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

          {/* Add new button */}
          {!editing && (
            <div style={{ marginTop: 18 }}>
              <button className="he-add-activity" onClick={startAdd}>
                <span className="he-add-icon">+</span>
                Add Activity
              </button>
            </div>
          )}

          {/* Inline editor for new activity */}
          {editing && editingId === null && (
            <div className="he-activity-editor">
              <div className="he-editor-left">
                <div className="he-editor-thumb" onClick={() => inputRef.current?.click()}>
                  {image ? <img src={image.preview || image.serverUrl} alt="preview" /> : <Icon icon="mdi:camera-outline" width={32} height={32} />}
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
                      setTitle("");
                      setContent("");
                      setImage(null);
                    }}
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

      {/* Confirm delete modal */}
      {confirmId && (
        <div className="he-modal" role="dialog" aria-modal="true">
          <div className="he-modal-backdrop" onClick={() => setConfirmId(null)} />
          <div className="he-modal-card he-confirm-modal">
            <div className="he-modal-header">
              <div className="he-modal-title">Delete activity</div>
              <button className="he-modal-close" onClick={() => setConfirmId(null)} aria-label="Close">×</button>
            </div>
            <div className="he-modal-body">Are you sure you want to delete this activity?</div>
            <div className="he-modal-footer">
              <button className="he-tertiary-btn" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="he-danger-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="he-toast">{toast}</div>}
    </div>
  );
}
