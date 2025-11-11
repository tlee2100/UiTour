import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { Icon } from "@iconify/react";
import "./HostStay.css";

export default function HostStayCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { stayData, updateField, validateStep } = useHost();
  // media.photos là danh sách file object hoặc url   
  const files = stayData.media?.photos || [];

  const handleSelect = (e) => {
    const chosen = Array.from(e.target.files);
    updateField("photos", {
      media: {
        ...stayData.media,
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
        ...stayData.media,
        photos: [...files, ...dropped]
      },
    });
  };

  const handleNext = () => {
    if (!validateStep("photos")) return;
    navigate("/host/stay/create/title");
  };

  return (
    <div className="hs-page">
      <main className="hs-photo-main">
        <h1 className="hs-photo-title">Add some photos of your house</h1>
        <div
          className="hs-photo-dropzone"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="hs-photo-center">
            <Icon icon="solar:camera-outline" width="96" height="96" />
            <button
              onClick={() => inputRef.current?.click()}
              className="hs-photo-add-btn"
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
        {files.length > 0 && (
          <div className="hs-photo-preview">
            {files.map((f, idx) => (
              <div key={idx} className="hs-photo-thumb">
                <img src={f.preview ? f.preview : (f instanceof File ? URL.createObjectURL(f) : f)} alt={f.name || `photo${idx}`}/>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
