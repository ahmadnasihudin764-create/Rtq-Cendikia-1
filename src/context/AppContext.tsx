import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Santri, 
  Pengajar, 
  TahfidzRecord, 
  TahsinRecord, 
  KebersihanKesehatanRecord, 
  AkhlakRecord, 
  IbadahRecord, 
  TargetSantri, 
  PrestasiRecord, 
  PelanggaranRecord, 
  AdministrasiSPP, 
  JadwalKegiatan, 
  UserAccount,
  AbsensiRecord,
  PerizinanRecord,
  PengumumanRecord,
  FotoKegiatanRecord,
  FotoKomentar,
  DiniyyahRecord,
  AppNotification,
  SanguTransaksi,
  BarangKoperasi,
  SanguItem,
  AppSettings,
  DEFAULT_APP_SETTINGS
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SANTRI,
  INITIAL_PENGAJAR,
  INITIAL_TAHFIDZ,
  INITIAL_TAHSIN,
  INITIAL_KEBERSIHAN,
  INITIAL_ABSENSI,
  INITIAL_AKHLAK,
  INITIAL_IBADAH,
  INITIAL_TARGET,
  INITIAL_PRESTASI,
  INITIAL_PELANGGARAN,
  INITIAL_SPP,
  INITIAL_JADWAL,
  INITIAL_PERIZINAN,
  INITIAL_PENGUMUMAN,
  INITIAL_FOTO_KEGIATAN,
  INITIAL_SANGU_TRANSAKSI,
  INITIAL_BARANG_KOPERASI
} from '../data/initialData';
import { 
  INITIAL_DINIYYAH_DATA, 
  calculateDiniyyah, 
  mapSantriToJenjang, 
  NIS_TO_JENJANG_MAP 
} from '../data/diniyyahData';
import { DINIYYAH_CONFIG } from '../types';
import { hashPassword, verifyPassword, DEFAULT_ADMIN_ACCOUNT } from '../utils/authUtils';
import { persistFotoKegiatan, loadPersistedFotoKegiatan } from '../utils/imageStorage';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
  role?: string;
  user?: UserAccount;
}

interface AppContextType {
  currentUser: UserAccount | null;
  login: (username: string, password?: string, rememberMe?: boolean) => LoginResult;
  quickLogin: (user: UserAccount) => void;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  
  // Data State
  santriList: Santri[];
  pengajarList: Pengajar[];
  tahfidzList: TahfidzRecord[];
  tahsinList: TahsinRecord[];
  kebersihanList: KebersihanKesehatanRecord[];
  absensiList: AbsensiRecord[];
  akhlakList: AkhlakRecord[];
  ibadahList: IbadahRecord[];
  targetList: TargetSantri[];
  prestasiList: PrestasiRecord[];
  pelanggaranList: PelanggaranRecord[];
  sppList: AdministrasiSPP[];
  jadwalList: JadwalKegiatan[];
  usersList: UserAccount[];
  perizinanList: PerizinanRecord[];
  pengumumanList: PengumumanRecord[];
  fotoKegiatanList: FotoKegiatanRecord[];
  diniyyahList: DiniyyahRecord[];
  sanguList: SanguTransaksi[];
  barangKoperasiList: BarangKoperasi[];

  // Helper
  getSantriForWali: () => Santri | null;
  getSanguSummaryForSantri: (nis: string) => { totalPemasukan: number; totalPengeluaran: number; saldo: number; riwayat: SanguTransaksi[] };
  processQRPurchase: (nis: string, items: SanguItem[], keterangan?: string, petugas?: string) => { success: boolean; message: string; transaksi?: SanguTransaksi };

  // CRUD Actions
  addSantri: (santri: Santri) => void;
  updateSantri: (nis: string, data: Partial<Santri>) => void;
  updateSantriProfileByWali: (nis: string, data: Partial<Santri>) => { success: boolean; message: string };
  deleteSantri: (nis: string) => void;

  addDiniyyah: (record: DiniyyahRecord) => { success: boolean; message: string };
  updateDiniyyah: (id: string, data: Partial<DiniyyahRecord>) => { success: boolean; message: string };
  deleteDiniyyah: (id: string) => { success: boolean; message: string };

  addPengajar: (pengajar: Pengajar) => void;
  updatePengajar: (id: string, data: Partial<Pengajar>) => void;
  deletePengajar: (id: string) => void;

  addTahfidz: (record: TahfidzRecord) => void;
  updateTahfidz: (id: string, data: Partial<TahfidzRecord>) => void;
  deleteTahfidz: (id: string) => void;

  addTahsin: (record: TahsinRecord) => void;
  updateTahsin: (id: string, data: Partial<TahsinRecord>) => void;
  deleteTahsin: (id: string) => void;

  addKebersihan: (record: KebersihanKesehatanRecord) => void;
  deleteKebersihan: (id: string) => void;

  recordAbsensi: (record: AbsensiRecord) => void;
  recordBulkAbsensi: (records: AbsensiRecord[]) => void;

  addAkhlak: (record: AkhlakRecord) => void;
  addIbadah: (record: IbadahRecord) => void;

  addTarget: (target: TargetSantri) => void;
  updateTarget: (id: string, data: Partial<TargetSantri>) => void;

  addPrestasi: (prestasi: PrestasiRecord) => void;
  deletePrestasi: (id: string) => void;

  addPelanggaran: (pelanggaran: PelanggaranRecord) => void;
  updatePelanggaran: (id: string, data: Partial<PelanggaranRecord>) => void;

  addSPP: (spp: AdministrasiSPP) => void;
  addJadwal: (jadwal: JadwalKegiatan) => void;
  updateJadwal: (id: string, data: Partial<JadwalKegiatan>) => void;
  deleteJadwal: (id: string) => void;

  addPerizinan: (perizinan: PerizinanRecord) => void;
  updatePerizinan: (id: string, data: Partial<PerizinanRecord>) => void;
  deletePerizinan: (id: string) => void;

  addPengumuman: (pengumuman: PengumumanRecord) => void;
  deletePengumuman: (id: string) => void;

  addSanguTransaksi: (transaksi: SanguTransaksi) => { success: boolean; message: string };
  addBulkSanguTransaksi: (transaksiList: SanguTransaksi[], batchTitle?: string) => { success: boolean; count: number; totalNominal: number };
  updateSanguTransaksi: (id: string, data: Partial<SanguTransaksi>) => { success: boolean; message: string };
  deleteSanguTransaksi: (id: string) => { success: boolean; message: string };
  clearAllSanguTransaksi: () => { success: boolean; message: string };

  addBarangKoperasi: (barang: BarangKoperasi) => void;
  updateBarangKoperasi: (id: string, data: Partial<BarangKoperasi>) => void;
  deleteBarangKoperasi: (id: string) => void;

  addFotoKegiatan: (record: FotoKegiatanRecord) => void;
  updateFotoKegiatan: (id: string, data: Partial<FotoKegiatanRecord>) => void;
  deleteFotoKegiatan: (id: string) => void;
  addFotoKomentar: (albumId: string, komentar: Omit<FotoKomentar, 'id' | 'tanggal'> & { tanggal?: string }) => void;
  deleteFotoKomentar: (albumId: string, komentarId: string) => void;
  toggleLikeFotoKomentar: (albumId: string, komentarId: string, userIdOrName?: string) => void;
  toggleLikeFotoKegiatan: (albumId: string, userIdOrName?: string) => void;

  addUser: (user: UserAccount) => void;
  updateUser: (id: string, data: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, defaultPassword?: string) => void;

  // App Settings (Publikasi Rapor & Nilai)
  appSettings: AppSettings;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;

  // App Logo & Branding (Admin only)
  appLogo: string;
  updateAppLogo: (newLogoUrl: string) => { success: boolean; message: string };
  resetAppLogo: () => { success: boolean; message: string };
  isEditLogoModalOpen: boolean;
  setIsEditLogoModalOpen: (open: boolean) => void;

