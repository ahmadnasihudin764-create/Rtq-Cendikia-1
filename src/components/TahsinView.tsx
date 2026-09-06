import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TahsinRecord, Santri, Pengajar } from '../types';
import { 
  Plus, 
  BookOpenCheck, 
  Search, 
  Trash2, 
  Pencil, 
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

interface PembimbingGroupTahsin {
  pembimbing: string;
  pengajarDetail?: Pengajar;
  santriBinaan: Santri[];
  records: TahsinRecord[];
  avgMakhraj: number;
  avgTajwid: number;
  naikJilidCount: number;
}

export const TahsinView: React.FC = () => {
  const { santriList, tahsinList, addTahsin, updateTahsin, deleteTahsin, currentUser, pengajarList } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPembimbing, setSelectedPembimbing] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<TahsinRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Jilid_Iqra: 'Iqra Jilid 1',
    Halaman: 'Halaman 1',
    Makhraj_Score: 85,
    Tajwid_Score: 85,
    Catatan: 'Lancar dan makhraj fasih.',
    Status_Naik: 'Naik Halaman',
    Pengajar: currentUser?.nama || 'Ustadzah Fitriyani'
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

  // Helper to normalize pembimbing for a tahsin record
  const getRecordPembimbing = (record: TahsinRecord): string => {
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
      Jilid_Iqra: 'Iqra Jilid 1',
      Halaman: 'Halaman 1',
      Makhraj_Score: 85,
      Tajwid_Score: 85,
      Catatan: 'Lancar dan makhraj fasih.',
      Status_Naik: 'Naik Halaman',
      Pengajar: pembimbing
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: TahsinRecord) => {
    setEditingId(record.id);
    setFormData({
      Tanggal: record.Tanggal,
      NIS: record.NIS,
      Jilid_Iqra: record.Jilid_Iqra,
      Halaman: record.Halaman,
      Makhraj_Score: record.Makhraj_Score,
      Tajwid_Score: record.Tajwid_Score,
      Catatan: record.Catatan,
      Status_Naik: record.Status_Naik,
      Pengajar: getRecordPembimbing(record)
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    if (editingId) {
      updateTahsin(editingId, {
        Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
        NIS: formData.NIS,
        Jilid_Iqra: formData.Jilid_Iqra || 'Iqra Jilid 1',
        Halaman: formData.Halaman || 'Halaman 1',
        Makhraj_Score: Number(formData.Makhraj_Score) || 80,
        Tajwid_Score: Number(formData.Tajwid_Score) || 80,
        Catatan: formData.Catatan || '-',
        Status_Naik: (formData.Status_Naik as any) || 'Naik Halaman',
        Pengajar: formData.Pengajar || 'Ustadz Pembimbing'
      });
    } else {
      addTahsin({
        id: 'TS_' + Date.now(),
        Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
        NIS: formData.NIS,
        Jilid_Iqra: formData.Jilid_Iqra || 'Iqra Jilid 1',
        Halaman: formData.Halaman || 'Halaman 1',
        Makhraj_Score: Number(formData.Makhraj_Score) || 80,
        Tajwid_Score: Number(formData.Tajwid_Score) || 80,
        Catatan: formData.Catatan || '-',
        Status_Naik: (formData.Status_Naik as any) || 'Naik Halaman',
        Pengajar: formData.Pengajar || 'Ustadz Pembimbing'
      });
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
    return tahsinList.filter(t => {
      const santri = santriList.find(s => s.NIS === t.NIS);
      const name = santri?.Nama_Lengkap.toLowerCase() || '';
      const q = searchQuery.toLowerCase();
      const recordPembimbing = getRecordPembimbing(t);

      const matchesSearch = 
        name.includes(q) ||
        t.NIS.toLowerCase().includes(q) ||
        t.Jilid_Iqra.toLowerCase().includes(q) ||
        t.Halaman.toLowerCase().includes(q) ||
        recordPembimbing.toLowerCase().includes(q);

      const matchesPembimbing = 
        selectedPembimbing === 'all' || 
        recordPembimbing.toLowerCase() === selectedPembimbing.toLowerCase();

      return matchesSearch && matchesPembimbing;
    });
  }, [tahsinList, santriList, searchQuery, selectedPembimbing]);

  // Group records by Ustadz / Ustadzah Pembimbing
  const groupedByPembimbing = useMemo<Record<string, PembimbingGroupTahsin>>(() => {
    const groups: Record<string, PembimbingGroupTahsin> = {};

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
          avgMakhraj: 0,
          avgTajwid: 0,
          naikJilidCount: 0
        };
      }
    });

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
            avgMakhraj: 0,
            avgTajwid: 0,
            naikJilidCount: 0
          };
        }
      }
    });

    Object.values(groups).forEach((g: PembimbingGroupTahsin) => {
      if (g.records.length > 0) {
        const totalMakhraj = g.records.reduce((acc, r) => acc + (r.Makhraj_Score || 80), 0);
        const totalTajwid = g.records.reduce((acc, r) => acc + (r.Tajwid_Score || 80), 0);
        g.avgMakhraj = Math.round(totalMakhraj / g.records.length);
        g.avgTajwid = Math.round(totalTajwid / g.records.length);
        g.naikJilidCount = g.records.filter(r => r.Status_Naik === 'Naik Jilid' || r.Status_Naik === 'Selesai Iqra').length;
      }
    });

    return groups;
  }, [allPembimbingList, pengajarList, santriList, filteredRecords]);

  // Groups to display in grouped mode (exclude groups with 0 santri binaan)
  const visibleGroups = useMemo<PembimbingGroupTahsin[]>(() => {
    const allGroups = (Object.values(groupedByPembimbing) as PembimbingGroupTahsin[]).filter(
      (g: PembimbingGroupTahsin) => g.santriBinaan.length > 0
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

  return (
    <div id="section-tahsin-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-emerald-950 p-5 rounded-3xl text-white shadow-xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Perkembangan Tahsin & Iqra'
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950">
                Halaqah Pembimbing
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Pencatatan jilid Iqra 1-6, kelancaran makhraj, dan hukum tajwid dikelompokkan sesuai Ustadz/Ustadzah Pembimbing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            id="btn-tambah-tahsin"
            onClick={() => handleOpenAdd(selectedPembimbing !== 'all' ? selectedPembimbing : undefined)}
            className="w-full md:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Setoran Tahsin</span>
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
              id="search-tahsin"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, jilid iqra, halaman..."
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
              {tahsinList.length}
            </span>
          </button>

          {allPembimbingList.map(pName => {
            const count = tahsinList.filter(t => getRecordPembimbing(t) === pName).length;
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
                          {records.length} Catatan Tahsin
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200">
                        {group.pengajarDetail?.Gelar || 'Pembimbing Tahsin'} &bull; {group.santriBinaan.length} Santri Binaan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(group.pembimbing)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1 cursor-pointer"
                      title={`Input catatan tahsin baru untuk ${group.pembimbing}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Input di Halaqah Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(group.pembimbing)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                      title={isCollapsed ? 'Buka Daftar Tahsin' : 'Tutup Daftar Tahsin'}
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
                          Rata-rata Makhraj: <strong className="text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">{group.avgMakhraj}</strong>
                        </span>
                        <span className="text-gray-600">
                          Rata-rata Tajwid: <strong className="text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">{group.avgTajwid}</strong>
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
                          <th className="p-3.5">Tingkat Jilid & Halaman</th>
                          <th className="p-3.5">Skor (M/T)</th>
                          <th className="p-3.5">Catatan Evaluasi</th>
                          <th className="p-3.5">Status Kenaikan</th>
                          <th className="p-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {records.map(t => {
                          const santri = santriList.find(s => s.NIS === t.NIS);

                          let badgeColor = 'bg-blue-100 text-blue-800';
                          if (t.Status_Naik === 'Naik Jilid') badgeColor = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                          if (t.Status_Naik === 'Ulangi') badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                          if (t.Status_Naik === 'Selesai Iqra') badgeColor = 'bg-purple-100 text-purple-800 font-bold border border-purple-300';

                          return (
                            <tr key={t.id} className="hover:bg-gray-50/80 transition">
                              <td className="p-3.5 text-gray-700 font-medium whitespace-nowrap">{t.Tanggal}</td>
                              <td className="p-3.5">
                                <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || t.NIS}</span>
                                <span className="text-[10px] text-emerald-700 font-mono font-semibold">{t.NIS}</span>
                              </td>
                              <td className="p-3.5 font-semibold text-gray-800">
                                <span className="font-bold text-emerald-900">{t.Jilid_Iqra}</span>
                                <span className="block text-[10px] text-gray-500 font-normal">{t.Halaman}</span>
                              </td>
                              <td className="p-3.5">
                                <span className="inline-block bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-700 whitespace-nowrap">
                                  M: <b className="text-gray-900">{t.Makhraj_Score}</b> &bull; T: <b className="text-gray-900">{t.Tajwid_Score}</b>
                                </span>
                              </td>
                              <td className="p-3.5 text-gray-600 max-w-xs text-[11px]">{t.Catatan || '-'}</td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 text-[10px] rounded-full whitespace-nowrap ${badgeColor}`}>
                                  {t.Status_Naik}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    id={`btn-edit-tahsin-${t.id}`}
                                    onClick={() => handleOpenEdit(t)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                    title="Edit Setoran Tahsin"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`btn-delete-tahsin-${t.id}`}
                                    onClick={() => {
                                      if (window.confirm(`Hapus catatan tahsin ${t.Jilid_Iqra} untuk ${santri?.Nama_Lengkap || t.NIS}?`)) {
                                        deleteTahsin(t.id);
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
                            <td colSpan={7} className="p-6 text-center text-gray-400">
                              Belum ada catatan setoran tahsin untuk {group.pembimbing}. Klik tombol <strong>"Input di Halaqah Ini"</strong> untuk mencatat setoran baru.
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
              Tidak ditemukan data tahsin untuk kriteria pencarian ini.
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
                  <th className="p-3.5">Tingkat Jilid & Halaman</th>
                  <th className="p-3.5">Skor (M/T)</th>
                  <th className="p-3.5">Catatan Evaluasi</th>
                  <th className="p-3.5">Status Kenaikan</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map(t => {
                  const santri = santriList.find(s => s.NIS === t.NIS);
                  const pembimbing = getRecordPembimbing(t);

                  let badgeColor = 'bg-blue-100 text-blue-800';
                  if (t.Status_Naik === 'Naik Jilid') badgeColor = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                  if (t.Status_Naik === 'Ulangi') badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                  if (t.Status_Naik === 'Selesai Iqra') badgeColor = 'bg-purple-100 text-purple-800 font-bold border border-purple-300';

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
                      <td className="p-3.5 font-semibold text-gray-800">
                        <span className="font-bold text-emerald-900">{t.Jilid_Iqra}</span>
                        <span className="block text-[10px] text-gray-500 font-normal">{t.Halaman}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-700 whitespace-nowrap">
                          M: <b className="text-gray-900">{t.Makhraj_Score}</b> &bull; T: <b className="text-gray-900">{t.Tajwid_Score}</b>
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 max-w-xs text-[11px]">{t.Catatan || '-'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-[10px] rounded-full whitespace-nowrap ${badgeColor}`}>
                          {t.Status_Naik}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-edit-tahsin-table-${t.id}`}
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Setoran Tahsin"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-tahsin-table-${t.id}`}
                            onClick={() => {
                              if (window.confirm(`Hapus catatan tahsin ${t.Jilid_Iqra} untuk ${santri?.Nama_Lengkap || t.NIS}?`)) {
                                deleteTahsin(t.id);
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
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Belum ada data setoran tahsin yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input / Edit Tahsin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingId ? 'Edit Data Perkembangan Tahsin & Iqra\'' : 'Input Setoran Tahsin / Iqra\''}
                </h3>
                <p className="text-[10px] text-emerald-200">
                  {editingId ? 'Perbarui tingkat jilid, skor makhraj, tajwid, dan status kenaikan' : 'Catat kemajuan pembelajaran Iqra atau Al-Qur\'an santri sesuai pembimbing halaqah'}
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
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Bimbingan</label>
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
                  <label className="block font-bold text-gray-700 mb-1">Jilid Iqra' / Kitab</label>
                  <select
                    value={formData.Jilid_Iqra}
                    onChange={(e) => setFormData({ ...formData, Jilid_Iqra: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    <option value="Iqro' Jilid 1">Iqro' Jilid 1</option>
                    <option value="Iqro' Jilid 2">Iqro' Jilid 2</option>
                    <option value="Iqro' Jilid 3">Iqro' Jilid 3</option>
                    <option value="Iqro' Jilid 4">Iqro' Jilid 4</option>
                    <option value="Iqro' Jilid 5">Iqro' Jilid 5</option>
                    <option value="Iqro' Jilid 6">Iqro' Jilid 6</option>
                    <option value="Al Qur'an">Al Qur'an</option>
                    <option value="Iqra Jilid 1">Iqra Jilid 1</option>
                    <option value="Iqra Jilid 2">Iqra Jilid 2</option>
                    <option value="Iqra Jilid 3">Iqra Jilid 3</option>
                    <option value="Iqra Jilid 4">Iqra Jilid 4</option>
                    <option value="Iqra Jilid 5">Iqra Jilid 5</option>
                    <option value="Iqra Jilid 6">Iqra Jilid 6</option>
                    <option value="Al-Qur'an Dasar (Juz 'Amma)">Al-Qur'an Dasar (Juz 'Amma)</option>
                    <option value="Al-Qur'an Lanjutan (Tajwid)">Al-Qur'an Lanjutan (Tajwid)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Halaman / Baris</label>
                  <input
                    type="text"
                    value={formData.Halaman}
                    onChange={(e) => setFormData({ ...formData, Halaman: e.target.value })}
                    placeholder="misal: Halaman 15, Baris 1-5"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nilai Makhraj (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.Makhraj_Score}
                    onChange={(e) => setFormData({ ...formData, Makhraj_Score: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nilai Tajwid (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.Tajwid_Score}
                    onChange={(e) => setFormData({ ...formData, Tajwid_Score: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Kenaikan</label>
                <select
                  value={formData.Status_Naik}
                  onChange={(e) => setFormData({ ...formData, Status_Naik: e.target.value as any })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                >
                  <option value="Naik Halaman">Naik Halaman (Lanjut Halaman Berikutnya)</option>
                  <option value="Naik Jilid">Naik Jilid (Tuntas Jilid & Naik Tingkat)</option>
                  <option value="Ulangi">Ulangi (Perlu Penguatan di Halaman Ini)</option>
                  <option value="Selesai Iqra">Selesai Iqra' (Lulus Tahsin Dasar & Masuk Al-Qur'an)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan & Evaluasi Ustadz / Pembimbing</label>
                <textarea
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Catatan pelafalan huruf, panjang pendek mad, ghunnah..."
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
                  {editingId ? 'Simpan Perubahan' : 'Simpan Setoran Tahsin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
