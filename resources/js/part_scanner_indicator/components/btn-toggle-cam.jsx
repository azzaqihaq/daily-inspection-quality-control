import { useState } from "react";
import { accessCamera } from "../utils/webcam";

const Button = ({ cameraRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const webcam = new accessCamera(); // webcam handler

  const handleToggleCam = () => {
    if (streaming === null) {
      webcam.open(cameraRef.current); // open webcam
      cameraRef.current.style.display = "block"; // show camera
      setStreaming("camera"); // set streaming to camera
    } else if (streaming === "camera") {
      webcam.close(cameraRef.current); // close webcam
      cameraRef.current.style.display = "none"; // hide camera
      setStreaming(null); // reset streaming state
    } else {
      alert(`Currently streaming: ${streaming}`); // if streaming another source
    }
  };

  return (
    <div className="btn-container">
      {/* Webcam Handler */}
      <button onClick={handleToggleCam}>
        {streaming === "camera" ? "Stop" : "Start"} Camera
      </button>
    </div>
  );
};

export default Button;
