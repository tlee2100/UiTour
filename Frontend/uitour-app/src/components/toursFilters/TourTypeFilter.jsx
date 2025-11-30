import BaseDropdown from "./BaseDropdown";

export default function TourTypeFilter({ current, onSelect }) {
  const types = ["Adventure", "Food", "Cultural", "Nature", "Relax"];

  return (
    <BaseDropdown>
      <div className="filter-title">Type</div>
      {types.map(t => (
        <button 
          key={t}
          className={`filter-option ${current === t ? "active" : ""}`}
          onClick={() => onSelect(t)}
        >
          {t}
        </button>
      ))}
    </BaseDropdown>
  );
}
