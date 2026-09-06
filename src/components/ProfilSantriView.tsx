import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Lock,
  Edit3,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  Info,
  Trash2
} from 'lucide-react';

export const ProfilSantriView: React.FC = () => {
  const { getSantriForWali, updateSantriProfileByWali } = useApp();

  const santri = getSantriForWali();

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form edit state (NISN, NIK, and KK removed)
  const [formData, setFormData] = useState({
    Foto: '',
    Nama_Panggilan: '',
    Tempat_Lahir: '',
    Tanggal_Lahir: '',
    Jenis_Kelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    Alamat: '',
    RT_RW: '',
    Desa_Kelurahan: '',
    Kecamatan: '',
    Kabupaten_Kota: '',
    Provinsi: '',
    Kode_Pos: ''
  });

  // Sync form data when santri changes or when entering edit mode
  useEffect(() => {
    if (santri) {
      setFormData({
        Foto: santri.Foto || '',
        Nama_Panggilan: santri.Nama_Panggilan || santri.Nama_Lengkap.split(' ')[0] || '',
        Tempat_Lahir: santri.Tempat_Lahir || 'Cilacap',
        Tanggal_Lahir: santri.Tanggal_Lahir || '',
        Jenis_Kelamin: santri.Jenis_Kelamin || 'Laki-laki',
        Alamat: santri.Alamat || '',
        RT_RW: santri.RT_RW || '',
        Desa_Kelurahan: santri.Desa_Kelurahan || '',
        Kecamatan: santri.Kecamatan || '',
        Kabupaten_Kota: santri.Kabupaten_Kota || 'Kabupaten Cilacap',
        Provinsi: santri.Provinsi || 'Jawa Tengah',
        Kode_Pos: santri.Kode_Pos || ''
      });
    }
  }, [santri, isEditing]);

  if (!santri) {
    return (
      <div id="profil-santri-empty" className="p-8 bg-white rounded-3xl text-center border border-gray-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Data Santri Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500 mt-1">Akun wali santri ini belum terhubung dengan data santri terdaftar di sistem.</p>
      </div>
    );
  }

  // Handle Photo Selection & Validation
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type (JPG, JPEG, PNG)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Format file tidak didukung. Harap unggah foto berekstensi JPG, JPEG, atau PNG.');
      return;
    }

    // Validate size (max 2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError('Ukuran foto terlalu besar. Maksimal ukuran foto adalah 2 MB.');
      return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, Foto: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, Foto: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = () => {
    setPhotoError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setPhotoError(null);
    setIsEditing(false);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleSaveProfile = () => {
    setIsConfirmModalOpen(false);
    const res = updateSantriProfileByWali(santri.NIS, formData);
    if (res.success) {
      setIsEditing(false);
    }
  };

  // Helper date formatter
  const formatTanggalIndo = (tglStr: string) => {
    if (!tglStr) return '-';
    try {
      const parts = tglStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const bulanNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${day} ${bulanNames[month - 1] || month} ${year}`;
      }
      return tglStr;
    } catch {
      return tglStr;
    }
  };

  return (
    <div id="profil-santri-view" className="space-y-6 font-sans">
      
      {/* Header Banner Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Foto Santri in Header */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-300 p-1 shadow-lg shadow-emerald-950/40">
                <div className="w-full h-full rounded-xl bg-emerald-950 flex items-center justify-center text-yellow-300 font-extrabold text-2xl overflow-hidden">
                  {(isEditing ? formData.Foto : santri.Foto) ? (
                    <img
                      src={isEditing ? formData.Foto : santri.Foto}
                      alt={santri.Nama_Lengkap}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{santri.Nama_Lengkap.charAt(0)}</span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-emerald-900 shadow-xs">
                {santri.Status || 'Aktif'}
              </span>
            </div>

            {/* Basic Info */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-emerald-700/60 rounded-md text-[11px] text-emerald-200 border border-emerald-600/60">
                <UserCheck className="w-3.5 h-3.5 text-yellow-300" />
                <span>Profil Resmi Santri Terdaftar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{santri.Nama_Lengkap}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-100/90 pt-0.5">
                <span>Nama Panggilan: <strong>{santri.Nama_Panggilan || santri.Nama_Lengkap.split(' ')[0]}</strong></span>
                <span>&bull;</span>
                <span>NIS: <strong>{santri.NIS}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Button: Edit Profil */}
          {!isEditing && (
            <div className="w-full sm:w-auto flex-shrink-0">
              <button
                id="btn-edit-profil-santri"
                onClick={handleStartEdit}
                className="w-full sm:w-auto px-5 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-emerald-950 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-emerald-950 transition-transform group-hover:scale-110" />
                <span>✏️ Edit Profil</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        /* ================== EDIT MODE FORM ================== */
        <form onSubmit={handleOpenConfirm} className="space-y-6 animate-fade-in">
          
          {/* Notice about Locked Fields */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ketentuan Pengubahan Data Profil Santri</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Wali Santri dapat memperbarui Foto Santri, Nama Panggilan, Tempat & Tanggal Lahir, Jenis Kelamin, dan Alamat Lengkap. Data resmi seperti <strong>Nama Lengkap</strong>, <strong>NIS</strong>, dan <strong>Status</strong> dikunci demi integritas data resmi pesantren.
              </p>
            </div>
          </div>

          {/* 1. DATA IDENTITAS SANTRI (EDIT FORM) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">DATA IDENTITAS SANTRI</h3>
                <p className="text-xs text-gray-500">Informasi biodata diri dan identitas santri</p>
              </div>
            </div>

            {/* Foto Upload & Preview */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Foto Santri (JPG / JPEG / PNG, Maksimal 2 MB)
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Photo Preview Box */}
                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white border-2 border-dashed border-emerald-300 p-1 flex items-center justify-center overflow-hidden relative shadow-xs flex-shrink-0">
                  {formData.Foto ? (
                    <img
                      src={formData.Foto}
                      alt="Preview Foto Santri"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center p-2 text-gray-400 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto text-emerald-400" />
                      <span className="text-[10px] block leading-tight">Belum Ada Foto</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-xs">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="upload-foto-santri-input"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.Foto ? 'Ganti Foto' : 'Pilih Foto Baru'}</span>
                    </button>
                    {formData.Foto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Gunakan foto formal/rapi berlatar polos untuk kartu tanda santri resmi.
                  </p>
                  {photoError && (
                    <p className="text-xs font-bold text-rose-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{photoError}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Nama Lengkap (Terkunci) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Nama Lengkap Santri</label>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[10px] border border-gray-200">
                    <Lock className="w-2.5 h-2.5" />
                    <span>🔒 Tidak dapat diubah</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={santri.Nama_Lengkap}
                  disabled
                  className="w-full p-3 bg-gray-100/90 border border-gray-300 rounded-xl text-gray-600 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Nama Panggilan (Boleh Diedit) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.Nama_Panggilan}
                  onChange={(e) => setFormData(prev => ({ ...prev, Nama_Panggilan: e.target.value }))}
                  placeholder="Contoh: Hizam"
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              {/* NIS (Terkunci) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Nomor Induk Santri (NIS)</label>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[10px] border border-gray-200">
                    <Lock className="w-2.5 h-2.5" />
                    <span>🔒 Tidak dapat diubah</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={santri.NIS}
                  disabled
                  className="w-full p-3 bg-gray-100/90 border border-gray-300 rounded-xl text-gray-600 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Status Santri (Terkunci) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Status Santri</label>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[10px] border border-gray-200">
                    <Lock className="w-2.5 h-2.5" />
                    <span>🔒 Tidak dapat diubah</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={santri.Status || 'Aktif'}
                  disabled
                  className="w-full p-3 bg-gray-100/90 border border-gray-300 rounded-xl text-gray-600 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Tempat Lahir (Boleh Diedit) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.Tempat_Lahir}
                  onChange={(e) => setFormData(prev => ({ ...prev, Tempat_Lahir: e.target.value }))}
                  placeholder="Kota/Kabupaten Tempat Lahir"
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              {/* Tanggal Lahir (Boleh Diedit) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.Tanggal_Lahir}
                  onChange={(e) => setFormData(prev => ({ ...prev, Tanggal_Lahir: e.target.value }))}
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              {/* Jenis Kelamin (Boleh Diedit) */}
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  value={formData.Jenis_Kelamin}
                  onChange={(e) => setFormData(prev => ({ ...prev, Jenis_Kelamin: e.target.value as 'Laki-laki' | 'Perempuan' }))}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Locked Data Disclaimer Note */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start space-x-3 text-emerald-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                «Data resmi seperti NIS dan Status tidak dapat diubah oleh Wali Santri. Silakan hubungi Admin Pesantren untuk perubahan data resmi.»
              </p>
            </div>
          </div>

          {/* 2. ALAMAT SANTRI (EDIT FORM) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">ALAMAT SANTRI</h3>
                <p className="text-xs text-gray-500">Alamat domisili tempat tinggal santri dan keluarga saat ini</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Alamat Lengkap */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Alamat Lengkap (Jalan / Gang / Nomor Rumah / Kompleks)
                </label>
                <textarea
                  value={formData.Alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, Alamat: e.target.value }))}
                  placeholder="Contoh: Jl. Pemuda No. 12, Darussalam"
                  rows={2}
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* RT/RW */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">RT / RW</label>
                  <input
                    type="text"
                    value={formData.RT_RW}
                    onChange={(e) => setFormData(prev => ({ ...prev, RT_RW: e.target.value }))}
                    placeholder="Contoh: 03 / 02"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>

                {/* Desa/Kelurahan */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={formData.Desa_Kelurahan}
                    onChange={(e) => setFormData(prev => ({ ...prev, Desa_Kelurahan: e.target.value }))}
                    placeholder="Contoh: Sidanegara"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>

                {/* Kecamatan */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.Kecamatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kecamatan: e.target.value }))}
                    placeholder="Contoh: Cilacap Tengah"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>

                {/* Kabupaten/Kota */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={formData.Kabupaten_Kota}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kabupaten_Kota: e.target.value }))}
                    placeholder="Contoh: Kabupaten Cilacap"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>

                {/* Provinsi */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.Provinsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, Provinsi: e.target.value }))}
                    placeholder="Contoh: Jawa Tengah"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.Kode_Pos}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kode_Pos: e.target.value }))}
                    placeholder="Contoh: 53223"
                    maxLength={5}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: [Batal] [Simpan Perubahan] */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              id="btn-batal-edit"
              type="button"
              onClick={handleCancelEdit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" />
              <span>Batal</span>
            </button>
            <button
              id="btn-simpan-perubahan"
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================== VIEW / DISPLAY MODE ================== */
        <div className="space-y-6 animate-fade-in">
          
          {/* 1. DATA IDENTITAS SANTRI (DISPLAY) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">DATA IDENTITAS SANTRI</h3>
                  <p className="text-xs text-gray-500">Biodata diri dan status ananda santri</p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                Status: {santri.Status || 'Aktif'}
              </span>
            </div>

            {/* Profile Overview Banner with Photo */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white border-2 border-emerald-300 p-1 shadow-sm flex-shrink-0 overflow-hidden">
                {santri.Foto ? (
                  <img
                    src={santri.Foto}
                    alt={santri.Nama_Lengkap}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-emerald-800 text-yellow-300 flex items-center justify-center font-extrabold text-3xl">
                    {santri.Nama_Lengkap.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <h4 className="text-lg font-bold text-emerald-950">{santri.Nama_Lengkap}</h4>
                <p className="text-xs text-gray-600">
                  Nama Panggilan: <strong className="text-emerald-900">{santri.Nama_Panggilan || santri.Nama_Lengkap.split(' ')[0]}</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-2.5 py-0.5 bg-white border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold">
                    NIS: {santri.NIS}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded-lg text-[11px] font-semibold">
                    📖 Pembimbing: {santri.Pembimbing || santri.Ustadz_Pembimbing || 'Ustadzah Fitriyani'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-white border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold">
                    {santri.Jenis_Kelamin}
                  </span>
                </div>
              </div>
            </div>

            {/* Display Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nama Lengkap */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Nama Lengkap</span>
                  <span className="text-[10px] text-gray-400 font-normal">🔒 Terkunci</span>
                </div>
                <p className="text-xs font-bold text-gray-900">{santri.Nama_Lengkap}</p>
              </div>

              {/* Nama Panggilan */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Nama Panggilan</span>
                <p className="text-xs font-bold text-gray-900">{santri.Nama_Panggilan || santri.Nama_Lengkap.split(' ')[0]}</p>
              </div>

              {/* NIS */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>NIS (Nomor Induk Santri)</span>
                  <span className="text-[10px] text-gray-400 font-normal">🔒 Terkunci</span>
                </div>
                <p className="text-xs font-bold text-emerald-800">{santri.NIS}</p>
              </div>

              {/* Tempat Lahir */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Tempat Lahir</span>
                <p className="text-xs font-bold text-gray-900">{santri.Tempat_Lahir || 'Cilacap'}</p>
              </div>

              {/* Tanggal Lahir */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Tanggal Lahir</span>
                <p className="text-xs font-bold text-gray-900">{formatTanggalIndo(santri.Tanggal_Lahir)}</p>
              </div>

              {/* Jenis Kelamin */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Jenis Kelamin</span>
                <p className="text-xs font-bold text-gray-900">{santri.Jenis_Kelamin}</p>
              </div>

              {/* Status Santri */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase">
                  <span>Status Santri</span>
                  <span className="text-[10px] text-gray-400 font-normal">🔒 Terkunci</span>
                </div>
                <p className="text-xs font-bold text-emerald-700">{santri.Status || 'Aktif'}</p>
              </div>
            </div>

            {/* Information box on locked fields */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start space-x-3 text-emerald-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                «Data resmi seperti NIS dan Status tidak dapat diubah oleh Wali Santri. Silakan hubungi Admin Pesantren untuk perubahan data resmi.»
              </p>
            </div>
          </div>

          {/* 2. PENDIDIKAN, HALAQAH & PEMBIMBING */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">PENDIDIKAN, KELAS & PEMBIMBING</h3>
                  <p className="text-xs text-gray-500">Informasi kelas, kelompok halaqah, target juz, dan ustadz/ustadzah pembimbing</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ustadz/ah Pembimbing */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Ustadz/ah Pembimbing</span>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{santri.Pembimbing || santri.Ustadz_Pembimbing || 'Ustadzah Fitriyani'}</span>
                </p>
              </div>

              {/* Kelas */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Kelas</span>
                <p className="text-xs font-bold text-gray-900">{santri.Kelas}</p>
              </div>

              {/* Halaqah Binaan */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Halaqah Binaan</span>
                <p className="text-xs font-bold text-gray-900">{santri.Halaqah}</p>
              </div>

              {/* Target Hafalan */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Target Hafalan</span>
                <p className="text-xs font-bold text-amber-900">{santri.Target_Juz || 'Juz 30'}</p>
              </div>

              {/* Asrama / Kamar */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Asrama / Kamar</span>
                <p className="text-xs font-bold text-gray-900">{santri.Asrama || 'Kamar Santri'}</p>
              </div>

              {/* Tanggal Masuk */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Tanggal Masuk Santri</span>
                <p className="text-xs font-bold text-gray-900">{formatTanggalIndo(santri.Tanggal_Masuk)}</p>
              </div>
            </div>
          </div>

          {/* 3. ALAMAT SANTRI (DISPLAY) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">ALAMAT SANTRI</h3>
                  <p className="text-xs text-gray-500">Rincian alamat domisili tempat tinggal santri</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Alamat Lengkap */}
              <div className="sm:col-span-2 lg:col-span-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Alamat Lengkap</span>
                <p className="text-xs font-bold text-gray-900 leading-relaxed">{santri.Alamat || '-'}</p>
              </div>

              {/* RT / RW */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">RT / RW</span>
                <p className="text-xs font-bold text-gray-900">{santri.RT_RW || '-'}</p>
              </div>

              {/* Desa / Kelurahan */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Desa / Kelurahan</span>
                <p className="text-xs font-bold text-gray-900">{santri.Desa_Kelurahan || '-'}</p>
              </div>

              {/* Kecamatan */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Kecamatan</span>
                <p className="text-xs font-bold text-gray-900">{santri.Kecamatan || '-'}</p>
              </div>

              {/* Kabupaten / Kota */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Kabupaten / Kota</span>
                <p className="text-xs font-bold text-gray-900">{santri.Kabupaten_Kota || 'Kabupaten Cilacap'}</p>
              </div>

              {/* Provinsi */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Provinsi</span>
                <p className="text-xs font-bold text-gray-900">{santri.Provinsi || 'Jawa Tengah'}</p>
              </div>

              {/* Kode Pos */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Kode Pos</span>
                <p className="text-xs font-bold text-gray-900 font-mono">{santri.Kode_Pos || '-'}</p>
              </div>
            </div>
          </div>

          {/* Bottom Edit Trigger Button */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Terakhir disinkronkan dengan data database resmi RTQ Cendikia BAZNAS.
            </div>
            <button
              onClick={handleStartEdit}
              className="w-full sm:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>✏️ Edit Profil Santri</span>
            </button>
          </div>
        </div>
      )}

      {/* ================== MODAL KONFIRMASI SIMPAN ================== */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-emerald-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-bold text-base text-gray-900">Konfirmasi Penyimpanan</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                «Apakah Anda yakin ingin menyimpan perubahan data profil santri?»
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Ya, Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
