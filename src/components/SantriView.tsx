import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Santri } from '../types';
import { 
  Plus, 
  Search, 
  QrCode, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  Download, 
  Phone, 
  UserCheck, 
  MapPin,
  Calendar,
  Printer,
  Sparkles,
  Grid,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Save,
  Check,
  Image as ImageIcon,
  Home
} from 'lucide-react';
import { CetakSemuaKartuModal } from './modals/CetakSemuaKartuModal';
import { LihatQRModal } from './modals/LihatQRModal';
import { CetakSemuaQRModal } from './modals/CetakSemuaQRModal';
import { BuatQRModal } from './modals/BuatQRModal';
import { downloadQRCodePNG } from '../utils/qrUtils';
import { generateAndDownloadRaporPDF } from '../utils/raporPdfGenerator';

export const SantriView: React.FC = () => {
  const { 
    santriList, 
    addSantri, 
    updateSantri, 
    deleteSantri, 
    setSelectedSantriForCard, 
    tahfidzList,
    tahsinList,
    akhlakList,
    ibadahList,
    absensiList,
    appLogo,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPembimbing, setFilterPembimbing] = useState('Semua');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterHalaqah, setFilterHalaqah] = useState('Semua');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [isBulkQROpen, setIsBulkQROpen] = useState(false);
  const [isBuatQROpen, setIsBuatQROpen] = useState(false);
  const [selectedSantriQR, setSelectedSantriQR] = useState<Santri | null>(null);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [detailSantri, setDetailSantri] = useState<Santri | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Santri>>({
    NIS: '',
    Nama_Lengkap: '',
    Jenis_Kelamin: 'Laki-laki',
    Kelas: 'Kelas 1 SD',
    Halaqah: 'Semua Halaqoh',
    Pembimbing: 'Ustadzah Fitriyani',
    Nama_Wali: '',
    WA_Wali: '',
    Alamat: '',
    Tanggal_Lahir: '2014-01-01',
    Tanggal_Masuk: new Date().toISOString().split('T')[0],
    Status: 'Aktif',
    Target_Juz: 'Juz 30'
  });

  const filteredSantri = santriList.filter((s) => {
    const matchesSearch = s.Nama_Lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.NIS.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.Pembimbing && s.Pembimbing.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.Nama_Wali.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'Semua' || s.Jenis_Kelamin === filterGender;
    const matchesStatus = filterStatus === 'Semua' || s.Status === filterStatus;
    const matchesPembimbing = filterPembimbing === 'Semua' || s.Pembimbing === filterPembimbing || s.Ustadz_Pembimbing === filterPembimbing;
    const matchesKelas = filterKelas === 'Semua' || s.Kelas === filterKelas;
    const matchesHalaqah = filterHalaqah === 'Semua' || s.Halaqah === filterHalaqah;
    return matchesSearch && matchesGender && matchesStatus && matchesPembimbing && matchesKelas && matchesHalaqah;
  });

  const handleOpenAdd = () => {
    setEditingSantri(null);
    const nextNIS = 'STR' + String(santriList.length + 1).padStart(3, '0');
    setFormData({
      NIS: nextNIS,
      Nama_Lengkap: '',
      Nama_Panggilan: '',
      Jenis_Kelamin: 'Laki-laki',
      Tempat_Lahir: 'Cilacap',
      Tanggal_Lahir: '2014-01-01',
      Kelas: 'Kelas 1 SD',
      Halaqah: 'Semua Halaqoh',
      Pembimbing: 'Ustadzah Fitriyani',
      Asrama: 'Kamar Abu Bakar',
      Nama_Wali: '',
      WA_Wali: '',
      Alamat: '',
      Tanggal_Masuk: new Date().toISOString().split('T')[0],
      Status: 'Aktif',
      Target_Juz: 'Juz 30',
      Foto: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Santri) => {
    setEditingSantri(s);
    setFormData({
      NIS: s.NIS || '',
      Nama_Lengkap: s.Nama_Lengkap || '',
      Nama_Panggilan: s.Nama_Panggilan || '',
      Jenis_Kelamin: s.Jenis_Kelamin || 'Laki-laki',
      Tempat_Lahir: s.Tempat_Lahir || '',
      Tanggal_Lahir: s.Tanggal_Lahir || '2014-01-01',
      Kelas: s.Kelas || 'Kelas 1 SD',
      Halaqah: s.Halaqah || 'Semua Halaqoh',
      Pembimbing: s.Pembimbing || s.Ustadz_Pembimbing || 'Ustadzah Fitriyani',
      Asrama: s.Asrama || '',
      Nama_Wali: s.Nama_Wali || '',
      WA_Wali: s.WA_Wali || '',
      Alamat: s.Alamat || '',
      Tanggal_Masuk: s.Tanggal_Masuk || new Date().toISOString().split('T')[0],
      Status: s.Status || 'Aktif',
      Target_Juz: s.Target_Juz || 'Juz 30',
      Foto: s.Foto || '',
      NIK: s.NIK || '',
      Nomor_KK: s.Nomor_KK || '',
      NISN: s.NISN || '',
      RT_RW: s.RT_RW || '',
      Desa_Kelurahan: s.Desa_Kelurahan || '',
      Kecamatan: s.Kecamatan || '',
      Kabupaten_Kota: s.Kabupaten_Kota || '',
      Provinsi: s.Provinsi || '',
      Kode_Pos: s.Kode_Pos || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS?.trim() || !formData.Nama_Lengkap?.trim()) {
      showToast('Nomor Induk Santri (NIS) dan Nama Lengkap wajib diisi.', 'warning');
      return;
    }

    const pembimbingVal = formData.Pembimbing?.trim() || 'Ustadzah Fitriyani';

    if (editingSantri) {
      const updatedRecord: Santri = {
        ...editingSantri,
        ...formData,
        NIS: formData.NIS.trim(),
        Nama_Lengkap: formData.Nama_Lengkap.trim(),
        Pembimbing: pembimbingVal,
        Ustadz_Pembimbing: pembimbingVal,
        Nama_Wali: formData.Nama_Wali?.trim() || editingSantri.Nama_Wali,
        WA_Wali: formData.WA_Wali?.trim() || editingSantri.WA_Wali,
        Kelas: formData.Kelas || editingSantri.Kelas,
        Halaqah: formData.Halaqah || editingSantri.Halaqah,
        Status: (formData.Status as 'Aktif' | 'Cuti' | 'Alumni') || editingSantri.Status,
        Jenis_Kelamin: (formData.Jenis_Kelamin as 'Laki-laki' | 'Perempuan') || editingSantri.Jenis_Kelamin,
        Alamat: formData.Alamat?.trim() || editingSantri.Alamat,
        Tanggal_Lahir: formData.Tanggal_Lahir || editingSantri.Tanggal_Lahir,
        Tanggal_Masuk: formData.Tanggal_Masuk || editingSantri.Tanggal_Masuk,
        Target_Juz: formData.Target_Juz || editingSantri.Target_Juz
      };

      updateSantri(editingSantri.NIS, updatedRecord);
      setEditingSantri(null);
    } else {
      const newSantri: Santri = {
        NIS: formData.NIS.trim(),
        Nama_Lengkap: formData.Nama_Lengkap.trim(),
        Nama_Panggilan: formData.Nama_Panggilan?.trim() || formData.Nama_Lengkap.split(' ')[0],
        Jenis_Kelamin: (formData.Jenis_Kelamin as 'Laki-laki' | 'Perempuan') || 'Laki-laki',
        Tempat_Lahir: formData.Tempat_Lahir || 'Cilacap',
        Tanggal_Lahir: formData.Tanggal_Lahir || '2014-01-01',
        Kelas: formData.Kelas || 'Kelas 1 SD',
        Halaqah: formData.Halaqah || "Tahfidz Ba'da Ashar",
        Pembimbing: pembimbingVal,
        Ustadz_Pembimbing: pembimbingVal,
        Asrama: formData.Asrama || 'Kamar Abu Bakar',
        Nama_Wali: formData.Nama_Wali?.trim() || 'Wali Santri',
        WA_Wali: formData.WA_Wali?.trim() || '081234567890',
        Alamat: formData.Alamat?.trim() || 'Cilacap, Jawa Tengah',
        Tanggal_Masuk: formData.Tanggal_Masuk || new Date().toISOString().split('T')[0],
        Status: (formData.Status as 'Aktif' | 'Cuti' | 'Alumni') || 'Aktif',
        Target_Juz: formData.Target_Juz || 'Juz 30',
        Foto: formData.Foto || ''
      };
      addSantri(newSantri);
    }
    setIsModalOpen(false);
  };

  return (
    <div id="section-santri-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Database Santri RTQ Cendikia</h3>
          <p className="text-xs text-gray-500">Total {santriList.length} santri terdaftar dalam sistem</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Buat QR Code */}
          <button
            id="btn-buat-qr-code"
            onClick={() => setIsBuatQROpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
            title="Generator & Validasi QR Code Santri Unik"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat QR Code</span>
          </button>

          {/* Tombol Cetak Semua QR */}
          <button
            id="btn-cetak-semua-qr"
            onClick={() => setIsBulkQROpen(true)}
            className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
            title="Cetak & Unduh Semua QR Code Lembar Stiker A4"
          >
            <Grid className="w-4 h-4" />
            <span>Cetak Semua QR</span>
          </button>

          {/* Tombol Cetak Semua Kartu (PDF) */}
          <button
            onClick={() => setIsBulkPrintOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Semua Kartu (PDF)</span>
          </button>

          {/* Tombol Tambah Santri Baru */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow shadow-emerald-700/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIS, Nama Santri, atau Wali..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-gray-50 text-gray-700 focus:outline-none font-medium"
          >
            <option value="Semua">Semua Kelas</option>
            <option value="Kelas 1 SD">Kelas 1 SD</option>
            <option value="Kelas 2 SD">Kelas 2 SD</option>
            <option value="Kelas 3 SD">Kelas 3 SD</option>
            <option value="Kelas 4 SD">Kelas 4 SD</option>
            <option value="Kelas 5 SD">Kelas 5 SD</option>
            <option value="Kelas 6 SD">Kelas 6 SD</option>
            <option value="Kelas 1 SMP">Kelas 1 SMP</option>
            <option value="Kelas 2 SMP">Kelas 2 SMP</option>
            <option value="Kelas 3 SMP">Kelas 3 SMP</option>
            <option value="Kelas 1 SMA">Kelas 1 SMA</option>
            <option value="Kelas 2 SMA">Kelas 2 SMA</option>
            <option value="Kelas 3 SMA">Kelas 3 SMA</option>
          </select>

          <select
            value={filterHalaqah}
            onChange={(e) => setFilterHalaqah(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="Semua">Semua Halaqoh</option>
            <option value="Tahfidz Ba'da Ashar">Tahfidz Ba'da Ashar</option>
            <option value="Muroja'ah Ba'da Maghrib">Muroja'ah Ba'da Maghrib</option>
            <option value="Diniyyah Ba'da Isya'">Diniyyah Ba'da Isya'</option>
            <option value="Jam Wajib Ba'da Subuh">Jam Wajib Ba'da Subuh</option>
          </select>

          <select
            value={filterPembimbing}
            onChange={(e) => setFilterPembimbing(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="Semua">Semua Pembimbing</option>
            <option value="Ustadzah Fitriyani">Ustadzah Fitriyani</option>
            <option value="Ustadzah Dzatun Nafis Al baidh, S.Pd">Ustadzah Dzatun Nafis Al baidh, S.Pd</option>
            <option value="Ustadzah Sri Siti Khafsoh">Ustadzah Sri Siti Khafsoh</option>
            <option value="Ust Ahmad Nasyikhudin, S.Pd">Ust Ahmad Nasyikhudin, S.Pd</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="Semua">Semua Gender</option>
            <option value="Laki-laki">Laki-laki (Ikhwan)</option>
            <option value="Perempuan">Perempuan (Akhwat)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Santri Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">NIS</th>
                <th className="p-3.5">Nama Lengkap Santri</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Kelas & Halaqah</th>
                <th className="p-3.5">Ustadz/ah Pembimbing</th>
                <th className="p-3.5">Wali / No. WhatsApp</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSantri.map((s) => (
                <tr key={s.NIS} className="hover:bg-gray-50/80 transition">
                  <td className="p-3.5 font-mono font-bold text-emerald-800">{s.NIS}</td>
                  <td className="p-3.5 font-semibold text-gray-900">
                    {s.Nama_Lengkap}
                    <span className="block text-[10px] text-gray-400 font-normal">Target: {s.Target_Juz || 'Juz 30'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      s.Jenis_Kelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}>
                      {s.Jenis_Kelamin === 'Laki-laki' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-medium text-gray-800">{s.Kelas}</span>
                    <span className="block text-[10px] text-emerald-700 font-medium">{s.Halaqah}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-semibold text-[11px] border border-emerald-200">
                      📖 {s.Pembimbing || s.Ustadz_Pembimbing || 'Ustadzah Fitriyani'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-medium text-gray-800">{s.Nama_Wali}</span>
                    <a
                      href={`https://wa.me/${s.WA_Wali?.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{s.WA_Wali}</span>
                    </a>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      s.Status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.Status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {/* Tombol Lihat QR */}
                      <button
                        onClick={() => setSelectedSantriQR(s)}
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                        title="Lihat QR Code Santri"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {/* Tombol Download QR */}
                      <button
                        onClick={async () => {
                          try {
                            showToast(`Mengunduh QR Code ${s.NIS}...`, 'info');
                            await downloadQRCodePNG(s);
                            showToast(`QR Code ${s.NIS} berhasil diunduh!`, 'success');
                          } catch (e) {
                            showToast('Gagal mengunduh gambar QR.', 'error');
                          }
                        }}
                        className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                        title="Download Gambar QR Code (PNG)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Tombol Cetak QR */}
                      <button
                        onClick={() => setSelectedSantriQR(s)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                        title="Cetak QR Code Santri"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Tombol Rapor PDF */}
                      <button
                        onClick={async () => {
                          try {
                            showToast(`Membuat file PDF Rapor ${s.Nama_Lengkap}...`, 'info');
                            const sTahfidz = tahfidzList.filter(t => t.NIS === s.NIS);
                            const sTahsin = tahsinList.filter(t => t.NIS === s.NIS);
                            const sAkhlak = akhlakList.find(a => a.NIS === s.NIS);
                            const sIbadah = ibadahList.find(i => i.NIS === s.NIS);
                            const sAbsensi = absensiList.filter(a => a.NIS === s.NIS);
                            
                            const res = await generateAndDownloadRaporPDF({
                              santri: s,
                              semester: 'Semester Ganjil 2026 / 2027',
                              tahfidzList: sTahfidz,
                              tahsinList: sTahsin,
                              akhlak: sAkhlak,
                              ibadah: sIbadah,
                              absensiList: sAbsensi,
                              logoUrl: appLogo
                            });
                            if (res.success) {
                              showToast(`Rapor PDF ${s.NIS} berhasil diunduh ke HP/perangkat!`, 'success');
                            }
                          } catch (e) {
                            showToast('Gagal mengunduh Rapor PDF.', 'error');
                          }
                        }}
                        className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition"
                        title="Download Rapor PDF Resmi"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>

                      {/* Tombol Kartu Santri Lengkap */}
                      <button
                        onClick={() => setSelectedSantriForCard(s)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                        title="Kartu Santri Lengkap"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDetailSantri(s)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                        title="Detail Santri"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        id={`btn-edit-santri-${s.NIS}`}
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition font-medium flex items-center justify-center"
                        title="Edit Data Santri"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus data santri ${s.Nama_Lengkap}?`)) {
                            deleteSantri(s.NIS);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSantri.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Tidak ada santri yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 my-auto max-h-[92vh] flex flex-col">
            <div className="p-4.5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    {editingSantri ? `Edit Data Santri: ${editingSantri.Nama_Lengkap}` : 'Tambah Santri Baru RTQ Cendikia'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {editingSantri ? `Perbarui data biodata & sinkronisasi akun (NIS: ${editingSantri.NIS})` : 'Isi formulir pendaftaran santri baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSantri(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2 text-emerald-900 text-[11px]">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Perubahan data otomatis disinkronkan secara <em>real-time</em> ke Buku Induk, Rapor Santri, Presensi, SPP, dan Akun Wali Santri.
                </span>
              </div>

              {/* Bagian 1: Identitas Pokok */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  Identitas Pokok Santri
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">NIS (Nomor Induk Santri) *</label>
                    <input
                      type="text"
                      value={formData.NIS || ''}
                      onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
                      required
                      placeholder="STR001"
                      className="w-full p-2.5 border rounded-xl font-mono font-bold text-emerald-900 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Santri *</label>
                    <input
                      type="text"
                      value={formData.Nama_Lengkap || ''}
                      onChange={(e) => setFormData({ ...formData, Nama_Lengkap: e.target.value })}
                      required
                      placeholder="Nama lengkap sesuai akta lahir"
                      className="w-full p-2.5 border rounded-xl font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={formData.Nama_Panggilan || ''}
                      onChange={(e) => setFormData({ ...formData, Nama_Panggilan: e.target.value })}
                      placeholder="Panggilan akrab"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.Jenis_Kelamin || 'Laki-laki'}
                      onChange={(e) => setFormData({ ...formData, Jenis_Kelamin: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl font-medium"
                    >
                      <option value="Laki-laki">Laki-laki (Ikhwan)</option>
                      <option value="Perempuan">Perempuan (Akhwat)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status Keaktifan *</label>
                    <select
                      value={formData.Status || 'Aktif'}
                      onChange={(e) => setFormData({ ...formData, Status: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl font-bold text-emerald-800"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.Tempat_Lahir || ''}
                      onChange={(e) => setFormData({ ...formData, Tempat_Lahir: e.target.value })}
                      placeholder="Cilacap"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.Tanggal_Lahir || '2014-01-01'}
                      onChange={(e) => setFormData({ ...formData, Tanggal_Lahir: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Pendidikan & Halaqah */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  Kelas, Pembimbing & Halaqah
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Kelas *</label>
                    <select
                      value={formData.Kelas || 'Kelas 1 SD'}
                      onChange={(e) => setFormData({ ...formData, Kelas: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium"
                    >
                      <option value="Kelas 1 SD">Kelas 1 SD</option>
                      <option value="Kelas 2 SD">Kelas 2 SD</option>
                      <option value="Kelas 3 SD">Kelas 3 SD</option>
                      <option value="Kelas 4 SD">Kelas 4 SD</option>
                      <option value="Kelas 5 SD">Kelas 5 SD</option>
                      <option value="Kelas 6 SD">Kelas 6 SD</option>
                      <option value="Kelas 1 SMP">Kelas 1 SMP</option>
                      <option value="Kelas 2 SMP">Kelas 2 SMP</option>
                      <option value="Kelas 3 SMP">Kelas 3 SMP</option>
                      <option value="Kelas 1 SMA">Kelas 1 SMA</option>
                      <option value="Kelas 2 SMA">Kelas 2 SMA</option>
                      <option value="Kelas 3 SMA">Kelas 3 SMA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ustadz/ah Pembimbing *</label>
                    <select
                      value={formData.Pembimbing || 'Ustadzah Fitriyani'}
                      onChange={(e) => setFormData({ ...formData, Pembimbing: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-semibold text-emerald-900 bg-emerald-50/50"
                    >
                      <option value="Ustadzah Fitriyani">Ustadzah Fitriyani</option>
                      <option value="Ustadzah Dzatun Nafis Al baidh, S.Pd">Ustadzah Dzatun Nafis Al baidh, S.Pd</option>
                      <option value="Ustadzah Sri Siti Khafsoh">Ustadzah Sri Siti Khafsoh</option>
                      <option value="Ust Ahmad Nasyikhudin, S.Pd">Ust Ahmad Nasyikhudin, S.Pd</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Halaqah Binaan *</label>
                    <select
                      value={formData.Halaqah || "Tahfidz Ba'da Ashar"}
                      onChange={(e) => setFormData({ ...formData, Halaqah: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-semibold text-emerald-900"
                    >
                      <option value="Semua Halaqoh">Semua Halaqoh</option>
                      <option value="Tahfidz Ba'da Ashar">Tahfidz Ba'da Ashar</option>
                      <option value="Muroja'ah Ba'da Maghrib">Muroja'ah Ba'da Maghrib</option>
                      <option value="Diniyyah Ba'da Isya'">Diniyyah Ba'da Isya'</option>
                      <option value="Jam Wajib Ba'da Subuh">Jam Wajib Ba'da Subuh</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Asrama / Kamar</label>
                    <input
                      type="text"
                      value={formData.Asrama || ''}
                      onChange={(e) => setFormData({ ...formData, Asrama: e.target.value })}
                      placeholder="Kamar Abu Bakar"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Hafalan</label>
                    <input
                      type="text"
                      value={formData.Target_Juz || ''}
                      onChange={(e) => setFormData({ ...formData, Target_Juz: e.target.value })}
                      placeholder="misal: Juz 30 & 29"
                      className="w-full p-2.5 border rounded-xl font-medium text-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tanggal Masuk</label>
                    <input
                      type="date"
                      value={formData.Tanggal_Masuk || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, Tanggal_Masuk: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Wali Santri & Kontak */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  Data Orang Tua / Wali & Tempat Tinggal
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nama Orang Tua / Wali *</label>
                    <input
                      type="text"
                      value={formData.Nama_Wali || ''}
                      onChange={(e) => setFormData({ ...formData, Nama_Wali: e.target.value })}
                      required
                      placeholder="Nama Bapak/Ibu Wali"
                      className="w-full p-2.5 border rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">No. WhatsApp Wali *</label>
                    <input
                      type="text"
                      value={formData.WA_Wali || ''}
                      onChange={(e) => setFormData({ ...formData, WA_Wali: e.target.value })}
                      required
                      placeholder="081234567890"
                      className="w-full p-2.5 border rounded-xl font-mono text-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Alamat Lengkap Rumah</label>
                  <textarea
                    rows={2}
                    value={formData.Alamat || ''}
                    onChange={(e) => setFormData({ ...formData, Alamat: e.target.value })}
                    placeholder="Jalan, RT/RW, Dusun, Desa, Kecamatan, Kab/Kota"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Foto Santri (URL / Data Image)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.Foto || ''}
                      onChange={(e) => setFormData({ ...formData, Foto: e.target.value })}
                      placeholder="https://... atau data:image/..."
                      className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
                    />
                    {formData.Foto && (
                      <img
                        src={formData.Foto}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSantri(null);
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSantri ? 'Simpan Perubahan Data' : 'Tambah Santri'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Santri */}
      {detailSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Profil Santri</h3>
              <button onClick={() => setDetailSantri(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="text-center pb-3 border-b">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center mx-auto text-xl mb-2">
                  {detailSantri.Nama_Lengkap.charAt(0)}
                </div>
                <h4 className="font-bold text-sm text-gray-900">{detailSantri.Nama_Lengkap}</h4>
                <p className="text-gray-500 font-mono">NIS: {detailSantri.NIS}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Kelas & Halaqah:</span>
                  <span className="font-semibold text-gray-800">{detailSantri.Kelas} / {detailSantri.Halaqah}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Ustadz/ah Pembimbing:</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    📖 {detailSantri.Pembimbing || detailSantri.Ustadz_Pembimbing || 'Ustadzah Fitriyani'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Orang Tua / Wali:</span>
                  <span className="font-semibold text-gray-800">{detailSantri.Nama_Wali}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">No. WhatsApp:</span>
                  <span className="font-semibold text-emerald-700">{detailSantri.WA_Wali}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Alamat:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs">{detailSantri.Alamat || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Target Hafalan:</span>
                  <span className="font-bold text-amber-700">{detailSantri.Target_Juz || 'Juz 30'}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-2 justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={async () => {
                      const s = detailSantri;
                      try {
                        showToast(`Membuat file PDF Rapor ${s.Nama_Lengkap}...`, 'info');
                        const sTahfidz = tahfidzList.filter(t => t.NIS === s.NIS);
                        const sTahsin = tahsinList.filter(t => t.NIS === s.NIS);
                        const sAkhlak = akhlakList.find(a => a.NIS === s.NIS);
                        const sIbadah = ibadahList.find(i => i.NIS === s.NIS);
                        const sAbsensi = absensiList.filter(a => a.NIS === s.NIS);
                        
                        const res = await generateAndDownloadRaporPDF({
                          santri: s,
                          semester: 'Semester Ganjil 2026 / 2027',
                          tahfidzList: sTahfidz,
                          tahsinList: sTahsin,
                          akhlak: sAkhlak,
                          ibadah: sIbadah,
                          absensiList: sAbsensi,
                          logoUrl: appLogo
                        });
                        if (res.success) {
                          showToast(`Rapor PDF ${s.NIS} berhasil diunduh ke HP/perangkat!`, 'success');
                        }
                      } catch (e) {
                        showToast('Gagal mengunduh Rapor PDF.', 'error');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-yellow-300" />
                    <span>Unduh Rapor PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      const s = detailSantri;
                      setDetailSantri(null);
                      setSelectedSantriQR(s);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => {
                      const s = detailSantri;
                      setDetailSantri(null);
                      setSelectedSantriForCard(s);
                    }}
                    className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Kartu</span>
                  </button>
                </div>

                <button
                  onClick={() => setDetailSantri(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat, Download, & Cetak QR Santri */}
      <LihatQRModal 
        santri={selectedSantriQR}
        onClose={() => setSelectedSantriQR(null)}
      />

      {/* Modal Buat & Validasi QR Code Santri Unik */}
      <BuatQRModal 
        isOpen={isBuatQROpen}
        onClose={() => setIsBuatQROpen(false)}
        onSelectSantriForView={(s) => setSelectedSantriQR(s)}
      />

      {/* Modal Cetak & Unduh Semua QR Code Lembar Stiker A4 */}
      <CetakSemuaQRModal 
        isOpen={isBulkQROpen}
        onClose={() => setIsBulkQROpen(false)}
      />

      {/* Bulk Print / PDF Modal Kartu Santri */}
      <CetakSemuaKartuModal 
        isOpen={isBulkPrintOpen} 
        onClose={() => setIsBulkPrintOpen(false)} 
      />

    </div>
  );
};
