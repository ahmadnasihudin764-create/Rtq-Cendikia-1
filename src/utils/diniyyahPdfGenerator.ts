import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { DiniyyahRecord, Santri, DINIYYAH_CONFIG } from '../types';

export interface DiniyyahPdfOptions {
  record: DiniyyahRecord;
  santri?: Santri;
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
 * Generates an official publication-grade PDF for Ngaji Diniyyah with Kop Surat
 * and initiates direct download for Mobile (Android) & Desktop.
 */
export const generateAndDownloadDiniyyahPDF = async (
  options: DiniyyahPdfOptions
): Promise<{ success: boolean; fileName: string }> => {
  const { record, santri, logoUrl } = options;

  // Initialize jsPDF A4 portrait in millimeters
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Color Palette
  const darkEmerald = [6, 78, 59]; // #064E3B
  const lightEmerald = [236, 253, 245]; // #ECFDF5
  const midEmerald = [16, 185, 129]; // #10B981
  const gold = [217, 119, 6]; // #D97706
  const grayText = [75, 85, 99]; // #4B5563
  const darkText = [17, 24, 39]; // #111827
  const borderGray = [209, 213, 219]; // #D1D5DB

  // Page Border Outer Double Frame
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
    console.warn('PDF Diniyyah Kop logo rendering fallback:', err);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(6, 78, 59);
  doc.text("RTQ CENDIKIA BAZNAS", pageWidth / 2, currentY + 6.5, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  doc.text("MASJID AGUNG DARUSSALAM", pageWidth / 2, currentY + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text("Jln. Pangeran Mohammad Amin, Desa Muara Beliti Baru, Kec. Muara Beliti, Kab. Musi Rawas", pageWidth / 2, currentY + 18, { align: 'center' });

  // QR Code Verification
  try {
    const qrDataUrl = await QRCode.toDataURL(
      `RTQ-DINIYYAH:${record.NIS}:${record.namaSantri}:${record.jenjang}:${record.tahunAjaran}:${record.semester}`,
      {
        width: 100,
        margin: 0,
        color: { dark: '#064e3b', light: '#ffffff' }
      }
    );
    doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 19, currentY + 3, 16, 16);
    doc.setFontSize(5);
    doc.setTextColor(6, 78, 59);
    doc.setFont('helvetica', 'bold');
    doc.text("E-VERIFIED", pageWidth - margin - 11, currentY + 21, { align: 'center' });
  } catch (e) {
    console.error('QR code generation failed:', e);
  }

  currentY += 26;

  // Horizontal Double Line Divider
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);

  currentY += 6;

  // ----------------------------------------------------
  // 2. JUDUL DOKUMEN & PERIODE
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(6, 78, 59);
  doc.text("LAPORAN CAPAIAN NILAI NGAJI DINIYYAH", pageWidth / 2, currentY + 3, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 119, 6);
  doc.text(`Tahun Ajaran ${record.tahunAjaran} • ${record.semester.toUpperCase()}`, pageWidth / 2, currentY + 8, { align: 'center' });

  currentY += 12;

  // ----------------------------------------------------
  // 3. BIODATA SANTRI (GRID BOX)
  // ----------------------------------------------------
  const bioBoxHeight = 24;
  doc.setFillColor(236, 253, 245); // Light emerald
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, currentY, contentWidth, bioBoxHeight, 2, 2, 'FD');

  const col1X = margin + 5;
  const col2X = margin + 95;

  doc.setFontSize(8);

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Nama Lengkap :", col1X, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(record.namaSantri, col1X + 28, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Jenjang Diniyyah :", col2X, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(`${record.jenjang}`, col2X + 30, currentY + 5.5);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Nomor Induk (NIS) :", col1X, currentY + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(record.NIS, col1X + 28, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Guru Pembimbing :", col2X, currentY + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(record.guruPembimbing, col2X + 30, currentY + 11.5);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Kelas / Halaqah :", col1X, currentY + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`${santri?.Kelas || 'Kelas Santri'} - ${santri?.Halaqah || 'Halaqah 1'}`, col1X + 28, currentY + 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text("Wali Santri :", col2X, currentY + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(santri?.Nama_Wali || '-', col2X + 30, currentY + 17.5);

  currentY += bioBoxHeight + 6;

  // ----------------------------------------------------
  // 4. TABEL NILAI 4 MATA PELAJARAN KITAB
  // ----------------------------------------------------
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(margin, currentY, contentWidth, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("HASIL PENILAIAN MATA PELAJARAN DINIYYAH", margin + 4, currentY + 4.2);

  currentY += 7.5;

  const tableCols = [
    { label: 'No', width: 14, align: 'center' as const },
    { label: 'Mata Pelajaran (Kitab)', width: 66, align: 'left' as const },
    { label: 'KKM', width: 22, align: 'center' as const },
    { label: 'Nilai Angka', width: 26, align: 'center' as const },
    { label: 'Predikat', width: 28, align: 'center' as const },
    { label: 'Keterangan', width: 26, align: 'center' as const }
  ];

  // Header Table
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.2);
  doc.rect(margin, currentY, contentWidth, 6, 'S');

