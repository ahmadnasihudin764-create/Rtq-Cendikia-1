import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PelanggaranRecord } from '../types';
import { Plus, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

export const PelanggaranView: React.FC = () => {
  const { santriList, pelanggaranList, addPelanggaran, updatePelanggaran, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<PelanggaranRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Jenis_Pelanggaran: '',
    Poin_Minus: 5,
    Tindakan_Pembinaan: 'Diberikan nasihat dan pembinaan adab',
    Ustadz_Pendamping: currentUser?.nama || 'Ustadz Pembina',
    Status: 'Selesai Dibina'
  });

  const handleOpenAdd = () => {
    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Jenis_Pelanggaran: 'Terlambat halaqah tanpa izin',
      Poin_Minus: 5,
      Tindakan_Pembinaan: 'Diberikan nasihat & membaca istighfar',
      Ustadz_Pendamping: currentUser?.nama || 'Ustadz Pembina',
      Status: 'Selesai Dibina'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS || !formData.Jenis_Pelanggaran) return;

    addPelanggaran({
      id: 'PLG_' + Date.now(),
      Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
      NIS: formData.NIS,
      Jenis_Pelanggaran: formData.Jenis_Pelanggaran,
      Poin_Minus: Number(formData.Poin_Minus) || 5,
      Tindakan_Pembinaan: formData.Tindakan_Pembinaan || 'Nasihat ustadz',
      Ustadz_Pendamping: formData.Ustadz_Pendamping || 'Ustadz Pembina',
      Status: formData.Status as any || 'Selesai Dibina'
    });
    setIsModalOpen(false);
  };

  return (
    <div id="section-pelanggaran-view" className="space-y-4 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Kedisiplinan & Pembinaan Santri</h3>
          <p className="text-xs text-gray-500">Pencatatan pelanggaran tata tertib dan bimbingan konseling ustadz</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Bimbingan / Pelanggaran</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">NIS & Nama Santri</th>
                <th className="p-3.5">Jenis Pelanggaran</th>
                <th className="p-3.5">Poin Disiplin</th>
                <th className="p-3.5">Tindakan Pembinaan Ustadz</th>
                <th className="p-3.5">Status Pembinaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pelanggaranList.map(p => {
                const santri = santriList.find(s => s.NIS === p.NIS);

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5 text-gray-700 font-medium">{p.Tanggal}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || p.NIS}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">{p.NIS}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">{p.Jenis_Pelanggaran}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                        -{p.Poin_Minus} Poin
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600">
                      <span>{p.Tindakan_Pembinaan}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Pendamping: {p.Ustadz_Pendamping}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {p.Status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pelanggaranList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Alhamdulillah, tidak ada catatan pelanggaran santri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Catat Pembinaan Santri</h3>
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
                <label className="block font-bold text-gray-700 mb-1">Bentuk Pelanggaran / Catatan Disiplin</label>
                <input
                  type="text"
                  value={formData.Jenis_Pelanggaran}
                  onChange={(e) => setFormData({ ...formData, Jenis_Pelanggaran: e.target.value })}
                  required
                  placeholder="misal: Terlambat, Mengobrol saat tilawah..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Poin Kedisiplinan</label>
                  <input
                    type="number"
                    value={formData.Poin_Minus}
                    onChange={(e) => setFormData({ ...formData, Poin_Minus: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.Tanggal}
                    onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Bentuk Pembinaan / Tindak Lanjut</label>
                <textarea
                  value={formData.Tindakan_Pembinaan}
                  onChange={(e) => setFormData({ ...formData, Tindakan_Pembinaan: e.target.value })}
                  placeholder="Nasihat, hafalan tambahan, dll..."
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
