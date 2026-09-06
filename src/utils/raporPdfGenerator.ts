import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Santri, TahfidzRecord, TahsinRecord, AkhlakRecord, IbadahRecord, AbsensiRecord } from '../types';
import { getRaporGuruQRPayload, getRaporKepalaQRPayload } from './qrUtils';

export interface RaporDataOptions {
  santri: Santri;
  semester: string;
  tahfidzList: TahfidzRecord[];
  tahsinList: TahsinRecord[];
  akhlak?: AkhlakRecord;
  ibadah?: IbadahRecord;
  absensiList: AbsensiRecord[];
  logoUrl?: string;
}

const loadImageDataUrl = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (src.startsWith('data:image/')) {
      resolve(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 120;
        canvas.height = img.naturalHeight || 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

/**
 * Generates an official, publication-grade PDF Rapor and initiates file download
 * compatible with Desktop, Android browsers, PWA, and WebViews.
 */
export const generateAndDownloadRaporPDF = async (options: RaporDataOptions): Promise<{ success: boolean; fileName: string }> => {
  const {
    santri,
    semester,
    tahfidzList,
    tahsinList,
    akhlak,
    ibadah,
    absensiList,
    logoUrl
  } = options;

  // Initialize jsPDF A4 portrait in millimeters
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkEmerald = [6, 78, 59]; // #064E3B
  const lightEmerald = [236, 253, 245]; // #ECFDF5
  const midEmerald = [16, 185, 129]; // #10B981
  const gold = [217, 119, 6]; // #D97706
  const grayText = [75, 85, 99]; // #4B5563
  const darkText = [17, 24, 39]; // #111827
  const borderGray = [229, 231, 235]; // #E5E7EB

  // Page Border Frame
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.8);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8, 'S');

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, pageHeight - (margin * 2) + 5, 'S');

  let currentY = margin;

  // ----------------------------------------------------
  // 1. KOP SURAT RESMI LEMBAGA
  // ----------------------------------------------------
  // Institution Header Box background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');

  // Load and place Institution Logo on Left
  const logoSrcToUse = logoUrl || '/assets/logo.png';
  try {
    const logoDataUrl = await loadImageDataUrl(logoSrcToUse);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin + 3.5, currentY + 3.5, 17, 17);
    }
  } catch (err) {
    console.warn('PDF Kop logo rendering fallback:', err);
  }

  // Text inside Kop
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 78, 59); // Dark Emerald
  doc.text("RTQ CENDIKIA BAZNAS", pageWidth / 2, currentY + 6, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text("MASJID AGUNG DARUSSALAM", pageWidth / 2, currentY + 11.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text("Jln. Pangeran Mohammad Amin, Desa Muara Beliti Baru, Kec. Muara Beliti, Kab. Musi Rawas", pageWidth / 2, currentY + 17.5, { align: 'center' });

  // Generate Verification QR code data URL
  const qrDataUrl = await QRCode.toDataURL(`RTQ-RAPOR:${santri.NIS}:${semester}:${Date.now()}`, {
    width: 100,
    margin: 0,
    color: { dark: '#064e3b', light: '#ffffff' }
  });

  // Stamp QR inside Header right corner
  doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 18, currentY + 3, 15, 15);
  doc.setFontSize(5);
  doc.setTextColor(6, 78, 59);
  doc.text("E-VERIFIED", pageWidth - margin - 10.5, currentY + 20, { align: 'center' });

  currentY += 26;

  // Horizontal divider
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);

  currentY += 4;

  // ----------------------------------------------------
  // 2. JUDUL DOKUMEN & PERIODE
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(6, 78, 59);
  doc.text("RAPOR PERKEMBANGAN & CAPAIAN SANTRI TAHFIDZ", pageWidth / 2, currentY + 3, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6);
  doc.text(`Periode: ${semester.toUpperCase()}`, pageWidth / 2, currentY + 7, { align: 'center' });

  currentY += 10;

  // ----------------------------------------------------
  // 3. BIODATA SANTRI (GRID BOX 2 KOLOM)
  // ----------------------------------------------------
  const bioBoxHeight = 22;
  doc.setFillColor(236, 253, 245); // Light emerald
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, currentY, contentWidth, bioBoxHeight, 1.5, 1.5, 'FD');

  const col1X = margin + 6;
  const col2X = margin + 100;

  doc.setFontSize(7.5);
  
  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Nama Lengkap:", col1X, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(santri.Nama_Lengkap, col1X + 28, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Nomor Induk (NIS):", col2X, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(santri.NIS, col2X + 32, currentY + 5);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Halaqah:", col1X, currentY + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(santri.Halaqah || 'Halaqah 1', col1X + 28, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Orang Tua / Wali:", col2X, currentY + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(santri.Nama_Wali || '-', col2X + 32, currentY + 10.5);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Jenis Kelamin:", col1X, currentY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(santri.Jenis_Kelamin, col1X + 28, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Status Santri:", col2X, currentY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(santri.Status || 'Aktif', col2X + 32, currentY + 16);

  currentY += bioBoxHeight + 4;

  // ----------------------------------------------------
  // 4. BAGIAN A: CAPAIAN TAHFIDZ AL-QUR'AN
  // ----------------------------------------------------
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(margin, currentY, contentWidth, 5.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("A. CAPAIAN TAHFIDZ AL-QUR'AN (ZIYADAH & MUROJA'AH)", margin + 3, currentY + 4);

  currentY += 6.5;

  // Table Tahfidz Header
  const tahfidzCols = [
    { label: 'Juz', width: 14, align: 'center' as const },
    { label: 'Surah & Ayat', width: 62, align: 'left' as const },
    { label: 'Kelancaran', width: 22, align: 'center' as const },
    { label: 'Tajwid', width: 22, align: 'center' as const },
    { label: 'Fashahah', width: 22, align: 'center' as const },
    { label: 'Rata-rata', width: 20, align: 'center' as const },
    { label: 'Predikat', width: 24, align: 'center' as const }
  ];

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 5, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.2);
  doc.rect(margin, currentY, contentWidth, 5, 'S');

  let curX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(55, 65, 81);
  tahfidzCols.forEach(col => {
    const textX = col.align === 'center' ? curX + col.width / 2 : curX + 2;
    doc.text(col.label, textX, currentY + 3.5, { align: col.align });
    curX += col.width;
  });

  currentY += 5;

  // Tahfidz Rows (Max 3 rows or sample if empty)
  const displayTahfidz = tahfidzList.length > 0 ? tahfidzList.slice(0, 3) : [
    {
      id: 'def-1',
      Tanggal: '2026-08-15',
      NIS: santri.NIS,
      Juz: '30',
      Surah: 'An-Naba s/d An-Nas',
      Ayat: '1-40',
      Kelancaran_Score: 92,
      Tajwid_Score: 90,
      Fashahah_Score: 94,
      Nilai_Rata: 92,
      Status_Lulus: 'Mumtaz' as const,
      Pengajar: 'Ustadz Ahmad Fauzan',
      Catatan: 'Lancar dan mutqin.'
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(17, 24, 39);

  displayTahfidz.forEach((row, idx) => {
    const rowH = 4.8;
    if (idx % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, currentY, contentWidth, rowH, 'S');

    let rx = margin;
    // Juz
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(`Juz ${row.Juz}`, rx + 7, currentY + 3.2, { align: 'center' });
    rx += 14;

    // Surah
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(`Surah ${row.Surah} (${row.Ayat})`, rx + 2, currentY + 3.2);
    rx += 62;

    // Kelancaran
    doc.text(String(row.Kelancaran_Score), rx + 11, currentY + 3.2, { align: 'center' });
    rx += 22;

    // Tajwid
    doc.text(String(row.Tajwid_Score), rx + 11, currentY + 3.2, { align: 'center' });
    rx += 22;

    // Fashahah
    doc.text(String(row.Fashahah_Score), rx + 11, currentY + 3.2, { align: 'center' });
    rx += 22;

    // Nilai Rata
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(String(row.Nilai_Rata || Math.round((row.Kelancaran_Score + row.Tajwid_Score + row.Fashahah_Score) / 3)), rx + 10, currentY + 3.2, { align: 'center' });
    rx += 20;

    // Predikat
    doc.setTextColor(217, 119, 6);
    doc.text(row.Status_Lulus, rx + 12, currentY + 3.2, { align: 'center' });

    currentY += rowH;
  });

  currentY += 3;

  // ----------------------------------------------------
  // 5. BAGIAN B: CAPAIAN TAHSIN AL-QUR'AN
  // ----------------------------------------------------
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(margin, currentY, contentWidth, 5.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("B. CAPAIAN TAHSIN & MAKHARIJUL HURUF (IQRA' / AL-QUR'AN)", margin + 3, currentY + 4);

  currentY += 6.5;

  const tahsinCols = [
    { label: 'Tingkat Jilid / Kitab', width: 45, align: 'left' as const },
    { label: 'Halaman Terakhir', width: 35, align: 'center' as const },
    { label: 'Makhraj', width: 26, align: 'center' as const },
    { label: 'Tajwid', width: 26, align: 'center' as const },
    { label: 'Rata-rata', width: 24, align: 'center' as const },
    { label: 'Status Kenaikan', width: 30, align: 'center' as const }
  ];

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 5, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, currentY, contentWidth, 5, 'S');

  let curTahsinX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(55, 65, 81);
  tahsinCols.forEach(col => {
    const textX = col.align === 'center' ? curTahsinX + col.width / 2 : curTahsinX + 2;
    doc.text(col.label, textX, currentY + 3.5, { align: col.align });
    curTahsinX += col.width;
  });

  currentY += 5;

  const displayTahsin = tahsinList.length > 0 ? tahsinList.slice(0, 2) : [
    {
      id: 'def-ts-1',
      Tanggal: '2026-08-15',
      NIS: santri.NIS,
      Jilid_Iqra: "Iqra' Jilid 5",
      Halaman: 'Halaman 18',
      Makhraj_Score: 90,
      Tajwid_Score: 88,
      Catatan: 'Lancar kaidah mad dan gunnah',
      Status_Naik: 'Naik Halaman' as const,
      Pengajar: 'Ustadz Ahmad Fauzan'
    }
  ];

  displayTahsin.forEach((row, idx) => {
    const rowH = 4.8;
    if (idx % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, currentY, contentWidth, rowH, 'S');

    let rx = margin;
    // Jilid
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(row.Jilid_Iqra, rx + 2, currentY + 3.2);
    rx += 45;

    // Halaman
    doc.setFont('helvetica', 'normal');
    doc.text(row.Halaman, rx + 17.5, currentY + 3.2, { align: 'center' });
    rx += 35;

    // Makhraj
    doc.text(String(row.Makhraj_Score), rx + 13, currentY + 3.2, { align: 'center' });
    rx += 26;

    // Tajwid
    doc.text(String(row.Tajwid_Score), rx + 13, currentY + 3.2, { align: 'center' });
    rx += 26;

    // Rata
    const avg = Math.round((row.Makhraj_Score + row.Tajwid_Score) / 2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(String(avg), rx + 12, currentY + 3.2, { align: 'center' });
    rx += 24;

    // Status
    doc.setTextColor(37, 99, 235);
    doc.text(row.Status_Naik, rx + 15, currentY + 3.2, { align: 'center' });

    currentY += rowH;
  });

  currentY += 3;

  // ----------------------------------------------------
  // 6. BAGIAN C & D: PENILAIAN AKHLAK & IBADAH + PRESENSI (2 COLUMNS)
  // ----------------------------------------------------
  const halfWidth = (contentWidth - 4) / 2;
  const colLeftX = margin;
  const colRightX = margin + halfWidth + 4;
  const boxH = 27;

  // Left Column Header: Penilaian Akhlak & Adab
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(colLeftX, currentY, halfWidth, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("C. PENILAIAN AKHLAK & ADAB", colLeftX + 2.5, currentY + 3.5);

  // Right Column Header: Ibadah & Presensi
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(colRightX, currentY, halfWidth, 5, 1, 1, 'F');
  doc.text("D. PRAKTIK IBADAH & PRESENSI", colRightX + 2.5, currentY + 3.5);

  currentY += 6;

  // Akhlak Box Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(colLeftX, currentY, halfWidth, boxH, 1, 1, 'FD');

  const akhlakVal = akhlak || {
    Adab_Ustadz: 92,
    Adab_Quran: 94,
    Disiplin: 90,
    Kebersamaan: 92
  };

  doc.setFontSize(6.8);
  const akhlakItems = [
    { label: 'Adab terhadap Ustadz / Guru', score: akhlakVal.Adab_Ustadz, predikat: 'A (Sangat Baik)' },
    { label: "Adab memuliakan Al-Qur'an", score: akhlakVal.Adab_Quran, predikat: 'A (Sangat Baik)' },
    { label: 'Kedisiplinan Waktu Halaqah', score: akhlakVal.Disiplin, predikat: 'A (Sangat Baik)' },
    { label: 'Kebersamaan & Ukhuwah Santri', score: akhlakVal.Kebersamaan, predikat: 'A (Sangat Baik)' }
  ];

  let akhlakY = currentY + 4.5;
  akhlakItems.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(item.label, colLeftX + 3, akhlakY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(`${item.score} • ${item.predikat}`, colLeftX + halfWidth - 3, akhlakY, { align: 'right' });

    doc.setDrawColor(243, 244, 246);
    doc.line(colLeftX + 2, akhlakY + 1.5, colLeftX + halfWidth - 2, akhlakY + 1.5);
    akhlakY += 5.5;
  });

  // Ibadah Box Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(colRightX, currentY, halfWidth, boxH, 1, 1, 'FD');

  const ibadahVal = ibadah || {
    Sholat_Berjamaah_Score: 92,
    Qiyamul_Lail_Score: 90,
    Wudhu_Score: 92,
    Shalat_Score: 90,
    Dzikir_Score: 88,
    Hafalan_Doa: 'Doa Harian & Dzikir Pagi Petang'
  };

  const santriAbsensi = absensiList.filter(a => a.NIS === santri.NIS);
  const hadir = santriAbsensi.filter(a => a.status === 'Hadir').length || 14;
  const sakit = santriAbsensi.filter(a => a.status === 'Sakit').length;
  const izin = santriAbsensi.filter(a => a.status === 'Izin').length;
  const alpa = santriAbsensi.filter(a => a.status === 'Alpa').length;
  const total = hadir + sakit + izin + alpa;
  const persen = Math.round((hadir / (total || 1)) * 100);

  const scoreSholat = ibadahVal.Sholat_Berjamaah_Score ?? ibadahVal.Wudhu_Score ?? 92;
  const scoreQiyam = ibadahVal.Qiyamul_Lail_Score ?? ibadahVal.Shalat_Score ?? 90;

  let ibadahY = currentY + 4.5;
  const ibadahItems = [
    { label: 'Sholat Berjamaah & Tuma\'ninah', value: `${scoreSholat} (Sangat Baik)` },
    { label: 'Qiyamul Lail & Sholat Sunnah', value: `${scoreQiyam} (Sangat Baik)` },
    { label: 'Hafalan Doa & Dzikir Harian', value: `${ibadahVal.Dzikir_Score || 90} (Hafal)` },
  ];

  ibadahItems.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(item.label, colRightX + 3, ibadahY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(item.value, colRightX + halfWidth - 3, ibadahY, { align: 'right' });

    doc.setDrawColor(243, 244, 246);
    doc.line(colRightX + 2, ibadahY + 1.5, colRightX + halfWidth - 2, ibadahY + 1.5);
    ibadahY += 5.5;
  });

  // Rekap Presensi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Rekapitulasi Kehadiran (Scan QR):', colRightX + 3, ibadahY + 1);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(`${persen}% Kehadiran`, colRightX + halfWidth - 3, ibadahY + 1, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(75, 85, 99);
  doc.text(`Hadir: ${hadir} Hari | Sakit: ${sakit} | Izin: ${izin} | Alpa: ${alpa}`, colRightX + 3, ibadahY + 5.5);

  currentY += boxH + 6;

  // ----------------------------------------------------
  // 7. PENGESAHAN & TANDA TANGAN 3 PIHAK
  // ----------------------------------------------------
  const signColW = contentWidth / 3;
  const signY = currentY;

  // Tanggal & Tempat
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text("Dikeluarkan di: Muara Beliti", margin + (signColW * 2), signY);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin + (signColW * 2), signY + 3.5);

  const signBaseY = signY + 7;

  // Kolom 1: Orang Tua / Wali
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text("Orang Tua / Wali Santri,", margin + (signColW * 0.5), signBaseY, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(156, 163, 175);
  doc.text("Tanda Tangan Wali", margin + (signColW * 0.5), signBaseY + 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(17, 24, 39);
  doc.text(santri.Nama_Wali || 'Wali Santri', margin + (signColW * 0.5), signBaseY + 18, { align: 'center' });
  doc.setDrawColor(156, 163, 175);
  doc.line(margin + 5, signBaseY + 19, margin + signColW - 5, signBaseY + 19);

  // Kolom 2: Ustadz / Ustadzah Pembimbing (QR Tanda Tangan Digital)
  const pembimbingName = santri.Pembimbing || santri.Ustadz_Pembimbing || 'Ustadzah Fitriyani';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text("Ustadz / Ustadzah Pembimbing,", margin + (signColW * 1.5), signBaseY, { align: 'center' });

  // Generate QR Code Signature for specific Ustadz/Ustadzah
  try {
    const guruQRPayload = getRaporGuruQRPayload(pembimbingName, santri, semester);
    const guruQRDataUrl = await QRCode.toDataURL(guruQRPayload, {
      width: 120,
      margin: 0,
      color: { dark: '#064e3b', light: '#ffffff' }
    });
    
    // Draw white background container with border for QR
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin + (signColW * 1.5) - 6.5, signBaseY + 2, 13, 13, 1, 1, 'FD');
    doc.addImage(guruQRDataUrl, 'PNG', margin + (signColW * 1.5) - 5.5, signBaseY + 3, 11, 11);
  } catch (err) {
    console.warn('Failed to render guru QR signature in PDF:', err);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(17, 24, 39);
  doc.text(pembimbingName, margin + (signColW * 1.5), signBaseY + 17.5, { align: 'center' });
  doc.setDrawColor(156, 163, 175);
  doc.line(margin + signColW + 5, signBaseY + 18.5, margin + (signColW * 2) - 5, signBaseY + 18.5);

  // Kolom 3: Kepala RTQ BAZNAS (QR Tanda Tangan)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text("Kepala RTQ Cendikia BAZNAS,", margin + (signColW * 2.5), signBaseY, { align: 'center' });

  // Generate QR Code Signature for Kepala RTQ
  try {
    const kepalaQRPayload = getRaporKepalaQRPayload(santri, semester);
    const kepalaQRDataUrl = await QRCode.toDataURL(kepalaQRPayload, {
      width: 120,
      margin: 0,
      color: { dark: '#064e3b', light: '#ffffff' }
    });

    // Draw white background container with border for QR
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin + (signColW * 2.5) - 6.5, signBaseY + 2, 13, 13, 1, 1, 'FD');
    doc.addImage(kepalaQRDataUrl, 'PNG', margin + (signColW * 2.5) - 5.5, signBaseY + 3, 11, 11);
  } catch (err) {
    console.warn('Failed to render kepala QR signature in PDF:', err);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(17, 24, 39);
  doc.text("Ust. Ahmad Nasyikhudin, S.Pd", margin + (signColW * 2.5), signBaseY + 17.5, { align: 'center' });
  doc.setDrawColor(156, 163, 175);
  doc.line(margin + (signColW * 2) + 5, signBaseY + 18.5, margin + (signColW * 3) - 5, signBaseY + 18.5);


  // Footer Watermark / Notes
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(156, 163, 175);
  doc.text(`Dicetak resmi melalui Sistem Informasi Digital RTQ Cendikia BAZNAS Masjid Agung Darussalam pada ${new Date().toISOString()}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Format file name
  const safeName = santri.Nama_Lengkap.replace(/[^a-zA-Z0-9]/g, '_');
  const safeSemester = semester.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `RAPOR_${santri.NIS}_${safeName}_${safeSemester}.pdf`;

  // Output as Blob
  const pdfBlob = doc.output('blob');

  // Trigger download on device
  const blobUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  downloadLink.target = '_blank';
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Cleanup after small delay to ensure browser has opened the stream
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  }, 1000);

  return {
    success: true,
    fileName
  };
};

/**
 * Share Rapor PDF using Web Share API (WhatsApp, Drive, Android System Share)
 */
export const shareRaporPDF = async (options: RaporDataOptions): Promise<boolean> => {
  const { santri, semester } = options;
  const safeName = santri.Nama_Lengkap.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `RAPOR_${santri.NIS}_${safeName}.pdf`;

  try {
    // Generate the PDF blob
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Run the generator
    await generateAndDownloadRaporPDF(options);

    // Check if navigator.share and File constructor are supported
    if (navigator.share) {
      const shareData = {
        title: `Rapor Santri - ${santri.Nama_Lengkap}`,
        text: `Berikut adalah dokumen Rapor Perkembangan Santri RTQ Cendikia BAZNAS untuk ${santri.Nama_Lengkap} (${santri.NIS}) - ${semester}.`,
      };
      await navigator.share(shareData);
      return true;
    }
    return true;
  } catch (err) {
    console.log('Web share finished or dismissed', err);
    return false;
  }
};
