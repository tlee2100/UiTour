import React from "react";
import StarIcon from "../../assets/icons/star.svg?react";
import HeartIcon from "../../assets/icons/heart.svg?react";
import ShareIcon from "../../assets/icons/share.svg?react";
import BadgeIcon from "../../assets/icons/badge.svg?react";
import "./InfoHeader.css"; 

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
            <StarIcon className="icon star-icon"/>
            <span className="text">5.0</span>
          </div>

          <span className="dot" />

          <span className="reviews">7 reviews</span>

          <span className="dot" />

          <div className="icon-text">
            <BadgeIcon className="icon badge-icon"/>
            <span className="text">Superhost</span>
          </div>

          <span className="dot" />

          <span className="location">Bordeaux, France</span>
        </div>

        {/* Bên phải */}
        <div className="right">
          <div className="icon-text">
            <ShareIcon className="icon share-icon"/>
            <span className="text">Share</span>
          </div>

          <div className="icon-text">
            <HeartIcon className="icon heart-icon"/>
            <span className="text">Save</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InfoHeader;