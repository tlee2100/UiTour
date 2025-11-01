import { useState, useEffect } from "react";
import "./ExpGallery.css";

export default function ExpGallery({ images }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!Array.isArray(images)) images = [];

    const openModal = (index) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeModal = () => setIsOpen(false);

    const showPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const showNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Đóng bằng phím ESC
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowRight") showNext(e);
            if (e.key === "ArrowLeft") showPrev(e);
        };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen]);

    return (
        <>
            {/* HIỂN THỊ GALLERY 4 ẢNH */}
            <div className="expGallery-grid">
                {images.slice(0, 4).map((src, i) => (
                    <div key={i} className="expGallery-item" onClick={() => openModal(i)}>
                        <img src={src} alt={`gallery-${i}`} />
                        {i === 3 && images.length > 4 && (
                            <div className="expGallery-overlay">+{images.length - 4}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL HIỂN THỊ FULLSCREEN */}
            {isOpen && (
                <div className="expGallery-modal" onClick={closeModal}>
                    <button className="expGallery-close" onClick={closeModal}>✕</button>

                    <button className="expGallery-nav left" onClick={showPrev}>‹</button>

                    <div className="expGallery-modalImgWrapper">
                        <img
                            className="expGallery-modalImg"
                            src={images[currentIndex]}
                            alt="full-view"
                        />
                    </div>


                    <button className="expGallery-nav right" onClick={showNext}>›</button>
                </div>
            )}
        </>
    );
}
