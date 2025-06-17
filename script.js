// Ambil elemen dari HTML
const video = document.getElementById('video');
const startButton = document.getElementById('startButton');
const switchButton = document.getElementById('switchButton');

// Variabel untuk mengelola state
let currentStream; // Untuk menyimpan stream kamera yang aktif
let isProcessing = false; // Status apakah pemrosesan sedang berjalan
let animationFrameId; // ID untuk mengontrol loop requestAnimationFrame

let videoDevices = []; // Array untuk menyimpan semua perangkat kamera yang tersedia
let currentCameraIndex = 0; // Indeks kamera yang sedang digunakan


// 1. Fungsi untuk mendapatkan daftar kamera dan memulai stream pertama kali
async function initCamera() {
  try {
    // Minta izin dan dapatkan daftar semua perangkat media
    await navigator.mediaDevices.getUserMedia({ video: true }); // Minta izin dulu
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length > 1) {
      // Jika ada lebih dari satu kamera, tampilkan tombol ganti kamera
      switchButton.style.display = 'inline-block';
      console.log('Ditemukan beberapa kamera.');
    }

    // Mulai kamera. Prioritaskan kamera belakang ('environment')
    const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('belakang'));
    if (rearCamera) {
      // Temukan indeks kamera belakang untuk memulai dari sana
      currentCameraIndex = videoDevices.findIndex(device => device.deviceId === rearCamera.deviceId);
    }
    
    startStream();

  } catch (err) {
    console.error("Kamera error:", err);
    alert('Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.');
  }
}

// 2. Fungsi untuk memulai stream video dari kamera yang dipilih
function startStream() {
  // Hentikan stream lama jika ada
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  // Tentukan constraints untuk kamera yang diinginkan
  const constraints = {
    video: {
      deviceId: {
        exact: videoDevices[currentCameraIndex].deviceId
      }
    }
  };

  // Minta stream dari perangkat yang spesifik
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      video.srcObject = stream;
      currentStream = stream;
    })
    .catch(err => console.error("Gagal memulai stream:", err));
}

// 3. Fungsi untuk mengganti kamera
function switchCamera() {
  if (videoDevices.length > 1) {
    // Pindah ke indeks kamera berikutnya, kembali ke 0 jika sudah di akhir
    currentCameraIndex = (currentCameraIndex + 1) % videoDevices.length;
    console.log(`Mengganti ke kamera: ${videoDevices[currentCameraIndex].label}`);
    startStream();
  }
}

// 4. Loop pemrosesan gambar secara real-time
function processFrame() {
  if (!isProcessing) {
    return; // Hentikan loop jika statusnya tidak aktif
  }

  // Logika dari fungsi capture() lama dipindahkan ke sini
  const srcCanvas = document.getElementById('canvas-digitalisasi');
  const ctx = srcCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, srcCanvas.width, srcCanvas.height);

  // Panggil semua efek secara berurutan
  // (Pastikan semua file efek sudah di-load di index.html)
  applyGaussianBlur('canvas-digitalisasi', 'canvas-konvolusi');
  addSaltAndPepperNoise('canvas-konvolusi', 'canvas-noise');
  applyDeblurring('canvas-noise', 'canvas-deblurring');
  convertRGBtoHSV('canvas-deblurring', 'canvas-transformasi');
  adjustContrast('canvas-transformasi', 'canvas-kontras');
  enhanceEdge('canvas-kontras', 'canvas-edge');
  restoreImage('canvas-edge', 'canvas-restore');
  segmentTomato('canvas-restore', 'canvas-segmentasi');

  // Minta browser untuk memanggil fungsi ini lagi sebelum frame berikutnya di-render
  animationFrameId = requestAnimationFrame(processFrame);
}

// 5. Tambahkan event listener untuk tombol
startButton.addEventListener('click', () => {
  isProcessing = !isProcessing;
  if (isProcessing) {
    startButton.textContent = 'Hentikan Analisis';
    // Mulai loop pemrosesan
    processFrame();
  } else {
    startButton.textContent = 'Mulai Analisis';
    // Hentikan loop pemrosesan
    cancelAnimationFrame(animationFrameId);
  }
});

switchButton.addEventListener('click', switchCamera);

// Panggil fungsi inisialisasi saat halaman selesai dimuat
initCamera();