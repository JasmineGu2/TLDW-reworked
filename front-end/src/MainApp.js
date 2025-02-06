import { useState, useEffect } from "react";
import NavBar from "./components/NavBar/NavBar";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Button from "./components/Button/button.js";
import Input from "./components/Input/input";
import Card from "./components/Card/card";
import PdfTable from "./components/PdfTable/pdftable.js";
import Concepts from "./components/Concepts/concepts.js";
import { motion } from "framer-motion";
import "./global.css"

export default function MainApp() {
  const [link, setLink] = useState("");
  const [file_name, setFileName] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState({
    class_notes: "",
    keywords: "",
    pdf_url: "",
  });
  const [taskId, setTaskId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [concept, setConcept] = useState("");

  const handleChange = (e) => {
    setLink(e.target.value);
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    if (e.target.value.trim() === "") {
      setError("File name cannot be empty");
    } else {
      setError("");
    }
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    if (!file_name.trim()) {
      setError("File name cannot be empty");
      return;
    }
    if (!concept.trim()) {
      setError("Need to select a concept");
      return;
    }

    setTaskId(null);
    setSuccess(false);

    try {
      let response = await fetch("http://127.0.0.1:8000/api/generate_pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link,
          file_name: file_name,
          concept_name: concept,
        }), // ✅ Send concept
      });

      const result = await response.json();

      if (response.ok) {
        setTaskId(result.task_id);
        console.log(result.task_id);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
        if (!accessToken) {
          alert("Authentication required");
          return;
        }

        response = await fetch("http://127.0.0.1:8000/api/get_notes/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

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
  }, []); //Fixed: Added empty dependency array

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <main className="container mx-auto px-4 py-8 mt-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-card shadow-lg border-2 border-primary p-6">
            <form onSubmit={handleGeneratePDF} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  YouTube Link
                </label>
                <Input
                  type="text"
                  value={link}
                  onChange={handleChange}
                  placeholder="Paste YouTube link here"
                  className="w-full bg-background border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">File Name</label>
                <Input
                  type="text"
                  value={file_name}
                  onChange={handleFileNameChange}
                  placeholder="Enter file name"
                  className="bg-background border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select a Concept
                </label>
                <Concepts
                  selectedConcept={concept}
                  setSelectedConcept={setConcept}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive"
                >
                  {error}
                </motion.p>
              )}

              <ProgressBar
                taskId={taskId}
                onComplete={(data) => {
                  setData(data);
                  setSuccess(true);
                  handleGetPdf();
                }}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Generate PDF
              </Button>
            </form>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">TL;DW</h2>
            <textarea
              rows={12}
              value={data["class_notes"] + "\n" + data["keywords"]}
              readOnly
              className="w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Card>
            <PdfTable pdfs={pdfs} update={success} />
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
