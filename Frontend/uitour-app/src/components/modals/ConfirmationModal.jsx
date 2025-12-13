import React from "react";
import { Icon } from '@iconify/react';
import "./ConfirmationModal.css";

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  details = null,
  warning = null,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // 'warning', 'danger', 'info'
  loading = false
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const iconMap = {
    warning: "mdi:alert-circle",
    danger: "mdi:alert-octagon",
    info: "mdi:information"
  };

  const iconColorMap = {
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleBackdropClick}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <div className="confirmation-modal-icon-wrapper" style={{ color: iconColorMap[type] }}>
            <Icon icon={iconMap[type]} width="32" height="32" />
          </div>
          <h3 className="confirmation-modal-title">{title}</h3>
        </div>

        <div className="confirmation-modal-body">
          <p className="confirmation-modal-message">{message}</p>
          
          {details && (
            <div className="confirmation-modal-details">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="confirmation-modal-detail-item">
                  <span className="confirmation-modal-detail-label">{key}:</span>
                  <span className="confirmation-modal-detail-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          {warning && (
            <div className="confirmation-modal-warning">
              <Icon icon="mdi:alert" width="20" height="20" />
              <span>{warning}</span>
            </div>
          )}
        </div>

        <div className="confirmation-modal-actions">
          <button 
            className="confirmation-modal-btn confirmation-modal-btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-modal-btn confirmation-modal-btn-confirm confirmation-modal-btn-${type}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="spinning" width="16" height="16" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

