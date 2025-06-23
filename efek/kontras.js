function adjustContrast(sourceCanvasId, targetCanvasId, contrast = 50) {
  const sourceCanvas = document.getElementById(sourceCanvasId);
  const targetCanvas = document.getElementById(targetCanvasId);
  const sourceContext = sourceCanvas.getContext('2d');
  const targetContext = targetCanvas.getContext('2d');

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const imageData = sourceContext.getImageData(0, 0, width, height);
  const data = imageData.data;

  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = truncate(factor * (data[i]     - 128) + 128); // R
    data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // G
    data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // B
  }

  targetContext.putImageData(imageData, 0, 0);
}

function truncate(value) {
  return Math.min(255, Math.max(0, value));
}
