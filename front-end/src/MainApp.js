import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import NavBar from "./components/NavBar/NavBar";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Button from "./components/Button/button.js";
import Input from "./components/Input/input";
import Card from "./components/Card/card";
import PdfTable from "./components/PdfTable/pdftable.js";
import Concepts from "./components/Concepts/concepts.js";
import { motion } from "framer-motion";
import "./global.css";
import ThemeProvider from "./providers/ThemeProvider";

export default function MainApp() {
  const { theme, setTheme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const [link, setLink] = useState("");
  const [file_name, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    class_notes: "",
    keywords: "",
    pdf_url: "",
  });
  const [taskId, setTaskId] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [concept, setConcept] = useState("");

  const handleChange = (e) => {
    setLink(e.target.value);
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setError(e.target.value.trim() === "" ? "File name cannot be empty" : "");
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    if (!file_name.trim()) return setError("File name cannot be empty");
    if (!concept.trim()) return setError("Need to select a concept");

    setTaskId(null);
    if(loading) return;
    setLoading(true);

    try {
      let response = await fetch("http://127.0.0.1:8000/api/generate_pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, file_name, concept_name: concept }),
      });

      const result = await response.json();
      if (response.ok) {
        setTaskId(result.task_id);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally{
      setLoading(false);
    }
  };

  // Gets the PDfs for the table
  const handleGetPdf = async () => {
    let accessToken = localStorage.getItem("accessToken");

    try {
      let response = await fetch("http://127.0.0.1:8000/api/get_notes/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        accessToken = await refreshAccessToken();
        if (!accessToken) return alert("Authentication required");

        response = await fetch("http://127.0.0.1:8000/api/get_notes/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setPdfs(data.pdfs);
    } catch (error) {
      alert("Error fetching PDFs: " + error.message);
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

  useEffect(() => {
    handleGetPdf();
  }, []);
 console.log("loading" + loading)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className={`min-h-screen ${currentTheme === "dark" ? "dark-mode" : "light-mode"}`}>
        <NavBar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24 md:mt-48 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
            <form className="space-y-6 w-full max-w-lg mx-auto">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">YouTube Link</label>
                  <Input type="text" value={link} onChange={handleChange} placeholder="Paste YouTube link here" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">File Name</label>
                  <Input type="text" value={file_name} onChange={handleFileNameChange} placeholder="Enter file name" />
                </div>

                <div className="space-y-2">
                 
                  <Concepts selectedConcept={concept} setSelectedConcept={setConcept} />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500">
                    {error}
                  </motion.p>
                )}

                <ProgressBar
                  taskId={taskId}
                  onComplete={(data) => {
                    setData(data);
                    handleGetPdf();
                  }}
                />
                <Button onClick={handleGeneratePDF} disabled={loading}>Generate PDF</Button>
              </form>
            </Card>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">TL;DW</h2>
              <textarea
                rows={12}
                value={data.class_notes + "\n " + data.keywords}
                readOnly
                className="w-full py-2 px-4 border rounded-md"
              />
            </div>
            <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <Card>
              <PdfTable pdfs={pdfs} />
            </Card>
            </div>
          </motion.div>

        </div>
      </div>
    </ThemeProvider>
  );
}
