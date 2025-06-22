function applyDeblurring(canvasId, outputCanvasId, kernelSize = 3, noiseVariance = 20) {
  const canvas = document.getElementById(canvasId);
  const outputCanvas = document.getElementById(outputCanvasId);
  const ctx = canvas.getContext("2d");
  const outputCtx = outputCanvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const outputData = outputCtx.createImageData(width, height);
  const out = outputData.data;

  const k = kernelSize;
  const halfK = Math.floor(k / 2);

  function getPixelChannel(x, y, channel) {
    const i = (y * width + x) * 4;
    return data[i + channel];
  }

  for (let y = halfK; y < height - halfK; y++) {
    for (let x = halfK; x < width - halfK; x++) {
      const i = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        let sum = 0, sumSq = 0, count = 0;

        for (let dy = -halfK; dy <= halfK; dy++) {
          for (let dx = -halfK; dx <= halfK; dx++) {
            const val = getPixelChannel(x + dx, y + dy, c);
            sum += val;
            sumSq += val * val;
            count++;
          }
        }

        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        const centerVal = getPixelChannel(x, y, c);

        const wienerVal = variance > 0
          ? mean + (Math.max(variance - noiseVariance, 0) / variance) * (centerVal - mean)
          : mean;

        out[i + c] = Math.max(0, Math.min(255, wienerVal));
      }

      out[i + 3] = 255; // alpha
    }
  }

  outputCtx.putImageData(outputData, 0, 0);
}
