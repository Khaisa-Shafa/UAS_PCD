function convertRGBtoHSV(sourceId, targetId) {
  const srcCanvas = document.getElementById(sourceId);
  const dstCanvas = document.getElementById(targetId);
  const srcCtx = srcCanvas.getContext("2d");
  const dstCtx = dstCanvas.getContext("2d");

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(srcCanvas.width, srcCanvas.height);
  const src = srcData.data;
  const dst = dstData.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i] / 255;
    const g = src[i + 1] / 255;
    const b = src[i + 2] / 255;

    const hsv = rgbToHsv(r, g, b);
    const hueColor = hsvToRgb(hsv[0], 1, 1); // hanya tampilkan berdasarkan hue

    dst[i] = hueColor[0];
    dst[i + 1] = hueColor[1];
    dst[i + 2] = hueColor[2];
    dst[i + 3] = src[i + 3]; // alpha tetap
  }

  dstCtx.putImageData(dstData, 0, 0);
}

// Fungsi bantu konversi RGB → HSV
function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0, s = 0, v = max;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;

    s = delta / max;
  }

  return [h / 360, s, v]; // hue dinormalisasi 0–1
}

// Fungsi bantu konversi HSV → RGB
function hsvToRgb(h, s, v) {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [r * 255, g * 255, b * 255];
}
