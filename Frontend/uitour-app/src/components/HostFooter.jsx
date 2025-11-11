import React from "react";
import "./HostFooter.css";
import { useNavigate } from "react-router-dom";

export default function HostFooter({ prevPath, nextPath, isLast, disabledNext, onPublish }) {
  const navigate = useNavigate();

  const handleNextClick = () => {
    if (isLast) {
      if (onPublish) onPublish(); // ✅ gọi publish từ layout
    } else if (nextPath) {
      navigate(nextPath);
    }
  };


  return (
    <footer className="hfooter">
      <div className="hfooter-container">
        <button
          className="hfooter-btn"
          onClick={() => prevPath && navigate(prevPath)}
          disabled={!prevPath}
        >
          Back
        </button>

        <button
          className={`hfooter-btn hfooter-next ${(disabledNext || (!nextPath && !isLast)) ? "disabled" : ""}`}
          onClick={handleNextClick}
          disabled={!!disabledNext || (!nextPath && !isLast)}
        >
          {isLast ? "Publish" : "Next"}
        </button>
      </div>
      {/* Optionally, show error/info below Next if disabledNext is true */}
      {disabledNext && (
        <div className="hfooter-warning">Vui lòng nhập đầy đủ thông tin để tiếp tục!</div>
      )}
    </footer>
  );
}
