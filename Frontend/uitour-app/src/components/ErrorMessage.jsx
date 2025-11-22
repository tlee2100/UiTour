import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = "An error occurred", 
  onRetry = null,
  showRetry = true 
}) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! An error occurred</h3>
      <p className="error-message">{message}</p>
      {showRetry && onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
