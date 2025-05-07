const video = document.getElementById("video");
const adviceBox = document.getElementById("adviceBox");
const adviceMap = {
  happy: "You're doing great! Keep it up!",
  sad: "Take a break. Talk to someone or go outside.",
  angry: "Take a deep breath. Try counting to 10.",
  fearful: "It’s okay to be scared. You're not alone.",
  disgusted: "Try stepping away from what's bothering you.",
  surprised: "Something unexpected? Stay calm and observe.",
  neutral: "You're steady. Keep going with what you're doing."
};
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models")
]).then(() => console.log("Models loaded!"));
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Camera Error:", err));
}
video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    const resized = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);
    if (detections[0]) {
      const expressions = detections[0].expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).find(
        key => expressions[key] === maxValue
      );
      adviceBox.innerText = `You look ${emotion}. ${adviceMap[emotion]}`;
    }
  }, 1000);
});
