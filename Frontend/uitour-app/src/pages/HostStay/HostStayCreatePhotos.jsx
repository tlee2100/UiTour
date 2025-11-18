import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import "./HostStay.css";

// --- CONVERT FILE → BASE64 ---
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function HostStayCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { stayData, updateField, validateStep } = useHost();

  const photos = stayData.photos || [];
  const [selectedCategory, setSelectedCategory] = useState(null);

  const CATEGORIES = [
    { key: "bedroom", label: "Bedroom", required: true },
    { key: "bathroom", label: "Bathroom", required: true },
    { key: "livingroom", label: "Living Room", required: false },
    { key: "kitchen", label: "Kitchen", required: false },
    { key: "other", label: "Other", required: false },
  ];

  const openPickerFor = (cat) => {
    setSelectedCategory(cat);
    inputRef.current?.click();
  };

  // --- HANDLE SELECT WITH BASE64 ---
  const handleSelect = async (e) => {
    if (!selectedCategory) return;

    const selectedFiles = Array.from(e.target.files);

    const formatted = await Promise.all(
      selectedFiles.map(async (file, index) => ({
        file,
        preview: await fileToBase64(file), // BASE64 HERE
        category: selectedCategory,
        caption: "",
        sortIndex: photos.length + index + 1,
        isCover: false,
      }))
    );

    updateField("photos", { photos: [...photos, ...formatted] });
  };

  // --- HANDLE DROP WITH BASE64 ---
  const handleDrop = async (e, cat) => {
    e.preventDefault();

    const dropped = Array.from(e.dataTransfer.files);

    const formatted = await Promise.all(
      dropped.map(async (file, index) => ({
        file,
        preview: await fileToBase64(file), // BASE64 HERE
        category: cat,
        caption: "",
        sortIndex: photos.length + index + 1,
        isCover: false,
      }))
    );

    updateField("photos", { photos: [...photos, ...formatted] });
  };

  const setAsCover = (photo) => {
    updateField("photos", {
      photos: photos.map((p) => ({
        ...p,
        isCover: p === photo,
      })),
    });
  };

  const autoSelectCover = () => {
    if (photos.some((p) => p.isCover)) return;

    const living = photos.find((p) => p.category === "livingroom");
    if (living) return setAsCover(living);

    const bed = photos.find((p) => p.category === "bedroom");
    if (bed) return setAsCover(bed);

    if (photos.length > 0) setAsCover(photos[0]);
  };

  const handleNext = () => {
    if (!validateStep("photos")) return;

    autoSelectCover();

    navigate("/host/stay/create/title");
  };

  const coverPhoto = photos.find((p) => p.isCover);

  return (
    <div className="hs-page">
      <main className="hs-photo-main" style={{ textAlign: "left", width: "100%" }}>
        <h1 className="hs-photo-title">Add photos for each part of your property</h1>

        {/* COVER PHOTO PREVIEW */}
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
            <p style={{ fontSize: "14px", color: "#666" }}>
              No cover photo selected. A cover will be auto-selected.
            </p>
          )}
        </div>

        {/* CATEGORY SECTIONS */}
        {CATEGORIES.map((cat) => {
          const filtered = photos.filter((p) => p.category === cat.key);

          return (
            <div key={cat.key} style={{ width: "100%", maxWidth: "900px", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>
                {cat.required && <span style={{ color: "red" }}>* </span>}
                {cat.label}
              </h2>

              <div
                className="hs-photo-dropzone"
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
                    <div
                      key={idx}
                      className="hs-photo-thumb"
                      style={{ position: "relative", cursor: "pointer" }}
                      onClick={() => setAsCover(f)}
                    >
                      <img src={f.preview} alt="photo" />

                      {f.isCover && <div className="hs-cover-badge">Cover Photo</div>}
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
