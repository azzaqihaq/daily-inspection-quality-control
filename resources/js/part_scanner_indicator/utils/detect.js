import * as tf from "@tensorflow/tfjs";
import { renderResult } from "./renderResult"; // Import the renderResult function from another file
import labels from "@trained_label/part_web_model.json"; // Import labels from a JSON file

const classCount = labels.length; // Variable to store total of class model

// Function preprocessingImage to reprocess the input image to prepare it for inference
const preprocessingImage = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; 

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source); 

    const [h, w] = img.shape.slice(0, 2); // Get the original image height and width
    const maxSize = Math.max(w, h); // Determine the maximum dimension
    const imgPadded = img.pad([
      [0, maxSize - h],
      [0, maxSize - w], 
      [0, 0], 
    ]);

    xRatio = maxSize / w;
    yRatio = maxSize / h;

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) 
      .div(255.0) 
      .expandDims(0); 
  });

  return [input, xRatio, yRatio]; 
};

// Function partRecognition to perform object detection on a single image frame
export const partRecognition = async (source, model, canvasRef, callback = () => {}) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); 

  tf.engine().startScope(); 
  const [input, xRatio, yRatio] = preprocessingImage(source, modelWidth, modelHeight); 

  const res = model.net.execute(input); 
  const transRes = res.transpose([0, 2, 1]); 

  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); 
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); 
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2));
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); 
    return tf.concat(
      [
        y1,
        x1,
        tf.add(y1, h), 
        tf.add(x1, w), 
      ],
      2
    ).squeeze(); 
  });

  const [scores, classes] = tf.tidy(() => {
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, classCount]).squeeze(0); 
    return [rawScores.max(1), rawScores.argMax(1)]; 
  });

  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2);

  const boxesData = boxes.gather(nms, 0).dataSync();
  const scoresData = scores.gather(nms, 0).dataSync();
  const classesData = classes.gather(nms, 0).dataSync();

  // Render bounding boxes on the canvas
  renderResult(canvasRef, boxesData, scoresData, classesData, [xRatio, yRatio]);

  // Dispose tensors to free up memory
  tf.dispose([res, transRes, boxes, scores, classes, nms]);

  callback(); 

  tf.engine().endScope(); // End the TensorFlow scope
};

// Function convertToFrames to detect objects in a video stream
export const convertToFrames = (vidSource, model, canvasRef) => {
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas if the video source is closed
      return; // Exit the function if the source is closed
    }

    partRecognition(vidSource, model, canvasRef, () => {
      requestAnimationFrame(detectFrame);
    });
  };

  detectFrame(); 
};
