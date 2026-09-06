import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TahfidzRecord, Santri, Pengajar } from '../types';
import { QURAN_SURAH_LIST } from '../data/quranSurahList';
import { 
  Plus, 
  BookOpen, 
  Search, 
  Trash2, 
  Pencil, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Calendar,
  Users,
  LayoutGrid,
  ListFilter,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JUZ_LIST = [
  { value: '1', label: 'Juz 1 (Al-Baqarah)' },
  { value: '2', label: 'Juz 2 (Sayaqulu)' },
  { value: '3', label: 'Juz 3 (Tilkar Rusul)' },
  { value: '4', label: 'Juz 4 (Lan Tanalu)' },
  { value: '5', label: 'Juz 5 (Wal Muhshanat)' },
  { value: '6', label: 'Juz 6 (La Yuhibbullah)' },
  { value: '7', label: 'Juz 7 (Wa Iza Sami\'u)' },
  { value: '8', label: 'Juz 8 (Wa Lau Annana)' },
  { value: '9', label: 'Juz 9 (Qalal Mala\'u)' },
  { value: '10', label: 'Juz 10 (Wa\'lamu)' },
  { value: '11', label: 'Juz 11 (Ya\'tazirun)' },
  { value: '12', label: 'Juz 12 (Wa Ma Min Dabbah)' },
  { value: '13', label: 'Juz 13 (Wa Ma Ubarri\'u)' },
  { value: '14', label: 'Juz 14 (Rubama)' },
  { value: '15', label: 'Juz 15 (Subhanallazi)' },
  { value: '16', label: 'Juz 16 (Qala Alam)' },
  { value: '17', label: 'Juz 17 (Iqtaraba)' },
  { value: '18', label: 'Juz 18 (Qad Aflaha)' },
  { value: '19', label: 'Juz 19 (Wa Qalal Lazina)' },
  { value: '20', label: 'Juz 20 (Amman Khalaqa)' },
  { value: '21', label: 'Juz 21 (Utlu Ma Uhiya)' },
  { value: '22', label: 'Juz 22 (Wa Man Yaqnut)' },
  { value: '23', label: 'Juz 23 (Wa Maliya)' },
  { value: '24', label: 'Juz 24 (Fa Man Azlamu)' },
  { value: '25', label: 'Juz 25 (Ilayhi Yuraddu)' },
  { value: '26', label: 'Juz 26 (Ha Mim)' },
  { value: '27', label: 'Juz 27 (Qala Fama Khatbukum)' },
  { value: '28', label: 'Juz 28 (Qad Sami\'a)' },
  { value: '29', label: 'Juz 29 (Tabarak)' },
  { value: '30', label: 'Juz 30 (Juz \'Amma)' },
];

interface PembimbingGroupTahfidz {
  pembimbing: string;
  pengajarDetail?: Pengajar;
  santriBinaan: Santri[];
  records: TahfidzRecord[];
  avgScore: number;
  mumtazCount: number;
}

export const TahfidzView: React.FC = () => {
  const { santriList, tahfidzList, addTahfidz, updateTahfidz, deleteTahfidz, currentUser, pengajarList } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPembimbing, setSelectedPembimbing] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<TahfidzRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Juz: '30',
    Surah: 'An-Naba',
    Ayat: '1 - 40 (Selesai Surah)',
    Kelancaran_Score: 90,
    Tajwid_Score: 90,
    Fashahah_Score: 90,
    Status_Lulus: 'Mumtaz',
    Pengajar: currentUser?.nama || 'Ustadzah Fitriyani',
    Catatan: 'Lancar dan mutqin.'
  });

  // Extract all unique pembimbing list with active santri binaan (exclude 0 santri)
  const allPembimbingList = useMemo(() => {
    const set = new Set<string>();
    
    santriList.forEach(s => {
      const p1 = s.Pembimbing ? s.Pembimbing.trim() : '';
      const p2 = s.Ustadz_Pembimbing ? s.Ustadz_Pembimbing.trim() : '';
      if (p1) set.add(p1);
      if (p2) set.add(p2);
    });

    if (set.size === 0) {
      pengajarList.forEach(p => {
        if (p.Nama_Pengajar) set.add(p.Nama_Pengajar.trim());
      });
    }

    return Array.from(set).filter(Boolean).sort();
  }, [pengajarList, santriList]);

  // Helper to normalize pembimbing for a record
  const getRecordPembimbing = (record: TahfidzRecord): string => {
    if (record.Pengajar && record.Pengajar.trim()) {
      return record.Pengajar.trim();
    }
    const santri = santriList.find(s => s.NIS === record.NIS);
    if (santri?.Pembimbing) return santri.Pembimbing.trim();
    if (santri?.Ustadz_Pembimbing) return santri.Ustadz_Pembimbing.trim();
    return 'Ustadzah Fitriyani';
  };

  const handleOpenAdd = (defaultPembimbing?: string) => {
    setEditingId(null);
    let targetSantri = santriList[0];
    if (defaultPembimbing && defaultPembimbing !== 'all') {
      const match = santriList.find(s => s.Pembimbing === defaultPembimbing || s.Ustadz_Pembimbing === defaultPembimbing);
      if (match) targetSantri = match;
    }

    const pembimbing = defaultPembimbing && defaultPembimbing !== 'all' 
      ? defaultPembimbing 
      : (targetSantri?.Pembimbing || targetSantri?.Ustadz_Pembimbing || currentUser?.nama || 'Ustadzah Fitriyani');

    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: targetSantri?.NIS || '',
      Juz: '30',
      Surah: 'An-Naba',
      Ayat: '1 - 40',
      Kelancaran_Score: 90,
      Tajwid_Score: 90,
      Fashahah_Score: 90,
      Status_Lulus: 'Mumtaz',
      Pengajar: pembimbing,
      Catatan: 'Lancar dan mutqin.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: TahfidzRecord) => {
    setEditingId(record.id);
    setFormData({
      Tanggal: record.Tanggal,
      NIS: record.NIS,
      Juz: record.Juz,
      Surah: record.Surah,
      Ayat: record.Ayat,
      Kelancaran_Score: record.Kelancaran_Score,
      Tajwid_Score: record.Tajwid_Score,
      Fashahah_Score: record.Fashahah_Score,
      Status_Lulus: record.Status_Lulus,
      Pengajar: getRecordPembimbing(record),
      Catatan: record.Catatan
    });
    setIsModalOpen(true);
  };

  const handleSantriChange = (selectedNis: string) => {
    const selectedSantri = santriList.find(s => s.NIS === selectedNis);
    const pembimbing = selectedSantri?.Pembimbing || selectedSantri?.Ustadz_Pembimbing || formData.Pengajar;
    setFormData(prev => ({
      ...prev,
      NIS: selectedNis,
      Pengajar: pembimbing || prev.Pengajar
    }));
  };

  const handleSurahSelect = (surahName: string) => {
    const found = QURAN_SURAH_LIST.find(s => s.name.toLowerCase() === surahName.toLowerCase());
    setFormData(prev => ({
      ...prev,
      Surah: surahName,
      Juz: found ? String(found.juz) : prev.Juz,
      Ayat: found ? `1 - ${found.ayatCount}` : prev.Ayat
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    const kelancaran = Number(formData.Kelancaran_Score) || 80;
    const tajwid = Number(formData.Tajwid_Score) || 80;
    const fashahah = Number(formData.Fashahah_Score) || 80;
    const rata = Math.round((kelancaran + tajwid + fashahah) / 3);

    let statusLulus: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Mengulang' | any = 'Mumtaz';
    if (rata >= 90) statusLulus = 'Mumtaz';
    else if (rata >= 80) statusLulus = 'Jayyid Jiddan';
    else if (rata >= 70) statusLulus = 'Jayyid';
    else if (rata >= 60) statusLulus = 'Maqbul';
    else statusLulus = 'Mengulang';

    if (formData.Status_Lulus) {
      statusLulus = formData.Status_Lulus;
    }

    if (editingId) {
      updateTahfidz(editingId, {
        Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
        NIS: formData.NIS,
        Juz: formData.Juz || '30',
        Surah: formData.Surah || 'An-Naba',
        Ayat: formData.Ayat || '1 - Selesai',
        Kelancaran_Score: kelancaran,
        Tajwid_Score: tajwid,
        Fashahah_Score: fashahah,
        Nilai_Rata: rata,
        Status_Lulus: statusLulus,
        Pengajar: formData.Pengajar || 'Ustadz Pembimbing',
        Catatan: formData.Catatan || '-'
      });
    } else {
      const newRecord: TahfidzRecord = {
        id: 'TF_' + Date.now(),
        Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
        NIS: formData.NIS,
        Juz: formData.Juz || '30',
        Surah: formData.Surah || 'An-Naba',
        Ayat: formData.Ayat || '1 - Selesai',
        Kelancaran_Score: kelancaran,
        Tajwid_Score: tajwid,
        Fashahah_Score: fashahah,
        Nilai_Rata: rata,
        Status_Lulus: statusLulus,
        Pengajar: formData.Pengajar || 'Ustadz Pembimbing',
        Catatan: formData.Catatan || '-'
      };

      addTahfidz(newRecord);

      if (rata >= 90) {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    setIsModalOpen(false);
  };

  const toggleGroupCollapse = (pembimbingName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [pembimbingName]: !prev[pembimbingName]
    }));
  };

  // Filter records based on search query and selected pembimbing filter tab
  const filteredRecords = useMemo(() => {
    return tahfidzList.filter(t => {
      const santri = santriList.find(s => s.NIS === t.NIS);
      const name = santri?.Nama_Lengkap.toLowerCase() || '';
      const q = searchQuery.toLowerCase();
      const recordPembimbing = getRecordPembimbing(t);

      const matchesSearch = 
        name.includes(q) ||
        t.NIS.toLowerCase().includes(q) ||
        t.Surah.toLowerCase().includes(q) ||
        t.Juz.toLowerCase().includes(q) ||
        recordPembimbing.toLowerCase().includes(q);

      const matchesPembimbing = 
        selectedPembimbing === 'all' || 
        recordPembimbing.toLowerCase() === selectedPembimbing.toLowerCase();

      return matchesSearch && matchesPembimbing;
    });
  }, [tahfidzList, santriList, searchQuery, selectedPembimbing]);

  // Group records by Ustadz / Ustadzah Pembimbing
  const groupedByPembimbing = useMemo<Record<string, PembimbingGroupTahfidz>>(() => {
    const groups: Record<string, PembimbingGroupTahfidz> = {};

    // Initialize all active pembimbing groups who have santri binaan
    allPembimbingList.forEach(name => {
      const santriBinaan = santriList.filter(s => 
        (s.Pembimbing && s.Pembimbing.trim().toLowerCase() === name.toLowerCase()) ||
        (s.Ustadz_Pembimbing && s.Ustadz_Pembimbing.trim().toLowerCase() === name.toLowerCase())
      );

      if (santriBinaan.length > 0) {
        const pDetail = pengajarList.find(p => p.Nama_Pengajar.toLowerCase() === name.toLowerCase());
        groups[name] = {
          pembimbing: name,
          pengajarDetail: pDetail,
          santriBinaan,
          records: [],
          avgScore: 0,
          mumtazCount: 0
        };
      }
    });

    // Distribute filtered records to corresponding groups
    filteredRecords.forEach(rec => {
      const pName = getRecordPembimbing(rec);
      if (groups[pName]) {
        groups[pName].records.push(rec);
      } else {
        const santriBinaan = santriList.filter(s => 
          (s.Pembimbing && s.Pembimbing.trim().toLowerCase() === pName.toLowerCase()) ||
          (s.Ustadz_Pembimbing && s.Ustadz_Pembimbing.trim().toLowerCase() === pName.toLowerCase())
        );
        if (santriBinaan.length > 0) {
          groups[pName] = {
            pembimbing: pName,
            pengajarDetail: pengajarList.find(p => p.Nama_Pengajar.toLowerCase() === pName.toLowerCase()),
            santriBinaan,
            records: [rec],
            avgScore: 0,
            mumtazCount: 0
          };
        }
      }
    });

    // Calculate metrics per group
    Object.values(groups).forEach((g: PembimbingGroupTahfidz) => {
      if (g.records.length > 0) {
        const totalScore = g.records.reduce((acc, r) => acc + (r.Nilai_Rata || 80), 0);
        g.avgScore = Math.round(totalScore / g.records.length);
        g.mumtazCount = g.records.filter(r => r.Status_Lulus === 'Mumtaz').length;
      }
    });

    return groups;
  }, [allPembimbingList, pengajarList, santriList, filteredRecords]);

  // Groups to display in grouped mode (exclude groups with 0 santri binaan)
  const visibleGroups = useMemo<PembimbingGroupTahfidz[]>(() => {
    const allGroups = (Object.values(groupedByPembimbing) as PembimbingGroupTahfidz[]).filter(
      (g: PembimbingGroupTahfidz) => g.santriBinaan.length > 0
    );
    if (selectedPembimbing !== 'all') {
      return allGroups.filter(g => 
        g.pembimbing.toLowerCase() === selectedPembimbing.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      return allGroups.filter(g => g.records.length > 0);
    }
    return allGroups;
  }, [groupedByPembimbing, selectedPembimbing, searchQuery]);

  const liveAvg = Math.round(
    ((Number(formData.Kelancaran_Score) || 0) +
      (Number(formData.Tajwid_Score) || 0) +
      (Number(formData.Fashahah_Score) || 0)) / 3
  );

  return (
    <div id="section-tahfidz-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Bar Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-5 rounded-3xl text-white shadow-xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Perkembangan Tahfidz Al-Qur'an
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950">
                Halaqah Pembimbing
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Pencatatan setoran hafalan harian, tasmi' juz, dan mutqin dikelompokkan sesuai Ustadz/Ustadzah Pembimbing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            id="btn-tambah-tahfidz"
            onClick={() => handleOpenAdd(selectedPembimbing !== 'all' ? selectedPembimbing : undefined)}
            className="w-full md:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Setoran Tahfidz</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Filter Tabs, Search & View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              id="search-tahfidz"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, surah, juz, atau catatan..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* View Mode Toggle & Counter */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
            <div className="text-xs text-gray-500 font-medium">
              Menampilkan: <span className="font-bold text-emerald-800">{filteredRecords.length}</span> Catatan
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === 'grouped' 
                    ? 'bg-white text-emerald-900 shadow-xs font-extrabold' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tampilan Dikelompokkan per Ustadz/Ustadzah Pembimbing"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grup Pembimbing</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-white text-emerald-900 shadow-xs font-extrabold' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tampilan Tabel Tunggal Lengkap"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tabel Master</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pembimbing Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100 text-xs scrollbar-thin">
          <button
            onClick={() => setSelectedPembimbing('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
              selectedPembimbing === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Semua Pembimbing</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedPembimbing === 'all' ? 'bg-emerald-950 text-amber-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {tahfidzList.length}
            </span>
          </button>

          {allPembimbingList.map(pName => {
            const count = tahfidzList.filter(t => getRecordPembimbing(t) === pName).length;
            const isSelected = selectedPembimbing.toLowerCase() === pName.toLowerCase();

            return (
              <button
                key={pName}
                onClick={() => setSelectedPembimbing(pName)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-3 h-3" />
                <span>{pName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-emerald-950 text-amber-300 font-bold' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: GROUPED BY USTADZ / USTADZAH PEMBIMBING */}
      {viewMode === 'grouped' && (
        <div className="space-y-6">
          {visibleGroups.map(group => {
            const isCollapsed = !!collapsedGroups[group.pembimbing];
            const records = group.records;

            return (
              <div 
                key={group.pembimbing}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Group Header Strip */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Halaqah {group.pembimbing}
                        </h4>
                        <span className="px-2 py-0.5 bg-white/20 text-yellow-300 rounded-full text-[10px] font-bold">
                          {records.length} Setoran
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200">
                        {group.pengajarDetail?.Gelar || 'Pembimbing Tahfidz'} &bull; {group.santriBinaan.length} Santri Binaan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(group.pembimbing)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1 cursor-pointer"
                      title={`Input setoran hafalan baru untuk ${group.pembimbing}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Input di Halaqah Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(group.pembimbing)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                      title={isCollapsed ? 'Buka Daftar Setoran' : 'Tutup Daftar Setoran'}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-info bar */}
                {!isCollapsed && (
                  <div className="px-5 py-3 bg-emerald-50/60 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Santri Binaan ({group.santriBinaan.length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {group.santriBinaan.slice(0, 6).map(s => (
                          <span key={s.NIS} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-[10px] font-medium">
                            {s.Nama_Lengkap.split(' ')[0]} ({s.NIS})
                          </span>
                        ))}
                        {group.santriBinaan.length > 6 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-lg text-[10px] font-bold">
                            +{group.santriBinaan.length - 6} santri lainnya
                          </span>
                        )}
                        {group.santriBinaan.length === 0 && (
                          <span className="text-[11px] text-gray-500 italic">Belum ada santri terdaftar</span>
                        )}
                      </div>
                    </div>

                    {records.length > 0 && (
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-gray-600">
                          Rata-rata Nilai: <strong className="text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">{group.avgScore}</strong>
                        </span>
                        <span className="text-gray-600">
                          Mumtaz: <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{group.mumtazCount}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Table for this group */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="p-3.5">Tanggal</th>
                          <th className="p-3.5">NIS & Nama Santri</th>
                          <th className="p-3.5">Juz & Surah (Ayat)</th>
                          <th className="p-3.5">Rincian Nilai (L/T/F)</th>
                          <th className="p-3.5">Rata-rata</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Catatan Evaluasi</th>
                          <th className="p-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {records.map(t => {
                          const santri = santriList.find(s => s.NIS === t.NIS);

                          let badgeColor = 'bg-emerald-100 text-emerald-800';
                          if (t.Status_Lulus === 'Mumtaz') badgeColor = 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300';
                          if (t.Status_Lulus === 'Jayyid Jiddan') badgeColor = 'bg-blue-100 text-blue-800 font-bold';
                          if (t.Status_Lulus === 'Mengulang') badgeColor = 'bg-rose-100 text-rose-800 font-bold';

                          return (
                            <tr key={t.id} className="hover:bg-gray-50/80 transition">
                              <td className="p-3.5 text-gray-700 font-medium whitespace-nowrap">{t.Tanggal}</td>
                              <td className="p-3.5">
                                <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || t.NIS}</span>
                                <span className="text-[10px] text-emerald-700 font-mono font-semibold">{t.NIS}</span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-bold text-emerald-900">Juz {t.Juz} - Surah {t.Surah}</span>
                                <span className="block text-[10px] text-gray-500">Ayat {t.Ayat}</span>
                              </td>
                              <td className="p-3.5">
                                <div className="text-[10px] font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 inline-block whitespace-nowrap">
                                  L: {t.Kelancaran_Score} &bull; T: {t.Tajwid_Score} &bull; F: {t.Fashahah_Score}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{t.Nilai_Rata}</span>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 text-[10px] rounded-full whitespace-nowrap ${badgeColor}`}>
                                  {t.Status_Lulus}
                                </span>
                              </td>
                              <td className="p-3.5 text-gray-600 max-w-xs text-[11px]">{t.Catatan || '-'}</td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    id={`btn-edit-tahfidz-${t.id}`}
                                    onClick={() => handleOpenEdit(t)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                    title="Edit Setoran Tahfidz"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`btn-delete-tahfidz-${t.id}`}
                                    onClick={() => {
                                      if (window.confirm(`Hapus catatan setoran Surah ${t.Surah} untuk ${santri?.Nama_Lengkap || t.NIS}?`)) {
                                        deleteTahfidz(t.id);
                                      }
                                    }}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {records.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-gray-400">
                              Belum ada catatan setoran tahfidz untuk {group.pembimbing}. Klik tombol <strong>"Input di Halaqah Ini"</strong> untuk mencatat setoran baru.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {visibleGroups.length === 0 && (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-400">
              Tidak ditemukan data setoran tahfidz untuk kriteria pencarian ini.
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: MASTER TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">NIS & Nama Santri</th>
                  <th className="p-3.5">Ustadz/Ustadzah Pembimbing</th>
                  <th className="p-3.5">Juz & Surah (Ayat)</th>
                  <th className="p-3.5">Rincian Nilai (L/T/F)</th>
                  <th className="p-3.5">Rata-rata</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Catatan Evaluasi</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map(t => {
                  const santri = santriList.find(s => s.NIS === t.NIS);
                  const pembimbing = getRecordPembimbing(t);

                  let badgeColor = 'bg-emerald-100 text-emerald-800';
                  if (t.Status_Lulus === 'Mumtaz') badgeColor = 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300';
                  if (t.Status_Lulus === 'Jayyid Jiddan') badgeColor = 'bg-blue-100 text-blue-800 font-bold';
                  if (t.Status_Lulus === 'Mengulang') badgeColor = 'bg-rose-100 text-rose-800 font-bold';

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5 text-gray-700 font-medium whitespace-nowrap">{t.Tanggal}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || t.NIS}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">{t.NIS}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gray-900 font-bold text-xs block">{pembimbing}</span>
                        <span className="text-[10px] text-gray-500">Halaqah Binaan</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-emerald-900">Juz {t.Juz} - Surah {t.Surah}</span>
                        <span className="block text-[10px] text-gray-500">Ayat {t.Ayat}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-[10px] font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 inline-block whitespace-nowrap">
                          L: {t.Kelancaran_Score} &bull; T: {t.Tajwid_Score} &bull; F: {t.Fashahah_Score}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{t.Nilai_Rata}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-[10px] rounded-full whitespace-nowrap ${badgeColor}`}>
                          {t.Status_Lulus}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 max-w-xs text-[11px]">{t.Catatan || '-'}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-edit-tahfidz-table-${t.id}`}
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Setoran Tahfidz"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-tahfidz-table-${t.id}`}
                            onClick={() => {
                              if (window.confirm(`Hapus catatan setoran Surah ${t.Surah} untuk ${santri?.Nama_Lengkap || t.NIS}?`)) {
                                deleteTahfidz(t.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Belum ada catatan setoran tahfidz yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input / Edit Tahfidz */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingId ? 'Edit Data Setoran Tahfidz Al-Qur\'an' : 'Input Setoran Tahfidz Al-Qur\'an'}
                </h3>
                <p className="text-[10px] text-emerald-200">
                  {editingId ? 'Perbarui detail surah, hafalan, dan penilaian pembimbing' : 'Catat setoran hafalan harian santri sesuai pembimbing halaqah'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Setoran</label>
                  <input
                    type="date"
                    value={formData.Tanggal}
                    onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pilih Santri</label>
                  <select
                    value={formData.NIS}
                    onChange={(e) => handleSantriChange(e.target.value)}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {santriList.map(s => (
                      <option key={s.NIS} value={s.NIS}>
                        {s.NIS} - {s.Nama_Lengkap} ({s.Pembimbing || s.Ustadz_Pembimbing || 'Halaqah'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ustadz / Ustadzah Pembimbing</label>
                <select
                  value={formData.Pengajar}
                  onChange={(e) => setFormData({ ...formData, Pengajar: e.target.value })}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                >
                  <option value="">-- Pilih Ustadz / Ustadzah Pembimbing --</option>
                  {allPembimbingList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Juz</label>
                  <select
                    value={formData.Juz}
                    onChange={(e) => setFormData({ ...formData, Juz: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    {JUZ_LIST.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Surah (114 Surat)</label>
                  <select
                    value={formData.Surah}
                    onChange={(e) => handleSurahSelect(e.target.value)}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    <option value="">-- Pilih Surat Al-Qur'an (1 - 114) --</option>
                    {QURAN_SURAH_LIST.map((s) => (
                      <option key={s.number} value={s.name}>
                        {s.number}. {s.name} ({s.arabicName}) - {s.ayatCount} Ayat [Juz {s.juz}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Rentang Ayat</label>
                <input
                  type="text"
                  value={formData.Ayat}
                  onChange={(e) => setFormData({ ...formData, Ayat: e.target.value })}
                  placeholder="misal: 1 - 40 (Selesai Surah) atau Ayat 1 - 20"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Penilaian Hafalan</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Rata-rata: {liveAvg}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Kelancaran</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.Kelancaran_Score}
                      onChange={(e) => setFormData({ ...formData, Kelancaran_Score: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tajwid</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.Tajwid_Score}
                      onChange={(e) => setFormData({ ...formData, Tajwid_Score: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Fashahah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.Fashahah_Score}
                      onChange={(e) => setFormData({ ...formData, Fashahah_Score: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Kelulusan</label>
                <select
                  value={formData.Status_Lulus}
                  onChange={(e) => setFormData({ ...formData, Status_Lulus: e.target.value as any })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Mumtaz">Mumtaz (Istimewa / Nilai 90-100)</option>
                  <option value="Jayyid Jiddan">Jayyid Jiddan (Sangat Baik / Nilai 80-89)</option>
                  <option value="Jayyid">Jayyid (Baik / Nilai 70-79)</option>
                  <option value="Maqbul">Maqbul (Cukup / Nilai 60-69)</option>
                  <option value="Mengulang">Mengulang (Perlu Pengulangan / &lt; 60)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan & Masukan Ustadz / Pembimbing</label>
                <textarea
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Catatan kelemahan ayat, makhraj, atau pujian kelancaran mutqin..."
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Setoran Tahfidz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
