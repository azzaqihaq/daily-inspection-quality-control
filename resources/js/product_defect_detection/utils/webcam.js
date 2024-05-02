/**
 * Class to handle webcam
 */
export class accessCamera {

  open = (videoRef) => {
    // Check if the required APIs are available
    if (this.isCameraAvailable()) {
      // Request access to the webcam
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment", // Use the environment-facing camera
          },
        })
        .then((stream) => {
          // Set the stream as the source object for the video element
          videoRef.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          alert("Unable to open camera. Please check your browser settings.");
        });
    } else {
      alert("Can't open camera! Your browser may not support this feature.");
    } 
  };

  close = (videoRef) => {
    if (videoRef.srcObject) {
      videoRef.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.srcObject = null;
    } else {
      alert("Please open Webcam first!");
    }
  };

  // Check if webcam access is available in the browser.
  isCameraAvailable() {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  }
}
