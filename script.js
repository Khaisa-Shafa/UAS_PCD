const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => console.error("Kamera error:", err));

function capture() {
  const srcCanvas = document.getElementById('canvas-digitalisasi');
  const ctx = srcCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, srcCanvas.width, srcCanvas.height);

  // Panggil efek per tahap
  applyGaussianBlur('canvas-digitalisasi', 'canvas-konvolusi');
  addSaltAndPepperNoise('canvas-konvolusi', 'canvas-noise');
  applyDeblurring('canvas-noise', 'canvas-deblurring');
  convertRGBtoHSV('canvas-deblurring', 'canvas-transformasi');
  adjustContrast('canvas-transformasi', 'canvas-kontras');
  enhanceEdge('canvas-kontras', 'canvas-edge');
  restoreImage('canvas-edge', 'canvas-restore');
  segmentTomato('canvas-restore', 'canvas-segmentasi');
}
