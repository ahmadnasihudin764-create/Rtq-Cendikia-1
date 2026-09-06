import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AkhlakRecord } from '../types';
import { Plus, HeartHandshake, Star, ShieldCheck } from 'lucide-react';

export const AkhlakView: React.FC = () => {
  const { santriList, akhlakList, addAkhlak, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<AkhlakRecord>>({
    Tanggal: new Date().toISOString().split('T')[0],
    NIS: '',
    Bulan: 'Agustus 2026',
    Adab_Ustadz: 95,
    Adab_Quran: 95,
    Disiplin: 90,
    Kebersamaan: 95,
    Catatan: 'Sangat santun dan tawadhu dalam mengikuti halaqah.',
    Ustadz_Penilai: currentUser?.nama || 'Ustadz Pembina'
  });

  const handleOpenAdd = () => {
    setFormData({
      Tanggal: new Date().toISOString().split('T')[0],
      NIS: santriList[0]?.NIS || '',
      Bulan: 'Agustus 2026',
      Adab_Ustadz: 95,
      Adab_Quran: 95,
      Disiplin: 90,
      Kebersamaan: 95,
      Catatan: '',
      Ustadz_Penilai: currentUser?.nama || 'Ustadz Pembina'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NIS) return;

    addAkhlak({
      id: 'AKH_' + Date.now(),
      Tanggal: formData.Tanggal || new Date().toISOString().split('T')[0],
      NIS: formData.NIS,
      Bulan: formData.Bulan || 'Agustus 2026',
      Adab_Ustadz: Number(formData.Adab_Ustadz) || 90,
      Adab_Quran: Number(formData.Adab_Quran) || 90,
      Disiplin: Number(formData.Disiplin) || 90,
      Kebersamaan: Number(formData.Kebersamaan) || 90,
      Catatan: formData.Catatan || '-',
      Ustadz_Penilai: formData.Ustadz_Penilai || 'Ustadz Pembina'
    });
    setIsModalOpen(false);
  };

  return (
    <div id="section-akhlak-view" className="space-y-4 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Penilaian Akhlak & Adab Santri</h3>
          <p className="text-xs text-gray-500">Evaluasi adab kepada guru, Al-Qur'an, kedisiplinan, dan ukhuwah sesama santri</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Input Penilaian Adab</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {akhlakList.map(a => {
          const santri = santriList.find(s => s.NIS === a.NIS);
          const rata = Math.round((a.Adab_Ustadz + a.Adab_Quran + a.Disiplin + a.Kebersamaan) / 4);

          return (
            <div key={a.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{santri?.Nama_Lengkap || a.NIS}</h4>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold">{a.NIS} &bull; {a.Bulan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-700">{rata}</span>
                    <span className="block text-[9px] text-gray-400 font-semibold">SKOR ADAB</span>
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-2 pt-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5 text-gray-600">
                      <span>Adab kepada Ustadz</span>
                      <span className="font-bold text-emerald-700">{a.Adab_Ustadz}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${a.Adab_Ustadz}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5 text-gray-600">
                      <span>Adab memegang Al-Qur'an</span>
                      <span className="font-bold text-teal-700">{a.Adab_Quran}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${a.Adab_Quran}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5 text-gray-600">
                      <span>Kedisiplinan Waktu</span>
                      <span className="font-bold text-blue-700">{a.Disiplin}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${a.Disiplin}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5 text-gray-600">
                      <span>Ukhuwah & Kebersamaan</span>
                      <span className="font-bold text-amber-700">{a.Kebersamaan}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${a.Kebersamaan}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 italic border border-gray-100">
                  "{a.Catatan}"
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                <span>Penilai: {a.Ustadz_Penilai}</span>
                <span>{a.Tanggal}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Akhlak */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Input Penilaian Akhlak & Adab</h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Periode Bulan</label>
                  <input
                    type="text"
                    value={formData.Bulan}
                    onChange={(e) => setFormData({ ...formData, Bulan: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Adab Ustadz (1-100)</label>
                  <input
                    type="number"
                    value={formData.Adab_Ustadz}
                    onChange={(e) => setFormData({ ...formData, Adab_Ustadz: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Adab Al-Qur'an (1-100)</label>
                  <input
                    type="number"
                    value={formData.Adab_Quran}
                    onChange={(e) => setFormData({ ...formData, Adab_Quran: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disiplin Waktu (1-100)</label>
                  <input
                    type="number"
                    value={formData.Disiplin}
                    onChange={(e) => setFormData({ ...formData, Disiplin: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kebersamaan (1-100)</label>
                  <input
                    type="number"
                    value={formData.Kebersamaan}
                    onChange={(e) => setFormData({ ...formData, Kebersamaan: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Pembimbing</label>
                <textarea
                  value={formData.Catatan}
                  onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                  placeholder="Catatan sikap dan keteladanan..."
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
                  Simpan Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
