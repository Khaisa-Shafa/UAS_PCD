//efek/deblurring.js
function applyDeblurring(sourceCanvasId, targetCanvasId) {
  const src = document.getElementById(sourceCanvasId);
  const dst = document.getElementById(targetCanvasId);
  const ctxSrc = src.getContext('2d');
  const ctxDst = dst.getContext('2d');
  const imageData = ctxSrc.getImageData(0, 0, src.width, src.height);
  const data = imageData.data;

  // Laplacian kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ];

  const output = ctxDst.createImageData(src.width, src.height);

  for (let y = 1; y < src.height - 1; y++) {
    for (let x = 1; x < src.width - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const offset = (py * src.width + px) * 4;
          const weight = kernel[ky + 1][kx + 1];
          r += data[offset] * weight;
          g += data[offset + 1] * weight;
          b += data[offset + 2] * weight;
        }
      }
      const i = (y * src.width + x) * 4;
      output.data[i] = Math.min(Math.max(r, 0), 255);
      output.data[i + 1] = Math.min(Math.max(g, 0), 255);
      output.data[i + 2] = Math.min(Math.max(b, 0), 255);
      output.data[i + 3] = 255;
    }
  }
  ctxDst.putImageData(output, 0, 0);
}