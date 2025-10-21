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
        <div className="ir-rating-text">{rating.toFixed(1)}</div>
      </div>

      <div className="ir-dot"></div>

      <div className="ir-review-count">{reviews} reviews</div>
    </div>
  );
};

/* ---------------- REVIEW CARD ---------------- */
const IrReviewCard = ({ name, subtitle, comment }) => {
  return (
    <div className="ir-review-card">
      {/* User section */}
      <div className="ir-review-user">
        <div className="ir-review-avatar">
          <div className="ir-review-avatar-base"></div>
          {/*<div className="ir-review-avatar-img"></div>  {/**/}
          <SvgIcon name="avt" className="ir-review-avatar-icon" />
        </div>

        <div className="ir-review-title-subtitle">
          <div className="ir-review-title">{name}</div>
          <div className="ir-review-subtitle">{subtitle}</div>
        </div>
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
const IrReviewList = ({ reviewData }) => {
  return (
    <div className="ir-review-list">
      {reviewData.slice(0,6).map((r, i) => (
        <IrReviewCard key={i} {...r} />
      ))}
    </div>
  );
};

/* ---------------- EXPORT MAIN COMPONENT ---------------- */
export default function InfoReview({ rating, reviewsCount, reviewData }) {
  return (
    <div className="ir-review-section">
      <InfoReviewHeader rating={rating} reviews={reviewsCount} />
      <IrReviewList reviewData={reviewData} />
      <ButtonWhite className="ir-button-seeall">See all reviews</ButtonWhite>
    </div>
  );
}
