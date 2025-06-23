const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => console.error("Kamera error:", err));

function capture() {
  const srcCanvas = document.getElementById('canvas-digitalisasi');
  const ctx = srcCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, srcCanvas.width, srcCanvas.height);

  const useNoiseBlur = document.getElementById('toggleNoiseBlur').checked;

  if (useNoiseBlur) {
    addGaussianNoise('canvas-digitalisasi', 'canvas-noise');
    applyGaussianBlur('canvas-noise', 'canvas-blur');
    applyDeblurring('canvas-blur', 'canvas-deblurring');
  } else {
    applyDeblurring('canvas-digitalisasi', 'canvas-deblurring');
  }

  adjustContrast('canvas-deblurring', 'canvas-kontras');

  // Segmentasi
  enhanceEdge('canvas-kontras', 'canvas-edge');
  convertRGBtoHSV('canvas-deblurring', 'canvas-transformasi');
  segmentTomatoHSV('canvas-kontras', 'canvas-segmentasi-hsv');

  // Klasifikasi
  classifyTomatoMulti(totalR, totalG, totalB, pixelCount);
}
