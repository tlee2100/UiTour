import React from "react";
import "./SuccessModal.css";

export default function SuccessModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <h3 className="success-modal-title">✔️ Success!</h3>

        <p className="success-modal-message">{message}</p>

        <button className="success-modal-btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
