import { useState, useEffect } from "react";
import "./ExpGallery.css";

export default function ExpGallery({ images }) {
  const formattedImages = Array.isArray(images)
    ? images.map(img => img.url || img) // Fallback nếu BE chưa ổn định
    : [];

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
