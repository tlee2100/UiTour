import "./ExpAboutSection.css";
import ButtonWhite from "../../components/ButtonWhite";
import SvgIcon from "../../components/SvgIcon";

export default function ExpAboutSection({
  title,
  summary,
  description,
  rating,
  reviewsCount,
  location, // có thể là string hoặc object
  duration,
  price,
  currency,
  host
}) {
  // ✅ Chuẩn hóa location
  const formattedLocation = typeof location === "string"
    ? location
    : location?.addressLine && location?.city
      ? `${location.addressLine}, ${location.city}`
      : "Location unavailable";

  // ✅ Chuẩn hóa giá
  const finalPrice =
    price ??
    (host?.pricing?.basePrice) ??
    0;

  // ✅ Host safe data
  const safeHost = host || {};
  const safeHostName = safeHost.name || "Host";
  const safeAvatar =
    safeHost.avatar ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";

  return (
    <div className="expAbout-container">

      {/* ✅ Title */}
      <h1 className="expAbout-listingTitle">{title}</h1>

      {/* ✅ Summary */}
      <p className="expAbout-description">{summary || description}</p>

      {/* ✅ Rating + Reviews + Location */}
      <div className="expAbout-details">
        {rating && <span className="expAbout-rating">⭐ {rating}</span>}
        <span className="expAbout-dot" />
        {reviewsCount >= 0 && (
          <span className="expAbout-reviews">{reviewsCount} reviews</span>
        )}
        <span className="expAbout-dot" />
        <span className="expAbout-location">{formattedLocation}</span>
      </div>

      {/* ✅ Pricing + Duration */}
      <div className="expAbout-priceTime">
        <span className="expAbout-price">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: currency || "VND"
          }).format(finalPrice)}{" "}
          / person
        </span>

        {duration && (
          <span className="expAbout-duration">{duration}</span>
        )}
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
      {safeHost && (
        <div className="expAbout-hostWrapper">
          <img
            src={safeAvatar}
            className="expAbout-hostAvatar"
            alt={safeHostName}
            onError={(e) =>
              (e.target.src =
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
            }
          />
          <div className="expAbout-hostBox">
            <h3 className="expAbout-hostName">Hosted by {safeHostName}</h3>
            {safeHost.languages && (
              <p className="expAbout-hostRole">
                {safeHost.languages.join(", ")}
                {safeHost.averageRating && ` — ⭐ ${safeHost.averageRating}`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
