// efek/segmentasi.js
function segmentTomato(sourceCanvasId, targetCanvasId) {
  const edgeCanvas = document.getElementById(sourceCanvasId); // Input: canvas-restore
  const segCanvas = document.getElementById(targetCanvasId);   // Output: canvas-segmentasi
  const edgeCtx = edgeCanvas.getContext('2d');
  const segCtx = segCanvas.getContext('2d');

  // Ambil gambar warna asli dari canvas pertama (Digitalisasi)
  const originalCanvas = document.getElementById('canvas-digitalisasi');
  const originalCtx = originalCanvas.getContext('2d');
  const originalImageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
  const originalData = originalImageData.data;

  // Ambil gambar tepi dari canvas hasil restorasi
  const edgeImageData = edgeCtx.getImageData(0, 0, edgeCanvas.width, edgeCanvas.height);
  const edgeData = edgeImageData.data;

  // Buat data gambar baru untuk hasil segmentasi
  const segmentedImageData = segCtx.createImageData(segCanvas.width, segCanvas.height);
  const segmentedData = segmentedImageData.data;

  let totalR = 0, totalG = 0, totalB = 0;
  let pixelCount = 0;

  // Buat 'mask' dari gambar tepi dan terapkan pada gambar asli
  for (let i = 0; i < edgeData.length; i += 4) {
    const isObject = edgeData[i] > 50; // Threshold untuk menentukan bagian dari tomat

    if (isObject) {
      // Jika bagian dari objek, salin piksel warna asli
      segmentedData[i] = originalData[i];       // R
      segmentedData[i + 1] = originalData[i + 1]; // G
      segmentedData[i + 2] = originalData[i + 2]; // B
      segmentedData[i + 3] = 255;               // Alpha

      // Kumpulkan nilai warna untuk dianalisis
      totalR += originalData[i];
      totalG += originalData[i + 1];
      totalB += originalData[i + 2];
      pixelCount++;

    } else {
      // Jika bukan bagian dari objek (latar belakang), buat jadi hitam
      segmentedData[i] = 0;
      segmentedData[i + 1] = 0;
      segmentedData[i + 2] = 0;
      segmentedData[i + 3] = 255;
    }
  }

  // Tampilkan gambar tomat yang sudah disegmentasi
  segCtx.putImageData(segmentedImageData, 0, 0);

  // Lakukan klasifikasi setelah segmentasi selesai
  classifyTomato(totalR, totalG, totalB, pixelCount);
}

/**
 * Fungsi untuk klasifikasi berdasarkan warna rata-rata (diubah ke basis Hue).
 * @param {number} totalR - Jumlah total nilai Merah.
 * @param {number} totalG - Jumlah total nilai Hijau.
 * @param {number} totalB - Jumlah total nilai Biru.
 * @param {number} pixelCount - Jumlah total piksel tomat.
 */
function classifyTomato(totalR, totalG, totalB, pixelCount) {
  if (pixelCount === 0) {
    document.getElementById('label').innerText = "Kematangan: Tomat tidak terdeteksi";
    return;
  }

  // Hitung warna rata-rata dalam RGB
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  // --- PERUBAHAN UTAMA: Konversi rata-rata RGB ke HSV ---
  const hsv = rgbToHsv(avgR, avgG, avgB);
  const avg_H = hsv.h; // Ambil nilai Hue (0-360)

  let kematangan = "Tidak Terdefinisi";

  // --- PERUBAHAN UTAMA: Logika klasifikasi baru berdasarkan HUE ---
  if (avg_H >= 60 && avg_H <= 140) {
    kematangan = "Mentah";
  } else if ((avg_H >= 0 && avg_H <= 20) || (avg_H >= 340 && avg_H <= 360)) {
    kematangan = "Matang";
  } else if (avg_H > 20 && avg_H < 60) {
    // Asumsi warna oranye/coklat gelap untuk tomat busuk
    kematangan = "Busuk";
  }

  // Tampilkan hasil klasifikasi di UI
  const labelElement = document.getElementById('label');
  labelElement.innerText = `Kematangan: ${kematangan}`;
  
  // Console log sekarang juga menampilkan Hue untuk memudahkan debugging/penyesuaian
  console.log(`RGB Avg: R=${avgR.toFixed(2)}, G=${avgG.toFixed(2)}, B=${avgB.toFixed(2)} | HSV Avg: H=${avg_H.toFixed(2)}, S=${hsv.s.toFixed(2)}, V=${hsv.v.toFixed(2)}`);
}

/**
 * Fungsi helper untuk mengubah nilai RGB ke HSV.
 * @param {number} r - Nilai merah (0-255)
 * @param {number} g - Nilai hijau (0-255)
 * @param {number} b - Nilai biru (0-255)
 * @returns {object} - Objek berisi {h, s, v}
 */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;

  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic (grayscale)
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s, v: v };
}