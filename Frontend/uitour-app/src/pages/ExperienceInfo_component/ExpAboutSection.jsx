import "./ExpAboutSection.css";

export default function ExpAboutSection({ data }) {
  if (!data) return null;

  return (
    <div className="expAbout-container">
      <h1 className="expAbout-title">{data.title}</h1>
      <p className="expAbout-description">{data.description}</p>

      <div className="expAbout-details">
        <span className="expAbout-rating">⭐ {data.rating}</span>
        <span className="expAbout-dot">•</span>
        <span className="expAbout-reviews">{data.reviewCount} reviews</span>
        <span className="expAbout-dot">•</span>
        <span className="expAbout-location">{data.location}</span>
      </div>

      <div className="expAbout-hostWrapper">
        <img src={data.host.avatar} className="expAbout-hostAvatar" alt="host" />
        <div className="expAbout-hostBox">
          <h3 className="expAbout-hostName">Host by {data.host.name}</h3>
          <p className="expAbout-hostRole">{data.host.tagline}</p>
        </div>
      </div>
    </div>
  );
}
