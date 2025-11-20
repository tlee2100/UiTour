import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import "./HostStay.css";

export default function HostStayCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // giữ category khi mở file picker
  const selectedCategoryRef = useRef(null);

  const {
    stayPhotosRAM,
    setStayPhotosRAM,
    updateField,
    validateStep,
  } = useHost();

  const photos = stayPhotosRAM || [];

  const CATEGORIES = [
    { key: "bedroom", label: "Bedroom", required: true },
    { key: "bathroom", label: "Bathroom", required: true },
    { key: "livingroom", label: "Living Room", required: false },
    { key: "kitchen", label: "Kitchen", required: false },
    { key: "other", label: "Other", required: false },
  ];

  const openPickerFor = (cat) => {
    selectedCategoryRef.current = cat;
    inputRef.current?.click();
  };

  // ============================
  //  COVER AUTO RULE ENGINE
  // ============================
  const selectDefaultCover = (list) => {
    // RULE 1: ưu tiên bedroom
    const bed = list.filter((p) => p.category === "bedroom");
    if (bed.length > 0) return bed[0];

    // fallback: ảnh đầu tiên
    return list[0] || null;
  };

  const applyCoverRuleIfNeeded = (list) => {
    const hasCover = list.some((p) => p.isCover);
    if (hasCover) return list; // user đã chọn → KHÔNG override

    const defaultCover = selectDefaultCover(list);

    return list.map((p) => ({
      ...p,
      isCover: p === defaultCover,
    }));
  };

  // save photos to Context
  const syncToContext = (list) => {
    updateField("photos", {
      photos: list.map((p) => ({
        name: p.file?.name || "",
        caption: p.caption,
        category: p.category,
        sortIndex: p.sortIndex,
        isCover: p.isCover,
        serverUrl: "",
      })),
    });
  };

  // ============================
  // ADD PHOTOS
  // ============================
  const handleSelect = (e) => {
    const cat = selectedCategoryRef.current;
    if (!cat) {
      e.target.value = "";
      return;
    }

    const selected = Array.from(e.target.files || []);

    const formatted = selected.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      category: cat,
      caption: "",
      sortIndex: photos.length + index + 1,
      isCover: false,
    }));

    let newList = [...photos, ...formatted];

    // áp dụng auto-cover nếu cần
    newList = applyCoverRuleIfNeeded(newList);

    setStayPhotosRAM(newList);
    syncToContext(newList);

    selectedCategoryRef.current = null;
    e.target.value = "";
  };

  // ============================
  // DROP PHOTOS
  // ============================
  const handleDrop = (e, cat) => {
    e.preventDefault();

    const dropped = Array.from(e.dataTransfer.files || []);

    const formatted = dropped.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      category: cat,
      caption: "",
      sortIndex: photos.length + index + 1,
      isCover: false,
    }));

    let newList = [...photos, ...formatted];

    // auto cover nếu chưa có
    newList = applyCoverRuleIfNeeded(newList);

    setStayPhotosRAM(newList);
    syncToContext(newList);
  };

  // ============================
  // SET AS COVER
  // ============================
  const setAsCover = (photo) => {
    const newList = photos.map((p) => ({
      ...p,
      isCover: p === photo,
    }));

    setStayPhotosRAM(newList);
    syncToContext(newList);
  };

  // ============================
  // REMOVE PHOTO (RULE 3 + RULE 4)
  // ============================
  const removePhoto = (photo) => {
    const newList = photos.filter((p) => p !== photo);

    // nếu không xoá cover → giữ nguyên
    if (!photo.isCover) {
      setStayPhotosRAM(newList);
      syncToContext(newList);
      return;
    }

    // nếu xoá đúng cover → auto chọn cover mới (RULE 4)
    let newCover = null;

    // ưu tiên bedroom
    const bed = newList.filter((p) => p.category === "bedroom");
    if (bed.length > 0) newCover = bed[0];

    // fallback
    if (!newCover && newList.length > 0) newCover = newList[0];

    const updated = newList.map((p) => ({
      ...p,
      isCover: p === newCover,
    }));

    setStayPhotosRAM(updated);
    syncToContext(updated);
  };

  // ============================
  // NEXT STEP
  // ============================
  const handleNext = () => {
    if (!validateStep("photos")) return;

    const newList = applyCoverRuleIfNeeded(photos);
    setStayPhotosRAM(newList);
    syncToContext(newList);

    navigate("/host/stay/create/title");
  };

  const coverPhoto = photos.find((p) => p.isCover);

  // ============================
  // UI RENDER
  // ============================
  return (
    <div className="hs-page">
      <main className="hs-photo-main" style={{ textAlign: "left", width: "100%" }}>
        <h1 className="hs-photo-title">Add photos for each part of your property</h1>

        {/* COVER PHOTO */}
        <div style={{ marginBottom: "40px", width: "100%", maxWidth: "900px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "16px" }}>
            Cover Photo
          </h2>

          {coverPhoto ? (
            <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
              <img
                src={coverPhoto.preview}
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "3px solid #000",
                }}
              />
              <p style={{ fontSize: "14px", color: "#555" }}>
                This photo will be used as your listing’s main thumbnail.
              </p>
            </div>
          ) : (
            <p>No cover photo selected yet.</p>
          )}
        </div>

        {CATEGORIES.map((cat) => {
          const filtered = photos.filter((p) => p.category === cat.key);

          return (
            <div key={cat.key} style={{ width: "100%", maxWidth: "900px", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>
                {cat.required && <span style={{ color: "red" }}>* </span>}
                {cat.label}
              </h2>

              <div
                className={`hs-photo-dropzone ${filtered.length === 0 ? "large" : "small"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, cat.key)}
              >
                <div className="hs-photo-center">
                  <Icon icon="solar:camera-outline" width="64" height="64" />
                  <button className="hs-photo-add-btn" onClick={() => openPickerFor(cat.key)}>
                    Add {cat.label} photos
                  </button>
                </div>
              </div>

              {filtered.length > 0 && (
                <div className="hs-photo-preview">
                  {filtered.map((f, idx) => (
                    <div key={idx} className="hs-photo-thumb-wrapper">
                      <button
                        className="hs-photo-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(f);
                        }}
                      >
                        <Icon icon="mdi:close-circle" width="22" height="22" />
                      </button>

                      <div className="hs-photo-thumb-click" onClick={() => setAsCover(f)}>
                        <div className="hs-photo-thumb">
                          <img src={f.preview} alt="photo" />
                          {f.isCover && <div className="hs-cover-badge">Cover Photo</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleSelect}
        />
      </main>
    </div>
  );
}
