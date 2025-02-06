import React from "react";
import "./styles.css"; // Import the CSS file

const Button = ({ onClick, type, children, className }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`button ${className}`} // Uses external styles
    >
      {children}
    </button>
  );
};

export default Button;
