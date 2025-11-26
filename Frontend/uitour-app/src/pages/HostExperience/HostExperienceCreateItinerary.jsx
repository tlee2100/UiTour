import React, { useRef, useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostExperience.css";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
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

  const { language } = useLanguage();

  // RAM map
  const ramMap = useMemo(() => {
    const m = new Map();
    (experienceItineraryRAM || []).forEach((r) => m.set(r.id, r));
    return m;
  }, [experienceItineraryRAM]);

  // Merge metadata + RAM previews
  const activities = (experienceData.experienceDetails || []).map((item) => {
    const ram = ramMap.get(item.id);

    let image = null;
    if (ram?.preview) image = ram.preview;
    else if (ram?.file) {
      try {
        image = URL.createObjectURL(ram.file);
      } catch {}
    } else if (item.photo?.serverUrl) image = item.photo.serverUrl;

    return { ...item, image };
  });

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const inputRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const tmt = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(tmt);
  }, [toast]);

  // =============== ADD ===============
  const startAdd = () => {
    setEditing(true);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);
  };

  // =============== EDIT ===============
  const startEdit = (item) => {
    setEditing(true);
    setEditingId(item.id);
    setTitle(item.title || "");
    setContent(item.content || "");

    const ram = ramMap.get(item.id);

    if (ram?.preview) {
      setImage({
        preview: ram.preview,
        file: ram.file || null,
        name: item.photo?.name || "",
        caption: item.photo?.caption || "",
        serverUrl: item.photo?.serverUrl || "",
      });
    } else if (ram?.file) {
      let blob = null;
      try {
        blob = URL.createObjectURL(ram.file);
      } catch {}
      setImage({
        preview: blob,
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

  // =============== FILE PICK ===============
  const onPick = async (e) => {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const base64 = await fileToBase64(f);
      setImage({
        preview: base64,
        file: f,
        name: f.name,
        caption: "",
        serverUrl: "",
      });
    } catch {
      setToast(t(language, "hostExperience.itinerary.cannotRead"));
    }
  };

  // =============== SAVE ===============
  const saveActivity = () => {
    if (!title.trim() || !content.trim()) {
      setToast(t(language, "hostExperience.itinerary.needTitleDetail"));
      return;
    }

    const id = editingId ?? Date.now();

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

    const newActivities = editingId
      ? activities.map((a) => (a.id === editingId ? activityForUI : a))
      : [...activities, activityForUI];

    const nextRam = new Map(ramMap);
    if (image) {
      nextRam.set(id, {
        id,
        preview: image.preview || null,
        file: image.file || null,
      });
    }

    setExperienceItineraryRAM(Array.from(nextRam.values()));

    const cleanedForContext = newActivities.map((a) => {
      const exists = (experienceData.experienceDetails || []).find(
        (x) => x.id === a.id
      );

      if (!a.photo) {
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          photo: exists?.photo ? { ...exists.photo } : null,
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

    const valuesForContext = cleanedForContext.map((meta) => {
      const ramEntry = nextRam.get(meta.id);
      return {
        ...meta,
        photo: {
          ...(meta.photo || {}),
          preview: ramEntry?.preview ?? null,
          file: ramEntry?.file ?? null,
        },
      };
    });

    updateField("itinerary", valuesForContext);

    setEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);

    setToast(t(language, "hostExperience.itinerary.saved"));
  };

  // =============== DELETE ===============
  const handleContextDelete = (id, e) => {
    e.preventDefault();
    setConfirmId(id);
  };

  const confirmDelete = () => {
    const id = confirmId;
    if (!id) return;

    setExperienceItineraryRAM((prev = []) => prev.filter((r) => r.id !== id));

    const newList = (experienceData.experienceDetails || []).filter(
      (a) => a.id !== id
    );
    updateField("itinerary", newList);

    setEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setImage(null);
    setConfirmId(null);

    setToast(t(language, "hostExperience.itinerary.deleted"));
  };

  const handleNext = () => {
    if (!validateStep("itinerary")) {
      setToast(t(language, "hostExperience.itinerary.errNoActivities"));
      return;
    }
    navigate("/host/experience/create/max-guests");
  };

  // =============== UI ===============
  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">
          {t(language, "hostExperience.itinerary.title")}
        </h1>

        <div className="he-photo-warning">
          ⚠️ {t(language, "hostExperience.itinerary.photoWarning")}
        </div>

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
                      <Icon icon="mdi:image-outline" width={18} />
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
                    >
                      {image ? (
                        <img src={image.preview || image.serverUrl} alt="preview" />
                      ) : (
                        <Icon icon="mdi:camera-outline" width={32} />
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
                      value={title}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.length <= 50) setTitle(v);
                      }}
                      placeholder={t(
                        language,
                        "hostExperience.itinerary.activityTitlePlaceholder"
                      )}
                    />
                    <div className="he-char-count">{title.length}/50</div>

                    <textarea
                      className="he-editor-content"
                      rows={3}
                      value={content}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.length <= 150) setContent(v);
                      }}
                      placeholder={t(
                        language,
                        "hostExperience.itinerary.activityContentPlaceholder"
                      )}
                    />
                    <div className="he-char-count">{content.length}/150</div>

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
                        {t(language, "common.cancel")}
                      </button>

                      {editingId !== null && (
                        <button
                          className="he-danger-btn"
                          onClick={() => setConfirmId(editingId)}
                          style={{ marginLeft: "auto" }}
                        >
                          {t(language, "hostExperience.itinerary.delete")}
                        </button>
                      )}

                      <button className="he-primary-btn" onClick={saveActivity}>
                        {t(language, "common.save")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!editing && (
            <div style={{ marginTop: 18 }}>
              <button className="he-add-activity" onClick={startAdd}>
                <span className="he-add-icon">+</span>
                {t(language, "hostExperience.itinerary.addActivity")}
              </button>
            </div>
          )}

          {editing && editingId === null && (
            <div className="he-activity-editor">
              <div className="he-editor-left">
                <div
                  className="he-editor-thumb"
                  onClick={() => inputRef.current?.click()}
                >
                  {image ? (
                    <img src={image.preview || image.serverUrl} alt="preview" />
                  ) : (
                    <Icon icon="mdi:camera-outline" width={32} />
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
                  value={title}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 50) setTitle(v);
                  }}
                  placeholder={t(
                    language,
                    "hostExperience.itinerary.activityTitlePlaceholder"
                  )}
                />
                <div className="he-char-count">{title.length}/50</div>

                <textarea
                  className="he-editor-content"
                  rows={3}
                  value={content}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 150) setContent(v);
                  }}
                  placeholder={t(
                    language,
                    "hostExperience.itinerary.activityContentPlaceholder"
                  )}
                />
                <div className="he-char-count">{content.length}/150</div>

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
                    {t(language, "common.cancel")}
                  </button>

                  <button className="he-primary-btn" onClick={saveActivity}>
                    {t(language, "common.save")}
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
              <div className="he-modal-title">
                {t(language, "hostExperience.itinerary.modalDeleteTitle")}
              </div>
              <button
                className="he-modal-close"
                onClick={() => setConfirmId(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="he-modal-body">
              {t(language, "hostExperience.itinerary.modalDeleteContent")}
            </div>

            <div className="he-modal-footer">
              <button
                className="he-tertiary-btn"
                onClick={() => setConfirmId(null)}
              >
                {t(language, "common.cancel")}
              </button>

              <button className="he-danger-btn" onClick={confirmDelete}>
                {t(language, "hostExperience.itinerary.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="he-toast">{toast}</div>}
    </div>
  );
}
