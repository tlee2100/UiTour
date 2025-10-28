import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = "Đang tải...", size = "medium" }) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
