import { useState, useEffect } from "react";
import "./ExpGallery.css";

export default function ExpGallery({ images }) {
  // Helper function to normalize image URL
  const normalizeImageUrl = (url) => {
    if (!url || url.trim().length === 0) return null;
    // If already a full URL (http/https), use as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.trim();
    }
    // If relative path starting with /, prepend backend base URL
    if (url.startsWith('/')) {
      return `http://localhost:5069${url}`;
    }
    // Otherwise, assume it's a relative path and prepend backend base URL
    return `http://localhost:5069/${url}`;
  };

  const formattedImages = Array.isArray(images)
    ? images
        .map(img => {
          const url = img.url || img;
          return normalizeImageUrl(url);
        })
        .filter(url => url !== null) // Remove null/invalid URLs
    : [];
  
  // If no images, show placeholder
  if (formattedImages.length === 0) {
    return (
      <div className="expGallery-grid">
        <div className="expGallery-item" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          minHeight: '400px'
        }}>
          <p style={{ color: '#666' }}>No images available</p>
        </div>
      </div>
    );
  }

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const showPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev =>
      prev === 0 ? formattedImages.length - 1 : prev - 1
    );
  };

  const showNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev =>
      prev === formattedImages.length - 1 ? 0 : prev + 1
    );
  };

  // ✅ ESC + Arrow key navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") showNext(e);
      if (e.key === "ArrowLeft") showPrev(e);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <>
      {/* ✅ Ảnh Preview */}
      <div className="expGallery-grid">
        {formattedImages.slice(0, 4).map((src, i) => (
          <div
            key={src}
            className="expGallery-item"
            onClick={() => openModal(i)}
          >
            <img src={src} alt={`gallery-${i}`} loading="lazy" />

            {i === 3 && formattedImages.length > 4 && (
              <div className="expGallery-overlay">
                +{formattedImages.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Fullscreen Modal */}
      {isOpen && (
        <div className="expGallery-modal" onClick={closeModal}>
          <button className="expGallery-close" onClick={closeModal}>
            ✕
          </button>

          <button className="expGallery-nav left" onClick={showPrev}>
            ‹
          </button>

          <div className="expGallery-modalImgWrapper">
            <img
              className="expGallery-modalImg"
              src={formattedImages[currentIndex]}
              alt="full-view"
            />
          </div>

          <button className="expGallery-nav right" onClick={showNext}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
