const video = document.getElementById("video");
const loadingIndicator = document.getElementById("loading-indicator");
const errorIndicator = document.getElementById("error-indicator");

// Show loading indicator
loadingIndicator.style.display = 'block';

// Load face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(() => {
  loadingIndicator.style.display = 'none';
  startVideo();
})
.catch(error => {
  console.error('Error loading models:', error);
  loadingIndicator.style.display = 'none';
  errorIndicator.textContent = 'Failed to load models. Please try again later.';
  errorIndicator.style.display = 'block';
});

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(error => {
      console.error('Error accessing webcam:', error);
      errorIndicator.textContent = 'Unable to access webcam. Please check your device settings.';
      errorIndicator.style.display = 'block';
    });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    console.log(detections);

    const resizeDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); // Clearing before drawing

    faceapi.draw.drawDetections(canvas, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);

  }, 500); // Adjusted to 500ms interval for detection
});
