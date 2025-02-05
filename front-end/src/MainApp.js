import React, { useState } from "react";
import NavBar from "./components/NavBar/NavBar";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import "./App.css";

function MainApp() {
  const [link, setLink] = useState("");
  const [data, setData] = useState({ class_notes: "", keywords: "", pdf_url: "" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    setLink(e.target.value);
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    setData({ class_notes: "", keywords: "", pdf_url: "" });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate_pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });

      const result = await response.json();
      if (response.ok) {
        setUserId(result.user_id);
      } else {
        alert("PDF generation failed: " + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <NavBar />
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
              <ProgressBar userId={userId} onComplete={setData} />
            </div>
          </form>

          {data.class_notes && (
            <div className="output">
              <h1 className="notes">TL;DW</h1>
              <textarea rows="12" className="output-bar" value={data.class_notes} readOnly />
              <h2>Keywords</h2>
              <p>{data.keywords}</p>
              <h2>Download PDF</h2>
              <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default MainApp;
