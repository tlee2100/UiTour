import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostExperience.css";

export default function HostExperienceCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]); // confirmed files
  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState([]); // files selected in modal, not yet uploaded

  const openPicker = () => inputRef.current?.click();

  const onFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const next = Array.from(fileList);
    setPending((prev) => [...prev, ...next]);
  };

  const removePending = (idx) => {
    setPending((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFiles(e.dataTransfer.files);
  };

  const handleNext = () => {
    // TODO: persist uploaded files
    navigate("/host/experience/create/describe-title");
  };

  return (
    <div className="he-page">
      <header className="he-header">
        <div className="he-brand">
          <img src={logo} alt="UiTour Logo" className="he-logo-img" onClick={() => navigate('/')} />
        </div>
      </header>

      <main className="he-main">
        <h1 className="he-title">Add photos that showcase your skills</h1>

        <div
          className="he-photos-dropzone"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
        >
          <div className="he-photos-placeholder">
            <Icon icon="mdi:camera-outline" width="56" height="56" />
            <button className="he-tertiary-btn" onClick={() => setShowModal(true)}>Add photos</button>
          </div>
        </div>

        {showModal && (
          <div className="he-modal" role="dialog" aria-modal="true">
            <div className="he-modal-backdrop" onClick={() => setShowModal(false)} />
            <div className="he-modal-card he-upload-modal">
              <div className="he-modal-header">
                <div className="he-modal-title">Upload photos</div>
                <button className="he-modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                  <Icon icon="mdi:close" width="18" height="18" />
                </button>
              </div>
              <div className="he-modal-body">
                <div
                  className="he-upload-dropzone"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { handleDrop(e); }}
                >
                  {pending.length === 0 && (
                    <>
                      <Icon icon="mdi:image-outline" width="36" height="36" />
                      <div className="he-upload-hint">You need at least 5 photos</div>
                      <button className="he-primary-btn" onClick={openPicker}>Browse</button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => onFiles(e.target.files)}
                      />
                    </>
                  )}

                  {pending.length > 0 && (
                    <>
                      <div className="he-upload-preview-grid">
                        {pending.map((f, idx) => (
                          <div key={idx} className="he-upload-item">
                            <img src={URL.createObjectURL(f)} alt={f.name} />
                            <button className="he-upload-remove" onClick={() => removePending(idx)} aria-label="Remove">×</button>
                          </div>
                        ))}
                      </div>
                      <button className="he-tertiary-btn" onClick={openPicker}>Add more</button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => onFiles(e.target.files)}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="he-modal-footer he-upload-footer">
                <button className="he-link-btn" onClick={() => { setPending([]); setShowModal(false); }}>Done</button>
                <button
                  className="he-primary-btn"
                  onClick={() => { setFiles((prev) => [...prev, ...pending]); setPending([]); setShowModal(false); }}
                  disabled={pending.length === 0}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="he-photos-grid">
            {files.map((f, idx) => (
              <div key={idx} className="he-photo-thumb">
                <img src={URL.createObjectURL(f)} alt={f.name} />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="he-footer">
        <div className="he-footer-left">
          <button className="he-link-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="he-footer-right">
          <button className="he-primary-btn" onClick={handleNext}>Next</button>
        </div>
      </footer>
    </div>
  );
}


