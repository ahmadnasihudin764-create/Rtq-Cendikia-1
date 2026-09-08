import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Award, 
  CalendarCheck, 
  CreditCard, 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  Building, 
  Phone, 
  MapPin, 
  QrCode, 
  ChevronRight, 
  PlusCircle, 
  Lock,
  HeartHandshake,
  Activity,
  ShieldCheck,
  Megaphone,
  Download,
  Printer,
  FileSpreadsheet,
  BookOpenCheck,
  Search,
  Filter,
  ArrowRight,
  HelpCircle,
  Smartphone,
  Share2,
  Facebook,
  Youtube,
  Instagram,
  Copy,
  Check,
  MessageCircle,
  Images,
  BookMarked,
  BarChart3,
  Wallet,
  ArrowLeft,
  Home,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { PerizinanRecord } from '../types';
import { ProfilSantriView } from './ProfilSantriView';
import { RaporView } from './RaporView';
import { GrafikHafalanView } from './GrafikHafalanView';
import { PengumumanView } from './PengumumanView';
import { MediaRTQView } from './MediaRTQView';
import { FotoKegiatanView } from './FotoKegiatanView';
import { JadwalView } from './JadwalView';
import { NgajiDiniyyahView } from './NgajiDiniyyahView';
import { SanguView } from './SanguView';

