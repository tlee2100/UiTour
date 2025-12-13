import React, { useState } from "react";
import "./InfoReview.css";
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";

/* ---------------- HEADER ---------------- */
const InfoReviewHeader = ({ rating, reviewsCount }) => {
  const safeRating = typeof rating === "number" ? rating : 0;
  
  return (
    <div className="inforeview">
      <div className="ir-icon-text">
        <SvgIcon name="review_star" className="ir-star-icon" />
        <div className="ir-rating-text">{safeRating.toFixed(1)}</div>
      </div>

      <div className="ir-dot"></div>

      <div className="ir-review-count">{reviewsCount || 0} reviews</div>
    </div>
  );
};
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
/* ---------------- REVIEW CARD ---------------- */
const IrReviewCard = ({ review = {} }) => {
  const {
    userName = "Guest",
    userAvatar,
    rating = 0,
    comment = "",
    createdAt,
    location = "Unknown",
  } = review;
  const safeAvatar =
    normalizeImageUrl(userAvatar) ||
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80";
  const [expanded, setExpanded] = useState(false);

  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Unknown date";
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const maxChars = 180;
  const isLong = comment.length > maxChars;
  const displayedText = expanded
    ? comment
    : comment.slice(0, maxChars) + (isLong ? "..." : "");

  return (
    <div className="ir-review-card">

      {/* User Info */}
      <div className="ir-review-user">
        <div className="ir-review-avatar">
          <img
            src={
              safeAvatar ||
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80"
            }
            alt={userName}
            className="ir-review-avatar-img"
            onError={(e) =>
              (e.target.src =
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80")
            }
          />
        </div>

        <div className="ir-review-title-subtitle">
          <div className="ir-review-title">{userName}</div>
          <div className="ir-review-subtitle">
            {location} • {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Rating stars */}
      <div className="ir-review-rating">
        {[...Array(5)].map((_, i) => {
          const isFilled = i < safeRating;
          const starClass = `ir-review-star ${isFilled ? "filled" : "empty"}`;
          const starColor = isFilled ? "#222222" : "#d1d5db";
          const starOpacity = isFilled ? 1 : 0.5;
          
          return (
            <div key={i} className={starClass} style={{ display: 'inline-flex' }}>
              <SvgIcon
                name="review_star"
                style={{ 
                  fill: starColor, 
                  color: starColor,
                  opacity: starOpacity,
                  width: '20px',
                  height: '20px'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Comment */}
      <div className="ir-review-comment">
        {displayedText}
        {isLong && (
          <ButtonWhite
            onClick={() => setExpanded(!expanded)}
            className="ir-show-more-btn"
          >
            {expanded ? "Show less" : "Show more"}
          </ButtonWhite>
        )}
      </div>
    </div>
  );
};

/* ---------------- REVIEW LIST ---------------- */
const IrReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="ir-no-reviews">
        <p>No reviews yet for this experience.</p>
      </div>
    );
  }

  return (
    <div className="ir-review-list">
      {reviews.slice(0, 6).map((review) => (
        <IrReviewCard key={review.id || Math.random()} review={review} />
      ))}
    </div>
  );
};

/* ---------------- MAIN EXPORT ---------------- */
export default function InfoReview({ rating, reviewsCount, reviews = [] }) {
  return (
    <div className="ir-review-section">
      <InfoReviewHeader rating={rating} reviewsCount={reviewsCount} />
      <IrReviewList reviews={reviews} />
      {reviews.length > 0 && (
        <ButtonWhite className="ir-button-seeall">See all reviews</ButtonWhite>
      )}
    </div>
  );
}
