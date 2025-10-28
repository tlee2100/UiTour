import React from "react";
import SvgIcon from "../../components/SvgIcon";
import "./InfoHost.css";

export default function InfoHost({ host }) {
  // Default values nếu host không có data
  const defaultHost = {
    name: "Host",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    joinedDate: "2020-01-01",
    responseRate: 95,
    responseTime: "within an hour",
    isSuperhost: false,
    totalReviews: 0,
    averageRating: 0,
    languages: ["English"],
    description: "Experienced host committed to providing great stays for guests.",
    ...host
  };

  const { 
    name, 
    avatar, 
    joinedDate, 
    responseRate, 
    responseTime, 
    isSuperhost, 
    totalReviews, 
    averageRating,
    languages,
    description 
  } = defaultHost;

  // Format joined date
  const formatJoinedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <section className="ih-container">
      {/* Header */}
      <div className="ih-header">
        {/* User */}
        <div className="ih-user">
          <div className="ih-avatar">
            <div className="ih-avatar-base" />
            <img 
              src={avatar} 
              alt={`${name} Avatar`} 
              className="ih-avatar-img" 
            />
            {isSuperhost && (
              <SvgIcon name="superhost" className="ih-badge"></SvgIcon>
            )}
          </div>

          {/* Title + Subtitle */}
          <div className="ih-title-box">
            <div className="ih-title">{name}</div>
            <div className="ih-subtitle">
              Joined in {formatJoinedDate(joinedDate)}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="ih-details">
          <div className="ih-icontext">
            <SvgIcon name="star" className="ih-icon ih-star"></SvgIcon>
            <div className="ih-text">{totalReviews} reviews</div>
          </div>
          <div className="ih-icontext">
            <SvgIcon name="verified" className="ih-icon ih-shield"></SvgIcon>
            <div className="ih-text">Identity verified</div>
          </div>
          {isSuperhost && (
            <div className="ih-icontext">
              <SvgIcon name="badge" className="ih-icon ih-badge-icon"></SvgIcon>
              <div className="ih-text">Superhost</div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="ih-description">
        <div className="ih-line ih-line-title">
          {isSuperhost ? `${name} is a Superhost` : `Meet ${name}`}
        </div>
        <div className="ih-line ih-line-desc">
          {description}
        </div>
        {languages && languages.length > 0 && (
          <div className="ih-line ih-line-languages">
            <strong>Languages: </strong>
            {languages.join(", ")}
          </div>
        )}
        <div className="ih-line ih-line-response">
          <strong>Response rate: </strong>
          {responseRate}% • <strong>Response time: </strong>
          {responseTime}
        </div>
      </div>
    </section>
  );
}
