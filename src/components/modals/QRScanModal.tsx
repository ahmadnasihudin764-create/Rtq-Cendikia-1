import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  SwitchCamera, 
  Upload, 
  Clock, 
  ShieldCheck, 
  UserX,
  History,
  Check,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { Santri, AbsensiRecord } from '../../types';

// Web Audio API Sound Synthesizer (No external mp3 assets needed)
const playBeep = (type: 'success' | 'error' | 'already') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Pleasant high double chime (C6 -> G6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);
    } else if (type === 'already') {
      // Gentle notification tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      // Low error buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
};

export const QRScanModal: React.FC = () => {
  const { 
    isQRScannerOpen, 
    setIsQRScannerOpen, 
    santriList, 
    absensiList,
    recordAbsensi, 
    showToast 
  } = useApp();

  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [inputNIS, setInputNIS] = useState('');
  const [lastScannedSantri, setLastScannedSantri] = useState<{
    santri: Santri;
    timestamp: string;
    isNew: boolean;
    existingRecord?: AbsensiRecord;
  } | null>(null);

  const [sessionScannedList, setSessionScannedList] = useState<Array<{
    santri: Santri;
    time: string;
    status: string;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const lastScannedPayloadRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract NIS from raw QR text
  const extractNISFromQR = (rawText: string): string => {
    if (!rawText) return '';
    const trimmed = rawText.trim();

    // 1. JSON format: {"nis":"STR001"} or {"NIS":"STR001"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.nis || parsed.NIS) {
          return String(parsed.nis || parsed.NIS).trim().toUpperCase();
        }
      } catch (e) {
        // Not valid JSON, continue
      }
    }

    // 2. URL parameter: https://...?nis=STR001 or /santri/STR001
    if (trimmed.includes('nis=')) {
      const match = trimmed.match(/nis=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) return match[1].toUpperCase();
    }
    if (trimmed.includes('/santri/')) {
      const parts = trimmed.split('/santri/');
      if (parts[1]) return parts[1].split(/[?#&]/)[0].toUpperCase();
    }

    // 3. Prefixes like "RTQ:STR001", "ID:STR001", "NIS:STR001"
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      return parts[parts.length - 1].trim().toUpperCase();
    }

    // 4. Pure NIS code like "STR001"
    return trimmed.toUpperCase();
  };

  // Process Validated Santri Scan
  const processSantriScan = useCallback((rawCode: string) => {
    const nis = extractNISFromQR(rawCode);
    if (!nis) return;

    // Cooldown check (prevent rapid multiple scanning of identical QR within 3 seconds)
    const now = Date.now();
    if (lastScannedPayloadRef.current.code === nis && now - lastScannedPayloadRef.current.time < 3000) {
      return;
    }
    lastScannedPayloadRef.current = { code: nis, time: now };

    // Search Database
    const matchedSantri = santriList.find(s => s.NIS.toUpperCase() === nis);

    if (!matchedSantri) {
      if (soundEnabled) playBeep('error');
      showToast(`Data Santri dengan NIS "${nis}" tidak ditemukan di database!`, 'error');
      return;
    }

    // Check status
    if (matchedSantri.Status !== 'Aktif') {
      if (soundEnabled) playBeep('error');
      showToast(`Santri ${matchedSantri.Nama_Lengkap} berstatus "${matchedSantri.Status}"!`, 'warning');
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const nowTimeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Check if already checked in today
    const existingAbsensi = absensiList.find(
      a => a.NIS.toUpperCase() === matchedSantri.NIS.toUpperCase() && a.tanggal === todayDate
    );

    if (existingAbsensi) {
      if (soundEnabled) playBeep('already');
      showToast(`Santri ${matchedSantri.Nama_Lengkap} sudah absen sebelumnya (Pukul ${existingAbsensi.waktuScan || 'Tercatat'}).`, 'info');
      
      setLastScannedSantri({
        santri: matchedSantri,
        timestamp: existingAbsensi.waktuScan || nowTimeString,
        isNew: false,
        existingRecord: existingAbsensi
      });
      return;
    }

    // Record new attendance automatically
    const newRecord: AbsensiRecord = {
      id: 'ABS_' + Date.now(),
      tanggal: todayDate,
      NIS: matchedSantri.NIS,
      namaSantri: matchedSantri.Nama_Lengkap,
      halaqah: matchedSantri.Halaqah,
      status: 'Hadir',
      waktuScan: nowTimeString,
      keterangan: 'Hadir Tepat Waktu (Scan Kamera QR Real-time)'
    };

    recordAbsensi(newRecord);
    if (soundEnabled) playBeep('success');

    // Confetti celebration
    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.6 }
    });

    setLastScannedSantri({
      santri: matchedSantri,
      timestamp: nowTimeString,
      isNew: true,
      existingRecord: newRecord
    });

    setSessionScannedList(prev => [
      { santri: matchedSantri, time: nowTimeString, status: 'Hadir' },
      ...prev.filter(item => item.santri.NIS !== matchedSantri.NIS)
    ]);

    setInputNIS('');
  }, [santriList, absensiList, recordAbsensi, showToast, soundEnabled]);

  // Frame processing loop with jsQR
  const scanVideoFrame = useCallback(() => {
    if (
      videoRef.current && 
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && 
      canvasRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          processSantriScan(code.data);
        }
      }
    }

    if (cameraActive) {
      requestAnimationRef.current = requestAnimationFrame(scanVideoFrame);
    }
  }, [cameraActive, processSantriScan]);

  // Camera Lifecycle
  useEffect(() => {
    if (!isQRScannerOpen || !cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
      return;
    }

    setCameraError(null);

    navigator.mediaDevices?.getUserMedia({
      video: {
        facingMode: cameraFacing,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            requestAnimationRef.current = requestAnimationFrame(scanVideoFrame);
          }).catch(err => {
            console.error('Video play error:', err);
          });
        }
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setCameraError(
          'Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diberikan di peramban (browser) Anda.'
        );
        setCameraActive(false);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [isQRScannerOpen, cameraActive, cameraFacing, scanVideoFrame]);

  // Handle Image File Upload containing QR Code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processSantriScan(code.data);
          } else {
            showToast('Tidak ada QR Code yang terdeteksi pada gambar yang diunggah.', 'error');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputNIS.trim()) {
      processSantriScan(inputNIS);
    }
  };

  if (!isQRScannerOpen) return null;

  return (
    <div id="modal-qr-scan" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-800/30 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-yellow-400 text-emerald-950 rounded-xl font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">Scanner Kamera QR Presensi</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Camera
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90">
                Pindai Kartu Santri & catat kehadiran langsung ke database
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQRScannerOpen(false)}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Real-time Camera Viewfinder */}
          <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-600 shadow-lg">
            
            {/* Hidden canvas for jsQR analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Target Overlays */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60 border-2 border-emerald-400/50 rounded-2xl">
                    {/* Corner Target Markers */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-bounce top-1/2 shadow-sm shadow-yellow-400" />
                  </div>
                </div>

                {/* Live Scanning Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Mendeteksi QR Code...</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kamera Sedang Nonaktif</h4>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                    {cameraError || 'Aktifkan kamera perangkat untuk memindai kartu secara otomatis.'}
                  </p>
                </div>
                <button
                  onClick={() => setCameraActive(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 mx-auto"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Nyalakan Kamera Perangkat</span>
                </button>
              </div>
            )}

            {/* Quick Camera Controls Toolbar */}
            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    soundEnabled ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-400 hover:bg-white/10'
                  }`}
                  title={soundEnabled ? 'Matikan Suara Beep' : 'Nyalakan Suara Beep'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="p-1.5 text-white hover:bg-white/10 rounded-lg text-xs transition"
                  title="Ganti Kamera Depan / Belakang"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-emerald-300 hover:bg-white/10 rounded-lg text-xs transition"
                  title="Pindai dari Gambar/Foto QR"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {cameraActive && (
                <button
                  onClick={() => setCameraActive(false)}
                  className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold rounded-xl backdrop-blur-md transition"
                >
                  Matikan
                </button>
              )}
            </div>

          </div>

          {/* Scanned Santri Instant Recognition Card */}
          {lastScannedSantri && (
            <div className={`p-4 rounded-2xl border transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
              lastScannedSantri.isNew 
                ? 'bg-emerald-50 border-emerald-300 shadow-sm' 
                : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex items-start gap-3">
                {/* Santri Photo / Initial */}
                <div className="w-12 h-14 rounded-xl bg-emerald-950 overflow-hidden flex items-center justify-center shrink-0 border border-emerald-700 shadow-xs">
                  {lastScannedSantri.santri.Foto ? (
                    <img 
                      src={lastScannedSantri.santri.Foto} 
                      alt={lastScannedSantri.santri.Nama_Lengkap} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-xl font-bold text-yellow-300">
                      {lastScannedSantri.santri.Nama_Lengkap.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Data Details */}
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-gray-900 truncate text-sm">
                      {lastScannedSantri.santri.Nama_Lengkap}
                    </h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                      lastScannedSantri.isNew 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-amber-600 text-white'
                    }`}>
                      {lastScannedSantri.isNew ? '✓ Berhasil Hadir' : 'Sudah Absen'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-gray-600 mt-1">
                    <p><strong className="text-emerald-800 font-mono">NIS:</strong> {lastScannedSantri.santri.NIS}</p>
                    <p><strong className="text-gray-700">Waktu:</strong> {lastScannedSantri.timestamp}</p>
                    <p className="truncate"><strong className="text-gray-700">Halaqah:</strong> {lastScannedSantri.santri.Halaqah}</p>
                    <p className="truncate"><strong className="text-gray-700">Wali:</strong> {lastScannedSantri.santri.Nama_Wali}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Form & Barcode Gun Support */}
          <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-gray-700 uppercase tracking-wider">
                Input NIS Manual / Barcode Scanner Gun
              </label>
              <span className="text-gray-400 text-[10px]">Tekan Enter untuk Simpan</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputNIS}
                onChange={(e) => setInputNIS(e.target.value)}
                placeholder="Ketik NIS (contoh: STR001)"
                className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>Validasi & Absen</span>
              </button>
            </div>
          </form>

          {/* Live Attendance Queue in this Session */}
          {sessionScannedList.length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Riwayat Scan Sesi Ini ({sessionScannedList.length} Santri)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Tersimpan Otomatis</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {sessionScannedList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-100 flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <span className="font-semibold text-gray-800 truncate">{item.santri.Nama_Lengkap}</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">({item.santri.NIS})</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 shrink-0 ml-2">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Demo Simulator buttons */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Uji Coba Cepat Data Santri (Simulasi Kartu):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-1">
              {santriList.slice(0, 6).map((s) => (
                <button
                  key={s.NIS}
                  type="button"
                  onClick={() => processSantriScan(s.NIS)}
                  className="p-2 text-left border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition text-[11px] flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-800 truncate">{s.Nama_Lengkap.split(' ')[0]}</span>
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold">{s.NIS}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-500 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Validasi Instan Database RTQ Cendikia</span>
          </span>
          <button
            onClick={() => setIsQRScannerOpen(false)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
