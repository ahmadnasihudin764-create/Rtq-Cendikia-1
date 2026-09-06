import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { JadwalKegiatan } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye
} from 'lucide-react';

export const JadwalView: React.FC = () => {
  const { jadwalList, addJadwal, updateJadwal, deleteJadwal, currentUser } = useApp();
  
  // Role checking: Only Admin / Super Admin can Add, Edit, Delete
  const isWali = currentUser?.role === 'Wali Santri';
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  // State for Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State for Delete Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<JadwalKegiatan | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const defaultFormData: Partial<JadwalKegiatan> = {
    Hari: 'Senin s/d Jumat',
    Waktu: '15.30 - 17.30 WIB',
    Nama_Kegiatan: '',
    Pengajar: 'Seluruh Ustadz Halaqah',
    Lokasi: 'Masjid Agung Darussalam',
    Keterangan: ''
  };

  const [formData, setFormData] = useState<Partial<JadwalKegiatan>>(defaultFormData);

  // Open Add Modal
  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingId(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (jadwal: JadwalKegiatan) => {
    if (!isAdmin) return;
    setEditingId(jadwal.id);
    setFormData({
      Hari: jadwal.Hari,
      Waktu: jadwal.Waktu,
      Nama_Kegiatan: jadwal.Nama_Kegiatan,
      Pengajar: jadwal.Pengajar,
      Lokasi: jadwal.Lokasi,
      Keterangan: jadwal.Keterangan
    });
    setIsModalOpen(true);
  };

  // Submit Handler (Add or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.Nama_Kegiatan?.trim()) return;

    if (editingId) {
      // Update existing
      updateJadwal(editingId, {
        Hari: formData.Hari || 'Senin - Jumat',
        Waktu: formData.Waktu || '15.30 WIB',
        Nama_Kegiatan: formData.Nama_Kegiatan.trim(),
        Pengajar: formData.Pengajar || 'Ustadz',
        Lokasi: formData.Lokasi || 'Masjid Agung Darussalam',
        Keterangan: formData.Keterangan || '-'
      });
    } else {
      // Create new
      addJadwal({
        id: 'JDW_' + Date.now(),
        Hari: formData.Hari || 'Senin - Jumat',
        Waktu: formData.Waktu || '15.30 WIB',
        Nama_Kegiatan: formData.Nama_Kegiatan.trim(),
        Pengajar: formData.Pengajar || 'Ustadz',
        Lokasi: formData.Lokasi || 'Masjid Agung Darussalam',
        Keterangan: formData.Keterangan || '-'
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!isAdmin) return;
    if (deleteConfirmItem) {
      deleteJadwal(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  // Filtered Jadwal List
  const filteredJadwal = useMemo(() => {
    if (!searchQuery.trim()) return jadwalList;
    const query = searchQuery.toLowerCase();
    return jadwalList.filter(j => 
      j.Nama_Kegiatan.toLowerCase().includes(query) ||
      j.Hari.toLowerCase().includes(query) ||
      j.Pengajar.toLowerCase().includes(query) ||
      j.Lokasi.toLowerCase().includes(query) ||
      j.Keterangan.toLowerCase().includes(query)
    );
  }, [jadwalList, searchQuery]);

  return (
    <div id="section-jadwal-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 sm:p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 border border-emerald-600/40 rounded-full text-[11px] font-semibold text-emerald-200">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{isWali ? 'Jadwal Resmi dari Pengurus & Ustadz RTQ' : 'Agenda & Waktu Pembelajaran'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Jadwal & Agenda Kegiatan RTQ
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              {isWali 
                ? 'Jadwal resmi pembelajaran halaqah tahfidz, tasmi\' akbar, ujian tajwid, pembinaan adab, dan agenda harian santri yang disinkronkan langsung dari Admin/Pengurus.'
                : 'Kelola jadwal lengkap halaqah tahfidz, tasmi\' akbar, ujian tajwid, pembinaan adab, dan kegiatan santri RTQ Cendikia BAZNAS.'}
            </p>
          </div>

          {/* Right Action: Admin Add Button or Wali View-Only Badge */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isAdmin ? (
              <button
                id="btn-tambah-jadwal"
                onClick={handleOpenAdd}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                <span>Tambah Agenda Baru</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 bg-emerald-800/60 border border-emerald-600/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Mode Lihat Jadwal Resmi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Stats */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kegiatan, ustadz, hari, lokasi..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-gray-600">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200/60">
            Total {jadwalList.length} Agenda Terjadwal
          </span>
          {searchQuery && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 font-semibold rounded-lg border border-amber-200/60">
              Ditemukan: {filteredJadwal.length}
            </span>
          )}
        </div>
      </div>

      {/* Grid of Schedules */}
      {filteredJadwal.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJadwal.map((j) => (
            <div 
              key={j.id} 
              className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Content */}
              <div className="p-5 space-y-3.5">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-full border border-emerald-200/70 shadow-2xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-emerald-700" />
                    <span>{j.Hari}</span>
                  </span>
                  
                  <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono">{j.Waktu}</span>
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4 className="text-base font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    {j.Nama_Kegiatan}
                  </h4>
                </div>

                {/* Details Box */}
                <div className="space-y-2 text-xs text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">Pengajar / PJ</span>
                      <span className="font-semibold text-gray-800 text-xs">{j.Pengajar}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">Lokasi</span>
                      <span className="text-gray-700 text-xs">{j.Lokasi}</span>
                    </div>
                  </div>
                </div>

                {/* Description Note */}
                {j.Keterangan && j.Keterangan !== '-' && (
                  <div className="text-[11px] text-gray-600 italic bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60 flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>"{j.Keterangan}"</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-gray-400">
                  ID: {j.id}
                </span>

                {/* Only Admin gets Edit and Delete buttons */}
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-edit-jadwal-${j.id}`}
                      onClick={() => handleOpenEdit(j)}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-emerald-300/70 hover:border-emerald-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      title="Edit Agenda Kegiatan"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit</span>
                    </button>

                    <button
                      id={`btn-delete-jadwal-${j.id}`}
                      onClick={() => setDeleteConfirmItem(j)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      title="Hapus Agenda Kegiatan"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Jadwal Terverifikasi</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {searchQuery ? 'Tidak Ada Agenda yang Sesuai' : 'Belum Ada Jadwal Kegiatan'}
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `Tidak ditemukan agenda dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : (isWali 
                    ? 'Belum ada agenda kegiatan yang dipublikasikan oleh pengurus RTQ.' 
                    : 'Mulai tambahkan jadwal halaqah atau agenda kegiatan RTQ.')}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Pencarian
            </button>
          ) : (
            isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Agenda Pertama</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Modal Add & Edit Jadwal (Admin only) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {editingId ? 'Edit Agenda Kegiatan RTQ' : 'Tambah Agenda Kegiatan Baru'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {editingId ? 'Perbarui informasi jadwal kegiatan' : 'Lengkapi formulir kegiatan santri'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); }} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Nama_Kegiatan || ''}
                  onChange={(e) => setFormData({ ...formData, Nama_Kegiatan: e.target.value })}
                  required
                  placeholder="misal: Halaqah Reguler Tahfidz & Tahsin / Tasmi' Akbar"
                  className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Hari Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.Hari || ''}
                    onChange={(e) => setFormData({ ...formData, Hari: e.target.value })}
                    required
                    placeholder="misal: Senin s/d Jumat, Sabtu & Ahad"
                    className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Waktu / Jam <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.Waktu || ''}
                    onChange={(e) => setFormData({ ...formData, Waktu: e.target.value })}
                    required
                    placeholder="misal: 15.30 - 17.30 WIB"
                    className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Pengajar / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.Pengajar || ''}
                  onChange={(e) => setFormData({ ...formData, Pengajar: e.target.value })}
                  placeholder="misal: Seluruh Ustadz Halaqah / Ustadz Ahmad Fauzan"
                  className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={formData.Lokasi || ''}
                  onChange={(e) => setFormData({ ...formData, Lokasi: e.target.value })}
                  placeholder="misal: Ruang Utama & Serambi Masjid Agung Darussalam"
                  className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Keterangan & Deskripsi Kegiatan
                </label>
                <textarea
                  value={formData.Keterangan || ''}
                  onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                  placeholder="Catatan tujuan kegiatan, materi setoran, atau informasi perlengkapan santri..."
                  rows={3}
                  className="w-full p-2.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan Jadwal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin only) */}
      {isAdmin && deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">Hapus Agenda Kegiatan?</h3>
              <p className="text-xs text-gray-500">
                Anda yakin ingin menghapus agenda kegiatan berikut:
              </p>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-left mt-2 space-y-1">
                <p className="font-bold text-gray-800 text-xs leading-snug">
                  {deleteConfirmItem.Nama_Kegiatan}
                </p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{deleteConfirmItem.Hari} ({deleteConfirmItem.Waktu})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-jadwal"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
