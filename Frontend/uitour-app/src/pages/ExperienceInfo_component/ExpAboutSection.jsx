import "./ExpAboutSection.css";
import ButtonWhite from "../../components/ButtonWhite";
import SvgIcon from "../../components/SvgIcon";
import { useCurrency } from "../../contexts/CurrencyContext";

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
  host,
  onSaveToggle,
  isSaved = false,
  saveLoading = false,
  onShare,
}) {
  const { convertToCurrent, format } = useCurrency();
  
  // ✅ Chuẩn hóa location
  const formattedLocation = typeof location === "string"
    ? location
    : location?.addressLine && location?.city
      ? `${location.addressLine}, ${location.city}`
      : "Location unavailable";

  // ✅ Chuẩn hóa giá (giả sử là USD), convert sang currency hiện tại
  const finalPriceUSD =
    price ??
    (host?.pricing?.basePrice) ??
    0;
  const finalPrice = convertToCurrent(finalPriceUSD);
  // Helper function to normalize image URL
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
  // ✅ Host safe data
  const safeHost = host || {};
  const safeHostName = safeHost.name || "Host";
  const safeAvatar =
    normalizeImageUrl(safeHost.avatar) ||
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
          {format(finalPrice)} / person
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
          onClick={onShare}
        >
          Share
        </ButtonWhite>

        <ButtonWhite
          className={`expAbout-iconButton expAbout-saveButton ${isSaved ? "saved" : ""}`}
          leftIcon={<SvgIcon name="heart" className="icon heart-icon" />}
          onClick={onSaveToggle}
          disabled={saveLoading}
          aria-pressed={isSaved}
        >
          {isSaved ? "Saved" : "Save"}
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
