import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, QrCode, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Santri } from '../../types';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { Logo } from '../Logo';

interface CetakSemuaKartuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CetakSemuaKartuModal: React.FC<CetakSemuaKartuModalProps> = ({ isOpen, onClose }) => {
  const { santriList, showToast } = useApp();
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('Semua');
  const [isGenerating, setIsGenerating] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const halaqahList = Array.from(new Set(santriList.map(s => s.Halaqah)));

  const filteredSantri = santriList.filter(s => {
    if (selectedHalaqah === 'Semua') return true;
    return s.Halaqah === selectedHalaqah;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBulkPDF = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsGenerating(true);
      showToast(`Sedang membuat PDF untuk ${filteredSantri.length} kartu santri...`, 'info');

      // Create PDF in A4 format (210 x 297 mm)
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const cardElements = printContainerRef.current.querySelectorAll<HTMLElement>('.bulk-card-item');

      if (cardElements.length === 0) {
        showToast('Tidak ada data kartu untuk diunduh.', 'error');
        setIsGenerating(false);
        return;
      }

      // Card dimensions on A4: 2 columns x 3 rows per page = 6 cards per A4 page
      const cardWidthMM = 90;
      const cardHeightMM = 85;
      const marginX = 10;
      const marginY = 12;
      const gapX = 10;
      const gapY = 8;
      const cardsPerPage = 6;

      let currentCardOnPage = 0;

      for (let i = 0; i < cardElements.length; i++) {
        const cardEl = cardElements[i];

        const imgData = await toPng(cardEl, {
          pixelRatio: 2.5,
          cacheBust: true,
        });

        if (currentCardOnPage === cardsPerPage) {
          pdf.addPage();
          currentCardOnPage = 0;
        }

        const col = currentCardOnPage % 2;
        const row = Math.floor(currentCardOnPage / 2);

        const xPos = marginX + col * (cardWidthMM + gapX);
        const yPos = marginY + row * (cardHeightMM + gapY);

        pdf.addImage(imgData, 'PNG', xPos, yPos, cardWidthMM, cardHeightMM);
        currentCardOnPage++;
      }

      const fileName = `KARTU_SANTRI_KOLEKTIF_RTQ_${selectedHalaqah.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showToast(`Berhasil mengunduh PDF ${filteredSantri.length} Kartu Santri!`, 'success');
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      showToast('Gagal memproses file PDF. Silakan gunakan opsi Cetak Browser.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="modal-cetak-semua-kartu" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-gray-200 my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Cetak & Unduh Kartu Santri Kolektif (PDF A4)</h3>
              <p className="text-[11px] text-emerald-200">
                Format lembar cetak A4 siap potong/laminasi berisi {filteredSantri.length} kartu santri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-gray-700">Filter Halaqah:</span>
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="Semua">Semua Halaqoh ({santriList.length} Santri)</option>
              {halaqahList.map(h => (
                <option key={h} value={h}>{h} ({santriList.filter(s => s.Halaqah === h).length} Santri)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBulkPDF}
              disabled={isGenerating || filteredSantri.length === 0}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat PDF ({filteredSantri.length} Kartu)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh File PDF Kolektif</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Halaman (A4)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Grid */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex-1">
          <div 
            ref={printContainerRef}
            id="printable-bulk-cards"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          >
            {filteredSantri.map((santri: Santri) => (
              <div 
                key={santri.NIS}
                className="bulk-card-item bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-md border-2 border-yellow-400 relative overflow-hidden flex flex-col justify-between"
                style={{ height: '260px' }}
              >
                {/* Top header */}
                <div className="flex items-center space-x-2.5 border-b border-emerald-700/80 pb-2">
                  <Logo size="xs" />
                  <div className="leading-tight flex-1">
                    <h4 className="text-[11px] font-bold text-yellow-300 uppercase tracking-wide">
                      RTQ CENDIKIA BAZNAS
                    </h4>
                    <p className="text-[9px] text-emerald-200">
                      Masjid Agung Darussalam
                    </p>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-950/80 px-2 py-0.5 rounded text-yellow-300 font-bold">
                    {santri.NIS}
                  </span>
                </div>

                {/* Main Body */}
                <div className="flex gap-3 items-center my-auto">
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-20 rounded-xl bg-emerald-950/80 border border-yellow-400/80 overflow-hidden flex items-center justify-center shrink-0">
                    {santri.Foto ? (
                      <img src={santri.Foto} alt={santri.Nama_Lengkap} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <span className="text-xl font-bold text-yellow-300">{santri.Nama_Lengkap.charAt(0)}</span>
                        <p className="text-[7px] text-emerald-300 uppercase">Santri</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                    <h5 className="font-bold text-white text-sm truncate leading-tight">{santri.Nama_Lengkap}</h5>
                    <p className="text-[10px] text-emerald-200 font-medium truncate">{santri.Halaqah}</p>
                    <div className="grid grid-cols-2 gap-1 text-[9px] text-emerald-300 pt-1">
                      <div>
                        <span>Kelas: </span>
                        <strong className="text-white">{santri.Kelas.split(' ')[1] || santri.Kelas}</strong>
                      </div>
                      <div>
                        <span>Status: </span>
                        <strong className="text-yellow-300">{santri.Status}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom QR Bar */}
                <div className="bg-white text-emerald-950 rounded-xl p-2 flex items-center justify-between shadow-xs">
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold text-emerald-900">QR PRESENSI RESMI</p>
                    <p className="text-[8px] text-gray-500 font-mono">{santri.NIS} • Wali: {santri.Nama_Wali}</p>
                  </div>
                  <div className="w-9 h-9 bg-white rounded border border-emerald-300 flex items-center justify-center p-0.5 shadow-xs">
                    <QRCodeCanvas 
                      value={santri.NIS} 
                      size={32} 
                      darkColor="#064e3b" 
                      lightColor="#ffffff" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
