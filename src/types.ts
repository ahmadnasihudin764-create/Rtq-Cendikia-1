export type UserRole = 'Admin' | 'Super Admin' | 'Wali Santri' | 'Pengajar' | 'Administrasi';

export interface UserAccount {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  password?: string;
  plainPassword?: string;
  passwordHash?: string;
  email?: string;
  santriNIS?: string; // If role is Wali Santri
  namaSantri?: string; // Nama anak jika Wali Santri
  halaqah?: string; // If role is Pengajar
  avatarUrl?: string;
  isActive?: boolean;
  isDefaultPassword?: boolean;
  passwordUpdatedAt?: string;
  lastLogin?: string;
  createdAt?: string;
}

export type User = UserAccount;

export interface Santri {
  NIS: string;
  NISN?: string;
  Nama_Lengkap: string;
  Nama_Panggilan?: string;
  NIK?: string;
  Nomor_KK?: string;
  Tempat_Lahir?: string;
  Tanggal_Lahir: string;
  Jenis_Kelamin: 'Laki-laki' | 'Perempuan';
  Kelas: string;
  Halaqah: string;
  Pembimbing?: string;
  Ustadz_Pembimbing?: string;
  Asrama?: string;
  Nama_Wali: string;
  WA_Wali: string;
  Alamat: string; // Alamat Lengkap
  RT_RW?: string;
  Desa_Kelurahan?: string;
  Kecamatan?: string;
  Kabupaten_Kota?: string;
  Provinsi?: string;
  Kode_Pos?: string;
  Tanggal_Masuk: string;
  Status: 'Aktif' | 'Cuti' | 'Alumni';
  Target_Juz?: string;
  Foto?: string;
}

export interface Pengajar {
  ID_Pengajar: string;
  Nama_Pengajar: string;
  Gelar?: string;
  Mata_Pelajaran: string;
  Nomor_HP: string;
  Jadwal_Mengajar: string;
  Halaqah_Binaan: string;
  Status: 'Aktif' | 'Nonaktif';
  Foto?: string;
}

export interface AbsensiRecord {
  id: string;
  tanggal: string;
  NIS: string;
  namaSantri: string;
  halaqah: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  waktuScan?: string;
  keterangan?: string;
}

export interface TahfidzRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Juz: string;
  Surah: string;
  Ayat: string;
  Kelancaran_Score: number;
  Tajwid_Score: number;
  Fashahah_Score: number;
  Nilai_Rata: number;
  Status_Lulus: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Mengulang';
  Pengajar: string;
  Catatan: string;
}

export interface TahsinRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Jilid_Iqra: string;
  Halaman: string;
  Makhraj_Score: number;
  Tajwid_Score: number;
  Catatan: string;
  Status_Naik: 'Naik Halaman' | 'Naik Jilid' | 'Ulangi' | 'Selesai Iqra';
  Pengajar: string;
}

export interface KebersihanKesehatanRecord {
  ID_Periksa: string;
  Tanggal: string;
  NIS: string;
  Status_Kebersihan: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perhatian';
  Kondisi_Kesehatan: 'Sehat' | 'Kurang Fit' | 'Sakit' | 'Izin Berobat';
  Pemeriksaan_Fisik: {
    kuku: boolean; // true = bersih/dipotong
    seragam: boolean; // true = rapi/bersih
    peciJilbab: boolean; // true = rapi
  };
  Keluhan_Sakit: string;
  Tindakan_Obat: string;
  Catatan: string;
}

export interface AkhlakRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Bulan: string;
  Adab_Ustadz: number; // 1-100
  Adab_Quran: number;
  Disiplin: number;
  Kebersamaan: number;
  Catatan: string;
  Ustadz_Penilai: string;
}

export interface IbadahRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Sholat_Berjamaah_Score?: number;
  Wudhu_Score?: number; // legacy alias for Sholat_Berjamaah_Score
  Qiyamul_Lail_Score?: number;
  Shalat_Score?: number; // legacy alias for Qiyamul_Lail_Score
  Dzikir_Score: number;
  Hafalan_Doa: string;
  Catatan: string;
}

export interface TargetSantri {
  id: string;
  NIS: string;
  Target_Nama: string; // misal: "Khatam Juz 30", "Lulus Iqra Jilid 6"
  Target_Ayat_Halaman: string;
  Deadline: string;
  Capaian_Persen: number; // 0-100
  Status: 'Sedang Berjalan' | 'Tercapai' | 'Tertunda';
  Keterangan: string;
}

