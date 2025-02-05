import React, { useState, useEffect } from "react";
import "./styles.css";

const ProgressBar = ({ userId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/progress/${userId}/`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setProgress(data.progress);
      setStatus(data.status);

      if (data.progress === 100) {
        onComplete({
          class_notes: data.class_notes,
          keywords: data.keywords,
          pdf_url: data.pdf_url,
        });
        ws.close();
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
  }, [userId]);

  return (
    <div className="progress-container">
      <div className="progress-filler" style={{ width: `${progress}%` }}>
        <span className="progress-label">{`${Math.round(progress)}% - ${status}`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
