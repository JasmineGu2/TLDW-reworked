import { useState } from "react";
import jsPDF from "jspdf";
import NavBar from "./NavBar"; // Navigation bar extracted
import "./App.css";

function ProtectedApp() {
  const [link, setLink] = useState("");
  const [data, setData] = useState({ class_notes: "", keywords: "" });
  const [loading, setLoading] = useState(false);

  // Update the search bar
  const handleChange = (e) => {
    setLink(e.target.value);
  };

  // Log out
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Remove the JWT token
    window.location.href = "/login"; // Redirect to login page
  };

  // POST call --> create a new pdf and get the information
  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("You need to log in first.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-pdf/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtube_link: link }),
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
        alert("PDF generated successfully!");
        console.log("PDF URL:", result.pdf_url);
      } else {
        alert("PDF generation failed: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <NavBar handleLogout={handleLogout} />
      <section className="wrapper">
        <section className="input-output">
          <form onSubmit={handleGeneratePDF}>
            <div className="search-bar">
              <h1 className="upload">Copy and Paste Link Here</h1>
              <div className="input-wrapper">
                <input
                  value={link}
                  onChange={handleChange}
                  type="text"
                  className="search-bar-input"
                  placeholder="Paste YouTube link here"
                />
                <button type="submit" className="search-bar-button">
                  <i className="material-icons">upload</i>
                </button>
              </div>
            </div>
          </form>

          <div className="output">
            <h1 className="notes">TL;DW</h1>
            <textarea
              rows="12"
              className="output-bar"
              value={data["class_notes"] + "\n" + data["keywords"]}
              readOnly
            />
          </div>
        </section>
      </section>
    </div>
  );
}

export default ProtectedApp;
