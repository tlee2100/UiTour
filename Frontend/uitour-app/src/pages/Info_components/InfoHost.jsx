import React from "react";
import SvgIcon from "../../components/SvgIcon";
import "./InfoHost.css";

{/* --------- Temp host avatar ------------ */}
import AvatarImage from "../../assets/mockdata/images/avatar.png"; // Assuming you have an avatar image

export default function InfoHost() {
  return (
    <section className="ih-container">
      {/* Header */}
      <div className="ih-header">
        {/* User */}
        <div className="ih-user">
          <div className="ih-avatar">
            <div className="ih-avatar-base" />
            <img src={AvatarImage} alt="Host Avatar" className="ih-avatar-img" />
            <SvgIcon name="superhost" className="ih-badge"></SvgIcon>
          </div>

          {/* Title + Subtitle */}
          <div className="ih-title-box">
            <div className="ih-title">Tèo Hoàng</div>
            <div className="ih-subtitle">HieuChuNhat's best friend</div>
          </div>
        </div>

        {/* Details */}
        <div className="ih-details">
          <div className="ih-icontext">
            <SvgIcon name="star" className="ih-icon ih-star"></SvgIcon>
            <div className="ih-text">36 reviews</div>
          </div>
          <div className="ih-icontext">
            <SvgIcon name="verified" className="ih-icon ih-shield"></SvgIcon>
            <div className="ih-text">Identity verified</div>
          </div>
          <div className="ih-icontext">
            <SvgIcon name="badge" className="ih-icon ih-badge-icon"></SvgIcon>
            <div className="ih-text">Superhost</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="ih-description">
        <div className="ih-line ih-line-title">Tèo is a Superhost</div>
        <div className="ih-line ih-line-desc">
          Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
        </div>
      </div>
    </section>
  );
}