export interface PrestasiRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Judul_Prestasi: string;
  Kategori: 'Tahfidz' | 'Tahsin' | 'Adab' | 'Lomba MHQ' | 'Santri Teladan';
  Tingkat: 'Internal RTQ' | 'Kecamatan' | 'Kota/Kab' | 'Provinsi' | 'Nasional';
  Peringkat: string; // misal "Juara 1", "Peringkat Terbaik"
  Keterangan: string;
  Sertifikat_ID?: string;
}

export interface PelanggaranRecord {
  id: string;
  Tanggal: string;
  NIS: string;
  Jenis_Pelanggaran: string;
  Poin_Minus: number;
  Tindakan_Pembinaan: string;
  Ustadz_Pendamping: string;
  Status: 'Selesai Dibina' | 'Dalam Pemantauan' | 'Pemanggilan Wali';
}

export interface AdministrasiSPP {
  id: string;
  Tanggal_Bayar: string;
  NIS: string;
  Bulan: string;
  Tahun: string;
  Jumlah_Bayar: number;
  Metode: 'Transfer Bank BRI' | 'Tunai ke Kantor RTQ' | 'Transfer Bank' | 'Tunai';
  Status_Bayar: 'Lunas' | 'Belum Lunas' | 'Beasiswa BAZNAS';
  Nomor_Kwitansi: string;
  Petugas: string;
  Catatan?: string;
}

export interface SanguItem {
  id?: string;
  kodeBarang?: string;
  namaBarang: string;
  harga: number;
  jumlah: number;
  total: number;
  kategori?: string;
}

export interface SanguTransaksi {
  id: string;
  NIS: string;
  namaSantri?: string;
  tanggal: string; // Format: YYYY-MM-DD atau ISO
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  nominal: number;
  keterangan: string;
  metode: string;
  petugas: string;
  isQRTransaction?: boolean;
  qrItems?: SanguItem[];
  nomorStruk?: string;
  waktu?: string;
  batchId?: string;
  batchTitle?: string;
}

export interface BarangKoperasi {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  harga: number;
  satuan: string;
  stok: number;
  deskripsi?: string;
  isFavorite?: boolean;
}

export interface JadwalKegiatan {
  id: string;
  Hari: string;
  Waktu: string;
  Nama_Kegiatan: string;
  Pengajar: string;
  Lokasi: string;
  Keterangan: string;
}

export interface AppNotification {
  id: string;
  waktu: string;
  judul: string;
  pesan: string;
  tipe: 'info' | 'success' | 'warning' | 'error';
  kategori: 'izin' | 'komentar' | 'profil' | 'spp' | 'tahfidz' | 'sistem';
  dibaca: boolean;
  targetMenu?: string;
  targetId?: string;
  senderName?: string;
  senderRole?: string;
  metadata?: Record<string, any>;
}

export interface PerizinanRecord {
  id: string;
  tanggalPengajuan: string;
  NIS: string;
  namaSantri: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenisIzin: 'Pulang/Keluarga' | 'Sakit/Berobat' | 'Kegiatan Luar' | 'Lainnya';
  alasan: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
  penjemput?: string;
  disetujuiOleh?: string;
  catatanUstadz?: string;
}

export interface PengumumanRecord {
  id: string;
  judul: string;
  konten: string;
  tanggal: string;
  kategori: 'Penting' | 'Akademik' | 'Kegiatan' | 'SPP & Keuangan';
  targetRole: 'Semua' | 'Wali Santri' | 'Pengajar';
  penulis: string;
  lampiran?: string;
}

export interface FotoKomentar {
  id: string;
  albumId: string;
  photoIndex?: number; // 0, 1, 2... or undefined (for whole album)
  userId?: string;
  namaPengirim: string;
  role: 'Wali Santri' | 'Admin' | 'Super Admin' | 'Pengajar' | 'Santri' | string;
  santriInfo?: string; // e.g. "Wali dari Muhammad Azzam (STR001)"
  fotoAvatar?: string;
  pesan: string;
  tanggal: string; // e.g. '2026-08-20 14:30'
  likes?: number;
  likedBy?: string[];
}

export interface FotoKegiatanRecord {
  id: string;
  judul: string;
  tanggal: string;
  keterangan: string;
  kategori: 'Wisuda & Tasmi\'' | 'Halaqah & Pembelajaran' | 'Kajian & Tarbiyah' | 'Lomba & Prestasi' | 'Sosial & BAZNAS' | 'Lainnya';
  fotoList: string[];
  tipeMedia?: 'Foto' | 'Poster' | 'Infografis' | 'Pamflet' | 'Banner' | 'Dokumentasi';
  orientation?: 'portrait' | 'landscape' | 'square' | 'poster-tall';
  aspectRatio?: number;
  penulis?: string;
  lokasi?: string;
  agendaTerkait?: string;
  jadwalId?: string;
  createdAt?: string;
  likes?: number;
  likedBy?: string[];
  komentarList?: FotoKomentar[];
}

