import BaseDropdown from "./BaseDropdown";

export default function TourTimeFilter({ current, onSelect }) {
  const times = ["Morning", "Afternoon", "Evening", "Full day"];

  return (
    <BaseDropdown>
      <div className="filter-title">Time of day</div>
      {times.map(t => (
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