export const WaliSantriPortalView: React.FC = () => {
  const { 
    currentUser, 
    getSantriForWali, 
    activeMenu,
    setActiveMenu,
    appSettings,
    tahfidzList = [], 
    tahsinList = [], 
    diniyyahList = [],
    absensiList = [], 
    sppList = [], 
    prestasiList = [], 
    pelanggaranList = [], 
    jadwalList = [], 
    perizinanList = [], 
    pengumumanList = [],
    fotoKegiatanList = [],
    getSanguSummaryForSantri,
    addPerizinan, 
    setSelectedSantriForCard,
    setSelectedPrestasiForCert,
    changePassword,
    setIsGantiPasswordOpen,
    showToast
  } = useApp();

  // Publication Checks
  const isNilaiTahfidzPublished = appSettings.publikasiNilai && appSettings.publikasiNilaiTahfidz;
  const isNilaiTahsinPublished = appSettings.publikasiNilai && appSettings.publikasiNilaiTahsin;
  const isNilaiDiniyyahPublished = appSettings.publikasiNilai && appSettings.publikasiNilaiDiniyyah;
  const isRaporTahfidzPublished = appSettings.publikasiRapor && appSettings.publikasiRaporTahfidz;
  const isRaporDiniyyahPublished = appSettings.publikasiRapor && appSettings.publikasiRaporDiniyyah;
  const isRaporOverallPublished = appSettings.publikasiRapor && (appSettings.publikasiRaporTahfidz || appSettings.publikasiRaporDiniyyah);

  const [isAjukanIzinOpen, setIsAjukanIzinOpen] = useState(false);
  const [tahfidzSearch, setTahfidzSearch] = useState('');
  const [tahsinSearch, setTahsinSearch] = useState('');
  const [copiedRekening, setCopiedRekening] = useState(false);

  // In-portal password change state
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyRekening = () => {
    const rekeningNumber = '012901044008503';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rekeningNumber)
        .then(() => {
          setCopiedRekening(true);
          showToast('Nomor rekening BRI berhasil disalin.', 'success');
          setTimeout(() => setCopiedRekening(false), 3000);
        })
        .catch(() => {
          fallbackCopy(rekeningNumber);
        });
    } else {
      fallbackCopy(rekeningNumber);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedRekening(true);
      showToast('Nomor rekening BRI berhasil disalin.', 'success');
      setTimeout(() => setCopiedRekening(false), 3000);
    } catch {
      showToast('Gagal menyalin nomor rekening.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const handleConfirmPaymentWA = () => {
    const santriName = santri?.Nama_Lengkap || 'Santri';
    const santriNIS = santri?.NIS || '-';
    const waliName = santri?.Nama_Ayah || santri?.Nama_Ibu || currentUser?.nama || 'Wali Santri';
    const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh Pak Suwasno,\n\nSaya ingin konfirmasi pembayaran SPP / Infaq RTQ Cendikia BAZNAS:\n- Nama Santri: ${santriName}\n- NIS: ${santriNIS}\n- Nama Wali: ${waliName}\n\nMohon konfirmasi jika dana sudah masuk ke rekening BRI (012901044008503). Bukti transfer terlampir.\n\nTerima kasih.`;
    const waUrl = `https://wa.me/6281367009740?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Form Perizinan State
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [jenisIzin, setJenisIzin] = useState<PerizinanRecord['jenisIzin']>('Pulang/Keluarga');
  const [alasan, setAlasan] = useState('');
  const [penjemput, setPenjemput] = useState('');

  const santri = getSantriForWali();

  // Normalize active tab from activeMenu context
  const currentTab = (() => {
    if (activeMenu === 'sangu') return 'sangu';
    if (activeMenu === 'profil-santri' || activeMenu === 'profil') return 'profil-santri';
    if (activeMenu === 'rapor') return 'rapor';
    if (activeMenu === 'grafik-hafalan' || activeMenu === 'grafik') return 'grafik-hafalan';
    if (activeMenu === 'tahfidz') return 'tahfidz';
    if (activeMenu === 'tahsin') return 'tahsin';
    if (activeMenu === 'diniyyah') return 'diniyyah';
    if (activeMenu === 'absensi') return 'absensi';
    if (activeMenu === 'administrasi' || activeMenu === 'keuangan') return 'administrasi';
    if (activeMenu === 'perizinan') return 'perizinan';
    if (activeMenu === 'prestasi') return 'prestasi';
    if (activeMenu === 'jadwal') return 'jadwal';
    if (activeMenu === 'pengumuman') return 'pengumuman';
    if (activeMenu === 'foto-kegiatan' || activeMenu === 'foto') return 'foto-kegiatan';
    if (activeMenu === 'media-rtq' || activeMenu === 'media') return 'media-rtq';
    if (activeMenu === 'ganti-password' || activeMenu === 'password') return 'ganti-password';
    return 'dashboard';
  })();

  // Scroll active tab into view when active tab changes
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeBtn = tabsContainerRef.current.querySelector(`[data-tab-id="${currentTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentTab]);

  if (!santri) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-gray-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Data Santri Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500">Akun ini belum tertaut dengan data santri terdaftar di RTQ Cendikia.</p>
      </div>
    );
  }

  // Specific data for this student
  const santriTahfidz = tahfidzList.filter(t => t.NIS === santri.NIS);
  const santriTahsin = tahsinList.filter(t => t.NIS === santri.NIS);
  const santriDiniyyah = diniyyahList.filter(d => d.NIS === santri.NIS);
  const santriAbsensi = absensiList.filter(a => a.NIS === santri.NIS);
  const santriSpp = sppList.filter(s => s.NIS === santri.NIS);
  const santriPrestasi = prestasiList.filter(p => p.NIS === santri.NIS);
  const santriPelanggaran = pelanggaranList.filter(p => p.NIS === santri.NIS);
  const santriPerizinan = perizinanList.filter(p => p.NIS === santri.NIS);

  // Filtered Tahfidz
  const filteredTahfidz = santriTahfidz.filter(t => 
    t.Surah.toLowerCase().includes(tahfidzSearch.toLowerCase()) ||
    t.Juz.toLowerCase().includes(tahfidzSearch.toLowerCase()) ||
    t.Catatan.toLowerCase().includes(tahfidzSearch.toLowerCase()) ||
    t.Tanggal.includes(tahfidzSearch)
  );

  // Filtered Tahsin
  const filteredTahsin = santriTahsin.filter(ts => 
    ts.Jilid_Iqra.toLowerCase().includes(tahsinSearch.toLowerCase()) ||
    ts.Halaman.toLowerCase().includes(tahsinSearch.toLowerCase()) ||
    ts.Catatan_Evaluasi.toLowerCase().includes(tahsinSearch.toLowerCase()) ||
    ts.Tanggal.includes(tahsinSearch)
  );

  // Computed stats
  const totalHadir = santriAbsensi.filter(a => a.status === 'Hadir').length;
  const totalAbsenRecords = santriAbsensi.length || 1;
  const persenKehadiran = Math.round((totalHadir / totalAbsenRecords) * 100);

  const lastTahfidz = santriTahfidz[0];
  const lastTahsin = santriTahsin[0];
  const lastDiniyyah = santriDiniyyah[0];

  const handleAjukanIzin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglMulai || !tglSelesai || !alasan) return;

    const newIzin: PerizinanRecord = {
      id: 'IZN_' + Date.now(),
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      NIS: santri.NIS,
      namaSantri: santri.Nama_Lengkap,
      tanggalMulai: tglMulai,
      tanggalSelesai: tglSelesai,
      jenisIzin,
      alasan,
      status: 'Menunggu Persetujuan',
      penjemput: penjemput || santri.Nama_Wali
    };

    addPerizinan(newIzin);
    setTglMulai('');
    setTglSelesai('');
    setAlasan('');
    setPenjemput('');
    setIsAjukanIzinOpen(false);
  };

  const sanguSummary = santri ? getSanguSummaryForSantri(santri.NIS) : { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0, riwayat: [] };

  const portalTabs = [
    { id: 'dashboard', label: 'Ringkasan Anak', icon: Sparkles },
    { id: 'sangu', label: `Sangu (Rp ${sanguSummary.saldo.toLocaleString('id-ID')})`, icon: Wallet, isHighlight: true },
    { id: 'rapor', label: 'Rapor Santri (PDF)', icon: FileSpreadsheet, isHighlight: true },
    { id: 'grafik-hafalan', label: 'Grafik Hafalan', icon: BarChart3 },
    { id: 'profil-santri', label: 'Profil Santri', icon: UserCheck },
    { id: 'tahfidz', label: `Tahfidz (${santriTahfidz.length})`, icon: BookOpen },
    { id: 'tahsin', label: `Tahsin (${santriTahsin.length})`, icon: BookOpenCheck },
    { id: 'diniyyah', label: `Ngaji Diniyyah (${santriDiniyyah.length})`, icon: BookMarked },
    { id: 'absensi', label: `Presensi (${persenKehadiran}%)`, icon: CalendarCheck },
    { id: 'administrasi', label: 'SPP & Administrasi', icon: CreditCard },
    { id: 'perizinan', label: `Perizinan (${santriPerizinan.length})`, icon: FileText },
    { id: 'prestasi', label: 'Prestasi & Kedisiplinan', icon: Award },
    { id: 'jadwal', label: 'Jadwal Kegiatan', icon: Calendar },
    { id: 'pengumuman', label: `Pengumuman (${pengumumanList.length})`, icon: Megaphone },
    { id: 'foto-kegiatan', label: `Foto Kegiatan (${fotoKegiatanList.length})`, icon: Images },
    { id: 'media-rtq', label: 'Media RTQ', icon: Share2 },
    { id: 'ganti-password', label: 'Ganti Kata Sandi', icon: KeyRound, isHighlight: true },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Hero Header Card - Child Identity */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-8 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Child Photo / Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-300 p-1 shadow-lg shadow-emerald-950/40">
                <div className="w-full h-full rounded-xl bg-emerald-950 flex items-center justify-center text-yellow-300 font-extrabold text-2xl overflow-hidden">
                  {santri.Foto ? (
                    <img src={santri.Foto} alt={santri.Nama_Lengkap} className="w-full h-full object-cover" />
                  ) : (
                    <span>{santri.Nama_Lengkap.charAt(0)}</span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-emerald-900">
                {santri.Status}
              </span>
            </div>

            {/* Child Basic Info */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-emerald-700/60 rounded-md text-[11px] text-emerald-200 border border-emerald-600/60">
                <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
                <span>Portal Resmi Wali Santri</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {santri.Nama_Lengkap}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-100/90 pt-1">
                <span>NIS: <strong>{santri.NIS}</strong></span>
                <span>Kelas: <strong>{santri.Kelas}</strong></span>
                <span>Halaqah: <strong>{santri.Halaqah}</strong></span>
                {santri.Asrama && <span>Asrama: <strong>{santri.Asrama}</strong></span>}
              </div>
              <p className="text-[11px] text-emerald-300/90 pt-0.5">
                Wali Terdaftar: {santri.Nama_Wali} ({santri.WA_Wali})
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveMenu('rapor')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
              <span>Rapor PDF</span>
            </button>
            <button
              onClick={() => setActiveMenu('profil-santri')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs border border-emerald-600 shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-yellow-300" />
              <span>Profil Santri</span>
            </button>
            <button
              onClick={() => setSelectedSantriForCard(santri)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs border border-emerald-600 shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-yellow-300" />
              <span>Kartu & QR</span>
            </button>
            <button
              onClick={() => setActiveMenu('ganti-password')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-emerald-950" />
              <span>Ganti Sandi</span>
            </button>
            <button
              onClick={() => setIsAjukanIzinOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs border border-emerald-500 shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>Ajukan Izin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Synchronized with Left Sidebar */}
      <div 
        ref={tabsContainerRef}
        className="bg-white p-1.5 rounded-2xl shadow-xs border border-gray-200 overflow-x-auto scrollbar-none flex space-x-1"
      >
        {portalTabs.map(t => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              data-tab-id={t.id}
              onClick={() => setActiveMenu(t.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : t.isHighlight 
                    ? 'bg-yellow-100/80 text-yellow-950 hover:bg-yellow-200/80' 
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT AREA                                                          */}
      {/* ========================================================================= */}

      {/* Back to Portal Dashboard Bar when viewing any feature tab */}
      {currentTab !== 'dashboard' && (
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-gray-200/90 shadow-2xs animate-in fade-in duration-150">
          <button
            id="btn-portal-back-dashboard"
            onClick={() => setActiveMenu('dashboard')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer group"
            title="Kembali ke Ringkasan Dashboard Portal"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Menu Utama Portal</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 font-medium">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className="hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal Utama</span>
            </button>
            <span>/</span>
            <span className="font-bold text-gray-800 capitalize truncate max-w-[140px] sm:max-w-none">
              {portalTabs.find(t => t.id === currentTab)?.label || currentTab}
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: RINGKASAN DASHBOARD */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Rapor Download Announcement Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 rounded-3xl text-white shadow-md border border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest bg-yellow-400/20 px-2 py-0.5 rounded-md">
                  DOKUMEN RESMI TAHFIDZ & DINIYYAH
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Rapor Evaluasi & Capaian Santri
                </h4>
                <p className="text-xs text-emerald-200">
                  {isRaporOverallPublished ? (
                    <>Rapor resmi ananda <strong className="text-yellow-300">{santri.Nama_Lengkap}</strong> siap diunduh dalam format PDF resmi BAZNAS.</>
                  ) : (
                    <>Rapor semester ananda <strong className="text-yellow-300">{santri.Nama_Lengkap}</strong> saat ini sedang proses penyusunan dan verifikasi asatidz.</>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu('rapor')}
              className={`w-full sm:w-auto px-5 py-2.5 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0 ${
                isRaporOverallPublished
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-emerald-950'
                  : 'bg-emerald-800/90 text-emerald-200 border border-emerald-600/50'
              }`}
            >
              {isRaporOverallPublished ? (
                <>
                  <Download className="w-4 h-4 text-emerald-950" />
                  <span>Buka & Download Rapor (PDF)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span>Cek Status Publikasi Rapor</span>
                </>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* MENU UTAMA WALI SANTRI - GRID WITH CIRCULAR ICONS (5 per baris)           */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Menu Utama Portal Wali & Santri</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Akses cepat seluruh layanan, perkembangan tahfidz, dan administrasi ananda
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                15 Menu Layanan
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 pt-1">
              {[
                { id: 'profil-santri', label: 'Profil Santri', sub: 'Biodata & NIS', icon: UserCheck, bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200', text: 'text-white' },
                { id: 'tahfidz', label: 'Tahfidz Qur\'an', sub: `${santriTahfidz.length} Setoran`, icon: BookOpen, bg: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-200', text: 'text-emerald-950', badge: santriTahfidz.length > 0 ? `${santriTahfidz.length}` : undefined },
                { id: 'tahsin', label: 'Tahsin & Iqra\'', sub: `${santriTahsin.length} Catatan`, icon: BookOpenCheck, bg: 'from-teal-400 to-emerald-600', shadow: 'shadow-teal-200', text: 'text-white' },
                { id: 'diniyyah', label: 'Ngaji Diniyyah', sub: 'Nilai Kitab', icon: BookMarked, bg: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-200', text: 'text-white' },
                { id: 'grafik-hafalan', label: 'Grafik Hafalan', sub: 'Target Juz', icon: BarChart3, bg: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-200', text: 'text-white' },
                { id: 'absensi', label: 'Presensi Kehadiran', sub: `${persenKehadiran}% Hadir`, icon: CalendarCheck, bg: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-200', text: 'text-white' },
                { id: 'sangu', label: 'Sangu / Uang Saku', sub: `Rp ${sanguSummary.saldo.toLocaleString('id-ID')}`, icon: Wallet, bg: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-200', text: 'text-emerald-950', badge: 'QR' },
                { id: 'administrasi', label: 'SPP & Infaq', sub: 'Bukti Bayar', icon: CreditCard, bg: 'from-emerald-600 to-green-700', shadow: 'shadow-emerald-200', text: 'text-white' },
                { id: 'rapor', label: 'Rapor Digital (PDF)', sub: 'Cetak Lembar', icon: FileSpreadsheet, bg: 'from-teal-500 to-emerald-700', shadow: 'shadow-teal-200', text: 'text-white', badge: 'PDF' },
                { id: 'perizinan', label: 'Perizinan Santri', sub: `${santriPerizinan.length} Pengajuan`, icon: FileText, bg: 'from-orange-400 to-amber-600', shadow: 'shadow-orange-200', text: 'text-white' },
                { id: 'prestasi', label: 'Prestasi & Sertifikat', sub: `${santriPrestasi.length} Piagam`, icon: Award, bg: 'from-amber-500 to-yellow-600', shadow: 'shadow-amber-200', text: 'text-white' },
                { id: 'jadwal', label: 'Jadwal Kegiatan', sub: 'Agenda Halaqah', icon: Calendar, bg: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-200', text: 'text-white' },
                { id: 'pengumuman', label: 'Pengumuman', sub: `${pengumumanList.length} Info`, icon: Megaphone, bg: 'from-red-500 to-rose-600', shadow: 'shadow-red-200', text: 'text-white' },
                { id: 'foto-kegiatan', label: 'Foto Dokumentasi', sub: `${fotoKegiatanList.length} Album`, icon: Images, bg: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-200', text: 'text-white' },
                { id: 'media-rtq', label: 'Media Sosial RTQ', sub: 'FB, YT, IG', icon: Share2, bg: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-200', text: 'text-white' },
                { id: 'ganti-password', label: 'Ganti Kata Sandi', sub: 'Keamanan Akun', icon: KeyRound, bg: 'from-amber-500 to-yellow-600', shadow: 'shadow-amber-200', text: 'text-emerald-950', badge: 'Sandi' },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className="flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl hover:bg-emerald-50/60 active:scale-95 transition-all duration-150 cursor-pointer group relative"
                    title={`${item.label} - ${item.sub}`}
                  >
                    <div className="relative">
                      <div className={`w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${item.bg} flex items-center justify-center shadow-md ${item.shadow} group-hover:scale-108 group-hover:shadow-lg transition-transform duration-200`}>
                        <ItemIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.text} transition-transform group-hover:rotate-6`} />
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-[13px] font-extrabold text-gray-900 group-hover:text-emerald-800 transition-colors mt-2 leading-tight line-clamp-2">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5 line-clamp-1 hidden sm:block">
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div 
              onClick={() => setActiveMenu('sangu')}
              className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-400 transition cursor-pointer group bg-gradient-to-b from-white to-emerald-50/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Sangu / Uang Saku</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-black text-emerald-700 truncate">
                Rp {sanguSummary.saldo.toLocaleString('id-ID')}
              </h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span>{sanguSummary.riwayat.length} mutasi</span>
                <span className="text-emerald-400">&bull;</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">QR Belanja</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveMenu('tahfidz')}
              className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Hafalan Terakhir</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-emerald-700 transition truncate">
                {!isNilaiTahfidzPublished ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Terkunci</span>
                ) : (
                  lastTahfidz ? `Surah ${lastTahfidz.Surah}` : 'Juz 30 (Ziyadah)'
                )}
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                {!isNilaiTahfidzPublished ? (
                  <span className="text-amber-600 text-[10px]">Belum dipublikasikan</span>
                ) : (
                  lastTahfidz ? `Nilai: ${lastTahfidz.Nilai_Rata}` : `Target: ${santri.Target_Juz || '3 Juz'}`
                )}
              </p>
            </div>

            <div 
              onClick={() => setActiveMenu('tahsin')}
              className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Perkembangan Tahsin</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-blue-700 transition truncate">
                {!isNilaiTahsinPublished ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Terkunci</span>
                ) : (
                  lastTahsin ? lastTahsin.Jilid_Iqra : "Al-Qur'an / Tajwid"
                )}
              </h4>
              <p className="text-[11px] text-blue-700 font-medium mt-1">
                {!isNilaiTahsinPublished ? (
                  <span className="text-amber-600 text-[10px]">Belum dipublikasikan</span>
                ) : (
                  lastTahsin ? `Hal: ${lastTahsin.Halaman} (${lastTahsin.Nilai})` : 'Makharijul Huruf'
                )}
              </p>
            </div>

            <div 
              onClick={() => setActiveMenu('diniyyah')}
              className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Ngaji Diniyyah</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
                  <BookMarked className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-emerald-700 transition truncate">
                {!isNilaiDiniyyahPublished ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Terkunci</span>
                ) : (
                  lastDiniyyah ? lastDiniyyah.jenjang : 'Kelas Ula'
                )}
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                {!isNilaiDiniyyahPublished ? (
                  <span className="text-amber-600 text-[10px]">Belum dipublikasikan</span>
                ) : (
                  lastDiniyyah ? `Rata-rata: ${lastDiniyyah.rataRata} (${lastDiniyyah.predikat})` : '4 Mata Pelajaran Kitab'
                )}
              </p>
            </div>

            <div 
              onClick={() => setActiveMenu('absensi')}
              className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Kehadiran</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-amber-700 transition">
                {persenKehadiran}%
              </h4>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                {totalHadir} Hadir dari {totalAbsenRecords}
              </p>
            </div>

            <div 
              onClick={() => setActiveMenu('administrasi')}
              className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs hover:border-teal-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Status SPP</span>
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-110 transition">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-extrabold text-emerald-700 truncate">
                Lunas (BAZNAS)
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Terverifikasi Bendahara
              </p>
            </div>
          </div>

          {/* Announcements & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pengumuman Pesantren */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-emerald-700" />
                  <span>Pengumuman Pesantren</span>
                </h3>
                <button
                  onClick={() => setActiveMenu('pengumuman')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {pengumumanList.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 bg-emerald-200/60 rounded">
                        {p.kategori}
                      </span>
                      <span className="text-[10px] text-gray-400">{p.tanggal}</span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900">{p.judul}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.konten}</p>
                    <p className="text-[10px] text-gray-400 italic">Oleh: {p.penulis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Setoran Terakhir & Jadwal */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Setoran Tahfidz Terakhir</span>
                  </h3>
                  <button
                    onClick={() => setActiveMenu('tahfidz')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Riwayat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {!isNilaiTahfidzPublished ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span>Nilai & Riwayat Setoran Terkunci</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {appSettings.pesanNilaiTerkunci || 'Nilai setoran tahfidz belum dipublikasikan oleh asatidz untuk periode ini.'}
                    </p>
                  </div>
                ) : lastTahfidz ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Surah {lastTahfidz.Surah} ({lastTahfidz.Ayat})</span>
                      <span className="font-bold text-emerald-700 px-2 py-0.5 bg-emerald-200/70 rounded text-[10px]">
                        {lastTahfidz.Status_Lulus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-gray-600 pt-1">
                      <div>Lancar: <strong>{lastTahfidz.Kelancaran_Score}</strong></div>
                      <div>Tajwid: <strong>{lastTahfidz.Tajwid_Score}</strong></div>
                      <div>Fashahah: <strong>{lastTahfidz.Fashahah_Score}</strong></div>
                    </div>
                    <p className="text-[11px] text-emerald-900 bg-white p-2 rounded-lg border border-emerald-100 italic">
                      "{lastTahfidz.Catatan}"
                    </p>
                    <p className="text-[10px] text-gray-400">Penguji: {lastTahfidz.Pengajar} &bull; {lastTahfidz.Tanggal}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Belum ada catatan setoran pekan ini.</p>
                )}
              </div>

              {/* Today's Schedule preview */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>Jadwal Rutin Santri</span>
                  </h3>
                  <button
                    onClick={() => setActiveMenu('jadwal')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Semua</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {jadwalList.slice(0, 2).map((j) => (
                    <div key={j.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>{j.Nama_Kegiatan}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">{j.Waktu}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{j.Hari} &bull; {j.Lokasi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media RTQ Quick Widget for Wali Santri */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-5 rounded-2xl border border-emerald-700/60 shadow-sm text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-yellow-300" />
                    <h3 className="font-bold text-xs sm:text-sm text-white">Media Sosial Resmi RTQ</h3>
                  </div>
                  <button
                    onClick={() => setActiveMenu('media-rtq')}
                    className="text-[10px] sm:text-[11px] font-bold text-yellow-300 hover:text-yellow-200 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Semua</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Kunjungi media resmi RTQ Cendikia untuk melihat dokumentasi hafalan & kabar kegiatan ananda:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href="https://www.facebook.com/share/1LLj67r1ne/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-blue-600/90 hover:bg-blue-600 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition text-white shadow-xs group"
                  >
                    <Facebook className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Facebook</span>
                  </a>
                  <a
                    href="https://youtube.com/@rtqcendekiabaznasofficial?si=aENcqebny1iW-2oV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-red-600/90 hover:bg-red-600 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition text-white shadow-xs group"
                  >
                    <Youtube className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">YouTube</span>
                  </a>
                  <a
                    href="https://www.instagram.com/rtq_cendikia_baznas?igsh=c3Y5a3VzeXVmdXNj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition text-white shadow-xs group"
                  >
                    <Instagram className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Instagram</span>
                  </a>
                </div>
              </div>

              {/* Foto Kegiatan & Kolom Komentar Banner for Wali Santri */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center space-x-2">
                    <Images className="w-4 h-4 text-emerald-700" />
                    <span>Galeri Foto & Komentar Wali</span>
                  </h3>
                  <button
                    onClick={() => setActiveMenu('foto-kegiatan')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Galeri</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Bapak/Ibu Wali dapat melihat foto dokumentasi kegiatan santri dan memberikan <strong>doa & komentar</strong> pada setiap foto.
                </p>

                {fotoKegiatanList.slice(0, 2).map((album) => (
                  <div 
                    key={album.id}
                    onClick={() => setActiveMenu('foto-kegiatan')}
                    className="p-2.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-3 cursor-pointer transition"
                  >
                    {album.fotoList[0] && (
                      <img
                        src={album.fotoList[0]}
                        alt={album.judul}
                        className="w-12 h-12 rounded-lg object-cover border border-emerald-200 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {album.judul}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                        <span>{album.tanggal}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" />
                          {album.komentarList?.length || 0} Komentar
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-700 text-xs font-bold">💬</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB SANGU SANTRI */}
      {currentTab === 'sangu' && (
        <div className="animate-in fade-in duration-200">
          <SanguView />
        </div>
      )}

      {/* TAB 2: RAPOR SANTRI PDF */}
      {currentTab === 'rapor' && (
        <div className="animate-in fade-in duration-200">
          <RaporView />
        </div>
      )}

      {/* TAB 2.5: GRAFIK HAFALAN */}
      {currentTab === 'grafik-hafalan' && (
        <div className="animate-in fade-in duration-200">
          <GrafikHafalanView />
        </div>
      )}

      {/* TAB 3: PROFIL SANTRI */}
      {currentTab === 'profil-santri' && (
        <div className="animate-in fade-in duration-200">
          <ProfilSantriView />
        </div>
      )}

      {/* TAB 4: TAHFIDZ AL-QUR'AN */}
      {currentTab === 'tahfidz' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!isNilaiTahfidzPublished && (
            <div className="p-4.5 bg-amber-50 rounded-2xl border border-amber-300 flex items-start space-x-3 text-xs text-amber-950">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-amber-900 text-sm">Nilai Tahfidz Belum Dipublikasikan</h4>
                <p className="text-amber-800">
                  {appSettings.pesanNilaiTerkunci || 'Nilai dan evaluasi setoran Tahfidz Al-Qur\'an sedang dalam tahap penilaian asatidz dan belum dipublikasikan untuk periode ini.'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>Riwayat Setoran Tahfidz Al-Qur'an</span>
                </h3>
                <p className="text-xs text-gray-500">Pencatatan ziyadah hafalan baru dan muroja'ah mutqin ananda {santri.Nama_Lengkap}.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                  {santriTahfidz.length} Riwayat Setoran
                </span>
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-900 text-xs font-bold rounded-xl">
                  Target: {santri.Target_Juz || '3 Juz'}
                </span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tahfidzSearch}
                onChange={(e) => setTahfidzSearch(e.target.value)}
                placeholder="Cari Surah, Juz, Tanggal, atau catatan penguji..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 transition"
              />
            </div>

            {filteredTahfidz.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/80 text-emerald-950 uppercase text-[10px] font-bold border-b border-emerald-200">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Juz / Surah</th>
                      <th className="p-3">Ayat</th>
                      <th className="p-3 text-center">Lancar</th>
                      <th className="p-3 text-center">Tajwid</th>
                      <th className="p-3 text-center">Fashahah</th>
                      <th className="p-3 text-center">Nilai Rata</th>
                      <th className="p-3">Status Mutqin</th>
                      <th className="p-3">Pengajar</th>
                      <th className="p-3">Catatan Asatidz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTahfidz.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80">
                        <td className="p-3 text-gray-600 whitespace-nowrap font-mono text-[11px]">{t.Tanggal}</td>
                        <td className="p-3 font-bold text-gray-900">{t.Juz} / Surah {t.Surah}</td>
                        <td className="p-3 text-gray-700 font-medium">{t.Ayat}</td>
                        <td className="p-3 text-center font-semibold">{!isNilaiTahfidzPublished ? '-' : t.Kelancaran_Score}</td>
                        <td className="p-3 text-center font-semibold">{!isNilaiTahfidzPublished ? '-' : t.Tajwid_Score}</td>
                        <td className="p-3 text-center font-semibold">{!isNilaiTahfidzPublished ? '-' : t.Fashahah_Score}</td>
                        <td className="p-3 text-center font-extrabold text-emerald-700">{!isNilaiTahfidzPublished ? '-' : t.Nilai_Rata}</td>
                        <td className="p-3">
                          {!isNilaiTahfidzPublished ? (
                            <span className="text-amber-800 font-bold text-[10px] bg-amber-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Terkunci
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                              t.Status_Lulus === 'Mumtaz' ? 'bg-emerald-100 text-emerald-800' :
                              t.Status_Lulus === 'Jayyid Jiddan' ? 'bg-teal-100 text-teal-800' :
                              t.Status_Lulus === 'Jayyid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.Status_Lulus}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-700 whitespace-nowrap">{t.Pengajar}</td>
                        <td className="p-3 text-gray-600 max-w-xs">{!isNilaiTahfidzPublished ? 'Evaluasi asatidz belum dipublikasikan.' : t.Catatan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">Tidak ada riwayat setoran tahfidz yang sesuai.</p>
                <p className="text-[11px] text-gray-500">Semua setoran baru akan dicatat oleh ustadz pembimbing halaqah.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TAHSIN & IQRA' */}
      {currentTab === 'tahsin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!isNilaiTahsinPublished && (
            <div className="p-4.5 bg-amber-50 rounded-2xl border border-amber-300 flex items-start space-x-3 text-xs text-amber-950">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-amber-900 text-sm">Nilai Tahsin Belum Dipublikasikan</h4>
                <p className="text-amber-800">
                  {appSettings.pesanNilaiTerkunci || 'Nilai dan catatan pembinaan Tahsin sedang dalam tahap evaluasi asatidz dan belum dipublikasikan untuk periode ini.'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-blue-700" />
                  <span>Perkembangan Tahsin & Kaidah Tajwid</span>
                </h3>
                <p className="text-xs text-gray-500">Makharijul huruf, sifat huruf, dan kelancaran bacaan tilawah Al-Qur'an.</p>
              </div>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-xl">
                {santriTahsin.length} Catatan Pembinaan
              </span>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tahsinSearch}
                onChange={(e) => setTahsinSearch(e.target.value)}
                placeholder="Cari Jilid, Halaman, Materi tajwid, atau catatan evaluasi..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition"
              />
            </div>

            {filteredTahsin.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-50/80 text-blue-950 uppercase text-[10px] font-bold border-b border-blue-200">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Tingkat / Jilid</th>
                      <th className="p-3">Halaman / Materi</th>
                      <th className="p-3 text-center">Nilai</th>
                      <th className="p-3">Evaluasi / Status</th>
                      <th className="p-3">Pengajar</th>
                      <th className="p-3">Catatan Pembinaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTahsin.map((ts) => (
                      <tr key={ts.id} className="hover:bg-gray-50/80">
                        <td className="p-3 text-gray-600 whitespace-nowrap font-mono text-[11px]">{ts.Tanggal}</td>
                        <td className="p-3 font-bold text-gray-900">{ts.Jilid_Iqra}</td>
                        <td className="p-3 text-gray-700 font-medium">{ts.Halaman}</td>
                        <td className="p-3 text-center font-bold text-blue-700">{!isNilaiTahsinPublished ? '-' : ts.Nilai}</td>
                        <td className="p-3">
                          {!isNilaiTahsinPublished ? (
                            <span className="text-amber-800 font-bold text-[10px] bg-amber-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Terkunci
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                              ts.Status_Kelulusan === 'Lanjut' ? 'bg-emerald-100 text-emerald-800' :
                              ts.Status_Kelulusan === 'Lulus Jilid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ts.Status_Kelulusan}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-700 whitespace-nowrap">{ts.Pengajar}</td>
                        <td className="p-3 text-gray-600 max-w-xs">{!isNilaiTahsinPublished ? 'Catatan evaluasi pembinaan belum dipublikasikan.' : ts.Catatan_Evaluasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <BookOpenCheck className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">Tidak ada riwayat perkembangan tahsin yang sesuai.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: NGAJI DINIYYAH */}
      {currentTab === 'diniyyah' && (
        <div className="animate-in fade-in duration-200">
          <NgajiDiniyyahView isWaliPortal={true} />
        </div>
      )}

      {/* TAB 6: ABSENSI & KEHADIRAN */}
      {currentTab === 'absensi' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-700" />
                <span>Rekapitulasi Kehadiran Santri</span>
              </h3>
              <p className="text-xs text-gray-500">Presensi kehadiran otomatis menggunakan pemindaian QR Code di masjid/halaqah.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl">
                Hadir: {totalHadir}
              </span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-800 font-bold rounded-xl">
                Izin/Sakit: {santriAbsensi.filter(a => a.status === 'Izin' || a.status === 'Sakit').length}
              </span>
              <span className="px-3 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-xl">
                Alpa: {santriAbsensi.filter(a => a.status === 'Alpa').length}
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-800 font-bold rounded-xl">
                Total: {santriAbsensi.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold border-b border-gray-200">
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Halaqah</th>
                  <th className="p-3">Waktu Presensi</th>
                  <th className="p-3">Status Kehadiran</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {santriAbsensi.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/80">
                    <td className="p-3 font-semibold text-gray-900 whitespace-nowrap font-mono text-[11px]">{a.tanggal}</td>
                    <td className="p-3 text-gray-600">{a.halaqah}</td>
                    <td className="p-3 text-gray-600 font-mono">{a.waktuScan || '15:30 WIB'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'Sakit' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{a.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: KEUANGAN & SPP */}
      {currentTab === 'administrasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Informasi Pembayaran & Konfirmasi Pembayaran Card */}
          <div id="card-informasi-pembayaran" className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-emerald-700/60 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
              <CreditCard className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-400/20 rounded-full text-[11px] font-bold text-yellow-300 border border-yellow-400/30 mb-2">
                    <Building className="w-3.5 h-3.5" />
                    <span>Rekening Resmi RTQ Cendikia</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Informasi Pembayaran
                  </h4>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    Silakan transfer infaq / SPP santri ananda <strong>{santri.Nama_Lengkap}</strong> (NIS: {santri.NIS}) ke rekening resmi bendahara RTQ berikut:
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-800/70 px-3.5 py-2 rounded-2xl border border-emerald-700/80 self-start sm:self-auto shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-100">Rekening Terverifikasi</span>
                </div>
              </div>

              {/* Box Rincian Rekening */}
              <div className="bg-emerald-900/90 backdrop-blur-xs p-5 sm:p-6 rounded-2xl border border-emerald-700/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
                  <span className="text-xs font-bold text-yellow-300">Bank Rakyat Indonesia (BRI)</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200">Rekening Resmi Bendahara</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Atas Nama (A.N.)
                    </p>
                    <h5 className="text-lg sm:text-xl font-black text-white tracking-wide">
                      SUWASNO
                    </h5>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Nomor Rekening BRI
                    </p>
                    <div className="flex items-center sm:justify-end">
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-yellow-300 bg-emerald-950/90 px-4 py-2 rounded-xl border border-emerald-700/60 select-all shadow-inner">
                        012901044008503
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-800/60">
                  {/* Tombol Salin Nomor Rekening */}
                  <button
                    id="btn-salin-rekening"
                    type="button"
                    onClick={handleCopyRekening}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer ${
                      copiedRekening
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-white text-emerald-950 hover:bg-emerald-50 active:scale-98'
                    }`}
                  >
                    {copiedRekening ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Nomor Rekening Berhasil Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-emerald-800" />
                        <span>Salin Nomor Rekening</span>
                      </>
                    )}
                  </button>

                  {/* Tombol Konfirmasi Pembayaran WhatsApp */}
                  <button
                    id="btn-konfirmasi-wa"
                    type="button"
                    onClick={handleConfirmPaymentWA}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-yellow-300" />
                    <span>Konfirmasi Pembayaran via WhatsApp</span>
                  </button>
                </div>

                {/* Info Nomor WhatsApp */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-emerald-200/90 pt-1 gap-2 border-t border-emerald-800/40">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Kontak WhatsApp Bendahara: <strong>Suwasno (+62 813-6700-9740)</strong></span>
                  </div>
                  <p className="text-emerald-300">
                    Kirimkan foto/screenshot bukti transfer setelah melakukan pembayaran.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Pembayaran SPP */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-700" />
                  <span>Riwayat Pembayaran Infaq & SPP Santri</span>
                </h3>
                <p className="text-xs text-gray-500">Status kelulusan administrasi, beasiswa BAZNAS, dan tanda terima resmi.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-teal-50/80 text-teal-950 uppercase text-[10px] font-bold border-b border-teal-200">
                    <th className="p-3">Bulan</th>
                    <th className="p-3">Tahun</th>
                    <th className="p-3">Jumlah Bayar</th>
                    <th className="p-3">Metode Pembayaran</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Nomor Kwitansi</th>
                    <th className="p-3">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {santriSpp.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{s.Bulan}</td>
                      <td className="p-3 text-gray-600">{s.Tahun}</td>
                      <td className="p-3 font-semibold text-emerald-700">Rp {s.Jumlah_Bayar.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-gray-700">{s.Metode}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.Status_Bayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.Status_Bayar}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-500 text-[11px]">{s.Nomor_Kwitansi}</td>
                      <td className="p-3 text-gray-600">{s.Petugas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Guidance Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-xs text-emerald-950">
              <h4 className="font-extrabold text-sm text-emerald-900">Salurkan Infaq & SPP Santri Secara Digital</h4>
              <p className="text-gray-600">
                Pembayaran dapat disalurkan melalui Rekening Resmi BRI a.n. SUWASNO atau Scan QRIS RTQ Cendikia di loket administrasi Masjid Agung Darussalam.
              </p>
              <p className="font-semibold pt-1 text-emerald-900">
                No. Rekening BRI: <strong className="font-mono text-sm text-emerald-800">012901044008503</strong> a.n. SUWASNO &bull; Konfirmasi WA: <strong className="font-mono text-emerald-800">+62 813-6700-9740</strong>
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-xs border border-emerald-100 text-center flex-shrink-0">
              <QrCode className="w-20 h-20 text-emerald-800 mx-auto" />
              <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 block font-mono">QRIS BAZNAS</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: PERIZINAN */}
      {currentTab === 'perizinan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>Riwayat Pengajuan Izin Santri</span>
                </h3>
                <p className="text-xs text-gray-500">Izin kepulangan santri, berobat, maupun agenda penting keluarga.</p>
              </div>
              <button
                onClick={() => setIsAjukanIzinOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Ajukan Izin Baru</span>
              </button>
            </div>

            {santriPerizinan.length > 0 ? (
              <div className="space-y-3">
                {santriPerizinan.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{p.jenisIzin}</span>
                        <span className="text-gray-400">&bull;</span>
                        <span className="text-gray-500 font-mono text-[11px]">Diajukan: {p.tanggalPengajuan}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] self-start sm:self-auto ${
                        p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600">
                      <div>Jadwal: <strong>{p.tanggalMulai} s/d {p.tanggalSelesai}</strong></div>
                      <div>Penjemput: <strong>{p.penjemput || santri.Nama_Wali}</strong></div>
                      <div>Disetujui: <strong>{p.disetujuiOleh || 'Dalam Proses'}</strong></div>
                    </div>

                    <p className="text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200 text-[11px]">
                      <strong>Alasan:</strong> {p.alasan}
                    </p>

                    {p.catatanUstadz && (
                      <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-[11px]">
                        <strong>Catatan Asatidz:</strong> {p.catatanUstadz}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <p className="text-xs text-gray-500">Belum ada pengajuan izin santri yang tercatat.</p>
                <button
                  onClick={() => setIsAjukanIzinOpen(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-800 transition"
                >
                  Ajukan Izin Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: PRESTASI & DISIPLIN */}
      {currentTab === 'prestasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Prestasi & Penghargaan Santri</span>
            </h3>
            {santriPrestasi.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {santriPrestasi.map((pr) => (
                  <div key={pr.id} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded uppercase">
                          {pr.Peringkat || pr.Tingkat}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{pr.Tanggal}</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mt-1">{pr.Judul_Prestasi}</h4>
                      <p className="text-xs text-gray-600">Kategori: {pr.Kategori} &bull; Tingkat: {pr.Tingkat}</p>
                      <p className="text-[11px] text-amber-900 font-semibold mt-1">{pr.Keterangan}</p>
                    </div>
                    <div className="pt-2 border-t border-amber-200/60 flex justify-end">
                      <button
                        onClick={() => setSelectedPrestasiForCert(pr)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 text-xs font-bold rounded-lg shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Lihat E-Sertifikat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-3 italic">Belum ada catatan prestasi atau wisuda tahfidz yang dicatat.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Catatan Kedisiplinan & Pembinaan Adab</span>
            </h3>
            {santriPelanggaran.length > 0 ? (
              <div className="space-y-3">
                {santriPelanggaran.map((pl) => (
                  <div key={pl.id} className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950">{pl.Bentuk_Pelanggaran}</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded">
                        {pl.Status_Pembinaan}
                      </span>
                    </div>
                    <p className="text-gray-600">{pl.Keterangan}</p>
                    <p className="text-[11px] text-rose-900 font-semibold">Tindakan: {pl.Tindakan_Ustadz}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Alhamdulillah! Santri memiliki catatan kedisiplinan dan adab yang sangat baik di pesantren.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 10: JADWAL KEGIATAN */}
      {currentTab === 'jadwal' && (
        <div className="animate-in fade-in duration-200">
          <JadwalView />
        </div>
      )}

      {/* TAB 11: PENGUMUMAN PESANTREN */}
      {currentTab === 'pengumuman' && (
        <div className="animate-in fade-in duration-200">
          <PengumumanView />
        </div>
      )}

      {/* TAB: FOTO KEGIATAN */}
      {currentTab === 'foto-kegiatan' && (
        <div className="animate-in fade-in duration-200">
          <FotoKegiatanView />
        </div>
      )}

      {/* TAB 12: MEDIA RTQ */}
      {currentTab === 'media-rtq' && (
        <div className="animate-in fade-in duration-200">
          <MediaRTQView />
        </div>
      )}

      {/* TAB: GANTI KATA SANDI (PORTAL WALI SANTRI) */}
      {currentTab === 'ganti-password' && (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 pb-5 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center shadow-md">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ganti Kata Sandi Akun Wali Santri</h3>
                <p className="text-xs text-gray-500">
                  Perbarui kata sandi login untuk ananda <strong className="text-emerald-800">{santri.Nama_Lengkap}</strong>
                </p>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Akun Terdaftar</span>
                <p className="text-sm font-black text-emerald-950">{santri.Nama_Lengkap}</p>
                <p className="text-xs text-emerald-700">Wali: {santri.Nama_Wali} ({santri.WA_Wali})</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Role: Wali Santri
                </span>
                {currentUser?.isDefaultPassword === false && currentUser?.passwordUpdatedAt && (
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Terakhir diubah: {new Date(currentUser.passwordUpdatedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            {/* Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setPassError('');
                setPassSuccess('');

                if (!oldPasswordInput) {
                  setPassError('Kata sandi saat ini harus diisi.');
                  return;
                }
                if (!newPasswordInput) {
                  setPassError('Kata sandi baru harus diisi.');
                  return;
                }
                if (newPasswordInput.length < 6) {
                  setPassError('Kata sandi baru minimal 6 karakter.');
                  return;
                }
                if (newPasswordInput !== confirmPasswordInput) {
                  setPassError('Konfirmasi kata sandi tidak cocok.');
                  return;
                }
                if (newPasswordInput === oldPasswordInput) {
                  setPassError('Kata sandi baru tidak boleh sama dengan kata sandi saat ini.');
                  return;
                }

                setIsSubmittingPass(true);
                const result = await changePassword(oldPasswordInput, newPasswordInput);
                setIsSubmittingPass(false);

                if (result.success) {
                  setPassSuccess('Kata sandi berhasil diperbarui! Admin telah menerima data perubahan kata sandi ini.');
                  setOldPasswordInput('');
                  setNewPasswordInput('');
                  setConfirmPasswordInput('');
                } else {
                  setPassError(result.message || 'Gagal mengubah kata sandi.');
                }
              }}
              className="mt-6 space-y-4"
            >
              {passError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span className="font-semibold">{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Kata Sandi Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi lama / awal (default: rtq_cendekia)"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Ulangi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sync Info Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Pemberitahuan Sistem:</strong> Kata sandi baru yang Anda simpan akan tersinkronisasi otomatis dengan sistem pengelola/Admin RTQ Cendikia untuk memudahkan bantuan login dan verifikasi akun jika diperlukan.
                </p>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveMenu('dashboard')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer transition"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-60 flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmittingPass ? 'Menyimpan...' : 'Simpan Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJUKAN IZIN */}
      {isAjukanIzinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-emerald-900">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-base">Formulir Pengajuan Izin Santri</h4>
              </div>
              <button
                onClick={() => setIsAjukanIzinOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAjukanIzin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Santri</label>
                <input
                  type="text"
                  value={santri.Nama_Lengkap}
                  disabled
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Mulai Izin</label>
                  <input
                    type="date"
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Jenis Izin</label>
                <select
                  value={jenisIzin}
                  onChange={(e) => setJenisIzin(e.target.value as PerizinanRecord['jenisIzin'])}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                >
                  <option value="Pulang/Keluarga">Pulang / Keperluan Keluarga</option>
                  <option value="Sakit/Berobat">Sakit / Rawat / Berobat</option>
                  <option value="Kegiatan Luar">Kegiatan Sekolah Formal / Lomba</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alasan Lengkap</label>
                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Jelaskan alasan perizinan secara rinci..."
                  rows={3}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Penjemput (Wali/Kerabat)</label>
                <input
                  type="text"
                  value={penjemput}
                  onChange={(e) => setPenjemput(e.target.value)}
                  placeholder={`Contoh: ${santri.Nama_Wali} (Ayah)`}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAjukanIzinOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Kirim Pengajuan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
