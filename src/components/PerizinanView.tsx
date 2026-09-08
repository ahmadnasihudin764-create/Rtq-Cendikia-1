import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Filter, 
  CheckCheck,
  UserCheck,
  Trash2
} from 'lucide-react';
import { PerizinanRecord } from '../types';

export const PerizinanView: React.FC = () => {
  const { perizinanList, addPerizinan, updatePerizinan, deletePerizinan, santriList, currentUser, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIzin, setSelectedIzin] = useState<PerizinanRecord | null>(null);
  const [catatanUstadz, setCatatanUstadz] = useState('');

  // Form State for new perizinan
  const [selectedNIS, setSelectedNIS] = useState('');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [jenisIzin, setJenisIzin] = useState<PerizinanRecord['jenisIzin']>('Pulang/Keluarga');
  const [alasan, setAlasan] = useState('');
  const [penjemput, setPenjemput] = useState('');

  const filteredList = perizinanList.filter(p => {
    const matchSearch = p.namaSantri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.NIS.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.alasan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreatePerizinan = (e: React.FormEvent) => {
    e.preventDefault();
    const foundSantri = santriList.find(s => s.NIS === selectedNIS);
    if (!foundSantri || !tglMulai || !tglSelesai || !alasan) return;

    const newRecord: PerizinanRecord = {
      id: 'IZN_' + Date.now(),
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      NIS: foundSantri.NIS,
      namaSantri: foundSantri.Nama_Lengkap,
      tanggalMulai: tglMulai,
      tanggalSelesai: tglSelesai,
      jenisIzin,
      alasan,
      status: 'Disetujui',
      penjemput: penjemput || foundSantri.Nama_Wali,
      disetujuiOleh: currentUser?.nama || 'Admin RTQ'
    };

    addPerizinan(newRecord);
    setIsAddModalOpen(false);
    setSelectedNIS('');
    setTglMulai('');
    setTglSelesai('');
    setAlasan('');
    setPenjemput('');
  };

  const handleUpdateStatus = (id: string, newStatus: PerizinanRecord['status']) => {
    updatePerizinan(id, {
      status: newStatus,
      disetujuiOleh: currentUser?.nama || 'Admin RTQ',
      catatanUstadz: catatanUstadz || undefined
    });
    setSelectedIzin(null);
    setCatatanUstadz('');
    showToast(`Status perizinan santri telah diperbarui menjadi ${newStatus}`, 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Manajemen Perizinan Santri</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola dan verifikasi permohonan izin pulang, sakit, atau kegiatan luar santri RTQ Cendikia BAZNAS.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Izin Manual</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase">Menunggu Verifikasi</p>
          <p className="text-xl font-black text-amber-600">
            {perizinanList.filter(p => p.status === 'Menunggu Persetujuan').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase">Disetujui / Aktif</p>
          <p className="text-xl font-black text-emerald-600">
            {perizinanList.filter(p => p.status === 'Disetujui').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase">Selesai / Kembali</p>
          <p className="text-xl font-black text-blue-600">
            {perizinanList.filter(p => p.status === 'Selesai').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase">Total Pengajuan</p>
          <p className="text-xl font-black text-gray-900">{perizinanList.length}</p>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter & Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari santri atau alasan izin..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Selesai">Selesai / Kembali</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold border-b border-gray-200">
                <th className="p-3.5">Santri & NIS</th>
                <th className="p-3.5">Tanggal Izin</th>
                <th className="p-3.5">Jenis Izin</th>
                <th className="p-3.5">Alasan & Penjemput</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Verifikator</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 px-4 bg-white">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-gray-700 text-sm">Belum Ada Data Perizinan Santri</p>
                      <p className="text-gray-400 text-xs max-w-sm">
                        Data perizinan santri saat ini kosong. Permohonan izin dari portal wali santri atau pencatatan baru akan ditampilkan di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/30 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-gray-900">{p.namaSantri}</p>
                      <p className="text-[10px] text-gray-500 font-mono">NIS: {p.NIS}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-gray-800">{p.tanggalMulai} s/d {p.tanggalSelesai}</p>
                      <p className="text-[10px] text-gray-400">Diajukan: {p.tanggalPengajuan}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                        {p.jenisIzin}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-gray-800 line-clamp-2">{p.alasan}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Penjemput: <strong>{p.penjemput || '-'}</strong></p>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600 text-[11px]">
                      {p.disetujuiOleh || '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {p.status === 'Menunggu Persetujuan' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'Disetujui')}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                              title="Setujui Izin"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'Ditolak')}
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition"
                              title="Tolak Izin"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {p.status === 'Disetujui' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Selesai')}
                            className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[10px] transition"
                            title="Tandai Santri Sudah Kembali"
                          >
                            Tandai Kembali
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data perizinan santri ${p.namaSantri}?`)) {
                              deletePerizinan(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition"
                          title="Hapus Izin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900">Catat Perizinan Santri Baru</h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePerizinan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Santri (65 Terdaftar)</label>
                <select
                  value={selectedNIS}
                  onChange={(e) => setSelectedNIS(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map((s) => (
                    <option key={s.NIS} value={s.NIS}>
                      {s.Nama_Lengkap} ({s.NIS}) - Wali: {s.Nama_Wali}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Jenis Izin</label>
                <select
                  value={jenisIzin}
                  onChange={(e) => setJenisIzin(e.target.value as PerizinanRecord['jenisIzin'])}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
                >
                  <option value="Pulang/Keluarga">Pulang / Keperluan Keluarga</option>
                  <option value="Sakit/Berobat">Sakit / Rawat / Berobat</option>
                  <option value="Kegiatan Luar">Kegiatan Sekolah Formal / Lomba</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alasan Izin</label>
                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={2}
                  required
                  placeholder="Keterangan keperluan perizinan..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Penjemput / Penanggung Jawab</label>
                <input
                  type="text"
                  value={penjemput}
                  onChange={(e) => setPenjemput(e.target.value)}
                  placeholder="Nama wali / kerabat penjemput"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
                >
                  Simpan & Setujui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
