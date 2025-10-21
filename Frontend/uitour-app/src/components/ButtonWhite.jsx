import React from "react";
import "./ButtonWhite.css";

export default function Button({
  leftIcon,
  rightIcon,
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn-base ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
      <span className="btn-text">{children}</span>
      {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
    </button>
  );
}
