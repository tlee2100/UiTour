import React from "react";
import "./ErrorModal.css";

export default function ErrorModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <h3 className="error-modal-title">⚠️ Incomplete Information</h3>

        <p className="error-modal-message">{message}</p>

        <button className="error-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
