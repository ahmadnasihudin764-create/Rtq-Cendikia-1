import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, QrCode, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { Logo } from '../Logo';

export const KartuSantriModal: React.FC = () => {
  const { selectedSantriForCard, setSelectedSantriForCard, showToast } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!selectedSantriForCard) return null;

  const santri = selectedSantriForCard;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPDF(true);
      showToast('Sedang membuat file PDF Kartu Santri...', 'info');

      const imgData = await toPng(printRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      
      // Standard ID Card Proportions (approx 90mm x 130mm for vertical ID badge)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [90, 130]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add background margin
      const margin = 5;
      const imgWidth = pdfWidth - (margin * 2);
      const elWidth = printRef.current.offsetWidth || 360;
      const elHeight = printRef.current.offsetHeight || 520;
      const imgHeight = (elHeight * imgWidth) / elWidth;

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pdfHeight - (margin * 2)));
      
      const fileName = `KARTU_SANTRI_${santri.NIS}_${santri.Nama_Lengkap.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      showToast('File PDF Kartu Santri berhasil diunduh!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Gagal membuat PDF. Silakan gunakan opsi Cetak Browser.', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div id="modal-kartu-santri" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Modal Topbar */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-bold">Kartu Digital & QR Code Santri</h3>
          </div>
          <button
            onClick={() => setSelectedSantriForCard(null)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Content Area */}
        <div className="p-6 bg-gray-100 flex flex-col items-center justify-center">
          
          {/* Printable Card */}
          <div 
            ref={printRef}
            id="printable-card-santri"
            className="w-full max-w-sm bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-xl border-2 border-yellow-400 relative overflow-hidden"
          >
            {/* Background watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl font-serif select-none pointer-events-none">
              قرآن
            </div>

            {/* Header Card */}
            <div className="flex items-center space-x-3 border-b border-emerald-700/80 pb-3 mb-4">
              <Logo size="sm" />
              <div className="leading-tight flex-1">
                <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
                  RTQ CENDIKIA BAZNAS
                </h4>
                <p className="text-[10px] text-emerald-200">
                  Masjid Agung Darussalam
                </p>
                <p className="text-[8px] text-emerald-300/80">
                  KARTU TANDA SANTRI RESMI
                </p>
              </div>
            </div>

            {/* Body Card */}
            <div className="flex gap-4 items-center">
              {/* Photo */}
              <div className="w-20 h-24 rounded-xl bg-emerald-950/70 border-2 border-yellow-400/80 overflow-hidden flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                {santri.Foto ? (
                  <img src={santri.Foto} alt={santri.Nama_Lengkap} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <span className="text-2xl font-bold text-yellow-300">{santri.Nama_Lengkap.charAt(0)}</span>
                    <p className="text-[8px] text-emerald-300 mt-1 uppercase font-semibold">Foto Santri</p>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className="flex-1 space-y-1 text-xs">
                <div>
                  <span className="text-[9px] text-emerald-300 uppercase block font-semibold">NIS Santri</span>
                  <span className="font-mono font-bold text-sm tracking-wider text-yellow-300">{santri.NIS}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-300 uppercase block font-semibold">Nama Lengkap</span>
                  <span className="font-bold text-white leading-tight block truncate">{santri.Nama_Lengkap}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                  <div>
                    <span className="text-[8px] text-emerald-300 block">Kelas:</span>
                    <span className="font-medium text-emerald-100">{santri.Kelas.split(' ')[1] || santri.Kelas}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-emerald-300 block">Status:</span>
                    <span className="text-yellow-300 font-bold">{santri.Status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Barcode Section for Scan Presensi */}
            <div className="mt-4 pt-3 border-t border-emerald-700/80 bg-white/95 text-emerald-950 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-emerald-900">QR CODE PRESENSI RESMI</p>
                <p className="text-[8px] text-gray-500 font-mono">ID: {santri.NIS} - {santri.Halaqah}</p>
                <p className="text-[8px] text-emerald-700 font-medium mt-0.5">Wali: {santri.Nama_Wali}</p>
              </div>

              {/* Genuine Generated QR Code */}
              <div className="p-1 bg-white rounded-lg border border-emerald-300 shadow-xs flex items-center justify-center">
                <QRCodeCanvas 
                  value={santri.NIS} 
                  size={52} 
                  darkColor="#064e3b" 
                  lightColor="#ffffff" 
                />
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-2 text-center text-[8px] text-emerald-300/80">
              Kartu ini wajib dibawa saat menghadiri halaqah dan kegiatan RTQ
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Dapat dicetak pada kertas PVC / Glossy Photo Paper
          </p>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedSantriForCard(null)}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Unduh PDF Langsung</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

