import React from "react";
import SvgIcon from "../../components/SvgIcon";
import "./InfoHost.css";

export default function InfoHost({ host }) {
  // ✅ Chắc chắn host luôn là object
  const safeHost = host || {};
  const normalizeImageUrl = (url) => {
    if (!url || url.trim().length === 0) return null;
    // If already a full URL (http/https), use as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.trim();
    }
    // If relative path starting with /, prepend backend base URL
    if (url.startsWith('/')) {
      return `http://localhost:5069${url}`;
    }
    // Otherwise, assume it's a relative path and prepend backend base URL
    return `http://localhost:5069/${url}`;
  };
  const safeAvatar =
    normalizeImageUrl(safeHost.avatar) ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";

  // ✅ Merge default trước rồi override từ host
  console.log(safeHost);
  const defaultHost = {
    ...safeHost, // giữ nguyên dữ liệu gốc trước
    name: "Host",
    avatar: normalizeImageUrl(safeHost.avatar || safeHost.user?.avatar || safeHost.user?.Avatar),
    responseRate: 95,
    responseTime: "within an hour",
    isSuperhost: false,
    totalReviews: 0,
    averageRating: 0,
    languages: ["English"],
    description: "Experienced host committed to providing great stays for guests.",
    ...safeHost
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

  // ✅ Prevent invalid date crash
  const formatJoinedDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Unknown";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
              src={safeAvatar}
              alt={`${name || "Host"} Avatar`}
              className="ih-avatar-img"
              onError={(e) => (e.target.src = 
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
              )}
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
          {(averageRating || totalReviews) > 0 && (
            <div className="ih-icontext">
              <SvgIcon name="star" className="ih-icon ih-star"></SvgIcon>
              <div className="ih-text">
                ⭐ {(averageRating || 0).toFixed(1)} ({totalReviews || 0} reviews)
              </div>
            </div>
          )}

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

        {description && (
          <div className="ih-line ih-line-desc">{description}</div>
        )}

        {Array.isArray(languages) && languages.length > 0 && (
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
