import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Send,
  Users,
  CheckCircle2
} from 'lucide-react';
import { PengumumanRecord } from '../types';

export const PengumumanView: React.FC = () => {
  const { pengumumanList, addPengumuman, deletePengumuman, currentUser } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [judul, setJudul] = useState('');
  const [konten, setKonten] = useState('');
  const [kategori, setKategori] = useState<PengumumanRecord['kategori']>('Penting');
  const [targetRole, setTargetRole] = useState<PengumumanRecord['targetRole']>('Semua');

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Pengajar';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) return;

    const newRecord: PengumumanRecord = {
      id: 'PGM_' + Date.now(),
      judul,
      konten,
      tanggal: new Date().toISOString().split('T')[0],
      kategori,
      targetRole,
      penulis: currentUser?.nama || 'Admin RTQ Cendikia'
    };

    addPengumuman(newRecord);
    setJudul('');
    setKonten('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800">
            <Megaphone className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Pengumuman & Informasi Pesantren</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Informasi resmi, agenda kegiatan, dan maklumat RTQ Cendikia Masjid Agung Darussalam.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Pengumuman Baru</span>
          </button>
        )}
      </div>

      {/* List */}
      {pengumumanList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pengumumanList.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-200 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    p.kategori === 'Penting' ? 'bg-rose-100 text-rose-800' :
                    p.kategori === 'SPP & Keuangan' ? 'bg-teal-100 text-teal-800' :
                    p.kategori === 'Akademik' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.kategori} &bull; Target: {p.targetRole}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">{p.tanggal}</span>
                </div>

                <h3 className="font-bold text-sm text-gray-900">{p.judul}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.konten}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Oleh: <strong>{p.penulis}</strong></span>
                {isAdmin && (
                  <button
                    onClick={() => deletePengumuman(p.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Belum Ada Pengumuman / Maklumat</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Saat ini belum ada pengumuman atau informasi resmi yang diterbitkan oleh asatidz maupun pengurus pesantren.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pengumuman Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Add */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900">Terbitkan Pengumuman Baru</h4>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Jadwal Tasmi' Akbar Juz 30"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as PengumumanRecord['kategori'])}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    <option value="Penting">Penting</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="SPP & Keuangan">SPP & Keuangan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Pengguna</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as PengumumanRecord['targetRole'])}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    <option value="Semua">Semua Pengguna</option>
                    <option value="Wali Santri">Khusus Wali Santri</option>
                    <option value="Pengajar">Khusus Pengajar/Ustadz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Isi Lengkap Pengumuman</label>
                <textarea
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tuliskan detail pengumuman yang ingin disampaikan..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  Terbitkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
