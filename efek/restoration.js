// // efek/restoration.js

function restoreImage(sourceCanvasId, targetCanvasId, filterSize = 3) {
  const src = document.getElementById(sourceCanvasId);
  const dst = document.getElementById(targetCanvasId);
  const ctxSrc = src.getContext('2d');
  const ctxDst = dst.getContext('2d');

  const imageData = ctxSrc.getImageData(0, 0, src.width, src.height);
  const data = imageData.data;
  const output = ctxDst.createImageData(src.width, src.height);

  const width = src.width;
  const height = src.height;
  const half = Math.floor(filterSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
            const offset = (ny * width + nx) * 4;
            r += data[offset];
            g += data[offset + 1];
            b += data[offset + 2];
            count++;
          }
        }
      }

      const i = (y * width + x) * 4;
      output.data[i] = Math.round(r / count);
      output.data[i + 1] = Math.round(g / count);
      output.data[i + 2] = Math.round(b / count);
      output.data[i + 3] = 255; // full opacity
    }
  }

  ctxDst.putImageData(output, 0, 0);
}

// function restoreImage(sourceCanvasId, targetCanvasId) {
//   const srcCanvas = document.getElementById(sourceCanvasId);
//   const tgtCanvas = document.getElementById(targetCanvasId);
//   const srcCtx = srcCanvas.getContext('2d');
//   const tgtCtx = tgtCanvas.getContext('2d');

//   // Gambar citra sumber ke target terlebih dahulu
//   tgtCtx.drawImage(srcCanvas, 0, 0, tgtCanvas.width, tgtCanvas.height);

//   const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
//   const tgtImageData = tgtCtx.createImageData(srcCanvas.width, srcCanvas.height); // Buat data gambar baru
//   const srcData = srcImageData.data;
//   const tgtData = tgtImageData.data;
//   const width = srcCanvas.width;

//   // Terapkan Median Filter
//   // Loop melalui setiap piksel (abaikan pinggiran 1 piksel)
//   for (let y = 1; y < srcCanvas.height - 1; y++) {
//     for (let x = 1; x < width - 1; x++) {
//       const neighborR = [];
//       const neighborG = [];
//       const neighborB = [];

//       // Ambil nilai piksel dari area 3x3 di sekitarnya
//       for (let j = -1; j <= 1; j++) {
//         for (let i = -1; i <= 1; i++) {
//           const pixelIndex = ((y + j) * width + (x + i)) * 4;
//           neighborR.push(srcData[pixelIndex]);
//           neighborG.push(srcData[pixelIndex + 1]);
//           neighborB.push(srcData[pixelIndex + 2]);
//         }
//       }

//       // Urutkan nilai dari setiap channel warna
//       neighborR.sort((a, b) => a - b);
//       neighborG.sort((a, b) => a - b);
//       neighborB.sort((a, b) => a - b);

//       // Ambil nilai tengah (median)
//       const medianR = neighborR[4];
//       const medianG = neighborG[4];
//       const medianB = neighborB[4];

//       const targetIndex = (y * width + x) * 4;
//       tgtData[targetIndex] = medianR;
//       tgtData[targetIndex + 1] = medianG;
//       tgtData[targetIndex + 2] = medianB;
//       tgtData[targetIndex + 3] = 255; // Alpha
//     }
//   }

//   // Tampilkan hasil restorasi ke canvas target
//   tgtCtx.putImageData(tgtImageData, 0, 0);
// }