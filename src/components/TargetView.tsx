import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TargetSantri } from '../types';
import { Plus, Target, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const TargetView: React.FC = () => {
  const { santriList, targetList, addTarget, updateTarget } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<TargetSantri>>({
    NIS: '',
    Target_Nama: 'Khatam Tahfidz Juz 30',
    Target_Ayat_Halaman: '37 Surah (An-Naba s/d An-Nas)',
    Deadline: '2026-12-31',
    Capaian_Persen: 50,
    Status: 'Sedang Berjalan',
    Keterangan: 'Target semester ganjil'
  });

  const handleOpenAdd = () => {
    setFormData({
      NIS: santriList[0]?.NIS || '',
      Target_Nama: 'Khatam Tahfidz Juz 30',
      Target_Ayat_Halaman: '37 Surah',
      Deadline: '2026-12-31',
      Capaian_Persen: 50,
      Status: 'Sedang Berjalan',
      Keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    addTarget({
      id: 'TGT_' + Date.now(),
      NIS: formData.NIS,
      Target_Nama: formData.Target_Nama || 'Target Hafalan',
      Target_Ayat_Halaman: formData.Target_Ayat_Halaman || 'Juz',
      Deadline: formData.Deadline || '2026-12-31',
      Capaian_Persen: Number(formData.Capaian_Persen) || 0,
      Status: formData.Status as any || 'Sedang Berjalan',
      Keterangan: formData.Keterangan || '-'
    });
    setIsModalOpen(false);
  };

  const handleSliderChange = (id: string, newPercent: number) => {
    const status = newPercent >= 100 ? 'Tercapai' : 'Sedang Berjalan';
    updateTarget(id, { Capaian_Persen: newPercent, Status: status });
  };

  return (
    <div id="section-target-view" className="space-y-4 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Target & Capaian Santri RTQ</h3>
          <p className="text-xs text-gray-500">Tracking progress hafalan terhadap target kelulusan juz per santri</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Pasang Target Santri</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targetList.map(t => {
          const santri = santriList.find(s => s.NIS === t.NIS);
          const isComplete = t.Capaian_Persen >= 100;

          return (
            <div key={t.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{santri?.Nama_Lengkap || t.NIS}</h4>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">{t.NIS} &bull; {santri?.Kelas}</span>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                  isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.Status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Target className="w-4 h-4 text-emerald-700" />
                  <span>{t.Target_Nama}</span>
                </div>
                <p className="text-[11px] text-gray-600">Lingkup: {t.Target_Ayat_Halaman}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Target Selesai: {t.Deadline}</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Progress Capaian</span>
                  <span className="text-emerald-700">{t.Capaian_Persen}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      isComplete ? 'bg-emerald-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}
                    style={{ width: `${t.Capaian_Persen}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Geser untuk update progress:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={t.Capaian_Persen}
                    onChange={(e) => handleSliderChange(t.id, Number(e.target.value))}
                    className="w-32 accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 italic">"{t.Keterangan}"</p>
            </div>
          );
        })}
      </div>

      {/* Modal Add Target */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Pasang Target Santri</h3>
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
                <label className="block font-bold text-gray-700 mb-1">Nama Target</label>
                <input
                  type="text"
                  value={formData.Target_Nama}
                  onChange={(e) => setFormData({ ...formData, Target_Nama: e.target.value })}
                  placeholder="misal: Khatam Tahfidz Juz 30 (Juz 'Amma)"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Lingkup Ayat / Surah / Halaman</label>
                <input
                  type="text"
                  value={formData.Target_Ayat_Halaman}
                  onChange={(e) => setFormData({ ...formData, Target_Ayat_Halaman: e.target.value })}
                  placeholder="misal: 37 Surah / 30 Halaman Iqra"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deadline / Target Tanggal</label>
                  <input
                    type="date"
                    value={formData.Deadline}
                    onChange={(e) => setFormData({ ...formData, Deadline: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Progress Awal (%)</label>
                  <input
                    type="number"
                    value={formData.Capaian_Persen}
                    onChange={(e) => setFormData({ ...formData, Capaian_Persen: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan / Keterangan</label>
                <textarea
                  value={formData.Keterangan}
                  onChange={(e) => setFormData({ ...formData, Keterangan: e.target.value })}
                  placeholder="Rencana ziyadah harian..."
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
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
