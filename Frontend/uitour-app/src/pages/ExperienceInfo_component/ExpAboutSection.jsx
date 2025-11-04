import "./ExpAboutSection.css";
import ButtonWhite from "../../components/ButtonWhite";
import SvgIcon from "../../components/SvgIcon";

export default function ExpAboutSection({
  title,
  summary,
  description,
  rating,
  reviewsCount,
  location,
  duration,
  price,
  currency,
  host
}) {
  return (
    <div className="expAbout-container">

      {/* ✅ Title */}
      <h1 className="expAbout-listingTitle">{title}</h1>

      {/* ✅ Summary / Description */}
      <p className="expAbout-description">{summary || description}</p>

      {/* ✅ Rating + Reviews + Location */}
      <div className="expAbout-details">
        <span className="expAbout-rating">⭐ {rating}</span>
        <span className="expAbout-dot" />
        <span className="expAbout-reviews">{reviewsCount} reviews</span>
        <span className="expAbout-dot" />
        <span className="expAbout-location">{location}</span>
      </div>

      {/* ✅ Pricing + Duration */}
      <div className="expAbout-priceTime">
        <span className="expAbout-price">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: currency || "VND"
          }).format(price)}{" "}
          / person
        </span>

        <span className="expAbout-duration">{duration}</span>
      </div>

      {/* ✅ Share + Save */}
      <div className="expAbout-rightButtons">
        <ButtonWhite
          className="expAbout-iconButton expAbout-shareButton"
          leftIcon={<SvgIcon name="share" className="icon share-icon" />}
        >
          Share
        </ButtonWhite>

        <ButtonWhite
          className="expAbout-iconButton expAbout-saveButton"
          leftIcon={<SvgIcon name="heart" className="icon heart-icon" />}
        >
          Save
        </ButtonWhite>
      </div>

      {/* ✅ Host */}
      {host && (
        <div className="expAbout-hostWrapper">
          <img
            src={host.avatar}
            className="expAbout-hostAvatar"
            alt={host.name}
          />
          <div className="expAbout-hostBox">
            <h3 className="expAbout-hostName">Hosted by {host.name}</h3>
            <p className="expAbout-hostRole">
              {host.languages?.join(", ")} — ⭐ {host.averageRating}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
