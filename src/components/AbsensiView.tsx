import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AbsensiRecord } from '../types';
import { 
  ClipboardCheck, 
  QrCode, 
  Save, 
  Calendar, 
  Filter, 
  Check, 
  X, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const AbsensiView: React.FC = () => {
  const { 
    santriList, 
    absensiList, 
    recordAbsensi, 
    recordBulkAbsensi, 
    setIsQRScannerOpen, 
    showToast 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('Semua');

  // Santri in current filter
  const halaqahOptions = Array.from(new Set(santriList.map(s => s.Halaqah)));

  const filteredSantri = santriList.filter(s => 
    selectedHalaqah === 'Semua' || s.Halaqah === selectedHalaqah
  );

  // Map of NIS -> status on selectedDate
  const currentAttendanceMap: Record<string, { status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'; waktu?: string; ket?: string }> = {};
  absensiList
    .filter(a => a.tanggal === selectedDate)
    .forEach(a => {
      currentAttendanceMap[a.NIS] = {
        status: a.status,
        waktu: a.waktuScan,
        ket: a.keterangan
      };
    });

  const [localAttendance, setLocalAttendance] = useState<Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'>>({});

  const handleSetStatus = (nis: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    const santri = santriList.find(s => s.NIS === nis);
    if (!santri) return;

    recordAbsensi({
      id: 'ABS_' + Date.now() + '_' + nis,
      tanggal: selectedDate,
      NIS: santri.NIS,
      namaSantri: santri.Nama_Lengkap,
      halaqah: santri.Halaqah,
      status,
      waktuScan: status === 'Hadir' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : undefined,
      keterangan: status === 'Hadir' ? 'Presensi manual ustadz' : status
    });
  };

  const handleSetAllPresent = () => {
    const records: AbsensiRecord[] = filteredSantri.map(s => ({
      id: 'ABS_' + Date.now() + '_' + s.NIS,
      tanggal: selectedDate,
      NIS: s.NIS,
      namaSantri: s.Nama_Lengkap,
      halaqah: s.Halaqah,
      status: 'Hadir',
      waktuScan: '15.30 WIB',
      keterangan: 'Hadir serentak halaqah'
    }));
    recordBulkAbsensi(records);
    showToast(`Seluruh santri pada halaqah ini ditandai Hadir!`, 'success');
  };

  const hadirCount = filteredSantri.filter(s => currentAttendanceMap[s.NIS]?.status === 'Hadir').length;
  const sakitCount = filteredSantri.filter(s => currentAttendanceMap[s.NIS]?.status === 'Sakit').length;
  const izinCount = filteredSantri.filter(s => currentAttendanceMap[s.NIS]?.status === 'Izin').length;
  const alpaCount = filteredSantri.filter(s => currentAttendanceMap[s.NIS]?.status === 'Alpa').length;
  const belumAbsen = filteredSantri.filter(s => !currentAttendanceMap[s.NIS]).length;

  return (
    <div id="section-absensi-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Presensi / Absensi Santri RTQ</h3>
          <p className="text-xs text-gray-500">Pencatatan kehadiran harian santri per halaqah</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Santri</span>
          </button>

          <button
            onClick={handleSetAllPresent}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Hadirkan Semua</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Halaqah:</span>
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="px-3 py-1.5 border rounded-xl bg-gray-50 text-gray-800 font-medium focus:outline-none"
            >
              <option value="Semua">Semua Halaqoh</option>
              {halaqahOptions.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
            Hadir: {hadirCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-800">
            Sakit: {sakitCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
            Izin: {izinCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
            Alpa: {alpaCount}
          </span>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="p-3.5">NIS</th>
                <th className="p-3.5">Nama Santri</th>
                <th className="p-3.5">Halaqah</th>
                <th className="p-3.5">Waktu Scan / Catatan</th>
                <th className="p-3.5 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSantri.map(s => {
                const rec = currentAttendanceMap[s.NIS];
                const currentStatus = rec?.status;

                return (
                  <tr key={s.NIS} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{s.NIS}</td>
                    <td className="p-3.5 font-bold text-gray-900">{s.Nama_Lengkap}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{s.Halaqah}</td>
                    <td className="p-3.5 text-gray-500">
                      {rec?.waktu ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> {rec.waktu}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Belum tercatat</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex rounded-xl border border-gray-200 p-0.5 bg-gray-50 gap-0.5">
                        <button
                          onClick={() => handleSetStatus(s.NIS, 'Hadir')}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                            currentStatus === 'Hadir'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => handleSetStatus(s.NIS, 'Sakit')}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                            currentStatus === 'Sakit'
                              ? 'bg-yellow-500 text-white shadow-xs'
                              : 'text-gray-600 hover:text-yellow-700 hover:bg-yellow-50'
                          }`}
                        >
                          Sakit
                        </button>
                        <button
                          onClick={() => handleSetStatus(s.NIS, 'Izin')}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                            currentStatus === 'Izin'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          Izin
                        </button>
                        <button
                          onClick={() => handleSetStatus(s.NIS, 'Alpa')}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                            currentStatus === 'Alpa'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Alpa
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
