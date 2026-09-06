import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { QRCodeCanvas } from './QRCodeCanvas';
import { 
  DiniyyahRecord, 
  JenjangDiniyyah, 
  DINIYYAH_CONFIG, 
  TAHUN_AJARAN_DINIYYAH, 
  SEMESTER_DINIYYAH, 
  NilaiMapelItem 
} from '../types';
import { 
  calculateDiniyyah, 
  getPredikatDiniyyah, 
  mapSantriToJenjang,
  DINIYYAH_ULA_NAMES,
  DINIYYAH_WUSTHO_NAMES,
  DINIYYAH_ULYA_NAMES,
  NIS_TO_JENJANG_MAP
} from '../data/diniyyahData';
import { generateAndDownloadDiniyyahPDF } from '../utils/diniyyahPdfGenerator';
import { 
  BookMarked, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Sparkles, 
  UserCheck, 
  GraduationCap, 
  X,
  ChevronDown,
  Info,
  Calendar,
  BookOpen,
  Check,
  TrendingUp,
  Download,
  Users,
  ShieldCheck,

  Eye,
  QrCode,
  Loader2,
  FileDown
} from 'lucide-react';

interface NgajiDiniyyahViewProps {
  isWaliPortal?: boolean;
}

export const NgajiDiniyyahView: React.FC<NgajiDiniyyahViewProps> = ({ isWaliPortal = false }) => {
  const { 
    currentUser, 
    santriList, 
    diniyyahList, 
    addDiniyyah, 
    updateDiniyyah, 
    deleteDiniyyah,
    getSantriForWali,
    appLogo,
    showToast
  } = useApp();

  const isWali = currentUser?.role === 'Wali Santri' || isWaliPortal;
  const linkedSantri = isWali ? getSantriForWali() : null;

  // Filter States
  const [selectedTahun, setSelectedTahun] = useState<string>('2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<'Semester 1' | 'Semester 2'>('Semester 1');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState<boolean>(false);
  const [distributionActiveTab, setDistributionActiveTab] = useState<JenjangDiniyyah>('Kelas Ula');
  const [editingRecord, setEditingRecord] = useState<DiniyyahRecord | null>(null);
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<DiniyyahRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Form States
  const [formNis, setFormNis] = useState<string>('');
  const [formJenjang, setFormJenjang] = useState<JenjangDiniyyah>('Kelas Ula');
  const [formTahun, setFormTahun] = useState<string>('2026/2027');
  const [formSemester, setFormSemester] = useState<'Semester 1' | 'Semester 2'>('Semester 1');
  const [formNilai, setFormNilai] = useState<{ [mapel: string]: string | number }>({});
  const [formCatatan, setFormCatatan] = useState<string>('');

  // Printable Component Ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    let list = diniyyahList;

    if (isWali && linkedSantri) {
      list = list.filter(d => d.NIS === linkedSantri.NIS);
    }

    if (selectedTahun) {
      list = list.filter(d => d.tahunAjaran === selectedTahun);
    }

    if (selectedSemester) {
      list = list.filter(d => d.semester === selectedSemester);
    }

    if (selectedJenjang !== 'Semua') {
      list = list.filter(d => d.jenjang === selectedJenjang);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        d.namaSantri.toLowerCase().includes(q) || 
        d.NIS.toLowerCase().includes(q) ||
        d.guruPembimbing.toLowerCase().includes(q)
      );
    }

    return list;
  }, [diniyyahList, isWali, linkedSantri, selectedTahun, selectedSemester, selectedJenjang, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { total: 0, avg: 0, highest: 0, lowest: 0, mumtazCount: 0 };
    }
    let sumRata = 0;
    let highest = 0;
    let lowest = 100;
    let mumtazCount = 0;

    filteredRecords.forEach(r => {
      sumRata += r.rataRata;
      if (r.rataRata > highest) highest = r.rataRata;
      if (r.rataRata < lowest) lowest = r.rataRata;
      if (r.predikat === 'Mumtaz') mumtazCount++;
    });

    return {
      total: filteredRecords.length,
      avg: Math.round((sumRata / filteredRecords.length) * 10) / 10,
      highest,
      lowest: lowest === 100 && filteredRecords.length === 0 ? 0 : lowest,
      mumtazCount
    };
  }, [filteredRecords]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingRecord(null);
    const firstSantri = santriList[0];
    const initialNis = firstSantri?.NIS || '';
    const initialJenjang = mapSantriToJenjang(firstSantri?.NIS || '', firstSantri?.Nama_Lengkap || '');
    const config = DINIYYAH_CONFIG[initialJenjang];

    setFormNis(initialNis);
    setFormJenjang(initialJenjang);
    setFormTahun(selectedTahun || '2026/2027');
    setFormSemester(selectedSemester || 'Semester 1');

    const initialNilaiMap: { [mapel: string]: string | number } = {};
    config.mataPelajaran.forEach(m => {
      initialNilaiMap[m] = 85;
    });
    setFormNilai(initialNilaiMap);
    setFormCatatan(`Ananda ${firstSantri?.Nama_Lengkap || 'Santri'} rajin mengikuti kajian kitab diniyyah dan beradab mulia.`);
    setIsFormModalOpen(true);
  };

  // Handle Santri Dropdown change in Form
  const handleFormSantriChange = (nis: string) => {
    setFormNis(nis);
    const s = santriList.find(item => item.NIS === nis);
    if (s) {
      const detectedJenjang = mapSantriToJenjang(s.NIS, s.Nama_Lengkap);
      setFormJenjang(detectedJenjang);
      const config = DINIYYAH_CONFIG[detectedJenjang];
      const newNilaiMap: { [mapel: string]: string | number } = {};
      config.mataPelajaran.forEach(m => {
        newNilaiMap[m] = formNilai[m] !== undefined ? formNilai[m] : 85;
      });
      setFormNilai(newNilaiMap);
      setFormCatatan(`Ananda ${s.Nama_Lengkap} rajin mengikuti kajian kitab diniyyah dan beradab mulia.`);
    }
  };

  // Handle Jenjang Change in Form
  const handleFormJenjangChange = (jenjang: JenjangDiniyyah) => {
    setFormJenjang(jenjang);
    const config = DINIYYAH_CONFIG[jenjang];
    const newNilaiMap: { [mapel: string]: string | number } = {};
    config.mataPelajaran.forEach(m => {
      newNilaiMap[m] = formNilai[m] !== undefined ? formNilai[m] : 85;
    });
    setFormNilai(newNilaiMap);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (record: DiniyyahRecord) => {
    setEditingRecord(record);
    setFormNis(record.NIS);
    setFormJenjang(record.jenjang);
    setFormTahun(record.tahunAjaran);
    setFormSemester(record.semester);

    const nilaiMap: { [mapel: string]: string | number } = {};
    record.nilaiList.forEach(item => {
      nilaiMap[item.mapel] = item.nilai !== null ? item.nilai : '';
    });
    setFormNilai(nilaiMap);
    setFormCatatan(record.catatanGuru || '');
    setIsFormModalOpen(true);
  };

  // Form Live Calculation
  const formCalculated = useMemo(() => {
    const config = DINIYYAH_CONFIG[formJenjang];
    if (!config) return { total: 0, avg: 0, predikat: '-' };

    const items: NilaiMapelItem[] = config.mataPelajaran.map(m => {
      const val = formNilai[m];
      return {
        mapel: m,
        nilai: val !== '' && val !== undefined && !isNaN(Number(val)) ? Number(val) : null
      };
    });

    const calc = calculateDiniyyah(items);
    return {
      total: calc.jumlahNilai,
      avg: calc.rataRata,
      predikat: calc.predikat,
      isComplete: calc.isComplete
    };
  }, [formJenjang, formNilai]);

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNis) {
      showToast('Silakan pilih santri terlebih dahulu.', 'error');
      return;
    }

    const s = santriList.find(item => item.NIS === formNis);
    const namaSantri = s ? s.Nama_Lengkap : (editingRecord?.namaSantri || 'Santri');
    const config = DINIYYAH_CONFIG[formJenjang];

    const nilaiList: NilaiMapelItem[] = config.mataPelajaran.map(m => {
      const val = formNilai[m];
      const numVal = val !== '' && val !== undefined && !isNaN(Number(val)) ? Math.min(100, Math.max(0, Number(val))) : null;
      return {
        mapel: m,
        nilai: numVal
      };
    });

    const calc = calculateDiniyyah(nilaiList);

    if (editingRecord) {
      updateDiniyyah(editingRecord.id, {
        NIS: formNis,
        namaSantri,
        jenjang: formJenjang,
        tahunAjaran: formTahun,
        semester: formSemester,
        guruPembimbing: config.guruPembimbing,
        nilaiList,
        jumlahNilai: calc.jumlahNilai,
        rataRata: calc.rataRata,
        predikat: calc.predikat,
        catatanGuru: formCatatan
      });
    } else {
      const newRecord: DiniyyahRecord = {
        id: `DIN_${formNis}_${formTahun.replace('/', '_')}_${formSemester.replace(' ', '_')}_${Date.now()}`,
        NIS: formNis,
        namaSantri,
        jenjang: formJenjang,
        tahunAjaran: formTahun,
        semester: formSemester,
        guruPembimbing: config.guruPembimbing,
        nilaiList,
        jumlahNilai: calc.jumlahNilai,
        rataRata: calc.rataRata,
        predikat: calc.predikat,
        catatanGuru: formCatatan
      };
      addDiniyyah(newRecord);
    }

    setIsFormModalOpen(false);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    deleteDiniyyah(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  // Handle Print Action
  const handlePrint = (record: DiniyyahRecord) => {
    setSelectedRecordForPrint(record);
  };

  const handleDownloadPDF = async (record: DiniyyahRecord) => {
    try {
      setDownloadingId(record.id);
      showToast(`Sedang membuat PDF Rapor Diniyyah untuk ${record.namaSantri}...`, 'info');
      const s = santriList.find(item => item.NIS === record.NIS);
      const res = await generateAndDownloadDiniyyahPDF({ record, santri: s, logoUrl: appLogo });
      if (res.success) {
        showToast(`Dokumen PDF (${res.fileName}) berhasil diunduh ke HP/perangkat Anda!`, 'success');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Gagal membuat file PDF. Silakan coba kembali.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  // Render Predikat Badge
  const renderPredikatBadge = (predikat: string) => {
    switch (predikat) {
      case 'Mumtaz':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Mumtaz (Istimewa)</span>;
      case 'Jayyid Jiddan':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Jayyid Jiddan (Sangat Baik)</span>;
      case 'Jayyid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">Jayyid (Baik)</span>;
      case 'Maqbul':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Maqbul (Cukup)</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Perlu Bimbingan</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Banner & Quick Information */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-800/80 rounded-full text-emerald-200 text-xs font-semibold border border-emerald-600/50">
              <BookMarked className="w-3.5 h-3.5 text-yellow-300" />
              <span>Kurikulum Kitab Kuning & Dirasah Islamiyyah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ngaji Diniyyah RTQ Cendikia
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pengelolaan kurikulum kitab fiqih, sirah nabawiyyah, kaidah pegon/imla', hadits, jurumiyyah nahwu & sharaf terpadu dengan sistem rekapitulasi nilai dan laporan berkala.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-lihat-pembagian-diniyyah"
              onClick={() => setIsDistributionModalOpen(true)}
              className="px-4 py-3 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold rounded-2xl border border-emerald-600/70 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
            >
              <Users className="w-4 h-4 text-yellow-300" />
              <span>Pembagian Santri (65)</span>
            </button>

            {!isWali && (
              <button
                id="btn-tambah-nilai-diniyyah"
                onClick={handleOpenCreate}
                className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-5 h-5 text-emerald-950 stroke-[3]" />
                <span>Input Nilai Diniyyah</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Asatidz Pembimbing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-emerald-700/60 text-xs">
          <div 
            onClick={() => { setSelectedJenjang('Kelas Ula'); setDistributionActiveTab('Kelas Ula'); }}
            className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/50 flex items-start space-x-3 cursor-pointer hover:bg-emerald-900/60 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition">
              Ula
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-yellow-300 block">Kelas Ula (Dasar)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full">{DINIYYAH_ULA_NAMES.length} Santri</span>
              </div>
              <p className="text-emerald-100 font-semibold text-[11px] mt-0.5">Ustadzah Sri Siti Khafsoh</p>
              <p className="text-emerald-300/80 text-[10px] mt-1 line-clamp-1">Mabadi Fiqh 1, Ro'sun Sirah, Pegon/Imla', Hadist Mi'ah</p>
            </div>
          </div>

          <div 
            onClick={() => { setSelectedJenjang('Kelas Wustho'); setDistributionActiveTab('Kelas Wustho'); }}
            className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/50 flex items-start space-x-3 cursor-pointer hover:bg-emerald-900/60 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition">
              Wst
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-300 block">Kelas Wustho (Menengah)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-400/20 text-teal-300 rounded-full">{DINIYYAH_WUSTHO_NAMES.length} Santri</span>
              </div>
              <p className="text-emerald-100 font-semibold text-[11px] mt-0.5">Ustadzah Dzatun Nafis Al Baidh, S.Pd</p>
              <p className="text-emerald-300/80 text-[10px] mt-1 line-clamp-1">Pegon, Mabadi Fiqh 2, Ro'sun Sirah, Hadist Mi'ah</p>
            </div>
          </div>

          <div 
            onClick={() => { setSelectedJenjang('Kelas Ulya'); setDistributionActiveTab('Kelas Ulya'); }}
            className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/50 flex items-start space-x-3 cursor-pointer hover:bg-emerald-900/60 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition">
              Uly
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-300 block">Kelas Ulya (Lanjutan)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full">{DINIYYAH_ULYA_NAMES.length} Santri</span>
              </div>
              <p className="text-emerald-100 font-semibold text-[11px] mt-0.5">Ustadz Ahmad Nasyikhudin, S.Pd</p>
              <p className="text-emerald-300/80 text-[10px] mt-1 line-clamp-1">Mabadi Fiqh 3, Jurumiyyah, Tasrif Istilah, Hadist Arba'in</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Statistical Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Santri Terdata</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
          <p className="text-xs text-gray-500 mt-1">Pada semester & tahun ajaran aktif</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rata-Rata Kelas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-800">{stats.avg}</h3>
          <p className="text-xs text-gray-500 mt-1">Skala penilaian 0 - 100</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Predikat Mumtaz</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-yellow-700">{stats.mumtazCount} <span className="text-xs font-normal text-gray-500">Santri</span></h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Nilai $\ge 90$ Istimewa</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nilai Tertinggi</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-teal-800">{stats.highest}</h3>
          <p className="text-xs text-gray-500 mt-1">Rata-rata mapel tertinggi</p>
        </div>
      </div>

      {/* 3. Filters & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tahun Ajaran */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-gray-500 ml-2" />
              <select
                id="select-tahun-ajaran"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 py-1.5 px-2 outline-none cursor-pointer"
              >
                {TAHUN_AJARAN_DINIYYAH.map(ta => (
                  <option key={ta} value={ta}>TA {ta}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              {SEMESTER_DINIYYAH.map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedSemester === sem
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {sem}
                </button>
              ))}
            </div>

            {/* Jenjang / Kelas */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto">
              <button
                onClick={() => setSelectedJenjang('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedJenjang === 'Semua'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua ({santriList.length})
              </button>
              <button
                onClick={() => setSelectedJenjang('Kelas Ula')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedJenjang === 'Kelas Ula'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ula ({DINIYYAH_ULA_NAMES.length})
              </button>
              <button
                onClick={() => setSelectedJenjang('Kelas Wustho')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedJenjang === 'Kelas Wustho'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Wustho ({DINIYYAH_WUSTHO_NAMES.length})
              </button>
              <button
                onClick={() => setSelectedJenjang('Kelas Ulya')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedJenjang === 'Kelas Ulya'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ulya ({DINIYYAH_ULYA_NAMES.length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-diniyyah"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri / NIS..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Table / Card List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-gray-900 text-base">
              Daftar Nilai Santri ({filteredRecords.length})
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {selectedTahun} • {selectedSemester}
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">Belum Ada Data Nilai Diniyyah</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Tidak ditemukan catatan nilai untuk kriteria filter ini. Silakan sesuaikan filter atau input nilai santri baru.
            </p>
            {!isWali && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Input Nilai Diniyyah Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900/5 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">Santri & Jenjang</th>
                  <th className="py-3.5 px-4">Guru Pembimbing</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Rincian Nilai Mata Pelajaran</th>
                  <th className="py-3.5 px-4 text-center">Jumlah</th>
                  <th className="py-3.5 px-4 text-center">Rata-Rata</th>
                  <th className="py-3.5 px-4 text-center">Predikat</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredRecords.map((rec, index) => {
                  return (
                    <tr key={rec.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3.5 px-4 text-center text-gray-400 font-semibold">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {rec.namaSantri.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{rec.namaSantri}</span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[11px] text-gray-500">NIS: {rec.NIS}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                {rec.jenjang}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 text-gray-800">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span className="font-semibold">{rec.guruPembimbing}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="grid grid-cols-2 gap-1.5">
                          {rec.nilaiList.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 px-2 py-1 rounded border border-gray-200 flex items-center justify-between text-[11px]">
                              <span className="text-gray-600 truncate max-w-[120px]" title={item.mapel}>{item.mapel}</span>
                              <span className={`font-bold ml-1.5 ${item.nilai !== null && item.nilai >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {item.nilai !== null ? item.nilai : '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-gray-900 text-sm">
                        {rec.jumlahNilai}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-extrabold text-sm border border-emerald-200">
                          {rec.rataRata}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderPredikatBadge(rec.predikat)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Tombol Lihat Lembar Nilai */}
                          <button
                            onClick={() => handlePrint(rec)}
                            title="Lihat Pratinjau Lembar Rapor Diniyyah"
                            className="px-2.5 py-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-700 hover:text-white rounded-lg transition font-bold text-xs flex items-center space-x-1 border border-emerald-300 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>

                          {/* Tombol Download PDF Langsung */}
                          <button
                            onClick={() => handleDownloadPDF(rec)}
                            disabled={downloadingId === rec.id}
                            title="Download PDF Rapor Diniyyah"
                            className="px-2.5 py-1.5 text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded-lg transition font-bold text-xs flex items-center space-x-1 border border-teal-300 cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            {downloadingId === rec.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-teal-600 group-hover:text-white" />
                            )}
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          {!isWali && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(rec)}
                                title="Edit Nilai"
                                className="p-1.5 text-blue-700 hover:text-white hover:bg-blue-700 rounded-lg transition cursor-pointer border border-blue-300"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(rec.id)}
                                title="Hapus Data Nilai"
                                className="p-1.5 text-rose-700 hover:text-white hover:bg-rose-700 rounded-lg transition cursor-pointer border border-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Input / Edit Nilai Diniyyah */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-emerald-950">
                <BookMarked className="w-6 h-6 text-emerald-700" />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {editingRecord ? 'Perbarui Nilai Diniyyah Santri' : 'Input Nilai Diniyyah Santri'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Masukkan nilai 4 mata pelajaran sesuai jenjang kelas kitab.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 pt-4 text-xs">
              
              {/* Santri Picker */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Santri *</label>
                <select
                  value={formNis}
                  onChange={(e) => handleFormSantriChange(e.target.value)}
                  disabled={!!editingRecord}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => (
                    <option key={s.NIS} value={s.NIS}>
                      {s.NIS} - {s.Nama_Lengkap} ({s.Kelas || 'Kelas Ula'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenjang Kelas & Guru Pembimbing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jenjang Diniyyah *</label>
                  <select
                    value={formJenjang}
                    onChange={(e) => handleFormJenjangChange(e.target.value as JenjangDiniyyah)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-bold"
                  >
                    <option value="Kelas Ula">Kelas Ula</option>
                    <option value="Kelas Wustho">Kelas Wustho</option>
                    <option value="Kelas Ulya">Kelas Ulya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Guru Pembimbing Resmi</label>
                  <input
                    type="text"
                    value={DINIYYAH_CONFIG[formJenjang]?.guruPembimbing || ''}
                    disabled
                    className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 font-bold"
                  />
                </div>
              </div>

              {/* Tahun Ajaran & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tahun Ajaran *</label>
                  <select
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                  >
                    {TAHUN_AJARAN_DINIYYAH.map(ta => (
                      <option key={ta} value={ta}>{ta}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Semester *</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                  >
                    {SEMESTER_DINIYYAH.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Nilai 4 Mata Pelajaran */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                    <span>Daftar 4 Mata Pelajaran ({formJenjang})</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Skala 0 - 100 (KKM: 70)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DINIYYAH_CONFIG[formJenjang]?.mataPelajaran.map((mapel, mIdx) => (
                    <div key={mIdx} className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                      <label className="block font-bold text-gray-800 mb-1 text-[11px] truncate" title={mapel}>
                        {mIdx + 1}. {mapel}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formNilai[mapel] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormNilai(prev => ({ ...prev, [mapel]: val }));
                        }}
                        placeholder="0 - 100"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-emerald-600 text-sm font-extrabold text-emerald-950"
                      />
                    </div>
                  ))}
                </div>

                {/* Auto Calculated Summary Live Preview */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border border-emerald-300">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Jumlah Nilai</span>
                      <strong className="text-base text-gray-900">{formCalculated.total}</strong>
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Rata-Rata</span>
                      <strong className="text-base text-emerald-700">{formCalculated.avg}</strong>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-[11px]">Predikat:</span>
                    {renderPredikatBadge(formCalculated.predikat)}
                  </div>
                </div>
              </div>

              {/* Catatan Guru */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Perkembangan & Adab Santri</label>
                <textarea
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  rows={2}
                  placeholder="Tuliskan evaluasi pemahaman kitab dan adab santri..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black shadow-md cursor-pointer transition"
                >
                  {editingRecord ? 'Perbarui Nilai' : 'Simpan Nilai Diniyyah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Print & Lembar Rapor Diniyyah */}
      {selectedRecordForPrint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-6 relative">
            
            {/* Modal Top Control Bar (Hidden when printed) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 print:hidden">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-gray-900 text-base">
                  Pratinjau Lembar Rapor Nilai Diniyyah
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {/* Download PDF Button */}
                <button
                  onClick={() => handleDownloadPDF(selectedRecordForPrint)}
                  disabled={downloadingId === selectedRecordForPrint.id}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition"
                >
                  {downloadingId === selectedRecordForPrint.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-yellow-300" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                {/* Print Button */}
                <button
                  onClick={executeBrowserPrint}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedRecordForPrint(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div ref={printAreaRef} id="printable-diniyyah-sheet" className="font-serif text-gray-900 text-xs sm:text-sm leading-normal p-2 sm:p-4 bg-white">
              
              {/* Kop Surat Resmi Lembaga (Sesuai Format Rapor RTQ) */}
              <div className="border-b-2 border-emerald-900 pb-4 flex items-center justify-between gap-4 mb-4">
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

              {/* Document Title */}
              <div className="text-center my-4 font-sans">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-gray-900 underline underline-offset-4 decoration-emerald-800">
                  LAPORAN CAPAIAN NILAI NGAJI DINIYYAH
                </h3>
                <p className="text-xs font-semibold text-gray-600 mt-1">
                  Tahun Ajaran {selectedRecordForPrint.tahunAjaran} • {selectedRecordForPrint.semester}
                </p>
              </div>

              {/* Santri Profile Data Box */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-300 font-sans text-xs mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium">Nama Santri</span>
                    <span className="w-3">:</span>
                    <strong className="text-gray-950 font-bold">{selectedRecordForPrint.namaSantri}</strong>
                  </div>
                  <div className="flex mt-1">
                    <span className="w-32 text-gray-600 font-medium">Nomor Induk (NIS)</span>
                    <span className="w-3">:</span>
                    <span className="font-semibold text-gray-800">{selectedRecordForPrint.NIS}</span>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span className="w-32 text-gray-600 font-medium">Jenjang Diniyyah</span>
                    <span className="w-3">:</span>
                    <strong className="text-emerald-900 font-bold">{selectedRecordForPrint.jenjang}</strong>
                  </div>
                  <div className="flex mt-1">
                    <span className="w-32 text-gray-600 font-medium">Guru Pembimbing</span>
                    <span className="w-3">:</span>
                    <span className="font-bold text-gray-800">{selectedRecordForPrint.guruPembimbing}</span>
                  </div>
                </div>
              </div>

              {/* Table of Scores */}
              <div className="overflow-hidden border border-gray-400 rounded-lg mb-4 font-sans text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-900 font-bold text-center border-b border-gray-400">
                      <th className="py-2 px-3 border-r border-gray-400 w-12">No</th>
                      <th className="py-2 px-3 border-r border-gray-400 text-left">Mata Pelajaran (Kitab)</th>
                      <th className="py-2 px-3 border-r border-gray-400 w-16">KKM</th>
                      <th className="py-2 px-3 border-r border-gray-400 w-20">Nilai Angka</th>
                      <th className="py-2 px-3 border-r border-gray-400 w-28">Predikat</th>
                      <th className="py-2 px-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {selectedRecordForPrint.nilaiList.map((item, idx) => {
                      const score = item.nilai !== null ? item.nilai : 0;
                      let pred = 'Belum Ada';
                      if (score >= 90) pred = 'Mumtaz';
                      else if (score >= 80) pred = 'Jayyid Jiddan';
                      else if (score >= 70) pred = 'Jayyid';
                      else if (score >= 60) pred = 'Maqbul';
                      else if (item.nilai !== null) pred = 'Perlu Bimbingan';

                      const isPass = score >= 70;

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-center border-r border-gray-300">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-gray-300 font-semibold">{item.mapel}</td>
                          <td className="py-2 px-3 text-center border-r border-gray-300 font-medium">70</td>
                          <td className="py-2 px-3 text-center border-r border-gray-300 font-extrabold text-gray-900">
                            {item.nilai !== null ? item.nilai : '-'}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-gray-300 font-bold">
                            {pred}
                          </td>
                          <td className="py-2 px-3 text-center font-medium">
                            {item.nilai !== null ? (isPass ? 'Tuntas' : 'Perlu Remedial') : 'Belum Ujian'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary Rows */}
                    <tr className="bg-gray-100/90 font-bold border-t-2 border-gray-400">
                      <td colSpan={3} className="py-2 px-3 text-right border-r border-gray-300 uppercase tracking-wider">
                        Jumlah Nilai :
                      </td>
                      <td className="py-2 px-3 text-center border-r border-gray-300 font-black text-sm text-gray-950">
                        {selectedRecordForPrint.jumlahNilai}
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-gray-600 font-normal italic">
                        Total capaian seluruh mata pelajaran
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-bold">
                      <td colSpan={3} className="py-2 px-3 text-right border-r border-gray-300 uppercase tracking-wider">
                        Rata-Rata Nilai :
                      </td>
                      <td className="py-2 px-3 text-center border-r border-gray-300 font-black text-sm text-emerald-900">
                        {selectedRecordForPrint.rataRata}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-gray-300 font-black text-emerald-950">
                        {selectedRecordForPrint.predikat}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-800">
                        {selectedRecordForPrint.rataRata >= 70 ? 'LULUS / TUNTAS' : 'REMEDIAL'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Catatan Guru */}
              <div className="p-3 bg-gray-50 border border-gray-300 rounded-xl font-sans text-xs mb-6">
                <span className="font-bold text-gray-900 block mb-1">Catatan & Motivasi Guru Pembimbing:</span>
                <p className="text-gray-700 italic">
                  "{selectedRecordForPrint.catatanGuru || 'Alhamdulillah ananda bersemangat dalam mempelajari dasar-dasar syariat Islam dan adab penuntut ilmu.'}"
                </p>
              </div>

              {/* Kolom Tanda Tangan Resmi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-sans text-xs pt-2">
                <div className="flex flex-col items-center justify-between border border-gray-200 rounded-xl p-2.5 bg-gray-50/50">
                  <div>
                    <p className="text-[11px] text-gray-500">Mengetahui,</p>
                    <p className="font-bold text-gray-900">Wali Santri</p>
                  </div>
                  <div className="h-14 flex items-center justify-center text-gray-300 italic text-[10px]">
                    (Tanda Tangan)
                  </div>
                  <div className="w-full pt-1 border-t border-gray-300">
                    <p className="font-bold text-gray-900 text-xs">
                      ( {santriList.find(s => s.NIS === selectedRecordForPrint.NIS)?.Nama_Wali || 'Wali Santri'} )
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between border border-emerald-200 rounded-xl p-2.5 bg-emerald-50/40">
                  <div>
                    <p className="text-[11px] text-emerald-800">Muara Beliti, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-emerald-950">Guru Pembimbing Diniyyah</p>
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <div className="p-1 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <QRCodeCanvas 
                        value={`TTD-DIGITAL-RTQ\nJenis: Rapor Nilai Diniyyah\nGuru Pembimbing: ${selectedRecordForPrint.guruPembimbing}\nSantri: ${selectedRecordForPrint.namaSantri} (${selectedRecordForPrint.NIS})\nJenjang: ${selectedRecordForPrint.jenjang}\nStatus: TERVERIFIKASI RESMI DIGITAL`}
                        size={60}
                        darkColor="#064e3b"
                      />
                    </div>
                  </div>
                  <div className="w-full pt-1 border-t border-emerald-300">
                    <p className="font-bold underline text-emerald-950 text-xs">
                      {selectedRecordForPrint.guruPembimbing}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between border border-emerald-200 rounded-xl p-2.5 bg-emerald-50/40">
                  <div>
                    <p className="text-[11px] text-emerald-800">Pimpinan Lembaga,</p>
                    <p className="font-bold text-emerald-950">RTQ Cendikia BAZNAS</p>
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <div className="p-1 bg-white border border-emerald-300 rounded-lg shadow-2xs">
                      <QRCodeCanvas 
                        value={`TTD-DIGITAL-RTQ\nJenis: Pengesahan Rapor Diniyyah\nKepala RTQ: Ust. Ahmad Nasyikhudin, S.Pd\nSantri: ${selectedRecordForPrint.namaSantri} (${selectedRecordForPrint.NIS})\nJenjang: ${selectedRecordForPrint.jenjang}\nStatus: PENGESAHAN RESMI SAH`}
                        size={60}
                        darkColor="#064e3b"
                      />
                    </div>
                  </div>
                  <div className="w-full pt-1 border-t border-emerald-300">
                    <p className="font-bold underline text-emerald-950 text-xs">
                      Ust. Ahmad Nasyikhudin, S.Pd
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Konfirmasi Hapus Data */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Hapus Data Nilai Diniyyah?</h3>
            <p className="text-xs text-gray-500 mt-1.5">
              Apakah Anda yakin ingin menghapus data nilai ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center space-x-3 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal Daftar Pembagian Kelas Santri (65 Santri) */}
      {isDistributionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Daftar Pembagian Kelas Ngaji Diniyyah
                  </h3>
                  <p className="text-xs text-gray-500">
                    Total 65 Santri RTQ Cendikia terbagi ke dalam 3 jenjang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDistributionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Level Tabs */}
            <div className="grid grid-cols-3 gap-2 my-4 flex-shrink-0">
              <button
                onClick={() => setDistributionActiveTab('Kelas Ula')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  distributionActiveTab === 'Kelas Ula'
                    ? 'bg-yellow-400 text-emerald-950 shadow-sm ring-2 ring-yellow-400/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Kelas Ula</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
                  {DINIYYAH_ULA_NAMES.length}
                </span>
              </button>

              <button
                onClick={() => setDistributionActiveTab('Kelas Wustho')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  distributionActiveTab === 'Kelas Wustho'
                    ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Kelas Wustho</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {DINIYYAH_WUSTHO_NAMES.length}
                </span>
              </button>

              <button
                onClick={() => setDistributionActiveTab('Kelas Ulya')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  distributionActiveTab === 'Kelas Ulya'
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Kelas Ulya</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {DINIYYAH_ULYA_NAMES.length}
                </span>
              </button>
            </div>

            {/* Level Info Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 flex-shrink-0 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-900 block">
                  {DINIYYAH_CONFIG[distributionActiveTab].nama} ({distributionActiveTab === 'Kelas Ula' ? 'Tingkat Dasar' : distributionActiveTab === 'Kelas Wustho' ? 'Tingkat Menengah' : 'Tingkat Lanjutan'})
                </span>
                <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  Guru Pembimbing: <span className="underline">{DINIYYAH_CONFIG[distributionActiveTab].guruPembimbing}</span>
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">
                  Mata Pelajaran: {DINIYYAH_CONFIG[distributionActiveTab].mataPelajaran.join(', ')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedJenjang(distributionActiveTab);
                  setIsDistributionModalOpen(false);
                }}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Filter Nilai</span>
              </button>
            </div>

            {/* Student List in this level */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-2 max-h-96">
              {(() => {
                const names = distributionActiveTab === 'Kelas Ula' 
                  ? DINIYYAH_ULA_NAMES 
                  : distributionActiveTab === 'Kelas Wustho' 
                  ? DINIYYAH_WUSTHO_NAMES 
                  : DINIYYAH_ULYA_NAMES;

                return names.map((name, idx) => {
                  // Find santri object from santriList if available
                  const s = santriList.find(item => 
                    item.Nama_Lengkap.toLowerCase().trim() === name.toLowerCase().trim() ||
                    item.Nama_Lengkap.toLowerCase().includes(name.toLowerCase().trim()) ||
                    name.toLowerCase().includes(item.Nama_Lengkap.toLowerCase().trim())
                  );

                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900">{name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            NIS: {s?.NIS || '-'} • Kelas Formal: {s?.Kelas || '-'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedJenjang(distributionActiveTab);
                          if (s?.NIS) {
                            setSearchQuery(s.Nama_Lengkap);
                          } else {
                            setSearchQuery(name);
                          }
                          setIsDistributionModalOpen(false);
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Lihat Nilai
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 mt-3">
              <span className="text-xs text-gray-500 font-medium">
                Kategori terverifikasi sesuai instruksi pimpinan pondok
              </span>
              <button
                onClick={() => setIsDistributionModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
