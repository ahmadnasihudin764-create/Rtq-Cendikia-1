import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Grid
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Santri } from '../../types';
import { QRCodeCanvas } from '../QRCodeCanvas';
import { getUniqueQRPayload } from '../../utils/qrUtils';

interface CetakSemuaQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CetakSemuaQRModal: React.FC<CetakSemuaQRModalProps> = ({ isOpen, onClose }) => {
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

  const handleDownloadBulkQRPDF = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsGenerating(true);
      showToast(`Sedang membuat PDF ${filteredSantri.length} Lembar QR Code...`, 'info');

      // Create PDF in A4 format (210 x 297 mm)
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const badgeElements = printContainerRef.current.querySelectorAll<HTMLElement>('.bulk-qr-item');

      if (badgeElements.length === 0) {
        showToast('Tidak ada data QR santri untuk diunduh.', 'error');
        setIsGenerating(false);
        return;
      }

      // Layout on A4: 3 columns x 4 rows per page = 12 QR Badges per A4 sheet
      const badgeWidthMM = 58;
      const badgeHeightMM = 62;
      const marginX = 10;
      const marginY = 12;
      const gapX = 8;
      const gapY = 8;
      const badgesPerPage = 12;

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

        const col = currentBadgeOnPage % 3;
        const row = Math.floor(currentBadgeOnPage / 3);

        const xPos = marginX + col * (badgeWidthMM + gapX);
        const yPos = marginY + row * (badgeHeightMM + gapY);

        pdf.addImage(imgData, 'PNG', xPos, yPos, badgeWidthMM, badgeHeightMM);
        currentBadgeOnPage++;
      }

      const fileName = `KUMPULAN_QR_CODE_SANTRI_${selectedHalaqah.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showToast(`Berhasil mengunduh PDF ${filteredSantri.length} QR Code Santri!`, 'success');
    } catch (error) {
      console.error('Error generating bulk QR PDF:', error);
      showToast('Gagal memproses file PDF QR. Silakan gunakan opsi Cetak Browser.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="modal-cetak-semua-qr" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-gray-200 my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">Cetak & Unduh Semua QR Code Santri</h3>
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 text-[10px] font-mono rounded-full border border-yellow-400/40">
                  {filteredSantri.length} Santri
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Format lembar stiker/kartu presensi A4 berisi seluruh QR Code ber-ID unik anti-bentrok
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

        {/* Filter Toolbar */}
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
              onClick={handleDownloadBulkQRPDF}
              disabled={isGenerating || filteredSantri.length === 0}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat PDF ({filteredSantri.length} QR)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Semua QR (PDF A4)</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Stiker A4</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Grid */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex-1">
          <div 
            ref={printContainerRef}
            id="printable-bulk-qr-sheet"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-w-5xl mx-auto"
          >
            {filteredSantri.map((santri: Santri) => {
              const payload = getUniqueQRPayload(santri);
              return (
                <div 
                  key={santri.NIS}
                  className="bulk-qr-item bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-3 shadow-md border-2 border-yellow-400 flex flex-col items-center justify-between text-center relative overflow-hidden"
                  style={{ height: '220px' }}
                >
                  {/* Top NIS & RTQ Tag */}
                  <div className="w-full border-b border-emerald-700/80 pb-1 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-yellow-300 font-mono">
                      {santri.NIS}
                    </span>
                    <span className="text-[7px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-200 uppercase font-semibold">
                      RTQ BAZNAS
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div className="bg-white p-1.5 rounded-xl border border-emerald-300 shadow-inner my-1 flex items-center justify-center">
                    <QRCodeCanvas 
                      value={payload} 
                      size={90} 
                      darkColor="#064e3b" 
                      lightColor="#ffffff" 
                    />
                  </div>

                  {/* Santri Info */}
                  <div className="w-full pt-1">
                    <h5 className="font-bold text-white text-[11px] truncate leading-tight">
                      {santri.Nama_Lengkap}
                    </h5>
                    <p className="text-[9px] text-emerald-200 truncate font-medium mt-0.5">
                      {santri.Halaqah}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Setiap QR Code memuat ID unik NIS terdaftar untuk memastikan presensi akurat tanpa bentrok.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
