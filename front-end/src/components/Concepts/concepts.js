import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Button from "../Button/button";
import Input from "../Input/input";
import "./styles.css";

const Concepts = ({ selectedConcept, setSelectedConcept }) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const [newConcept, setNewConcept] = useState(""); // Stores new concept input
  const [message, setMessage] = useState(""); // Stores validation error
  const [concepts, setConcepts] = useState([]); // Stores list of concepts
  const [updateConcept, setUpdateConcept] = useState(false); // Triggers re-fetch when a new concept is added
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility

  // Fetch available concepts from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/concepts/")
      .then((response) => response.json())
      .then((data) => setConcepts(data.concepts))
      .catch((error) => console.error("Error fetching concepts:", error));

    setUpdateConcept(false);
  }, [updateConcept]);

  // Handle new concept submission
  const handleAddConcept = async () => {
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
    setUpdateConcept(true);
    resetModal(); // Reset modal state and close modal
  };

  // Function to reset modal state and close modal
  const resetModal = () => {
    setNewConcept(""); // Clear input field
    setMessage(""); // Clear validation message
    setIsModalOpen(false); // Close modal
  };

  return (
    <>
      <div className="flex">
        {/* Dropdown for existing concepts */}
        <select
          className="concept-dropbown border-gray-200"
          value={selectedConcept}
          onChange={(e) => setSelectedConcept(e.target.value)}
        >
          <option value="" disabled>
            Select a Concept
          </option>
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.name}>
              {concept.name}
            </option>
          ))}
        </select>

        {/* Add Concept Button to Open Modal */}
        <Button variant="secondary" className="tiny-button" onClick={() => setIsModalOpen(true)}>
          + New Concept
        </Button>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Prevent closing when clicking inside modal */}
              <h2 className="modal-title">Create New Concept</h2>
              <Input
                type="text"
                placeholder="Enter a new concept"
                value={newConcept}
                onChange={(e) => setNewConcept(e.target.value)}
              />
              {message && (
                <p className={`concept-message ${currentTheme === "dark" ? "dark-message" : "light-message"}`}>
                  {message}
                </p>
              )}
              <div className="modal-buttons">
                <Button variant="secondary" onClick={resetModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddConcept} disabled={!newConcept.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Concepts;
