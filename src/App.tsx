import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { 
  LayoutDashboard, 
  BookOpen, 
  QrCode, 
  Wallet, 
  Menu,
  GraduationCap,
  ArrowLeft,
  Home
} from 'lucide-react';

// Modals
import { KartuSantriModal } from './components/modals/KartuSantriModal';
import { QRScanModal } from './components/modals/QRScanModal';
import { SertifikatModal } from './components/modals/SertifikatModal';
import { GantiPasswordModal } from './components/GantiPasswordModal';
import { EditLogoModal } from './components/modals/EditLogoModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

// Views
import { DashboardView } from './components/DashboardView';
import { SantriView } from './components/SantriView';
import { DataWaliSantriView } from './components/DataWaliSantriView';
import { PengajarView } from './components/PengajarView';
import { AbsensiView } from './components/AbsensiView';
import { TahsinView } from './components/TahsinView';
import { TahfidzView } from './components/TahfidzView';
import { GrafikHafalanView } from './components/GrafikHafalanView';
import { NgajiDiniyyahView } from './components/NgajiDiniyyahView';
import { AkhlakView } from './components/AkhlakView';
import { IbadahView } from './components/IbadahView';
import { KebersihanView } from './components/KebersihanView';
import { PerizinanView } from './components/PerizinanView';
import { PengumumanView } from './components/PengumumanView';
import { PrestasiView } from './components/PrestasiView';
import { PelanggaranView } from './components/PelanggaranView';
import { RaporView } from './components/RaporView';
import { JadwalView } from './components/JadwalView';
import { AdministrasiView } from './components/AdministrasiView';
import { SanguView } from './components/SanguView';
import { NotifikasiWAView } from './components/NotifikasiWAView';
import { PenggunaView } from './components/PenggunaView';
import { WaliSantriPortalView } from './components/WaliSantriPortalView';
import { ProfilSantriView } from './components/ProfilSantriView';
import { MediaRTQView } from './components/MediaRTQView';
import { FotoKegiatanView } from './components/FotoKegiatanView';
import { PengaturanView } from './components/PengaturanView';

const MainLayout: React.FC = () => {
  const { currentUser, activeMenu, setActiveMenu, setIsQRScannerOpen } = useApp();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Allow ESC key to return to dashboard when on subpages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMenu !== 'dashboard') {
        setActiveMenu('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenu, setActiveMenu]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  // If user is Wali Santri, portal is tailored to child's data
  const isWali = currentUser.role === 'Wali Santri';

  const renderActiveView = () => {
    if (isWali) {
      return <WaliSantriPortalView />;
    }

    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'santri':
        return <SantriView />;
      case 'wali':
        return <DataWaliSantriView />;
      case 'pengajar':
        return <PengajarView />;
      case 'absensi':
        return <AbsensiView />;
      case 'tahsin':
        return <TahsinView />;
      case 'tahfidz':
        return <TahfidzView />;
      case 'grafik-hafalan':
        return <GrafikHafalanView />;
      case 'diniyyah':
        return <NgajiDiniyyahView />;
      case 'akhlak':
        return <AkhlakView />;
      case 'ibadah':
        return <IbadahView />;
      case 'kebersihan':
        return <KebersihanView />;
      case 'perizinan':
        return <PerizinanView />;
      case 'pengumuman':
        return <PengumumanView />;
      case 'prestasi':
        return <PrestasiView />;
      case 'pelanggaran':
        return <PelanggaranView />;
      case 'rapor':
        return <RaporView />;
      case 'jadwal':
        return <JadwalView />;
      case 'administrasi':
        return <AdministrasiView />;
      case 'sangu':
        return <SanguView />;
      case 'foto-kegiatan':
        return <FotoKegiatanView />;
      case 'media-rtq':
        return <MediaRTQView />;
      case 'notifikasi':
        return <NotifikasiWAView />;
      case 'pengguna':
        return <PenggunaView />;
      case 'pengaturan':
        return <PengaturanView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8faf9] text-gray-800 font-sans overflow-hidden antialiased selection:bg-emerald-200">
      {/* Sidebar */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setIsOpenMobile(!isOpenMobile)} />

        {/* Dynamic View Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8faf9] pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Top Breadcrumb & Return to Dashboard Bar for Admin / Asatidz when inside a feature */}
            {!isWali && activeMenu !== 'dashboard' && (
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-gray-200/90 shadow-2xs">
                <button
                  id="btn-main-back-dashboard"
                  onClick={() => setActiveMenu('dashboard')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer group"
                  title="Kembali ke Dashboard Utama"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-1 transition-transform" />
                  <span>Kembali ke Halaman Dashboard</span>
                </button>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 font-medium">
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Beranda</span>
                  </button>
                  <span>/</span>
                  <span className="font-bold text-gray-800 capitalize truncate max-w-[140px] sm:max-w-none">
                    {activeMenu.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
            )}

            {renderActiveView()}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* MODERN MOBILE BOTTOM NAVIGATION BAR                                      */}
        {/* ========================================================================= */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {/* Beranda */}
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer flex-1 ${
              activeMenu === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeMenu === 'dashboard' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Beranda</span>
          </button>

          {/* Tahfidz */}
          <button
            onClick={() => setActiveMenu('tahfidz')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer flex-1 ${
              activeMenu === 'tahfidz' ? 'text-emerald-800 font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeMenu === 'tahfidz' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Tahfidz</span>
          </button>

          {/* Center Scan QR Floating Button */}
          <div className="flex flex-col items-center justify-center px-1 -mt-4">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-emerald-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Scan QR Code"
            >
              <QrCode className="w-6 h-6 text-emerald-950 font-black" />
            </button>
            <span className="text-[9px] font-bold text-amber-800 mt-1">Scan QR</span>
          </div>

          {/* Sangu / Keuangan */}
          <button
            onClick={() => setActiveMenu('sangu')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer flex-1 ${
              activeMenu === 'sangu' ? 'text-emerald-800 font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeMenu === 'sangu' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Sangu</span>
          </button>

          {/* Menu Drawer */}
          <button
            onClick={() => setIsOpenMobile(true)}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl transition text-gray-400 hover:text-gray-600 cursor-pointer flex-1"
          >
            <div className="p-1 rounded-xl">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </nav>
      </div>

      {/* Global Modals & Notifications */}
      <KartuSantriModal />
      <QRScanModal />
      <SertifikatModal />
      <GantiPasswordModal />
      <EditLogoModal />
      <NotificationCenterModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

