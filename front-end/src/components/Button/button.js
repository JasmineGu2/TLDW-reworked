import React from "react";
import PropTypes from "prop-types";
import "./styles.css"; // Import your CSS file

const Button = ({ onClick, type, children, className, variant, size, disabled }) => {
  const variantClass = variant === "secondary" ? "button-secondary" : "button-primary";
  const sizeClass = size === "small" ? "button-small" : "button-regular";

  return (
    <button
      onClick={onClick}
      type={type}
      className={`button ${variantClass} ${sizeClass} ${className}`} // Combine classes
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  size: PropTypes.oneOf(["regular", "small"]),
};

Button.defaultProps = {
  type: "button",
  className: "",
  variant: "primary",
  size: "regular",
};

export default Button;
