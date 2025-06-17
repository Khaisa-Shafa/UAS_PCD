// efek/restoration.js
function restoreImage(sourceCanvasId, targetCanvasId) {
  const srcCanvas = document.getElementById(sourceCanvasId);
  const tgtCanvas = document.getElementById(targetCanvasId);
  const srcCtx = srcCanvas.getContext('2d');
  const tgtCtx = tgtCanvas.getContext('2d');

  // Gambar citra sumber ke target terlebih dahulu
  tgtCtx.drawImage(srcCanvas, 0, 0, tgtCanvas.width, tgtCanvas.height);

  const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const tgtImageData = tgtCtx.createImageData(srcCanvas.width, srcCanvas.height); // Buat data gambar baru
  const srcData = srcImageData.data;
  const tgtData = tgtImageData.data;
  const width = srcCanvas.width;

  // Terapkan Median Filter
  // Loop melalui setiap piksel (abaikan pinggiran 1 piksel)
  for (let y = 1; y < srcCanvas.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const neighborR = [];
      const neighborG = [];
      const neighborB = [];

      // Ambil nilai piksel dari area 3x3 di sekitarnya
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const pixelIndex = ((y + j) * width + (x + i)) * 4;
          neighborR.push(srcData[pixelIndex]);
          neighborG.push(srcData[pixelIndex + 1]);
          neighborB.push(srcData[pixelIndex + 2]);
        }
      }

      // Urutkan nilai dari setiap channel warna
      neighborR.sort((a, b) => a - b);
      neighborG.sort((a, b) => a - b);
      neighborB.sort((a, b) => a - b);

      // Ambil nilai tengah (median)
      const medianR = neighborR[4];
      const medianG = neighborG[4];
      const medianB = neighborB[4];

      const targetIndex = (y * width + x) * 4;
      tgtData[targetIndex] = medianR;
      tgtData[targetIndex + 1] = medianG;
      tgtData[targetIndex + 2] = medianB;
      tgtData[targetIndex + 3] = 255; // Alpha
    }
  }

  // Tampilkan hasil restorasi ke canvas target
  tgtCtx.putImageData(tgtImageData, 0, 0);
}