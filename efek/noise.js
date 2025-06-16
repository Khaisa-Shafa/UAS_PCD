// efek/noise.js
function addSaltAndPepperNoise(sourceCanvasId, targetCanvasId, noiseLevel = 0.5) {
  const source = document.getElementById(sourceCanvasId);
  const target = document.getElementById(targetCanvasId);
  const ctxSrc = source.getContext('2d');
  const ctxDst = target.getContext('2d');

  const imageData = ctxSrc.getImageData(0, 0, source.width, source.height);
  const data = imageData.data;

  const totalPixels = source.width * source.height;
  const numNoisyPixels = totalPixels * noiseLevel;

  for (let i = 0; i < numNoisyPixels; i++) {
    const x = Math.floor(Math.random() * source.width);
    const y = Math.floor(Math.random() * source.height);
    const idx = (y * source.width + x) * 4;
    const saltOrPepper = Math.random() < 0.5 ? 0 : 255;

    data[idx] = saltOrPepper;
    data[idx + 1] = saltOrPepper;
    data[idx + 2] = saltOrPepper;
  }
  ctxDst.putImageData(imageData, 0, 0);
}