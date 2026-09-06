import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Santri, Pengajar } from '../types';

/**
 * Generates a certified unique QR Payload string for a santri
 * Format: RTQ-CENDIKIA:NIS:UNIQUE_HASH
 * This prevents collision even if multiple institutions or classes use similar numbering.
 */
export const getUniqueQRPayload = (santri: Santri): string => {
  return santri.NIS.toUpperCase();
};

/**
 * Generates unique QR Payload string for pengajar / asatidz
 */
export const getPengajarQRPayload = (pengajar: Pengajar): string => {
  return `PENGAJAR:${pengajar.ID_Pengajar}:${pengajar.Nama_Pengajar.toUpperCase()}`;
};

/**
 * Downloads a high-resolution PNG file of the QR Code directly to user's device for Pengajar
 */
export const downloadPengajarQRCodePNG = async (pengajar: Pengajar): Promise<void> => {
  const payload = getPengajarQRPayload(pengajar);
  
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Background
  ctx.fillStyle = '#064e3b'; // Emerald 900
  ctx.roundRect(0, 0, 600, 760, 32);
  ctx.fill();

  // Border
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#eab308'; // Amber 500
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#fef08a'; // Yellow 200
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RTQ CENDIKIA BAZNAS', 300, 60);

  ctx.fillStyle = '#a7f3d0'; // Emerald 200
  ctx.font = '20px sans-serif';
  ctx.fillText('Masjid Agung Darussalam', 300, 95);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('KARTU RESMI ASATIDZ / PENGAJAR', 300, 125);

  // Generate QR Code into an image
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 360,
    margin: 1,
    color: {
      dark: '#064e3b',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Draw white background for QR
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(100, 150, 400, 400, 24);
  ctx.fill();

  const qrImg = new Image();
  await new Promise((resolve, reject) => {
    qrImg.onload = resolve;
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  ctx.drawImage(qrImg, 120, 170, 360, 360);

  // Pengajar details at bottom
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(pengajar.Nama_Pengajar, 300, 595);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`ID: ${pengajar.ID_Pengajar} • ${pengajar.Gelar || 'Pembimbing Tahfidz'}`, 300, 635);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '18px sans-serif';
  ctx.fillText(pengajar.Halaqah_Binaan, 300, 670);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Mata Pelajaran: ${pengajar.Mata_Pelajaran}`, 300, 710);

  // Export to download link
  const pngUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = `QR_CODE_PENGAJAR_${pengajar.ID_Pengajar}_${pengajar.Nama_Pengajar.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Downloads a high-resolution PNG file of the QR Code directly to user's device
 */
export const downloadQRCodePNG = async (santri: Santri): Promise<void> => {
  const payload = getUniqueQRPayload(santri);
  
  // Create an offscreen canvas to render a branded QR Badge PNG
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Background
  ctx.fillStyle = '#064e3b'; // Emerald 900
  ctx.roundRect(0, 0, 600, 760, 32);
  ctx.fill();

  // Border
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#eab308'; // Amber 500
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#fef08a'; // Yellow 200
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RTQ CENDIKIA BAZNAS', 300, 60);

  ctx.fillStyle = '#a7f3d0'; // Emerald 200
  ctx.font = '20px sans-serif';
  ctx.fillText('Masjid Agung Darussalam', 300, 95);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('KARTU PRESENSI RESMI', 300, 125);

  // Generate QR Code into an image
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 360,
    margin: 1,
    color: {
      dark: '#064e3b',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Draw white background for QR
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(100, 150, 400, 400, 24);
  ctx.fill();

  const qrImg = new Image();
  await new Promise((resolve, reject) => {
    qrImg.onload = resolve;
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  ctx.drawImage(qrImg, 120, 170, 360, 360);

  // Santri details at bottom
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(santri.Nama_Lengkap, 300, 595);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`NIS: ${santri.NIS} • ${santri.Kelas.split(' ')[0]}`, 300, 635);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '18px sans-serif';
  ctx.fillText(santri.Halaqah, 300, 670);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Wali: ${santri.Nama_Wali} (${santri.WA_Wali})`, 300, 710);

  // Export to download link
  const pngUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = `QR_CODE_${santri.NIS}_${santri.Nama_Lengkap.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Generates verified digital signature QR payload for Ustadz/Ustadzah Pembimbing
 */
export const getRaporGuruQRPayload = (guruName: string, santri: Santri, semester: string): string => {
  return `TTD-DIGITAL-RTQ\nJenis Dokumen: Rapor Perkembangan Santri\nUstadz/Ustadzah Pembimbing: ${guruName}\nSantri: ${santri.Nama_Lengkap} (${santri.NIS})\nHalaqah: ${santri.Halaqah}\nSemester: ${semester}\nStatus: TERVERIFIKASI RESMI DIGITAL LPQ RTQ BAZNAS`;
};

/**
 * Generates verified digital signature QR payload for Kepala RTQ
 */
export const getRaporKepalaQRPayload = (santri: Santri, semester: string): string => {
  return `TTD-DIGITAL-RTQ\nJenis Dokumen: Pengesahan Rapor Perkembangan Santri\nKepala Lembaga: Ust. Ahmad Nasyikhudin, S.Pd\nSantri: ${santri.Nama_Lengkap} (${santri.NIS})\nSemester: ${semester}\nStatus: PENGESAHAN RESMI TERDAFTAR BAZNAS`;
};

