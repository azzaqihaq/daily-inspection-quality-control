import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import Button from "./components/btn-toggle-cam";
import LoadSpinner from "./components/load-spinner";
import { convertToFrames } from "./utils/detect";
import "@css/app.css";

const App = () => {
  // State for loading and progress
  const [loading, setLoading] = useState({
    isLoading: true, // Indicates if something is loading
    progress: 0, // Progress of the loading operation
  });

  // State for machine learning model and input shape
  const [model, setModel] = useState({
    net: null, // Placeholder for the machine learning model (net)
    inputShape: [1, 0, 0, 3], // Initial input shape of the model
  });

  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const modelName = "product_defect";

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.origin}/trained_model/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions });
          },
        }
      ); // Load model

      // Warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // Set model & input shape

      tf.dispose([warmupResults, dummyInput]); // Cleanup memory
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && <LoadSpinner>Preparing model... {(loading.progress * 100).toFixed(2)}%</LoadSpinner>}
      <div className="header">
        <h1>Product Defect Detection</h1>
        <p>Product defect live detection application</p>
      </div>

      <div className="content">
        <video autoPlay muted ref={cameraRef} onPlay={() => convertToFrames(cameraRef.current, model, canvasRef.current)}/>
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>

      <Button cameraRef={cameraRef} />
      <div className="model-info">
        <p>Model version : {modelName}</p>
      </div>
    </div>
  );
};

export default App;
