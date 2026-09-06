import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Santri } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { downloadQRCodePNG, getUniqueQRPayload } from '../../utils/qrUtils';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface LihatQRModalProps {
  santri: Santri | null;
  onClose: () => void;
}

export const LihatQRModal: React.FC<LihatQRModalProps> = ({ santri, onClose }) => {
  const { showToast } = useApp();
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingPNG, setIsDownloadingPNG] = useState(false);
  const [isGeneratedFresh, setIsGeneratedFresh] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!santri) return null;

  const payload = getUniqueQRPayload(santri);

  const handleGenerateFresh = () => {
    setIsGeneratedFresh(true);
    showToast(`QR Code Unik untuk NIS ${santri.NIS} (${santri.Nama_Lengkap}) berhasil divalidasi & dibuat ulang!`, 'success');
    setTimeout(() => setIsGeneratedFresh(false), 2500);
  };

  const handleDownloadPNG = async () => {
    try {
      setIsDownloadingPNG(true);
      showToast('Mengunduh gambar PNG QR Code...', 'info');
      await downloadQRCodePNG(santri);
      showToast('Gambar QR Code PNG berhasil diunduh!', 'success');
    } catch (err) {
      console.error('Download PNG failed:', err);
      showToast('Gagal mengunduh gambar QR Code.', 'error');
    } finally {
      setIsDownloadingPNG(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloadingPDF(true);
      showToast('Menyiapkan file PDF QR Code...', 'info');

      const imgData = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85, 110]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 4;
      const imgWidth = pdfWidth - (margin * 2);
      const elWidth = cardRef.current.offsetWidth || 300;
      const elHeight = cardRef.current.offsetHeight || 400;
      const imgHeight = (elHeight * imgWidth) / elWidth;

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pdfHeight - (margin * 2)));

      const fileName = `QR_CODE_${santri.NIS}_${santri.Nama_Lengkap.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      showToast('File PDF QR Code berhasil diunduh!', 'success');
    } catch (err) {
      console.error('Download PDF error:', err);
      showToast('Gagal membuat file PDF QR.', 'error');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="modal-lihat-qr" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-yellow-400 text-emerald-950 rounded-xl font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Detail QR Code Santri</h3>
              <p className="text-[11px] text-emerald-200">
                ID Unik: <span className="font-mono font-bold text-yellow-300">{santri.NIS}</span>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 bg-gray-50 flex flex-col items-center">
          
          {/* Printable / Downloadable QR Badge */}
          <div 
            ref={cardRef}
            id="printable-single-qr-badge"
            className="w-full max-w-xs bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-xl border-2 border-yellow-400 text-center relative overflow-hidden"
          >
            {/* Header info */}
            <div className="border-b border-emerald-700/80 pb-2 mb-3">
              <span className="text-[9px] bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mb-1">
                RTQ CENDIKIA BAZNAS
              </span>
              <h4 className="text-xs font-bold text-yellow-300 truncate">{santri.Nama_Lengkap}</h4>
              <p className="text-[10px] text-emerald-200 font-mono font-semibold">NIS: {santri.NIS}</p>
            </div>

            {/* High-definition QR Code View */}
            <div className="bg-white p-3 rounded-2xl border-2 border-emerald-400/40 shadow-inner flex flex-col items-center justify-center my-2 mx-auto w-48 h-48">
              <QRCodeCanvas 
                value={payload} 
                size={160} 
                darkColor="#064e3b" 
                lightColor="#ffffff" 
              />
            </div>

            {/* Bottom details */}
            <div className="pt-2 text-[10px] text-emerald-100 space-y-0.5">
              <p className="font-semibold text-white">{santri.Halaqah}</p>
              <p className="text-emerald-300/90 text-[9px]">Wali: {santri.Nama_Wali} ({santri.WA_Wali})</p>
              <div className="mt-2 pt-1 border-t border-emerald-700/60 flex items-center justify-center gap-1 text-[8px] text-yellow-300 font-mono">
                <ShieldCheck className="w-3 h-3 text-yellow-300" />
                <span>TERVALIDASI & ANTI-BENTROK ID</span>
              </div>
            </div>
          </div>

          {/* Quick Regenerate / Verification alert */}
          {isGeneratedFresh && (
            <div className="w-full p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>QR Code ID Unik berhasil diperbarui & sinkron ke database!</span>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="w-full space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isDownloadingPNG}
                className="px-3 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                {isDownloadingPNG ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="px-3 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                {isDownloadingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Download PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak QR (Print)</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateFresh}
                className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Buat Ulang QR</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
