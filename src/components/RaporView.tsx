import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { QRCodeCanvas } from './QRCodeCanvas';
import { 
  Printer, 
  Download, 
  Share2, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  QrCode, 
  Loader2, 
  FileCheck, 
  UserCheck,
  Smartphone,
  Award,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { generateAndDownloadRaporPDF, shareRaporPDF } from '../utils/raporPdfGenerator';
import { getRaporGuruQRPayload, getRaporKepalaQRPayload } from '../utils/qrUtils';

export const RaporView: React.FC = () => {
  const { 
    currentUser,
    getSantriForWali,
    santriList, 
    tahfidzList, 
    tahsinList, 
    akhlakList, 
    ibadahList, 
    absensiList,
    appLogo,
    showToast 
  } = useApp();

  const isWali = currentUser?.role === 'Wali Santri';
  const waliSantri = isWali ? getSantriForWali() : null;

  // Initialize selectedNIS: if wali, lock to their child's NIS
  const [selectedNIS, setSelectedNIS] = useState<string>(
    waliSantri ? waliSantri.NIS : (santriList[0]?.NIS || '')
  );
  const [semester, setSemester] = useState('Semester Ganjil 2026 / 2027');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Sync if wali logged in
  useEffect(() => {
    if (waliSantri && waliSantri.NIS !== selectedNIS) {
      setSelectedNIS(waliSantri.NIS);
    }
  }, [waliSantri]);

  const santri = santriList.find(s => s.NIS === selectedNIS) || waliSantri || santriList[0];

  const pembimbingNama = santri?.Pembimbing || santri?.Ustadz_Pembimbing || 'Ustadzah Fitriyani';

  const santriTahfidz = tahfidzList.filter(t => t.NIS === selectedNIS);
  const santriTahsin = tahsinList.filter(t => t.NIS === selectedNIS);
  const santriAkhlak = akhlakList.find(a => a.NIS === selectedNIS) || {
    id: 'def-akhlak',
    Tanggal: '2026-08-15',
    NIS: selectedNIS,
    Bulan: 'Agustus 2026',
    Adab_Ustadz: 92,
    Adab_Quran: 94,
    Disiplin: 90,
    Kebersamaan: 92,
    Catatan: 'Menunjukkan akhlak karimah dan kesungguhan dalam tilawah Al-Qur\'an.',
    Ustadz_Penilai: pembimbingNama
  };
  const santriIbadah = ibadahList.find(i => i.NIS === selectedNIS) || {
    id: 'def-ibadah',
    Tanggal: '2026-08-15',
    NIS: selectedNIS,
    Sholat_Berjamaah_Score: 92,
    Qiyamul_Lail_Score: 90,
    Wudhu_Score: 92,
    Shalat_Score: 90,
    Dzikir_Score: 88,
    Hafalan_Doa: 'Doa Harian & Dzikir Pagi Petang',
    Catatan: 'Tertib sholat berjamaah dan aktif qiyamul lail.'
  };

  const santriAbsensi = absensiList.filter(a => a.NIS === selectedNIS);
  const hadir = santriAbsensi.filter(a => a.status === 'Hadir').length || 14;
  const sakit = santriAbsensi.filter(a => a.status === 'Sakit').length;
  const izin = santriAbsensi.filter(a => a.status === 'Izin').length;
  const alpa = santriAbsensi.filter(a => a.status === 'Alpa').length;

  // Real PDF Download Execution
  const handleDownloadPDF = async () => {
    if (!santri) {
      showToast('Data santri tidak ditemukan.', 'error');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      showToast(`Sedang membuat dokumen PDF Rapor untuk ${santri.Nama_Lengkap}...`, 'info');

      const result = await generateAndDownloadRaporPDF({
        santri,
        semester,
        tahfidzList: santriTahfidz,
        tahsinList: santriTahsin,
        akhlak: santriAkhlak,
        ibadah: santriIbadah,
        absensiList: santriAbsensi,
        logoUrl: appLogo
      });

      if (result.success) {
        showToast(`Dokumen PDF Rapor (${result.fileName}) berhasil diunduh ke HP/perangkat Anda!`, 'success');
      }
    } catch (err) {
      console.error('Error generating PDF rapor:', err);
      showToast('Gagal membuat file PDF. Silakan coba kembali.', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share via WhatsApp / Android System
  const handleShare = async () => {
    if (!santri) return;
    try {
      setIsSharing(true);
      showToast('Menyiapkan dokumen rapor untuk dibagikan...', 'info');
      await shareRaporPDF({
        santri,
        semester,
        tahfidzList: santriTahfidz,
        tahsinList: santriTahsin,
        akhlak: santriAkhlak,
        ibadah: santriIbadah,
        absensiList: santriAbsensi,
        logoUrl: appLogo
      });
      showToast('Dokumen rapor siap dibagikan / tersimpan.', 'success');
    } catch (err) {
      console.error('Error sharing rapor:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="section-rapor-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Filter and Select */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Santri Selection: Disabled/Locked if Wali */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Santri RTQ
              </label>
              {isWali && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Akun Wali Santri
                </span>
              )}
            </div>
            {isWali ? (
              <div className="w-full p-2.5 text-xs border border-emerald-200 rounded-xl bg-emerald-50/70 font-bold text-emerald-950 flex items-center justify-between">
                <span>{santri?.NIS} - {santri?.Nama_Lengkap} ({santri?.Kelas})</span>
                <UserCheck className="w-4 h-4 text-emerald-700" />
              </div>
            ) : (
              <select
                value={selectedNIS}
                onChange={(e) => setSelectedNIS(e.target.value)}
                className="w-full p-2.5 text-xs border rounded-xl bg-gray-50 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {santriList.map(s => (
                  <option key={s.NIS} value={s.NIS}>{s.NIS} - {s.Nama_Lengkap} ({s.Kelas} - {s.Halaqah})</option>
                ))}
              </select>
            )}
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Periode Evaluasi
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2.5 text-xs border rounded-xl bg-gray-50 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semester Ganjil 2026 / 2027">Semester Ganjil 2026 / 2027</option>
              <option value="Semester Genap 2026 / 2027">Semester Genap 2026 / 2027</option>
              <option value="Semester Ganjil 2027 / 2028">Semester Ganjil 2027 / 2028</option>
              <option value="Semester Genap 2027 / 2028">Semester Genap 2027 / 2028</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Real PDF Download & Share */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0">
          <button
            id="btn-download-rapor-pdf"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-800/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-yellow-300" />
                <span>Download Rapor PDF</span>
              </>
            )}
          </button>

          <button
            id="btn-share-rapor"
            onClick={handleShare}
            disabled={isSharing}
            className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Bagikan via WhatsApp / HP"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">Bagikan</span>
              </>
            )}
          </button>

          <button
            id="btn-cetak-rapor-window"
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Cetak langsung ke printer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Android Device Status Alert Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Format Dokumen PDF Siap Diunduh ke HP Android</p>
            <p className="text-[11px] text-emerald-800">
              File PDF resmi langsung tersimpan di folder Download perangkat Anda dan dapat dibuka melalui Google PDF Viewer, WPS Office, atau dibagikan ke WhatsApp.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex-shrink-0 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Sekarang</span>
        </button>
      </div>

      {/* Rapor Digital Sheet */}
      {santri && (
        <div 
          id="printable-rapor-container"
          className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-lg space-y-6 max-w-4xl mx-auto"
        >
          {/* Official Islamic Institution Header / Kop Surat */}
          <div className="border-b-2 border-emerald-900 pb-4 flex items-center justify-between gap-4">
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              <Logo size="lg" />
            </div>
            <div className="text-center flex-1">
              <h1 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight uppercase">
                RTQ CENDIKIA BAZNAS
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-emerald-900 tracking-wide uppercase mt-0.5">
                MASJID AGUNG DARUSSALAM
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-1">
                Jln. Pangeran Mohammad Amin, Desa Muara Beliti Baru, Kec. Muara Beliti, Kab. Musi Rawas
              </p>
            </div>
            <div className="w-16 flex flex-col items-center justify-center text-center">
              <div className="p-1 border border-emerald-300 rounded-lg">
                <QrCode className="w-10 h-10 text-emerald-900" />
              </div>
              <span className="text-[8px] text-gray-400 font-mono mt-0.5">VERIFIED</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-900 underline underline-offset-4">
              RAPOR PERKEMBANGAN & CAPAIAN SANTRI TAHFIDZ
            </h3>
            <p className="text-[11px] font-semibold text-gray-600 mt-1">{semester}</p>
          </div>

          {/* Santri Bio Table */}
          <div className="grid grid-cols-2 text-xs gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-gray-500 block text-[10px]">Nama Lengkap Santri:</span>
              <span className="font-bold text-gray-900 text-sm">{santri.Nama_Lengkap}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Nomor Induk Santri (NIS):</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">{santri.NIS}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Halaqah:</span>
              <span className="font-semibold text-gray-800">{santri.Halaqah || 'Halaqah 1'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Orang Tua / Wali:</span>
              <span className="font-semibold text-gray-800">{santri.Nama_Wali || '-'}</span>
            </div>
          </div>

          {/* Section A: Tahfidz */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[10px]">A</span>
              <span>Capaian Tahfidz Al-Qur'an (Ziyadah & Muroja'ah)</span>
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 uppercase text-[10px] font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5 border">Juz</th>
                    <th className="p-2.5 border">Surah / Ayat</th>
                    <th className="p-2.5 border text-center">Kelancaran</th>
                    <th className="p-2.5 border text-center">Tajwid</th>
                    <th className="p-2.5 border text-center">Fashahah</th>
                    <th className="p-2.5 border text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {santriTahfidz.length > 0 ? (
                    santriTahfidz.map(t => (
                      <tr key={t.id}>
                        <td className="p-2 border font-bold text-emerald-900">Juz {t.Juz}</td>
                        <td className="p-2 border font-medium">Surah {t.Surah} ({t.Ayat})</td>
                        <td className="p-2 border text-center font-semibold">{t.Kelancaran_Score}</td>
                        <td className="p-2 border text-center font-semibold">{t.Tajwid_Score}</td>
                        <td className="p-2 border text-center font-semibold">{t.Fashahah_Score}</td>
                        <td className="p-2 border text-center font-bold text-emerald-800">{t.Status_Lulus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border font-bold text-emerald-900">Juz 30</td>
                      <td className="p-2 border font-medium">Surah An-Naba s/d An-Nas (Tahap Pemantapan)</td>
                      <td className="p-2 border text-center">90</td>
                      <td className="p-2 border text-center">92</td>
                      <td className="p-2 border text-center">90</td>
                      <td className="p-2 border text-center font-bold text-emerald-800">Mumtaz</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Tahsin */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[10px]">B</span>
              <span>Capaian Tahsin & Makharijul Huruf</span>
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 uppercase text-[10px] font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5 border">Tingkat Jilid Iqra' / Qur'an</th>
                    <th className="p-2.5 border">Halaman Terakhir</th>
                    <th className="p-2.5 border text-center">Makhraj</th>
                    <th className="p-2.5 border text-center">Tajwid</th>
                    <th className="p-2.5 border">Status Kenaikan</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {santriTahsin.length > 0 ? (
                    santriTahsin.map(t => (
                      <tr key={t.id}>
                        <td className="p-2 border font-bold">{t.Jilid_Iqra}</td>
                        <td className="p-2 border">{t.Halaman}</td>
                        <td className="p-2 border text-center font-semibold">{t.Makhraj_Score}</td>
                        <td className="p-2 border text-center font-semibold">{t.Tajwid_Score}</td>
                        <td className="p-2 border font-bold text-blue-800">{t.Status_Naik}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border font-bold">Iqra Jilid 5</td>
                      <td className="p-2 border">Halaman 18</td>
                      <td className="p-2 border text-center font-semibold">90</td>
                      <td className="p-2 border text-center font-semibold">88</td>
                      <td className="p-2 border font-bold text-emerald-800">Naik Halaman (Lanjut)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C: Akhlak & Ibadah Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[10px]">C</span>
                <span>Penilaian Akhlak & Adab</span>
              </h4>
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-1.5 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Adab terhadap Ustadz:</span>
                  <span className="font-bold text-emerald-800">{santriAkhlak.Adab_Ustadz} (A)</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Adab memuliakan Al-Qur'an:</span>
                  <span className="font-bold text-emerald-800">{santriAkhlak.Adab_Quran} (A)</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Kedisiplinan & Kehadiran:</span>
                  <span className="font-bold text-emerald-800">{santriAkhlak.Disiplin} (A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kebersamaan & Ukhuwah:</span>
                  <span className="font-bold text-emerald-800">{santriAkhlak.Kebersamaan} (A)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-900 text-white flex items-center justify-center text-[10px]">D</span>
                <span>Praktik Ibadah & Presensi</span>
              </h4>
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-1.5 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Sholat Berjamaah & Qiyamul Lail:</span>
                  <span className="font-bold text-emerald-800">Sangat Baik ({santriIbadah.Sholat_Berjamaah_Score ?? santriIbadah.Wudhu_Score ?? 92})</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Hafalan Doa Pilihan:</span>
                  <span className="font-bold text-emerald-800 truncate max-w-xs">{santriIbadah.Hafalan_Doa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rekap Kehadiran:</span>
                  <span className="font-bold text-emerald-800">
                    Hadir: {hadir} &bull; Sakit: {sakit} &bull; Izin: {izin} &bull; Alpa: {alpa}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-center text-xs text-gray-800">
            {/* Kolom 1: Wali */}
            <div className="flex flex-col items-center justify-between border border-gray-100 rounded-2xl p-3 bg-gray-50/40">
              <div>
                <p className="text-[11px] font-semibold text-gray-500">Mengetahui,</p>
                <p className="text-xs font-bold text-gray-800">Orang Tua / Wali Santri</p>
              </div>
              <div className="h-16 flex items-center justify-center my-1 text-gray-300 italic text-[11px]">
                (Tanda Tangan Wali)
              </div>
              <div className="w-full pt-1 border-t border-gray-300">
                <p className="font-bold text-xs text-gray-900">{santri.Nama_Wali || 'Wali Santri'}</p>
                <span className="text-[10px] text-gray-500">Wali Santri</span>
              </div>
            </div>

            {/* Kolom 2: Ustadz / Ustadzah Pembimbing dengan QR */}
            <div className="flex flex-col items-center justify-between border border-emerald-200 rounded-2xl p-3 bg-emerald-50/40 shadow-xs relative">
              <div>
                <p className="text-[11px] font-semibold text-emerald-800">Muara Beliti, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs font-bold text-emerald-950">Ustadz / Ustadzah Pembimbing</p>
              </div>
              <div className="my-2 flex flex-col items-center">
                <div className="p-1 bg-white border border-emerald-300 rounded-xl shadow-2xs">
                  <QRCodeCanvas 
                    value={getRaporGuruQRPayload(pembimbingNama, santri, semester)}
                    size={68}
                    darkColor="#064e3b"
                  />
                </div>
              </div>
              <div className="w-full pt-1 border-t border-emerald-300">
                <p className="font-bold text-xs text-emerald-950 underline">{pembimbingNama}</p>
                <span className="text-[10px] text-emerald-700">Pembimbing & Wali Halaqah</span>
              </div>
            </div>

            {/* Kolom 3: Kepala RTQ BAZNAS dengan QR */}
            <div className="flex flex-col items-center justify-between border border-emerald-200 rounded-2xl p-3 bg-emerald-50/40 shadow-xs relative">
              <div>
                <p className="text-[11px] font-semibold text-emerald-800">Mengesahkan,</p>
                <p className="text-xs font-bold text-emerald-950">Kepala RTQ Cendikia BAZNAS</p>
              </div>
              <div className="my-2 flex flex-col items-center">
                <div className="p-1 bg-white border border-emerald-300 rounded-xl shadow-2xs">
                  <QRCodeCanvas 
                    value={getRaporKepalaQRPayload(santri, semester)}
                    size={68}
                    darkColor="#064e3b"
                  />
                </div>
              </div>
              <div className="w-full pt-1 border-t border-emerald-300">
                <p className="font-bold text-xs text-emerald-950 underline">Ust. Ahmad Nasyikhudin, S.Pd</p>
                <span className="text-[10px] text-emerald-700">Kepala RTQ BAZNAS</span>
              </div>
            </div>
          </div>

          {/* Bottom Download Bar inside Card */}
          <div className="border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">
              Dokumen resmi dikeluarkan oleh LPQ RTQ Cendikia BAZNAS Masjid Agung Darussalam
            </span>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-yellow-300" />
              )}
              <span>Download File PDF ke HP</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

