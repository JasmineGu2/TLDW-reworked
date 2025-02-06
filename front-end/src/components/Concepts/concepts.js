import React, { useState, useEffect } from "react";
import "./styles.css";

const Concepts = ({ selectedConcept, setSelectedConcept }) => {
  const [newConcept, setNewConcept] = useState(""); // Stores new concept input
  const [message, setMessage] = useState(""); // Stores validation error
  const [concepts, setConcepts] = useState([]); // Stores list of concepts
  const [update, setUpdate] = useState(false); // Triggers re-fetch when a new concept is added

  // Fetch available concepts from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/concepts/")
      .then((response) => response.json())
      .then((data) => setConcepts(data.concepts))
      .catch((error) => console.error("Error fetching concepts:", error));

    setUpdate(false);
  }, [update]);

  // Handle new concept submission
  const handleAddConcept = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/concepts/add/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newConcept }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    console.log("Concept added successfully");
    setSelectedConcept(newConcept);
    setUpdate(true);
    setNewConcept(""); // Clear input
    setMessage(data.message);
  };

  return (
    <div className="concept-card">

      {/* Dropdown for existing concepts */}
      <select
        className="concept-dropdown"
        value={selectedConcept}
        onChange={(e) => setSelectedConcept(e.target.value)}
      >
        <option value="">-- Select a Concept --</option>
        {concepts.map((concept) => (
          <option key={concept.id} value={concept.name}>
            {concept.name}
          </option>
        ))}
      </select>

      {/* Display validation error */}
      {message && <p className="concept-message">{message}</p>}

      {/* Form to Add New Concept */}
      <div className="concept-form">
        <input
          type="text"
          placeholder="Enter a new concept"
          value={newConcept}
          onChange={(e) => setNewConcept(e.target.value)}
          className="concept-input"
        />
        <button
          onClick={handleAddConcept}
          disabled={!newConcept.trim()}
          className="concept-btn"
        >
          Add Concept
        </button>
      </div>
    </div>
  );
};

export default Concepts;
