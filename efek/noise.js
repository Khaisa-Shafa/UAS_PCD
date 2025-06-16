// efek/noise.js
function addSaltAndPepperNoise(sourceCanvasId, targetCanvasId, noiseLevel = 0.05) {
  const sourceCanvas = document.getElementById(sourceCanvasId);
  const targetCanvas = document.getElementById(targetCanvasId);
  const sourceContext = sourceCanvas.getContext('2d');
  const targetContext = targetCanvas.getContext('2d');

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const imageData = sourceContext.getImageData(0, 0, width, height);
  const data = imageData.data;

  const totalPixels = width * height;
  const numNoisyPixels = totalPixels * noiseLevel;

  for (let i = 0; i < numNoisyPixels; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const idx = (y * width + x) * 4;
    const saltOrPepper = Math.random() < 0.5 ? 0 : 255;

    data[idx] = saltOrPepper;     // Red
    data[idx + 1] = saltOrPepper; // Green
    data[idx + 2] = saltOrPepper; // Blue
    // Alpha dibiarkan
  }

  targetContext.putImageData(imageData, 0, 0);
}
