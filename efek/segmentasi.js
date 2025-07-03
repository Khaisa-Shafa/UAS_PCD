function segmentTomatoHSV(sourceCanvasId, targetCanvasId) {
  const hsvCanvas = document.getElementById(sourceCanvasId);
  const segCanvas = document.getElementById(targetCanvasId);
  const hsvCtx = hsvCanvas.getContext('2d');
  const segCtx = segCanvas.getContext('2d');

  const originalCanvas = document.getElementById(sourceCanvasId);
  const originalCtx = originalCanvas.getContext('2d');
  const originalData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

  const width = hsvCanvas.width;
  const height = hsvCanvas.height;

  const segmentedImageData = segCtx.createImageData(width, height);
  const segmentedData = segmentedImageData.data;

  let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const r = originalData.data[i] / 255;
      const g = originalData.data[i + 1] / 255;
      const b = originalData.data[i + 2] / 255;

      const [h, s, v] = rgbToHsv(r, g, b);

      // Ambil rentang warna yang umum untuk tomat (merah, jingga, kuning, hijau mentah)
      const isTomatoColor =
        (h >= 0 && h <= 0.06 && s > 0.4 && v > 0.2) ||         // merah matang
        (h >= 0.08 && h <= 0.18 && s > 0.3) ||                 // kuning
        (h >= 0.22 && h <= 0.45 && s > 0.2 && v > 0.2);        // hijau mentah

      if (isTomatoColor) {
        segmentedData[i]     = originalData.data[i];
        segmentedData[i + 1] = originalData.data[i + 1];
        segmentedData[i + 2] = originalData.data[i + 2];
        segmentedData[i + 3] = 255;

        totalR += originalData.data[i];
        totalG += originalData.data[i + 1];
        totalB += originalData.data[i + 2];
        pixelCount++;
      } else {
        segmentedData[i] = segmentedData[i + 1] = segmentedData[i + 2] = 0;
        segmentedData[i + 3] = 255;
      }
    }
  }

  // Minimum ROI filter: hapus noise kecil (misalnya < 100 pixels)
  if (pixelCount < 100) {
    segCtx.clearRect(0, 0, width, height);
    document.getElementById("label-hsv").innerText = "Kematangan (HSV): Tomat tidak terdeteksi";
    return;
  }

  segCtx.putImageData(segmentedImageData, 0, 0);
  classifyTomatoMulti(totalR, totalG, totalB, pixelCount);
}

function segmentTomatoRGB(sourceCanvasId, targetCanvasId) {
  const srcCanvas = document.getElementById(sourceCanvasId);
  const targetCanvas = document.getElementById(targetCanvasId);
  const srcCtx = srcCanvas.getContext('2d');
  const tgtCtx = targetCanvas.getContext('2d');

  const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const data = imgData.data;
  const segmentedImageData = tgtCtx.createImageData(srcCanvas.width, srcCanvas.height);
  const segmentedData = segmentedImageData.data;

  let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Rentang warna RGB untuk tomat (perkiraan kasar)
    const isTomatoRGB =
      (r > 100 && g < 80 && b < 80) ||         // Merah matang
      (r > 130 && g > 110 && b < 60) ||        // Kuning/oranye
      (g > 100 && r < 100 && b < 100);         // Hijau mentah

    if (isTomatoRGB) {
      segmentedData[i] = r;
      segmentedData[i + 1] = g;
      segmentedData[i + 2] = b;
      segmentedData[i + 3] = 255;

      totalR += r;
      totalG += g;
      totalB += b;
      pixelCount++;
    } else {
      segmentedData[i] = segmentedData[i + 1] = segmentedData[i + 2] = 0;
      segmentedData[i + 3] = 255;
    }
  }

  if (pixelCount < 100) {
    tgtCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
    document.getElementById("label-rgb").innerText = "Kematangan (RGB): Tomat tidak terdeteksi";
    return;
  }

  tgtCtx.putImageData(segmentedImageData, 0, 0);
  classifyTomatoMulti(totalR, totalG, totalB, pixelCount, "RGB");
}


function classifyTomatoByRGB(sourceCanvasId) {
  const canvas = document.getElementById(sourceCanvasId);
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (!(r < 10 && g < 10 && b < 10)) { // abaikan hitam
      totalR += r;
      totalG += g;
      totalB += b;
      pixelCount++;
    }
  }

  classifyTomatoMulti(totalR, totalG, totalB, pixelCount, "RGB");
}

function classifyTomatoMulti(totalR, totalG, totalB, pixelCount, mode = "HSV") {
  const label = document.getElementById(mode === "RGB" ? 'label-rgb' : 'label-hsv');

  if (pixelCount < 100) {
    label.innerText = `Kematangan (${mode}): Tomat tidak terdeteksi`;
    return;
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  const [h, s, v] = rgbToHsv(avgR / 255, avgG / 255, avgB / 255);

  let result = "Tidak Terdefinisi";

  // Penilaian berdasarkan nilai Hue dan Value dari HSV
  if (v < 0.2) {
    result = "Busuk";
  } else if (h >= 0 && h <= 0.06 && v > 0.5) {
    result = "Matang";
  } else if (h >= 0 && h <= 0.06 && v <= 0.5) {
    result = "Hampir Matang";
  } else if (h >= 0.06 && h <= 0.18) {
    result = "Setengah Matang";
  } else if (h >= 0.18 && h <= 0.44) {
    result = "Mentah";
  }

  label.innerText = `Kematangan (${mode}): ${result}`;
  console.log(`[${mode}] HSV avg: H=${(h*360).toFixed(1)}° S=${s.toFixed(2)} V=${v.toFixed(2)} => ${result}`);
}