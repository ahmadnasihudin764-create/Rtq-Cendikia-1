import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Pengajar } from '../types';
import { Plus, Users, Phone, Clock, BookOpen, Edit, Trash2, Camera, Upload, X, QrCode } from 'lucide-react';
import { CetakSemuaQRPengajarModal } from './modals/CetakSemuaQRPengajarModal';

export const PengajarView: React.FC = () => {
  const { pengajarList, addPengajar, updatePengajar, deletePengajar, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPengajar, setEditingPengajar] = useState<Pengajar | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedPengajarForQR, setSelectedPengajarForQR] = useState<Pengajar | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [activePengajarForCardUpload, setActivePengajarForCardUpload] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Pengajar>>({
    ID_Pengajar: '',
    Nama_Pengajar: '',
    Gelar: 'Al-Hafidz',
    Mata_Pelajaran: 'Tahfidz Al-Qur\'an & Tajwid',
    Nomor_HP: '08123456789',
    Jadwal_Mengajar: 'Senin - Jumat (15.30 - 17.30 WIB)',
    Halaqah_Binaan: "Semua Halaqoh",
    Status: 'Aktif',
    Foto: ''
  });

  const processImageFile = (file: File, callback: (base64: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('File harus berupa gambar (JPG, PNG, WebP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 600;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(dataUrl);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCardPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePengajarForCardUpload) {
      processImageFile(file, (base64) => {
        updatePengajar(activePengajarForCardUpload, { Foto: base64 });
        showToast?.('Foto pengajar berhasil diperbarui', 'success');
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleModalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (base64) => {
        setFormData(prev => ({ ...prev, Foto: base64 }));
        showToast?.('Foto berhasil dimuat', 'success');
      });
    }
    if (e.target) e.target.value = '';
  };

  const triggerCardUpload = (id: string) => {
    setActivePengajarForCardUpload(id);
    cardFileInputRef.current?.click();
  };

  const handleOpenAdd = () => {
    setEditingPengajar(null);
    setFormData({
      ID_Pengajar: 'P' + String(pengajarList.length + 1).padStart(3, '0'),
      Nama_Pengajar: '',
      Gelar: 'Al-Hafidz',
      Mata_Pelajaran: 'Tahfidz Al-Qur\'an & Tajwid',
      Nomor_HP: '',
      Jadwal_Mengajar: 'Senin - Jumat (15.30 - 17.30 WIB)',
      Halaqah_Binaan: "Semua Halaqoh",
      Status: 'Aktif',
      Foto: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Pengajar) => {
    setEditingPengajar(p);
    setFormData({ ...p, Foto: p.Foto || '' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nama_Pengajar) return;

    if (editingPengajar) {
      updatePengajar(editingPengajar.ID_Pengajar, formData as Pengajar);
      showToast?.('Data pengajar berhasil disimpan', 'success');
    } else {
      addPengajar(formData as Pengajar);
      showToast?.('Pengajar baru berhasil ditambahkan', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div id="section-pengajar-view" className="space-y-4 animate-in fade-in duration-200">
      {/* Hidden file input for card photo quick upload */}
      <input
        type="file"
        ref={cardFileInputRef}
        onChange={handleCardPhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Data Pengajar & Asatidz RTQ</h3>
          <p className="text-xs text-gray-500">Daftar ustadz dan ustadzah pembimbing tahfidz bersanad</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPengajarForQR(null);
              setIsQRModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>QR Code Semua Pengajar</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengajar Baru</span>
          </button>
        </div>
      </div>

      {/* Pengajar Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pengajarList.map((p) => (
          <div key={p.ID_Pengajar} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                {/* Interactive Avatar / Photo Box */}
                <div className="relative group shrink-0">
                  <div
                    onClick={() => triggerCardUpload(p.ID_Pengajar)}
                    title="Klik untuk mengunggah / ganti foto pengajar"
                    className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg border-2 border-emerald-200 overflow-hidden cursor-pointer hover:border-emerald-500 transition shadow-2xs"
                  >
                    {p.Foto ? (
                      <img
                        src={p.Foto}
                        alt={p.Nama_Pengajar}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">{p.Nama_Pengajar.charAt(0) || 'U'}</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl text-white">
                      <Camera className="w-5 h-5 drop-shadow" />
                    </div>
                  </div>
                  {/* Camera Badge Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerCardUpload(p.ID_Pengajar);
                    }}
                    title="Upload / Edit Foto"
                    className="absolute -bottom-1 -right-1 p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-xs border-2 border-white transition cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">{p.Nama_Pengajar}</h4>
                  <p className="text-xs text-amber-700 font-semibold truncate">{p.Gelar || 'Pembimbing Tahfidz'}</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                {p.Status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="font-medium text-gray-800 truncate">{p.Mata_Pelajaran}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                <span className="font-semibold text-emerald-900 truncate">{p.Halaqah_Binaan}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{p.Jadwal_Mengajar}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <a 
                  href={`https://wa.me/${p.Nomor_HP?.replace(/^0/, '62')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-medium text-emerald-700 hover:underline truncate"
                >
                  {p.Nomor_HP}
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedPengajarForQR(p);
                  setIsQRModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => handleOpenEdit(p)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus pengajar ${p.Nama_Pengajar}?`)) {
                    deletePengajar(p.ID_Pengajar);
                  }
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold">{editingPengajar ? 'Edit Data Pengajar' : 'Tambah Pengajar Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Photo Upload Box Section */}
              <div className="flex flex-col items-center justify-center p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  title="Klik untuk memilih foto"
                  className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-white overflow-hidden flex flex-col items-center justify-center cursor-pointer group shadow-2xs transition"
                >
                  {formData.Foto ? (
                    <>
                      <img
                        src={formData.Foto}
                        alt="Preview Foto"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1">
                        <Camera className="w-5 h-5" />
                        <span>Ganti Foto</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-emerald-700 gap-1.5 p-2 text-center">
                      <Camera className="w-6 h-6 text-emerald-600" />
                      <span className="text-[10px] font-bold">Upload Foto</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-lg transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{formData.Foto ? 'Ganti File Foto' : 'Pilih File Foto'}</span>
                  </button>

                  {formData.Foto && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, Foto: '' }))}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-semibold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={formData.Nama_Pengajar}
                  onChange={(e) => setFormData({ ...formData, Nama_Pengajar: e.target.value })}
                  required
                  placeholder="contoh: Ustadz Ahmad Nasyikhudin, S.Pd"
                  className="w-full p-2.5 border rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Keahlian / Sanad</label>
                <input
                  type="text"
                  value={formData.Gelar}
                  onChange={(e) => setFormData({ ...formData, Gelar: e.target.value })}
                  placeholder="contoh: Al-Hafidz 30 Juz / Sanad Jazariyah"
                  className="w-full p-2.5 border rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mata Pelajaran / Bidang</label>
                <input
                  type="text"
                  value={formData.Mata_Pelajaran}
                  onChange={(e) => setFormData({ ...formData, Mata_Pelajaran: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Halaqah Binaan</label>
                <select
                  value={formData.Halaqah_Binaan || "Semua Halaqoh"}
                  onChange={(e) => setFormData({ ...formData, Halaqah_Binaan: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-semibold text-emerald-900"
                >
                  <option value="Semua Halaqoh">Semua Halaqoh</option>
                  <option value="Tahfidz Ba'da Ashar">Tahfidz Ba'da Ashar</option>
                  <option value="Muroja'ah Ba'da Maghrib">Muroja'ah Ba'da Maghrib</option>
                  <option value="Diniyyah Ba'da Isya'">Diniyyah Ba'da Isya'</option>
                  <option value="Jam Wajib Ba'da Subuh">Jam Wajib Ba'da Subuh</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={formData.Nomor_HP}
                  onChange={(e) => setFormData({ ...formData, Nomor_HP: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full p-2.5 border rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Jadwal Mengajar</label>
                <input
                  type="text"
                  value={formData.Jadwal_Mengajar}
                  onChange={(e) => setFormData({ ...formData, Jadwal_Mengajar: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Keaktifan</label>
                <select
                  value={formData.Status || 'Aktif'}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value as any })}
                  className="w-full p-2.5 border rounded-xl font-semibold text-emerald-900"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Pengajar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code Pengajar */}
      <CetakSemuaQRPengajarModal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          setSelectedPengajarForQR(null);
        }}
        selectedPengajar={selectedPengajarForQR}
      />
    </div>
  );
};
