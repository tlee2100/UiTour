import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import "./HostExperience.css";

export default function HostExperienceCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { experienceData, updateField, validateStep } = useHost();
  const files = experienceData.media?.photos || [];

  const handleSelect = (e) => {
    const chosen = Array.from(e.target.files);
    updateField("photos", {
      media: {
        ...experienceData.media,
        photos: [...files, ...chosen]
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files);
    updateField("photos", {
      media: {
        ...experienceData.media,
        photos: [...files, ...dropped]
      },
    });
  };

  const handleNext = () => {
    if (!validateStep("photos")) return;
    navigate("/host/experience/create/describe-title");
  };

  return (
    <div className="he-page">
      <main className="he-main">
        <h1 className="he-title">Add photos that showcase your skills</h1>
        <div
          className="he-photos-dropzone"
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
        >
          <div className="he-photos-placeholder">
            <Icon icon="mdi:camera-outline" width="56" height="56" />
            <button className="he-tertiary-btn" onClick={() => inputRef.current?.click()}>Add photos</button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleSelect(e)}
            />
          </div>
        </div>
        {files.length > 0 && (
          <div className="he-photos-grid">
            {files.map((f, idx) => (
              <div key={idx} className="he-photo-thumb">
                <img src={f.preview ? f.preview : (f instanceof File ? URL.createObjectURL(f) : f)} alt={f.name || `photo${idx}`} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


