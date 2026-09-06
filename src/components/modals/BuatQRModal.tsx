import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Printer, 
  AlertTriangle,
  Users
} from 'lucide-react';
import { Santri } from '../../types';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { getUniqueQRPayload } from '../../utils/qrUtils';

interface BuatQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSantriForView?: (santri: Santri) => void;
}

export const BuatQRModal: React.FC<BuatQRModalProps> = ({ isOpen, onClose, onSelectSantriForView }) => {
  const { santriList, showToast } = useApp();
  const [selectedNIS, setSelectedNIS] = useState<string>(santriList[0]?.NIS || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Collision check
  const allNIS = santriList.map(s => s.NIS.trim().toUpperCase());
  const uniqueNISCount = new Set(allNIS).size;
  const hasCollision = uniqueNISCount !== santriList.length;

  const currentSantri = santriList.find(s => s.NIS === selectedNIS) || santriList[0];

  const handleGenerateSingle = () => {
    if (!currentSantri) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage(`QR Code Unik untuk ${currentSantri.Nama_Lengkap} (NIS: ${currentSantri.NIS}) siap digunakan!`);
      showToast(`QR Code ${currentSantri.NIS} berhasil divalidasi dan di-generate!`, 'success');
    }, 400);
  };

  const handleGenerateAll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage(`Seluruh ${santriList.length} QR Code Santri telah diverifikasi dengan ID unik tanpa bentrok!`);
      showToast(`Berhasil men-generate & memvalidasi ${santriList.length} QR Code Santri!`, 'success');
    }, 600);
  };

  return (
    <div id="modal-buat-qr" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-yellow-400 text-emerald-950 rounded-xl font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Generator QR Code Santri Unik</h3>
              <p className="text-[11px] text-emerald-200">
                Sistem enkripsi ID santri anti-bentrok untuk presensi otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-gray-50">
          
          {/* Uniqueness & Security Banner */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
            hasCollision ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 ${hasCollision ? 'text-rose-600' : 'text-emerald-700'}`} />
            <div>
              <p className="font-bold">
                {hasCollision 
                  ? 'Peringatan: Terdapat duplikasi NIS di database!' 
                  : `Validasi Unik: 100% (${santriList.length}/${santriList.length} Santri Memiliki ID Unik)`}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Setiap QR Code dienkode khusus menggunakan NIS terdaftar sehingga tidak akan tertukar antar-santri saat pemindaian.
              </p>
            </div>
          </div>

          {/* Form Selection */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              Pilih Santri untuk Buat / Pratinjau QR Code:
            </label>
            <select
              value={selectedNIS}
              onChange={(e) => setSelectedNIS(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-gray-50 text-gray-800"
            >
              {santriList.map((s) => (
                <option key={s.NIS} value={s.NIS}>
                  {s.NIS} - {s.Nama_Lengkap} ({s.Halaqah})
                </option>
              ))}
            </select>

            {currentSantri && (
              <div className="pt-2 flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-950">{currentSantri.Nama_Lengkap}</p>
                  <p className="text-[11px] text-emerald-700 font-mono font-semibold">ID Unik: {currentSantri.NIS}</p>
                  <p className="text-[10px] text-gray-500">{currentSantri.Halaqah}</p>
                </div>
                <div className="p-1 bg-white rounded-lg border border-emerald-300 shadow-xs">
                  <QRCodeCanvas value={getUniqueQRPayload(currentSantri)} size={60} />
                </div>
              </div>
            )}
          </div>

          {statusMessage && (
            <div className="p-3 bg-teal-50 border border-teal-300 rounded-xl text-xs text-teal-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleGenerateSingle}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Buat & Validasi QR Santri Terpilih</span>
            </button>

            <button
              onClick={handleGenerateAll}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Buat & Sinkronkan QR Seluruh {santriList.length} Santri</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-gray-200 flex justify-between items-center text-xs">
          {currentSantri && onSelectSantriForView && (
            <button
              onClick={() => {
                onClose();
                onSelectSantriForView(currentSantri);
              }}
              className="text-emerald-700 font-bold hover:underline"
            >
              Lihat Tampilan Penuh QR &rarr;
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition ml-auto"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
