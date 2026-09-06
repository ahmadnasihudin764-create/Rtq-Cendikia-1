import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Copy, 
  MessageSquare, 
  Check, 
  Sparkles, 
  Phone, 
  Users, 
  BellRing,
  Share2
} from 'lucide-react';

export const NotifikasiWAView: React.FC = () => {
  const { santriList, tahfidzList, sppList, showToast } = useApp();

  const [selectedNIS, setSelectedNIS] = useState<string>(santriList[0]?.NIS || '');
  const [templateType, setTemplateType] = useState<
    'kehadiran' | 'setoran_tahfidz' | 'tagihan_infaq' | 'pengumuman_kegiatan'
  >('setoran_tahfidz');

  const [customJudul, setCustomJudul] = useState('Kegiatan Tasmi\' Akbar RTQ');
  const [customTanggal, setCustomTanggal] = useState('Sabtu, 22 Agustus 2026');

  const santri = santriList.find(s => s.NIS === selectedNIS) || santriList[0];
  const lastTahfidz = tahfidzList.find(t => t.NIS === selectedNIS);

  // Generate Message Text
  let messageText = '';

  if (templateType === 'setoran_tahfidz') {
    messageText = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `Yth. Bapak/Ibu Wali Santri dari *${santri?.Nama_Lengkap || 'Santri'}* (NIS: ${santri?.NIS || '-'}),\n\n` +
      `Alhamdulillah, berikut adalah laporan capaian setoran hafalan Tahfidz Ananda hari ini:\n` +
      `📖 *Juz:* ${lastTahfidz?.Juz || '30'}\n` +
      `📜 *Surah:* ${lastTahfidz?.Surah || 'An-Naba'} (${lastTahfidz?.Ayat || 'Ayat 1-40'})\n` +
      `⭐ *Predikat Kelulusan:* ${lastTahfidz?.Status_Lulus || 'Mumtaz (Sangat Baik)'}\n` +
      `📝 *Catatan Pembimbing:* "${lastTahfidz?.Catatan || 'Ananda membaca dengan lancar dan makhraj fasih. Pertahankan muroja\'ah di rumah.'}"\n\n` +
      `Mohon dampingi ananda untuk senantiasa muroja'ah di rumah agar hafalan tetap mutqin.\n\n` +
      `Jazakumullah Khairan Katsiran.\n` +
      `*RTQ Cendikia BAZNAS Masjid Agung Darussalam*`;
  } else if (templateType === 'kehadiran') {
    messageText = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `Yth. Wali Santri dari *${santri?.Nama_Lengkap || 'Santri'}*,\n\n` +
      `Menginformasikan bahwa Ananda telah *HADIR TEPAT WAKTU* dalam Halaqah Quran RTQ Cendikia BAZNAS pada hari ini.\n` +
      `⏰ Waktu Presensi: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} pukul 15.30 WIB.\n` +
      `🕌 Halaqah: ${santri?.Halaqah}\n\n` +
      `Terima kasih atas disiplin dan motivasi yang senantiasa diberikan kepada Ananda.\n\n` +
      `Wassalamu'alaikum Warahmatullahi Wabarakatuh.\n` +
      `*Admin RTQ Cendikia BAZNAS*`;
  } else if (templateType === 'tagihan_infaq') {
    messageText = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `Yth. Bapak/Ibu Wali dari *${santri?.Nama_Lengkap}*,\n\n` +
      `Semoga Bapak/Ibu sekeluarga senantiasa dalam limpahan rahmat Allah SWT.\n\n` +
      `Kami menginformasikan tanda terima/pengingat Infaq Pendidikan Santri Periode *Agustus 2026*:\n` +
      `💳 *Nama Santri:* ${santri?.Nama_Lengkap} (${santri?.NIS})\n` +
      `🏷️ *Kategori:* Infaq Reguler Pengembangan RTQ\n` +
      `💵 *Nominal:* Rp 150.000,-\n` +
      `🏦 *Rekening Resmi:* BSI No. Rek 7220983708 a.n. Sri Siti Khafsoh\n\n` +
      `Bagi yang telah menunaikan, kami ucapkan jazakumullah khairan katsiran atas dukungannya terhadap pendidikan generasi Qur'ani.\n\n` +
      `*Bendahara RTQ Cendikia BAZNAS*`;
  } else {
    messageText = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `📢 *PENGUMUMAN RESMI RTQ CENDIKIA BAZNAS*\n\n` +
      `Kepada Seluruh Wali Santri Yang Dirahmati Allah,\n\n` +
      `Sehubungan dengan agenda *${customJudul}*, kami mengundang seluruh santri dan wali untuk berpartisipasi pada:\n` +
      `📅 *Hari/Tanggal:* ${customTanggal}\n` +
      `⏰ *Waktu:* 08.00 - 11.30 WIB\n` +
      `📍 *Tempat:* Ruang Utama Masjid Agung Darussalam\n\n` +
      `Demikian pemberitahuan ini disampaikan. Atas perhatian dan kerjasamanya kami haturkan terima kasih.\n\n` +
      `*Pengurus RTQ Cendikia BAZNAS*`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    showToast('Teks notifikasi WhatsApp berhasil disalin!', 'success');
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = santri?.WA_Wali?.replace(/[^0-9]/g, '') || '';
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
  };

  return (
    <div id="section-notifikasi-wa-view" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Pusat Notifikasi WhatsApp Wali Santri</h3>
          <p className="text-xs text-gray-500">Kirim laporan setoran tahfidz, presensi realtime, dan info administrasi langsung ke nomor wali</p>
        </div>
      </div>

      {/* Grid Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column - Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Pengaturan Template Pesan</span>
            </h4>

            {/* Template Selector */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-700">Pilih Jenis Notifikasi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTemplateType('setoran_tahfidz')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                    templateType === 'setoran_tahfidz'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📖 Setoran Tahfidz
                </button>
                <button
                  onClick={() => setTemplateType('kehadiran')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                    templateType === 'kehadiran'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ✅ Presensi / Kehadiran
                </button>
                <button
                  onClick={() => setTemplateType('tagihan_infaq')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                    templateType === 'tagihan_infaq'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💵 Infaq & SPP
                </button>
                <button
                  onClick={() => setTemplateType('pengumuman_kegiatan')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                    templateType === 'pengumuman_kegiatan'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📢 Pengumuman RTQ
                </button>
              </div>
            </div>

            {/* Target Santri */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-gray-700">Tujuan Santri & Wali</label>
              <select
                value={selectedNIS}
                onChange={(e) => setSelectedNIS(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-gray-50 font-semibold text-gray-800"
              >
                {santriList.map(s => (
                  <option key={s.NIS} value={s.NIS}>
                    {s.NIS} - {s.Nama_Lengkap} (Wali: {s.Nama_Wali} / {s.WA_Wali})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nomor WhatsApp Wali: <strong>{santri?.WA_Wali}</strong></span>
              </div>
            </div>

            {/* Custom Inputs if Pengumuman */}
            {templateType === 'pengumuman_kegiatan' && (
              <div className="space-y-3 pt-2 border-t text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Judul Agenda</label>
                  <input
                    type="text"
                    value={customJudul}
                    onChange={(e) => setCustomJudul(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hari / Tanggal</label>
                  <input
                    type="text"
                    value={customTanggal}
                    onChange={(e) => setCustomTanggal(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-3 border-t flex flex-col gap-2">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Langsung ke WhatsApp Wali</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks Pesan</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column - Live WhatsApp Preview Box */}
        <div className="lg:col-span-7">
          <div className="bg-[#ECE5DD] p-5 rounded-3xl border border-gray-300 shadow-md flex flex-col h-full min-h-[460px]">
            {/* WA Header mockup */}
            <div className="bg-[#075E54] text-white p-3 rounded-2xl flex items-center justify-between mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  WA
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{santri?.Nama_Wali} ({santri?.Nama_Lengkap})</p>
                  <p className="text-[10px] text-emerald-200">{santri?.WA_Wali}</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full font-mono">RTQ Official</span>
            </div>

            {/* Message Bubble */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-lg ml-auto text-xs text-gray-800 space-y-2 border border-gray-200">
                <p className="whitespace-pre-line leading-relaxed font-sans">{messageText}</p>
                <div className="flex justify-end items-center gap-1 text-[10px] text-gray-400 pt-1">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Input mock */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-white p-2.5 rounded-full text-xs text-gray-400 shadow-inner px-4">
                Pesan terformat siap dikirimkan...
              </div>
              <button
                onClick={handleOpenWhatsApp}
                className="w-10 h-10 rounded-full bg-[#128C7E] text-white flex items-center justify-center shadow hover:bg-emerald-700 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
