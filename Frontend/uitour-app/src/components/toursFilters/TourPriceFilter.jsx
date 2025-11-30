import BaseDropdown from "./BaseDropdown";

export default function TourPriceFilter({ currentMin, currentMax, onChange }) {
  return (
    <BaseDropdown>
      <div className="filter-title">Price per guest</div>

      <input
        type="number"
        placeholder="Min price"
        defaultValue={currentMin}
        onBlur={(e) => onChange("min", e.target.value)}
      />

      <input
        type="number"
        placeholder="Max price"
        defaultValue={currentMax}
        onBlur={(e) => onChange("max", e.target.value)}
      />
    </BaseDropdown>
  );
}
