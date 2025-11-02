import "./ExpAboutSection.css";
import ButtonWhite from "../../components/ButtonWhite";
import SvgIcon from "../../components/SvgIcon";

export default function ExpAboutSection({ data }) {
  if (!data) return null;

  const host = data.host;

  return (
    <div className="expAbout-container">

      {/* Title */}
      <h1 className="expAbout-listingTitle">{data.listingTitle}</h1>

      {/* Description */}
      <p className="expAbout-description">{data.description}</p>

      {/* Rating + Reviews + Location */}
      <div className="expAbout-details">
        <span className="expAbout-rating">⭐ {data.rating}</span>
        <span className="expAbout-dot" />
        <span className="expAbout-reviews">{data.reviewsCount} reviews</span>
        <span className="expAbout-dot" />
        <span className="expAbout-location">{data.location}</span>
      </div>

      {/* ✅ NEW — Share + Save Buttons */}
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

      {/* ✅ Host Section */}
      {host && (
        <div className="expAbout-hostWrapper">
          <img src={host.avatar} className="expAbout-hostAvatar" alt={host.name} />
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
