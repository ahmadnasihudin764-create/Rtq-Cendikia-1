import { DiniyyahRecord, DINIYYAH_CONFIG, JenjangDiniyyah, NilaiMapelItem } from '../types';
import { INITIAL_SANTRI } from './initialData';

// Daftar Nama Santri Resmi per Tingkat Diniyyah RTQ Cendikia BAZNAS
export const DINIYYAH_ULA_NAMES = [
  'Hizam Arfan Al Husain',
  'Athira Khoiriyah Lathifa',
  'Sahid Maulana',
  'Izza Lailatul Husna',
  'Annisa Halwatuzahra Matola',
  'Aishwa Namira Nahla',
  'Hilya Adibahtul Azizah',
  'M. Irsyad Maulana',
  'Aishwa Aliya Hasanah',
  'Arsyi Syauqia Ramadhani',
  'Aldo Afri Pranata',
  'Deo Muhammad Rizki',
  'Nilna Hayatas Syahira',
  'Azmi Khaliqa Dzahin',
  'Alfatunissa Lashira Shanum',
  'Alena Salsabila',
  'Najwa Khoirunisa',
  'Novi Andini Fatmasari',
  'Fulvian Freddie Nugraha',
  'Ahmad Azril Abqary',
  'Aretha Romesha',
  'Violla Maisyah',
  'Keisha Ameera Rafani',
  'Adiba Syaqila Atmarini',
  'M Zaki Ramadan Hidayat'
];

export const DINIYYAH_WUSTHO_NAMES = [
  'Arju Najah Hadani',
  'Salma Nur Izzi Maulaya',
  'Hafidzoh Dya Setyana',
  'Aura fitri Rahmadi',
  'M Sajad Hidayatullah',
  'Ulya Kamila Putri Ukhrowi',
  'Violina Qoriatus Sholihah',
  'Azzahra Agustina Lidions',
  'Jhahira Venia Qeiza',
  'Fawwaz Mumtaz Choirullah',
  'Intan Ulya Nugrahani',
  'Abyan Faris Nugroho',
  'Syakira Nafisatun Najma',
  'Ganendra Arya Pratama',
  'Dea Ayu Alessia',
  'Dwi Almar\'atus Sholeha',
  'Faidh Azizullah',
  'M Syafiq Musyafa Al Fatih',
  'Mey Leni Saputri',
  'M. Ilham Akbaru'
];

export const DINIYYAH_ULYA_NAMES = [
  'M Syafiq Azzain',
  'Jannatun Naim',
  'Difa Syaqila Alfasya',
  'M. Jamaluddin Al-Amin',
  'Asyiraf Sakha Kusmawan',
  'Muhammad Zahir Khambali',
  'M. Ibnu Malik',
  'Syifa\'ul Janah',
  'Defa Nur Fadhilah',
  'Hanna Hilyatul Aulya',
  'Neva Kirana',
  'Tafakur Rohman',
  'Jihan Syafa\'atul Aurel',
  'Riko Abdi Prayoga',
  'M Afkar Fauzan',
  'Qinara Azza Batrisya',
  'Naomi Levika Armela',
  'Siti Mutmainnah',
  'Dyah Kusumaningayu Darojatun',
  'Nisa Auliatuz Zahra'
];

