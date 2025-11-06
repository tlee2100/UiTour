import { useState, useEffect } from "react";
import "./Gallery.css";

export default function Gallery({ images }) {
  const [showAll, setShowAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Normalize để hỗ trợ cả object[] hoặc string[]
  const normalizedImages = Array.isArray(images)
    ? images.map(img => typeof img === "string" ? img : img.url)
    : [];

  const openModal = (index) => {
    setCurrentIndex(index);
    setShowAll(true);
  };

  const closeModal = () => setShowAll(false);

  const showPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // ✅ Đóng modal bằng ESC + chuyển ảnh bằng mũi tên phím
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrev(e);
      if (e.key === "ArrowRight") showNext(e);
    };

    if (showAll) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showAll]);

  const firstFive = normalizedImages.slice(0, 5);
  const extraCount = normalizedImages.length - 5;

  // ✅ FULLSCREEN MODAL VIEW
  if (showAll) {
    return (
      <div className="gallery-modal" onClick={closeModal}>
        <button className="gallery-close" onClick={closeModal}>✕</button>

        <button className="gallery-arrow left" onClick={showPrev}>‹</button>

        <div className="gallery-full-wrapper">
          <img
            src={normalizedImages[currentIndex]}
            alt="full-view"
            className="gallery-full-image"
          />
        </div>

        <button className="gallery-arrow right" onClick={showNext}>›</button>
      </div>
    );
  }

  // ✅ MAIN GRID VIEW
  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {firstFive.map((src, i) => (
          <div
            key={i}
            className={`gallery-item ${i === 0 ? "large" : ""}`}
            onClick={() => openModal(i)}
          >
            <img src={src} alt={`photo-${i}`} loading="lazy" />
            {i === 4 && extraCount > 0 && (
              <div className="overlay">+{extraCount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
