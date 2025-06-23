function applyDeblurring(sourceCanvasId, targetCanvasId) {
  const src = document.getElementById(sourceCanvasId);
  const dst = document.getElementById(targetCanvasId);
  const ctxSrc = src.getContext('2d');
  const ctxDst = dst.getContext('2d');

  const imageData = ctxSrc.getImageData(0, 0, src.width, src.height);
  const data = imageData.data;
  const width = src.width;
  const height = src.height;

  const kernel = [
  [-1, -1, -1],
  [-1, 9, -1],
  [-1, -1, -1]
];

  const output = ctxDst.createImageData(width, height);
  const outputData = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;

          const clampedX = Math.min(Math.max(px, 0), width - 1);
          const clampedY = Math.min(Math.max(py, 0), height - 1);

          const offset = (clampedY * width + clampedX) * 4;
          const weight = kernel[ky + 1][kx + 1];

          r += data[offset] * weight;
          g += data[offset + 1] * weight;
          b += data[offset + 2] * weight;
        }
      }

      const i = (y * width + x) * 4;
      outputData[i] = Math.min(Math.max(r, 0), 255);
      outputData[i + 1] = Math.min(Math.max(g, 0), 255);
      outputData[i + 2] = Math.min(Math.max(b, 0), 255);
      outputData[i + 3] = 255;
    }
  }

  ctxDst.putImageData(output, 0, 0);
}
