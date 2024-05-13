import * as tf from "@tensorflow/tfjs";
import { renderFeedback } from "./renderFeedback"; // Import the renderFeedback function from another file
import labels from "@trained_label/product_defect_web_model.json"; // Import labels from a JSON file

const classCount = labels.length; // Variable to store total of class model

// Function preprocessingImage to reprocess the input image to prepare it for inference
const preprocessingImage = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio; // Ratios for adjusting bounding box coordinates

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source); // Convert the image to a TensorFlow tensor

    // Pad the image to make it square, ensuring consistent input size for the model
    const [h, w] = img.shape.slice(0, 2); // Get the original image height and width
    const maxSize = Math.max(w, h); // Determine the maximum dimension
    const imgPadded = img.pad([
      [0, maxSize - h], // Padding for height (bottom)
      [0, maxSize - w], // Padding for width (right)
      [0, 0], // No padding for color channels
    ]);

    xRatio = maxSize / w; // Calculate the x-axis ratio for bounding box adjustments
    yRatio = maxSize / h; // Same as well but for y-axis

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // Resize the image to match the model's input size
      .div(255.0) // Normalize pixel values to the range [0, 1]
      .expandDims(0); // Add a batch dimension to the tensor
  });

  return [input, xRatio, yRatio]; // Return the preprocessed input along with the ratios
};

// Function defectRecognition to perform object detection on a single image frame
export const defectRecognition = async (source, model, canvasRef, callback = () => {}) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // Get the model's input width and height

  tf.engine().startScope(); // Start a TensorFlow scope to manage resources
  const [input, xRatio, yRatio] = preprocessingImage(source, modelWidth, modelHeight); // Preprocess the image

  const res = model.net.execute(input); // Perform inference using the model
  const transRes = res.transpose([0, 2, 1]); // Transpose the result tensor for further processing

  // Extract bounding box coordinates and class predictions
  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // Extract box width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // Extract box height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // Calculate x1 (left)
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // Calculate y1 (top)
    return tf.concat(
      [
        y1,
        x1,
        tf.add(y1, h), // Calculate y2 (bottom)
        tf.add(x1, w), // Calculate x2 (right)
      ],
      2
    ).squeeze(); // Concatenate and squeeze to get the final bounding boxes
  });

  // Process class scores and predictions
  const [scores, classes] = tf.tidy(() => {
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, classCount]).squeeze(0); // Extract raw class scores
    return [rawScores.max(1), rawScores.argMax(1)]; // Get maximum scores and corresponding class indices
  });

  // Perform non-maximum suppression to filter redundant boxes
  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2);

  // Extract data from tensors for rendering boxes on the canvas
  const boxesData = boxes.gather(nms, 0).dataSync();
  const scoresData = scores.gather(nms, 0).dataSync();
  const classesData = classes.gather(nms, 0).dataSync();

  // Render bounding boxes on the canvas
  renderFeedback(canvasRef, boxesData, scoresData, classesData, [xRatio, yRatio]);

  // Dispose tensors to free up memory
  tf.dispose([res, transRes, boxes, scores, classes, nms]);

  callback(); // Execute the callback function

  tf.engine().endScope(); // End the TensorFlow scope
};

// Function convertToFrames to detect objects in a video stream
export const convertToFrames = (vidSource, model, canvasRef) => {
  // Function to detect objects in each frame of the video
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas if the video source is closed
      return; // Exit the function if the source is closed
    }

    // Perform object detection on the video frame and request the next frame
    defectRecognition(vidSource, model, canvasRef, () => {
      requestAnimationFrame(detectFrame);
    });
  };

  detectFrame(); // Start detecting objects in the video frames
};
