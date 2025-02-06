import React, { useState, useEffect } from "react";
import "./styles.css";

const ProgressBar = ({ taskId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!taskId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/progress/${taskId}/`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.status);

      if (data.status === "Error: File name already exists!") {
        setStatus("error")
        ws.close();
      }
      if (data.progress === 100) {
        ws.close();
        fetchFinalResult();
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [taskId]);

  const fetchFinalResult = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/progress/result/${taskId}/`);
      const result = await response.json();

      if (response.ok) {
        onComplete(result); // Send final data to parent component
      } else {
        console.error("Result not available yet");
      }
    } catch (error) {
      console.error("Error fetching result:", error);
    }
  };

  return (
    <>
        <div className="progress-container">
      <div className="progress-filler" style={{ width: `${progress}%` }}>
        {progress > 0 && (
          <div className="progress-label">{`${Math.round(progress)}% - ${status}`}</div>
        )}
      </div>
    </div>
    {status === "error" && (
          <div> "File name already exists" </div>
        )}
    </>
  );
};

export default ProgressBar;
