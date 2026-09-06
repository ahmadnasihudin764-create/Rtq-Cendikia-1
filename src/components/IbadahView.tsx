import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IbadahRecord } from '../types';
import { Plus, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

export const IbadahView: React.FC = () => {
  const { santriList, ibadahList, addIbadah } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<IbadahRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Sholat_Berjamaah_Score: 92,
    Qiyamul_Lail_Score: 90,
    Wudhu_Score: 92,
    Shalat_Score: 90,
    Dzikir_Score: 90,
    Hafalan_Doa: 'Doa Masuk/Keluar Masjid, Sayyidul Istighfar',
    Catatan: 'Istiqomah sholat berjamaah di shaf depan dan aktif qiyamul lail.'
  });

  const handleOpenAdd = () => {
    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Sholat_Berjamaah_Score: 92,
      Qiyamul_Lail_Score: 90,
      Wudhu_Score: 92,
      Shalat_Score: 90,
      Dzikir_Score: 90,
      Hafalan_Doa: '',
      Catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    const sholatBerjamaah = Number(formData.Sholat_Berjamaah_Score) || Number(formData.Wudhu_Score) || 90;
    const qiyamulLail = Number(formData.Qiyamul_Lail_Score) || Number(formData.Shalat_Score) || 88;

    addIbadah({
      id: 'IBD_' + Date.now(),
      Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
      NIS: formData.NIS,
      Sholat_Berjamaah_Score: sholatBerjamaah,
      Wudhu_Score: sholatBerjamaah,
      Qiyamul_Lail_Score: qiyamulLail,
      Shalat_Score: qiyamulLail,
      Dzikir_Score: Number(formData.Dzikir_Score) || 85,
      Hafalan_Doa: formData.Hafalan_Doa || 'Doa Harian Standar',
      Catatan: formData.Catatan || '-'
    });
    setIsModalOpen(false);
  };

  return (
    <div id="section-ibadah-view" className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Evaluasi Praktik Ibadah & Doa Santri</h3>
          <p className="text-xs text-gray-500">Pemeriksaan keaktifan sholat berjamaah, qiyamul lail, dzikir ma'tsurat, dan hafalan doa harian</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Input Evaluasi Ibadah</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ibadahList.map(ib => {
          const santri = santriList.find(s => s.NIS === ib.NIS);
          const scoreSholatBerjamaah = ib.Sholat_Berjamaah_Score ?? ib.Wudhu_Score ?? 90;
          const scoreQiyamulLail = ib.Qiyamul_Lail_Score ?? ib.Shalat_Score ?? 90;
          const rata = Math.round((scoreSholatBerjamaah + scoreQiyamulLail + ib.Dzikir_Score) / 3);

          return (
            <div key={ib.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{santri?.Nama_Lengkap || ib.NIS}</h4>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">{ib.NIS} &bull; {ib.Tanggal}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-700">{rata}</span>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Rata-rata</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Sholat Berjamaah</span>
                  <span className="text-sm font-black text-emerald-950">{scoreSholatBerjamaah}</span>
                </div>
                <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
                  <span className="text-[10px] text-teal-800 font-semibold block">Qiyamul Lail</span>
                  <span className="text-sm font-black text-teal-950">{scoreQiyamulLail}</span>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-800 font-semibold block">Dzikir & Doa</span>
                  <span className="text-sm font-black text-blue-950">{ib.Dzikir_Score}</span>
                </div>
              </div>

              <div className="text-xs bg-gray-50 p-3 rounded-xl border space-y-1">
                <p className="font-bold text-gray-800">Hafalan Doa Pilihan:</p>
                <p className="text-gray-600 text-[11px]">{ib.Hafalan_Doa}</p>
              </div>

              <p className="text-[11px] text-gray-500 italic">"{ib.Catatan}"</p>
            </div>
          );
        })}
      </div>

      {/* Modal Add Ibadah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Input Praktik Ibadah</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3 text-xs">
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sholat Berjamaah</label>
                  <input
                    type="number"
                    value={formData.Sholat_Berjamaah_Score ?? formData.Wudhu_Score}
                    onChange={(e) => setFormData({ ...formData, Sholat_Berjamaah_Score: Number(e.target.value), Wudhu_Score: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Qiyamul Lail</label>
                  <input
                    type="number"
                    value={formData.Qiyamul_Lail_Score ?? formData.Shalat_Score}
                    onChange={(e) => setFormData({ ...formData, Qiyamul_Lail_Score: Number(e.target.value), Shalat_Score: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Skor Dzikir</label>
                  <input
                    type="number"
                    value={formData.Dzikir_Score}
                    onChange={(e) => setFormData({ ...formData, Dzikir_Score: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Capaian Hafalan Doa & Hadits</label>
                <input
                  type="text"
                  value={formData.Hafalan_Doa}
                  onChange={(e) => setFormData({ ...formData, Hafalan_Doa: e.target.value })}
                  placeholder="misal: Doa Masuk Masjid, Hadits Kebersihan"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Evaluasi</label>
                <textarea
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Catatan kedisiplinan sholat berjamaah & qiyamul lail..."
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
                  Simpan Ibadah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
