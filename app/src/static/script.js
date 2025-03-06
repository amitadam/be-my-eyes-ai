let video = document.getElementById('videoElement');
let facingMode = "user";
let stream = null;

function startVideo() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
    .then(function (mediaStream) {
      stream = mediaStream;
      video.srcObject = mediaStream;
      video.onloadedmetadata = function (e) {
        video.play();
        video.style.transform = (facingMode === 'user') ? 'scaleX(-1)' : 'scaleX(1)';
      };
    })
    .catch(function (err) {
      console.log(err.name + ": " + err.message);
    });
}

document.getElementById('clear').addEventListener('click', function () {
  document.getElementById('description').textContent = '';
});

document.getElementById('switchCamera').addEventListener('click', function () {
  facingMode = (facingMode === "user") ? "environment" : "user";
  startVideo();
});

function narrateDescription(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

document.getElementById('narrate').addEventListener('click', function () {
  narrateDescription(document.getElementById('description').textContent);
});

document.getElementById('describe').addEventListener('click', function () {
  let canvas = document.createElement('canvas');
  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  let ctx = canvas.getContext('2d');

  // Drawing video to canvas
  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = canvas.width / canvas.height;
  let drawWidth, drawHeight, startX, startY;
  if (videoRatio > canvasRatio) {
    drawHeight = video.videoHeight;
    drawWidth = video.videoHeight * canvasRatio;
    startX = (video.videoWidth - drawWidth) / 2;
    startY = 0;
  } else {
    drawWidth = video.videoWidth;
    drawHeight = video.videoWidth / canvasRatio;
    startX = 0;
    startY = (video.videoHeight - drawHeight) / 2;
  }
  ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

  let dataURL = canvas.toDataURL('image/png');
  let base64ImageContent = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  const descriptionDiv = document.getElementById('description');
  descriptionDiv.textContent = ''; // Clear previous text

  fetch('/describe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64ImageContent })
  }).then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    function read() {
      reader.read().then(({ done, value }) => {
        if (done) return;
        // Decode and append the chunk as it arrives
        descriptionDiv.textContent += decoder.decode(value, { stream: true });
        read();
      });
    }
    read();
  }).catch(err => console.error(err));
});

startVideo();

// --- Record Prompt using Web Speech API with Full Response ---

const recordButton = document.getElementById('record');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Non-continuous and final results only
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recordButton.addEventListener('click', () => {
    recognition.start();
    recordButton.textContent = 'Recording...';
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    recordButton.textContent = 'Record Prompt';
    const descriptionDiv = document.getElementById('description');
    descriptionDiv.textContent = ''; // Clear previous text
  
    // Capture the current image from the video
    let canvas = document.createElement('canvas');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    let ctx = canvas.getContext('2d');
  
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight, startX, startY;
    if (videoRatio > canvasRatio) {
      drawHeight = video.videoHeight;
      drawWidth = video.videoHeight * canvasRatio;
      startX = (video.videoWidth - drawWidth) / 2;
      startY = 0;
    } else {
      drawWidth = video.videoWidth;
      drawHeight = video.videoWidth / canvasRatio;
      startX = 0;
      startY = (video.videoHeight - drawHeight) / 2;
    }
    ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);
  
    let dataURL = canvas.toDataURL('image/png');
    let base64ImageContent = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  
    fetch('/recordPrompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: transcript, image: base64ImageContent })
    }).then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      function read() {
        reader.read().then(({ done, value }) => {
          if (done) return;
          descriptionDiv.textContent += decoder.decode(value, { stream: true });
          read();
        });
      }
      read();
    }).catch(err => console.error("Error sending prompt:", err));
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    recordButton.textContent = 'Record Prompt';
  };
} else {
  recordButton.disabled = true;
  recordButton.textContent = "Speech recognition not supported";
}