// Mapping NIS ke Jenjang Diniyyah
export const NIS_TO_JENJANG_MAP: { [nis: string]: JenjangDiniyyah } = {
  // Diniyyah Ula (25 Santri)
  'STR001': 'Kelas Ula',
  'STR002': 'Kelas Ula',
  'STR003': 'Kelas Ula',
  'STR004': 'Kelas Ula',
  'STR005': 'Kelas Ula',
  'STR006': 'Kelas Ula',
  'STR008': 'Kelas Ula',
  'STR009': 'Kelas Ula',
  'STR010': 'Kelas Ula',
  'STR011': 'Kelas Ula',
  'STR012': 'Kelas Ula',
  'STR013': 'Kelas Ula',
  'STR015': 'Kelas Ula',
  'STR016': 'Kelas Ula',
  'STR017': 'Kelas Ula',
  'STR018': 'Kelas Ula',
  'STR019': 'Kelas Ula',
  'STR020': 'Kelas Ula',
  'STR021': 'Kelas Ula',
  'STR025': 'Kelas Ula',
  'STR029': 'Kelas Ula',
  'STR033': 'Kelas Ula',
  'STR034': 'Kelas Ula',
  'STR035': 'Kelas Ula',
  'STR039': 'Kelas Ula',

  // Diniyyah Wustho (20 Santri)
  'STR007': 'Kelas Wustho',
  'STR014': 'Kelas Wustho',
  'STR022': 'Kelas Wustho',
  'STR023': 'Kelas Wustho',
  'STR024': 'Kelas Wustho',
  'STR026': 'Kelas Wustho',
  'STR027': 'Kelas Wustho',
  'STR028': 'Kelas Wustho',
  'STR030': 'Kelas Wustho',
  'STR031': 'Kelas Wustho',
  'STR032': 'Kelas Wustho',
  'STR037': 'Kelas Wustho',
  'STR038': 'Kelas Wustho',
  'STR040': 'Kelas Wustho',
  'STR043': 'Kelas Wustho',
  'STR044': 'Kelas Wustho',
  'STR046': 'Kelas Wustho',
  'STR047': 'Kelas Wustho',
  'STR048': 'Kelas Wustho',
  'STR051': 'Kelas Wustho',

  // Diniyyah Ulya (20 Santri)
  'STR036': 'Kelas Ulya',
  'STR041': 'Kelas Ulya',
  'STR042': 'Kelas Ulya',
  'STR045': 'Kelas Ulya',
  'STR049': 'Kelas Ulya',
  'STR050': 'Kelas Ulya',
  'STR052': 'Kelas Ulya',
  'STR053': 'Kelas Ulya',
  'STR054': 'Kelas Ulya',
  'STR055': 'Kelas Ulya',
  'STR056': 'Kelas Ulya',
  'STR057': 'Kelas Ulya',
  'STR058': 'Kelas Ulya',
  'STR059': 'Kelas Ulya',
  'STR060': 'Kelas Ulya',
  'STR061': 'Kelas Ulya',
  'STR062': 'Kelas Ulya',
  'STR063': 'Kelas Ulya',
  'STR064': 'Kelas Ulya',
  'STR065': 'Kelas Ulya'
};

const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/muhammad/g, 'm')
    .replace(/ustadz/g, '')
    .replace(/ustadzah/g, '');
};

export const getPredikatDiniyyah = (rata: number): string => {
  if (rata >= 90) return 'Mumtaz';
  if (rata >= 80) return 'Jayyid Jiddan';
  if (rata >= 70) return 'Jayyid';
  if (rata >= 60) return 'Maqbul';
  return 'Perlu Bimbingan';
};

export const calculateDiniyyah = (nilaiList: NilaiMapelItem[]) => {
  let total = 0;
  let filledCount = 0;

  nilaiList.forEach(item => {
    if (item.nilai !== null && item.nilai !== undefined && !isNaN(Number(item.nilai))) {
      total += Number(item.nilai);
      filledCount++;
    }
  });

  const totalMapel = nilaiList.length || 4;
  const rawRata = totalMapel > 0 ? total / totalMapel : 0;
  const rataRata = Math.round(rawRata * 10) / 10;
  const isComplete = filledCount === totalMapel && filledCount > 0;
  const predikat = filledCount > 0 ? getPredikatDiniyyah(rataRata) : 'Belum Dinilai';

  return {
    jumlahNilai: total,
    rataRata,
    predikat,
    isComplete,
    filledCount,
    totalMapel
  };
};

export const mapSantriToJenjang = (
  kelasOrNis: string = '', 
  namaOrIdx: string | number = 0
): JenjangDiniyyah => {
  // 1. Direct check by NIS
  if (NIS_TO_JENJANG_MAP[kelasOrNis]) {
    return NIS_TO_JENJANG_MAP[kelasOrNis];
  }

  // 2. Check if name is provided as second argument
  if (typeof namaOrIdx === 'string' && namaOrIdx.trim()) {
    const norm = normalizeName(namaOrIdx);
    for (const name of DINIYYAH_ULA_NAMES) {
      if (normalizeName(name) === norm || norm.includes(normalizeName(name)) || normalizeName(name).includes(norm)) {
        return 'Kelas Ula';
      }
    }
    for (const name of DINIYYAH_WUSTHO_NAMES) {
      if (normalizeName(name) === norm || norm.includes(normalizeName(name)) || normalizeName(name).includes(norm)) {
        return 'Kelas Wustho';
      }
    }
    for (const name of DINIYYAH_ULYA_NAMES) {
      if (normalizeName(name) === norm || norm.includes(normalizeName(name)) || normalizeName(name).includes(norm)) {
        return 'Kelas Ulya';
      }
    }
  }

  // 3. Fallback based on class string
  const lower = kelasOrNis.toLowerCase();
  if (lower.includes('ula')) return 'Kelas Ula';
  if (lower.includes('wustho')) return 'Kelas Wustho';
  if (lower.includes('ulya')) return 'Kelas Ulya';

  // 4. Fallback based on index
  if (typeof namaOrIdx === 'number') {
    if (namaOrIdx < 25) return 'Kelas Ula';
    if (namaOrIdx < 45) return 'Kelas Wustho';
    return 'Kelas Ulya';
  }

  return 'Kelas Ula';
};

