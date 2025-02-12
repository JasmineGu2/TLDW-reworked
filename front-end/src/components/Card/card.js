import React from "react";
import { useTheme } from "next-themes";
import "./styles.css"; // Import the CSS file

const Card = ({ children }) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className={`card ${currentTheme === "dark" ? "dark-mode-card" : "light-mode-card"}`}>
      {children}
    </div>
  );
};

export default Card;
