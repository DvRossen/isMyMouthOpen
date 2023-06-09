const log = document.querySelector("#array");
const video = document.querySelector("#video");

// Init

function initApplication() {
  Notification.requestPermission();
  new Notification("Starting the app");

  setupCamera();
  video.addEventListener("play", () => generateLandmarks());
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Webcam not available");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: 720,
      height: 405,
    },
  });
  video.srcObject = stream;
  console.log(video.height);
}

// start face api

function generateLandmarks() {
  const canvas = faceapi.createCanvasFromMedia(video);
  const videoElement = document.querySelector(".video-wrapper");
  videoElement.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detections[0]?.landmarks) {
      // Detect points and put these in array
      logData(detections);
    } else {
      console.log("No face found");
    }

    //Show the face detection op de webcam
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  }, 1000 * 4);
}

//Detect lower part of upper lip and upper part of lower lip
function logData(detections) {
  let str = "your mouth is ";

  if (
    detections[0].landmarks.positions[67]._y -
      detections[0].landmarks.positions[63]._y <
    10
  ) {
    str += "closed";
  } else {
    str += "open";
  }
  log.innerText = str;
  // str +=
  //   detections[0].landmarks.positions[67]._y +
  //   " and " +
  //   detections[0].landmarks.positions[63]._y;
  // +" ";
  // console.log(
  //   detections[0].landmarks.positions[67]._y -
  //     detections[0].landmarks.positions[63]._y
  // );
  //   for (let i = 56; i < 58; i++) {
  //     str +=
  //       detections[0].landmarks.positions[i]._x +
  //       ", " +
  //       detections[0].landmarks.positions[i]._y +
  //       ", ";
  //   }
  // example : finding the eye position manually
  // example : use functions to get the eyes
  //const leftEye = detections[0].landmarks.getLeftEye()
  //const rightEye = detections[0].landmarks.getRightEye()
}

// START - load the FACE API models - after loading init the app
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
]).then(initApplication);
