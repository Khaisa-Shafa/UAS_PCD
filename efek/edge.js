// efek/edge.js
function enhanceEdge(sourceCanvasId, targetCanvasId) {
    const srcCanvas = document.getElementById(sourceCanvasId);
    const tgtCanvas = document.getElementById(targetCanvasId);
    const srcCtx = srcCanvas.getContext('2d');
    const tgtCtx = tgtCanvas.getContext('2d');

    // Menggambar gambar sumber ke target sebagai dasar
    tgtCtx.drawImage(srcCanvas, 0, 0, tgtCanvas.width, tgtCanvas.height);

    const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const tgtImageData = tgtCtx.getImageData(0, 0, tgtCanvas.width, tgtCanvas.height);
    const srcData = srcImageData.data;
    const tgtData = tgtImageData.data;

    // Kernel Sobel untuk deteksi tepi horizontal (Gx) dan vertikal (Gy)
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

    // Loop melalui setiap piksel (abaikan pinggiran 1 piksel agar kernel tidak keluar batas)
    for (let y = 1; y < srcCanvas.height - 1; y++) {
        for (let x = 1; x < srcCanvas.width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;

            // Terapkan kernel Sobel 3x3
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const pixelIndex = ((y + j) * srcCanvas.width + (x + i)) * 4;
                    // Konversi ke grayscale untuk perhitungan intensitas
                    const intensity = (srcData[pixelIndex] + srcData[pixelIndex + 1] + srcData[pixelIndex + 2]) / 3;

                    pixelX += intensity * sobelX[j + 1][i + 1];
                    pixelY += intensity * sobelY[j + 1][i + 1];
                }
            }

            const magnitude = Math.sqrt(pixelX ** 2 + pixelY ** 2);
            const targetIndex = (y * tgtCanvas.width + x) * 4;

            // Set piksel hasil ke nilai magnitudo (menjadi gambar hitam putih)
            tgtData[targetIndex] = magnitude;     // Red
            tgtData[targetIndex + 1] = magnitude; // Green
            tgtData[targetIndex + 2] = magnitude; // Blue
            tgtData[targetIndex + 3] = 255;       // Alpha
        }
    }

    // Tampilkan hasil gambar yang sudah dideteksi tepinya ke canvas target
    tgtCtx.putImageData(tgtImageData, 0, 0);
}