export type JenjangDiniyyah = 'Kelas Ula' | 'Kelas Wustho' | 'Kelas Ulya';

export interface NilaiMapelItem {
  mapel: string;
  nilai: number | null;
}

export interface DiniyyahRecord {
  id: string;
  NIS: string;
  namaSantri: string;
  jenjang: JenjangDiniyyah;
  tahunAjaran: string; // '2026/2027' | '2027/2028' | '2028/2029'
  semester: 'Semester 1' | 'Semester 2';
  guruPembimbing: string;
  nilaiList: NilaiMapelItem[];
  jumlahNilai: number;
  rataRata: number;
  predikat: string;
  catatanGuru?: string;
  updatedAt?: string;
}

export interface KelasDiniyyahInfo {
  jenjang: JenjangDiniyyah;
  guruPembimbing: string;
  mataPelajaran: string[];
  deskripsi: string;
}

export const DINIYYAH_CONFIG: Record<JenjangDiniyyah, KelasDiniyyahInfo> = {
  'Kelas Ula': {
    jenjang: 'Kelas Ula',
    guruPembimbing: 'Ustadzah Sri Siti Khafsoh',
    mataPelajaran: [
      'Mabadi Fiqh Juz 1',
      "Ro'sun Sirah",
      "Pegon / Imla'",
      "Hadist Mi'ah"
    ],
    deskripsi: 'Tingkat dasar kajian kitab fiqh, sirah nabawiyah, kaidah penulisan pegon imla, dan hadits pilihan.'
  },
  'Kelas Wustho': {
    jenjang: 'Kelas Wustho',
    guruPembimbing: 'Ustadzah Dzatun Nafis Al Baidh, S.Pd',
    mataPelajaran: [
      'Pegon',
      'Mabadi Fiqh Juz 2',
      "Ro'sun Sirah",
      "Hadist Mi'ah"
    ],
    deskripsi: 'Tingkat menengah pendalaman fiqih praktis juz 2, literasi kitab pegon, sirah lanjutan dan hadits.'
  },
  'Kelas Ulya': {
    jenjang: 'Kelas Ulya',
    guruPembimbing: 'Ustadz Ahmad Nasyikhudin, S.Pd',
    mataPelajaran: [
      'Mabadi Fiqh Juz 3',
      'Jurumiyyah',
      'Tasrif Istilah',
      "Hadist Arba'in"
    ],
    deskripsi: 'Tingkat lanjutan tata bahasa Arab nahwu jurumiyyah, sharaf tasrif istilah, fiqih juz 3, dan hadits arba\'in nawawiyah.'
  }
};

export const TAHUN_AJARAN_DINIYYAH = [
  '2026/2027',
  '2027/2028',
  '2028/2029'
] as const;

export const SEMESTER_DINIYYAH = [
  'Semester 1',
  'Semester 2'
] as const;

export const DAFTAR_HALAQAH = [
  "Semua Halaqoh",
  "Tahfidz Ba'da Ashar",
  "Muroja'ah Ba'da Maghrib",
  "Diniyyah Ba'da Isya'",
  "Jam Wajib Ba'da Subuh"
] as const;

export type NamaHalaqah = typeof DAFTAR_HALAQAH[number];

export interface AppSettings {
  // Publikasi Rapor
  publikasiRapor: boolean;
  publikasiRaporTahfidz: boolean;
  publikasiRaporDiniyyah: boolean;
  pesanRaporTerkunci?: string;

  // Publikasi Nilai
  publikasiNilai: boolean;
  publikasiNilaiTahfidz: boolean;
  publikasiNilaiTahsin: boolean;
  publikasiNilaiDiniyyah: boolean;
  pesanNilaiTerkunci?: string;

  // Meta
  terakhirDiperbarui?: string;
  diperbaruiOleh?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  publikasiRapor: true,
  publikasiRaporTahfidz: true,
  publikasiRaporDiniyyah: true,
  pesanRaporTerkunci: 'Laporan hasil belajar / Rapor santri (Tahfidz & Diniyyah) sedang dalam proses finalisasi oleh asatidz dan belum dipublikasikan untuk periode ini.',
  publikasiNilai: true,
  publikasiNilaiTahfidz: true,
  publikasiNilaiTahsin: true,
  publikasiNilaiDiniyyah: true,
  pesanNilaiTerkunci: 'Rekap penilaian dan capaian setoran harian santri sedang dalam proses verifikasi asatidz dan belum dipublikasikan.',
  terakhirDiperbarui: '2026-08-20 08:00',
  diperbaruiOleh: 'Admin RTQ'
};
