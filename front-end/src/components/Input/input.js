import "./styles.css";

const Input = ({ value, onChange, type, placeholder }) => {
    return (
      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="input"
      />
    )
  }
  
  export default Input
  
  