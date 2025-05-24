import React from "react";

function Button({ onClick, disabled, className, children, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${className || ""}`}
    >
      {children}
    </button>
  );
}

export default Button;
