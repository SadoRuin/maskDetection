const $video = document.querySelector("#video");
const $canvas = document.querySelector("#canvas");
const width = 496;
const height = 376;
const $form = document.querySelector("form");
const $input = document.querySelector("form input");

// click submit
function saveImage() {
  const data = $("#canvas")[0].toDataURL().split(",")[1];
  const $input = document.querySelector("#dataURL");
  $input.value = data;
  $form.submit();
}

// video image capture
function capture() {
  const context = $canvas.getContext("2d");
  context.drawImage($video, 0, 0, width, height);
}

// getUserMedia success
function success(stream) {
  $video.srcObject = stream;
}

// getUserMedia fail
function error(err) {
  console.log("error", err);
  alert(err.message);
}

// call media
async function startMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    success(stream);
  } catch (err) {
    error(err);
  }
}

// event binding
function initialize() {
  $canvas.width = width;
  $canvas.height = height;

  document.querySelector("#btn-camera").addEventListener("click", startMedia);
  document.querySelector("#btn-capture").addEventListener("click", capture);
}

initialize();
