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
    // Asumsikan hasil restorasi/tepi memiliki latar belakang hitam (nilai mendekati 0)
    // dan objek tomat memiliki nilai lebih tinggi. Threshold bisa disesuaikan.
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
 * Fungsi untuk klasifikasi berdasarkan warna rata-rata.
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

  // Hitung warna rata-rata
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  let result = "Tidak Terdefinisi";

  // Logika Klasifikasi (nilai threshold ini perlu disesuaikan melalui eksperimen)
  // 1. Dominan Merah -> Matang
  if (avgR > 120 && avgG < 100 && avgB < 100) {
    result = "Matang";
  }
  // 2. Dominan Hijau -> Mentah
  else if (avgG > 100 && avgR < 100) {
    result = "Mentah";
  }
  // 3. Warna Gelap/Kecoklatan -> Busuk
  // (Rendah di R dan G, atau R dan G hampir seimbang tapi gelap)
  else if (avgR < 80 && avgG < 80) {
     result = "Busuk";
  }
  // Kondisi default
  else {
    // Bisa jadi tomat Oranye (setengah matang) atau kondisi pencahayaan lain
    if (avgR > avgG) {
      result = "Setengah Matang";
    } else {
      result = "Mentah";
    }
  }

  // Tampilkan hasil klasifikasi di UI
  const labelElement = document.getElementById('label');
  labelElement.innerText = `Kematangan: ${result}`;
  console.log(`Warna Rata-rata: R=${avgR.toFixed(2)}, G=${avgG.toFixed(2)}, B=${avgB.toFixed(2)}`);
}