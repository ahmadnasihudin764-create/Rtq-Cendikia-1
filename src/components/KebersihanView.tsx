import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KebersihanKesehatanRecord } from '../types';
import { Plus, Sparkles, HeartPulse, HeartHandshake, ShieldCheck, Check, Trash2 } from 'lucide-react';

export const KebersihanView: React.FC = () => {
  const { santriList, kebersihanList, addKebersihan, deleteKebersihan } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<KebersihanKesehatanRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Status_Kebersihan: 'Sangat Baik',
    Kondisi_Kesehatan: 'Sehat',
    Pemeriksaan_Fisik: { kuku: true, seragam: true, peciJilbab: true },
    Keluhan_Sakit: '-',
    Tindakan_Obat: '-',
    Catatan: 'Santri bersih, rapi, dan siap halaqah.'
  });

  const handleOpenAdd = () => {
    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Status_Kebersihan: 'Sangat Baik',
      Kondisi_Kesehatan: 'Sehat',
      Pemeriksaan_Fisik: { kuku: true, seragam: true, peciJilbab: true },
      Keluhan_Sakit: '-',
      Tindakan_Obat: '-',
      Catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    addKebersihan({
      ID_Periksa: 'KBS-' + Date.now(),
      Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
      NIS: formData.NIS,
      Status_Kebersihan: formData.Status_Kebersihan as any || 'Sangat Baik',
      Kondisi_Kesehatan: formData.Kondisi_Kesehatan as any || 'Sehat',
      Pemeriksaan_Fisik: formData.Pemeriksaan_Fisik || { kuku: true, seragam: true, peciJilbab: true },
      Keluhan_Sakit: formData.Keluhan_Sakit || '-',
      Tindakan_Obat: formData.Tindakan_Obat || '-',
      Catatan: formData.Catatan || 'Pemeriksaan rutin halaqah'
    });
    setIsModalOpen(false);
  };

  const countSangatBaik = kebersihanList.filter(k => k.Status_Kebersihan === 'Sangat Baik').length;
  const countSehat = kebersihanList.filter(k => k.Kondisi_Kesehatan === 'Sehat').length;
  const countSakit = kebersihanList.filter(k => k.Kondisi_Kesehatan === 'Sakit' || k.Kondisi_Kesehatan === 'Kurang Fit').length;

  return (
    <div id="section-kebersihan-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Catatan Kebersihan & Kesehatan Santri</h3>
          <p className="text-xs text-gray-500">Pemeriksaan sunnah kebersihan diri, kuku, seragam, dan layanan UKS RTQ Cendikia</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Input Pemeriksaan Kebersihan / UKS</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Kebersihan Sangat Baik</p>
            <h4 className="text-xl font-bold text-emerald-800 mt-1">{countSangatBaik} Santri</h4>
            <p className="text-[10px] text-emerald-600 mt-0.5">Kuku & pakaian rapi</p>
          </div>
          <div className="w-11 h-11 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center text-lg">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Santri Sehat & Bugar</p>
            <h4 className="text-xl font-bold text-teal-800 mt-1">{countSehat} Santri</h4>
            <p className="text-[10px] text-teal-600 mt-0.5">Siap halaqah optimal</p>
          </div>
          <div className="w-11 h-11 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center text-lg">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Keluhan / Perlu Obat UKS</p>
            <h4 className="text-xl font-bold text-amber-700 mt-1">{countSakit} Santri</h4>
            <p className="text-[10px] text-amber-600 mt-0.5">Dalam penanganan ustadz</p>
          </div>
          <div className="w-11 h-11 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center text-lg">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">NIS & Nama Santri</th>
                <th className="p-3.5">Status Kebersihan</th>
                <th className="p-3.5">Kondisi Kesehatan</th>
                <th className="p-3.5">Keluhan & Penanganan UKS</th>
                <th className="p-3.5">Catatan Pembimbing</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kebersihanList.map(k => {
                const santri = santriList.find(s => s.NIS === k.NIS);

                const badgeKebersihan = k.Status_Kebersihan === 'Sangat Baik' 
                  ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' 
                  : (k.Status_Kebersihan === 'Baik' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800');

                const badgeKesehatan = k.Kondisi_Kesehatan === 'Sehat'
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'bg-rose-100 text-rose-800 font-bold';

                return (
                  <tr key={k.ID_Periksa} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5 text-gray-700 font-medium">{k.Tanggal}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-gray-900 block">{santri?.Nama_Lengkap || k.NIS}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">{k.NIS}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] rounded-full ${badgeKebersihan}`}>
                        {k.Status_Kebersihan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] rounded-full ${badgeKesehatan}`}>
                        {k.Kondisi_Kesehatan}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-gray-800 block">
                        {k.Keluhan_Sakit !== '-' ? k.Keluhan_Sakit : 'Tidak Ada Keluhan'}
                      </span>
                      {k.Tindakan_Obat !== '-' && (
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                          {k.Tindakan_Obat}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-gray-600 max-w-xs">{k.Catatan || '-'}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => deleteKebersihan(k.ID_Periksa)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Kebersihan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Pemeriksaan Kebersihan & Kesehatan</h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Kebersihan</label>
                  <select
                    value={formData.Status_Kebersihan}
                    onChange={(e) => setFormData({ ...formData, Status_Kebersihan: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kondisi Kesehatan</label>
                  <select
                    value={formData.Kondisi_Kesehatan}
                    onChange={(e) => setFormData({ ...formData, Kondisi_Kesehatan: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Sehat">Sehat & Bugar</option>
                    <option value="Kurang Fit">Kurang Fit / Flu Ringan</option>
                    <option value="Sakit">Sakit (Istirahat UKS)</option>
                    <option value="Izin Berobat">Izin Berobat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Keluhan Sakit (Bila Ada)</label>
                <input
                  type="text"
                  value={formData.Keluhan_Sakit}
                  onChange={(e) => setFormData({ ...formData, Keluhan_Sakit: e.target.value })}
                  placeholder="misal: Pusing, Demam, Batuk (atau '-')"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tindakan / Obat UKS RTQ</label>
                <input
                  type="text"
                  value={formData.Tindakan_Obat}
                  onChange={(e) => setFormData({ ...formData, Tindakan_Obat: e.target.value })}
                  placeholder="misal: Diberikan madu habbatussauda / istirahat"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Pembimbing</label>
                <textarea
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Catatan kerapian kuku, seragam, atau anjuran ustadz..."
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
