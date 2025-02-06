import React from "react";
import "./styles.css"; // Import the CSS file

const Card = ({ children}) => {
  return <div className="card">{children}</div>;
};

export default Card;
