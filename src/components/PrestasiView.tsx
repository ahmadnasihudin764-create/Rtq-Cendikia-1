import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PrestasiRecord } from '../types';
import { Plus, Trophy, Award, Printer, Trash2, Sparkles } from 'lucide-react';

export const PrestasiView: React.FC = () => {
  const { santriList, prestasiList, addPrestasi, deletePrestasi, setSelectedPrestasiForCert } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<PrestasiRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Judul_Prestasi: '',
    Kategori: 'Tahfidz',
    Tingkat: 'Internal RTQ',
    Peringkat: 'Juara 1',
    Keterangan: 'Peringkat Terbaik Ujian Tasmi\'',
    Sertifikat_ID: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Judul_Prestasi: 'Wisuda Tahfidz Juz 30 (Juz \'Amma)',
      Kategori: 'Tahfidz',
      Tingkat: 'Internal RTQ',
      Peringkat: 'Mumtaz Syaraf',
      Keterangan: 'Lulus tasmi\' sekali duduk tanpa salah',
      Sertifikat_ID: `SRT/RTQ/${new Date().getFullYear()}/${String(prestasiList.length + 1).padStart(3, '0')}`
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS || !formData.Judul_Prestasi) return;

    addPrestasi({
      id: 'PRS_' + Date.now(),
      Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
      NIS: formData.NIS,
      Judul_Prestasi: formData.Judul_Prestasi,
      Kategori: formData.Kategori as any || 'Tahfidz',
      Tingkat: formData.Tingkat as any || 'Internal RTQ',
      Peringkat: formData.Peringkat || 'Terbaik',
      Keterangan: formData.Keterangan || '-',
      Sertifikat_ID: formData.Sertifikat_ID || `SRT/RTQ/${Date.now()}`
    });
    setIsModalOpen(false);
  };

  return (
    <div id="section-prestasi-view" className="space-y-4 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Prestasi & E-Sertifikat Santri</h3>
          <p className="text-xs text-gray-500">Pencatatan rekor prestasi, wisuda tahfidz, dan cetak sertifikat resmi BAZNAS</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Prestasi / Sertifikat</span>
        </button>
      </div>

      {prestasiList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prestasiList.map(p => {
            const santri = santriList.find(s => s.NIS === p.NIS);

            return (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-amber-400 transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      {p.Peringkat}
                    </span>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{p.Judul_Prestasi}</h4>
                    <p className="text-xs font-bold text-emerald-800 mt-1">{santri?.Nama_Lengkap || p.NIS}</p>
                    <p className="text-[10px] text-gray-400 font-mono">NIS: {p.NIS} &bull; {p.Tanggal}</p>
                  </div>

                  <div className="my-2 p-2.5 bg-gray-50 rounded-xl text-xs space-y-0.5 border">
                    <p className="text-[11px] text-gray-600 font-medium">Kategori: <span className="font-bold text-gray-800">{p.Kategori}</span></p>
                    <p className="text-[11px] text-gray-600 font-medium">Tingkat: <span className="font-bold text-gray-800">{p.Tingkat}</span></p>
                    <p className="text-[10px] text-gray-500 italic mt-1">{p.Keterangan}</p>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPrestasiForCert(p)}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat / Cetak Sertifikat</span>
                  </button>

                  <button
                    onClick={() => deletePrestasi(p.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Belum Ada Data Prestasi / E-Sertifikat</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Saat ini belum ada rekor prestasi atau wisuda tahfidz santri yang tercatat. Silakan klik tombol di bawah untuk menambah data baru.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Prestasi / Sertifikat Pertama</span>
          </button>
        </div>
      )}

      {/* Modal Add Prestasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Catat Prestasi / Wisuda Tahfidz</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Santri</label>
                <select
                  value={formData.NIS}
                  onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
                  required
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => (
                    <option key={s.NIS} value={s.NIS}>{s.NIS} - {s.Nama_Lengkap}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Prestasi / Capaian Wisuda</label>
                <input
                  type="text"
                  value={formData.Judul_Prestasi}
                  onChange={(e) => setFormData({ ...formData, Judul_Prestasi: e.target.value })}
                  required
                  placeholder="misal: Juara 1 MHQ 1 Juz / Wisuda Khatam Juz 30"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.Kategori}
                    onChange={(e) => setFormData({ ...formData, Kategori: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Tahfidz">Tahfidz (Hafalan)</option>
                    <option value="Tahsin">Tahsin (Tartil & Tajwid)</option>
                    <option value="Adab">Adab & Santri Teladan</option>
                    <option value="Lomba MHQ">Lomba MHQ / Musabaqah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tingkat</label>
                  <select
                    value={formData.Tingkat}
                    onChange={(e) => setFormData({ ...formData, Tingkat: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Internal RTQ">Internal RTQ</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kota/Kab">Kota / Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Peringkat / Predikat</label>
                  <input
                    type="text"
                    value={formData.Peringkat}
                    onChange={(e) => setFormData({ ...formData, Peringkat: e.target.value })}
                    placeholder="misal: Juara 1 / Mumtaz Syaraf"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Raihan</label>
                  <input
                    type="date"
                    value={formData.Tanggal}
                    onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Keterangan / Event Penyelenggara</label>
                <textarea
                  value={formData.Keterangan}
                  onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                  placeholder="Keterangan acara festival atau ujian tasmi'..."
                  rows={2}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Simpan & Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
