import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  FileSpreadsheet, 
  Award, 
  BookOpen, 
  BookMarked, 
  BookOpenCheck,
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Sparkles,
  Smartphone,
  Sliders,
  Calendar,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { AppSettings } from '../types';

export const PengaturanView: React.FC = () => {
  const { 
    appSettings, 
    updateAppSettings, 
    currentUser, 
    setIsEditLogoModalOpen,
    exportDatabaseJSON,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'publikasi' | 'lembaga'>('publikasi');

  // Local draft state for custom notes
  const [pesanRapor, setPesanRapor] = useState(
    appSettings.pesanRaporTerkunci || 'Laporan hasil belajar / Rapor santri (Tahfidz & Diniyyah) sedang dalam proses finalisasi oleh asatidz dan belum dipublikasikan untuk periode ini.'
  );
  const [pesanNilai, setPesanNilai] = useState(
    appSettings.pesanNilaiTerkunci || 'Rekap penilaian dan capaian setoran harian santri sedang dalam proses verifikasi asatidz dan belum dipublikasikan.'
  );

  // Master toggles
  const handleToggleMasterRapor = (newValue: boolean) => {
    updateAppSettings({
      publikasiRapor: newValue,
      publikasiRaporTahfidz: newValue,
      publikasiRaporDiniyyah: newValue
    });
  };

  const handleToggleMasterNilai = (newValue: boolean) => {
    updateAppSettings({
      publikasiNilai: newValue,
      publikasiNilaiTahfidz: newValue,
      publikasiNilaiTahsin: newValue,
      publikasiNilaiDiniyyah: newValue
    });
  };

  const handlePublishAll = () => {
    updateAppSettings({
      publikasiRapor: true,
      publikasiRaporTahfidz: true,
      publikasiRaporDiniyyah: true,
      publikasiNilai: true,
      publikasiNilaiTahfidz: true,
      publikasiNilaiTahsin: true,
      publikasiNilaiDiniyyah: true
    });
    showToast('Seluruh Rapor dan Nilai telah dipublikasikan ke Wali Santri!', 'success');
  };

  const handleLockAll = () => {
    updateAppSettings({
      publikasiRapor: false,
      publikasiRaporTahfidz: false,
      publikasiRaporDiniyyah: false,
      publikasiNilai: false,
      publikasiNilaiTahfidz: false,
      publikasiNilaiTahsin: false,
      publikasiNilaiDiniyyah: false
    });
    showToast('Seluruh Rapor dan Nilai telah disembunyikan/dikunci dari Wali Santri.', 'info');
  };

  const handleSavePesan = () => {
    updateAppSettings({
      pesanRaporTerkunci: pesanRapor,
      pesanNilaiTerkunci: pesanNilai
    });
  };

  return (
    <div id="section-pengaturan-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 border border-emerald-700/60 rounded-full text-xs font-semibold text-emerald-200">
              <Settings className="w-3.5 h-3.5 text-yellow-300" />
              <span>Menu Pengaturan Sistem & Akses Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Pengaturan Publikasi Rapor & Nilai</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Atur visibilitas dan hak akses Wali Santri untuk melihat atau mengunduh <strong>Rapor Santri (Tahfidz & Diniyyah)</strong> serta <strong>Nilai Capaian Santri</strong> secara fleksibel dan seketika.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              id="btn-publish-all"
              onClick={handlePublishAll}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              title="Buka akses semua rapor dan nilai ke wali santri"
            >
              <Unlock className="w-4 h-4 text-emerald-950" />
              <span>Buka Semua Publikasi</span>
            </button>
            <button
              id="btn-lock-all"
              onClick={handleLockAll}
              className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              title="Kunci/sembunyikan semua rapor dan nilai dari wali santri"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>Kunci / Sembunyikan Semua</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicators Footer */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300">Status Rapor:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                appSettings.publikasiRapor ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {appSettings.publikasiRapor ? '✓ Dipublikasikan' : '✗ Ditutup/Kunci'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300">Status Nilai:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                appSettings.publikasiNilai ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {appSettings.publikasiNilai ? '✓ Dipublikasikan' : '✗ Ditutup/Kunci'}
              </span>
            </div>
          </div>
          {appSettings.terakhirDiperbarui && (
            <div className="text-emerald-300/80 text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Pembaruan Terakhir: {appSettings.terakhirDiperbarui} ({appSettings.diperbaruiOleh || 'Admin'})</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('publikasi')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'publikasi'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kontrol Publikasi Rapor & Nilai</span>
        </button>
        <button
          onClick={() => setActiveTab('lembaga')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'lembaga'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Informasi Lembaga & Logo</span>
        </button>
      </div>

      {activeTab === 'publikasi' && (
        <div className="space-y-6">
          
          {/* Two Main Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. CARD PENGATURAN PUBLIKASI RAPOR */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      appSettings.publikasiRapor ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-gray-900">1. Publikasi Rapor Santri</h2>
                      <p className="text-xs text-gray-500">Rapor Tahfidz Al-Qur'an & Rapor Ngaji Diniyyah</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    appSettings.publikasiRapor 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {appSettings.publikasiRapor ? 'Aktif Terbuka' : 'Terkunci'}
                  </span>
                </div>

                {/* Master Switch Rapor */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-gray-900">Status Master Publikasi Rapor</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {appSettings.publikasiRapor 
                        ? 'Wali santri saat ini DAPAT membuka & mengunduh file PDF rapor.' 
                        : 'Wali santri TIDAK BISA melihat/mengunduh dokumen rapor santri.'}
                    </p>
                  </div>
                  <button
                    id="toggle-master-rapor"
                    onClick={() => handleToggleMasterRapor(!appSettings.publikasiRapor)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      appSettings.publikasiRapor ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={appSettings.publikasiRapor}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        appSettings.publikasiRapor ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Granular Options */}
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Rincian Jenis Rapor
                  </p>
                  
                  {/* Rapor Tahfidz */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-emerald-200 transition">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Rapor Tahfidz Al-Qur'an & Evaluasi</p>
                        <p className="text-[10px] text-gray-500">Hasil capaian juz, surah mutqin, target & adab</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAppSettings({ publikasiRaporTahfidz: !appSettings.publikasiRaporTahfidz })}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        appSettings.publikasiRaporTahfidz ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appSettings.publikasiRaporTahfidz ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Rapor Diniyyah */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-emerald-200 transition">
                    <div className="flex items-center gap-2.5">
                      <BookMarked className="w-4 h-4 text-teal-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Rapor Ngaji Diniyyah (Kitab Kuning)</p>
                        <p className="text-[10px] text-gray-500">Hasil evaluasi Fiqih, Sirah, Pegon, Hadits, dll</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAppSettings({ publikasiRaporDiniyyah: !appSettings.publikasiRaporDiniyyah })}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        appSettings.publikasiRaporDiniyyah ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appSettings.publikasiRaporDiniyyah ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Custom Note for Locked Rapor */}
                <div className="pt-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pesan Informasi saat Rapor Ditutup/Belum Dipublikasikan:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={pesanRapor}
                    onChange={(e) => setPesanRapor(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    placeholder="Tulis pesan pengumuman untuk wali santri..."
                  />
                </div>
              </div>

              {/* Status summary */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  {appSettings.publikasiRapor ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>Akses Wali: <strong>{appSettings.publikasiRapor ? 'DIBUKA' : 'DITUTUP'}</strong></span>
                </span>
                <button
                  onClick={handleSavePesan}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            {/* 2. CARD PENGATURAN PUBLIKASI NILAI */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      appSettings.publikasiNilai ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-gray-900">2. Publikasi Nilai Santri</h2>
                      <p className="text-xs text-gray-500">Nilai Tahfidz, Tahsin Iqra' & Nilai Diniyyah</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    appSettings.publikasiNilai 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {appSettings.publikasiNilai ? 'Aktif Terbuka' : 'Terkunci'}
                  </span>
                </div>

                {/* Master Switch Nilai */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-gray-900">Status Master Publikasi Nilai</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {appSettings.publikasiNilai 
                        ? 'Wali santri saat ini DAPAT melihat rincian angka nilai & predikat belajar.' 
                        : 'Wali santri TIDAK BISA melihat nilai capaian santri.'}
                    </p>
                  </div>
                  <button
                    id="toggle-master-nilai"
                    onClick={() => handleToggleMasterNilai(!appSettings.publikasiNilai)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      appSettings.publikasiNilai ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={appSettings.publikasiNilai}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        appSettings.publikasiNilai ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Granular Options */}
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Rincian Kategori Nilai
                  </p>
                  
                  {/* Nilai Tahfidz */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-teal-200 transition">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Nilai Tahfidz (Kelancaran, Tajwid, Fashahah)</p>
                        <p className="text-[10px] text-gray-500">Skor evaluasi dan mutabaah hafalan Al-Qur'an</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAppSettings({ publikasiNilaiTahfidz: !appSettings.publikasiNilaiTahfidz })}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        appSettings.publikasiNilaiTahfidz ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appSettings.publikasiNilaiTahfidz ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Nilai Tahsin */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-teal-200 transition">
                    <div className="flex items-center gap-2.5">
                      <BookOpenCheck className="w-4 h-4 text-cyan-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Nilai Tahsin & Iqra' (Makhraj, Tajwid)</p>
                        <p className="text-[10px] text-gray-500">Evaluasi kelayakan naik jilid & bacaan Al-Qur'an</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAppSettings({ publikasiNilaiTahsin: !appSettings.publikasiNilaiTahsin })}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        appSettings.publikasiNilaiTahsin ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appSettings.publikasiNilaiTahsin ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Nilai Diniyyah */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-teal-200 transition">
                    <div className="flex items-center gap-2.5">
                      <BookMarked className="w-4 h-4 text-indigo-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Nilai Mata Pelajaran Diniyyah</p>
                        <p className="text-[10px] text-gray-500">Nilai kitab Mabadi Fiqih, Sirah, Pegon, Hadits</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateAppSettings({ publikasiNilaiDiniyyah: !appSettings.publikasiNilaiDiniyyah })}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        appSettings.publikasiNilaiDiniyyah ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          appSettings.publikasiNilaiDiniyyah ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Custom Note for Locked Nilai */}
                <div className="pt-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pesan Informasi saat Nilai Ditutup/Belum Dipublikasikan:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={pesanNilai}
                    onChange={(e) => setPesanNilai(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-teal-500 focus:outline-none transition"
                    placeholder="Tulis pesan pengumuman untuk wali santri..."
                  />
                </div>
              </div>

              {/* Status summary */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  {appSettings.publikasiNilai ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>Akses Wali: <strong>{appSettings.publikasiNilai ? 'DIBUKA' : 'DITUTUP'}</strong></span>
                </span>
                <button
                  onClick={handleSavePesan}
                  className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

          </div>

          {/* SIMULASI TAMPILAN WALI SANTRI (PREVIEW) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-gray-900">Simulasi Tampilan Portal Wali Santri</h3>
              </div>
              <span className="text-[11px] text-gray-400">Pratinjau langsung kondisi saat ini</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Preview Rapor */}
              <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800">Tampilan Menu Rapor</span>
                  {appSettings.publikasiRapor ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Terbuka Penuh
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Terkunci
                    </span>
                  )}
                </div>

                {appSettings.publikasiRapor ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Rapor Santri Siap Dilihat & Diunduh</p>
                      <p className="text-[11px] text-emerald-800">Wali santri dapat melihat pratinjau dan mengunduh file PDF rapor resmi.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Rapor Santri Belum Dipublikasikan</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                      {pesanRapor || appSettings.pesanRaporTerkunci}
                    </p>
                  </div>
                )}
              </div>

              {/* Preview Nilai */}
              <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800">Tampilan Tab Nilai & Capaian</span>
                  {appSettings.publikasiNilai ? (
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Terbuka Penuh
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Terkunci
                    </span>
                  )}
                </div>

                {appSettings.publikasiNilai ? (
                  <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Nilai & Mutaba'ah Ditampilkan</p>
                      <p className="text-[11px] text-teal-800">Rincian nilai tahfidz, tahsin, dan mapel diniyyah tampil transparan.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Nilai Santri Belum Dipublikasikan</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                      {pesanNilai || appSettings.pesanNilaiTerkunci}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'lembaga' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>Identitas & Profil Lembaga RTQ</span>
              </h3>
              <p className="text-xs text-gray-500">Pengaturan logo, nama instansi resmi, dan cadangan database.</p>
            </div>
            <button
              onClick={() => setIsEditLogoModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-yellow-300" />
              <span>Ganti / Edit Logo Lembaga</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <p className="font-bold text-gray-800">Nama Lembaga Resmi</p>
              <p className="text-gray-600">Rumah Tahfidz Qur'an (RTQ) Cendikia BAZNAS</p>
              <p className="text-[11px] text-gray-400">Masjid Agung Darussalam Kab. Musi Rawas</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <p className="font-bold text-gray-800">Ekspor Cadangan Database</p>
              <p className="text-gray-600">Simpan seluruh data santri, absensi, spp, dan nilai ke format JSON.</p>
              <button
                onClick={exportDatabaseJSON}
                className="mt-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 font-bold rounded-lg text-emerald-800 text-xs transition cursor-pointer"
              >
                Unduh Cadangan JSON
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
