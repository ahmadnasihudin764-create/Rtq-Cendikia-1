import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Sparkles, 
  QrCode, 
  FileSpreadsheet, 
  MessageSquareShare, 
  CheckCircle2, 
  Heart, 
  Target, 
  Trophy, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Share2, 
  Facebook, 
  Youtube, 
  Instagram, 
  ArrowUpRight, 
  Images, 
  Image as ImageIcon, 
  Tag, 
  BarChart3, 
  Medal,
  Wallet,
  BookOpenCheck,
  BookMarked,
  HeartHandshake,
  Activity,
  FileText,
  ShieldAlert,
  CalendarDays,
  ReceiptText,
  Megaphone,
  UserCog,
  UserCheck,
  Search,
  SlidersHorizontal,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { JadwalKegiatan } from '../types';
import { computeHafalanAnalytics } from '../utils/hafalanAnalytics';

export const DashboardView: React.FC = () => {
  const { 
    santriList, 
    pengajarList, 
    absensiList, 
    tahfidzList, 
    tahsinList, 
    kebersihanList,
    targetList,
    prestasiList,
    fotoKegiatanList,
    jadwalList,
    perizinanList = [],
    pengumumanList = [],
    sanguList = [],
    currentUser,
    setActiveMenu, 
    setIsQRScannerOpen,
    setSelectedSantriForCard
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchMenuQuery, setSearchMenuQuery] = useState<string>('');
  const [selectedAgendaPhotoFilter, setSelectedAgendaPhotoFilter] = useState<string>('Semua');

  const today = new Date().toISOString().split('T')[0];
  const santriAktif = (santriList || []).filter(s => s.Status === 'Aktif').length;
  const pengajarAktif = (pengajarList || []).filter(p => p.Status === 'Aktif').length;
  const absensiHariIni = (absensiList || []).filter(a => a.tanggal === today && a.status === 'Hadir').length;
  const totalSetoran = (tahfidzList || []).length + (tahsinList || []).length;

  // Sangu metrics
  const totalSanguPemasukan = (sanguList || [])
    .filter(t => t.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalSanguPengeluaran = (sanguList || [])
    .filter(t => t.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalKasSangu = totalSanguPemasukan - totalSanguPengeluaran;

  // Compute Hafalan Analytics for Dashboard Chart
  const hafalanAnalytics = useMemo(() => {
    return computeHafalanAnalytics(santriList, tahfidzList, targetList);
  }, [santriList, tahfidzList, targetList]);

  // Matching logic for today's agenda based on jadwalList
  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentDayName = dayNames[currentDayIndex];

  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(now);

  const isJadwalToday = (j: JadwalKegiatan) => {
    const hari = (j.Hari || '').toLowerCase();
    const curDay = currentDayName.toLowerCase();
    
    if (hari.includes(curDay)) return true;
    
    const isWeekday = currentDayIndex >= 1 && currentDayIndex <= 5;
    if (isWeekday && (hari.includes('senin') && hari.includes('jumat'))) {
      return true;
    }
    
    if (hari.includes('setiap hari') || hari.includes('harian')) {
      return true;
    }
    
    return false;
  };

  const todayAgendas = jadwalList.filter(isJadwalToday);
  const displayedAgendas = todayAgendas.length > 0 ? todayAgendas : jadwalList.slice(0, 3);

  // =========================================================================
  // MAIN MENU GRID CONFIGURATION (Circular Icons, 5 per row when size permits)
  // =========================================================================
  const allMenuItems = [
    {
      id: 'santri',
      label: 'Data Santri',
      sub: `${santriAktif} Santri`,
      icon: GraduationCap,
      category: 'Santri & Pengajar',
      bgGradient: 'from-emerald-500 to-teal-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-emerald-200',
      badge: santriAktif > 0 ? `${santriAktif}` : undefined
    },
    {
      id: 'tahfidz',
      label: 'Tahfidz Qur\'an',
      sub: 'Setoran & Ziyadah',
      icon: BookOpen,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-amber-400 to-amber-600',
      iconColor: 'text-emerald-950',
      shadowColor: 'shadow-amber-200',
      badge: tahfidzList.length > 0 ? `${tahfidzList.length}` : undefined
    },
    {
      id: 'tahsin',
      label: 'Tahsin & Iqra\'',
      sub: 'Tajwid & Makhraj',
      icon: BookOpenCheck,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-teal-400 to-emerald-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-teal-200'
    },
    {
      id: 'grafik-hafalan',
      label: 'Grafik Hafalan',
      sub: 'Analisis Juz 1-30',
      icon: BarChart3,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-indigo-500 to-blue-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-indigo-200'
    },
    {
      id: 'sangu',
      label: 'Sangu Santri',
      sub: 'E-Wallet & Koperasi',
      icon: Wallet,
      category: 'Keuangan & Sangu',
      bgGradient: 'from-yellow-400 to-amber-500',
      iconColor: 'text-emerald-950',
      shadowColor: 'shadow-yellow-200',
      badge: 'QR'
    },
    {
      id: 'absensi',
      label: 'Presensi / QR',
      sub: 'Scan Kehadiran',
      icon: ClipboardCheck,
      category: 'Santri & Pengajar',
      bgGradient: 'from-blue-500 to-cyan-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-blue-200',
      badge: `${absensiHariIni || 0} Hadir`
    },
    {
      id: 'diniyyah',
      label: 'Ngaji Diniyyah',
      sub: 'Kitab & Nilai',
      icon: BookMarked,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-purple-500 to-indigo-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-purple-200'
    },
    {
      id: 'akhlak',
      label: 'Penilaian Adab',
      sub: 'Akhlakul Karimah',
      icon: HeartHandshake,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-rose-400 to-rose-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-rose-200'
    },
    {
      id: 'ibadah',
      label: 'Praktik Ibadah',
      sub: 'Sholat & Dzikir',
      icon: Sparkles,
      category: 'Qur\'an & Ibadah',
      bgGradient: 'from-cyan-400 to-blue-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-cyan-200'
    },
    {
      id: 'perizinan',
      label: 'Perizinan',
      sub: 'Izin Pulang & Sakit',
      icon: FileText,
      category: 'Layanan & Info',
      bgGradient: 'from-orange-400 to-amber-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-orange-200',
      badge: perizinanList.filter(p => p.status === 'Menunggu Persetujuan').length > 0
        ? `${perizinanList.filter(p => p.status === 'Menunggu Persetujuan').length} Baru`
        : undefined
    },
    {
      id: 'administrasi',
      label: 'SPP / Infaq',
      sub: 'Kas & Kwitansi',
      icon: ReceiptText,
      category: 'Keuangan & Sangu',
      bgGradient: 'from-emerald-600 to-green-700',
      iconColor: 'text-white',
      shadowColor: 'shadow-emerald-200'
    },
    {
      id: 'rapor',
      label: 'Rapor Digital',
      sub: 'Cetak Lembar PDF',
      icon: FileSpreadsheet,
      category: 'Layanan & Info',
      bgGradient: 'from-teal-500 to-emerald-700',
      iconColor: 'text-white',
      shadowColor: 'shadow-teal-200'
    },
    {
      id: 'prestasi',
      label: 'E-Sertifikat',
      sub: 'Prestasi & Juara',
      icon: Trophy,
      category: 'Layanan & Info',
      bgGradient: 'from-amber-500 to-yellow-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-amber-200'
    },
    {
      id: 'pengajar',
      label: 'Data Asatidz',
      sub: `${pengajarAktif} Pengajar`,
      icon: Users,
      category: 'Santri & Pengajar',
      bgGradient: 'from-sky-500 to-blue-700',
      iconColor: 'text-white',
      shadowColor: 'shadow-sky-200'
    },
    {
      id: 'wali',
      label: 'Wali Santri',
      sub: 'Akun & Kontak',
      icon: UserCheck,
      category: 'Santri & Pengajar',
      bgGradient: 'from-violet-500 to-purple-700',
      iconColor: 'text-white',
      shadowColor: 'shadow-violet-200'
    },
    {
      id: 'jadwal',
      label: 'Jadwal Agenda',
      sub: 'Halaqah & Evaluasi',
      icon: CalendarDays,
      category: 'Layanan & Info',
      bgGradient: 'from-fuchsia-500 to-pink-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-fuchsia-200'
    },
    {
      id: 'pengumuman',
      label: 'Pengumuman',
      sub: 'Info Resmi RTQ',
      icon: Megaphone,
      category: 'Layanan & Info',
      bgGradient: 'from-red-500 to-rose-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-red-200',
      badge: pengumumanList.length > 0 ? `${pengumumanList.length}` : undefined
    },
    {
      id: 'foto-kegiatan',
      label: 'Foto Kegiatan',
      sub: 'Dokumentasi Santri',
      icon: Images,
      category: 'Layanan & Info',
      bgGradient: 'from-emerald-400 to-teal-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-emerald-200'
    },
    {
      id: 'media-rtq',
      label: 'Media RTQ',
      sub: 'FB, YouTube, IG',
      icon: Share2,
      category: 'Layanan & Info',
      bgGradient: 'from-pink-500 to-rose-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-pink-200'
    },
    {
      id: 'kebersihan',
      label: 'UKS & Sehat',
      sub: 'Kesehatan Fisik',
      icon: Activity,
      category: 'Santri & Pengajar',
      bgGradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-green-200'
    },
    {
      id: 'pelanggaran',
      label: 'Kedisiplinan',
      sub: 'Konseling & Adab',
      icon: ShieldAlert,
      category: 'Layanan & Info',
      bgGradient: 'from-rose-500 to-red-700',
      iconColor: 'text-white',
      shadowColor: 'shadow-rose-200'
    },
    {
      id: 'notifikasi',
      label: 'Broadcast WA',
      sub: 'Notifikasi Otomatis',
      icon: MessageSquareShare,
      category: 'Sistem',
      bgGradient: 'from-emerald-500 to-green-600',
      iconColor: 'text-white',
      shadowColor: 'shadow-emerald-200'
    },
    {
      id: 'pengguna',
      label: 'Pengguna',
      sub: 'Hak Akses & Akun',
      icon: UserCog,
      category: 'Sistem',
      bgGradient: 'from-slate-600 to-gray-800',
      iconColor: 'text-white',
      shadowColor: 'shadow-slate-200'
    }
  ];

  // Filtered menu based on category & search query
  const filteredMenuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }
      if (searchMenuQuery.trim()) {
        const q = searchMenuQuery.toLowerCase();
        const matchLabel = item.label.toLowerCase().includes(q);
        const matchSub = item.sub.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchLabel && !matchSub && !matchCat) return false;
      }
      return true;
    });
  }, [allMenuItems, selectedCategory, searchMenuQuery]);

  const categories = [
    { id: 'Semua', label: '🌟 Semua Menu', count: allMenuItems.length },
    { id: 'Qur\'an & Ibadah', label: '📖 Qur\'an & Ibadah', count: allMenuItems.filter(m => m.category === 'Qur\'an & Ibadah').length },
    { id: 'Santri & Pengajar', label: '🎓 Santri & Pengajar', count: allMenuItems.filter(m => m.category === 'Santri & Pengajar').length },
    { id: 'Keuangan & Sangu', label: '💰 Keuangan & Sangu', count: allMenuItems.filter(m => m.category === 'Keuangan & Sangu').length },
    { id: 'Layanan & Info', label: '📋 Layanan & Info', count: allMenuItems.filter(m => m.category === 'Layanan & Info').length },
    { id: 'Sistem', label: '⚙️ Sistem', count: allMenuItems.filter(m => m.category === 'Sistem').length }
  ];

  return (
    <div id="section-dashboard-view" className="space-y-6 animate-in fade-in duration-200 pb-16 md:pb-6">
      
      {/* ========================================================================= */}
      {/* MODERN MOBILE BOARDING SCHOOL HERO CARD                                   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-800/80 relative overflow-hidden">
        {/* Background Islamic Calligraphy / Pattern Accent */}
        <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-8 pointer-events-none">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/15 border border-yellow-400/30 rounded-full text-[11px] font-bold text-yellow-300 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>🌙 14 Sya'ban 1447 H &bull; T.A 2026/2027</span>
            </div>

            <span className="text-[11px] font-medium text-emerald-200/90 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-700/50">
              Masjid Agung Darussalam
            </span>
          </div>

          {/* User Greeting & School Identity */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <p className="text-xs font-semibold text-emerald-300 tracking-wide">
                Assalamu'alaikum Warahmatullahi Wabarakatuh,
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-0.5">
                {currentUser?.nama || 'Ustadz / Pengelola RTQ'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                Rumah Tahfidz Qur'an (RTQ) Cendikia BAZNAS &bull; Pusat Pembinaan Tahfidz, Tahsin, & Karakter Qur'ani.
              </p>
            </div>

            {/* Quick Action Floating Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="hero-btn-scan-qr"
                onClick={() => setIsQRScannerOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-emerald-950 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-950" />
                <span>Scan QR Code</span>
              </button>

              <button
                id="hero-btn-input-tahfidz"
                onClick={() => setActiveMenu('tahfidz')}
                className="px-3.5 py-2.5 bg-emerald-800/90 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl border border-emerald-600/70 shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-yellow-300" />
                <span>+ Setoran Tahfidz</span>
              </button>
            </div>
          </div>

          {/* Quick Highlight Cards inside Hero Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-emerald-800/80">
            <div 
              onClick={() => setActiveMenu('santri')}
              className="bg-emerald-900/60 hover:bg-emerald-900/90 p-3 rounded-2xl border border-emerald-700/60 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] font-semibold text-emerald-300 uppercase">Santri Aktif</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-white">{santriAktif}</span>
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div 
              onClick={() => setActiveMenu('absensi')}
              className="bg-emerald-900/60 hover:bg-emerald-900/90 p-3 rounded-2xl border border-emerald-700/60 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] font-semibold text-emerald-300 uppercase">Presensi Hari Ini</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-yellow-300">{absensiHariIni || 5}</span>
                <ClipboardCheck className="w-4 h-4 text-yellow-300" />
              </div>
            </div>

            <div 
              onClick={() => setActiveMenu('tahfidz')}
              className="bg-emerald-900/60 hover:bg-emerald-900/90 p-3 rounded-2xl border border-emerald-700/60 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] font-semibold text-emerald-300 uppercase">Total Setoran</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-white">{totalSetoran}</span>
                <BookOpen className="w-4 h-4 text-teal-300" />
              </div>
            </div>

            <div 
              onClick={() => setActiveMenu('sangu')}
              className="bg-emerald-900/60 hover:bg-emerald-900/90 p-3 rounded-2xl border border-emerald-700/60 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] font-semibold text-emerald-300 uppercase">Kas Sangu Santri</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-black text-yellow-300 truncate">
                  Rp {totalKasSangu.toLocaleString('id-ID')}
                </span>
                <Wallet className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN MENU GRID WITH CIRCULAR ICONS (5 per row when size permits)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        
        {/* Grid Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Navigasi Aplikasi Mobile Boarding School</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Menu Utama & Layanan Pesantren
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pilih modul layanan di bawah untuk membuka fitur secara cepat dan mudah.
            </p>
          </div>

          {/* Search Menu Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchMenuQuery}
              onChange={(e) => setSearchMenuQuery(e.target.value)}
              placeholder="Cari menu / layanan..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 focus:bg-white focus:border-emerald-600 outline-none transition"
            />
            {searchMenuQuery && (
              <button
                onClick={() => setSearchMenuQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === cat.id ? 'bg-emerald-950 text-yellow-300' : 'bg-gray-200 text-gray-600'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* THE RESPONSIVE CIRCULAR ICONS GRID (5 per row on standard/wide screen) */}
        {filteredMenuItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <p className="text-xs font-bold text-gray-700">Tidak ada menu yang sesuai dengan "{searchMenuQuery}"</p>
            <button
              onClick={() => {
                setSearchMenuQuery('');
                setSelectedCategory('Semua');
              }}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5 pt-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`grid-menu-${item.id}`}
                  onClick={() => setActiveMenu(item.id)}
                  className="flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl hover:bg-emerald-50/60 active:scale-95 transition-all duration-150 cursor-pointer group relative"
                  title={`${item.label} - ${item.sub}`}
                >
                  {/* Circular Icon Container */}
                  <div className="relative">
                    <div 
                      className={`w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${item.bgGradient} flex items-center justify-center shadow-md ${item.shadowColor} group-hover:scale-108 group-hover:shadow-lg transition-transform duration-200`}
                    >
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor} transition-transform group-hover:rotate-6`} />
                    </div>

                    {/* Notification / Stat Badge on Top-Right */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs animate-in zoom-in">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Menu Title */}
                  <span className="text-xs sm:text-[13px] font-extrabold text-gray-900 group-hover:text-emerald-800 transition-colors mt-2 leading-tight line-clamp-2">
                    {item.label}
                  </span>

                  {/* Subtitle / Description */}
                  <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5 line-clamp-1 hidden sm:block">
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* GRAFIK HAFALAN SANTRI SECTION (Distribusi 1 Juz - 30 Juz)                 */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Grafik Perolehan Hafalan Al-Qur'an Santri</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Distribusi Persentase (%) & Jumlah Santri per Perolehan Juz
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Analisis perolehan hafalan 1 Juz, 2 Juz, 3 Juz, 4 Juz, 5 Juz hingga 30 Juz secara mutqin dan transparan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMenu('grafik-hafalan')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-yellow-300" />
              <span>Buka Menu Grafik Lengkap →</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-emerald-800">Total Santri Aktif</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-950">{hafalanAnalytics.totalSantri}</span>
              <span className="text-xs text-emerald-700">Santri</span>
            </div>
          </div>

          <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-teal-800">Santri Berhafalan</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-teal-950">{hafalanAnalytics.totalSantriTahfidz}</span>
              <span className="text-xs text-teal-700">Santri ({+((hafalanAnalytics.totalSantriTahfidz / (hafalanAnalytics.totalSantri || 1)) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-amber-800">Akumulasi Terhafal</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-amber-950">{hafalanAnalytics.totalAkumulasiJuz}</span>
              <span className="text-xs text-amber-700">Juz</span>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-indigo-800">Rata-rata / Tertinggi</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black text-indigo-950">{hafalanAnalytics.averageJuz}</span>
              <span className="text-xs text-indigo-700">Juz / max {hafalanAnalytics.highestJuz} Juz</span>
            </div>
          </div>
        </div>

        {/* Proportional Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {hafalanAnalytics.groupedTierStats.map((tier) => (
            <div
              key={tier.key}
              onClick={() => setActiveMenu('grafik-hafalan')}
              className="p-3.5 bg-gray-50/70 hover:bg-emerald-50/50 rounded-2xl border border-gray-200/90 hover:border-emerald-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="font-bold text-gray-900 group-hover:text-emerald-900 transition">
                  {tier.label}
                </span>
                <div className="flex items-center space-x-2.5">
                  <span className="text-gray-700 font-bold">{tier.count} Santri</span>
                  <span className="font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-xs">
                    {tier.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tier.bgColor}`}
                  style={{ width: `${Math.max(tier.percentage > 0 ? 4 : 0, tier.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HALAQAH SCHEDULE & PROGRESS CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress Visualization */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Perkembangan Capaian Santri</h3>
              <p className="text-xs text-gray-500">Distribusi kelulusan hafalan dan kebersihan halaqah</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Semester Ganjil 2026 / 2027
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1 text-gray-700">
                <span>Capaian Tahfidz Juz 30 & 29 (Target Kelulusan)</span>
                <span className="font-bold text-emerald-700">88%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1 text-gray-700">
                <span>Kelancaran Makhraj & Tajwid (Tahsin Iqra)</span>
                <span className="font-bold text-teal-700">92%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1 text-gray-700">
                <span>Tingkat Kehadiran Santri (Presensi Halaqah)</span>
                <span className="font-bold text-blue-700">95%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '95%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1 text-gray-700">
                <span>Kedisiplinan & Penilaian Akhlak / Adab</span>
                <span className="font-bold text-amber-700">94%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '94%' }} />
              </div>
            </div>
          </div>

          {/* Quick Jump Modules */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveMenu('rapor')}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 mb-1" />
              <span className="text-xs font-bold leading-tight">Cetak Rapor Digital</span>
            </button>

            <button
              onClick={() => setActiveMenu('prestasi')}
              className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-amber-700 mb-1" />
              <span className="text-xs font-bold leading-tight">E-Sertifikat RTQ</span>
            </button>

            <button
              onClick={() => setActiveMenu('sangu')}
              className="p-3 bg-yellow-50 hover:bg-yellow-100 text-amber-950 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer"
            >
              <Wallet className="w-5 h-5 text-amber-700 mb-1" />
              <span className="text-xs font-bold leading-tight">Sangu & QR Kas</span>
            </button>

            <button
              onClick={() => setActiveMenu('notifikasi')}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer"
            >
              <MessageSquareShare className="w-5 h-5 text-blue-700 mb-1" />
              <span className="text-xs font-bold leading-tight">Broadcast WA</span>
            </button>
          </div>
        </div>

        {/* Right Column: Halaqah Activity & Schedule */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-300">Agenda Kegiatan RTQ</h4>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-800/60 px-2 py-0.5 rounded-full font-medium border border-emerald-700/50">
                {currentDayName}, {formattedToday.split(',')[1] || formattedToday}
              </span>
            </div>

            {displayedAgendas.length === 0 ? (
              <div className="p-4 bg-emerald-900/40 rounded-2xl border border-emerald-800/60 text-center space-y-2 my-2">
                <p className="text-xs text-emerald-200 font-medium">Belum ada agenda kegiatan yang ditambahkan admin.</p>
                <button
                  onClick={() => setActiveMenu('jadwal')}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-bold text-[11px] rounded-xl transition inline-flex items-center gap-1 shadow-xs"
                >
                  <span>+ Buat Agenda Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {displayedAgendas.map((jadwal) => (
                  <div 
                    key={jadwal.id} 
                    className="p-3 bg-emerald-900/70 hover:bg-emerald-900/90 rounded-2xl border border-emerald-800/80 transition shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-white leading-snug group-hover:text-yellow-200 transition-colors">
                        {jadwal.Nama_Kegiatan}
                      </p>
                      <span className="shrink-0 text-[9px] bg-yellow-400/20 text-yellow-300 font-bold px-2 py-0.5 rounded-md border border-yellow-400/30">
                        {jadwal.Hari}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="font-semibold text-emerald-100">{jadwal.Waktu}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-emerald-300/90 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{jadwal.Pengajar}</span>
                      </span>
                      <span className="flex items-center gap-1 text-teal-300">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{jadwal.Lokasi}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-emerald-800/80">
            <button
              onClick={() => setActiveMenu('jadwal')}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-98 cursor-pointer"
            >
              <span>{currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Pengajar' ? 'Kelola Jadwal & Agenda Lengkap' : 'Lihat Jadwal Lengkap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECENT SETORAN & SANTRI FEED                                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Setoran Terkini */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Setoran Tahfidz Terkini</h3>
            <button
              onClick={() => setActiveMenu('tahfidz')}
              className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {tahfidzList.slice(0, 4).map((t) => {
              const santri = santriList.find(s => s.NIS === t.NIS);
              return (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {t.Juz}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {santri?.Nama_Lengkap || t.NIS}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Surah {t.Surah} ({t.Ayat}) &bull; {t.Tanggal}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    {t.Status_Lulus} ({t.Nilai_Rata})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Santri & Kartu Digital Quick Access */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Santri Binaan RTQ</h3>
            <button
              onClick={() => setActiveMenu('santri')}
              className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Kelola Santri
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {santriList.slice(0, 4).map((s) => (
              <div
                key={s.NIS}
                onClick={() => setSelectedSantriForCard(s)}
                className="p-3 bg-gray-50 hover:bg-emerald-50/70 border border-gray-200 hover:border-emerald-300 rounded-2xl transition cursor-pointer flex items-center justify-between group"
              >
                <div className="overflow-hidden pr-2">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-800">
                    {s.Nama_Lengkap}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">{s.NIS} &bull; {s.Kelas.split(' ')[1] || s.Kelas}</p>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-gray-200 group-hover:border-emerald-400 text-emerald-700">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FOTO KEGIATAN & MEDIA RTQ CENDEKIA                                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Dokumentasi & Galeri Foto Agenda RTQ</h3>
              <p className="text-xs text-gray-500">Dokumentasi visual terhubung langsung dengan agenda kegiatan buatan Admin</p>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('foto-kegiatan')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <span>{currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Pengajar' ? 'Kelola & Upload Foto Agenda' : 'Lihat Semua Galeri'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filtered Photo Albums Display */}
        {fotoKegiatanList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fotoKegiatanList.slice(0, 4).map((album) => (
              <div
                key={album.id}
                onClick={() => setActiveMenu('foto-kegiatan')}
                className="group bg-white hover:bg-emerald-50/40 rounded-2xl border border-gray-200 hover:border-emerald-400 p-3 transition duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-gray-100 mb-2.5 border border-gray-100">
                    <img
                      src={album.fotoList[0] || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=600&auto=format&fit=crop&q=80'}
                      alt={album.judul}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=600&auto=format&fit=crop&q=80';
                      }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-yellow-300" />
                      <span>{album.fotoList.length} Foto</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-800 transition leading-snug">
                    {album.judul}
                  </h4>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {album.tanggal}
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                    Lihat <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              Belum ada album foto kegiatan yang diunggah.
            </p>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Pengajar') && (
              <button
                onClick={() => setActiveMenu('foto-kegiatan')}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Upload Foto Dokumentasi Baru</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MEDIA RTQ SOSIAL MEDIA CARDS                                              */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Media RTQ Cendikia BAZNAS</h3>
              <p className="text-xs text-gray-500">Saluran publikasi & media sosial resmi pesantren</p>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('media-rtq')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <span>Buka Halaman Media RTQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://www.facebook.com/share/1LLj67r1ne/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-blue-50/60 hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-2xl transition flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Facebook Resmi</p>
                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors">RTQ Cendikia BAZNAS</p>
              </div>
            </div>
            <div className="p-2 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>

          <a
            href="https://youtube.com/@rtqcendekiabaznasofficial?si=aENcqebny1iW-2oV"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-red-50/60 hover:bg-red-50 border border-red-200 hover:border-red-400 rounded-2xl transition flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">YouTube Channel</p>
                <p className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors">RTQ Cendikia Official</p>
              </div>
            </div>
            <div className="p-2 text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>

          <a
            href="https://www.instagram.com/rtq_cendikia_baznas?igsh=c3Y5a3VzeXVmdXNj"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-pink-50/60 hover:bg-pink-50 border border-pink-200 hover:border-pink-400 rounded-2xl transition flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider">Instagram Resmi</p>
                <p className="text-xs font-bold text-gray-900 group-hover:text-pink-700 transition-colors">@rtq_cendikia_baznas</p>
              </div>
            </div>
            <div className="p-2 text-pink-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>
        </div>
      </div>

    </div>
  );
};
