import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login/Login"; // Import the login component
import MainApp from "./MainApp"; // Extracted the main app logic

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Main App Page */}
        <Route path="/app" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
