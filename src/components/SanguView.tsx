import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SanguTransaksi, SanguItem, BarangKoperasi } from '../types';
import { QRCodeCanvas } from './QRCodeCanvas';
import jsQR from 'jsqr';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  ScanLine,
  Search,
  Filter,
  PlusCircle,
  Download,
  Printer,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Package,
  Calendar,
  User,
  Clock,
  Coins,
  Receipt,
  X,
  Camera,
  RefreshCw,
  Zap,
  ArrowRight,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Store,
  CreditCard,
  Phone,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Calculator,
  Users,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ListChecks,
  BadgePercent
} from 'lucide-react';

export const SanguView: React.FC = () => {
  const {
    currentUser,
    santriList,
    sanguList,
    barangKoperasiList,
    getSantriForWali,
    getSanguSummaryForSantri,
    addSanguTransaksi,
    addBulkSanguTransaksi,
    updateSanguTransaksi,
    deleteSanguTransaksi,
    clearAllSanguTransaksi,
    addBarangKoperasi,
    updateBarangKoperasi,
    deleteBarangKoperasi,
    processQRPurchase,
    showToast
  } = useApp();

  const isWali = currentUser?.role === 'Wali Santri';
  const isAdminOrPengajar = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Pengajar';
  const linkedSantri = isWali ? getSantriForWali() : null;

  // Selected filter state
  const [selectedNIS, setSelectedNIS] = useState<string>(linkedSantri ? linkedSantri.NIS : 'ALL');
  const [filterTipe, setFilterTipe] = useState<'ALL' | 'Pemasukan' | 'Pengeluaran'>('ALL');
  const [filterMetode, setFilterMetode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'transaksi' | 'atur-pengeluaran' | 'katalog' | 'rekap'>('transaksi');

  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualType, setManualType] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isViewQRModalOpen, setIsViewQRModalOpen] = useState(false);
  const [selectedBarangForQR, setSelectedBarangForQR] = useState<BarangKoperasi | null>(null);
  const [isDetailStrukOpen, setIsDetailStrukOpen] = useState(false);
  const [selectedStruk, setSelectedStruk] = useState<SanguTransaksi | null>(null);
  const [isBarangFormOpen, setIsBarangFormOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<BarangKoperasi | null>(null);
  const [isTopupGuideOpen, setIsTopupGuideOpen] = useState(false);

  // ==========================================
  // BULK / PENGATURAN PENGELUARAN SANTRI STATE
  // ==========================================
  const [isBulkPengeluaranModalOpen, setIsBulkPengeluaranModalOpen] = useState(false);
  const [bulkTargetMode, setBulkTargetMode] = useState<'ALL' | 'SELECTED' | 'SINGLE'>('ALL');
  const [bulkSelectedNIS, setBulkSelectedNIS] = useState<string[]>(() => santriList.map(s => s.NIS));
  const [bulkSingleNIS, setBulkSingleNIS] = useState<string>(santriList[0]?.NIS || '');
  const [bulkNominalMode, setBulkNominalMode] = useState<'SERAGAM' | 'CUSTOM'>('SERAGAM');
  const [bulkNominalSeragam, setBulkNominalSeragam] = useState<string>('10000');
  const [bulkCustomNominals, setBulkCustomNominals] = useState<Record<string, number>>({});
  const [bulkKategori, setBulkKategori] = useState<string>('Uang Jajan Harian');
  const [bulkTanggal, setBulkTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkWaktu, setBulkWaktu] = useState<string>(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [bulkKeterangan, setBulkKeterangan] = useState<string>('Pengeluaran Uang Saku Jajan Harian');
  const [bulkMetode, setBulkMetode] = useState<string>('Potong Saldo Kas');
  const [bulkAllowNegative, setBulkAllowNegative] = useState<boolean>(true);
  const [bulkFilterHalaqah, setBulkFilterHalaqah] = useState<string>('ALL');
  const [bulkSearchSantri, setBulkSearchSantri] = useState<string>('');
  const [bulkSuccessSummary, setBulkSuccessSummary] = useState<{
    count: number;
    totalNominal: number;
    batchTitle: string;
    items: SanguTransaksi[];
    tanggal: string;
    kategori: string;
  } | null>(null);
  const [isBulkSuccessModalOpen, setIsBulkSuccessModalOpen] = useState(false);

  // Manual Transaction Form State
  const [formNIS, setFormNIS] = useState<string>(linkedSantri?.NIS || (santriList[0]?.NIS || ''));
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNominal, setFormNominal] = useState<string>('');
  const [formKategori, setFormKategori] = useState<string>('Titipan Uang Saku');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formMetode, setFormMetode] = useState<string>('Tunai');

  // QR Purchase State (When QR is scanned or building a cart)
  const [scannedItem, setScannedItem] = useState<BarangKoperasi | null>(null);
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [purchaseBuyerNIS, setPurchaseBuyerNIS] = useState<string>(linkedSantri?.NIS || (santriList[0]?.NIS || ''));
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  const [isPurchaseConfirmOpen, setIsPurchaseConfirmOpen] = useState(false);

  // Barang Form State
  const [barangNama, setBarangNama] = useState('');
  const [barangKategori, setBarangKategori] = useState('Makanan & Minuman');
  const [barangHarga, setBarangHarga] = useState<string>('');
  const [barangStok, setBarangStok] = useState<string>('50');
  const [barangSatuan, setBarangSatuan] = useState('pcs');
  const [barangDeskripsi, setBarangDeskripsi] = useState('');

  // Scanner ref and stream handling
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannerError, setScannerError] = useState<string>('');
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Filtered Santri list for selection
  const targetSantri = useMemo(() => {
    if (isWali && linkedSantri) return linkedSantri;
    if (selectedNIS !== 'ALL') {
      return santriList.find(s => s.NIS === selectedNIS) || null;
    }
    return null;
  }, [isWali, linkedSantri, selectedNIS, santriList]);

  // Overall or filtered transactions
  const filteredTransactions = useMemo(() => {
    return sanguList.filter(item => {
      // Filter by Wali or selected santri
      if (isWali && linkedSantri) {
        if (item.NIS !== linkedSantri.NIS) return false;
      } else if (selectedNIS !== 'ALL') {
        if (item.NIS !== selectedNIS) return false;
      }

      // Filter by Tipe
      if (filterTipe !== 'ALL' && item.tipe !== filterTipe) return false;

      // Filter by Metode
      if (filterMetode !== 'ALL' && item.metode !== filterMetode) return false;

      // Filter by Date range
      if (dateStart && item.tanggal < dateStart) return false;
      if (dateEnd && item.tanggal > dateEnd) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.namaSantri.toLowerCase().includes(q);
        const matchNIS = item.NIS.toLowerCase().includes(q);
        const matchKet = item.keterangan.toLowerCase().includes(q);
        const matchKat = item.kategori.toLowerCase().includes(q);
        const matchStruk = (item.nomorStruk || '').toLowerCase().includes(q);
        const matchItems = item.qrItems ? item.qrItems.some(i => i.namaBarang.toLowerCase().includes(q)) : false;
        if (!matchName && !matchNIS && !matchKet && !matchKat && !matchStruk && !matchItems) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [sanguList, isWali, linkedSantri, selectedNIS, filterTipe, filterMetode, dateStart, dateEnd, searchQuery]);

  // Calculated Statistics
  const stats = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    // Use relevant scope
    const dataset = (isWali && linkedSantri) 
      ? sanguList.filter(s => s.NIS === linkedSantri.NIS)
      : (selectedNIS !== 'ALL' ? sanguList.filter(s => s.NIS === selectedNIS) : sanguList);

    dataset.forEach(item => {
      const nom = Number(item.nominal) || 0;
      if (item.tipe === 'Pemasukan') {
        totalPemasukan += nom;
      } else {
        totalPengeluaran += nom;
      }
    });

    const saldoAkhir = totalPemasukan - totalPengeluaran;
    const qrTransactionsCount = dataset.filter(d => d.isQRTransaction).length;

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      qrTransactionsCount,
      totalRecords: dataset.length
    };
  }, [sanguList, isWali, linkedSantri, selectedNIS]);

  // Rekap per Santri table data
  const rekapPerSantri = useMemo(() => {
    return santriList.map(s => {
      const summary = getSanguSummaryForSantri(s.NIS);
      const lastTx = summary.riwayat[0] || null;
      return {
        ...s,
        totalPemasukan: summary.totalPemasukan,
        totalPengeluaran: summary.totalPengeluaran,
        saldo: summary.saldo,
        jumlahTransaksi: summary.riwayat.length,
        terakhirTransaksi: lastTx ? `${lastTx.tanggal} (${lastTx.tipe})` : 'Belum Ada'
      };
    }).sort((a, b) => b.saldo - a.saldo);
  }, [santriList, sanguList, getSanguSummaryForSantri]);

  // Handle opening Camera QR Scanner
  const startScanner = async () => {
    setScannerError('');
    setIsScanningActive(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          startDecoding();
        }
      } else {
        setScannerError('Perangkat Anda tidak mendukung akses kamera langsung. Silakan gunakan fitur Upload Gambar QR.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setScannerError('Izin kamera ditolak atau kamera sedang digunakan aplikasi lain. Silakan periksa izin browser atau gunakan Upload Gambar QR.');
    }
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanningActive(false);
  };

  useEffect(() => {
    if (isQRScannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isQRScannerOpen, cameraFacing]);

  const startDecoding = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (code && code.data) {
              handleDecodedQR(code.data);
            }
          }
        }
      }
    }, 250);
  };

  // Decode and match QR payload
  const handleDecodedQR = (rawPayload: string) => {
    try {
      // Play audio beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // Audio might be blocked by browser policy
      }

      stopScanner();
      setIsQRScannerOpen(false);

      // Check if it's JSON format
      let parsedItem: Partial<BarangKoperasi> | null = null;
      let rawCode = rawPayload.trim();

      if (rawPayload.startsWith('{') && rawPayload.endsWith('}')) {
        try {
          const data = JSON.parse(rawPayload);
          if (data.kodeBarang || data.namaBarang) {
            parsedItem = data;
          }
        } catch {
          // not valid json, treat as code
        }
      }

      // Find in existing barang koperasi
      let matchedBarang: BarangKoperasi | undefined;
      if (parsedItem && parsedItem.kodeBarang) {
        matchedBarang = barangKoperasiList.find(b => b.kodeBarang === parsedItem?.kodeBarang);
      } else {
        matchedBarang = barangKoperasiList.find(
          b => b.kodeBarang.toLowerCase() === rawCode.toLowerCase() ||
               b.id.toLowerCase() === rawCode.toLowerCase() ||
               b.namaBarang.toLowerCase().includes(rawCode.toLowerCase())
        );
      }

      if (matchedBarang) {
        setScannedItem(matchedBarang);
        setPurchaseQty(1);
        setPurchaseNotes(`Pembelian via Scan QR (${matchedBarang.namaBarang})`);
        setIsPurchaseConfirmOpen(true);
        showToast(`QR Barang Terdeteksi: ${matchedBarang.namaBarang} (Rp ${matchedBarang.harga.toLocaleString('id-ID')})`, 'success');
      } else if (parsedItem && parsedItem.namaBarang && parsedItem.harga) {
        // Dynamic item from QR
        const dynamicBarang: BarangKoperasi = {
          id: parsedItem.id || `BRG_QR_${Date.now()}`,
          kodeBarang: parsedItem.kodeBarang || `QR-${Date.now().toString().slice(-4)}`,
          namaBarang: parsedItem.namaBarang,
          kategori: parsedItem.kategori || 'Koperasi Santri',
          harga: Number(parsedItem.harga),
          stok: Number(parsedItem.stok || 99),
          satuan: parsedItem.satuan || 'pcs',
          deskripsi: parsedItem.deskripsi || 'Barang dari Kode QR'
        };
        setScannedItem(dynamicBarang);
        setPurchaseQty(1);
        setPurchaseNotes(`Pembelian QR: ${dynamicBarang.namaBarang}`);
        setIsPurchaseConfirmOpen(true);
        showToast(`QR Barang Terdeteksi: ${dynamicBarang.namaBarang}`, 'success');
      } else {
        // If it's a santri NIS QR (e.g. santri scanned their ID card at cash register)
        const matchedSantri = santriList.find(s => s.NIS.toLowerCase() === rawCode.toLowerCase());
        if (matchedSantri) {
          setSelectedNIS(matchedSantri.NIS);
          setFormNIS(matchedSantri.NIS);
          setPurchaseBuyerNIS(matchedSantri.NIS);
          showToast(`QR Kartu Santri Terbaca: ${matchedSantri.Nama_Lengkap} (${matchedSantri.NIS})`, 'info');
        } else {
          showToast(`Kode QR terbaca: "${rawPayload}", namun tidak ditemukan di katalog barang koperasi.`, 'warning');
        }
      }
    } catch (err) {
      console.error('Error handling decoded QR:', err);
      showToast('Gagal memproses kode QR.', 'error');
    }
  };

  // Upload QR Image file from gallery
  const handleUploadQRFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedQR(code.data);
          } else {
            showToast('Tidak ada kode QR yang valid terdeteksi pada gambar yang diunggah.', 'error');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Submit Manual Transaction (Pemasukan / Pengeluaran)
  const handleSaveManualTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const nominalNum = Number(formNominal.replace(/\D/g, ''));
    if (!nominalNum || nominalNum <= 0) {
      showToast('Nominal harus lebih dari 0.', 'error');
      return;
    }

    if (!formNIS) {
      showToast('Pilih santri terlebih dahulu.', 'error');
      return;
    }

    const santriObj = santriList.find(s => s.NIS === formNIS);

    const result = addSanguTransaksi({
      NIS: formNIS,
      namaSantri: santriObj?.Nama_Lengkap || `Santri (${formNIS})`,
      tanggal: formTanggal,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tipe: manualType,
      kategori: formKategori,
      nominal: nominalNum,
      keterangan: formKeterangan || (manualType === 'Pemasukan' ? 'Pemasukan uang saku santri' : 'Pengeluaran kebutuhan santri'),
      metode: formMetode,
      petugas: currentUser?.nama || 'Petugas Keuangan'
    });

    if (result.success) {
      setIsManualModalOpen(false);
      setFormNominal('');
      setFormKeterangan('');
    }
  };

  // Process Confirmed QR Purchase
  const handleConfirmQRPurchase = () => {
    if (!scannedItem) return;
    if (!purchaseBuyerNIS) {
      showToast('Pilih santri pembeli terlebih dahulu.', 'error');
      return;
    }

    const item: SanguItem = {
      id: scannedItem.id,
      kodeBarang: scannedItem.kodeBarang,
      namaBarang: scannedItem.namaBarang,
      harga: scannedItem.harga,
      jumlah: purchaseQty,
      total: scannedItem.harga * purchaseQty,
      kategori: scannedItem.kategori
    };

    const res = processQRPurchase(
      purchaseBuyerNIS,
      [item],
      purchaseNotes || `Pembelian QR: ${scannedItem.namaBarang} (${purchaseQty} ${scannedItem.satuan || 'pcs'})`,
      currentUser?.nama || 'Petugas Koperasi'
    );

    if (res.success) {
      setIsPurchaseConfirmOpen(false);
      setScannedItem(null);
      if (res.transaksi) {
        setSelectedStruk(res.transaksi);
        setIsDetailStrukOpen(true);
      }
    }
  };

  // Save / Update Barang Koperasi
  const handleSaveBarangKoperasi = (e: React.FormEvent) => {
    e.preventDefault();
    const hargaNum = Number(barangHarga.replace(/\D/g, ''));
    const stokNum = Number(barangStok) || 0;

    if (!barangNama.trim() || hargaNum <= 0) {
      showToast('Nama barang dan harga harus diisi dengan benar.', 'error');
      return;
    }

    if (editingBarang) {
      updateBarangKoperasi(editingBarang.id, {
        namaBarang: barangNama,
        kategori: barangKategori,
        harga: hargaNum,
        stok: stokNum,
        satuan: barangSatuan,
        deskripsi: barangDeskripsi
      });
    } else {
      const newKode = `BRG-${barangKategori.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      addBarangKoperasi({
        id: `BRG_${Date.now()}`,
        kodeBarang: newKode,
        namaBarang: barangNama,
        kategori: barangKategori,
        harga: hargaNum,
        stok: stokNum,
        satuan: barangSatuan,
        deskripsi: barangDeskripsi
      });
    }

    setIsBarangFormOpen(false);
    setEditingBarang(null);
    setBarangNama('');
    setBarangHarga('');
    setBarangStok('50');
    setBarangDeskripsi('');
  };

  // Open Edit Barang
  const handleOpenEditBarang = (barang: BarangKoperasi) => {
    setEditingBarang(barang);
    setBarangNama(barang.namaBarang);
    setBarangKategori(barang.kategori);
    setBarangHarga(barang.harga.toString());
    setBarangStok(barang.stok.toString());
    setBarangSatuan(barang.satuan || 'pcs');
    setBarangDeskripsi(barang.deskripsi || '');
    setIsBarangFormOpen(true);
  };

  // Print Struk or Export
  const handlePrintStruk = () => {
    window.print();
  };

  // ==========================================
  // BULK / PENGATURAN PENGELUARAN LOGIC & MEMO
  // ==========================================

  // List of santri targeted for the current bulk setup
  const targetedSantriList = useMemo(() => {
    if (bulkTargetMode === 'ALL') {
      return santriList;
    }
    if (bulkTargetMode === 'SINGLE') {
      const found = santriList.find(s => s.NIS === bulkSingleNIS);
      return found ? [found] : (santriList[0] ? [santriList[0]] : []);
    }
    // SELECTED mode:
    let list = santriList.filter(s => bulkSelectedNIS.includes(s.NIS));
    return list;
  }, [bulkTargetMode, santriList, bulkSelectedNIS, bulkSingleNIS]);

  // Unique halaqah list for filtering in bulk selection
  const halaqahOptions = useMemo(() => {
    const set = new Set<string>();
    santriList.forEach(s => {
      if (s.Halaqah) set.add(s.Halaqah);
    });
    return Array.from(set);
  }, [santriList]);

  // Filtered santri when in 'SELECTED' mode picker
  const filteredSantriForPicker = useMemo(() => {
    return santriList.filter(s => {
      if (bulkFilterHalaqah !== 'ALL' && s.Halaqah !== bulkFilterHalaqah) {
        return false;
      }
      if (bulkSearchSantri.trim()) {
        const q = bulkSearchSantri.toLowerCase();
        const matchName = s.Nama_Lengkap.toLowerCase().includes(q);
        const matchNIS = s.NIS.toLowerCase().includes(q);
        if (!matchName && !matchNIS) return false;
      }
      return true;
    });
  }, [santriList, bulkFilterHalaqah, bulkSearchSantri]);

  // Real-time calculation of total nominal and santri balance simulation
  const bulkCalculation = useMemo(() => {
    const nominalEach = Number(bulkNominalSeragam.replace(/\D/g, '')) || 0;
    let totalNominal = 0;
    let countCukup = 0;
    let countKurang = 0;

    const santriSimulations = targetedSantriList.map((santri) => {
      const summary = getSanguSummaryForSantri(santri.NIS);
      const nominal = bulkNominalMode === 'SERAGAM' 
        ? nominalEach 
        : (bulkCustomNominals[santri.NIS] !== undefined ? bulkCustomNominals[santri.NIS] : nominalEach);
      
      totalNominal += nominal;
      const sisaSaldo = summary.saldo - nominal;
      const isEnough = summary.saldo >= nominal;

      if (isEnough) {
        countCukup++;
      } else {
        countKurang++;
      }

      return {
        santri,
        saldoAwal: summary.saldo,
        nominal,
        sisaSaldo,
        isEnough
      };
    });

    return {
      targetedCount: targetedSantriList.length,
      nominalEach,
      totalNominal,
      countCukup,
      countKurang,
      santriSimulations
    };
  }, [targetedSantriList, bulkNominalMode, bulkNominalSeragam, bulkCustomNominals, getSanguSummaryForSantri]);

  // Helper to toggle santri selection
  const handleToggleSantri = (nis: string) => {
    setBulkSelectedNIS(prev => 
      prev.includes(nis) ? prev.filter(id => id !== nis) : [...prev, nis]
    );
  };

  // Select all visible santri in picker
  const handleSelectAllVisibleSantri = () => {
    const newNisSet = new Set(bulkSelectedNIS);
    filteredSantriForPicker.forEach(s => newNisSet.add(s.NIS));
    setBulkSelectedNIS(Array.from(newNisSet));
  };

  // Deselect all visible santri in picker
  const handleDeselectAllVisibleSantri = () => {
    const visibleNisSet = new Set(filteredSantriForPicker.map(s => s.NIS));
    setBulkSelectedNIS(prev => prev.filter(id => !visibleNisSet.has(id)));
  };

  // Quick preset application
  const handleApplyPreset = (preset: {
    kategori: string;
    nominal: number;
    keterangan: string;
  }) => {
    setBulkKategori(preset.kategori);
    setBulkNominalSeragam(preset.nominal.toString());
    setBulkKeterangan(preset.keterangan);
    showToast(`Preset "${preset.keterangan}" diterapkan: Rp ${preset.nominal.toLocaleString('id-ID')} / santri`, 'info');
  };

  // Execute bulk transaction creation
  const handleExecuteBulkPengeluaran = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (targetedSantriList.length === 0) {
      showToast('Pilih minimal 1 santri untuk menerapkan pengeluaran.', 'error');
      return;
    }

    const nominalEach = Number(bulkNominalSeragam.replace(/\D/g, '')) || 0;
    if (bulkNominalMode === 'SERAGAM' && nominalEach <= 0) {
      showToast('Nominal pengeluaran harus lebih besar dari Rp 0.', 'error');
      return;
    }

    const txToCreate: SanguTransaksi[] = [];
    const batchId = `BATCH_${Date.now()}`;
    const timeNow = bulkWaktu || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    for (const sim of bulkCalculation.santriSimulations) {
      if (sim.nominal <= 0) continue;
      
      // If negative balance is disallowed and balance is not enough, skip
      if (!bulkAllowNegative && !sim.isEnough) {
        continue;
      }

      txToCreate.push({
        id: `SNG_${Date.now()}_${sim.santri.NIS}_${Math.random().toString(36).substring(2, 6)}`,
        NIS: sim.santri.NIS,
        namaSantri: sim.santri.Nama_Lengkap,
        tanggal: bulkTanggal,
        waktu: timeNow,
        tipe: 'Pengeluaran',
        kategori: bulkKategori,
        nominal: sim.nominal,
        keterangan: `${bulkKeterangan} (${bulkTargetMode === 'ALL' ? 'Seluruh Santri' : `${targetedSantriList.length} Santri`})`,
        metode: bulkMetode,
        petugas: currentUser?.nama || 'Admin RTQ',
        nomorStruk: `STRUK-B${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${sim.santri.NIS.slice(-3)}`,
        batchId,
        batchTitle: bulkKeterangan
      });
    }

    if (txToCreate.length === 0) {
      showToast('Tidak ada transaksi yang dapat diproses (periksa pengaturan saldo atau santri).', 'warning');
      return;
    }

    const res = addBulkSanguTransaksi(txToCreate, bulkKeterangan);
    if (res.success) {
      setBulkSuccessSummary({
        count: res.count,
        totalNominal: res.totalNominal,
        batchTitle: bulkKeterangan,
        items: txToCreate,
        tanggal: bulkTanggal,
        kategori: bulkKategori
      });
      setIsBulkSuccessModalOpen(true);
      setIsBulkPengeluaranModalOpen(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nomor Struk', 'Tanggal', 'Waktu', 'NIS', 'Nama Santri', 'Tipe', 'Kategori', 'Nominal', 'Metode', 'Keterangan', 'Petugas'];
    const rows = filteredTransactions.map(t => [
      `"${t.nomorStruk || '-'}"`,
      `"${t.tanggal}"`,
      `"${t.waktu || '-'}"`,
      `"${t.NIS}"`,
      `"${t.namaSantri}"`,
      `"${t.tipe}"`,
      `"${t.kategori}"`,
      t.nominal,
      `"${t.metode}"`,
      `"${(t.keterangan || '').replace(/"/g, '""')}"`,
      `"${t.petugas || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Sangu_Santri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan keuangan sangu berhasil diekspor ke CSV!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden canvas for QR video decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl text-white p-6 sm:p-7 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-6 pointer-events-none">
          <Wallet className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-600/60">
              <Coins className="w-3.5 h-3.5 text-yellow-300" />
              <span>Sistem Manajemen Keuangan & Kas Sangu Santri</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isWali && linkedSantri ? `Sangu Santri: ${linkedSantri.Nama_Lengkap}` : 'Sangu Santri & QR Belanja'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              {isWali
                ? 'Pantau saldo uang saku anak secara transparan, mutasi titipan uang masuk, dan rincian belanja santri di koperasi/kantin pesantren.'
                : 'Pencatatan keuangan uang saku, pengeluaran santri, dan sistem transaksi cepat QR Code untuk koperasi & kantin RTQ Cendikia BAZNAS.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAdminOrPengajar && (
              <>
                <button
                  id="btn-pindai-qr-main"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <ScanLine className="w-4 h-4 text-emerald-950" />
                  <span>Pindai QR Belanja</span>
                </button>

                <button
                  id="btn-lihat-qr-katalog"
                  onClick={() => {
                    setActiveTab('katalog');
                    if (barangKoperasiList.length > 0) {
                      setSelectedBarangForQR(barangKoperasiList[0]);
                      setIsViewQRModalOpen(true);
                    }
                  }}
                  className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs border border-emerald-600/80 shadow-xs transition flex items-center space-x-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-yellow-300" />
                  <span>Lihat QR Barang</span>
                </button>

                <button
                  id="btn-atur-pengeluaran-santri"
                  onClick={() => {
                    setActiveTab('atur-pengeluaran');
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-yellow-200" />
                  <span>⚡ Atur Pengeluaran Santri</span>
                </button>

                <button
                  id="btn-catat-pemasukan"
                  onClick={() => {
                    setManualType('Pemasukan');
                    setFormKategori('Titipan Uang Saku');
                    setIsManualModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Pemasukan</span>
                </button>

                <button
                  id="btn-catat-pengeluaran"
                  onClick={() => {
                    setManualType('Pengeluaran');
                    setFormKategori('Belanja Kebutuhan');
                    setIsManualModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>- Pengeluaran</span>
                </button>
              </>
            )}

            {isWali && (
              <button
                id="btn-topup-guide-wali"
                onClick={() => setIsTopupGuideOpen(true)}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-950" />
                <span>Titip Sangu / Topup Uang Saku</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Akhir */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 transition group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {isWali ? 'Sisa Saldo Sangu' : (selectedNIS !== 'ALL' ? 'Saldo Sangu Santri' : 'Total Saldo Kas Sangu')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-2xl font-black ${stats.saldoAkhir >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            Rp {stats.saldoAkhir.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{stats.saldoAkhir >= 0 ? 'Saldo Tersedia & Siap Digunakan' : 'Perlu Topup / Pengisian Uang Saku'}</span>
          </p>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Pemasukan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            Rp {stats.totalPemasukan.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Titipan uang masuk tercatat</span>
          </p>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-rose-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-700">
            Rp {stats.totalPengeluaran.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>Belanja koperasi & kebutuhan</span>
          </p>
        </div>

        {/* Card 4: Transaksi QR Belanja */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Transaksi Belanja QR
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-110 transition">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-900">
            {stats.qrTransactionsCount} <span className="text-xs font-normal text-gray-500">transaksi</span>
          </h3>
          <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Otomatis potong saldo</span>
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
          {/* Sub Tab Navigation */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'transaksi'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Riwayat Transaksi ({filteredTransactions.length})</span>
            </button>

            {isAdminOrPengajar && (
              <>
                <button
                  id="tab-atur-pengeluaran-santri"
                  onClick={() => setActiveTab('atur-pengeluaran')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'atur-pengeluaran'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-600" />
                  <span>⚡ Atur Pengeluaran Santri</span>
                </button>

                <button
                  onClick={() => setActiveTab('katalog')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'katalog'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Katalog & QR Barang ({barangKoperasiList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rekap')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'rekap'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rekap Saldo Seluruh Santri</span>
                </button>
              </>
            )}
          </div>

          {/* Action buttons (Cetak & Export) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Download File CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        {activeTab === 'transaksi' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* Santri Selector (Admin only) */}
            {isAdminOrPengajar && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Filter Santri</label>
                <select
                  value={selectedNIS}
                  onChange={(e) => setSelectedNIS(e.target.value)}
                  className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                >
                  <option value="ALL">Semua Santri ({santriList.length})</option>
                  {santriList.map((s) => (
                    <option key={s.NIS} value={s.NIS}>
                      {s.Nama_Lengkap} ({s.NIS})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tipe Transaksi */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Tipe Mutasi</label>
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value as any)}
                className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
              >
                <option value="ALL">Semua Tipe (Pemasukan & Pengeluaran)</option>
                <option value="Pemasukan">Pemasukan Saja (Titipan / Topup)</option>
                <option value="Pengeluaran">Pengeluaran Saja (Belanja / Tarik)</option>
              </select>
            </div>

            {/* Filter Metode */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Metode</label>
              <select
                value={filterMetode}
                onChange={(e) => setFilterMetode(e.target.value)}
                className="w-full text-xs p-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
              >
                <option value="ALL">Semua Metode</option>
                <option value="QR Pembelian">QR Pembelian (Kantin/Koperasi)</option>
                <option value="Tunai">Tunai / Cash</option>
                <option value="Transfer Bank">Transfer Bank (Rekening BAZNAS)</option>
                <option value="Potong Saldo">Potong Saldo Manual</option>
              </select>
            </div>

            {/* Search Input */}
            <div className={isAdminOrPengajar ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Pencarian</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri, nomor struk, nama barang, keterangan..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RIWAYAT TRANSAKSI                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'transaksi' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Buku Kas & Riwayat Transaksi Sangu</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan <strong>{filteredTransactions.length}</strong> catatan transaksi berdasarkan urutan tanggal terbaru.
              </p>
            </div>

            {targetSantri && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Santri Terpilih: <strong>{targetSantri.Nama_Lengkap}</strong></span>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No & Tanggal</th>
                  <th className="py-3 px-4">No. Struk / ID</th>
                  <th className="py-3 px-4">Santri</th>
                  <th className="py-3 px-4">Tipe & Kategori</th>
                  <th className="py-3 px-4">Keterangan & Rincian Barang</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Metode</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Wallet className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-500">Belum ada catatan transaksi sangu.</p>
                        <p className="text-xs text-gray-400">Gunakan tombol di atas untuk mencatat pemasukan atau scan QR belanja.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item, idx) => {
                    const isIncome = item.tipe === 'Pemasukan';
                    return (
                      <tr key={item.id} className="hover:bg-emerald-50/40 transition">
                        {/* Tanggal & Waktu */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{item.tanggal}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{item.waktu || '08:00'}</span>
                          </div>
                        </td>

                        {/* Nomor Struk */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-gray-600">
                          {item.nomorStruk ? (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 border border-gray-200">
                              {item.nomorStruk}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Santri */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{item.namaSantri}</div>
                          <div className="text-[10px] text-emerald-700 font-mono">NIS: {item.NIS}</div>
                        </td>

                        {/* Tipe & Kategori */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                            <span>{item.tipe}</span>
                          </span>
                          <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{item.kategori}</div>
                        </td>

                        {/* Keterangan & Rincian Item QR */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed">{item.keterangan}</p>
                          {item.qrItems && item.qrItems.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.qrItems.map((qi, qidx) => (
                                <span
                                  key={qidx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium"
                                >
                                  <Package className="w-2.5 h-2.5 text-amber-700" />
                                  <span>{qi.namaBarang} ({qi.jumlah}x)</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Nominal */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`text-xs font-black ${
                              isIncome ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isIncome ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </td>

                        {/* Metode */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.isQRTransaction ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[10px] border border-amber-200">
                              <QrCode className="w-3 h-3 text-amber-700" />
                              <span>QR Belanja</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] border border-gray-200 font-medium">
                              {item.metode}
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedStruk(item);
                                setIsDetailStrukOpen(true);
                              }}
                              className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition"
                              title="Lihat Detail & Cetak Struk"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {isAdminOrPengajar && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus transaksi ${item.namaSantri} sebesar Rp ${item.nominal.toLocaleString('id-ID')}?`)) {
                                    deleteSanguTransaksi(item.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB ATUR PENGELUARAN SANTRI (BULK & INDIVIDUAL DEDUCTION)                 */}
      {/* ========================================================================= */}
      {activeTab === 'atur-pengeluaran' && isAdminOrPengajar && (
        <div className="space-y-5">
          {/* Header Banner with Presets */}
          <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-emerald-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-400/30 mb-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Fitur Pengelolaan Pengeluaran & Uang Jajan Massal</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Pengaturan Pengeluaran Santri
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mt-1 leading-relaxed">
                    Alokasikan dan potong pengeluaran uang saku secara otomatis untuk seluruh santri, per halaqah, atau santri tertentu dengan nominal seragam atau khusus.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBulkSelectedNIS(santriList.map(s => s.NIS));
                      setBulkTargetMode('ALL');
                      setBulkNominalMode('SERAGAM');
                      setBulkNominalSeragam('10000');
                    }}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xs border border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Formulir</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets Bar */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-yellow-200/90 uppercase tracking-wider block mb-2">
                  Template Cepat Pengeluaran:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🥪 Uang Jajan Harian (Rp 10.000)', kategori: 'Uang Jajan Harian', nominal: 10000, keterangan: 'Uang Saku Jajan Harian Santri' },
                    { label: '🍱 Jajan Siang/Sore (Rp 15.000)', kategori: 'Uang Jajan Harian', nominal: 15000, keterangan: 'Uang Jajan Ekstra Santri' },
                    { label: '📚 Kitab & Buku (Rp 50.000)', kategori: 'Pembelian Kitab & Buku', nominal: 50000, keterangan: 'Pembelian Kitab & Modul Tahfidz' },
                    { label: '🧺 Cuci Laundry (Rp 25.000)', kategori: 'Laundry & Kebersihan', nominal: 25000, keterangan: 'Tagihan Cuci Laundry Santri' },
                    { label: '✂️ Pangkas Rambut (Rp 15.000)', kategori: 'Kesehatan & Kebersihan', nominal: 15000, keterangan: 'Biaya Cukur & Kerapian Santri' },
                    { label: '🚌 Rihlah / Outing (Rp 35.000)', kategori: 'Kegiatan Santri', nominal: 35000, keterangan: 'Iuran Kegiatan Rihlah Santri' },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white hover:text-yellow-200 border border-white/20 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative background shape */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
              <Calculator className="w-80 h-80 text-white" />
            </div>
          </div>

          {/* Main Grid: Form Setup & Live Calculation Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Configuration Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span>1. Pengaturan Data Pengeluaran</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Target: {targetedSantriList.length} Santri
                </span>
              </div>

              {/* Target Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Target Penerapan Pengeluaran *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkTargetMode('ALL');
                      setBulkSelectedNIS(santriList.map(s => s.NIS));
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                      bulkTargetMode === 'ALL'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Semua Santri ({santriList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkTargetMode('SELECTED')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                      bulkTargetMode === 'SELECTED'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <ListChecks className="w-4 h-4" />
                    <span>Pilih Tertentu ({bulkSelectedNIS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkTargetMode('SINGLE')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                      bulkTargetMode === 'SINGLE'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>1 Santri Khusus</span>
                  </button>
                </div>
              </div>

              {/* Single Santri Selector (if SINGLE mode) */}
              {bulkTargetMode === 'SINGLE' && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-950">Pilih Santri *</label>
                  <select
                    value={bulkSingleNIS}
                    onChange={(e) => setBulkSingleNIS(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {santriList.map(s => (
                      <option key={s.NIS} value={s.NIS}>
                        {s.Nama_Lengkap} ({s.NIS}) &bull; {s.Halaqah} &bull; Saldo: Rp {getSanguSummaryForSantri(s.NIS).saldo.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategori & Nominal Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori Pengeluaran *
                  </label>
                  <select
                    value={bulkKategori}
                    onChange={(e) => setBulkKategori(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-amber-600 outline-none font-semibold"
                  >
                    <option value="Uang Jajan Harian">Uang Jajan Harian</option>
                    <option value="Belanja Koperasi">Belanja Koperasi</option>
                    <option value="Pembelian Kitab & Buku">Pembelian Kitab & Buku</option>
                    <option value="Laundry & Kebersihan">Laundry & Kebersihan</option>
                    <option value="Kesehatan & Kebersihan">Kesehatan & Kebersihan</option>
                    <option value="Kegiatan Santri">Kegiatan Santri</option>
                    <option value="Keperluan Asrama">Keperluan Asrama</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Metode Pemotongan *
                  </label>
                  <select
                    value={bulkMetode}
                    onChange={(e) => setBulkMetode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-amber-600 outline-none font-semibold"
                  >
                    <option value="Potong Saldo Kas">Potong Saldo Kas Santri</option>
                    <option value="Tunai Diserahkan">Tunai Langsung ke Santri</option>
                    <option value="Koperasi Pesantren">Koperasi Pesantren</option>
                  </select>
                </div>
              </div>

              {/* Nominal Mode (Seragam vs Kustom) */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Mode Besaran Nominal
                  </label>
                  <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setBulkNominalMode('SERAGAM')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        bulkNominalMode === 'SERAGAM'
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Nominal Seragam
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkNominalMode('CUSTOM')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        bulkNominalMode === 'CUSTOM'
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Kustom per Santri
                    </button>
                  </div>
                </div>

                {bulkNominalMode === 'SERAGAM' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Nominal per Santri (Rp) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={bulkNominalSeragam}
                        onChange={(e) => setBulkNominalSeragam(e.target.value)}
                        placeholder="10000"
                        min="1000"
                        step="500"
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-amber-600 outline-none text-base font-black text-amber-900"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                    💡 Mode Kustom aktif: Anda dapat mengedit nominal masing-masing santri secara langsung pada tabel simulasi di bawah.
                  </p>
                )}
              </div>

              {/* Tanggal, Waktu & Keterangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tanggal Transaksi *
                  </label>
                  <input
                    type="date"
                    value={bulkTanggal}
                    onChange={(e) => setBulkTanggal(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    value={bulkWaktu}
                    onChange={(e) => setBulkWaktu(e.target.value)}
                    placeholder="10:00"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-amber-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Keterangan / Nama Kegiatan Pengeluaran *
                </label>
                <input
                  type="text"
                  value={bulkKeterangan}
                  onChange={(e) => setBulkKeterangan(e.target.value)}
                  placeholder="Contoh: Pengeluaran Uang Saku Jajan Harian Santri"
                  required
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-amber-600 outline-none font-semibold text-gray-800"
                />
              </div>

              {/* Policy: Allow Negative Balances Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="pr-4">
                  <div className="text-xs font-bold text-gray-800">
                    Kebijakan Saldo Minus / Hutang Sementara
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {bulkAllowNegative
                      ? 'Santri dengan saldo tidak cukup tetap diproses (saldo menjadi minus/hutang saku).'
                      : 'Hanya santri dengan saldo mencukupi yang akan dipotong.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkAllowNegative(!bulkAllowNegative)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    bulkAllowNegative ? 'bg-amber-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      bulkAllowNegative ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Column: Live Simulation & Execution Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Live Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  <span>2. Ringkasan & Kalkulasi Live</span>
                </h3>

                <div className="space-y-3">
                  {/* Total Nominal Highlight */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      Total Dana Pengeluaran
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-0.5">
                      Rp {bulkCalculation.totalNominal.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-amber-800 mt-1 font-semibold flex items-center gap-1">
                      <span>Rata-rata: Rp {bulkCalculation.targetedCount > 0 ? Math.round(bulkCalculation.totalNominal / bulkCalculation.targetedCount).toLocaleString('id-ID') : 0} / santri</span>
                    </div>
                  </div>

                  {/* Summary Breakdown Metrics */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Santri Target</span>
                      <div className="text-lg font-black text-gray-900 mt-0.5">
                        {bulkCalculation.targetedCount} <span className="text-xs font-normal text-gray-500">santri</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">Saldo Mencukupi</span>
                      <div className="text-lg font-black text-emerald-900 mt-0.5">
                        {bulkCalculation.countCukup} <span className="text-xs font-normal text-emerald-700">santri</span>
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] text-rose-800 font-bold uppercase">Saldo Kurang / Minus</span>
                      <div className="text-lg font-black text-rose-900 mt-0.5">
                        {bulkCalculation.countKurang} <span className="text-xs font-normal text-rose-700">santri</span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-800 font-bold uppercase">Metode</span>
                      <div className="text-xs font-black text-blue-950 mt-1 truncate">
                        {bulkMetode}
                      </div>
                    </div>
                  </div>

                  {/* Notification Warning if some have low balance */}
                  {bulkCalculation.countKurang > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Terdapat <strong>{bulkCalculation.countKurang} santri</strong> dengan saldo kurang dari nominal yang ditentukan. {bulkAllowNegative ? 'Saldo mereka akan tercatat minus/hutang sementara.' : 'Mereka akan dilewati karena toggle saldo minus tidak aktif.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteBulkPengeluaran}
                    disabled={bulkCalculation.targetedCount === 0 || (bulkNominalMode === 'SERAGAM' && Number(bulkNominalSeragam) <= 0)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 hover:from-amber-500 hover:to-emerald-700 text-white font-black rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Terapkan Pengeluaran ({bulkCalculation.targetedCount} Santri)</span>
                  </button>
                  <p className="text-[10px] text-center text-gray-500 mt-2">
                    Riwayat mutasi pengeluaran dan struk akan otomatis dibuat untuk setiap santri.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Simulation Table (Santri Picker & Balance Matrix) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>3. Matriks Simulasi Saldo & Pemilihan Santri</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tinjau saldo awal, nominal pengeluaran yang diterapkan, dan sisa saldo setelah pemotongan.
                </p>
              </div>

              {/* Table Tools & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search in picker */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bulkSearchSantri}
                    onChange={(e) => setBulkSearchSantri(e.target.value)}
                    placeholder="Cari santri / NIS..."
                    className="text-xs pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg outline-none w-44"
                  />
                </div>

                {/* Halaqah Filter */}
                <select
                  value={bulkFilterHalaqah}
                  onChange={(e) => setBulkFilterHalaqah(e.target.value)}
                  className="text-xs py-1.5 px-2.5 bg-white border border-gray-300 rounded-lg outline-none font-semibold text-gray-700"
                >
                  <option value="ALL">Semua Halaqah</option>
                  {halaqahOptions.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                {/* Bulk Select/Deselect buttons if in SELECTED mode */}
                {bulkTargetMode === 'SELECTED' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSelectAllVisibleSantri}
                      className="text-[11px] font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllVisibleSantri}
                      className="text-[11px] font-bold px-2.5 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    >
                      Batal Pilih
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/80 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    {bulkTargetMode === 'SELECTED' && (
                      <th className="py-3 px-3 text-center w-10">Pilih</th>
                    )}
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-4">Nama Lengkap Santri</th>
                    <th className="py-3 px-4">Halaqah & Kelas</th>
                    <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                    <th className="py-3 px-4 text-right">Nominal Pengeluaran</th>
                    <th className="py-3 px-4 text-right">Proyeksi Sisa Saldo</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bulkCalculation.santriSimulations.length === 0 ? (
                    <tr>
                      <td colSpan={bulkTargetMode === 'SELECTED' ? 9 : 8} className="text-center py-10 text-gray-400">
                        Tidak ada santri yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    bulkCalculation.santriSimulations.map((sim, idx) => {
                      const isSelected = bulkSelectedNIS.includes(sim.santri.NIS);
                      return (
                        <tr
                          key={sim.santri.NIS}
                          className={`hover:bg-amber-50/40 transition ${
                            bulkTargetMode === 'SELECTED' && !isSelected ? 'opacity-40 bg-gray-50/50' : ''
                          }`}
                        >
                          {bulkTargetMode === 'SELECTED' && (
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSantri(sim.santri.NIS)}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-700">{sim.santri.NIS}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">{sim.santri.Nama_Lengkap}</div>
                            <div className="text-[10px] text-gray-500">Wali: {sim.santri.Nama_Wali}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-[11px]">
                              {sim.santri.Kelas} &bull; {sim.santri.Halaqah}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            Rp {sim.saldoAwal.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {bulkNominalMode === 'SERAGAM' ? (
                              <span className="font-black text-rose-700">
                                - Rp {sim.nominal.toLocaleString('id-ID')}
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                <span className="text-rose-700 font-bold">- Rp</span>
                                <input
                                  type="number"
                                  value={bulkCustomNominals[sim.santri.NIS] !== undefined ? bulkCustomNominals[sim.santri.NIS] : sim.nominal}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setBulkCustomNominals(prev => ({
                                      ...prev,
                                      [sim.santri.NIS]: val
                                    }));
                                  }}
                                  className="w-24 text-right p-1 text-xs bg-amber-50 border border-amber-300 rounded font-black text-rose-700 outline-none"
                                />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                sim.sisaSaldo >= 10000
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : sim.sisaSaldo >= 0
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              Rp {sim.sisaSaldo.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {sim.isEnough ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Saldo Cukup</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Saldo Kurang</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {activeTab === 'katalog' && isAdminOrPengajar && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-700" />
                <span>Katalog Barang Koperasi & Barcode/QR Belanja</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Kelola daftar produk, harga, stok, dan generate kode QR untuk pembelian cepat santri.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingBarang(null);
                  setBarangNama('');
                  setBarangHarga('');
                  setBarangStok('50');
                  setBarangDeskripsi('');
                  setIsBarangFormOpen(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Barang Baru</span>
              </button>
            </div>
          </div>

          {/* Grid Barang Koperasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {barangKoperasiList.map((barang) => (
              <div
                key={barang.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                      {barang.kategori}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {barang.kodeBarang}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-800 transition">
                      {barang.namaBarang}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {barang.deskripsi || 'Perlengkapan santri RTQ Cendikia'}
                    </p>
                  </div>

                  {/* QR Preview Mini */}
                  <div 
                    onClick={() => {
                      setSelectedBarangForQR(barang);
                      setIsViewQRModalOpen(true);
                    }}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50 transition group/qr"
                    title="Klik untuk memperbesar QR Code"
                  >
                    <QRCodeCanvas value={barang.kodeBarang} size={90} darkColor="#064e3b" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-gray-400">Harga Satuan</span>
                      <div className="text-base font-black text-emerald-700">
                        Rp {barang.harga.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400">Sisa Stok</span>
                      <div className={`text-xs font-bold ${barang.stok <= 5 ? 'text-rose-600' : 'text-gray-700'}`}>
                        {barang.stok} {barang.satuan || 'pcs'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="grid grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedBarangForQR(barang);
                      setIsViewQRModalOpen(true);
                    }}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditBarang(barang)}
                    className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus barang "${barang.namaBarang}" dari katalog?`)) {
                        deleteBarangKoperasi(barang.id);
                      }
                    }}
                    className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REKAP SALDO SELURUH SANTRI (Admin & Pengajar)                      */}
      {/* ========================================================================= */}
      {activeTab === 'rekap' && isAdminOrPengajar && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Rekap Saldo Uang Saku Seluruh Santri</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Pantau saldo aktif, total pemasukan, dan total belanja setiap santri secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('PERINGATAN: Apakah Anda yakin ingin MENGOSONGKAN SEMUA SALDO SANGU dan menghapus semua catatan mutasi transaksi sangu santri? Seluruh saldo santri akan kembali menjadi Rp 0.')) {
                    clearAllSanguTransaksi();
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Kosongkan semua saldo santri menjadi Rp 0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Semua Saldo</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Lengkap Santri</th>
                  <th className="py-3 px-4">Kelas & Halaqah</th>
                  <th className="py-3 px-4 text-right">Total Pemasukan</th>
                  <th className="py-3 px-4 text-right">Total Pengeluaran</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rekapPerSantri.map((santri, idx) => (
                  <tr key={santri.NIS} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-700">{santri.NIS}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{santri.Nama_Lengkap}</div>
                      <div className="text-[10px] text-gray-500">Wali: {santri.Nama_Wali} ({santri.WA_Wali})</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-[11px]">
                        {santri.Kelas} &bull; {santri.Halaqah}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      Rp {santri.totalPemasukan.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      Rp {santri.totalPengeluaran.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          santri.saldo >= 20000
                            ? 'bg-emerald-100 text-emerald-900'
                            : santri.saldo > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        Rp {santri.saldo.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedNIS(santri.NIS);
                          setActiveTab('transaksi');
                        }}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Lihat Mutasi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SCANNER KAMERA QR BELANJA                                       */}
      {/* ========================================================================= */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Scanner QR Pembelian Barang</h3>
                  <p className="text-[10px] text-emerald-200">Arahkan kamera ke QR Code Barang Koperasi atau Kartu Santri</p>
                </div>
              </div>
              <button
                onClick={() => setIsQRScannerOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewport */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[340px]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover min-h-[300px]"
                autoPlay
                muted
                playsInline
              />

              {/* Laser Scanning Overlay Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow-400 -mt-1 -ml-1 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow-400 -mt-1 -mr-1 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow-400 -mb-1 -ml-1 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow-400 -mb-1 -mr-1 rounded-br-lg" />

                  {/* Animated scanning bar */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent absolute animate-bounce" style={{ top: '45%' }} />
                </div>
              </div>

              {/* Error overlay if camera blocked */}
              {scannerError && (
                <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-3 z-20">
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
                  <p className="text-xs text-gray-200 max-w-xs leading-relaxed">{scannerError}</p>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="flex-1 py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ganti Kamera</span>
                </button>

                <label className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Foto QR</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadQRFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Select Barang Fallback */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Atau Pilih Cepat Barang dari Katalog:
                </label>
                <select
                  onChange={(e) => {
                    const found = barangKoperasiList.find(b => b.kodeBarang === e.target.value);
                    if (found) {
                      handleDecodedQR(found.kodeBarang);
                    }
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-xl outline-none"
                >
                  <option value="" disabled>-- Pilih Barang Manual --</option>
                  {barangKoperasiList.map(b => (
                    <option key={b.id} value={b.kodeBarang}>
                      {b.namaBarang} - Rp {b.harga.toLocaleString('id-ID')} (Stok: {b.stok})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI PEMBELIAN SETELAH SCAN QR                             */}
      {/* ========================================================================= */}
      {isPurchaseConfirmOpen && scannedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Konfirmasi Pembelian QR</h3>
                  <p className="text-[11px] text-emerald-200">Sistem akan otomatis memotong saldo sangu santri</p>
                </div>
              </div>
              <button
                onClick={() => setIsPurchaseConfirmOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Product Info Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-200/70 text-emerald-900 font-bold rounded text-[10px]">
                      {scannedItem.kategori}
                    </span>
                    <h4 className="font-extrabold text-base text-gray-900 mt-1">
                      {scannedItem.namaBarang}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500">Harga Satuan</span>
                    <div className="text-sm font-black text-emerald-800">
                      Rp {scannedItem.harga.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Jumlah Beli (Qty):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 flex items-center justify-center hover:bg-gray-100 active:scale-95"
                    >
                      -
                    </button>
                    <span className="font-black text-sm text-gray-900 w-8 text-center">{purchaseQty}</span>
                    <button
                      type="button"
                      onClick={() => setPurchaseQty(purchaseQty + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 flex items-center justify-center hover:bg-gray-100 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Belanja */}
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">Total Harga:</span>
                  <span className="font-black text-base text-emerald-900">
                    Rp {(scannedItem.harga * purchaseQty).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Santri Buyer Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Santri Pembeli</label>
                <select
                  value={purchaseBuyerNIS}
                  onChange={(e) => setPurchaseBuyerNIS(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:bg-white focus:border-emerald-600 outline-none"
                >
                  {santriList.map((s) => {
                    const sm = getSanguSummaryForSantri(s.NIS);
                    return (
                      <option key={s.NIS} value={s.NIS}>
                        {s.Nama_Lengkap} (Saldo: Rp {sm.saldo.toLocaleString('id-ID')})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Saldo Check Box */}
              {(() => {
                const buyerSummary = getSanguSummaryForSantri(purchaseBuyerNIS);
                const totalDue = scannedItem.harga * purchaseQty;
                const isEnough = buyerSummary.saldo >= totalDue;
                const sisa = buyerSummary.saldo - totalDue;

                return (
                  <div className={`p-3.5 rounded-xl border ${isEnough ? 'bg-gray-50 border-gray-200' : 'bg-rose-50 border-rose-200'} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Saldo Santri Saat Ini:</span>
                      <span className="font-bold text-gray-900">Rp {buyerSummary.saldo.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Belanja:</span>
                      <span className="font-bold text-rose-600">- Rp {totalDue.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-200 flex items-center justify-between font-bold">
                      <span className={isEnough ? 'text-emerald-800' : 'text-rose-700'}>
                        {isEnough ? 'Sisa Saldo Setelah Belanja:' : 'Kekurangan Saldo:'}
                      </span>
                      <span className={`text-sm font-black ${isEnough ? 'text-emerald-700' : 'text-rose-700'}`}>
                        Rp {Math.abs(sisa).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {!isEnough && (
                      <p className="text-[11px] text-rose-600 font-semibold pt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Saldo sangu tidak mencukupi untuk transaksi ini.</span>
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Notes */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan / Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  placeholder="Contoh: Belanja sore hari, alat tulis hafalan..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPurchaseConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQRPurchase}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Proses Belanja</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LIHAT & CETAK QR CODE BARANG                                     */}
      {/* ========================================================================= */}
      {isViewQRModalOpen && selectedBarangForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 text-center">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200">Kartu QR Barang Koperasi</span>
              <button
                onClick={() => setIsViewQRModalOpen(false)}
                className="p-1 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable QR Card */}
            <div id="printable-qr-card" className="p-6 space-y-4 bg-white">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                  RTQ Cendikia Koperasi
                </span>
                <h3 className="text-lg font-black text-gray-900">{selectedBarangForQR.namaBarang}</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedBarangForQR.kodeBarang}</p>
              </div>

              {/* QR Image Canvas */}
              <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
                <QRCodeCanvas
                  value={selectedBarangForQR.kodeBarang}
                  size={180}
                  darkColor="#064e3b"
                />
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                <div className="text-[11px] text-gray-500">Harga Resmi</div>
                <div className="text-xl font-black text-emerald-900">
                  Rp {selectedBarangForQR.harga.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label QR</span>
              </button>
              <button
                onClick={() => setIsViewQRModalOpen(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CATAT TRANSAKSI MANUAL (Pemasukan / Pengeluaran)                  */}
      {/* ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div
              className={`p-5 text-white flex items-center justify-between ${
                manualType === 'Pemasukan'
                  ? 'bg-gradient-to-r from-emerald-900 to-teal-900'
                  : 'bg-gradient-to-r from-rose-900 to-red-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                    manualType === 'Pemasukan' ? 'bg-yellow-400 text-emerald-950' : 'bg-white text-rose-950'
                  }`}
                >
                  {manualType === 'Pemasukan' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {manualType === 'Pemasukan' ? 'Catat Pemasukan Sangu' : 'Catat Pengeluaran Sangu'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {manualType === 'Pemasukan' ? 'Titipan uang saku dari wali santri / beasiswa' : 'Pengeluaran tunai / belanja khusus'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualTransaction} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Santri Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Santri *</label>
                <select
                  value={formNIS}
                  onChange={(e) => setFormNIS(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                >
                  {santriList.map((s) => {
                    const sm = getSanguSummaryForSantri(s.NIS);
                    return (
                      <option key={s.NIS} value={s.NIS}>
                        {s.Nama_Lengkap} ({s.NIS}) - Saldo: Rp {sm.saldo.toLocaleString('id-ID')}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tanggal & Nominal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value)}
                    placeholder="Contoh: 50000"
                    required
                    min="1000"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Kategori & Metode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori Transaksi</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    {manualType === 'Pemasukan' ? (
                      <>
                        <option value="Titipan Uang Saku">Titipan Uang Saku</option>
                        <option value="Topup Saldo">Topup Saldo</option>
                        <option value="Beasiswa BAZNAS">Beasiswa BAZNAS</option>
                        <option value="Uang Saku Bulanan">Uang Saku Bulanan</option>
                        <option value="Hadiah / Prestasi">Hadiah / Prestasi</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Belanja Kebutuhan">Belanja Kebutuhan</option>
                        <option value="Koperasi Pesantren">Koperasi Pesantren</option>
                        <option value="Obat & Kesehatan">Obat & Kesehatan</option>
                        <option value="Perlengkapan Belajar">Perlengkapan Belajar</option>
                        <option value="Laundry & Mandi">Laundry & Mandi</option>
                        <option value="Penarikan Tunai">Penarikan Tunai</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={formMetode}
                    onChange={(e) => setFormMetode(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="Tunai">Tunai / Cash</option>
                    <option value="Transfer Bank">Transfer Bank (BAZNAS)</option>
                    <option value="Potong Saldo">Potong Saldo</option>
                  </select>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Keterangan / Rincian Tujuan</label>
                <textarea
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Catatan tujuan transaksi, peruntukan dana..."
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-black shadow-md ${
                    manualType === 'Pemasukan'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETAIL STRUK / KWITANSI TRANSAKSI                                */}
      {/* ========================================================================= */}
      {isDetailStrukOpen && selectedStruk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200">Struk / Bukti Transaksi Sangu</span>
              <button
                onClick={() => setIsDetailStrukOpen(false)}
                className="p-1 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Struk Card */}
            <div className="p-6 bg-white space-y-4 font-mono text-xs text-gray-800 border-b border-dashed border-gray-300">
              <div className="text-center space-y-1 pb-3 border-b border-gray-200">
                <h4 className="font-extrabold text-sm text-emerald-950 font-sans">RTQ CENDIKIA BAZNAS</h4>
                <p className="text-[10px] text-gray-500 font-sans">Masjid Agung Darussalam</p>
                <p className="text-[10px] text-gray-400 font-sans">Struk Pembayaran / Mutasi Sangu</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Struk:</span>
                  <span className="font-bold">{selectedStruk.nomorStruk || selectedStruk.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal:</span>
                  <span>{selectedStruk.tanggal} {selectedStruk.waktu || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Santri:</span>
                  <span className="font-bold">{selectedStruk.namaSantri}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NIS:</span>
                  <span>{selectedStruk.NIS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe / Metode:</span>
                  <span className="font-semibold">{selectedStruk.tipe} ({selectedStruk.metode})</span>
                </div>
              </div>

              {/* Item details if QR */}
              {selectedStruk.qrItems && selectedStruk.qrItems.length > 0 && (
                <div className="py-2 border-t border-b border-dashed border-gray-300 space-y-1.5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Daftar Barang Belanja:</div>
                  {selectedStruk.qrItems.map((qi, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{qi.namaBarang} x{qi.jumlah}</span>
                      <span className="font-bold">Rp {(qi.total || (qi.harga * qi.jumlah)).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-gray-300 font-sans">
                <span>TOTAL:</span>
                <span className={selectedStruk.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}>
                  Rp {selectedStruk.nominal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="text-center text-[10px] text-gray-400 pt-2 font-sans">
                Petugas: {selectedStruk.petugas || 'Admin RTQ'}<br />
                Keterangan: {selectedStruk.keterangan}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex items-center space-x-2">
              <button
                onClick={handlePrintStruk}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setIsDetailStrukOpen(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: FORM TAMBAH / EDIT BARANG KOPERASI                               */}
      {/* ========================================================================= */}
      {isBarangFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingBarang ? 'Edit Barang Koperasi' : 'Tambah Barang Baru'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">Katalog barang belanja kantin & koperasi santri</p>
                </div>
              </div>
              <button
                onClick={() => setIsBarangFormOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBarangKoperasi} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  value={barangNama}
                  onChange={(e) => setBarangNama(e.target.value)}
                  placeholder="Contoh: Roti Manis, Sabun Mandi, Buku Tulis..."
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none font-semibold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={barangKategori}
                    onChange={(e) => setBarangKategori(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="Makanan & Minuman">Makanan & Minuman</option>
                    <option value="Alat Tulis & Buku">Alat Tulis & Buku</option>
                    <option value="Perlengkapan Mandi">Perlengkapan Mandi</option>
                    <option value="Seragam & Pakaian">Seragam & Pakaian</option>
                    <option value="Obat-obatan">Obat-obatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    value={barangHarga}
                    onChange={(e) => setBarangHarga(e.target.value)}
                    placeholder="Contoh: 5000"
                    required
                    min="100"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={barangStok}
                    onChange={(e) => setBarangStok(e.target.value)}
                    min="0"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={barangSatuan}
                    onChange={(e) => setBarangSatuan(e.target.value)}
                    placeholder="pcs, botol, pack, buah..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Deskripsi / Catatan Barang</label>
                <textarea
                  value={barangDeskripsi}
                  onChange={(e) => setBarangDeskripsi(e.target.value)}
                  placeholder="Keterangan merk, rasa, atau spesifikasi barang..."
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBarangFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black shadow-md"
                >
                  {editingBarang ? 'Simpan Perubahan' : 'Tambah ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: PANDUAN TITIP SANGU / TOPUP UNTUK WALI SANTRI                    */}
      {/* ========================================================================= */}
      {isTopupGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Panduan Titip Uang Saku</h3>
                  <p className="text-[11px] text-emerald-200">Transfer rekening resmi kas pengurus pesantren</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopupGuideOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <p className="text-emerald-900 font-semibold leading-relaxed">
                  Bapak/Ibu Wali Santri dapat menitipkan uang saku ananda melalui rekening resmi bendahara pesantren:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Bank Syariah Indonesia (BSI)</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Rekening Resmi</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium">Atas Nama (A.N.):</div>
                  <div className="text-sm font-black text-gray-900">Sri Siti Khafsoh</div>
                  <div className="text-lg font-black font-mono text-emerald-800 select-all pt-0.5">
                    7220983708
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Langkah Konfirmasi:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1 leading-relaxed">
                  <li>Transfer nominal uang saku ke nomor rekening di atas.</li>
                  <li>Kirim foto/screenshot bukti transfer melalui WhatsApp ke Ustadzah Sri Siti Khafsoh.</li>
                  <li>Admin/Bendahara akan mencatat uang masuk ke saldo sangu ananda.</li>
                  <li>Saldo otomatis terupdate di akun wali dan dapat digunakan belanja via QR.</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <a
                  href={`https://wa.me/6285388959293?text=${encodeURIComponent(
                    `Assalamu'alaikum Bu Sri Siti Khafsoh, saya ingin konfirmasi titip uang saku / topup sangu untuk ananda ${
                      linkedSantri?.Nama_Lengkap || 'Santri'
                    } (NIS: ${linkedSantri?.NIS || '-'}). Bukti transfer terlampir.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4 text-yellow-300" />
                  <span>Konfirmasi via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsTopupGuideOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: RINGKASAN & STRUK PENGELUARAN MASSAL                             */}
      {/* ========================================================================= */}
      {isBulkSuccessModalOpen && bulkSuccessSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Pengeluaran Berhasil Diterapkan!</h3>
                  <p className="text-[11px] text-amber-200">
                    {bulkSuccessSummary.count} Santri &bull; Total: Rp {bulkSuccessSummary.totalNominal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkSuccessModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Nama Kegiatan / Pengeluaran
                  </span>
                  <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 font-bold rounded text-[10px]">
                    {bulkSuccessSummary.kategori}
                  </span>
                </div>
                <div className="text-base font-black text-gray-900">
                  {bulkSuccessSummary.batchTitle}
                </div>
                <div className="text-xs text-gray-600 flex items-center justify-between pt-1 border-t border-amber-200/50">
                  <span>Tanggal: {bulkSuccessSummary.tanggal}</span>
                  <span className="font-bold text-emerald-800">
                    Total Dana: Rp {bulkSuccessSummary.totalNominal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center justify-between">
                  <span>Daftar Santri Terproses ({bulkSuccessSummary.items.length}):</span>
                  <span className="text-[10px] text-gray-400 font-normal">Mutasi tersimpan ke buku kas</span>
                </h4>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
                  {bulkSuccessSummary.items.map((item, idx) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-white transition">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-[10px] w-5">{idx + 1}.</span>
                        <div>
                          <div className="font-bold text-gray-900">{item.namaSantri}</div>
                          <div className="text-[10px] text-gray-400 font-mono">NIS: {item.NIS} &bull; Struk: {item.nomorStruk}</div>
                        </div>
                      </div>
                      <div className="font-black text-rose-700 text-xs">
                        - Rp {item.nominal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Semua transaksi telah dicatat dalam riwayat mutasi buku kas santri dan saldo setiap santri otomatis disesuaikan secara real-time.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-300" />
                  <span>Cetak Rekap / Struk Massal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsBulkSuccessModalOpen(false);
                    setActiveTab('transaksi');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Lihat di Riwayat Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
