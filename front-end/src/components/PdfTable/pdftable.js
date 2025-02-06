import React, { useState, useEffect } from "react";
import "./styles.css";

const PdfTable = ({ update }) => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [fetchTriggered, setFetchTriggered] = useState(false);

  useEffect(() => {
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

  return (
    <div className="pdf-card">

      {/* Fetch Button */}
      <div className="button-container">
        <button onClick={fetchPdfs} className="submit-button">
          Fetch PDFs
        </button>
      </div>

      {/* Search Bar */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Search notes by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Multi-Select Concept Filter */}
      <div className="concept-filter">
        <label className="input-label">Filter by Concepts</label>
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
                <th>Created At</th>
                <th>Download PDF</th>
                <th>View Notes</th>
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
                  <td>{new Date(pdf.created_at).toLocaleString()}</td>
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
                  <td>
                    <button
                      className="view-notes-btn"
                      onClick={() => setSelectedPdf(pdf)}
                    >
                      View Notes
                    </button>
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
          <button disabled={page <= 1} onClick={() => setPage(1)}>
            First
          </button>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page{" "}
            <input
              type="number"
              value={tempPage}
              onChange={(e) => setTempPage(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(Math.max(1, Math.min(tempPage, totalPages)));
                }
              }}
              min="1"
              max={totalPages}
            />{" "}
            of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
            Last
          </button>
        </div>
      )}

      {/* Notes Modal */}
      {selectedPdf && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedPdf.title}</h2>
            <textarea
              className="modal-textarea"
              readOnly
              value={selectedPdf.class_notes}
            ></textarea>
            <button className="close-modal-btn" onClick={() => setSelectedPdf(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfTable;
