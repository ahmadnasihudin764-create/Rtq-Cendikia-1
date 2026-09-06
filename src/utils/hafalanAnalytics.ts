import { Santri, TahfidzRecord, TargetSantri } from '../types';

export interface SantriHafalanStat {
  santri: Santri;
  juzCount: number;
  juzList: string[];
  juzListFormatted: string;
  totalSetoran: number;
  tahfidzRecords: TahfidzRecord[];
  latestRecord?: TahfidzRecord;
  averageNilai: number;
  mumtazCount: number;
  jayyidCount: number;
  mengulangCount: number;
}

export interface JuzTierStat {
  key: string;
  label: string;
  juzNumber?: number;
  count: number;
  percentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
  santriList: SantriHafalanStat[];
}

export interface HafalanAnalyticsSummary {
  totalSantri: number;
  totalSantriTahfidz: number;
  totalSantriTahsin: number;
  totalAkumulasiJuz: number;
  totalSetoranCatatan: number;
  averageJuz: number;
  highestJuz: number;
  averageNilaiTotal: number;
  topSantri: SantriHafalanStat[];
  exactJuzStats: JuzTierStat[];
  groupedTierStats: JuzTierStat[];
  santriHafalanList: SantriHafalanStat[];
}

// Helper to parse how many juz a santri has memorized and their Tahfidz details
export function calculateSantriJuzCount(
  santri: Santri,
  tahfidzList: TahfidzRecord[],
  targetList?: TargetSantri[]
): {
  count: number;
  juzList: string[];
  juzListFormatted: string;
  totalSetoran: number;
  tahfidzRecords: TahfidzRecord[];
  latestRecord?: TahfidzRecord;
  averageNilai: number;
  mumtazCount: number;
  jayyidCount: number;
  mengulangCount: number;
} {
  // Get all Tahfidz records for this santri, sorted newest date first
  const santriRecords = tahfidzList
    .filter(t => t.NIS === santri.NIS)
    .sort((a, b) => new Date(b.Tanggal).getTime() - new Date(a.Tanggal).getTime());
  
  // Collect unique juz from passing tahfidz records
  const uniqueJuzSet = new Set<string>();
  let totalScore = 0;
  let mumtaz = 0;
  let jayyid = 0;
  let mengulang = 0;

  santriRecords.forEach(r => {
    // Collect score statistics
    const avg = r.Nilai_Rata || Math.round(((r.Kelancaran_Score || 0) + (r.Tajwid_Score || 0) + (r.Fashahah_Score || 0)) / 3);
    totalScore += avg;

    if (r.Status_Lulus === 'Mumtaz') mumtaz++;
    else if (r.Status_Lulus === 'Jayyid Jiddan' || r.Status_Lulus === 'Jayyid' || r.Status_Lulus === 'Maqbul') jayyid++;
    else if (r.Status_Lulus === 'Mengulang') mengulang++;

    // Parse Juz number
    if (r.Juz) {
      const numbers = r.Juz.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        numbers.forEach(num => {
          const n = parseInt(num, 10);
          if (n >= 1 && n <= 30) {
            uniqueJuzSet.add(n.toString());
          }
        });
      }
    }
  });

  // Also parse Target_Juz from santri profile as baseline if available
  let baselineJuzCount = 0;
  const targetJuzStr = (santri.Target_Juz || '').toLowerCase();
  
  if (targetJuzStr) {
    // 1. Check range like "juz 1 s/d 10" or "juz 1 - 8" or "1 s/d 7 juz"
    const rangeMatch = targetJuzStr.match(/juz\s*(\d+)\s*(?:s\/d|-|sampai)\s*(\d+)/i) ||
                       targetJuzStr.match(/(\d+)\s*(?:s\/d|-|sampai)\s*(\d+)\s*juz/i);
    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
      const start = Math.min(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
      const end = Math.max(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
      for (let j = start; j <= end; j++) {
        if (j >= 1 && j <= 30) {
          uniqueJuzSet.add(j.toString());
        }
      }
      if (targetJuzStr.includes('30') || targetJuzStr.includes('juz 30')) {
        uniqueJuzSet.add('30');
      }
      baselineJuzCount = uniqueJuzSet.size;
    } else {
      // 2. Check total count like "11 juz", "8 juz", "7 juz", "5 juz", "4 juz", "3 juz", "2 juz", "1 juz"
      const totalMatch = targetJuzStr.match(/^(\d+)\s*juz/i) || targetJuzStr.match(/(\d+)\s*juz/i);
      if (totalMatch && totalMatch[1]) {
        const total = parseInt(totalMatch[1], 10);
        baselineJuzCount = total;
        
        // Check if there is details inside parentheses, e.g. "(Juz 30, Juz 1, Juz 2)" or "(Juz 30, Surat Al Maun)"
        const parenMatch = targetJuzStr.match(/\(([^)]+)\)/);
        const detailStr = parenMatch ? parenMatch[1] : targetJuzStr.replace(/^(\d+)\s*juz/i, '');
        
        // Find individual numbers in the detail string
        const numbers = detailStr.match(/\d+/g) || [];
        numbers.forEach(num => {
          const n = parseInt(num, 10);
          if (n >= 1 && n <= 30) {
            uniqueJuzSet.add(n.toString());
          }
        });

        // If no explicit list of juz found, default to first N juz or juz 30 downwards
        if (uniqueJuzSet.size === 0) {
          if (total <= 5) {
            for (let k = 0; k < total; k++) {
              uniqueJuzSet.add((30 - k).toString());
            }
          } else {
            for (let k = 1; k <= total; k++) {
              uniqueJuzSet.add(k.toString());
            }
          }
        }
      } else {
        // 3. Fallback: Parse all numbers in target string (e.g., "Juz 30, 29, 28")
        const numbers = targetJuzStr.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          numbers.forEach(num => {
            const n = parseInt(num, 10);
            if (n >= 1 && n <= 30) {
              uniqueJuzSet.add(n.toString());
            }
          });
          baselineJuzCount = uniqueJuzSet.size;
        }
      }
    }
  }

  // Check targetList completed items if any
  if (targetList) {
    const santriTargets = targetList.filter(t => t.NIS === santri.NIS && t.Status === 'Tercapai');
    santriTargets.forEach(t => {
      const match = t.Target_Nama.match(/juz\s*(\d+)/i);
      if (match && match[1]) {
        uniqueJuzSet.add(match[1]);
      }
    });
  }

  const calculatedFromRecords = uniqueJuzSet.size;
  const finalCount = Math.max(calculatedFromRecords, baselineJuzCount);
  const sortedJuzList = Array.from(uniqueJuzSet).sort((a, b) => parseInt(a) - parseInt(b));
  const juzListFormatted = sortedJuzList.length > 0 
    ? sortedJuzList.map(j => `Juz ${j}`).join(', ')
    : 'Belum ada juz';

  const averageNilai = santriRecords.length > 0 
    ? Math.round(totalScore / santriRecords.length) 
    : 0;

  return {
    count: finalCount,
    juzList: sortedJuzList,
    juzListFormatted,
    totalSetoran: santriRecords.length,
    tahfidzRecords: santriRecords,
    latestRecord: santriRecords[0],
    averageNilai,
    mumtazCount: mumtaz,
    jayyidCount: jayyid,
    mengulangCount: mengulang
  };
}

