import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Card from "../Card/card";
import Button from "../Button/button";
import Input from "../Input/input";
import "./styles.css";

const PdfTable = () => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [fetchTriggered, setFetchTriggered] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("http://127.0.0.1:8000/api/concepts/")
      .then((res) => res.json())
      .then((data) => setConcepts(data.concepts))
      .catch((err) => console.error("Error fetching concepts:", err));

    fetchPdfs();
  }, [page]);

  const fetchPdfs = async () => {
    setLoading(true);
    setFetchTriggered(true);

    const conceptParams = selectedConcepts
      .map((name) => `concept=${encodeURIComponent(name)}`)
      .join("&");
    const url = `http://127.0.0.1:8000/api/get_notes/?page=${page}&search=${searchQuery}&${conceptParams}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch PDFs");

      const data = await response.json();
      setPdfs(data.results);
      setTotalPages(Math.ceil(data.count / 10)); 
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConcept = (conceptName) => {
    setSelectedConcepts((prev) =>
      prev.includes(conceptName)
        ? prev.filter((name) => name !== conceptName)
        : [...prev, conceptName]
    );
  };

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <>
      {/* Fetch Button */}
      <div className="button-container">
        <Button onClick={fetchPdfs}>Fetch PDFs</Button>
      </div>

      {/* Search Bar */}
      <div className="input-group">
        <Input
          type="text"
          placeholder="Search notes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Multi-Select Concept Filter */}
      <div className="concept-filter">
        <div className="concept-list">
          {concepts.map((concept) => (
            <label key={concept.id} className="concept-item">
              <input
                type="checkbox"
                checked={selectedConcepts.includes(concept.name)}
                onChange={() => toggleConcept(concept.name)}
              />
              {concept.name}
            </label>
          ))}
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <div className="spinner"></div>}

      {/* PDF Table */}
      {fetchTriggered && (
        <div className="table-wrapper">
          <table className="pdf-table">
          <thead>
  <tr>
    <th>Title (YouTube Link)</th>
    <th>Concept </th> 
    <th>Created At</th>
    <th>Download PDF</th>
  </tr>
</thead>
<tbody>
  {pdfs.map((pdf) => (
    <tr key={pdf.id}>
      <td>
        <a
          href={pdf.youtube_link}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-link"
        >
          {pdf.title}
        </a>
      </td>
      <td>{pdf.concept || "N/A"}</td> 
      <td>{new Date(pdf.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td>
        <a
          href={pdf.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn"
        >
          Download PDF
        </a>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}

   {/* Pagination */}
   {fetchTriggered && (
        <div className="pagination">
          <button className="custom-button" disabled={page <= 1} onClick={() => setPage(1)}>
            First
          </button>
          <button className="custom-button" disabled={page <= 1} onClick={() => setPage(page-1)}>
            Previous
          </button>
          <span>
            Page{" "}
           { page == 1 && totalPages == 0 ? 0 : page }{" "}
             of {totalPages}
          </span>
          {/* buggy because pagination needed page to be at least 1! so can't display 0*/}
          <button className="custom-button" disabled={page >= totalPages} onClick={() => setPage(page+1)}>
            Next
          </button>
          <button className="custom-button" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
            Last
          </button>
        </div>
      )}
      </>
  );
};

export default PdfTable;
