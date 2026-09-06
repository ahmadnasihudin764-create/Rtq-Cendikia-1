import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Trophy, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '../Logo';

export const SertifikatModal: React.FC = () => {
  const { selectedPrestasiForCert, setSelectedPrestasiForCert, santriList } = useApp();

  useEffect(() => {
    if (selectedPrestasiForCert) {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [selectedPrestasiForCert]);

  if (!selectedPrestasiForCert) return null;

  const prestasi = selectedPrestasiForCert;
  const santri = santriList.find(s => s.NIS === prestasi.NIS) || {
    Nama_Lengkap: 'Santri Teladan',
    Kelas: 'Kelas 1 SD',
    Halaqah: 'Halaqah BAZNAS'
  };

  return (
    <div id="modal-sertifikat" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-yellow-200 my-auto">
        
        {/* Top bar */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-bold">E-Sertifikat Penghargaan & Tahfidz</h3>
          </div>
          <button
            onClick={() => setSelectedPrestasiForCert(null)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-6 bg-amber-50/50 flex justify-center">
          <div 
            id="printable-certificate"
            className="w-full bg-white border-8 border-double border-amber-600 rounded-xl p-8 text-center shadow-xl relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#047857 0.5px, transparent 0.5px)',
              backgroundSize: '16px 16px'
            }}
          >
            {/* Corner Ornamental Accents */}
            <div className="absolute top-2 left-2 text-amber-600 text-lg font-serif">✦</div>
            <div className="absolute top-2 right-2 text-amber-600 text-lg font-serif">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-lg font-serif">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-lg font-serif">✦</div>

            {/* Institution Header */}
            <div className="mb-4 pb-3 border-b-2 border-amber-600/40 flex items-center justify-center space-x-3">
              <Logo size="md" />
              <div className="text-left">
                <p className="text-[10px] font-bold tracking-widest text-emerald-900 uppercase">
                  LEMBAGA PENDIDIKAN AL-QUR'AN
                </p>
                <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight">
                  RTQ CENDIKIA BAZNAS MASJID AGUNG DARUSSALAM
                </h2>
                <p className="text-[10px] text-gray-500 font-medium">
                  SK Kemenag & BAZNAS No. 442/RTQ/BAZNAS/2024
                </p>
              </div>
            </div>

            {/* Main Certificate Title */}
            <div className="my-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-4 py-1 rounded-full border border-amber-300">
                SERTIFIKAT PENGHARGAAN
              </span>
              <p className="text-[10px] font-mono text-gray-400 mt-2">
                Nomor: {prestasi.Sertifikat_ID || `SRT/RTQ/${new Date().getFullYear()}/${prestasi.id}`}
              </p>
            </div>

            <p className="text-xs text-gray-600 italic mt-2">
              Diberikan dengan penuh rasa syukur dan bangga kepada:
            </p>

            {/* Santri Name */}
            <div className="my-4 py-1">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-900 border-b-2 border-emerald-800 inline-block px-6">
                {santri.Nama_Lengkap}
              </h1>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                NIS: {prestasi.NIS} &bull; {santri.Kelas} ({santri.Halaqah})
              </p>
            </div>

            <p className="text-xs text-gray-700 max-w-lg mx-auto leading-relaxed">
              Atas capaian istimewa dalam:
            </p>
            
            <div className="my-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-emerald-950">{prestasi.Judul_Prestasi}</h3>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Kategori: <span className="font-bold">{prestasi.Kategori}</span> &bull; Tingkat: <span className="font-bold">{prestasi.Tingkat}</span>
              </p>
              <p className="text-[11px] text-gray-600 mt-1 italic">{prestasi.Keterangan}</p>
            </div>

            <p className="text-[11px] text-gray-500 italic max-w-md mx-auto">
              "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya." (HR. Bukhari)
            </p>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-8 pt-4 text-xs text-gray-800">
              <div>
                <p className="text-[10px] text-gray-500">Mengetahui,</p>
                <p className="font-semibold">Ustadz / Ustadzah Pembimbing</p>
                <div className="h-12 flex items-center justify-center">
                  <span className="font-serif italic text-emerald-800 text-xs">Ustadz/ah Pembimbing</span>
                </div>
                <p className="font-bold underline text-xs">{santri.Pembimbing || santri.Ustadz_Pembimbing || 'Ustadzah Fitriyani'}</p>
                <p className="text-[9px] text-gray-500">Pembimbing Tahfidz & Tahsin</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500">Masjid Agung Darussalam,</p>
                <p className="font-semibold">Kepala RTQ Cendikia BAZNAS</p>
                <div className="h-12 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-700 text-emerald-800 font-bold flex items-center justify-center text-[9px] uppercase shadow-xs">
                    CAP RTQ
                  </div>
                </div>
                <p className="font-bold underline text-xs">Ahmad Nasyikhudin, S.Pd</p>
                <p className="text-[9px] text-gray-500">Direktur RTQ</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Format resmi sertifikat BAZNAS Masjid Agung Darussalam
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPrestasiForCert(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
            >
              Tutup
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sertifikat</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