const TIER_COLORS = [
  { color: 'text-emerald-700', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-500' },
  { color: 'text-teal-700', bgColor: 'bg-teal-500', borderColor: 'border-teal-500' },
  { color: 'text-cyan-700', bgColor: 'bg-cyan-500', borderColor: 'border-cyan-500' },
  { color: 'text-blue-700', bgColor: 'bg-blue-500', borderColor: 'border-blue-500' },
  { color: 'text-indigo-700', bgColor: 'bg-indigo-500', borderColor: 'border-indigo-500' },
  { color: 'text-purple-700', bgColor: 'bg-purple-500', borderColor: 'border-purple-500' },
  { color: 'text-amber-700', bgColor: 'bg-amber-500', borderColor: 'border-amber-500' },
  { color: 'text-orange-700', bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
  { color: 'text-rose-700', bgColor: 'bg-rose-500', borderColor: 'border-rose-500' },
];

export function computeHafalanAnalytics(
  santriList: Santri[],
  tahfidzList: TahfidzRecord[],
  targetList?: TargetSantri[],
  filterHalaqah: string = 'all'
): HafalanAnalyticsSummary {
  // Filter santri by halaqah if specified
  const filteredSantri = santriList.filter(s => {
    if (s.Status !== 'Aktif') return false;
    if (filterHalaqah !== 'all') {
      const matchHalaqah = s.Halaqah === filterHalaqah;
      const matchPembimbing = s.Pembimbing === filterHalaqah || s.Ustadz_Pembimbing === filterHalaqah;
      return matchHalaqah || matchPembimbing;
    }
    return true;
  });

  const totalSantri = filteredSantri.length || 1;

  // Compute for every santri
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  const santriHafalanList: SantriHafalanStat[] = filteredSantri.map(santri => {
    const stats = calculateSantriJuzCount(santri, tahfidzList, targetList);
    if (stats.averageNilai > 0) {
      totalScoreSum += stats.averageNilai;
      totalScoreCount++;
    }
    return {
      santri,
      juzCount: stats.count,
      juzList: stats.juzList,
      juzListFormatted: stats.juzListFormatted,
      totalSetoran: stats.totalSetoran,
      tahfidzRecords: stats.tahfidzRecords,
      latestRecord: stats.latestRecord,
      averageNilai: stats.averageNilai,
      mumtazCount: stats.mumtazCount,
      jayyidCount: stats.jayyidCount,
      mengulangCount: stats.mengulangCount
    };
  });

  // Sort descending by hafalan count
  santriHafalanList.sort((a, b) => b.juzCount - a.juzCount || a.santri.Nama_Lengkap.localeCompare(b.santri.Nama_Lengkap));

  let totalAkumulasiJuz = 0;
  let totalSantriTahfidz = 0;
  let totalSantriTahsin = 0;
  let totalSetoranCatatan = 0;

  santriHafalanList.forEach(item => {
    totalAkumulasiJuz += item.juzCount;
    totalSetoranCatatan += item.totalSetoran;
    if (item.juzCount > 0) {
      totalSantriTahfidz++;
    } else {
      totalSantriTahsin++;
    }
  });

  const averageJuz = filteredSantri.length > 0 ? +(totalAkumulasiJuz / filteredSantri.length).toFixed(1) : 0;
  const highestJuz = santriHafalanList.length > 0 ? santriHafalanList[0].juzCount : 0;
  const averageNilaiTotal = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;
  const topSantri = santriHafalanList.filter(s => s.juzCount > 0).slice(0, 5);

  // 1. Exact Juz Breakdown (0 Juz, 1 Juz, 2 Juz, 3 Juz, ..., 30 Juz)
  const exactMap = new Map<number, SantriHafalanStat[]>();
  for (let j = 0; j <= 30; j++) {
    exactMap.set(j, []);
  }

  santriHafalanList.forEach(item => {
    const j = Math.min(30, Math.max(0, item.juzCount));
    const list = exactMap.get(j) || [];
    list.push(item);
    exactMap.set(j, list);
  });

  const exactJuzStats: JuzTierStat[] = [];
  // Include tiers that either have santri or are standard 1-10 Juz and 30 Juz
  for (let j = 0; j <= 30; j++) {
    const list = exactMap.get(j) || [];
    if (list.length > 0 || (j >= 1 && j <= 10) || j === 30) {
      const pct = +((list.length / totalSantri) * 100).toFixed(1);
      const colorScheme = TIER_COLORS[j % TIER_COLORS.length];
      exactJuzStats.push({
        key: `juz-${j}`,
        label: j === 0 ? '0 Juz (Tahsin / Iqra)' : `${j} Juz`,
        juzNumber: j,
        count: list.length,
        percentage: pct,
        color: colorScheme.color,
        bgColor: colorScheme.bgColor,
        borderColor: colorScheme.borderColor,
        santriList: list
      });
    }
  }

  // 2. Grouped Tiers for Clean Executive Presentation
  // [0 Juz (Tahsin), 1 Juz, 2 Juz, 3 Juz, 4 Juz, 5 Juz, 6-10 Juz, 11-20 Juz, 21-29 Juz, 30 Juz (Khatam)]
  const groupedDefinitions = [
    { key: '0', label: '0 Juz (Tahsin / Iqra)', filter: (c: number) => c === 0, color: 'text-gray-700', bgColor: 'bg-gray-400', borderColor: 'border-gray-400' },
    { key: '1', label: '1 Juz', filter: (c: number) => c === 1, color: 'text-emerald-700', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-500' },
    { key: '2', label: '2 Juz', filter: (c: number) => c === 2, color: 'text-teal-700', bgColor: 'bg-teal-500', borderColor: 'border-teal-500' },
    { key: '3', label: '3 Juz', filter: (c: number) => c === 3, color: 'text-cyan-700', bgColor: 'bg-cyan-500', borderColor: 'border-cyan-500' },
    { key: '4', label: '4 Juz', filter: (c: number) => c === 4, color: 'text-blue-700', bgColor: 'bg-blue-500', borderColor: 'border-blue-500' },
    { key: '5', label: '5 Juz', filter: (c: number) => c === 5, color: 'text-indigo-700', bgColor: 'bg-indigo-500', borderColor: 'border-indigo-500' },
    { key: '6-10', label: '6 - 10 Juz', filter: (c: number) => c >= 6 && c <= 10, color: 'text-purple-700', bgColor: 'bg-purple-500', borderColor: 'border-purple-500' },
    { key: '11-20', label: '11 - 20 Juz', filter: (c: number) => c >= 11 && c <= 20, color: 'text-amber-700', bgColor: 'bg-amber-500', borderColor: 'border-amber-500' },
    { key: '21-29', label: '21 - 29 Juz', filter: (c: number) => c >= 21 && c <= 29, color: 'text-orange-700', bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    { key: '30', label: '30 Juz (Khatam Mutqin)', filter: (c: number) => c >= 30, color: 'text-rose-700', bgColor: 'bg-rose-500', borderColor: 'border-rose-500' },
  ];

  const groupedTierStats: JuzTierStat[] = groupedDefinitions.map(def => {
    const matchingSantri = santriHafalanList.filter(item => def.filter(item.juzCount));
    const pct = +((matchingSantri.length / totalSantri) * 100).toFixed(1);
    return {
      key: def.key,
      label: def.label,
      count: matchingSantri.length,
      percentage: pct,
      color: def.color,
      bgColor: def.bgColor,
      borderColor: def.borderColor,
      santriList: matchingSantri
    };
  });

  return {
    totalSantri: filteredSantri.length,
    totalSantriTahfidz,
    totalSantriTahsin,
    totalAkumulasiJuz,
    totalSetoranCatatan,
    averageJuz,
    highestJuz,
    averageNilaiTotal,
    topSantri,
    exactJuzStats,
    groupedTierStats,
    santriHafalanList
  };
}
