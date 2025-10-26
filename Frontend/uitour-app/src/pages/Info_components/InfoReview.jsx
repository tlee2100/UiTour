import React from "react";
import "./InfoReview.css";
import SvgIcon from "../../components/SvgIcon";
import ButtonWhite from "../../components/ButtonWhite";

/* ---------------- HEADER ---------------- */
const InfoReviewHeader = ({ rating, reviews }) => {
  return (
    <div className="inforeview">
      <div className="ir-icon-text">
        <SvgIcon name="review_star" className="ir-star-icon" />
        <div className="ir-rating-text">{rating?.toFixed(1) || "0.0"}</div>
      </div>

      <div className="ir-dot"></div>

      <div className="ir-review-count">{reviews || 0} reviews</div>
    </div>
  );
};

/* ---------------- REVIEW CARD ---------------- */
const IrReviewCard = ({ review }) => {
  const { userName, userAvatar, rating, comment, createdAt, location } = review;
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <div className="ir-review-card">
      {/* User section */}
      <div className="ir-review-user">
        <div className="ir-review-avatar">
          <img 
            src={userAvatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"} 
            alt={userName}
            className="ir-review-avatar-img"
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
        {[...Array(5)].map((_, i) => (
          <SvgIcon 
            key={i} 
            name="review_star" 
            className={`ir-review-star ${i < rating ? 'filled' : 'empty'}`} 
          />
        ))}
      </div>

      {/* Comment */}
      <div className="ir-review-comment">{comment}</div>

      {/* Icon + Text */}
      <div className="ir-review-footer">
        <div className="ir-review-readmore">Read more</div>
        <div className="ir-review-chevron"></div>
      </div>
    </div>
  );
};

/* ---------------- REVIEW LIST ---------------- */
const IrReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="ir-no-reviews">
        <p>Chưa có đánh giá nào cho chỗ ở này.</p>
      </div>
    );
  }

  return (
    <div className="ir-review-list">
      {reviews.slice(0, 6).map((review, i) => (
        <IrReviewCard key={review.id || i} review={review} />
      ))}
    </div>
  );
};

/* ---------------- EXPORT MAIN COMPONENT ---------------- */
export default function InfoReview({ rating, reviewsCount, reviews = [] }) {
  return (
    <div className="ir-review-section">
      <InfoReviewHeader rating={rating} reviews={reviewsCount} />
      <IrReviewList reviews={reviews} />
      {reviews.length > 0 && (
        <ButtonWhite className="ir-button-seeall">See all reviews</ButtonWhite>
      )}
    </div>
  );
}
