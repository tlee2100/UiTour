import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import "./HostStay.css";

export default function HostStayCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // CHỖ SỬA: dùng ref để giữ category qua re-renders
  const selectedCategoryRef = useRef(null);

  // lấy từ Context (RAM ONLY)
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

  // open picker for given category => set ref then open file input
  const openPickerFor = (cat) => {
    selectedCategoryRef.current = cat;
    inputRef.current?.click();
  };

  // --------------------------
  // ADD PHOTOS (from input)
  // --------------------------
  const handleSelect = (e) => {
    const cat = selectedCategoryRef.current;
    // nếu không có category thì bỏ qua (an toàn)
    if (!cat) {
      // reset input so user can pick again
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

    const newList = [...photos, ...formatted];

    // RAM ONLY
    setStayPhotosRAM(newList);

    // metadata only → context (stayData.photos)
    updateField("photos", {
      photos: newList.map((p) => ({
        name: p.file?.name || "",
        caption: p.caption,
        category: p.category,
        sortIndex: p.sortIndex,
        isCover: p.isCover,
        serverUrl: "",
        // note: we intentionally do NOT include preview here to keep payload small
      })),
    });

    // cleanup
    selectedCategoryRef.current = null;
    e.target.value = ""; // allow re-select same file if needed
  };

  // --------------------------
  // DROP PHOTOS
  // --------------------------
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

    const newList = [...photos, ...formatted];

    setStayPhotosRAM(newList);

    updateField("photos", {
      photos: newList.map((p) => ({
        name: p.file?.name || "",
        caption: p.caption,
        category: p.category,
        sortIndex: p.sortIndex,
        isCover: p.isCover,
        serverUrl: "",
      })),
    });
  };

  // rest of file unchanged...
  const setAsCover = (photo) => {
    const newList = photos.map((p) => ({
      ...p,
      isCover: p === photo,
    }));

    setStayPhotosRAM(newList);

    updateField("photos", {
      photos: newList.map((p) => ({
        name: p.file?.name || "",
        caption: p.caption,
        category: p.category,
        sortIndex: p.sortIndex,
        isCover: p.isCover,
        serverUrl: "",
      })),
    });
  };

  const autoSelectCover = () => {
    const hasCover = photos.some((p) => p.isCover);
    if (hasCover) return;

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

  // Auto-select cover whenever photos change, 
  // BUT ONLY IF user has not chosen any cover manually
  useEffect(() => {
    if (!photos || photos.length === 0) return;

    const hasCover = photos.some((p) => p.isCover);
    if (hasCover) return; // user already picked → do not override

    // auto pick:
    const living = photos.find((p) => p.category === "livingroom");
    if (living) return setAsCover(living);

    const bed = photos.find((p) => p.category === "bedroom");
    if (bed) return setAsCover(bed);

    // fallback
    setAsCover(photos[0]);

  }, [photos]);


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

        {/* CATEGORIES */}
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
                  <button
                    className="hs-photo-add-btn"
                    onClick={() => openPickerFor(cat.key)}
                  >
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
