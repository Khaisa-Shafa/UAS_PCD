// efek/kontras.js

function adjustContrast(sourceCanvasId, targetCanvasId, contrast = 40) {
  const srcCanvas = document.getElementById(sourceCanvasId);
  const dstCanvas = document.getElementById(targetCanvasId);
  
  if (!srcCanvas || !dstCanvas) {
  console.error("Canvas tidak ditemukan.");
  return;
 }

 const srcCtx = srcCanvas.getContext('2d');
 const dstCtx = dstCanvas.getContext('2d');

 if (!srcCtx || !dstCtx) {
  console.error("Context 2D tidak tersedia.");
  return;
 }

 // Samakan ukuran canvas tujuan dengan sumber
 dstCanvas.width = srcCanvas.width;
 dstCanvas.height = srcCanvas.height;

 const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
 const data = imageData.data;
 
 const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

 for (let i = 0; i < data.length; i += 4) {
  data[i]   = truncate(factor * (data[i] - 128) + 128);     // Red
  data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // Green
  data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // Blue
  // Alpha (data[i + 3]) tidak diubah
 }

 dstCtx.putImageData(output, 0, 0);

 function truncate(value) {
  return Math.max(0, Math.min(255, value));
 }
}
