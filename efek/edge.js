// efek/edge.js
function enhanceEdge(sourceCanvasId, targetCanvasId) {
    const srcCanvas = document.getElementById(sourceCanvasId);
    const tgtCanvas = document.getElementById(targetCanvasId);
    const srcCtx = srcCanvas.getContext('2d');
    const tgtCtx = tgtCanvas.getContext('2d');

    tgtCtx.drawImage(srcCanvas, 0, 0, tgtCanvas.width, tgtCanvas.height);

    const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const tgtImageData = tgtCtx.getImageData(0, 0, tgtCanvas.width, tgtCanvas.height);
    const srcData = srcImageData.data;
    const tgtData = tgtImageData.data;

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    for (let y = 1; y < srcCanvas.height - 1; y++) {
        for (let x = 1; x < srcCanvas.width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;

            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const pixelIndex = ((y + j) * srcCanvas.width + (x + i)) * 4;
                    const intensity = (srcData[pixelIndex] + srcData[pixelIndex + 1] + srcData[pixelIndex + 2]) / 3;

                    pixelX += intensity * sobelX[j + 1][i + 1];
                    pixelY += intensity * sobelY[j + 1][i + 1];
                }
            }

            const magnitude = Math.sqrt(pixelX ** 2 + pixelY ** 2);
            const targetIndex = (y * tgtCanvas.width + x) * 4;

            tgtData[targetIndex] = magnitude;
            tgtData[targetIndex + 1] = magnitude;
            tgtData[targetIndex + 2] = magnitude;
            tgtData[targetIndex + 3] = 255;
        }
    }

    tgtCtx.putImageData(tgtImageData, 0, 0);
}