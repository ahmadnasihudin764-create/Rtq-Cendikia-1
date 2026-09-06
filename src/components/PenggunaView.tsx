import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount } from '../types';
import { 
  Users, 
  ShieldCheck, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Key, 
  UserPlus, 
  Trash2,
  Lock,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { Logo } from './Logo';

export const PenggunaView: React.FC = () => {
  const { 
    currentUser, 
    usersList, 
    addUser, 
    deleteUser, 
    resetDataToDefault, 
    appLogo,
    resetAppLogo,
    setIsEditLogoModalOpen,
    showToast 
  } = useApp();

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Pengajar';
  const isCustomLogo = appLogo && appLogo !== '/assets/logo.png';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    username: '',
    nama: '',
    role: 'Pengajar',
    email: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      nama: '',
      role: 'Pengajar',
      email: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.nama) return;

    const newUser: UserAccount = {
      id: 'USR_' + Date.now(),
      username: formData.username,
      nama: formData.nama,
      role: formData.role as any || 'Pengajar',
      email: formData.email || `${formData.username}@rtqcendikia.org`,
      isActive: true
    };

    addUser(newUser);
    setIsModalOpen(false);
  };

  // Export JSON Database
  const handleExportDB = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('SIP_RTQ_CENDIKIA_')) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BACKUP_DATABASE_RTQ_CENDIKIA_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup database JSON berhasil diunduh!', 'success');
  };

  return (
    <div id="section-pengguna-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Manajemen Pengguna & Pemeliharaan Sistem</h3>
          <p className="text-xs text-gray-500">Hak akses multi-role (Super Admin, Pengajar, Administrasi, Wali Santri) dan backup data</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Daftar Akun Pengguna Terdaftar</span>
          </h4>
          <span className="text-[11px] text-gray-400 font-semibold">{usersList.length} Akun Aktif</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">Nama Lengkap</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Hak Akses (Role)</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map(u => {
                let badgeRole = 'bg-gray-100 text-gray-800';
                if (u.role === 'Super Admin') badgeRole = 'bg-rose-100 text-rose-900 font-bold';
                if (u.role === 'Pengajar') badgeRole = 'bg-emerald-100 text-emerald-900 font-bold';
                if (u.role === 'Administrasi') badgeRole = 'bg-teal-100 text-teal-900 font-bold';
                if (u.role === 'Wali Santri') badgeRole = 'bg-blue-100 text-blue-900 font-bold';

                const isSelf = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5 font-bold text-gray-900">
                      {u.nama}
                      {isSelf && <span className="ml-2 text-[10px] text-emerald-700 font-normal">(Anda)</span>}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-800 font-semibold">{u.username}</td>
                    <td className="p-3.5 text-gray-500">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] rounded-full ${badgeRole}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {!isSelf && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logo & Identity Management Section (Admin Only) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Identitas & Logo Resmi Lembaga</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Logo ini diterapkan pada seluruh komponen aplikasi: Header, Sidebar, Login, Rapor Cetak PDF, dan Kartu Santri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border flex items-center gap-1.5 ${
              isCustomLogo 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isCustomLogo ? 'Logo Kustom Aktif' : 'Logo Standar BAZNAS'}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2 border border-emerald-200 shadow-sm flex items-center justify-center flex-shrink-0">
              <Logo size="xl" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                RTQ CENDIKIA BAZNAS
              </span>
              <h5 className="text-sm font-bold text-gray-900 leading-tight">
                Logo Resmi Pesantren Tahfidz & Diniyyah
              </h5>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isCustomLogo 
                  ? 'Telah disesuaikan oleh Administrator melalui sistem kustomisasi logo.'
                  : 'Menggunakan logo default resmi RTQ Cendikia BAZNAS Masjid Agung Darussalam.'}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              {isCustomLogo && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Kembalikan logo ke format standar RTQ Cendikia BAZNAS?')) {
                      resetAppLogo();
                    }
                  }}
                  className="px-3.5 py-2.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-semibold text-xs rounded-xl border border-gray-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan Default</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditLogoModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-300" />
                <span>Ubah / Ganti Logo</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-gray-500 italic bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              🔒 Hanya Super Admin / Admin yang dapat mengubah logo
            </span>
          )}
        </div>
      </div>

      {/* Database Maintenance Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700" />
          <span>Pemeliharaan & Keamanan Basis Data</span>
        </h4>
        <p className="text-xs text-gray-500">
          Seluruh data santri, setoran hafalan tahfidz, iuran SPP, dan absensi tersimpan secara persisten di penyimpanan browser lokal yang aman.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportDB}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor / Backup Database JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin memulihkan data default RTQ Cendikia? Seluruh perubahan lokal akan direset ke sampel resmi BAZNAS.')) {
                resetDataToDefault();
              }
            }}
            className="px-4 py-2.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset ke Data Awal BAZNAS</span>
          </button>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Tambah Akun Pengguna Sistem</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  placeholder="Nama Lengkap dan Gelar"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  placeholder="username unik"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Role / Peran</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="Super Admin">Super Admin (Direktur/Kepala RTQ)</option>
                  <option value="Pengajar">Pengajar / Ustadz Halaqah</option>
                  <option value="Administrasi">Administrasi & Keuangan</option>
                  <option value="Wali Santri">Wali Santri</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@rtqcendikia.org"
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
