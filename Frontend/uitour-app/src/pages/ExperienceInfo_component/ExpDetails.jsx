import "./ExpDetails.css";

export default function ExpDetails({ title = "Details", details }) {
  if (!Array.isArray(details) || details.length === 0) {
    return null; // Không có data thì bỏ luôn component này
  }

  return (
    <div className="expDetails-container">
      
      {/* ✅ Section Title */}
      <div className="expDetails-top">
        <h2 className="expDetails-title">{title}</h2>
      </div>

      {/* ✅ List */}
      <div className="expDetails-list">
        {details.map((item) => (
          <div className="expDetails-item" key={item.id || item.title}>
            
            {/* ✅ Image */}
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="expDetails-image"
                loading="lazy"
              />
            )}

            {/* ✅ Text */}
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
