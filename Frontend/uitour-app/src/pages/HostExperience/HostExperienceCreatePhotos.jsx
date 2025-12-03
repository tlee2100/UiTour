import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Icon } from "@iconify/react";
import { t } from "../../utils/translations";
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

  const { language } = useLanguage();

  useEffect(() => {
    if (type !== "experience") setFlowType("experience");
  }, [type, setFlowType]);

  if (loadingDraft || !photosReady) {
    return <Loading message={t(language, "hostExperience.photos.loading")} />;
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

  // Sync RAM + Context metadata, including sortIndex
  const syncPhotos = (list) => {
    setExperiencePhotosRAM(list);

    const meta = list.map((p, i) => ({
      name: p.name,
      caption: p.caption || "",
      serverUrl: p.serverUrl || "",
      sortIndex: i + 1,          // ⭐ sortIndex CHUẨN NHẤT
      isCover: i === 0,          // ⭐ Ảnh đầu là cover
    }));

    updateField("photos", {
      photos: meta,
      cover: meta[0]?.name || null, // ⭐ cover name chỉ để UI/BE biết
    });
  };


  // Add Photos
  const handleSelect = async (e) => {
    const selected = await prepareFiles(Array.from(e.target.files));

    let combined = [...photos, ...selected];

    // ⭐ Luôn reorder ảnh cover về đầu
    const cover = combined[0];
    combined = [cover, ...combined.filter(p => p !== cover)]
      .map((p, i) => ({ ...p, isCover: i === 0 }));

    syncPhotos(combined);
  };


  // Drop Photos
  const handleDrop = async (e) => {
    e.preventDefault();
    const dropped = await prepareFiles(Array.from(e.dataTransfer.files));

    let combined = [...photos, ...dropped];

    const cover = combined[0];
    combined = [cover, ...combined.filter(p => p !== cover)]
      .map((p, i) => ({ ...p, isCover: i === 0 }));

    syncPhotos(combined);
  };


  // Remove Photo
  const removePhoto = (index) => {
    let newPhotos = photos.filter((_, i) => i !== index);

    if (newPhotos.length === 0) {
      syncPhotos([]);
      return;
    }

    // ⭐ luôn đặt ảnh đầu tiên làm cover
    const cover = newPhotos[0];
    newPhotos = [cover, ...newPhotos.filter(p => p !== cover)]
      .map((p, i) => ({ ...p, isCover: i === 0 }));

    syncPhotos(newPhotos);
  };


  // Set Cover
  const setAsCover = (photo) => {
    // 1. Tách ảnh được chọn ra
    const others = photos.filter(p => p !== photo);

    // 2. Đưa ảnh được chọn lên đầu
    const ordered = [photo, ...others].map((p, i) => ({
      ...p,
      isCover: i === 0,    // ⭐ Ảnh đầu tiên là cover
    }));

    // 3. Đồng bộ lên RAM + Context với sortIndex mới
    syncPhotos(ordered);
  };


  const handleNext = () => {
    if (!validateStep("photos")) return;
    navigate("/host/experience/create/describe-title");
  };

  return (
    <div className="he-page">
      <main className="he-main">

        <h1 className="he-title">
          {t(language, "hostExperience.photos.title")}
        </h1>

        <div className="he-photo-warning">
          ⚠️ <strong>{t(language, "hostExperience.photos.warningTitle")}</strong>
          {t(language, "hostExperience.photos.warningMessage")}
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
              {t(language, "hostExperience.photos.addPhotos")}
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
                      <div className="he-photo-cover-badge">
                        {t(language, "hostExperience.photos.coverTag")}
                      </div>
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
