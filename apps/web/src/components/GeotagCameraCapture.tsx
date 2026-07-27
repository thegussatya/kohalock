import React, { useState, useRef, useEffect, useCallback } from 'react';

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
};

type GeotagCameraCaptureProps = {
  onCapture?: (coords: { lat: number; lng: number } | null) => void;
};

export default function GeotagCameraCapture({ onCapture }: GeotagCameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });
  
  const [currentTime, setCurrentTime] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update waktu setiap detik selama kamera terbuka
  useEffect(() => {
    let interval: number;
    if (isCameraOpen && !hasCaptured) {
      interval = window.setInterval(() => {
        const now = new Date();
        const formatted = now.toLocaleString('id-ID', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        setCurrentTime(formatted);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isCameraOpen, hasCaptured]);

  // Mengambil koordinat GPS lokasi
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolokasi tidak didukung oleh browser ini.' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => {
        let errorText = 'Gagal mengambil lokasi.';
        if (error.code === error.PERMISSION_DENIED) errorText = 'Izin lokasi ditolak oleh pengguna.';
        setLocation(prev => ({ ...prev, error: errorText }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Membuka kamera dengan environment mode (kamera belakang jika di HP)
  const openCamera = async () => {
    setErrorMsg(null);
    setHasCaptured(false);
    setPhotoUrl(null);
    
    // Langsung request lokasi saat kamera dibuka
    getLocation();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errText = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError') errText = 'Izin kamera ditolak oleh pengguna.';
      else if (err.name === 'NotFoundError') errText = 'Kamera tidak ditemukan pada perangkat ini.';
      setErrorMsg(errText);
    }
  };

  // Mengambil gambar dari video dan menambahkan watermark lewat Canvas
  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Gambar frame video asli ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Siapkan kotak hitam transparan sebagai background watermark
    const rectHeight = 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - rectHeight, canvas.width, rectHeight);

    // Tulis teks watermark putih
    ctx.fillStyle = '#ffffff';
    // Menyesuaikan ukuran font secara dinamis berdasarkan lebar gambar
    const fontSize = Math.max(14, Math.floor(canvas.width / 40));
    ctx.font = `${fontSize}px monospace`;
    
    let latText = 'Lat: Menunggu...';
    let lngText = 'Lng: Menunggu...';
    
    if (location.latitude && location.longitude) {
      latText = `Lat: ${location.latitude.toFixed(6)}`;
      lngText = `Lng: ${location.longitude.toFixed(6)}`;
    } else if (location.error) {
      latText = `Geo Error: ${location.error}`;
      lngText = '';
    }

    // Koordinat penulisan teks
    const paddingLeft = 20;
    const paddingBottom = 20;
    
    if (lngText) {
      ctx.fillText(lngText, paddingLeft, canvas.height - paddingBottom);
      ctx.fillText(latText, paddingLeft, canvas.height - paddingBottom - (fontSize * 1.5));
      ctx.fillText(`Waktu: ${currentTime}`, paddingLeft, canvas.height - paddingBottom - (fontSize * 3));
    } else {
      ctx.fillText(latText, paddingLeft, canvas.height - paddingBottom);
      ctx.fillText(`Waktu: ${currentTime}`, paddingLeft, canvas.height - paddingBottom - (fontSize * 1.5));
    }

    // Ekspor canvas jadi URL gambar JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoUrl(dataUrl);
    setHasCaptured(true);
    
    if (onCapture) {
      if (location.latitude && location.longitude) {
        onCapture({ lat: location.latitude, lng: location.longitude });
      } else {
        onCapture(null);
      }
    }
    
    // Matikan kamera setelah jepret
    stopCamera();
    setIsCameraOpen(false);
  };

  const retakePhoto = () => {
    openCamera();
  };

  // Bersihkan kamera kalau komponen di-unmount agar tidak menyala terus
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="w-full">
      {/* State 1: Awal, belum membuka kamera */}
      {!isCameraOpen && !hasCaptured && (
        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors hover:bg-slate-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-6 max-w-sm">
            Gunakan kamera aplikasi secara langsung untuk melampirkan foto bukti lapangan dengan koordinat lokasi (Geotagging) asli tanpa rekayasa.
          </p>
          <button
            type="button"
            onClick={openCamera}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Buka Kamera Aplikasi
          </button>
          
          {errorMsg && (
            <p className="text-sm font-bold text-red-600 mt-4 bg-red-50 px-4 py-2 rounded-lg border border-red-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {errorMsg}
            </p>
          )}
        </div>
      )}

      {/* State 2: Kamera Aktif siap memotret */}
      {isCameraOpen && !hasCaptured && (
        <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[4/3] md:aspect-video shadow-md border border-slate-300">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          ></video>
          
          {/* Overlay Watermark (Preview UI) */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-xs sm:text-sm font-mono backdrop-blur-sm pointer-events-none">
            <div className="mb-1 font-bold text-yellow-300">Timestamp: {currentTime}</div>
            {location.error ? (
              <div className="text-red-400 font-semibold">{location.error}</div>
            ) : location.latitude && location.longitude ? (
              <div className="font-semibold text-blue-200">
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lng: {location.longitude.toFixed(6)}</div>
              </div>
            ) : (
              <div className="text-slate-400 animate-pulse font-semibold">Sedang mencari lokasi...</div>
            )}
          </div>

          {/* Shutter Button */}
          <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
            <button
              type="button"
              onClick={takePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-[6px] border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              title="Ambil Foto"
            >
              <div className="w-12 h-12 border-2 border-slate-400 rounded-full"></div>
            </button>
          </div>
          
          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setIsCameraOpen(false);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none z-10"
            title="Tutup Kamera"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* State 3: Foto berhasil diambil (Preview Hasil) */}
      {hasCaptured && photoUrl && (
        <div className="w-full relative rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-100">
          <img src={photoUrl} alt="Hasil Foto Geotagging" className="w-full h-auto object-cover" />
          
          {/* Action Buttons Floating */}
          <div className="absolute top-4 right-4 flex gap-3">
            <button
              type="button"
              onClick={retakePhoto}
              className="px-4 py-2 bg-white/95 backdrop-blur-md text-slate-800 text-sm font-bold rounded-lg shadow-lg hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Ambil Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
