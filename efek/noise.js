function addGaussianNoise(sourceCanvasId, targetCanvasId, stdDev = 20) {
  const sourceCanvas = document.getElementById(sourceCanvasId);
  const targetCanvas = document.getElementById(targetCanvasId);
  const sourceContext = sourceCanvas.getContext('2d');
  const targetContext = targetCanvas.getContext('2d');

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const imageData = sourceContext.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noiseR = gaussianRandom() * stdDev;
    const noiseG = gaussianRandom() * stdDev;
    const noiseB = gaussianRandom() * stdDev;

    data[i]     = clamp(data[i] + noiseR); // Red
    data[i + 1] = clamp(data[i + 1] + noiseG); // Green
    data[i + 2] = clamp(data[i + 2] + noiseB); // Blue
    // Alpha tetap
  }

  targetContext.putImageData(imageData, 0, 0);

  function clamp(value) {
    return Math.max(0, Math.min(255, value));
  }

  function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}
