import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdministrasiSPP } from '../types';
import { 
  Plus, 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Printer,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Building,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const AdministrasiView: React.FC = () => {
  const { 
    santriList, 
    sppList, 
    addSPP, 
    updateSPP, 
    deleteSPP, 
    clearAllSPP, 
    currentUser, 
    showToast 
  } = useApp();

  // State Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<AdministrasiSPP | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<AdministrasiSPP | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterBulan, setFilterBulan] = useState<string>('Semua');

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
    const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh Pak Suwasno,\n\nSaya ingin konfirmasi terkait penerimaan SPP / Infaq RTQ Cendikia BAZNAS ke rekening BRI (012901044008503).\n\nTerima kasih.`;
    const waUrl = `https://wa.me/6281367009740?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Form State
  const [formData, setFormData] = useState<Partial<AdministrasiSPP>>({
    Tanggal_Bayar: new Date().toISOString().split('T')[0],
    NIS: '',
    Bulan: 'Agustus',
    Tahun: '2026',
    Jumlah_Bayar: 150000,
    Metode: 'Transfer Bank BRI',
    Status_Bayar: 'Lunas',
    Nomor_Kwitansi: '',
    Petugas: currentUser?.nama || 'Ustadzah Siti Aminah',
    Catatan: 'Infaq SPP Bulanan'
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      Tanggal_Bayar: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Bulan: 'Agustus',
      Tahun: '2026',
      Jumlah_Bayar: 150000,
      Metode: 'Transfer Bank BRI',
      Status_Bayar: 'Lunas',
      Nomor_Kwitansi: '',
      Petugas: currentUser?.nama || 'Ustadzah Siti Aminah',
      Catatan: 'Infaq SPP Bulanan'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spp: AdministrasiSPP) => {
    setModalMode('edit');
    setEditingId(spp.id);
    setFormData({
      Tanggal_Bayar: spp.Tanggal_Bayar,
      NIS: spp.NIS,
      Bulan: spp.Bulan,
      Tahun: spp.Tahun,
      Jumlah_Bayar: spp.Jumlah_Bayar,
      Metode: spp.Metode,
      Status_Bayar: spp.Status_Bayar,
      Nomor_Kwitansi: spp.Nomor_Kwitansi,
      Petugas: spp.Petugas,
      Catatan: spp.Catatan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) {
      showToast('Silakan pilih santri terlebih dahulu.', 'error');
      return;
    }

    if (modalMode === 'add') {
      const noKwitansi = formData.Nomor_Kwitansi && formData.Nomor_Kwitansi.trim() !== ''
        ? formData.Nomor_Kwitansi.trim()
        : `KW/RTQ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(sppList.length + 1).padStart(3, '0')}`;

      addSPP({
        id: 'SPP_' + Date.now(),
        Tanggal_Bayar: formData.Tanggal_Bayar || new Date().toISOString().split('T')[0],
        NIS: formData.NIS,
        Bulan: formData.Bulan || 'Agustus',
        Tahun: formData.Tahun || '2026',
        Jumlah_Bayar: Number(formData.Jumlah_Bayar) || 0,
        Metode: (formData.Metode as any) || 'Transfer Bank BRI',
        Status_Bayar: (formData.Status_Bayar as any) || 'Lunas',
        Nomor_Kwitansi: noKwitansi,
        Petugas: formData.Petugas || currentUser?.nama || 'Petugas Administrasi',
        Catatan: formData.Catatan || 'Infaq SPP'
      });
    } else if (modalMode === 'edit' && editingId) {
      updateSPP(editingId, {
        Tanggal_Bayar: formData.Tanggal_Bayar,
        NIS: formData.NIS,
        Bulan: formData.Bulan,
        Tahun: formData.Tahun,
        Jumlah_Bayar: Number(formData.Jumlah_Bayar) || 0,
        Metode: formData.Metode as any,
        Status_Bayar: formData.Status_Bayar as any,
        Nomor_Kwitansi: formData.Nomor_Kwitansi,
        Petugas: formData.Petugas,
        Catatan: formData.Catatan
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingRecord) {
      deleteSPP(deletingRecord.id);
      setDeletingRecord(null);
    }
  };

  const handleConfirmClearAll = () => {
    clearAllSPP();
    setIsClearAllModalOpen(false);
  };

  // Filtered SPP list
  const filteredSPPList = useMemo(() => {
    return sppList.filter(spp => {
      const santri = santriList.find(st => st.NIS === spp.NIS);
      const nama = santri?.Nama_Lengkap?.toLowerCase() || '';
      const nis = spp.NIS.toLowerCase();
      const kwitansi = spp.Nomor_Kwitansi.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchQuery = !query || nama.includes(query) || nis.includes(query) || kwitansi.includes(query);
      const matchStatus = filterStatus === 'Semua' || spp.Status_Bayar === filterStatus;
      const matchBulan = filterBulan === 'Semua' || spp.Bulan === filterBulan;

      return matchQuery && matchStatus && matchBulan;
    });
  }, [sppList, santriList, searchQuery, filterStatus, filterBulan]);

  const totalInfaq = sppList
    .filter(s => s.Status_Bayar === 'Lunas')
    .reduce((acc, curr) => acc + curr.Jumlah_Bayar, 0);

  const beasiswaCount = sppList.filter(s => s.Status_Bayar === 'Beasiswa BAZNAS').length;
  const belumLunasCount = sppList.filter(s => s.Status_Bayar === 'Belum Lunas').length;

  return (
    <div id="section-administrasi-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Administrasi, Infaq & Beasiswa BAZNAS</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore onSnapshot Aktif</span>
            </span>
          </div>
          <p className="text-xs text-gray-500">Pencatatan real-time multi-device: data otomatis sinkron instan tanpa perlu refresh halaman</p>
        </div>
        <div className="flex items-center gap-2">
          {sppList.length > 0 && (
            <button
              id="btn-clear-all-spp"
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Kosongkan seluruh riwayat pembayaran SPP"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan Riwayat</span>
            </button>
          )}
          <button
            id="btn-input-spp"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Transaksi Infaq / SPP</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Penerimaan Infaq</p>
            <h4 className="text-lg font-bold text-emerald-800 mt-1">
              Rp {totalInfaq.toLocaleString('id-ID')}
            </h4>
            <p className="text-[10px] text-emerald-600 mt-0.5">Tercatat Lunas di sistem</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center text-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Penerima Beasiswa BAZNAS</p>
            <h4 className="text-lg font-bold text-teal-800 mt-1">{beasiswaCount} Santri</h4>
            <p className="text-[10px] text-teal-600 mt-0.5">100% Bebas Biaya Pendidikan</p>
          </div>
          <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center text-lg">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Belum Lunas / Tertunda</p>
            <h4 className="text-lg font-bold text-amber-800 mt-1">{belumLunasCount} Transaksi</h4>
            <p className="text-[10px] text-amber-600 mt-0.5">Memerlukan tindak lanjut</p>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center text-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Transaksi</p>
            <h4 className="text-lg font-bold text-gray-800 mt-1">{sppList.length} Kwitansi</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Tersinkron di Cloud</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-xl flex items-center justify-center text-lg">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Informasi Rekening Resmi & Konfirmasi WhatsApp */}
      <div id="card-admin-info-rekening" className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-emerald-700/60 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-yellow-400/20 rounded-full text-[10px] font-bold text-yellow-300 border border-yellow-400/30">
                <Building className="w-3 h-3" />
                <span>Rekening Resmi Penerimaan SPP & Infaq</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                Informasi Rekening Pembayaran
              </h4>
            </div>

            <div className="flex items-center gap-2 bg-emerald-800/70 px-3 py-1.5 rounded-xl border border-emerald-700/80 self-start sm:self-auto text-xs font-bold text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>A.N. SUWASNO</span>
            </div>
          </div>

          <div className="bg-emerald-900/90 p-4 rounded-2xl border border-emerald-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider block">Bank Rakyat Indonesia (BRI)</span>
                <span className="text-[9px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-200 font-medium">Rekening Resmi</span>
              </div>
              <span className="text-xl font-mono font-black text-yellow-300 tracking-wider select-all block">
                012901044008503
              </span>
              <p className="text-[11px] text-emerald-200/80">Atas Nama: <strong className="text-white">SUWASNO</strong></p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRekening}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  copiedRekening
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-emerald-950 hover:bg-emerald-50'
                }`}
              >
                {copiedRekening ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Nomor Rekening Berhasil Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Salin Nomor Rekening</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleConfirmPaymentWA}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-yellow-300" />
                <span>Konfirmasi via WhatsApp (Suwasno)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-spp"
            type="text"
            placeholder="Cari santri, NIS, atau nomor kwitansi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 w-1/2 sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <select
              id="filter-status-spp"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-36 py-2 px-2.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Beasiswa BAZNAS">Beasiswa BAZNAS</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>

          <div className="w-1/2 sm:w-auto">
            <select
              id="filter-bulan-spp"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full sm:w-36 py-2 px-2.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Semua">Semua Bulan</option>
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table SPP */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">No Kwitansi & Tgl</th>
                <th className="p-3.5">NIS & Nama Santri</th>
                <th className="p-3.5">Periode Bulan</th>
                <th className="p-3.5">Metode Bayar</th>
                <th className="p-3.5">Nominal (Rp)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi / Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSPPList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center bg-gray-50/50">
                    <Receipt className="w-9 h-9 text-gray-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-gray-700">
                      {sppList.length === 0 
                        ? 'Belum ada transaksi pembayaran SPP / Infaq yang tercatat' 
                        : 'Tidak ada data transaksi yang cocok dengan filter pencarian'}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {sppList.length === 0 
                        ? 'Klik tombol "Input Transaksi Infaq / SPP" untuk menambahkan data baru.' 
                        : 'Silakan ubah kata kunci atau reset filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSPPList.map(s => {
                  const santri = santriList.find(st => st.NIS === s.NIS);
                  const isLunas = s.Status_Bayar === 'Lunas';
                  const isBeasiswa = s.Status_Bayar === 'Beasiswa BAZNAS';

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-gray-900 block">{s.Nomor_Kwitansi}</span>
                        <span className="text-[10px] text-gray-400">{s.Tanggal_Bayar}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || s.NIS}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">{s.NIS}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-800">{s.Bulan} {s.Tahun}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800 block">
                          {s.Metode === 'Transfer Bank' || s.Metode === 'Transfer Bank BRI' ? 'Transfer Bank BRI' : (s.Metode === 'Tunai' ? 'Tunai ke Kantor RTQ' : s.Metode)}
                        </span>
                        <span className="text-[10px] text-gray-400">{s.Catatan || '-'}</span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {isBeasiswa ? (
                          <span className="text-emerald-700 font-bold">GRATIS (BAZNAS)</span>
                        ) : (
                          `Rp ${s.Jumlah_Bayar.toLocaleString('id-ID')}`
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          isLunas 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : (isBeasiswa ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-rose-100 text-rose-800')
                        }`}>
                          {s.Status_Bayar}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Kwitansi */}
                          <button
                            id={`btn-kwitansi-${s.id}`}
                            onClick={() => setSelectedReceipt(s)}
                            className="p-1.5 sm:px-2.5 sm:py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Lihat & Cetak Kwitansi"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="hidden sm:inline">Kwitansi</span>
                          </button>

                          {/* Tombol Edit */}
                          <button
                            id={`btn-edit-spp-${s.id}`}
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 sm:px-2.5 sm:py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Edit data pembayaran SPP"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            id={`btn-delete-spp-${s.id}`}
                            onClick={() => setDeletingRecord(s)}
                            className="p-1.5 sm:px-2.5 sm:py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus transaksi pembayaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
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

      {/* Modal Add / Edit SPP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalMode === 'add' ? (
                  <Plus className="w-5 h-5 text-emerald-300" />
                ) : (
                  <Edit className="w-5 h-5 text-blue-300" />
                )}
                <div>
                  <h3 className="text-sm font-bold">
                    {modalMode === 'add' ? 'Input Pembayaran Infaq / SPP' : 'Edit Transaksi Pembayaran SPP'}
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    {modalMode === 'add' ? 'Tambahkan catatan pembayaran infaq baru' : `Mengedit data kwitansi: ${formData.Nomor_Kwitansi || '-'}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Santri *</label>
                <select
                  value={formData.NIS}
                  onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => (
                    <option key={s.NIS} value={s.NIS}>{s.NIS} - {s.Nama_Lengkap}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bulan *</label>
                  <select
                    value={formData.Bulan}
                    onChange={(e) => setFormData({ ...formData, Bulan: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tahun *</label>
                  <input
                    type="text"
                    value={formData.Tahun}
                    onChange={(e) => setFormData({ ...formData, Tahun: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Pembayaran *</label>
                  <select
                    value={formData.Status_Bayar}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFormData({ 
                        ...formData, 
                        Status_Bayar: val,
                        Jumlah_Bayar: val === 'Beasiswa BAZNAS' ? 0 : (formData.Jumlah_Bayar || 150000)
                      });
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Beasiswa BAZNAS">Beasiswa BAZNAS (Gratis 100%)</option>
                    <option value="Belum Lunas">Belum Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formData.Jumlah_Bayar}
                    onChange={(e) => setFormData({ ...formData, Jumlah_Bayar: Number(e.target.value) })}
                    disabled={formData.Status_Bayar === 'Beasiswa BAZNAS'}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={formData.Metode === 'Transfer Bank' || formData.Metode === 'Transfer Bank BRI' ? 'Transfer Bank BRI' : (formData.Metode === 'Tunai' ? 'Tunai ke Kantor RTQ' : formData.Metode)}
                    onChange={(e) => setFormData({ ...formData, Metode: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                    <option value="Tunai ke Kantor RTQ">Tunai ke Kantor RTQ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Bayar *</label>
                  <input
                    type="date"
                    value={formData.Tanggal_Bayar}
                    onChange={(e) => setFormData({ ...formData, Tanggal_Bayar: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nomor Kwitansi</label>
                  <input
                    type="text"
                    value={formData.Nomor_Kwitansi}
                    onChange={(e) => setFormData({ ...formData, Nomor_Kwitansi: e.target.value })}
                    placeholder={modalMode === 'add' ? 'Otomatis dibuat jika kosong' : 'KW/RTQ/...'}
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Petugas Penerima</label>
                  <input
                    type="text"
                    value={formData.Petugas}
                    onChange={(e) => setFormData({ ...formData, Petugas: e.target.value })}
                    placeholder="Nama Petugas..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Infaq rutin SPP..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalMode === 'add' ? 'Simpan Transaksi' : 'Perbarui Transaksi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Satuan */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="text-sm font-bold">Konfirmasi Hapus Transaksi SPP</h3>
              </div>
              <button 
                onClick={() => setDeletingRecord(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data transaksi pembayaran berikut secara permanen?
              </p>

              <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 space-y-1.5 text-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500">No Kwitansi:</span>
                  <span className="font-mono font-bold text-rose-900">{deletingRecord.Nomor_Kwitansi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Santri:</span>
                  <span className="font-bold text-gray-900">
                    {santriList.find(s => s.NIS === deletingRecord.NIS)?.Nama_Lengkap || deletingRecord.NIS}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Periode:</span>
                  <span className="font-semibold">{deletingRecord.Bulan} {deletingRecord.Tahun}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nominal:</span>
                  <span className="font-black text-rose-800">
                    {deletingRecord.Status_Bayar === 'Beasiswa BAZNAS' 
                      ? 'Beasiswa BAZNAS' 
                      : `Rp ${deletingRecord.Jumlah_Bayar.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDeletingRecord(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Seluruh Riwayat SPP */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-rose-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-300" />
                <h3 className="text-sm font-bold">Kosongkan Semua Riwayat SPP</h3>
              </div>
              <button 
                onClick={() => setIsClearAllModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-700 leading-relaxed font-medium">
                Tindakan ini akan menghapus <strong>seluruh {sppList.length} riwayat transaksi pembayaran SPP</strong> dan mereset total penerimaan menjadi <strong>Rp 0</strong>.
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 font-medium">
                ⚠️ Pastikan Anda telah mengonfirmasi tindakan ini. Data yang dihapus akan langsung disinkronkan ke cloud.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Kosongkan Semua</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kwitansi */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Kwitansi Pembayaran Resmi RTQ</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b-2 border-emerald-900 pb-3 text-center">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wide">RTQ CENDEKIA BAZNAS MASJID AGUNG DARUSSALAM</h4>
                <p className="text-[10px] text-gray-500">Tanda Bukti Penerimaan Infaq & Pendidikan Santri</p>
                <p className="text-xs font-mono font-bold text-emerald-800 mt-1">No: {selectedReceipt.Nomor_Kwitansi}</p>
              </div>

              <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Telah Diterima Dari:</span>
                  <span className="font-bold text-gray-900">
                    {santriList.find(s => s.NIS === selectedReceipt.NIS)?.Nama_Lengkap} ({selectedReceipt.NIS})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Untuk Pembayaran:</span>
                  <span className="font-semibold text-gray-800">Infaq SPP {selectedReceipt.Bulan} {selectedReceipt.Tahun}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal Bayar:</span>
                  <span className="font-semibold text-gray-800">{selectedReceipt.Tanggal_Bayar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedReceipt.Metode === 'Transfer Bank' || selectedReceipt.Metode === 'Transfer Bank BRI' ? 'Transfer Bank BRI' : (selectedReceipt.Metode === 'Tunai' ? 'Tunai ke Kantor RTQ' : selectedReceipt.Metode)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-emerald-900">
                  <span>Jumlah Total:</span>
                  <span>
                    {selectedReceipt.Status_Bayar === 'Beasiswa BAZNAS'
                      ? 'BEASISWA BAZNAS (100% GRATIS)'
                      : `Rp ${selectedReceipt.Jumlah_Bayar.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t text-[11px]">
                <div>
                  <p className="text-gray-400">Status: <span className="font-bold text-emerald-700">{selectedReceipt.Status_Bayar}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Petugas Administrasi</p>
                  <p className="font-bold text-gray-800 mt-4 underline">{selectedReceipt.Petugas || 'Petugas Administrasi RTQ'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Kwitansi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
