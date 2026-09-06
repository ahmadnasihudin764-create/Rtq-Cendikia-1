import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { computeHafalanAnalytics, JuzTierStat, SantriHafalanStat } from '../utils/hafalanAnalytics';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  UserCheck, 
  Printer, 
  ChevronRight,
  Info,
  Medal,
  X,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react';

export const GrafikHafalanView: React.FC = () => {
  const { 
    santriList, 
    tahfidzList, 
    targetList, 
    currentUser, 
    getSantriForWali, 
    setActiveMenu,
    setSelectedSantriForCard
  } = useApp();

  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'ringkas' | 'detail' | 'tabel'>('ringkas');
  const [selectedTierKey, setSelectedTierKey] = useState<string | null>(null);
  const [searchSantri, setSearchSantri] = useState<string>('');
  const [selectedSantriDetail, setSelectedSantriDetail] = useState<SantriHafalanStat | null>(null);

  const isWali = currentUser?.role === 'Wali Santri';
  const childSantri = isWali ? getSantriForWali() : null;

  // Extract unique halaqah and pembimbing list for filter
  const halaqahFilterOptions = useMemo(() => {
    const set = new Set<string>();
    santriList.forEach(s => {
      if (s.Halaqah && s.Halaqah !== 'Semua Halaqoh') set.add(s.Halaqah.trim());
      if (s.Pembimbing) set.add(s.Pembimbing.trim());
      if (s.Ustadz_Pembimbing) set.add(s.Ustadz_Pembimbing.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [santriList]);

  // Compute analytics
  const analytics = useMemo(() => {
    return computeHafalanAnalytics(santriList, tahfidzList, targetList, selectedHalaqah);
  }, [santriList, tahfidzList, targetList, selectedHalaqah]);

  // Child statistics if user is Wali Santri
  const childStat = useMemo(() => {
    if (!childSantri) return null;
    return analytics.santriHafalanList.find(s => s.santri.NIS === childSantri.NIS);
  }, [childSantri, analytics]);

  // Active stats tier to display in chart
  const displayedTierStats = viewMode === 'detail' ? analytics.exactJuzStats : analytics.groupedTierStats;

  // Filtered santri list for the table
  const filteredSantriTable = useMemo(() => {
    return analytics.santriHafalanList.filter(item => {
      const matchSearch = 
        item.santri.Nama_Lengkap.toLowerCase().includes(searchSantri.toLowerCase()) ||
        item.santri.NIS.toLowerCase().includes(searchSantri.toLowerCase()) ||
        (item.santri.Pembimbing || '').toLowerCase().includes(searchSantri.toLowerCase()) ||
        (item.santri.Halaqah || '').toLowerCase().includes(searchSantri.toLowerCase()) ||
        item.juzListFormatted.toLowerCase().includes(searchSantri.toLowerCase());

      if (!matchSearch) return false;

      if (selectedTierKey) {
        if (viewMode === 'detail') {
          const targetJuzNum = parseInt(selectedTierKey.replace('juz-', ''), 10);
          return item.juzCount === targetJuzNum;
        } else {
          const tier = analytics.groupedTierStats.find(t => t.key === selectedTierKey);
          if (tier) {
            return tier.santriList.some(s => s.santri.NIS === item.santri.NIS);
          }
        }
      }

      return true;
    });
  }, [analytics, searchSantri, selectedTierKey, viewMode]);

  // Selected tier for detail modal or section
  const activeSelectedTier = useMemo(() => {
    if (!selectedTierKey) return null;
    return displayedTierStats.find(t => t.key === selectedTierKey);
  }, [selectedTierKey, displayedTierStats]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="section-grafik-hafalan" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Statistik Terpadu Capaian Tahfidz Santri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Grafik Perolehan Hafalan Al-Qur'an
          </h2>
          <p className="text-xs text-emerald-200 mt-1.5 leading-relaxed">
            Sinkronisasi data real-time dengan catatan setoran Tahfidz Santri: distribusi persentase (%), jumlah juz mutqin, log setoran, serta rata-rata nilai kelulusan.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-emerald-600/50 transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Grafik</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('tahfidz')}
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola Setoran Tahfidz</span>
          </button>
        </div>
      </div>

      {/* Special Highlight for Wali Santri */}
      {isWali && childSantri && (
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-emerald-50 border-2 border-yellow-300/80 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                {childStat?.juzCount || 0}
                <span className="text-[10px] ml-0.5">Juz</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  Capaian Hafalan Ananda
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {childSantri.Nama_Lengkap} <span className="text-xs text-gray-500 font-normal">({childSantri.NIS})</span>
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Halaqah: <span className="font-semibold text-emerald-800">{childSantri.Halaqah}</span> | Pembimbing: <span className="font-semibold text-gray-800">{childSantri.Pembimbing || childSantri.Ustadz_Pembimbing || 'Ustadz Pembimbing'}</span>
                </p>
                {childStat && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Hafalan Mutqin: <span className="font-bold">{childStat.juzListFormatted}</span> • Total {childStat.totalSetoran} Catatan Setoran (Nilai Rata-rata: {childStat.averageNilai || '-'})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-yellow-200 shadow-xs text-right sm:min-w-[200px]">
                <span className="text-[11px] text-gray-500 block">Posisi dalam Angkatan</span>
                <span className="text-sm font-black text-emerald-700">
                  Kategori {childStat?.juzCount || 0} Juz
                </span>
                <span className="text-[11px] text-gray-600 block">
                  {childStat && childStat.juzCount > 0 
                    ? `Termasuk dalam ${((analytics.exactJuzStats.find(j => j.juzNumber === childStat.juzCount)?.percentage) || 0)}% santri di tingkatan ini`
                    : 'Fase Pembinaan Tahsin & Pra-Tahfidz'}
                </span>
              </div>
              {childStat && (
                <button
                  onClick={() => setSelectedSantriDetail(childStat)}
                  className="text-xs font-bold text-emerald-800 bg-yellow-300 hover:bg-yellow-400 px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Riwayat Setoran Ananda</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 block truncate">Total Santri Aktif</span>
            <span className="text-lg font-black text-gray-900">{analytics.totalSantri} <span className="text-xs font-medium text-gray-500">Santri</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 block truncate">Santri Berhafalan</span>
            <span className="text-lg font-black text-teal-700">{analytics.totalSantriTahfidz} <span className="text-xs font-semibold text-teal-600">({+((analytics.totalSantriTahfidz / analytics.totalSantri) * 100).toFixed(1)}%)</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 block truncate">Total Akumulasi Juz</span>
            <span className="text-lg font-black text-amber-800">{analytics.totalAkumulasiJuz} <span className="text-xs font-medium text-gray-500">Juz</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 block truncate">Setoran & Rata-rata Nilai</span>
            <span className="text-lg font-black text-indigo-800">{analytics.totalSetoranCatatan} <span className="text-xs font-normal text-gray-500">Data (Avg: {analytics.averageNilaiTotal || 90})</span></span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-700">Filter Halaqah / Pembimbing:</span>
          <select
            value={selectedHalaqah}
            onChange={(e) => {
              setSelectedHalaqah(e.target.value);
              setSelectedTierKey(null);
            }}
            className="text-xs font-medium bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Halaqah & Pembimbing</option>
            {halaqahFilterOptions.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('ringkas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'ringkas'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik Ringkas</span>
          </button>
          
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'detail'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Rincian 1 - 30 Juz</span>
          </button>

          <button
            onClick={() => setViewMode('tabel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'tabel'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Santri</span>
          </button>
        </div>
      </div>

      {/* Main Visual Section: Chart & Top Achievers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Interactive Bar & Percentage Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <span>Distribusi Persentase (%) & Jumlah Santri per Perolehan Juz</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {viewMode === 'ringkas' 
                  ? 'Pengelompokan tingkat perolehan hafalan 1 Juz, 2 Juz, 3 Juz, dst.'
                  : 'Rincian detail per juz dari Juz 1 sampai Juz 30.'}
                {' '}Klik baris grafik untuk memfilter daftar santri.
              </p>
            </div>
            {selectedTierKey && (
              <button
                onClick={() => setSelectedTierKey(null)}
                className="text-xs text-emerald-700 hover:underline font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                Reset Pilihan
              </button>
            )}
          </div>

          {/* Graphical Bars */}
          <div className="space-y-3.5 pt-2">
            {displayedTierStats.map((tier) => {
              const isSelected = selectedTierKey === tier.key;
              const hasChild = isWali && childStat && (
                viewMode === 'detail' 
                  ? childStat.juzCount === tier.juzNumber
                  : tier.santriList.some(s => s.santri.NIS === childSantri?.NIS)
              );

              return (
                <div
                  key={tier.key}
                  onClick={() => setSelectedTierKey(isSelected ? null : tier.key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-700 bg-emerald-50/70 shadow-xs scale-[1.01]' 
                      : hasChild
                        ? 'border-amber-400 bg-amber-50/40 hover:bg-amber-50/70'
                        : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{tier.label}</span>
                      {hasChild && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Ananda Disini
                        </span>
                      )}
                      {isSelected && (
                        <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Dipilih
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-gray-800">{tier.count} Santri</span>
                      <span className="font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg text-xs">
                        {tier.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${tier.bgColor}`}
                      style={{ width: `${Math.max(tier.percentage > 0 ? 3 : 0, tier.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Tier Summary */}
          {activeSelectedTier && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">
                  Kategori Terpilih: {activeSelectedTier.label}
                </span>
                <span className="text-emerald-800">
                  Terdapat <strong className="text-emerald-950">{activeSelectedTier.count} santri</strong> ({activeSelectedTier.percentage}% dari total santri) pada kategori ini.
                </span>
              </div>
              <button
                onClick={() => setViewMode('tabel')}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition text-xs shadow-xs"
              >
                Lihat di Tabel →
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Top Hafidz/Hafidzah & Quick Insights */}
        <div className="space-y-4">
          
          {/* Top Achievers Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <div className="flex items-center space-x-2">
                <Medal className="w-5 h-5 text-yellow-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                  Top Capaian Santri
                </h4>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded-full font-semibold border border-emerald-700/60">
                Tertinggi
              </span>
            </div>

            {analytics.topSantri.length === 0 ? (
              <p className="text-xs text-emerald-200 text-center py-4">Belum ada data setoran tahfidz.</p>
            ) : (
              <div className="space-y-2.5">
                {analytics.topSantri.map((item, idx) => (
                  <div
                    key={item.santri.NIS}
                    onClick={() => setSelectedSantriDetail(item)}
                    className="p-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 rounded-2xl border border-emerald-800/60 flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-xs flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-yellow-300 transition">
                          {item.santri.Nama_Lengkap}
                        </h5>
                        <span className="text-[10px] text-emerald-300 block truncate">
                          {item.santri.Kelas} • {item.juzListFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-black text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded-lg border border-yellow-400/30">
                        {item.juzCount} Juz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-emerald-800/80 text-[11px] text-emerald-200 flex items-center justify-between">
              <span>Akumulasi Total:</span>
              <strong className="text-yellow-300 font-bold">{analytics.totalAkumulasiJuz} Juz Terhafal</strong>
            </div>
          </div>

          {/* Quick Guidance Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Sinkronisasi Data Tahfidz</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Data grafik dihitung langsung secara otomatis dari catatan setoran Tahfidz, surah/ayat, nilai kelancaran, tajwid, dan predikat kelulusan yang diinput oleh Ustadz/Ustadzah.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Status Integrasi:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                Otomatis & Real-time
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Santri Breakdown Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Rincian Santri & Catatan Tahfidz ({filteredSantriTable.length} Santri)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedTierKey ? `Menampilkan santri pada kategori: ${activeSelectedTier?.label}` : 'Daftar seluruh santri aktif beserta jumlah juz, rincian juz mutqin, dan riwayat setoran.'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchSantri}
              onChange={(e) => setSearchSantri(e.target.value)}
              placeholder="Cari santri, NIS, juz..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center">No</th>
                <th className="p-3.5">Santri</th>
                <th className="p-3.5">Kelas / Halaqah</th>
                <th className="p-3.5">Pembimbing</th>
                <th className="p-3.5 text-center">Perolehan Juz</th>
                <th className="p-3.5">Rincian Juz Terhafal</th>
                <th className="p-3.5 text-center">Setoran & Nilai</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSantriTable.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500 text-xs">
                    Tidak ditemukan data santri dengan filter pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredSantriTable.map((item, idx) => {
                  const isOwnChild = isWali && childSantri?.NIS === item.santri.NIS;

                  return (
                    <tr
                      key={item.santri.NIS}
                      className={`hover:bg-gray-50 transition ${isOwnChild ? 'bg-amber-50/70 font-semibold' : ''}`}
                    >
                      <td className="p-3.5 text-gray-500 text-center w-12">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {item.santri.Nama_Lengkap.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                              {item.santri.Nama_Lengkap}
                              {isOwnChild && (
                                <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  Ananda
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-500">NIS: {item.santri.NIS}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gray-900 block">{item.santri.Kelas}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{item.santri.Halaqah}</span>
                      </td>
                      <td className="p-3.5 text-gray-700">
                        {item.santri.Pembimbing || item.santri.Ustadz_Pembimbing || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-xl font-black text-xs ${
                          item.juzCount >= 3 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : item.juzCount > 0 
                              ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.juzCount > 0 ? `${item.juzCount} Juz` : '0 Juz'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs text-gray-700 block font-medium">
                          {item.juzListFormatted}
                        </span>
                        {item.latestRecord && (
                          <span className="text-[10px] text-gray-500 block truncate">
                            Terakhir: {item.latestRecord.Surah} ({item.latestRecord.Tanggal})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-gray-800">
                            {item.totalSetoran} Setoran
                          </span>
                          {item.averageNilai > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                              Nilai Avg: {item.averageNilai}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedSantriDetail(item)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition inline-flex items-center gap-1 shadow-2xs"
                          title="Lihat Rincian Setoran Tahfidz"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Riwayat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Riwayat Setoran Tahfidz Santri */}
      {selectedSantriDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-sm">
                  {selectedSantriDetail.juzCount}J
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedSantriDetail.santri.Nama_Lengkap}</span>
                    <span className="text-xs font-normal text-emerald-200">({selectedSantriDetail.santri.NIS})</span>
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Kelas: {selectedSantriDetail.santri.Kelas} • Halaqah: {selectedSantriDetail.santri.Halaqah} • Pembimbing: {selectedSantriDetail.santri.Pembimbing || selectedSantriDetail.santri.Ustadz_Pembimbing || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSantriDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Total Perolehan</span>
                  <span className="text-lg font-black text-emerald-900">{selectedSantriDetail.juzCount} Juz</span>
                </div>
                <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100 text-center">
                  <span className="text-[10px] font-bold text-teal-700 block uppercase">Total Setoran</span>
                  <span className="text-lg font-black text-teal-900">{selectedSantriDetail.totalSetoran} Kali</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
                  <span className="text-[10px] font-bold text-amber-700 block uppercase">Rata-rata Nilai</span>
                  <span className="text-lg font-black text-amber-900">{selectedSantriDetail.averageNilai || '-'}</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-center">
                  <span className="text-[10px] font-bold text-indigo-700 block uppercase">Predikat Mumtaz</span>
                  <span className="text-lg font-black text-indigo-900">{selectedSantriDetail.mumtazCount} Kali</span>
                </div>
              </div>

              {/* Juz List Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-700 block">Juz Yang Telah Disetorkan & Diuji:</span>
                <p className="text-sm font-extrabold text-emerald-800">{selectedSantriDetail.juzListFormatted}</p>
              </div>

              {/* List of Tahfidz Records */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Log Riwayat Catatan Tahfidz ({selectedSantriDetail.tahfidzRecords.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedSantriDetail(null);
                      setActiveMenu('tahfidz');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Modul Tahfidz</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedSantriDetail.tahfidzRecords.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500 font-medium">Belum ada riwayat setoran tahfidz yang dicatat untuk santri ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSantriDetail.tahfidzRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-emerald-300 transition space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg">
                              Juz {rec.Juz}
                            </span>
                            <span className="font-bold text-gray-900 text-xs">
                              {rec.Surah} {rec.Ayat ? `(Ayat ${rec.Ayat})` : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{rec.Tanggal}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                          <div className="bg-gray-50 p-2 rounded-xl">
                            <span className="text-gray-500 block text-[10px]">Kelancaran</span>
                            <span className="font-bold text-gray-800">{rec.Kelancaran_Score || '-'}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-xl">
                            <span className="text-gray-500 block text-[10px]">Tajwid</span>
                            <span className="font-bold text-gray-800">{rec.Tajwid_Score || '-'}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-xl">
                            <span className="text-gray-500 block text-[10px]">Fashahah</span>
                            <span className="font-bold text-gray-800">{rec.Fashahah_Score || '-'}</span>
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-xl">
                            <span className="text-emerald-700 block text-[10px] font-bold">Predikat</span>
                            <span className="font-black text-emerald-900">{rec.Status_Lulus || 'Lulus'}</span>
                          </div>
                        </div>

                        {rec.Catatan && (
                          <div className="text-[11px] text-gray-600 bg-gray-50/80 px-2.5 py-1.5 rounded-xl">
                            <span className="font-semibold text-gray-700">Catatan Ustadz ({rec.Pengajar || 'Pembimbing'}): </span>
                            <span>{rec.Catatan}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedSantriDetail(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
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