  let curX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  tableCols.forEach(col => {
    const textX = col.align === 'center' ? curX + col.width / 2 : curX + 3;
    doc.text(col.label, textX, currentY + 4.2, { align: col.align });
    curX += col.width;
  });

  currentY += 6;

  // Rows of Subjects
  record.nilaiList.forEach((item, idx) => {
    const rowHeight = 7;
    const isEven = idx % 2 === 1;

    if (isEven) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'S');

    const score = item.nilai !== null ? item.nilai : 0;
    let pred = 'Belum Ada';
    if (score >= 90) pred = 'Mumtaz';
    else if (score >= 80) pred = 'Jayyid Jiddan';
    else if (score >= 70) pred = 'Jayyid';
    else if (score >= 60) pred = 'Maqbul';
    else if (item.nilai !== null) pred = 'Perlu Bimbingan';

    const isPass = score >= 70;

    let colX = margin;
    doc.setFontSize(7.5);

    // No
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(String(idx + 1), colX + 7, currentY + 4.8, { align: 'center' });
    colX += 14;

    // Mapel
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(item.mapel, colX + 3, currentY + 4.8);
    colX += 66;

    // KKM
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text("70", colX + 11, currentY + 4.8, { align: 'center' });
    colX += 22;

    // Nilai Angka
    doc.setFont('helvetica', 'bold');
    if (item.nilai !== null) {
      if (item.nilai >= 70) {
        doc.setTextColor(6, 78, 59);
      } else {
        doc.setTextColor(185, 28, 28);
      }
      doc.text(String(item.nilai), colX + 13, currentY + 4.8, { align: 'center' });
    } else {
      doc.setTextColor(156, 163, 175);
      doc.text("-", colX + 13, currentY + 4.8, { align: 'center' });
    }
    colX += 26;

    // Predikat
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(pred, colX + 14, currentY + 4.8, { align: 'center' });
    colX += 28;

    // Keterangan
    doc.setFont('helvetica', 'normal');
    if (item.nilai !== null) {
      if (isPass) {
        doc.setTextColor(6, 78, 59);
        doc.text("Tuntas", colX + 13, currentY + 4.8, { align: 'center' });
      } else {
        doc.setTextColor(185, 28, 28);
        doc.text("Remedial", colX + 13, currentY + 4.8, { align: 'center' });
      }
    } else {
      doc.setTextColor(156, 163, 175);
      doc.text("Belum Ujian", colX + 13, currentY + 4.8, { align: 'center' });
    }

    currentY += rowHeight;
  });

  // Summary Row: Jumlah Nilai
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 6.5, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, currentY, contentWidth, 6.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  doc.text("JUMLAH NILAI :", margin + 14 + 66 + 22 - 3, currentY + 4.5, { align: 'right' });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(8.5);
  doc.text(String(record.jumlahNilai), margin + 14 + 66 + 22 + 13, currentY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("Total akumulasi 4 mata pelajaran", margin + 14 + 66 + 22 + 26 + 3, currentY + 4.5);

  currentY += 6.5;

  // Summary Row: Rata-Rata Nilai & Predikat
  doc.setFillColor(236, 253, 245);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.rect(margin, currentY, contentWidth, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 78, 59);
  doc.text("RATA-RATA NILAI :", margin + 14 + 66 + 22 - 3, currentY + 4.8, { align: 'right' });

  doc.setFontSize(9);
  doc.text(String(record.rataRata), margin + 14 + 66 + 22 + 13, currentY + 4.8, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6);
  doc.text(record.predikat, margin + 14 + 66 + 22 + 26 + 14, currentY + 4.8, { align: 'center' });

  const isLulus = record.rataRata >= 70;
  doc.setFont('helvetica', 'bold');
  if (isLulus) {
    doc.setTextColor(6, 78, 59);
    doc.text("LULUS / TUNTAS", margin + 14 + 66 + 22 + 26 + 28 + 13, currentY + 4.8, { align: 'center' });
  } else {
    doc.setTextColor(185, 28, 28);
    doc.text("PERLU REMEDIAL", margin + 14 + 66 + 22 + 26 + 28 + 13, currentY + 4.8, { align: 'center' });
  }

  currentY += 10;

  // ----------------------------------------------------
  // 5. CATATAN GURU PEMBIMBING
  // ----------------------------------------------------
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  doc.text("Catatan & Evaluasi Perkembangan Guru Pembimbing:", margin + 4, currentY + 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  const note = record.catatanGuru || "Alhamdulillah ananda istiqomah dalam mengikuti pengajian kitab diniyyah dan menunjukkan akhlak serta adab penuntut ilmu yang terpuji.";
  const splitNote = doc.splitTextToSize(note, contentWidth - 8);
  doc.text(splitNote, margin + 4, currentY + 9);

  currentY += 21;

  // ----------------------------------------------------
  // 6. KRITERIA PREDIKAT KELULUSAN (LEGEND BOX)
  // ----------------------------------------------------
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, contentWidth, 11, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 78, 59);
  doc.text("Keterangan Kriteria Penilaian:", margin + 3, currentY + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(55, 65, 81);
  doc.text("• Mumtaz: 90 - 100 (Istimewa)   |   • Jayyid Jiddan: 80 - 89 (Sangat Baik)   |   • Jayyid: 70 - 79 (Baik / KKM 70)", margin + 3, currentY + 7);
  doc.text("• Maqbul: 60 - 69 (Cukup)   |   • Perlu Bimbingan: < 60 (Remedial & Muroja'ah Intensif)", margin + 3, currentY + 9.8);

  currentY += 15;

  // ----------------------------------------------------
  // 7. KOLOM TANDA TANGAN RESMI
  // ----------------------------------------------------
  const sigColWidth = contentWidth / 3;
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Column 1: Wali Santri
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("Mengetahui,", margin + sigColWidth / 2, currentY + 2, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text("Orang Tua / Wali Santri", margin + sigColWidth / 2, currentY + 6, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(156, 163, 175);
  doc.text("Tanda Tangan Wali", margin + sigColWidth / 2, currentY + 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(17, 24, 39);
  doc.text(`( ${santri?.Nama_Wali || '.....................................'} )`, margin + sigColWidth / 2, currentY + 26, { align: 'center' });

  // Column 2: Guru Pembimbing Diniyyah (QR Signature)
  const col2SigX = margin + sigColWidth + sigColWidth / 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text(`Muara Beliti, ${dateStr}`, col2SigX, currentY + 2, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text("Guru Pembimbing Diniyyah", col2SigX, currentY + 6, { align: 'center' });

  try {
    const guruDiniyyahQRPayload = `TTD-DIGITAL-RTQ\nJenis: Rapor Nilai Diniyyah\nGuru Pembimbing: ${record.guruPembimbing}\nSantri: ${record.namaSantri} (${record.NIS})\nJenjang: ${record.jenjang}\nStatus: TERVERIFIKASI RESMI DIGITAL`;
    const guruQRDataUrl = await QRCode.toDataURL(guruDiniyyahQRPayload, {
      width: 100,
      margin: 0,
      color: { dark: '#064e3b', light: '#ffffff' }
    });
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(col2SigX - 6, currentY + 8, 12, 12, 1, 1, 'FD');
    doc.addImage(guruQRDataUrl, 'PNG', col2SigX - 5, currentY + 9, 10, 10);
  } catch (e) {
    console.warn('Error generating guru diniyyah QR:', e);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(17, 24, 39);
  doc.text(record.guruPembimbing, col2SigX, currentY + 26, { align: 'center' });

  // Column 3: Pimpinan Lembaga (QR Signature)
  const col3SigX = margin + sigColWidth * 2 + sigColWidth / 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("Pimpinan Lembaga,", col3SigX, currentY + 2, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text("RTQ Cendikia BAZNAS", col3SigX, currentY + 6, { align: 'center' });

  try {
    const kepalaDiniyyahQRPayload = `TTD-DIGITAL-RTQ\nJenis: Pengesahan Rapor Diniyyah\nKepala RTQ: Ust. Ahmad Nasyikhudin, S.Pd\nSantri: ${record.namaSantri} (${record.NIS})\nJenjang: ${record.jenjang}\nStatus: PENGESAHAN RESMI SAH`;
    const kepalaQRDataUrl = await QRCode.toDataURL(kepalaDiniyyahQRPayload, {
      width: 100,
      margin: 0,
      color: { dark: '#064e3b', light: '#ffffff' }
    });
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(col3SigX - 6, currentY + 8, 12, 12, 1, 1, 'FD');
    doc.addImage(kepalaQRDataUrl, 'PNG', col3SigX - 5, currentY + 9, 10, 10);
  } catch (e) {
    console.warn('Error generating kepala diniyyah QR:', e);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(17, 24, 39);
  doc.text("Ust. Ahmad Nasyikhudin, S.Pd", col3SigX, currentY + 26, { align: 'center' });


  // Clean filename
  const cleanName = record.namaSantri.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanJenjang = record.jenjang.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rapor_Diniyyah_${cleanJenjang}_${record.NIS}_${cleanName}.pdf`;

  // Trigger download
  doc.save(fileName);

  return {
    success: true,
    fileName
  };
};
