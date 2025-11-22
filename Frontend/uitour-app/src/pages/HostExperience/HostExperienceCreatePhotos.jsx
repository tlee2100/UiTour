import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import Loading from "../../components/Loading";
import "./HostExperience.css";

// Convert file → base64 preview
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
    experiencePhotosRAM,
    setExperiencePhotosRAM,
    updateField,
    validateStep,
    loadingDraft,
    photosReady,
    setFlowType,
    type,
  } = useHost();

  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type, setFlowType]);

  if (loadingDraft || !photosReady) {
    return <Loading message="Loading your photos..." />;
  }

  const photos = experiencePhotosRAM || [];
  const coverName = experienceData.media?.cover || null;

  // Convert FileList → RAM photo objects
  const prepareFiles = async (fileList) =>
    Promise.all(
      fileList.map(async (file) => ({
        file,
        name: file.name,
        preview: await fileToBase64(file),
        isCover: false,
      }))
    );

  // Sync RAM + Context metadata
  const syncPhotos = (list, newCoverName) => {
    setExperiencePhotosRAM(list);

    const meta = list.map((p, i) => ({
      name: p.name,
      caption: p.caption || "",
      serverUrl: p.serverUrl || "",
      sortIndex: i + 1,
      isCover: p.name === newCoverName,
    }));

    updateField("photos", {
      photos: meta,
      cover: newCoverName,
    });
  };

  // Add Photos
  const handleSelect = async (e) => {
    const selected = await prepareFiles(Array.from(e.target.files));
    const combined = [...photos, ...selected];

    const newCoverName = coverName || combined[0]?.name || null;

    const updated = combined.map((p) => ({
      ...p,
      isCover: p.name === newCoverName,
    }));

    syncPhotos(updated, newCoverName);
  };

  // Drop Photos
  const handleDrop = async (e) => {
    e.preventDefault();
    const dropped = await prepareFiles(Array.from(e.dataTransfer.files));
    const combined = [...photos, ...dropped];

    const newCoverName = coverName || combined[0]?.name || null;

    const updated = combined.map((p) => ({
      ...p,
      isCover: p.name === newCoverName,
    }));

    syncPhotos(updated, newCoverName);
  };

  // Remove Photo
  const removePhoto = (index) => {
    const removed = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);

    let newCoverName = experienceData.media.cover;

    if (removed.name === newCoverName) {
      newCoverName = newPhotos[0]?.name || null;
    }

    const updated = newPhotos.map((p) => ({
      ...p,
      isCover: p.name === newCoverName,
    }));

    syncPhotos(updated, newCoverName);
  };

  // Set Cover
  const setAsCover = (photo) => {
    const updated = photos.map((p) => ({
      ...p,
      isCover: p.name === photo.name,
    }));

    syncPhotos(updated, photo.name);
  };

  const handleNext = () => {
    if (!validateStep("photos")) return;
    navigate("/host/experience/create/describe-title");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Add photos that showcase your skills</h1>
        <div className="he-photo-warning">
          ⚠️ <strong>Warning:</strong> Photos are stored temporarily.
          Reloading or leaving the hosting setup before publishing will cause them to be lost.
        </div>
        {/* DROPZONE */}
        <div
          className={`he-photos-dropzone ${photos.length === 0 ? "large" : "small"}`}
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
                    {p.isCover && <div className="he-photo-cover-badge">Cover</div>}
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
