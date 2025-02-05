import React, { useState } from "react";
import NavBar from "./components/NavBar/NavBar";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import "./App.css";

function MainApp() {
  const [link, setLink] = useState("");
  const [data, setData] = useState({ class_notes: "", keywords: "", pdf_url: "" });
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [success, setSuccess] = useState(false); // To show success message

  const handleChange = (e) => {
    setLink(e.target.value);
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTaskId(null); // Reset previous task
    setSuccess(false)
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate_pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });
  
      if (response.ok) {
        const result = await response.json();
        setTaskId(result.task_id); // ✅ Set taskId immediately for WebSocket tracking
        console.log(result.task_id)
      } else {
        alert("PDF generation failed.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };
  
  const handleGetPdf = async (e) => {
    e.preventDefault();
    let accessToken = localStorage.getItem("accessToken");

    try {
      let response = await fetch("http://127.0.0.1:8000/api/get_pdf/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        accessToken = await refreshAccessToken();
        if (!accessToken) throw new Error("Authentication required");

        response = await fetch("http://127.0.0.1:8000/api/get_pdf/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("PDF Data:", data);
    } catch (error) {
      console.log("Error fetching PDFs:", error);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) throw new Error("Token refresh failed");

      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      return data.access;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
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
              <ProgressBar taskId={taskId} onComplete={(data) => {
                setData(data);
                setLoading(false);
                setSuccess(true); 
                }} />
            </div>
          </form>
          {success && (
            <div>
            <h2>PDF Generation Succeeded!</h2>
            </div>
          )}
          <div className="output">
            <h1 className="notes">TL;DW</h1>
            <textarea
              rows="12"
              className="output-bar"
              value={data["class_notes"] + "\n" + data["keywords"]}
              readOnly
            />
          </div>
          <button type="submit" onClick={handleGetPdf} className="search-bar-button">
            <i className="material-icons">upload</i>
          </button>
        </section>
      </section>
    </div>
  );
}

export default MainApp;