// Generate realistic initial records for all 65 santri based on official distribution
export const generateInitialDiniyyahRecords = (): DiniyyahRecord[] => {
  const records: DiniyyahRecord[] = [];

  INITIAL_SANTRI.forEach((santri, idx) => {
    const jenjang = mapSantriToJenjang(santri.NIS, santri.Nama_Lengkap);
    const config = DINIYYAH_CONFIG[jenjang];

    // Seeded score variation per student
    const baseScore = 76 + ((idx * 7) % 20); // between 76 and 96
    const variance1 = (idx % 3) * 2;
    const variance2 = ((idx + 1) % 4) * 2 - 2;
    const variance3 = ((idx + 2) % 3) * 3 - 3;
    const variance4 = ((idx + 3) % 4) * 2 - 1;

    const clamp = (val: number) => Math.min(98, Math.max(70, val));

    const s1 = clamp(baseScore + variance1);
    const s2 = clamp(baseScore + variance2);
    const s3 = clamp(baseScore + variance3);
    const s4 = clamp(baseScore + variance4);

    const nilaiListSem1: NilaiMapelItem[] = config.mataPelajaran.map((mapel, mIdx) => {
      const scores = [s1, s2, s3, s4];
      return {
        mapel,
        nilai: scores[mIdx] ?? 80
      };
    });

    const calc1 = calculateDiniyyah(nilaiListSem1);

    // Record Semester 1 2026/2027
    records.push({
      id: `DIN_${santri.NIS}_2026_2027_S1`,
      NIS: santri.NIS,
      namaSantri: santri.Nama_Lengkap,
      jenjang,
      tahunAjaran: '2026/2027',
      semester: 'Semester 1',
      guruPembimbing: config.guruPembimbing,
      nilaiList: nilaiListSem1,
      jumlahNilai: calc1.jumlahNilai,
      rataRata: calc1.rataRata,
      predikat: calc1.predikat,
      catatanGuru: `Ananda ${santri.Nama_Lengkap} tekun dalam mengikuti kajian kitab ${jenjang}, memiliki adab mulia dan pemahaman dasar syariat yang baik.`,
      updatedAt: '2026-08-20'
    });

    // Record Semester 2 2026/2027
    const s1_2 = clamp(s1 + 2);
    const s2_2 = clamp(s2 + 3);
    const s3_2 = clamp(s3 + 1);
    const s4_2 = clamp(s4 + 2);

    const nilaiListSem2: NilaiMapelItem[] = config.mataPelajaran.map((mapel, mIdx) => {
      const scores = [s1_2, s2_2, s3_2, s4_2];
      return {
        mapel,
        nilai: scores[mIdx] ?? 82
      };
    });

    const calc2 = calculateDiniyyah(nilaiListSem2);

    records.push({
      id: `DIN_${santri.NIS}_2026_2027_S2`,
      NIS: santri.NIS,
      namaSantri: santri.Nama_Lengkap,
      jenjang,
      tahunAjaran: '2026/2027',
      semester: 'Semester 2',
      guruPembimbing: config.guruPembimbing,
      nilaiList: nilaiListSem2,
      jumlahNilai: calc2.jumlahNilai,
      rataRata: calc2.rataRata,
      predikat: calc2.predikat,
      catatanGuru: `Peningkatan pemahaman materi kitab ${jenjang} sangat memuaskan, istiqomah dalam muroja'ah dan muthola'ah.`,
      updatedAt: '2026-08-24'
    });
  });

  return records;
};

export const INITIAL_DINIYYAH_DATA: DiniyyahRecord[] = generateInitialDiniyyahRecords();

