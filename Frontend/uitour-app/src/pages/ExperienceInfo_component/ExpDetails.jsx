import "./ExpDetails.css";

export default function ExpDetails({ title, details }) {
  if (!details || !Array.isArray(details)) return null;

  return (
    <div className="expDetails-container">

      {/* Title */}
      <div className="expDetails-top">
        <h2 className="expDetails-title">{title}</h2>
      </div>

      {/* List of What You'll Do details */}
      <div className="expDetails-list">
        {details.map((item, index) => (
          <div className="expDetails-item" key={index}>
            
            {/* Icon */}
            <img
              src={item.image}
              alt={item.title}
              className="expDetails-image"
            />

            {/* Text Section */}
            <div className="expDetails-textBox">
              <h3 className="expDetails-itemTitle">{item.title}</h3>
              <p className="expDetails-itemDesc">{item.description}</p>
            </div>

          </div>
        ))}
      </div>

      <div className="expDetails-divider" />
    </div>
  );
}
