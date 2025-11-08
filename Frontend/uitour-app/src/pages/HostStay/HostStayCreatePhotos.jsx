import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreatePhotos() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleSelect = (e) => {
    const chosen = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...chosen]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleNext = () => navigate("/host/stay/create/title");

  return (
    <div className="hs-page">
      {/* HEADER DÙNG CHUNG */}
      <header className="hs-header">
        <img
          src={logo}
          alt="UiTour Logo"
          className="hs-logo"
          onClick={() => navigate("/")}
        />
        <button className="hs-save-btn">Save & Exit</button>
      </header>

      {/* MAIN */}
      <main className="hs-photo-main">
        <h1 className="hs-photo-title">Add some photos of your house</h1>

        <div
          className="hs-photo-dropzone"
          onDragOver={(e) => e.preventDefault()}
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
                <img src={URL.createObjectURL(f)} alt={f.name} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER DÙNG CHUNG */}
      <footer className="hs-footer">
        <button
          className="hs-footer-btn hs-footer-btn--white"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className="hs-footer-btn hs-footer-btn--black"
          onClick={handleNext}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
