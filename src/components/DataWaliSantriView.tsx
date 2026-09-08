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
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Key
} from 'lucide-react';

export const DataWaliSantriView: React.FC = () => {
  const { santriList, usersList, resetUserPassword, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);

  const togglePasswordVisibility = (nis: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [nis]: !prev[nis]
    }));
  };

  const toggleShowAll = () => {
    const nextState = !showAllPasswords;
    setShowAllPasswords(nextState);
    const updated: Record<string, boolean> = {};
    santriList.forEach(s => {
      updated[s.NIS] = nextState;
    });
    setRevealedPasswords(updated);
  };

  const filteredList = santriList.filter(s =>
    s.Nama_Lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Nama_Wali.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.NIS.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Halaqah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to find associated user account and active password
  const getWaliAccountInfo = (s: typeof santriList[0]) => {
    const waliAccount = usersList.find(
      u => u.role === 'Wali Santri' && (
        u.santriNIS === s.NIS || 
        u.id === `USR_WALI_${s.NIS}` || 
        u.username.toLowerCase() === s.Nama_Lengkap.toLowerCase()
      )
    );

    const isCustom = waliAccount?.isDefaultPassword === false && Boolean(waliAccount?.password || waliAccount?.plainPassword);
    const activePassword = waliAccount?.plainPassword || waliAccount?.password || 'rtq_cendekia';
    const updatedAt = waliAccount?.passwordUpdatedAt;

    return {
      waliAccount,
      isCustom,
      activePassword,
      updatedAt
    };
  };

  // Count stats
  const customPasswordCount = santriList.filter(s => {
    const info = getWaliAccountInfo(s);
    return info.isCustom;
  }).length;

  const defaultPasswordCount = santriList.length - customPasswordCount;

  const handleCopyCredentials = (santriName: string, waliName: string, nis: string, passwordText: string) => {
    const text = `*INFORMASI KREDENSIAL LOGIN PORTAL WALI SANTRI*\n*SIT RTQ CENDIKIA BAZNAS*\n\nKepada Yth. Bapak/Ibu: *${waliName}*\nNama Santri: *${santriName}* (NIS: ${nis})\n\n🔗 Akses Portal: https://rtqcendikia.sch.id\n👤 Username: *${santriName}*\n🔑 Kata Sandi Aktif: *${passwordText}*\n\n_Catatan: Kata sandi tersimpan dan tersinkronisasi pada sistem administrasi RTQ Cendikia._`;
    navigator.clipboard.writeText(text);
    setCopiedId(nis);
    showToast(`Kredensial login (Kata sandi: ${passwordText}) untuk ${santriName} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopySinglePassword = (pass: string, name: string) => {
    navigator.clipboard.writeText(pass);
    showToast(`Kata sandi "${pass}" milik ${name} berhasil disalin!`, 'success');
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NIS', 'Nama Santri', 'Nama Wali', 'Nomor WA Wali', 'Username Akun', 'Kata Sandi Aktif', 'Status Sandi', 'Terakhir Diubah'];
    const rows = santriList.map((s, index) => {
      const info = getWaliAccountInfo(s);
      return [
        index + 1,
        s.NIS,
        `"${s.Nama_Lengkap}"`,
        `"${s.Nama_Wali}"`,
        s.WA_Wali,
        `"${s.Nama_Lengkap}"`,
        `"${info.activePassword}"`,
        info.isCustom ? 'Diubah Wali (Kustom)' : 'Sandi Awal (Default)',
        info.updatedAt ? new Date(info.updatedAt).toLocaleDateString('id-ID') : '-'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Akun_Wali_Santri_dan_Sandi_RTQ_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data akun 65 wali santri beserta kata sandi aktif berhasil diekspor ke CSV!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-800">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Manajemen Akun & Kata Sandi Wali Santri</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Admin dapat melihat username dan kata sandi seluruh wali santri, termasuk kata sandi baru yang telah diganti oleh wali santri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleShowAll}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
              showAllPasswords 
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-4 h-4 text-amber-800" /> : <Eye className="w-4 h-4 text-gray-600" />}
            <span>{showAllPasswords ? 'Sembunyikan Semua Sandi' : 'Lihat Semua Sandi'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV (+ Sandi)</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Total Akun Terdaftar</p>
            <p className="text-lg font-black text-gray-900">{santriList.length} Akun Wali</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase">Sandi Diubah Wali (Kustom)</p>
            <p className="text-lg font-black text-emerald-900">{customPasswordCount} Akun</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase">Sandi Awal (Default)</p>
            <p className="text-lg font-black text-amber-900">{defaultPasswordCount} Akun</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-blue-800 uppercase">Sandi Default Sistem</p>
            <p className="text-xs font-mono font-bold text-blue-900">rtq_cendekia</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama santri, nama wali, atau NIS..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-medium"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Menampilkan <strong>{filteredList.length}</strong> dari {santriList.length} akun wali
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
                <th className="p-3.5">Kata Sandi / Password Aktif</th>
                <th className="p-3.5">Status Sandi</th>
                <th className="p-3.5 text-center">Aksi & Kirim Kredensial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.map((s, index) => {
                const info = getWaliAccountInfo(s);
                const isRevealed = Boolean(revealedPasswords[s.NIS] || showAllPasswords);
                const isCopied = copiedId === s.NIS;
                const waClean = s.WA_Wali.replace(/\D/g, '');
                const waNumber = waClean.startsWith('0') ? '62' + waClean.slice(1) : waClean;
                const waMessage = encodeURIComponent(
                  `Assalamu'alaikum Bapak/Ibu ${s.Nama_Wali},\n\nBerikut informasi akun akses Portal Wali Santri SIT RTQ Cendikia BAZNAS untuk ananda *${s.Nama_Lengkap}*:\n\n👤 Username: *${s.Nama_Lengkap}*\n🔑 Kata Sandi: *${info.activePassword}*\n\nStatus Sandi: ${info.isCustom ? 'Sandi Kustom Anda' : 'Sandi Awal Sistem (rtq_cendekia)'}\n\nSilakan masuk ke aplikasi untuk memantau hafalan, absensi, dan administrasi ananda.`
                );

                return (
                  <tr key={s.NIS} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3.5 text-gray-400 font-medium">{index + 1}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-gray-900">{s.Nama_Lengkap}</p>
                      <p className="text-[10px] text-gray-500 font-mono">NIS: {s.NIS} &bull; {s.Kelas}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-gray-800 font-medium">{s.Nama_Wali}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{s.WA_Wali}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-md text-[11px] font-semibold block truncate max-w-[180px]" title={s.Nama_Lengkap}>
                        {s.Nama_Lengkap}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <div className={`font-mono text-xs px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                          info.isCustom 
                            ? 'bg-emerald-100/80 text-emerald-950 border-emerald-300 font-bold' 
                            : 'bg-amber-50 text-amber-950 border-amber-200 font-semibold'
                        }`}>
                          <KeyRound className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>{isRevealed ? info.activePassword : '••••••••'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(s.NIS)}
                          className="p-1 text-gray-400 hover:text-gray-700 transition cursor-pointer rounded"
                          title={isRevealed ? 'Sembunyikan Sandi' : 'Lihat Kata Sandi'}
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySinglePassword(info.activePassword, s.Nama_Lengkap)}
                          className="p-1 text-gray-400 hover:text-emerald-700 transition cursor-pointer rounded"
                          title="Salin Kata Sandi Saja"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {info.isCustom ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Diubah Wali (Kustom)</span>
                          </span>
                          {info.updatedAt && (
                            <p className="text-[9px] text-gray-400">
                              Update: {new Date(info.updatedAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                          Sandi Awal (Default)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleCopyCredentials(s.Nama_Lengkap, s.Nama_Wali, s.NIS, info.activePassword)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          title="Salin Kredensial Lengkap"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isCopied ? 'Tersalin' : 'Salin'}</span>
                        </button>

                        <a
                          href={`https://wa.me/${waNumber}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center space-x-1 cursor-pointer"
                          title="Kirim Kredensial & Sandi ke WA Wali"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-bold">Kirim WA</span>
                        </a>

                        <button
                          onClick={() => resetUserPassword(`USR_WALI_${s.NIS}`, 'rtq_cendekia')}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                          title="Reset Kata Sandi ke Default (rtq_cendekia)"
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
