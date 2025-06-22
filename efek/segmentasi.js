function segmentTomatoHSV(sourceCanvasId, targetCanvasId) {
  const hsvCanvas = document.getElementById(sourceCanvasId);
  const segCanvas = document.getElementById(targetCanvasId);
  const hsvCtx = hsvCanvas.getContext('2d');
  const segCtx = segCanvas.getContext('2d');

  const originalCanvas = document.getElementById('canvas-digitalisasi');
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
    result = "Busuk / Sangat Gelap";
  } else if (h >= 0 && h <= 0.06 && v > 0.3) {
    result = "Merah Matang";
  } else if (h >= 0 && h <= 0.06 && v <= 0.3) {
    result = "Coklat / Merah Tua";
  } else if (h >= 0.08 && h <= 0.18) {
    result = "Kuning";
  } else if (h >= 0.22 && h <= 0.44) {
    result = "Hijau / Mentah";
  }

  label.innerText = `Kematangan (${mode}): ${result}`;
  console.log(`[${mode}] HSV avg: H=${(h*360).toFixed(1)}° S=${s.toFixed(2)} V=${v.toFixed(2)} => ${result}`);
}