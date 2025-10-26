import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = "Đã xảy ra lỗi", 
  onRetry = null,
  showRetry = true 
}) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! Có lỗi xảy ra</h3>
      <p className="error-message">{message}</p>
      {showRetry && onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
