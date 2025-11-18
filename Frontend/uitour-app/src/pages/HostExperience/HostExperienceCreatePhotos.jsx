import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import Loading from "../../components/Loading";
import "./HostExperience.css";

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function HostExperienceCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const {
    experienceData,
    updateField,
    validateStep,
    loadingDraft,
    photosReady,
    setFlowType,
    type,
  } = useHost();

  // Optional: Set flow type correctly
  useEffect(() => {
    if (type !== "experience") {
      setFlowType("experience");
    }
  }, [type, setFlowType]);

  if (loadingDraft || !photosReady) {
    return <Loading message="Loading your photos..." />;
  }

  const photos = experienceData.media?.photos || [];
  const cover = experienceData.media?.cover || null;

  const prepareFiles = async (fileList) =>
    Promise.all(
      fileList.map(async (file) => ({
        file,
        name: file.name,
        preview: await fileToBase64(file),
        isCover: false,
      }))
    );

  // ADD FILES
  const handleSelect = async (e) => {
    const newPhotos = await prepareFiles(Array.from(e.target.files));
    const combined = [...photos, ...newPhotos];

    const newCover = cover || combined[0]?.preview || null;

    const updated = combined.map((p) => ({
      ...p,
      isCover: p.preview === newCover,
    }));

    updateField("photos", { photos: updated, cover: newCover });
  };

  // DROP FILES
  const handleDrop = async (e) => {
    e.preventDefault();

    const newPhotos = await prepareFiles(Array.from(e.dataTransfer.files));
    const combined = [...photos, ...newPhotos];

    const newCover = cover || combined[0]?.preview || null;

    const updated = combined.map((p) => ({
      ...p,
      isCover: p.preview === newCover,
    }));

    updateField("photos", { photos: updated, cover: newCover });
  };

  // REMOVE PHOTO
  const removePhoto = (index) => {
    const removed = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);

    let newCover = experienceData.media.cover;
    if (removed.preview === newCover) {
      newCover = newPhotos[0]?.preview || null;
    }

    const updated = newPhotos.map((p) => ({
      ...p,
      isCover: p.preview === newCover,
    }));

    updateField("photos", { photos: updated, cover: newCover });
  };

  // SET COVER
  const setAsCover = (photo) => {
    const updated = photos.map((p) => ({
      ...p,
      isCover: p.preview === photo.preview,
    }));

    updateField("photos", { photos: updated, cover: photo.preview });
  };

  // NEXT
  const handleNext = () => {
    if (!validateStep("photos")) return;
    navigate("/host/experience/create/describe-title");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Add photos that showcase your skills</h1>

        {/* DROPZONE */}
        <div
          className={`he-photos-dropzone ${
            photos.length === 0 ? "large" : "small"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="he-photos-placeholder">
            <Icon icon="mdi:camera-outline" width="56" height="56" />
            <button
              className="he-tertiary-btn"
              onClick={() => inputRef.current?.click()}
            >
              Add photos
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleSelect}
            />
          </div>
        </div>

        {/* GRID */}
        {photos.length > 0 && (
          <div className="he-photos-grid">
            {photos.map((p, idx) => (
              <div key={idx} className="he-photo-thumb-wrapper">
                <button
                  className="he-photo-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(idx);
                  }}
                >
                  <Icon icon="mdi:close-circle" width="22" height="22" />
                </button>

                <div
                  className="he-photo-thumb-click"
                  onClick={() => setAsCover(p)}
                >
                  <div className="he-photo-thumb">
                    <img src={p.preview} alt="photo" />
                    {p.isCover && (
                      <div className="he-photo-cover-badge">Cover</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
