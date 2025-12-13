import React from "react";

export default function EditableRow({
  value,
  editable = false,
  onEdit,
  variant = "default", // default | title | description
}) {
  return (
    <div
      className={`hs-edit-display hs-edit-display-editable ${variant}`}
      onClick={editable ? onEdit : undefined}
    >
      <span className="hs-edit-display-text">
        {value ?? "—"}
      </span>

      {editable && (
        <button
          className="hs-edit-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Edit"
        >
          ✎
        </button>
      )}
    </div>
  );
}
