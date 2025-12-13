import React, { useEffect } from "react";
import { Icon } from '@iconify/react';
import "./Toast.css";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const iconMap = {
    success: "mdi:check-circle",
    error: "mdi:alert-circle",
    warning: "mdi:alert",
    info: "mdi:information"
  };

  const colorMap = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6"
  };

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} style={{ borderLeftColor: colorMap[type] }}>
      <div className="toast-icon" style={{ color: colorMap[type] }}>
        <Icon icon={iconMap[type]} width="20" height="20" />
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        <Icon icon="mdi:close" width="18" height="18" />
      </button>
    </div>
  );
}

