import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Pengajar } from '../../types';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { getPengajarQRPayload, downloadPengajarQRCodePNG } from '../../utils/qrUtils';

interface CetakSemuaQRPengajarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPengajar?: Pengajar | null;
}

export const CetakSemuaQRPengajarModal: React.FC<CetakSemuaQRPengajarModalProps> = ({ 
  isOpen, 
  onClose,
  selectedPengajar = null
}) => {
  const { pengajarList, showToast } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayList = selectedPengajar 
    ? [selectedPengajar] 
    : pengajarList;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBulkQRPDF = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsGenerating(true);
      showToast(`Sedang membuat PDF ${displayList.length} Kartu QR Pengajar...`, 'info');

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const badgeElements = printContainerRef.current.querySelectorAll<HTMLElement>('.bulk-qr-pengajar-item');

      if (badgeElements.length === 0) {
        showToast('Tidak ada data QR pengajar untuk diunduh.', 'error');
        setIsGenerating(false);
        return;
      }

      // Layout on A4: 2 columns x 3 rows per page = 6 large QR Cards per sheet
      const badgeWidthMM = 85;
      const badgeHeightMM = 80;
      const marginX = 15;
      const marginY = 15;
      const gapX = 10;
      const gapY = 10;
      const badgesPerPage = 6;

      let currentBadgeOnPage = 0;

      for (let i = 0; i < badgeElements.length; i++) {
        const el = badgeElements[i];

        const imgData = await toPng(el, {
          pixelRatio: 2.5,
          cacheBust: true,
        });

        if (currentBadgeOnPage === badgesPerPage) {
          pdf.addPage();
          currentBadgeOnPage = 0;
        }

        const col = currentBadgeOnPage % 2;
        const row = Math.floor(currentBadgeOnPage / 2);

        const xPos = marginX + col * (badgeWidthMM + gapX);
        const yPos = marginY + row * (badgeHeightMM + gapY);

        pdf.addImage(imgData, 'PNG', xPos, yPos, badgeWidthMM, badgeHeightMM);
        currentBadgeOnPage++;
      }

      const fileName = `KUMPULAN_QR_CODE_PENGAJAR_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showToast(`Berhasil mengunduh PDF ${displayList.length} QR Code Pengajar!`, 'success');
    } catch (error) {
      console.error('Error generating bulk QR PDF:', error);
      showToast('Gagal memproses file PDF QR. Silakan gunakan opsi Cetak.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{selectedPengajar ? `QR Code: ${selectedPengajar.Nama_Pengajar}` : 'QR Code Semua Pengajar & Asatidz'}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-800 text-amber-300 font-bold rounded-full border border-emerald-700">
                  {displayList.length} Asatidz
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                Kartu QR Resmi untuk Identitas, Presensi, dan Pengenalan Pengajar RTQ
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Format Standar ID Card & Presensi Resmi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Cetak</span>
            </button>

            <button
              onClick={handleDownloadBulkQRPDF}
              disabled={isGenerating || displayList.length === 0}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Semua PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div 
            ref={printContainerRef} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayList.map((p) => {
              const payload = getPengajarQRPayload(p);
              return (
                <div 
                  key={p.ID_Pengajar} 
                  className="bulk-qr-pengajar-item bg-white rounded-2xl border-2 border-emerald-600/30 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-3 text-center">
                    <p className="text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                      RTQ CENDIKIA BAZNAS
                    </p>
                    <p className="text-[9px] text-emerald-200">KARTU RESMI ASATIDZ / PENGAJAR</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col items-center text-center space-y-2.5">
                    {/* QR Code Container */}
                    <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center">
                      <QRCodeCanvas 
                        value={payload} 
                        size={125} 
                        darkColor="#064e3b" 
                        lightColor="#ffffff" 
                      />
                    </div>

                    {/* Teacher Details */}
                    <div className="w-full space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">
                          {p.Nama_Pengajar}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[10px] font-semibold text-amber-700">
                        {p.Gelar || 'Pembimbing Tahfidz'}
                      </p>
                      <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200 mt-1">
                        ID: {p.ID_Pengajar} • {p.Halaqah_Binaan}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Download Action */}
                  <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 font-medium truncate">
                      {p.Mata_Pelajaran}
                    </span>
                    <button
                      onClick={() => downloadPengajarQRCodePNG(p)}
                      title="Unduh file PNG QR Code Pengajar ini"
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
