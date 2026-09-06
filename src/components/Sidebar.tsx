import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpenCheck,
  BookOpen,
  HeartHandshake,
  Sparkles,
  ShieldAlert,
  CalendarDays,
  ReceiptText,
  FileSpreadsheet,
  MessageSquareShare,
  UserCog,
  LogOut,
  Trophy,
  Activity,
  FileText,
  Megaphone,
  KeyRound,
  UserCheck,
  Share2,
  Images,
  BookMarked,
  BarChart3,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { 
    currentUser, 
    getSantriForWali, 
    logout, 
    activeMenu, 
    setActiveMenu, 
    setIsGantiPasswordOpen,
    setIsEditLogoModalOpen 
  } = useApp();

  const isWali = currentUser?.role === 'Wali Santri';
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Pengajar';
  const linkedSantri = isWali ? getSantriForWali() : null;
  const displayNama = (isWali && linkedSantri) ? linkedSantri.Nama_Wali : (currentUser?.nama || '');
  const displaySantri = (isWali && linkedSantri) ? linkedSantri.Nama_Lengkap : (currentUser?.namaSantri || '');

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Utama' },
    { id: 'santri', label: 'Data Santri', icon: GraduationCap, category: 'Data Master' },
    { id: 'wali', label: 'Data Wali Santri', icon: UserCheck, category: 'Data Master' },
    { id: 'pengajar', label: 'Data Pengajar', icon: Users, category: 'Data Master' },
    { id: 'absensi', label: 'Absensi Santri (QR)', icon: ClipboardCheck, category: 'Data Master' },
    
    { id: 'tahsin', label: 'Tahsin & Iqra\'', icon: BookOpenCheck, category: 'Perkembangan' },
    { id: 'tahfidz', label: 'Tahfidz Al-Qur\'an', icon: BookOpen, category: 'Perkembangan' },
    { id: 'grafik-hafalan', label: 'Grafik Hafalan', icon: BarChart3, category: 'Perkembangan' },
    { id: 'diniyyah', label: 'Ngaji Diniyyah', icon: BookMarked, category: 'Perkembangan' },
    { id: 'akhlak', label: 'Penilaian Akhlak', icon: HeartHandshake, category: 'Perkembangan' },
    { id: 'ibadah', label: 'Praktik Ibadah', icon: Sparkles, category: 'Perkembangan' },
    { id: 'kebersihan', label: 'Kebersihan & Sehat', icon: Activity, category: 'Perkembangan' },

    { id: 'perizinan', label: 'Perizinan Santri', icon: FileText, category: 'Layanan & Info' },
    { id: 'administrasi', label: 'Administrasi & SPP', icon: ReceiptText, category: 'Layanan & Info' },
    { id: 'sangu', label: 'Sangu Santri (QR)', icon: Wallet, category: 'Layanan & Info' },
    { id: 'prestasi', label: 'Prestasi & Sertifikat', icon: Trophy, category: 'Layanan & Info' },
    { id: 'pelanggaran', label: 'Pelanggaran & Adab', icon: ShieldAlert, category: 'Layanan & Info' },
    { id: 'rapor', label: 'Laporan / Rapor', icon: FileSpreadsheet, category: 'Laporan & Info' },
    { id: 'jadwal', label: 'Jadwal Kegiatan', icon: CalendarDays, category: 'Layanan & Info' },
    { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, category: 'Layanan & Info' },
    { id: 'foto-kegiatan', label: 'Foto Kegiatan', icon: Images, category: 'Layanan & Info' },
    { id: 'media-rtq', label: 'Media RTQ', icon: Share2, category: 'Layanan & Info' },

    { id: 'notifikasi', label: 'Notifikasi WhatsApp', icon: MessageSquareShare, category: 'Sistem' },
    { id: 'pengguna', label: 'Manajemen Pengguna', icon: UserCog, category: 'Sistem' },
  ];

  const waliMenuItems = [
    { id: 'dashboard', label: 'Portal Wali Santri', icon: LayoutDashboard, category: 'Menu Wali' },
    { id: 'profil-santri', label: 'Profil Santri', icon: UserCheck, category: 'Menu Wali' },
    { id: 'rapor', label: 'Rapor Santri (PDF)', icon: FileSpreadsheet, category: 'Menu Wali' },
    { id: 'grafik-hafalan', label: 'Grafik Hafalan', icon: BarChart3, category: 'Perkembangan Anak' },
    { id: 'tahfidz', label: 'Tahfidz Al-Qur\'an', icon: BookOpen, category: 'Perkembangan Anak' },
    { id: 'tahsin', label: 'Tahsin & Iqra\'', icon: BookOpenCheck, category: 'Perkembangan Anak' },
    { id: 'diniyyah', label: 'Ngaji Diniyyah', icon: BookMarked, category: 'Perkembangan Anak' },
    { id: 'absensi', label: 'Presensi & Kehadiran', icon: ClipboardCheck, category: 'Perkembangan Anak' },
    { id: 'administrasi', label: 'SPP & Administrasi', icon: ReceiptText, category: 'Layanan Santri' },
    { id: 'sangu', label: 'Sangu & Uang Saku', icon: Wallet, category: 'Layanan Santri' },
    { id: 'perizinan', label: 'Perizinan Santri', icon: FileText, category: 'Layanan Santri' },
    { id: 'prestasi', label: 'Prestasi & Kedisiplinan', icon: Trophy, category: 'Layanan Santri' },
    { id: 'jadwal', label: 'Jadwal Kegiatan', icon: CalendarDays, category: 'Informasi' },
    { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, category: 'Informasi' },
    { id: 'foto-kegiatan', label: 'Foto Kegiatan', icon: Images, category: 'Informasi' },
    { id: 'media-rtq', label: 'Media RTQ', icon: Share2, category: 'Informasi' },
  ];

  const menuItems = isWali ? waliMenuItems : adminMenuItems;

  const handleSelectMenu = (id: string) => {
    setActiveMenu(id);
    if (window.innerWidth < 768) {
      setIsOpenMobile(false);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin':
      case 'Super Admin': return 'bg-amber-400 text-emerald-950';
      case 'Pengajar': return 'bg-emerald-300 text-emerald-950';
      case 'Wali Santri': return 'bg-blue-300 text-blue-950';
      default: return 'bg-teal-300 text-teal-950';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-emerald-100 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } border-r border-emerald-900 shadow-2xl md:shadow-none`}
      >
        {/* Brand Header */}
        <div 
          className={`p-4 border-b border-emerald-800/80 bg-emerald-950/90 flex items-center justify-between ${
            isAdmin ? 'cursor-pointer hover:bg-emerald-900/60 transition-colors group' : ''
          }`}
          onClick={isAdmin ? () => setIsEditLogoModalOpen(true) : undefined}
          title={isAdmin ? 'Klik untuk Mengedit Logo Aplikasi (Khusus Admin)' : 'RTQ Cendikia BAZNAS'}
        >
          <Logo size="md" showText lightText />
        </div>

        {/* User Info Badge */}
        {currentUser && (
          <div className="px-4 py-3 bg-emerald-900/40 border-b border-emerald-800/60 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 border-2 border-yellow-400 text-yellow-300 font-bold flex items-center justify-center text-xs shadow-inner flex-shrink-0">
              {(displayNama || 'U').charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p id="sidebar-user-name" className="text-xs font-semibold text-white truncate" title={displayNama}>
                {displayNama}
              </p>
              {isWali && displaySantri && (
                <p id="sidebar-user-santri" className="text-[10px] text-emerald-300 truncate" title={`Ananda: ${displaySantri}`}>
                  Ananda: {displaySantri}
                </p>
              )}
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                {currentUser.isDefaultPassword && (
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-emerald-950">
                    Sandi Awal
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-800">
          {menuItems.map((item, index) => {
            const isFirstOfCategory = index === 0 || menuItems[index - 1].category !== item.category;
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <React.Fragment key={item.id}>
                {isFirstOfCategory && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider">
                    {item.category}
                  </div>
                )}
                <button
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleSelectMenu(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                    isActive
                      ? 'bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-950/50 border-l-4 border-yellow-400 pl-2.5'
                      : 'text-emerald-200/90 hover:bg-emerald-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'text-yellow-300' : 'text-emerald-400 group-hover:scale-110'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}

          {/* Account & Logout Button */}
          <div className="pt-4 mt-3 border-t border-emerald-800/80 space-y-1">
            {!isWali && (
              <button
                onClick={() => setIsGantiPasswordOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-emerald-300 hover:bg-emerald-800/50 hover:text-white transition-colors text-xs"
              >
                <KeyRound className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Ganti Kata Sandi</span>
              </button>
            )}

            <button
              id="btn-logout"
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-xs"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-3 bg-emerald-950 border-t border-emerald-900 text-[10px] text-emerald-400/70 text-center">
          SIT RTQ Cendikia BAZNAS &bull; 2026
        </div>
      </aside>
    </>
  );
};

