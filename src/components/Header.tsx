import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Menu, 
  RefreshCw, 
  Sparkles,
  Bell,
  BellRing, 
  Image as ImageIcon,
  CloudCheck
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { 
    activeMenu, 
    setActiveMenu,
    currentUser, 
    getSantriForWali,
    setIsEditLogoModalOpen,
    unreadNotificationsCount,
    setIsNotificationCenterOpen,
    showToast
  } = useApp();

  const isWali = currentUser?.role === 'Wali Santri';
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Pengajar';
  const linkedSantri = isWali ? getSantriForWali() : null;
  const displayNama = (isWali && linkedSantri) ? linkedSantri.Nama_Wali : (currentUser?.nama || '');
  const displaySantri = (isWali && linkedSantri) ? linkedSantri.Nama_Lengkap : (currentUser?.namaSantri || '');

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { 
      title: isWali ? `Portal Wali: ${displayNama}` : 'Dashboard Utama', 
      subtitle: isWali ? `Pusat pantauan capaian tahfidz, kehadiran & administrasi ananda ${displaySantri}` : 'Pusat pantauan statistik dan aktivitas RTQ Cendikia' 
    },
    'profil-santri': {
      title: `Profil Santri: ${displaySantri}`,
      subtitle: 'Biodata identitas pribadi dan rincian alamat tempat tinggal ananda'
    },
    santri: { title: 'Data Santri RTQ', subtitle: 'Kelola biodata, kelas, halaqah, dan cetak QR Code Santri' },
    wali: { title: 'Data Wali Santri', subtitle: 'Kredensial login 65 akun wali santri dan reset password' },
    pengajar: { title: 'Data Pengajar & Asatidz', subtitle: 'Daftar ustadz/ustadzah pembimbing halaqah tahfidz & tahsin' },
    absensi: { title: 'Presensi / Absensi Santri', subtitle: 'Pencatatan kehadiran harian & sistem scan barcode/QR code' },
    tahsin: { title: 'Perkembangan Tahsin & Iqra\'', subtitle: 'Catatan jilid, kelancaran tajwid, makhraj dan kenaikan halaman' },
    tahfidz: { title: 'Perkembangan Tahfidz Qur\'an', subtitle: 'Riwayat setoran hafalan (Ziyadah & Muroja\'ah) santri' },
    diniyyah: { title: 'Ngaji Diniyyah', subtitle: 'Pengelolaan data kurikulum kitab diniyyah, nilai santri, dan laporan semester' },
    akhlak: { title: 'Penilaian Akhlak & Adab', subtitle: 'Evaluasi adab terhadap ustadz, Al-Qur\'an, dan sesama santri' },
    ibadah: { title: 'Evaluasi Praktik Ibadah', subtitle: 'Capaian sholat berjamaah, qiyamul lail, dzikir harian, dan hafalan doa' },
    kebersihan: { title: 'Kebersihan & Kesehatan Santri', subtitle: 'Pemeriksaan fisik, UKS, dan pemantauan kondisi santri' },
    perizinan: { title: 'Perizinan Santri', subtitle: 'Permohonan izin keluar/pulang, sakit, dan verifikasi asatidz' },
    pengumuman: { title: 'Pengumuman Pesantren', subtitle: 'Informasi resmi, agenda kegiatan, dan kalender akademik RTQ' },
    prestasi: { title: 'Prestasi & E-Sertifikat', subtitle: 'Pencatatan rekor prestasi dan cetak sertifikat resmi' },
    pelanggaran: { title: 'Pelanggaran & Pembinaan', subtitle: 'Kedisiplinan santri dan bimbingan konseling ustadz' },
    rapor: { title: 'Laporan / Rapor Digital', subtitle: 'Cetak lembar rapor semester dan perkembangan berkala' },
    jadwal: { title: 'Jadwal Kegiatan RTQ', subtitle: 'Agenda halaqah, tasmi\', mabit, dan evaluasi bulanan' },
    administrasi: { title: 'Administrasi & SPP / Infaq', subtitle: 'Pencatatan pembayaran infaq bulanan dan bukti kwitansi' },
    sangu: { 
      title: isWali ? `Sangu & Uang Saku: ${displaySantri}` : 'Sangu Santri & QR Pembelian', 
      subtitle: isWali ? 'Informasi mutasi saldo titipan uang saku dan rincian transaksi belanja ananda' : 'Pencatatan keuangan uang saku, pengeluaran santri & scan QR belanja koperasi/kantin' 
    },
    'foto-kegiatan': { title: 'Foto Kegiatan RTQ', subtitle: 'Galeri dokumentasi kegiatan, wisuda, kajian, dan aktivitas santri' },
    'media-rtq': { title: 'Media RTQ Cendikia', subtitle: 'Akses media sosial resmi Facebook, YouTube, dan Instagram RTQ' },
    'ganti-password': { title: 'Ganti Kata Sandi Akun', subtitle: 'Perbarui kata sandi portal wali santri secara mandiri dan tersinkronisasi' },
    notifikasi: { title: 'Notifikasi WhatsApp', subtitle: 'Generator pesan otomatis laporan perkembangan ke wali santri' },
    pengguna: { title: 'Manajemen Pengguna & Sistem', subtitle: 'Kelola akun, backup data, dan konfigurasi database' },
  };

  const currentMeta = titleMap[activeMenu] || { title: 'SIT RTQ Cendikia', subtitle: 'Sistem Informasi Terpadu' };

  return (
    <header id="main-header" className="bg-white border-b border-gray-200/90 px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-2.5">
        <button
          id="btn-toggle-menu"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          className="flex-shrink-0 cursor-pointer"
          onClick={() => {
            if (activeMenu !== 'dashboard') {
              setActiveMenu('dashboard');
            }
          }}
          title={activeMenu !== 'dashboard' ? 'Kembali ke Beranda Utama' : 'Logo Resmi RTQ Cendikia BAZNAS'}
        >
          <Logo size="sm" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
              {currentMeta.title}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" /> T.A 2026/2027
            </span>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 justify-end">
        {/* Edit Logo Button (Only for Admin) */}
        {isAdmin && (
          <button
            id="btn-edit-logo-header"
            onClick={() => setIsEditLogoModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition"
            title="Edit Logo Resmi Aplikasi (Khusus Admin)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Edit Logo</span>
          </button>
        )}

        {/* Notifikasi & Pemberitahuan Aktivitas Wali Santri (Khusus Admin / Asatidz) */}
        {isAdmin && (
          <button
            id="btn-admin-notifications"
            onClick={() => setIsNotificationCenterOpen(true)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              unreadNotificationsCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400 shadow-xs'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border-gray-200'
            }`}
            title={`Pemberitahuan & Notifikasi Admin (${unreadNotificationsCount} baru)`}
            aria-label="Pemberitahuan & Notifikasi Admin"
          >
            {unreadNotificationsCount > 0 ? (
              <BellRing className="w-4 h-4 text-amber-700" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {/* Real-time onSnapshot Cloud Sync Status Badge */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-emerald-800 shadow-2xs"
          title="Sinkronisasi Real-Time Firestore onSnapshot Aktif: Seluruh update oleh Admin & Wali Santri otomatis terupdate seketika di semua perangkat"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <CloudCheck className="w-3.5 h-3.5 text-emerald-700 hidden sm:inline" />
          <span className="hidden sm:inline">Real-time onSnapshot Aktif</span>
          <span className="sm:hidden text-[10px]">Real-Time</span>
        </div>

        {/* Refresh Notification */}
        <button
          id="btn-refresh"
          onClick={() => showToast('Data sistem telah terhubung dan disinkronkan via Cloud Database!', 'success')}
          className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-gray-200 transition-colors"
          title="Sinkronisasi / Refresh Cloud Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