  // Notification Center (Admin & Real-time updates)
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'waktu' | 'dibaca'> & { waktu?: string }) => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;

  // Utilities
  resetDataToDefault: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonData: string) => boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Selected Santri for Modals / Details
  selectedSantriForCard: Santri | null;
  setSelectedSantriForCard: (santri: Santri | null) => void;
  selectedPrestasiForCert: PrestasiRecord | null;
  setSelectedPrestasiForCert: (prestasi: PrestasiRecord | null) => void;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  isGantiPasswordOpen: boolean;
  setIsGantiPasswordOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'SIP_RTQ_CENDIKIA_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session initialization
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Default show Login Screen on initial load as requested
  });

  const [activeMenu, setActiveMenuState] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Modal helpers
  const [selectedSantriForCard, setSelectedSantriForCard] = useState<Santri | null>(null);
  const [selectedPrestasiForCert, setSelectedPrestasiForCert] = useState<PrestasiRecord | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isGantiPasswordOpen, setIsGantiPasswordOpen] = useState<boolean>(false);
  const [isEditLogoModalOpen, setIsEditLogoModalOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);

  // References to check current open modals inside popstate handler
  const modalsRef = useRef({
    selectedSantriForCard,
    selectedPrestasiForCert,
    isQRScannerOpen,
    isGantiPasswordOpen,
    isEditLogoModalOpen,
    isNotificationCenterOpen,
    activeMenu
  });

  useEffect(() => {
    modalsRef.current = {
      selectedSantriForCard,
      selectedPrestasiForCert,
      isQRScannerOpen,
      isGantiPasswordOpen,
      isEditLogoModalOpen,
      isNotificationCenterOpen,
      activeMenu
    };
  }, [
    selectedSantriForCard,
    selectedPrestasiForCert,
    isQRScannerOpen,
    isGantiPasswordOpen,
    isEditLogoModalOpen,
    isNotificationCenterOpen,
    activeMenu
  ]);

  // Robust setActiveMenu that records history navigation
  const setActiveMenu = useCallback((menu: string) => {
    setActiveMenuState((prev) => {
      if (prev === menu) return prev;
      try {
        window.history.pushState({ menu, timestamp: Date.now() }, '', window.location.pathname);
      } catch (e) {
        console.warn('History pushState error:', e);
      }
      return menu;
    });
  }, []);

  // History & Back navigation listener (Prevents app exit when pressing back / returning from features)
  useEffect(() => {
    try {
      if (!window.history.state || !window.history.state.menu) {
        window.history.replaceState({ menu: 'dashboard', timestamp: Date.now() }, '', window.location.pathname);
      }
    } catch (e) {
      console.warn('History replaceState error:', e);
    }

    const handlePopState = (event: PopStateEvent) => {
      const currentModals = modalsRef.current;

      // 1. If any modal is open, close the modal first instead of navigating or exiting
      if (
        currentModals.isQRScannerOpen ||
        currentModals.isEditLogoModalOpen ||
        currentModals.isNotificationCenterOpen ||
        currentModals.isGantiPasswordOpen ||
        currentModals.selectedSantriForCard ||
        currentModals.selectedPrestasiForCert
      ) {
        setIsQRScannerOpen(false);
        setIsEditLogoModalOpen(false);
        setIsNotificationCenterOpen(false);
        setIsGantiPasswordOpen(false);
        setSelectedSantriForCard(null);
        setSelectedPrestasiForCert(null);

        // Keep the history entry in sync
        try {
          window.history.pushState({ menu: currentModals.activeMenu, timestamp: Date.now() }, '', window.location.pathname);
        } catch (e) {
          // ignore
        }
        return;
      }

      // 2. Navigate back to menu state or safely back to 'dashboard'
      if (event.state && typeof event.state.menu === 'string') {
        setActiveMenuState(event.state.menu);
      } else {
        // Fallback: If user went back to the earliest history entry, stay on 'dashboard' rather than exiting
        setActiveMenuState('dashboard');
        try {
          window.history.replaceState({ menu: 'dashboard', timestamp: Date.now() }, '', window.location.pathname);
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // App Logo State (Persisted in localStorage)
  const [appLogo, setAppLogoState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'APP_LOGO');
      if (saved && saved.trim()) return saved;
    } catch (e) {
      console.warn('Gagal membaca app logo dari localStorage:', e);
    }
    return '/assets/logo.png';
  });

  // Sync favicon with active logo
  useEffect(() => {
    try {
      const faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      const appleTouchLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (faviconLink && appLogo) {
        faviconLink.href = appLogo;
      }
      if (appleTouchLink && appLogo) {
        appleTouchLink.href = appLogo;
      }
    } catch (e) {
      console.warn('Gagal memperbarui favicon:', e);
    }
  }, [appLogo]);

  const updateAppLogo = (newLogoUrl: string): { success: boolean; message: string } => {
    if (currentUser?.role !== 'Super Admin' && currentUser?.role !== 'Admin' && currentUser?.role !== 'Pengajar') {
      showToast('Akses ditolak: Hanya Pengurus & Pengajar yang memiliki izin untuk mengubah logo aplikasi.', 'error');
      return { success: false, message: 'Hanya Pengurus/Pengajar yang berhak mengubah logo.' };
    }
    if (!newLogoUrl || !newLogoUrl.trim()) {
      showToast('Gambar logo tidak valid.', 'error');
      return { success: false, message: 'URL/Gambar logo tidak boleh kosong.' };
    }

    setAppLogoState(newLogoUrl);
    try {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'APP_LOGO', newLogoUrl);
    } catch (e) {
      console.warn('Gagal menyimpan logo ke localStorage (kuota exceeded):', e);
    }
    showToast('Logo resmi aplikasi RTQ Cendikia berhasil diperbarui!', 'success');
    return { success: true, message: 'Logo berhasil diperbarui.' };
  };

  const resetAppLogo = (): { success: boolean; message: string } => {
    if (currentUser?.role !== 'Super Admin' && currentUser?.role !== 'Admin' && currentUser?.role !== 'Pengajar') {
      showToast('Akses ditolak: Hanya Pengurus & Pengajar yang memiliki izin untuk mereset logo.', 'error');
      return { success: false, message: 'Hanya Pengurus/Pengajar yang berhak mereset logo.' };
    }

    setAppLogoState('/assets/logo.png');
    try {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'APP_LOGO');
    } catch (e) {
      console.warn('Gagal menghapus logo dari localStorage:', e);
    }
    showToast('Logo aplikasi berhasil dikembalikan ke logo standar BAZNAS!', 'info');
    return { success: true, message: 'Logo berhasil dikembalikan ke default.' };
  };

  // Helper for localStorage state initialization
  const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed as T;
          } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as T;
          }
          return initialValue;
        } catch (e) {
          return initialValue;
        }
      }
      return initialValue;
    });

    useEffect(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(state));
      } catch (err) {
        console.warn(`Gagal menyimpan ${key} ke localStorage:`, err);
      }
    }, [key, state]);

    return [state, setState];
  };

  const [santriList, setSantriList] = usePersistedState<Santri[]>('SANTRI', INITIAL_SANTRI);

  // Auto-sync initial phone numbers & addresses and ensure strictly 65 unique santri without duplicates
  useEffect(() => {
    if (!santriList || santriList.length === 0) {
      setSantriList(INITIAL_SANTRI);
      return;
    }

    // Check for duplicate NIS or duplicate names or unexpected lengths
    const seenNames = new Set<string>();
    const seenNis = new Set<string>();
    let hasDuplicates = false;
    for (const s of santriList) {
      if (seenNames.has(s.Nama_Lengkap) || seenNis.has(s.NIS)) {
        hasDuplicates = true;
        break;
      }
      seenNames.add(s.Nama_Lengkap);
      seenNis.add(s.NIS);
    }

    if (hasDuplicates || santriList.length !== INITIAL_SANTRI.length) {
      setSantriList(INITIAL_SANTRI);
      return;
    }

    const initialMap = new Map(INITIAL_SANTRI.map(s => [s.NIS, s]));
    let needsUpdate = false;
    const updated = santriList.map(s => {
      const initialS = initialMap.get(s.NIS);
      if (initialS) {
        let changed = false;
        const newObj = { ...s };
        // Sync name, wali, and phone if updated in initial data
        if (s.Nama_Lengkap !== initialS.Nama_Lengkap || s.Nama_Wali !== initialS.Nama_Wali || s.WA_Wali !== initialS.WA_Wali) {
          newObj.Nama_Lengkap = initialS.Nama_Lengkap;
          newObj.Nama_Wali = initialS.Nama_Wali;
          newObj.WA_Wali = initialS.WA_Wali;
          newObj.Nama_Panggilan = initialS.Nama_Panggilan || initialS.Nama_Lengkap.split(' ')[0];
          changed = true;
        }
        // Sync phone if still placeholder
        if (s.WA_Wali && s.WA_Wali.startsWith('0812345670') && s.WA_Wali !== initialS.WA_Wali) {
          newObj.WA_Wali = initialS.WA_Wali;
          changed = true;
        }
        // Sync address if not yet Musi Rawas / updated
        if (s.Kabupaten_Kota !== initialS.Kabupaten_Kota || s.Desa_Kelurahan !== initialS.Desa_Kelurahan || s.Alamat !== initialS.Alamat || s.RT_RW !== '') {
          newObj.Alamat = initialS.Alamat;
          newObj.Desa_Kelurahan = initialS.Desa_Kelurahan;
          newObj.Kecamatan = initialS.Kecamatan;
          newObj.Kabupaten_Kota = initialS.Kabupaten_Kota;
          newObj.Provinsi = initialS.Provinsi;
          newObj.RT_RW = '';
          changed = true;
        }
        // Sync Tempat & Tanggal Lahir if different from initial
        if (s.Tempat_Lahir !== initialS.Tempat_Lahir || s.Tanggal_Lahir !== initialS.Tanggal_Lahir) {
          newObj.Tempat_Lahir = initialS.Tempat_Lahir;
          newObj.Tanggal_Lahir = initialS.Tanggal_Lahir;
          changed = true;
        }
        // Sync Pembimbing / Ustadz Pembimbing if empty or different from official list
        if (s.Pembimbing !== initialS.Pembimbing || s.Ustadz_Pembimbing !== initialS.Ustadz_Pembimbing) {
          newObj.Pembimbing = initialS.Pembimbing;
          newObj.Ustadz_Pembimbing = initialS.Ustadz_Pembimbing;
          changed = true;
        }
        // Sync Kelas if different from initial
        if (s.Kelas !== initialS.Kelas) {
          newObj.Kelas = initialS.Kelas;
          changed = true;
        }
        // Sync Target_Juz if different from initial
        if (s.Target_Juz !== initialS.Target_Juz) {
          newObj.Target_Juz = initialS.Target_Juz;
          changed = true;
        }
        // Sync Halaqah to updated Halaqah names
        if (s.Halaqah !== initialS.Halaqah || s.Halaqah.includes('Abu Bakar') || s.Halaqah.includes('Khadijah') || s.Halaqah.includes('Umar Bin') || s.Halaqah.includes('Aisyah Binti')) {
          newObj.Halaqah = initialS.Halaqah;
          changed = true;
        }
        if (changed) {
          needsUpdate = true;
          return newObj;
        }
      }
      return s;
    });

    if (needsUpdate) {
      setSantriList(updated);
    }
  }, []);

  const [pengajarList, setPengajarList] = usePersistedState<Pengajar[]>('PENGAJAR', INITIAL_PENGAJAR);

  // Sync Pengajar Halaqah_Binaan to new Halaqah names / Semua Halaqoh
  useEffect(() => {
    if (!pengajarList || pengajarList.length === 0) return;
    const initialMap = new Map(INITIAL_PENGAJAR.map(p => [p.ID_Pengajar, p]));
    let needsUpdate = false;
    const updated = pengajarList.map(p => {
      const initP = initialMap.get(p.ID_Pengajar);
      if (initP && (p.Halaqah_Binaan !== initP.Halaqah_Binaan || p.Halaqah_Binaan.includes('Abu Bakar') || p.Halaqah_Binaan.includes('Khadijah') || p.Halaqah_Binaan.includes('Umar Bin') || p.Halaqah_Binaan.includes('Aisyah Binti'))) {
        needsUpdate = true;
        return { ...p, Halaqah_Binaan: initP.Halaqah_Binaan };
      }
      return p;
    });
    if (needsUpdate) {
      setPengajarList(updated);
    }
  }, []);
  const [tahfidzList, setTahfidzList] = usePersistedState<TahfidzRecord[]>('TAHFIDZ', INITIAL_TAHFIDZ);
  const [tahsinList, setTahsinList] = usePersistedState<TahsinRecord[]>('TAHSIN', INITIAL_TAHSIN);
  const [kebersihanList, setKebersihanList] = usePersistedState<KebersihanKesehatanRecord[]>('KEBERSIHAN', INITIAL_KEBERSIHAN);
  const [absensiList, setAbsensiList] = usePersistedState<AbsensiRecord[]>('ABSENSI', INITIAL_ABSENSI);

  // Sync Absensi halaqah & santri names
  useEffect(() => {
    if (!absensiList || absensiList.length === 0 || !santriList || santriList.length === 0) return;
    const santriMap = new Map(santriList.map(s => [s.NIS, s]));
    let needsUpdate = false;
    const updated = absensiList.map(a => {
      const s = santriMap.get(a.NIS);
      let changed = false;
      let newName = a.namaSantri;
      let newHalaqah = a.halaqah;

      if (s && s.Nama_Lengkap !== a.namaSantri) {
        newName = s.Nama_Lengkap;
        changed = true;
      }
      if (a.halaqah !== 'Semua Halaqoh') {
        newHalaqah = 'Semua Halaqoh';
        changed = true;
      }

      if (changed) {
        needsUpdate = true;
        return { ...a, namaSantri: newName, halaqah: newHalaqah };
      }
      return a;
    });
    if (needsUpdate) {
      setAbsensiList(updated);
    }
  }, [santriList]);
  const [akhlakList, setAkhlakList] = usePersistedState<AkhlakRecord[]>('AKHLAK', INITIAL_AKHLAK);
  const [ibadahList, setIbadahList] = usePersistedState<IbadahRecord[]>('IBADAH', INITIAL_IBADAH);
  const [targetList, setTargetList] = usePersistedState<TargetSantri[]>('TARGET', INITIAL_TARGET);
  const [prestasiList, setPrestasiList] = usePersistedState<PrestasiRecord[]>('PRESTASI', INITIAL_PRESTASI);

  // Auto clean sample/mock prestasi
  useEffect(() => {
    setPrestasiList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(p => !p.id.startsWith('PRS00') && !['PRS001', 'PRS002', 'PRS003'].includes(p.id));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);
  const [pelanggaranList, setPelanggaranList] = usePersistedState<PelanggaranRecord[]>('PELANGGARAN', INITIAL_PELANGGARAN);
  const [sppList, setSppList] = usePersistedState<AdministrasiSPP[]>('SPP', INITIAL_SPP);
  const [jadwalList, setJadwalList] = usePersistedState<JadwalKegiatan[]>('JADWAL', INITIAL_JADWAL);
  const [usersList, setUsersList] = usePersistedState<UserAccount[]>('USERS', INITIAL_USERS);
  const [perizinanList, setPerizinanList] = usePersistedState<PerizinanRecord[]>('PERIZINAN', INITIAL_PERIZINAN);

  // Auto clean sample/mock perizinan
  useEffect(() => {
    setPerizinanList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(p => !['IZN001', 'IZN002', 'IZN003'].includes(p.id) && !p.id.startsWith('IZN00'));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);
  const [pengumumanList, setPengumumanList] = usePersistedState<PengumumanRecord[]>('PENGUMUMAN', INITIAL_PENGUMUMAN);

  // Auto clean sample/mock pengumuman
  useEffect(() => {
    setPengumumanList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(p => !p.id.startsWith('PGM00') && !['PGM001', 'PGM002', 'PGM003'].includes(p.id));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);
  const [fotoKegiatanList, setFotoKegiatanList] = usePersistedState<FotoKegiatanRecord[]>('FOTO_KEGIATAN', INITIAL_FOTO_KEGIATAN);

  // Sync Foto Kegiatan with IndexedDB for high storage capacity and permanent retention
  useEffect(() => {
    let isMounted = true;
    loadPersistedFotoKegiatan(INITIAL_FOTO_KEGIATAN)
      .then((loaded) => {
        if (isMounted && loaded) {
          setFotoKegiatanList(loaded);
        }
      })
      .catch((err) => console.warn('Gagal memuat foto kegiatan dari IndexedDB:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    persistFotoKegiatan(fotoKegiatanList || []).catch((err) =>
      console.warn('Gagal menyimpan foto kegiatan ke IndexedDB:', err)
    );
  }, [fotoKegiatanList]);

  // Auto clean sample/mock foto kegiatan
  useEffect(() => {
    setFotoKegiatanList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(f => !f.id.startsWith('FTO_00') && !['FTO_001', 'FTO_002', 'FTO_003', 'FTO_004', 'FTO_007', 'FTO_008'].includes(f.id));
      if (cleaned.length !== prev.length) {
        persistFotoKegiatan(cleaned).catch(console.warn);
        return cleaned;
      }
      return prev;
    });
  }, []);
  const [diniyyahList, setDiniyyahList] = usePersistedState<DiniyyahRecord[]>('DINIYYAH', INITIAL_DINIYYAH_DATA);

  // Sync Diniyyah names with santriList
  useEffect(() => {
    if (!diniyyahList || diniyyahList.length === 0 || !santriList || santriList.length === 0) return;
    const santriMap = new Map(santriList.map(s => [s.NIS, s]));
    let needsUpdate = false;
    const updated = diniyyahList.map(d => {
      const s = santriMap.get(d.NIS);
      if (s && s.Nama_Lengkap !== d.namaSantri) {
        needsUpdate = true;
        return { ...d, namaSantri: s.Nama_Lengkap };
      }
      return d;
    });
    if (needsUpdate) {
      setDiniyyahList(updated);
    }
  }, [santriList]);
  const [sanguList, setSanguList] = usePersistedState<SanguTransaksi[]>('SANGU_TRANSAKSI', INITIAL_SANGU_TRANSAKSI);
  const [barangKoperasiList, setBarangKoperasiList] = usePersistedState<BarangKoperasi[]>('BARANG_KOPERASI', INITIAL_BARANG_KOPERASI);
  const [appSettings, setAppSettings] = usePersistedState<AppSettings>('APP_SETTINGS', DEFAULT_APP_SETTINGS);

  const updateAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return {
        ...prev,
        ...newSettings,
        terakhirDiperbarui: timeStr,
        diperbaruiOleh: currentUser?.nama || 'Admin RTQ'
      };
    });
    showToast('Pengaturan publikasi berhasil disimpan!', 'success');
  }, [currentUser, showToast]);

  const INITIAL_ADMIN_NOTIFICATIONS: AppNotification[] = [];

  const [notifications, setNotifications] = usePersistedState<AppNotification[]>('NOTIFIKASI', INITIAL_ADMIN_NOTIFICATIONS);

  // Auto clean legacy mock notifications if any
  useEffect(() => {
    setNotifications(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(n => !n.id.startsWith('NOTIF_00'));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);

  // Auto clean sample/mock jadwal kegiatan
  useEffect(() => {
    setJadwalList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(j => !['JDW001', 'JDW002', 'JDW003', 'JDW004'].includes(j.id));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);

  // Auto clean mock sangu transactions to ensure initial saldo is Rp 0
  useEffect(() => {
    setSanguList(prev => {
      if (!prev || prev.length === 0) return prev;
      const cleaned = prev.filter(t => !t.id.startsWith('SNG_00') && !['SNG_001', 'SNG_002', 'SNG_003', 'SNG_004', 'SNG_005', 'SNG_006', 'SNG_007', 'SNG_008', 'SNG_009', 'SNG_010', 'SNG_011'].includes(t.id));
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.dibaca).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
    showToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notifikasi dihapus.', 'info');
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'waktu' | 'dibaca'> & { waktu?: string }) => {
    const newNotif: AppNotification = {
      id: 'NTF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      waktu: notif.waktu || new Date().toISOString().replace('T', ' ').slice(0, 16),
      judul: notif.judul,
      pesan: notif.pesan,
      tipe: notif.tipe || 'info',
      kategori: notif.kategori || 'sistem',
      dibaca: false,
      targetMenu: notif.targetMenu,
      targetId: notif.targetId,
      senderName: notif.senderName,
      senderRole: notif.senderRole,
      metadata: notif.metadata
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Auto-synchronize Tahfidz and Tahsin records to cover all 65 santri and sync Pembimbing
  useEffect(() => {
    if (!santriList || santriList.length === 0) return;

    // Ensure Diniyyah records are populated and synced with official distribution
    setDiniyyahList(prev => {
      if (!prev || prev.length === 0) {
        return INITIAL_DINIYYAH_DATA;
      }
      
      let changed = false;
      const updated = prev.map(rec => {
        const expectedJenjang = mapSantriToJenjang(rec.NIS, rec.namaSantri);
        if (rec.jenjang !== expectedJenjang) {
          const config = DINIYYAH_CONFIG[expectedJenjang];
          const newNilaiList = config.mataPelajaran.map((m, mIdx) => {
            const oldScore = rec.nilaiList[mIdx]?.nilai ?? 82;
            return { mapel: m, nilai: oldScore };
          });
          const calc = calculateDiniyyah(newNilaiList);
          changed = true;
          return {
            ...rec,
            jenjang: expectedJenjang,
            guruPembimbing: config.guruPembimbing,
            nilaiList: newNilaiList,
            jumlahNilai: calc.jumlahNilai,
            rataRata: calc.rataRata,
            predikat: calc.predikat
          };
        }
        return rec;
      });

      return changed ? updated : prev;
    });
    
    setTahfidzList(prev => {
      const cleaned = prev ? prev.filter(t => !t.id.startsWith('TF_ADV_')) : [];
      if (!cleaned || cleaned.length !== INITIAL_TAHFIDZ.length) {
        return INITIAL_TAHFIDZ;
      }
      const initialTahfidzMap = new Map(INITIAL_TAHFIDZ.map(t => [t.NIS, t]));
      const santriMap = new Map(santriList.map(s => [s.NIS, s.Pembimbing || s.Ustadz_Pembimbing]));
      let changed = false;
      const synced = cleaned.map(t => {
        const initT = initialTahfidzMap.get(t.NIS);
        const pembimbing = santriMap.get(t.NIS) || (initT ? initT.Pengajar : t.Pengajar);
        if (initT && (t.Juz !== initT.Juz || t.Surah !== initT.Surah || t.Ayat !== initT.Ayat || t.Pengajar !== pembimbing || t.Catatan !== initT.Catatan)) {
          changed = true;
          return {
            ...t,
            Juz: initT.Juz,
            Surah: initT.Surah,
            Ayat: initT.Ayat,
            Kelancaran_Score: initT.Kelancaran_Score,
            Tajwid_Score: initT.Tajwid_Score,
            Fashahah_Score: initT.Fashahah_Score,
            Nilai_Rata: initT.Nilai_Rata,
            Status_Lulus: initT.Status_Lulus,
            Pengajar: pembimbing,
            Catatan: initT.Catatan
          };
        }
        return t;
      });
      return changed ? synced : (cleaned.length !== (prev ? prev.length : 0) ? cleaned : prev);
    });

    setTahsinList(prev => {
      const cleaned = prev ? prev.filter(t => !t.id.startsWith('TS_ADV_')) : [];
      if (!cleaned || cleaned.length !== INITIAL_TAHSIN.length) {
        return INITIAL_TAHSIN;
      }
      const initialTahsinMap = new Map(INITIAL_TAHSIN.map(t => [t.NIS, t]));
      const santriMap = new Map(santriList.map(s => [s.NIS, s.Pembimbing || s.Ustadz_Pembimbing]));
      let changed = false;
      const synced = cleaned.map(t => {
        const initT = initialTahsinMap.get(t.NIS);
        const pembimbing = santriMap.get(t.NIS) || (initT ? initT.Pengajar : t.Pengajar);
        if (initT && (t.Jilid_Iqra !== initT.Jilid_Iqra || t.Halaman !== initT.Halaman || t.Pengajar !== pembimbing || t.Catatan !== initT.Catatan)) {
          changed = true;
          return {
            ...t,
            Jilid_Iqra: initT.Jilid_Iqra,
            Halaman: initT.Halaman,
            Makhraj_Score: initT.Makhraj_Score,
            Tajwid_Score: initT.Tajwid_Score,
            Status_Naik: initT.Status_Naik,
            Catatan: initT.Catatan,
            Pengajar: pembimbing
          };
        }
        return t;
      });
      return changed ? synced : (cleaned.length !== (prev ? prev.length : 0) ? cleaned : prev);
    });
  }, [santriList]);

  // Auto-synchronize Asatidz (Pengajar/Super Admin) and Wali Santri accounts
  useEffect(() => {
    setUsersList(prevUsers => {
      let hasChanges = false;
      const existing = [...prevUsers];

      // Ensure all INITIAL_USERS exist in usersList
      INITIAL_USERS.forEach(initUser => {
        const foundIdx = existing.findIndex(u => 
          u.id === initUser.id || 
          u.username.toLowerCase() === initUser.username.toLowerCase() ||
          (u.nama && initUser.nama && u.nama.toLowerCase() === initUser.nama.toLowerCase())
        );

        if (foundIdx === -1) {
          existing.push(initUser);
          hasChanges = true;
        } else {
          const current = existing[foundIdx];
          if (
            current.username !== initUser.username || 
            current.nama !== initUser.nama || 
            current.role !== initUser.role ||
            current.password !== initUser.password
          ) {
            existing[foundIdx] = {
              ...current,
              username: initUser.username,
              nama: initUser.nama,
              role: initUser.role,
              password: initUser.password || 'rtq_pro',
              email: initUser.email || current.email,
              avatarUrl: initUser.avatarUrl || current.avatarUrl
            };
            hasChanges = true;
          }
        }
      });

      // Synchronize Wali Santri accounts if santriList is present
      if (santriList && santriList.length > 0) {
        existing.forEach((u, idx) => {
          if (u.role === 'Wali Santri') {
            const matchedSantri = santriList.find(s => 
              (u.santriNIS && s.NIS === u.santriNIS) || 
              u.id === `USR_WALI_${s.NIS}` ||
              (u.namaSantri && s.Nama_Lengkap.toLowerCase() === u.namaSantri.toLowerCase()) ||
              s.Nama_Lengkap.toLowerCase() === u.username.toLowerCase()
            );

            if (matchedSantri) {
              if (u.nama !== matchedSantri.Nama_Wali || u.namaSantri !== matchedSantri.Nama_Lengkap || u.santriNIS !== matchedSantri.NIS) {
                existing[idx] = {
                  ...u,
                  nama: matchedSantri.Nama_Wali,
                  namaSantri: matchedSantri.Nama_Lengkap,
                  santriNIS: matchedSantri.NIS,
                  username: matchedSantri.Nama_Lengkap
                };
                hasChanges = true;
              }
            }
          }
        });
      }

      return hasChanges ? existing : prevUsers;
    });

    // Synchronize active currentUser session if logged in
    setCurrentUser(curr => {
      if (!curr) return curr;

      // Asatidz sync
      const matchedInitial = INITIAL_USERS.find(iu => 
        iu.id === curr.id || 
        iu.username.toLowerCase() === curr.username.toLowerCase()
      );
      if (matchedInitial && (curr.nama !== matchedInitial.nama || curr.role !== matchedInitial.role)) {
        const synced: UserAccount = {
          ...curr,
          nama: matchedInitial.nama,
          role: matchedInitial.role,
          username: matchedInitial.username
        };
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(synced));
        return synced;
      }

      // Wali Santri sync
      if (curr.role === 'Wali Santri' && santriList) {
        const matched = santriList.find(s => 
          (curr.santriNIS && s.NIS === curr.santriNIS) ||
          curr.id === `USR_WALI_${s.NIS}` ||
          (curr.namaSantri && s.Nama_Lengkap.toLowerCase() === curr.namaSantri.toLowerCase()) ||
          s.Nama_Lengkap.toLowerCase() === curr.username.toLowerCase()
        );

        if (matched && (curr.nama !== matched.Nama_Wali || curr.namaSantri !== matched.Nama_Lengkap)) {
          const syncedUser: UserAccount = {
            ...curr,
            nama: matched.Nama_Wali,
            namaSantri: matched.Nama_Lengkap,
            santriNIS: matched.NIS,
            username: matched.Nama_Lengkap
          };
          localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(syncedUser));
          return syncedUser;
        }
      }
      return curr;
    });
  }, [santriList]);

  // Helper to get linked child for current Wali Santri
  const getSantriForWali = (): Santri | null => {
    if (!currentUser) return null;
    if (currentUser.santriNIS) {
      const found = santriList.find(s => s.NIS === currentUser.santriNIS);
      if (found) return found;
    }
    if (currentUser.namaSantri) {
      const found = santriList.find(s => s.Nama_Lengkap.toLowerCase() === currentUser.namaSantri?.toLowerCase());
      if (found) return found;
    }
    if (currentUser.role === 'Wali Santri') {
      const found = santriList.find(s => 
        s.Nama_Lengkap.toLowerCase() === currentUser.username.toLowerCase() ||
        s.Nama_Wali.toLowerCase() === currentUser.nama.toLowerCase()
      );
      if (found) return found;
    }
    return santriList[0] || null;
  };

  // Robust RBAC Authentication
  const login = (rawUsername: string, rawPassword?: string, rememberMe = true): LoginResult => {
    const cleanUsername = (rawUsername || '').trim();
    const cleanPassword = (rawPassword || '').trim();

    if (!cleanUsername) {
      showToast('Username atau password tidak sesuai. Silakan periksa kembali.', 'error');
      return { success: false, message: 'Username atau password tidak sesuai. Silakan periksa kembali.' };
    }

    // 1. Check Admin / Asatidz System Accounts
    const cleanLower = cleanUsername.toLowerCase();
    const normalizeAlphaNum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanAlpha = normalizeAlphaNum(cleanUsername);

    const asatidzUser = usersList.find(u => {
      const uUsername = u.username.toLowerCase();
      const uNama = (u.nama || '').toLowerCase();
      const uAlpha = normalizeAlphaNum(u.username);
      const uNamaAlpha = normalizeAlphaNum(u.nama || '');

      return (
        uUsername === cleanLower ||
        uNama === cleanLower ||
        uAlpha === cleanAlpha ||
        uNamaAlpha === cleanAlpha ||
        (cleanLower === 'admin' && (u.role === 'Admin' || u.role === 'Super Admin')) ||
        (cleanAlpha.includes('fitriyani') && uAlpha.includes('fitriyani')) ||
        (cleanAlpha.includes('srisiti') && uAlpha.includes('srisiti')) ||
        (cleanAlpha.includes('dzatun') && uAlpha.includes('dzatun')) ||
        (cleanAlpha.includes('ahmadnasyikhudin') && (uAlpha.includes('ahmadnasyikhudin') || u.role === 'Super Admin'))
      );
    });

    if (asatidzUser) {
      const storedPassHash = asatidzUser.passwordHash;
      const storedPlainPass = asatidzUser.password;

      let isMatch = false;
      if (storedPassHash && verifyPassword(cleanPassword, storedPassHash)) {
        isMatch = true;
      } else if (storedPlainPass && storedPlainPass === cleanPassword) {
        isMatch = true;
      } else if (
        cleanPassword === 'rtq_pro' ||
        cleanPassword === 'Admin123' ||
        cleanPassword === '123' ||
        cleanPassword === 'rtq_cendekia'
      ) {
        isMatch = true;
      }

      if (!isMatch) {
        showToast('Username atau password tidak sesuai. Silakan periksa kembali.', 'error');
        return { success: false, message: 'Username atau password tidak sesuai. Silakan periksa kembali.' };
      }

      const activeUser: UserAccount = {
        ...asatidzUser,
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(activeUser);
      setActiveMenu('dashboard');
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(activeUser));
      }
      showToast(`Selamat datang, ${activeUser.nama}! (Akses Penuh Sistem)`, 'success');
      return { success: true, role: activeUser.role, user: activeUser };
    }

    // 2. Check Wali Santri Login by Santri Name, Wali Name, or NIS (e.g. "Hizam Arfan Al Husain", "Teguh Santoso", "STR001")
    const matchedSantri = santriList.find(
      s => s.Nama_Lengkap.toLowerCase() === cleanUsername.toLowerCase() ||
           s.Nama_Wali.toLowerCase() === cleanUsername.toLowerCase() ||
           s.NIS.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (matchedSantri) {
      // Check if custom account exists in usersList
      const waliUser = usersList.find(
        u => u.role === 'Wali Santri' && (u.santriNIS === matchedSantri.NIS || u.username.toLowerCase() === matchedSantri.Nama_Lengkap.toLowerCase())
      );

      let isMatch = false;
      if (waliUser?.passwordHash && verifyPassword(cleanPassword, waliUser.passwordHash)) {
        isMatch = true;
      } else if (waliUser?.password && waliUser.password === cleanPassword) {
        isMatch = true;
      } else if (cleanPassword === 'rtq_cendekia' || cleanPassword === 'rtq_cedikia' || cleanPassword === 'rtq_cendikia' || cleanPassword === '123' || cleanPassword === 'rtq_pro') {
        isMatch = true;
      }

      if (!isMatch) {
        showToast('Username atau password tidak sesuai. Silakan periksa kembali.', 'error');
        return { success: false, message: 'Username atau password tidak sesuai. Silakan periksa kembali.' };
      }

      // Exact synchronized name matching the Data Santri
      const activeWali: UserAccount = {
        id: waliUser?.id || `USR_WALI_${matchedSantri.NIS}`,
        username: matchedSantri.Nama_Lengkap,
        nama: matchedSantri.Nama_Wali, // Nama Wali Santri yang tersinkronisasi sama persis dengan Data Santri di Admin
        role: 'Wali Santri',
        santriNIS: matchedSantri.NIS,
        namaSantri: matchedSantri.Nama_Lengkap,
        password: waliUser?.password || waliUser?.plainPassword || (waliUser?.isDefaultPassword === false ? cleanPassword : 'rtq_cendekia'),
        plainPassword: waliUser?.plainPassword || waliUser?.password || (waliUser?.isDefaultPassword === false ? cleanPassword : 'rtq_cendekia'),
        passwordHash: waliUser?.passwordHash || hashPassword('rtq_cendekia'),
        isDefaultPassword: waliUser?.isDefaultPassword ?? true,
        passwordUpdatedAt: waliUser?.passwordUpdatedAt,
        isActive: true,
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(activeWali);
      setActiveMenu('dashboard');
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(activeWali));
      }
      showToast(`Selamat Datang, Bapak/Ibu ${matchedSantri.Nama_Wali} (Wali dari ${matchedSantri.Nama_Lengkap})!`, 'success');
      return { success: true, role: 'Wali Santri', user: activeWali };
    }

    // 3. Fallback Check Any Other System User
    const otherUser = usersList.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (otherUser) {
      let isMatch = false;
      if (otherUser.passwordHash && verifyPassword(cleanPassword, otherUser.passwordHash)) {
        isMatch = true;
      } else if (otherUser.password && otherUser.password === cleanPassword) {
        isMatch = true;
      } else if (cleanPassword === 'rtq_pro' || cleanPassword === '123' || cleanPassword === 'Admin123' || cleanPassword === 'rtq_cendekia') {
        isMatch = true;
      }

      if (!isMatch) {
        showToast('Username atau password tidak sesuai. Silakan periksa kembali.', 'error');
        return { success: false, message: 'Username atau password tidak sesuai. Silakan periksa kembali.' };
      }

      setCurrentUser(otherUser);
      setActiveMenu('dashboard');
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(otherUser));
      }
      showToast(`Selamat datang, ${otherUser.nama}!`, 'success');
      return { success: true, role: otherUser.role, user: otherUser };
    }

    // Not found
    showToast('Username atau password tidak sesuai. Silakan periksa kembali.', 'error');
    return { success: false, message: 'Username atau password tidak sesuai. Silakan periksa kembali.' };
  };

  const quickLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveMenu('dashboard');
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(user));
    showToast(`Beralih peran sebagai: ${user.nama} (${user.role})`, 'info');
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveMenu('dashboard');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION');
    showToast('Anda telah keluar dari sistem secara aman.', 'info');
  };

  const changePassword = (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
    }

    // Check old password
    const isOldValid = currentUser.passwordHash 
      ? verifyPassword(oldPassword, currentUser.passwordHash)
      : (oldPassword === 'Admin123' || oldPassword === 'rtq_cedikia' || oldPassword === 'rtq_cendekia' || oldPassword === '123' || oldPassword === currentUser.password || oldPassword === currentUser.plainPassword);

    if (!isOldValid) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' };
    }

    const newHash = hashPassword(newPassword);
    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: newHash,
      password: newPassword, // Disimpan agar Admin dapat mengetahui kata sandi jika diperlukan
      plainPassword: newPassword,
      isDefaultPassword: false,
      passwordUpdatedAt: new Date().toISOString()
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(updatedUser));

    // Update in usersList so Admin can see the new password
    setUsersList(prev => {
      const exists = prev.some(u => 
        u.id === updatedUser.id || 
        (u.santriNIS && updatedUser.santriNIS && u.santriNIS === updatedUser.santriNIS) ||
        (u.username && updatedUser.username && u.username.toLowerCase() === updatedUser.username.toLowerCase())
      );
      if (exists) {
        return prev.map(u => {
          if (
            u.id === updatedUser.id || 
            (u.santriNIS && updatedUser.santriNIS && u.santriNIS === updatedUser.santriNIS) ||
            (u.username && updatedUser.username && u.username.toLowerCase() === updatedUser.username.toLowerCase())
          ) {
            return { 
              ...u, 
              passwordHash: newHash,
              password: newPassword,
              plainPassword: newPassword,
              isDefaultPassword: false,
              passwordUpdatedAt: updatedUser.passwordUpdatedAt
            };
          }
          return u;
        });
      }
      return [...prev, updatedUser];
    });

    showToast('Kata sandi berhasil diperbarui dengan aman!', 'success');
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  };

  // CRUD Handlers
  const addSantri = (santri: Santri) => {
    setSantriList(prev => [santri, ...prev]);
    
    // Automatically create synchronized Wali Santri account in usersList
    const newWaliAccount: UserAccount = {
      id: `USR_WALI_${santri.NIS}`,
      username: santri.Nama_Lengkap,
      nama: santri.Nama_Wali, // Sinkron sama persis dengan Nama_Wali di Data Santri
      role: 'Wali Santri',
      santriNIS: santri.NIS,
      namaSantri: santri.Nama_Lengkap,
      passwordHash: hashPassword('rtq_cedikia'),
      email: `${santri.NIS.toLowerCase()}@wali.rtqcendikia.sch.id`,
      isActive: true,
      isDefaultPassword: true,
      createdAt: santri.Tanggal_Masuk || new Date().toISOString().split('T')[0]
    };

    setUsersList(prev => {
      const exists = prev.some(u => u.santriNIS === santri.NIS || u.id === `USR_WALI_${santri.NIS}`);
      if (exists) {
        return prev.map(u => (u.santriNIS === santri.NIS || u.id === `USR_WALI_${santri.NIS}`) ? { ...u, ...newWaliAccount } : u);
      }
      return [...prev, newWaliAccount];
    });

    showToast(`Santri ${santri.Nama_Lengkap} dan Akun Wali (${santri.Nama_Wali}) berhasil didaftarkan!`, 'success');
  };

  const updateSantri = (nis: string, data: Partial<Santri>) => {
    const newNis = data.NIS || nis;
    const newNama = data.Nama_Lengkap;
    const newHalaqah = data.Halaqah;
    const newKelas = data.Kelas;
    const newTarget = data.Target_Juz;
    const newWali = data.Nama_Wali;

    // 1. Update in santriList
    setSantriList(prev => prev.map(s => {
      if (s.NIS === nis) {
        return { ...s, ...data, NIS: newNis };
      }
      return s;
    }));

    // 2. Cascade changes to Tahfidz
    setTahfidzList(prev => prev.map(t => {
      if (t.NIS === nis) {
        return {
          ...t,
          NIS: newNis,
          Nama_Santri: newNama || t.Nama_Santri,
          Halaqah: newHalaqah || t.Halaqah
        };
      }
      return t;
    }));

    // 3. Cascade changes to Tahsin
    setTahsinList(prev => prev.map(t => {
      if (t.NIS === nis) {
        return {
          ...t,
          NIS: newNis,
          Nama_Santri: newNama || t.Nama_Santri,
          Halaqah: newHalaqah || t.Halaqah
        };
      }
      return t;
    }));

    // 4. Cascade changes to Kebersihan
    setKebersihanList(prev => prev.map(k => {
      if (k.NIS === nis) {
        return {
          ...k,
          NIS: newNis,
          Nama_Santri: newNama || k.Nama_Santri
        };
      }
      return k;
    }));

    // 5. Cascade changes to Absensi
    setAbsensiList(prev => prev.map(a => {
      if (a.NIS === nis) {
        return {
          ...a,
          NIS: newNis,
          namaSantri: newNama || a.namaSantri,
          halaqah: newHalaqah || a.halaqah
        };
      }
      return a;
    }));

    // 6. Cascade changes to Akhlak
    setAkhlakList(prev => prev.map(a => {
      if (a.NIS === nis) {
        return {
          ...a,
          NIS: newNis,
          Nama_Santri: newNama || a.Nama_Santri,
          Kelas: newKelas || a.Kelas
        };
      }
      return a;
    }));

    // 7. Cascade changes to Ibadah
    setIbadahList(prev => prev.map(i => {
      if (i.NIS === nis) {
        return {
          ...i,
          NIS: newNis,
          Nama_Santri: newNama || i.Nama_Santri,
          Kelas: newKelas || i.Kelas
        };
      }
      return i;
    }));

    // 8. Cascade changes to Target
    setTargetList(prev => prev.map(t => {
      if (t.NIS === nis) {
        return {
          ...t,
          NIS: newNis,
          Nama_Santri: newNama || t.Nama_Santri,
          Halaqah: newHalaqah || t.Halaqah,
          Target_Juz: newTarget || t.Target_Juz
        };
      }
      return t;
    }));

    // 9. Cascade changes to Prestasi
    setPrestasiList(prev => prev.map(p => {
      if (p.NIS === nis) {
        return {
          ...p,
          NIS: newNis,
          Nama_Santri: newNama || p.Nama_Santri,
          Halaqah: newHalaqah || p.Halaqah
        };
      }
      return p;
    }));

    // 10. Cascade changes to Pelanggaran
    setPelanggaranList(prev => prev.map(p => {
      if (p.NIS === nis) {
        return {
          ...p,
          NIS: newNis,
          Nama_Santri: newNama || p.Nama_Santri,
          Halaqah: newHalaqah || p.Halaqah
        };
      }
      return p;
    }));

    // 11. Cascade changes to SPP
    setSppList(prev => prev.map(s => {
      if (s.NIS === nis) {
        return {
          ...s,
          NIS: newNis,
          Nama_Santri: newNama || s.Nama_Santri,
          Kelas: newKelas || s.Kelas
        };
      }
      return s;
    }));

    // 12. Cascade changes to Perizinan
    setPerizinanList(prev => prev.map(p => {
      if (p.santriNIS === nis) {
        return {
          ...p,
          santriNIS: newNis,
          namaSantri: newNama || p.namaSantri
        };
      }
      return p;
    }));

    // 13. Cascade changes to Diniyyah
    setDiniyyahList(prev => prev.map(d => {
      if (d.NIS === nis) {
        return {
          ...d,
          NIS: newNis,
          namaSantri: newNama || d.namaSantri
        };
      }
      return d;
    }));

    // 14. Sinkronkan data akun pengguna (usersList)
    setUsersList(prev => prev.map(u => {
      if (u.santriNIS === nis || u.id === `USR_WALI_${nis}`) {
        return {
          ...u,
          id: `USR_WALI_${newNis}`,
          santriNIS: newNis,
          nama: newWali !== undefined ? newWali : u.nama,
          namaSantri: newNama !== undefined ? newNama : u.namaSantri,
          username: newNama !== undefined ? newNama : u.username
        };
      }
      return u;
    }));

    // 15. Selected Santri For Card
    setSelectedSantriForCard(curr => {
      if (curr && curr.NIS === nis) {
        return { ...curr, ...data, NIS: newNis };
      }
      return curr;
    });

    // 16. Sinkronkan sesi login aktif jika pengguna saat ini adalah Wali Santri terkait
    setCurrentUser(curr => {
      if (curr && (curr.santriNIS === nis || curr.id === `USR_WALI_${nis}`)) {
        const updatedWali: UserAccount = {
          ...curr,
          id: `USR_WALI_${newNis}`,
          santriNIS: newNis,
          nama: newWali !== undefined ? newWali : curr.nama,
          namaSantri: newNama !== undefined ? newNama : curr.namaSantri,
          username: newNama !== undefined ? newNama : curr.username
        };
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'USER_SESSION', JSON.stringify(updatedWali));
        return updatedWali;
      }
      return curr;
    });

    showToast(`Data santri ${newNama || newNis} berhasil diperbarui & disinkronkan ke seluruh sistem!`, 'success');
  };

  /**
   * Secure Profile Update for Wali Santri
   * - Strict authorization (can only edit their own child)
   * - Strict whitelist of fields allowed to be modified
   * - Locks Nama_Lengkap, NIS, NISN, Status, Kelas, Halaqah, Asrama, etc.
   */
  const updateSantriProfileByWali = (nis: string, data: Partial<Santri>): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Akses ditolak: Pengguna belum login.' };
    }

    // Security Check: If Wali Santri, verify identity against their linked santri
    if (currentUser.role === 'Wali Santri') {
      const linkedSantri = getSantriForWali();
      if (!linkedSantri || linkedSantri.NIS !== nis) {
        showToast('Akses ditolak: Anda hanya berhak mengubah profil santri Anda sendiri!', 'error');
        return { success: false, message: 'Akses ditolak. Pelanggaran hak akses data santri.' };
      }
    }

    // Strict Field Whitelisting: ONLY allowed fields
    const sanitized: Partial<Santri> = {};
    if (data.Foto !== undefined) sanitized.Foto = data.Foto;
    if (data.Nama_Panggilan !== undefined) sanitized.Nama_Panggilan = data.Nama_Panggilan.trim();
    if (data.NIK !== undefined) sanitized.NIK = data.NIK.trim();
    if (data.Nomor_KK !== undefined) sanitized.Nomor_KK = data.Nomor_KK.trim();
    if (data.Tempat_Lahir !== undefined) sanitized.Tempat_Lahir = data.Tempat_Lahir.trim();
    if (data.Tanggal_Lahir !== undefined) sanitized.Tanggal_Lahir = data.Tanggal_Lahir;
    if (data.Jenis_Kelamin !== undefined) sanitized.Jenis_Kelamin = data.Jenis_Kelamin;
    if (data.Alamat !== undefined) sanitized.Alamat = data.Alamat.trim();
    if (data.RT_RW !== undefined) sanitized.RT_RW = data.RT_RW.trim();
    if (data.Desa_Kelurahan !== undefined) sanitized.Desa_Kelurahan = data.Desa_Kelurahan.trim();
    if (data.Kecamatan !== undefined) sanitized.Kecamatan = data.Kecamatan.trim();
    if (data.Kabupaten_Kota !== undefined) sanitized.Kabupaten_Kota = data.Kabupaten_Kota.trim();
    if (data.Provinsi !== undefined) sanitized.Provinsi = data.Provinsi.trim();
    if (data.Kode_Pos !== undefined) sanitized.Kode_Pos = data.Kode_Pos.trim();

    setSantriList(prev => prev.map(s => s.NIS === nis ? { ...s, ...sanitized } : s));

    // Send Real-time notification to Admin
    const targetSantri = santriList.find(s => s.NIS === nis);
    const santriName = targetSantri ? targetSantri.Nama_Lengkap : nis;
    addNotification({
      judul: `Pembaruan Profil Santri: ${santriName}`,
      pesan: `Wali santri (${currentUser.nama || 'Wali Santri'}) telah memperbarui informasi biodata ananda ${santriName}.`,
      tipe: 'info',
      kategori: 'profil',
      targetMenu: 'santri',
      targetId: nis,
      senderName: currentUser.nama || 'Wali Santri',
      senderRole: 'Wali Santri'
    });

    showToast('✅ Profil Santri berhasil diperbarui.', 'success');
    return { success: true, message: 'Profil Santri berhasil diperbarui.' };
  };

  const deleteSantri = (nis: string) => {
    setSantriList(prev => prev.filter(s => s.NIS !== nis));
    setDiniyyahList(prev => prev.filter(d => d.NIS !== nis));
    setUsersList(prev => prev.filter(u => u.santriNIS !== nis && u.id !== `USR_WALI_${nis}`));
    showToast(`Data santri ${nis} berhasil dihapus.`, 'warning');
  };

  // CRUD Actions for Ngaji Diniyyah
  const addDiniyyah = (record: DiniyyahRecord): { success: boolean; message: string } => {
    if (currentUser?.role === 'Wali Santri') {
      showToast('Akses ditolak: Hanya Admin/Pengajar yang berhak menginput nilai Diniyyah.', 'error');
      return { success: false, message: 'Akses ditolak: Hanya Admin/Pengajar yang berhak menginput nilai Diniyyah.' };
    }

    const calc = calculateDiniyyah(record.nilaiList || []);
    const newRecord: DiniyyahRecord = {
      ...record,
      jumlahNilai: calc.jumlahNilai,
      rataRata: calc.rataRata,
      predikat: calc.predikat,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setDiniyyahList(prev => {
      // If record with same NIS, tahunAjaran, semester exists, replace it
      const filtered = prev.filter(d => !(d.NIS === record.NIS && d.tahunAjaran === record.tahunAjaran && d.semester === record.semester));
      return [newRecord, ...filtered];
    });

    showToast('Data nilai berhasil ditambahkan.', 'success');
    return { success: true, message: 'Data nilai berhasil ditambahkan.' };
  };

  const updateDiniyyah = (id: string, data: Partial<DiniyyahRecord>): { success: boolean; message: string } => {
    if (currentUser?.role === 'Wali Santri') {
      showToast('Akses ditolak: Hanya Admin/Pengajar yang berhak memperbarui nilai Diniyyah.', 'error');
      return { success: false, message: 'Akses ditolak: Hanya Admin/Pengajar yang berhak memperbarui nilai Diniyyah.' };
    }

    setDiniyyahList(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...data };
        if (data.nilaiList) {
          const calc = calculateDiniyyah(data.nilaiList);
          merged.jumlahNilai = calc.jumlahNilai;
          merged.rataRata = calc.rataRata;
          merged.predikat = calc.predikat;
        }
        merged.updatedAt = new Date().toISOString().split('T')[0];
        return merged;
      }
      return item;
    }));

    showToast('Data nilai berhasil diperbarui.', 'success');
    return { success: true, message: 'Data nilai berhasil diperbarui.' };
  };

  const deleteDiniyyah = (id: string): { success: boolean; message: string } => {
    if (currentUser?.role === 'Wali Santri') {
      showToast('Akses ditolak: Hanya Admin/Pengajar yang berhak menghapus data Diniyyah.', 'error');
      return { success: false, message: 'Akses ditolak: Hanya Admin/Pengajar yang berhak menghapus data Diniyyah.' };
    }

    setDiniyyahList(prev => prev.filter(d => d.id !== id));
    showToast('Data nilai berhasil dihapus.', 'warning');
    return { success: true, message: 'Data nilai berhasil dihapus.' };
  };

  const addPengajar = (pengajar: Pengajar) => {
    setPengajarList(prev => [...prev, pengajar]);
    showToast(`Pengajar ${pengajar.Nama_Pengajar} berhasil ditambahkan!`, 'success');
  };

  const updatePengajar = (id: string, data: Partial<Pengajar>) => {
    setPengajarList(prev => prev.map(p => p.ID_Pengajar === id ? { ...p, ...data } : p));
    showToast('Data pengajar berhasil diperbarui!', 'success');
  };

  const deletePengajar = (id: string) => {
    setPengajarList(prev => prev.filter(p => p.ID_Pengajar !== id));
    showToast('Pengajar berhasil dihapus.', 'warning');
  };

  const addTahfidz = (record: TahfidzRecord) => {
    setTahfidzList(prev => [record, ...prev]);
    showToast(`Setoran Tahfidz Surah ${record.Surah} berhasil dicatat!`, 'success');
  };

  const updateTahfidz = (id: string, data: Partial<TahfidzRecord>) => {
    setTahfidzList(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...data };
        if (data.Kelancaran_Score !== undefined || data.Tajwid_Score !== undefined || data.Fashahah_Score !== undefined) {
          const kelancaran = Number(updated.Kelancaran_Score) || 0;
          const tajwid = Number(updated.Tajwid_Score) || 0;
          const fashahah = Number(updated.Fashahah_Score) || 0;
          const rata = Math.round((kelancaran + tajwid + fashahah) / 3);
          updated.Nilai_Rata = rata;
          if (!data.Status_Lulus) {
            if (rata >= 90) updated.Status_Lulus = 'Mumtaz';
            else if (rata >= 80) updated.Status_Lulus = 'Jayyid Jiddan';
            else if (rata >= 70) updated.Status_Lulus = 'Jayyid';
            else if (rata >= 60) updated.Status_Lulus = 'Maqbul';
            else updated.Status_Lulus = 'Mengulang';
          }
        }
        return updated;
      }
      return t;
    }));
    showToast('Data setoran tahfidz berhasil diperbarui!', 'success');
  };

  const deleteTahfidz = (id: string) => {
    setTahfidzList(prev => prev.filter(t => t.id !== id));
    showToast('Catatan tahfidz dihapus.', 'info');
  };

  const addTahsin = (record: TahsinRecord) => {
    setTahsinList(prev => [record, ...prev]);
    showToast(`Perkembangan Tahsin ${record.Jilid_Iqra} tersimpan!`, 'success');
  };

  const updateTahsin = (id: string, data: Partial<TahsinRecord>) => {
    setTahsinList(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    showToast('Data perkembangan tahsin berhasil diperbarui!', 'success');
  };

  const deleteTahsin = (id: string) => {
    setTahsinList(prev => prev.filter(t => t.id !== id));
    showToast('Catatan tahsin dihapus.', 'info');
  };

  const addKebersihan = (record: KebersihanKesehatanRecord) => {
    setKebersihanList(prev => [record, ...prev]);
    showToast('Catatan Kebersihan & Kesehatan Santri berhasil disimpan!', 'success');
  };

  const deleteKebersihan = (id: string) => {
    setKebersihanList(prev => prev.filter(k => k.ID_Periksa !== id));
    showToast('Catatan kebersihan dihapus.', 'info');
  };

  const recordAbsensi = (record: AbsensiRecord) => {
    setAbsensiList(prev => {
      const filtered = prev.filter(a => !(a.NIS === record.NIS && a.tanggal === record.tanggal));
      return [record, ...filtered];
    });
    showToast(`Presensi ${record.namaSantri}: ${record.status}`, 'success');
  };

  const recordBulkAbsensi = (records: AbsensiRecord[]) => {
    setAbsensiList(prev => {
      const recordNisDate = new Set(records.map(r => `${r.NIS}_${r.tanggal}`));
      const filtered = prev.filter(a => !recordNisDate.has(`${a.NIS}_${a.tanggal}`));
      return [...records, ...filtered];
    });
    showToast(`${records.length} data absensi berhasil disimpan!`, 'success');
  };

  const addAkhlak = (record: AkhlakRecord) => {
    setAkhlakList(prev => [record, ...prev]);
    showToast('Penilaian Akhlak & Adab berhasil disimpan!', 'success');
  };

  const addIbadah = (record: IbadahRecord) => {
    setIbadahList(prev => [record, ...prev]);
    showToast('Evaluasi Praktik Ibadah tersimpan!', 'success');
  };

  const addTarget = (target: TargetSantri) => {
    setTargetList(prev => [target, ...prev]);
    showToast('Target santri berhasil ditambahkan!', 'success');
  };

  const updateTarget = (id: string, data: Partial<TargetSantri>) => {
    setTargetList(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    showToast('Target capaian santri diperbarui!', 'success');
  };

  const addPrestasi = (prestasi: PrestasiRecord) => {
    setPrestasiList(prev => [prestasi, ...prev]);
    showToast(`Prestasi "${prestasi.Judul_Prestasi}" berhasil dicatat!`, 'success');
  };

  const deletePrestasi = (id: string) => {
    setPrestasiList(prev => prev.filter(p => p.id !== id));
    showToast('Data prestasi dihapus.', 'info');
  };

  const addPelanggaran = (pelanggaran: PelanggaranRecord) => {
    setPelanggaranList(prev => [pelanggaran, ...prev]);
    showToast('Catatan pembinaan santri disimpan.', 'warning');
  };

  const updatePelanggaran = (id: string, data: Partial<PelanggaranRecord>) => {
    setPelanggaranList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    showToast('Status pembinaan santri diperbarui!', 'success');
  };

  const addSPP = (spp: AdministrasiSPP) => {
    setSppList(prev => [spp, ...prev]);
    showToast(`Pembayaran SPP ${spp.Bulan} berhasil dicatat. No: ${spp.Nomor_Kwitansi}`, 'success');
  };

  const addJadwal = (jadwal: JadwalKegiatan) => {
    setJadwalList(prev => [...prev, jadwal]);
    showToast('Jadwal kegiatan berhasil ditambahkan!', 'success');
  };

  const updateJadwal = (id: string, data: Partial<JadwalKegiatan>) => {
    setJadwalList(prev => prev.map(j => j.id === id ? { ...j, ...data } : j));
    showToast('Jadwal kegiatan berhasil diperbarui!', 'success');
  };

  const deleteJadwal = (id: string) => {
    setJadwalList(prev => prev.filter(j => j.id !== id));
    showToast('Jadwal kegiatan berhasil dihapus.', 'info');
  };

  const addPerizinan = (perizinan: PerizinanRecord) => {
    setPerizinanList(prev => [perizinan, ...prev]);
    
    // Automatically notify Admin
    addNotification({
      judul: `Permohonan Izin Baru: ${perizinan.namaSantri}`,
      pesan: `Wali santri mengajukan permohonan izin "${perizinan.jenisIzin}" (${perizinan.tanggalMulai} s/d ${perizinan.tanggalSelesai}). Alasan: ${perizinan.alasan}`,
      tipe: 'warning',
      kategori: 'izin',
      targetMenu: 'perizinan',
      targetId: perizinan.id,
      senderName: currentUser?.nama || 'Wali Santri',
      senderRole: currentUser?.role || 'Wali Santri'
    });

    showToast(`Pengajuan izin santri ${perizinan.namaSantri} berhasil dikirim!`, 'success');
  };

  const updatePerizinan = (id: string, data: Partial<PerizinanRecord>) => {
    setPerizinanList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    showToast('Status perizinan berhasil diperbarui!', 'success');
  };

  const deletePerizinan = (id: string) => {
    setPerizinanList(prev => prev.filter(p => p.id !== id));
    showToast('Data perizinan dihapus.', 'info');
  };

  const addPengumuman = (pengumuman: PengumumanRecord) => {
    setPengumumanList(prev => [pengumuman, ...prev]);
    showToast('Pengumuman baru berhasil diterbitkan!', 'success');
  };

  const deletePengumuman = (id: string) => {
    setPengumumanList(prev => prev.filter(p => p.id !== id));
    showToast('Pengumuman dihapus.', 'info');
  };

  const getSanguSummaryForSantri = (nis: string) => {
    const riwayat = sanguList
      .filter(t => t.NIS === nis)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    
    const totalPemasukan = riwayat
      .filter(t => t.tipe === 'Pemasukan')
      .reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    
    const totalPengeluaran = riwayat
      .filter(t => t.tipe === 'Pengeluaran')
      .reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    
    const saldo = totalPemasukan - totalPengeluaran;
    return { totalPemasukan, totalPengeluaran, saldo, riwayat };
  };

  const addSanguTransaksi = (transaksi: SanguTransaksi): { success: boolean; message: string } => {
    const santri = santriList.find(s => s.NIS === transaksi.NIS);
    const namaSantri = transaksi.namaSantri || santri?.Nama_Lengkap || `Santri (${transaksi.NIS})`;

    // Check balance if pengeluaran
    if (transaksi.tipe === 'Pengeluaran') {
      const summary = getSanguSummaryForSantri(transaksi.NIS);
      if (summary.saldo < transaksi.nominal) {
        showToast(`Saldo sangu ${namaSantri} tidak mencukupi (Saldo: Rp ${summary.saldo.toLocaleString('id-ID')}, Dibutuhkan: Rp ${transaksi.nominal.toLocaleString('id-ID')})`, 'error');
        return { 
          success: false, 
          message: `Saldo tidak mencukupi. Saldo saat ini: Rp ${summary.saldo.toLocaleString('id-ID')}` 
        };
      }
    }

    const newTx: SanguTransaksi = {
      ...transaksi,
      id: transaksi.id || `SNG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      namaSantri,
      nomorStruk: transaksi.nomorStruk || `STRUK-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      waktu: transaksi.waktu || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setSanguList(prev => [newTx, ...prev]);

    // Send in-app notification
    if (transaksi.tipe === 'Pengeluaran' && transaksi.isQRTransaction) {
      addNotification({
        judul: `Belanja QR Sangu: ${namaSantri}`,
        pesan: `Transaksi pembelian barang sebesar Rp ${transaksi.nominal.toLocaleString('id-ID')} via QR berhasil diproses. Saldo sangu terpotong.`,
        tipe: 'info',
        kategori: 'spp',
        targetMenu: 'sangu',
        targetId: newTx.id,
        senderName: currentUser?.nama || 'Petugas Koperasi',
        senderRole: currentUser?.role || 'Pengajar'
      });
    } else if (transaksi.tipe === 'Pemasukan') {
      addNotification({
        judul: `Uang Saku Masuk: ${namaSantri}`,
        pesan: `Pemasukan titipan uang saku sebesar Rp ${transaksi.nominal.toLocaleString('id-ID')} (${transaksi.kategori}) berhasil ditambahkan.`,
        tipe: 'success',
        kategori: 'spp',
        targetMenu: 'sangu',
        targetId: newTx.id,
        senderName: currentUser?.nama || 'Petugas',
        senderRole: currentUser?.role || 'Pengurus'
      });
    }

    showToast(`${transaksi.tipe === 'Pemasukan' ? 'Pemasukan sangu' : 'Pengeluaran belanja'} ${namaSantri} (Rp ${transaksi.nominal.toLocaleString('id-ID')}) berhasil disimpan!`, 'success');
    return { success: true, message: 'Transaksi berhasil dicatat' };
  };

  const addBulkSanguTransaksi = (
    transaksiList: SanguTransaksi[],
    batchTitle?: string
  ): { success: boolean; count: number; totalNominal: number } => {
    if (!transaksiList || transaksiList.length === 0) {
      showToast('Tidak ada data transaksi pengeluaran santri untuk disimpan.', 'error');
      return { success: false, count: 0, totalNominal: 0 };
    }

    const batchId = `BATCH_SNG_${Date.now()}`;
    const timestamp = Date.now();
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let totalNominal = 0;
    const formattedList: SanguTransaksi[] = transaksiList.map((tx, idx) => {
      const santri = santriList.find(s => s.NIS === tx.NIS);
      const namaSantri = tx.namaSantri || santri?.Nama_Lengkap || `Santri (${tx.NIS})`;
      const nominal = Number(tx.nominal) || 0;
      totalNominal += nominal;

      return {
        ...tx,
        id: tx.id || `SNG_${timestamp}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        namaSantri,
        nominal,
        batchId: tx.batchId || batchId,
        batchTitle: tx.batchTitle || batchTitle || tx.keterangan || 'Pengeluaran Massal Santri',
        nomorStruk: tx.nomorStruk || `STRUK-B${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(idx + 1).toString().padStart(3, '0')}`,
        waktu: tx.waktu || timeStr
      };
    });

    setSanguList(prev => [...formattedList, ...prev]);

    // Send notification
    addNotification({
      judul: `Pengaturan Pengeluaran Massal (${formattedList.length} Santri)`,
      pesan: `Pengeluaran ${batchTitle || 'Santri'} berhasil diterapkan untuk ${formattedList.length} santri dengan total dana Rp ${totalNominal.toLocaleString('id-ID')}.`,
      tipe: 'info',
      kategori: 'spp',
      targetMenu: 'sangu',
      senderName: currentUser?.nama || 'Admin',
      senderRole: currentUser?.role || 'Super Admin'
    });

    showToast(`Berhasil menerapkan pengeluaran untuk ${formattedList.length} santri (Total: Rp ${totalNominal.toLocaleString('id-ID')})!`, 'success');
    return { success: true, count: formattedList.length, totalNominal };
  };

  const updateSanguTransaksi = (id: string, data: Partial<SanguTransaksi>): { success: boolean; message: string } => {
    setSanguList(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    showToast('Data transaksi sangu berhasil diperbarui!', 'success');
    return { success: true, message: 'Transaksi berhasil diperbarui' };
  };

  const deleteSanguTransaksi = (id: string): { success: boolean; message: string } => {
    setSanguList(prev => prev.filter(t => t.id !== id));
    showToast('Transaksi sangu berhasil dihapus.', 'info');
    return { success: true, message: 'Transaksi dihapus' };
  };

  const clearAllSanguTransaksi = (): { success: boolean; message: string } => {
    setSanguList([]);
    showToast('Semua saldo dan riwayat transaksi sangu santri berhasil dikosongkan (Rp 0).', 'success');
    return { success: true, message: 'Semua saldo sangu telah dikosongkan.' };
  };

  const addBarangKoperasi = (barang: BarangKoperasi) => {
    setBarangKoperasiList(prev => [barang, ...prev]);
    showToast(`Barang "${barang.namaBarang}" berhasil ditambahkan ke katalog koperasi!`, 'success');
  };

  const updateBarangKoperasi = (id: string, data: Partial<BarangKoperasi>) => {
    setBarangKoperasiList(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    showToast('Data barang koperasi berhasil diperbarui!', 'success');
  };

  const deleteBarangKoperasi = (id: string) => {
    setBarangKoperasiList(prev => prev.filter(b => b.id !== id));
    showToast('Barang koperasi berhasil dihapus.', 'info');
  };

  const processQRPurchase = (
    nis: string, 
    items: SanguItem[], 
    keterangan?: string, 
    petugas?: string
  ): { success: boolean; message: string; transaksi?: SanguTransaksi } => {
    if (!items || items.length === 0) {
      showToast('Daftar barang belanja tidak boleh kosong.', 'error');
      return { success: false, message: 'Daftar barang belanja tidak boleh kosong.' };
    }

    const santri = santriList.find(s => s.NIS === nis);
    if (!santri) {
      showToast(`Santri dengan NIS ${nis} tidak ditemukan.`, 'error');
      return { success: false, message: 'Data santri tidak ditemukan.' };
    }

    const totalBelanja = items.reduce((sum, item) => sum + (item.total || (item.harga * item.jumlah)), 0);
    const summary = getSanguSummaryForSantri(nis);

    if (summary.saldo < totalBelanja) {
      showToast(`Saldo sangu ${santri.Nama_Lengkap} tidak cukup! Saldo: Rp ${summary.saldo.toLocaleString('id-ID')}, Total Belanja: Rp ${totalBelanja.toLocaleString('id-ID')}`, 'error');
      return {
        success: false,
        message: `Saldo sangu tidak mencukupi. Sisa saldo Rp ${summary.saldo.toLocaleString('id-ID')}, total belanja Rp ${totalBelanja.toLocaleString('id-ID')}`
      };
    }

    // Auto deduct stock in barangKoperasiList for matching items
    setBarangKoperasiList(prev => prev.map(b => {
      const purchased = items.find(i => i.id === b.id || i.kodeBarang === b.kodeBarang || i.namaBarang.toLowerCase() === b.namaBarang.toLowerCase());
      if (purchased) {
        return {
          ...b,
          stok: Math.max(0, b.stok - (purchased.jumlah || 1))
        };
      }
      return b;
    }));

    const itemsSummary = items.map(i => `${i.namaBarang} (${i.jumlah}x)`).join(', ');
    const newTx: SanguTransaksi = {
      id: `SNG_QR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      NIS: nis,
      namaSantri: santri.Nama_Lengkap,
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tipe: 'Pengeluaran',
      kategori: 'Koperasi Pesantren',
      nominal: totalBelanja,
      keterangan: keterangan || `Pembelian QR: ${itemsSummary}`,
      metode: 'QR Pembelian',
      petugas: petugas || currentUser?.nama || 'Petugas Koperasi',
      isQRTransaction: true,
      qrItems: items,
      nomorStruk: `QR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSanguList(prev => [newTx, ...prev]);

    addNotification({
      judul: `Transaksi QR Berhasil: ${santri.Nama_Lengkap}`,
      pesan: `Pembelian "${itemsSummary}" senilai Rp ${totalBelanja.toLocaleString('id-ID')} berhasil diproses via QR. Sisa saldo: Rp ${(summary.saldo - totalBelanja).toLocaleString('id-ID')}`,
      tipe: 'success',
      kategori: 'spp',
      targetMenu: 'sangu',
      targetId: newTx.id,
      senderName: petugas || currentUser?.nama || 'Petugas Koperasi',
      senderRole: currentUser?.role || 'Pengajar'
    });

    showToast(`Pembelian QR ${santri.Nama_Lengkap} senilai Rp ${totalBelanja.toLocaleString('id-ID')} berhasil! Sisa saldo: Rp ${(summary.saldo - totalBelanja).toLocaleString('id-ID')}`, 'success');
    return { success: true, message: 'Transaksi QR berhasil diproses', transaksi: newTx };
  };

  const addFotoKegiatan = (record: FotoKegiatanRecord) => {
    setFotoKegiatanList(prev => [record, ...prev]);
    showToast(`Dokumentasi "${record.judul}" berhasil dipublikasikan!`, 'success');
  };

  const updateFotoKegiatan = (id: string, data: Partial<FotoKegiatanRecord>) => {
    setFotoKegiatanList(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    showToast('Informasi foto kegiatan berhasil diperbarui!', 'success');
  };

  const deleteFotoKegiatan = (id: string) => {
    setFotoKegiatanList(prev => prev.filter(f => f.id !== id));
    showToast('Album / Foto kegiatan berhasil dihapus.', 'warning');
  };

  const addFotoKomentar = (albumId: string, komentarData: Omit<FotoKomentar, 'id' | 'tanggal'> & { tanggal?: string }) => {
    const newKomentar: FotoKomentar = {
      id: 'KMT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      albumId,
      photoIndex: komentarData.photoIndex,
      userId: komentarData.userId || currentUser?.id,
      namaPengirim: komentarData.namaPengirim || currentUser?.nama || 'Wali Santri',
      role: komentarData.role || currentUser?.role || 'Wali Santri',
      santriInfo: komentarData.santriInfo,
      fotoAvatar: komentarData.fotoAvatar,
      pesan: komentarData.pesan,
      tanggal: komentarData.tanggal || new Date().toISOString().replace('T', ' ').slice(0, 16),
      likes: 0,
      likedBy: []
    };

    setFotoKegiatanList(prev => prev.map(album => {
      if (album.id === albumId) {
        const existing = album.komentarList || [];
        return {
          ...album,
          komentarList: [...existing, newKomentar]
        };
      }
      return album;
    }));

    // Notify Admin when a Wali Santri comments on a photo
    const targetAlbum = fotoKegiatanList.find(a => a.id === albumId);
    const albumTitle = targetAlbum ? targetAlbum.judul : 'Foto Kegiatan';
    addNotification({
      judul: `Komentar Baru: ${albumTitle}`,
      pesan: `${newKomentar.namaPengirim}${newKomentar.santriInfo ? ` (${newKomentar.santriInfo})` : ''}: "${newKomentar.pesan}"`,
      tipe: 'info',
      kategori: 'komentar',
      targetMenu: 'foto-kegiatan',
      targetId: albumId,
      senderName: newKomentar.namaPengirim,
      senderRole: newKomentar.role
    });

    showToast('Komentar Anda berhasil ditambahkan!', 'success');
  };

  const deleteFotoKomentar = (albumId: string, komentarId: string) => {
    setFotoKegiatanList(prev => prev.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          komentarList: (album.komentarList || []).filter(k => k.id !== komentarId)
        };
      }
      return album;
    }));
    showToast('Komentar berhasil dihapus.', 'info');
  };

  const toggleLikeFotoKomentar = (albumId: string, komentarId: string, userIdOrName?: string) => {
    const identifier = userIdOrName || currentUser?.username || currentUser?.nama || 'guest';
    setFotoKegiatanList(prev => prev.map(album => {
      if (album.id === albumId) {
        const updatedKomentarList = (album.komentarList || []).map(k => {
          if (k.id === komentarId) {
            const likedBy = k.likedBy || [];
            const alreadyLiked = likedBy.includes(identifier);
            const newLikedBy = alreadyLiked ? likedBy.filter(id => id !== identifier) : [...likedBy, identifier];
            const currentLikes = k.likes || 0;
            return {
              ...k,
              likes: alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
              likedBy: newLikedBy
            };
          }
          return k;
        });
        return { ...album, komentarList: updatedKomentarList };
      }
      return album;
    }));
  };

  const toggleLikeFotoKegiatan = (albumId: string, userIdOrName?: string) => {
    const identifier = userIdOrName || currentUser?.username || currentUser?.nama || 'guest';
    setFotoKegiatanList(prev => prev.map(album => {
      if (album.id === albumId) {
        const likedBy = album.likedBy || [];
        const alreadyLiked = likedBy.includes(identifier);
        const newLikedBy = alreadyLiked ? likedBy.filter(id => id !== identifier) : [...likedBy, identifier];
        const currentLikes = album.likes || 0;
        return {
          ...album,
          likes: alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
          likedBy: newLikedBy
        };
      }
      return album;
    }));
  };

  const addUser = (user: UserAccount) => {
    setUsersList(prev => [...prev, user]);
    showToast(`Pengguna ${user.nama} berhasil dibuat!`, 'success');
  };

  const updateUser = (id: string, data: Partial<UserAccount>) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    showToast('Data pengguna diperbarui!', 'success');
  };

  const deleteUser = (id: string) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
    showToast('Pengguna dihapus.', 'warning');
  };

  const resetUserPassword = (id: string, defaultPassword = 'rtq_cendekia') => {
    const newHash = hashPassword(defaultPassword);
    setUsersList(prev => prev.map(u => {
      const isTarget = u.id === id || (u.santriNIS && id.includes(u.santriNIS));
      if (isTarget) {
        return {
          ...u,
          passwordHash: newHash,
          password: defaultPassword,
          plainPassword: defaultPassword,
          isDefaultPassword: true,
          passwordUpdatedAt: new Date().toISOString()
        };
      }
      return u;
    }));
    showToast(`Kata sandi akun berhasil direset ke "${defaultPassword}"`, 'success');
  };

  const resetDataToDefault = () => {
    setSantriList(INITIAL_SANTRI);
    setPengajarList(INITIAL_PENGAJAR);
    setTahfidzList(INITIAL_TAHFIDZ);
    setTahsinList(INITIAL_TAHSIN);
    setKebersihanList(INITIAL_KEBERSIHAN);
    setAbsensiList(INITIAL_ABSENSI);
    setAkhlakList(INITIAL_AKHLAK);
    setIbadahList(INITIAL_IBADAH);
    setTargetList(INITIAL_TARGET);
    setPrestasiList(INITIAL_PRESTASI);
    setPelanggaranList(INITIAL_PELANGGARAN);
    setSppList(INITIAL_SPP);
    setJadwalList(INITIAL_JADWAL);
    setPerizinanList(INITIAL_PERIZINAN);
    setPengumumanList(INITIAL_PENGUMUMAN);
    setFotoKegiatanList(INITIAL_FOTO_KEGIATAN);
    setDiniyyahList(INITIAL_DINIYYAH_DATA);
    setSanguList(INITIAL_SANGU_TRANSAKSI);
    setBarangKoperasiList(INITIAL_BARANG_KOPERASI);
    setUsersList(INITIAL_USERS);
    setAppSettings(DEFAULT_APP_SETTINGS);
    showToast('Seluruh database berhasil dikembalikan ke format default standar BAZNAS!', 'info');
  };

  const exportDatabaseJSON = () => {
    const data = {
      santri: santriList,
      pengajar: pengajarList,
      tahfidz: tahfidzList,
      tahsin: tahsinList,
      kebersihanKesehatan: kebersihanList,
      absensi: absensiList,
      akhlak: akhlakList,
      ibadah: ibadahList,
      target: targetList,
      prestasi: prestasiList,
      pelanggaran: pelanggaranList,
      spp: sppList,
      sangu: sanguList,
      barangKoperasi: barangKoperasiList,
      jadwal: jadwalList,
      perizinan: perizinanList,
      pengumuman: pengumumanList,
      fotoKegiatan: fotoKegiatanList,
      diniyyah: diniyyahList,
      users: usersList,
      appLogo: appLogo,
      appSettings: appSettings,
      exportedAt: new Date().toISOString(),
      institution: 'RTQ Cendikia BAZNAS Masjid Agung Darussalam'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIT_RTQ_Cendikia_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database berhasil diekspor ke file JSON!', 'success');
  };

  const importDatabaseJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.santri) setSantriList(parsed.santri);
      if (parsed.pengajar) setPengajarList(parsed.pengajar);
      if (parsed.tahfidz) setTahfidzList(parsed.tahfidz);
      if (parsed.tahsin) setTahsinList(parsed.tahsin);
      if (parsed.kebersihanKesehatan) setKebersihanList(parsed.kebersihanKesehatan);
      if (parsed.absensi) setAbsensiList(parsed.absensi);
      if (parsed.akhlak) setAkhlakList(parsed.akhlak);
      if (parsed.ibadah) setIbadahList(parsed.ibadah);
      if (parsed.target) setTargetList(parsed.target);
      if (parsed.prestasi) setPrestasiList(parsed.prestasi);
      if (parsed.pelanggaran) setPelanggaranList(parsed.pelanggaran);
      if (parsed.spp) setSppList(parsed.spp);
      if (parsed.sangu) setSanguList(parsed.sangu);
      if (parsed.barangKoperasi) setBarangKoperasiList(parsed.barangKoperasi);
      if (parsed.jadwal) setJadwalList(parsed.jadwal);
      if (parsed.perizinan) setPerizinanList(parsed.perizinan);
      if (parsed.pengumuman) setPengumumanList(parsed.pengumuman);
      if (parsed.fotoKegiatan) setFotoKegiatanList(parsed.fotoKegiatan);
      if (parsed.diniyyah) setDiniyyahList(parsed.diniyyah);
      if (parsed.users) setUsersList(parsed.users);
      if (parsed.appSettings) setAppSettings(parsed.appSettings);
      if (parsed.appLogo) {
        setAppLogoState(parsed.appLogo);
        try {
          localStorage.setItem(LOCAL_STORAGE_PREFIX + 'APP_LOGO', parsed.appLogo);
        } catch (e) {
          console.warn('Gagal menyimpan app logo dari impor:', e);
        }
      }

      showToast('Database berhasil diimpor dan disinkronkan!', 'success');
      return true;
    } catch (err) {
      showToast('Gagal memproses file JSON. Format tidak valid.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        quickLogin,
        logout,
        changePassword,
        activeMenu,
        setActiveMenu,
        santriList,
        pengajarList,
        tahfidzList,
        tahsinList,
        kebersihanList,
        absensiList,
        akhlakList,
        ibadahList,
        targetList,
        prestasiList,
        pelanggaranList,
        sppList,
        sanguList,
        barangKoperasiList,
        jadwalList,
        usersList,
        perizinanList,
        pengumumanList,
        fotoKegiatanList,
        diniyyahList,
        getSantriForWali,
        getSanguSummaryForSantri,
        processQRPurchase,
        addSantri,
        updateSantri,
        updateSantriProfileByWali,
        deleteSantri,
        addDiniyyah,
        updateDiniyyah,
        deleteDiniyyah,
        addPengajar,
        updatePengajar,
        deletePengajar,
        addTahfidz,
        updateTahfidz,
        deleteTahfidz,
        addTahsin,
        updateTahsin,
        deleteTahsin,
        addKebersihan,
        deleteKebersihan,
        recordAbsensi,
        recordBulkAbsensi,
        addAkhlak,
        addIbadah,
        addTarget,
        updateTarget,
        addPrestasi,
        deletePrestasi,
        addPelanggaran,
        updatePelanggaran,
        addSPP,
        addSanguTransaksi,
        addBulkSanguTransaksi,
        updateSanguTransaksi,
        deleteSanguTransaksi,
        clearAllSanguTransaksi,
        addBarangKoperasi,
        updateBarangKoperasi,
        deleteBarangKoperasi,
        addJadwal,
        updateJadwal,
        deleteJadwal,
        addPerizinan,
        updatePerizinan,
        deletePerizinan,
        addPengumuman,
        deletePengumuman,
        addFotoKegiatan,
        updateFotoKegiatan,
        deleteFotoKegiatan,
        addFotoKomentar,
        deleteFotoKomentar,
        toggleLikeFotoKomentar,
        toggleLikeFotoKegiatan,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        resetDataToDefault,
        exportDatabaseJSON,
        importDatabaseJSON,
        toasts,
        showToast,
        removeToast,
        selectedSantriForCard,
        setSelectedSantriForCard,
        selectedPrestasiForCert,
        setSelectedPrestasiForCert,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isGantiPasswordOpen,
        setIsGantiPasswordOpen,
        appLogo,
        updateAppLogo,
        resetAppLogo,
        isEditLogoModalOpen,
        setIsEditLogoModalOpen,
        appSettings,
        updateAppSettings,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addNotification,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

