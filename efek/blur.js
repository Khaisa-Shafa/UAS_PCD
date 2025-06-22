function applyGaussianBlur(sourceId, targetId) {
  const kernel = [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ];
  const divisor = 16;
  applyConvolution(sourceId, targetId, kernel, divisor);
}

function applyConvolution(sourceId, targetId, kernel, divisor = 1, bias = 0) {
  const srcCanvas = document.getElementById(sourceId);
  const srcCtx = srcCanvas.getContext('2d');
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  const dstCanvas = document.getElementById(targetId);
  const dstCtx = dstCanvas.getContext('2d');
  const dstData = dstCtx.createImageData(srcData.width, srcData.height);

  const width = srcData.width;
  const height = srcData.height;
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);

  const src = srcData.data;
  const dst = dstData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const px = x + kx - halfSide;
          const py = y + ky - halfSide;

          // Lewati piksel yang keluar dari batas
          if (px < 0 || px >= width || py < 0 || py >= height) continue;

          const offset = (py * width + px) * 4;
          const weight = kernel[ky * side + kx];

          r += src[offset] * weight;
          g += src[offset + 1] * weight;
          b += src[offset + 2] * weight;
        }
      }

      const dstOffset = (y * width + x) * 4;
      dst[dstOffset]     = Math.min(Math.max((r / divisor) + bias, 0), 255);
      dst[dstOffset + 1] = Math.min(Math.max((g / divisor) + bias, 0), 255);
      dst[dstOffset + 2] = Math.min(Math.max((b / divisor) + bias, 0), 255);
      dst[dstOffset + 3] = src[(y * width + x) * 4 + 3];  // Ambil alpha asli
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
}
