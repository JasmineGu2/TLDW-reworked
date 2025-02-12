import { useTheme } from "next-themes";
import "./styles.css";

const Input = ({ value, onChange, type, placeholder }) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className={`input ${currentTheme === "dark" ? "dark-mode-input" : "light-mode-input"}`}
    />
  );
};

export default Input;
