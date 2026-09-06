import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Search, 
  KeyRound, 
  PhoneCall, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  UserCheck, 
  MessageSquare,
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const DataWaliSantriView: React.FC = () => {
  const { santriList, usersList, resetUserPassword, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredList = santriList.filter(s =>
    s.Nama_Lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Nama_Wali.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.NIS.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Halaqah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCredentials = (santriName: string, waliName: string, nis: string) => {
    const text = `*AKUN LOGIN SIT RTQ CENDIKIA BAZNAS*\n\nKepada Yth. Bapak/Ibu: *${waliName}*\nNama Santri: *${santriName}* (NIS: ${nis})\n\n🔗 Akses Portal: https://rtqcendikia.sch.id\n👤 Username: *${santriName}*\n🔑 Kata Sandi Awal: *rtq_cendekia*\n\n_Mohon segera mengganti kata sandi setelah berhasil masuk demi keamanan data santri._`;
    navigator.clipboard.writeText(text);
    setCopiedId(nis);
    showToast(`Format informasi login untuk ${santriName} berhasil disalin ke clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NIS', 'Nama Santri', 'Nama Wali', 'Nomor WA Wali', 'Username Akun', 'Password Awal', 'Status'];
    const rows = santriList.map((s, index) => [
      index + 1,
      s.NIS,
      `"${s.Nama_Lengkap}"`,
      `"${s.Nama_Wali}"`,
      s.WA_Wali,
      `"${s.Nama_Lengkap}"`,
      'rtq_cedikia',
      'Aktif'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Akun_Wali_Santri_RTQ_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data akun 65 wali santri berhasil diekspor ke CSV!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Manajemen Akun Wali Santri</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar kredensial 65 akun Wali Santri terhubung langsung dengan nama anak dan password default <strong className="text-emerald-700 font-mono">rtq_cedikia</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor CSV (65 Akun)</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Total Akun Terdaftar</p>
            <p className="text-lg font-black text-gray-900">{santriList.length} Akun Wali</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Format Username</p>
            <p className="text-xs font-bold text-gray-900">Nama Lengkap Santri</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Password Awal Sistem</p>
            <p className="text-xs font-mono font-bold text-amber-900">rtq_cedikia</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama santri, nama wali, atau NIS..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-gray-500">
            Menampilkan <strong>{filteredList.length}</strong> dari {santriList.length} akun
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold border-b border-gray-200">
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama Santri & NIS</th>
                <th className="p-3.5">Nama Wali Santri</th>
                <th className="p-3.5">Username Login</th>
                <th className="p-3.5">No. WhatsApp Wali</th>
                <th className="p-3.5 text-center">Status Akun</th>
                <th className="p-3.5 text-center">Aksi / Kirim Kredensial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.map((s, index) => {
                const isCopied = copiedId === s.NIS;
                const waClean = s.WA_Wali.replace(/\D/g, '');
                const waNumber = waClean.startsWith('0') ? '62' + waClean.slice(1) : waClean;
                const waMessage = encodeURIComponent(
                  `Assalamu'alaikum Bapak/Ibu ${s.Nama_Wali},\n\nBerikut informasi akun akses Portal Wali Santri SIT RTQ Cendikia BAZNAS untuk ananda *${s.Nama_Lengkap}*:\n\n👤 Username: *${s.Nama_Lengkap}*\n🔑 Password: *rtq_cedikia*\n\nSilakan masuk untuk memantau hafalan, absensi, dan perizinan ananda.`
                );

                return (
                  <tr key={s.NIS} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3.5 text-gray-400 font-medium">{index + 1}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-gray-900">{s.Nama_Lengkap}</p>
                      <p className="text-[10px] text-gray-500 font-mono">NIS: {s.NIS} &bull; {s.Kelas}</p>
                    </td>
                    <td className="p-3.5 text-gray-800 font-medium">{s.Nama_Wali}</td>
                    <td className="p-3.5">
                      <span className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px]">
                        {s.Nama_Lengkap}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700">
                      <span className="font-mono">{s.WA_Wali}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleCopyCredentials(s.Nama_Lengkap, s.Nama_Wali, s.NIS)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          title="Salin Kredensial Login"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isCopied ? 'Tersalin' : 'Salin'}</span>
                        </button>

                        <a
                          href={`https://wa.me/${waNumber}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center space-x-1"
                          title="Kirim Kredensial via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">Kirim WA</span>
                        </a>

                        <button
                          onClick={() => resetUserPassword(`USR_WALI_${s.NIS}`, 'rtq_cedikia')}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                          title="Reset Password ke Default (rtq_cedikia)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
