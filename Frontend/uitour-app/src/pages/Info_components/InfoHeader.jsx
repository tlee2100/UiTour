import React from "react";
import "./InfoHeader.css"; 
import SvgIcon from "../../components/SvgIcon";

const InfoHeader = () => {
  return (
    <header className="info-header">
      {/* Tiêu đề */}
      <h1 className="info-title">Apartment in Quận Ba Đình</h1>

      {/* Chi tiết */}
      <div className="details">
        {/* Bên trái */}
        <div className="left">
          {/* Rating */}
          <div className="icon-text">
            <SvgIcon name="star" className="icon star-icon"/>
            <span className="text">5.0</span>
          </div>

          <span className="dot" />

          <span className="reviews">7 reviews</span>

          <span className="dot" />

          <div className="icon-text">
            <SvgIcon name="badge" className="icon badge-icon"/>
            <span className="text">Superhost</span>
          </div>

          <span className="dot" />

          <span className="location">Bordeaux, France</span>
        </div>

        {/* Bên phải */}
        <div className="right">
          <button className="icon-button share-button">
            <SvgIcon name="share" className="icon share-icon"/>
            <span className="text">Share</span>
          </button>

          <button className="icon-button save-button">
            <SvgIcon name="heart" className="icon heart-icon"/>
            <span className="text">Save</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default InfoHeader;