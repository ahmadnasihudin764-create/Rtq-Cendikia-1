import React, { useState } from 'react';
import { 
  Facebook, 
  Youtube, 
  Instagram, 
  ExternalLink, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Sparkles, 
  Video, 
  Tv, 
  Heart, 
  MessageCircle,
  Smartphone,
  ShieldCheck,
  Building,
  ArrowUpRight
} from 'lucide-react';

interface SocialMediaItem {
  id: string;
  name: string;
  platform: 'Facebook' | 'YouTube' | 'Instagram';
  handle: string;
  url: string;
  description: string;
  subDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  accentColor: {
    bgLight: string;
    bgGradient: string;
    border: string;
    badge: string;
    badgeText: string;
    btn: string;
    btnHover: string;
    iconColor: string;
    shadow: string;
  };
  features: string[];
}

export const MediaRTQView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const socialMediaList: SocialMediaItem[] = [
    {
      id: 'facebook',
      name: 'Facebook RTQ Cendikia',
      platform: 'Facebook',
      handle: '@RTQ Cendikia',
      url: 'https://www.facebook.com/share/1LLj67r1ne/',
      description: 'Kunjungi Media RTQ Cendikia',
      subDescription: 'Halaman resmi kabar kegiatan santri, maklumat pesantren, tabligh akbar, dan dokumentasi program BAZNAS.',
      icon: Facebook,
      tag: 'Komunitas & Info Resmi',
      accentColor: {
        bgLight: 'bg-blue-50/70',
        bgGradient: 'from-blue-600 to-indigo-700',
        border: 'border-blue-200 hover:border-blue-400',
        badge: 'bg-blue-100 text-blue-800',
        badgeText: 'text-blue-700',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white',
        btnHover: 'group-hover:bg-blue-50',
        iconColor: 'text-blue-600',
        shadow: 'shadow-blue-500/15'
      },
      features: [
        'Kabar berita & agenda masjid',
        'Dokumentasi kegiatan santri & walimah',
        'Forum silaturahmi wali santri & alumni'
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube RTQ Cendikia BAZNAS',
      platform: 'YouTube',
      handle: '@rtqcendekiabaznasofficial',
      url: 'https://youtube.com/@rtqcendekiabaznasofficial?si=aENcqebny1iW-2oV',
      description: 'Kunjungi Media RTQ Cendikia',
      subDescription: 'Channel resmi siaran murottal santri, video wisuda tahfidz, kajian keislaman, dan tausiyah asatidz.',
      icon: Youtube,
      tag: 'Video & Murottal Santri',
      accentColor: {
        bgLight: 'bg-red-50/70',
        bgGradient: 'from-red-600 to-rose-700',
        border: 'border-red-200 hover:border-red-400',
        badge: 'bg-red-100 text-red-800',
        badgeText: 'text-red-700',
        btn: 'bg-red-600 hover:bg-red-700 text-white',
        btnHover: 'group-hover:bg-red-50',
        iconColor: 'text-red-600',
        shadow: 'shadow-red-500/15'
      },
      features: [
        'Murottal hafalan juz 30 & pilihan santri',
        'Liputan wisuda tahfidz & tasmi\' 30 juz',
        'Video pembelajaran tajwid & makharijul huruf'
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram RTQ Cendikia BAZNAS',
      platform: 'Instagram',
      handle: '@rtq_cendikia_baznas',
      url: 'https://www.instagram.com/rtq_cendikia_baznas?igsh=c3Y5a3VzeXVmdXNj',
      description: 'Kunjungi Media RTQ Cendikia',
      subDescription: 'Galeri visual keseharian santri di halaqah, prestasi lomba MHQ, cerita inspiratif, dan jadwal penerimaan santri baru.',
      icon: Instagram,
      tag: 'Galeri & Story Harian',
      accentColor: {
        bgLight: 'bg-pink-50/70',
        bgGradient: 'from-fuchsia-600 via-rose-600 to-amber-500',
        border: 'border-pink-200 hover:border-pink-400',
        badge: 'bg-pink-100 text-pink-800',
        badgeText: 'text-pink-700',
        btn: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white',
        btnHover: 'group-hover:bg-pink-50',
        iconColor: 'text-pink-600',
        shadow: 'shadow-pink-500/15'
      },
      features: [
        'Foto aktivitas santri setiap waktu',
        'Update prestasi santri & beasiswa BAZNAS',
        'Infografis adab dan mutiara hadits harian'
      ]
    }
  ];

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <div id="section-media-rtq" className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-8 pointer-events-none">
          <Globe className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-400/20 rounded-full text-xs font-bold text-yellow-300 border border-yellow-400/30">
            <Share2 className="w-3.5 h-3.5" />
            <span>Pusat Informasi & Media Sosial Resmi</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Media RTQ Cendikia BAZNAS
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Ikuti dan berlangganan media sosial resmi Rumah Tahfidz Qur'an (RTQ) Cendikia Masjid Agung Darussalam untuk menyaksikan perkembangan santri, galeri hafalan, tausiyah Qur'ani, serta kabar beasiswa BAZNAS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1.5 rounded-xl border border-emerald-700/60">
              <Building className="w-4 h-4 text-yellow-300" />
              <span>Masjid Agung Darussalam</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1.5 rounded-xl border border-emerald-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Akun Resmi Terverifikasi</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1.5 rounded-xl border border-emerald-700/60">
              <Smartphone className="w-4 h-4 text-teal-300" />
              <span>Responsif HP & Browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {socialMediaList.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              id={`card-media-${item.id}`}
              onClick={() => handleOpenLink(item.url)}
              className={`bg-white rounded-3xl p-6 border ${item.accentColor.border} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1`}
            >
              <div className="space-y-4">
                
                {/* Platform Header & Icon */}
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${item.accentColor.bgLight} flex items-center justify-center ${item.accentColor.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${item.accentColor.badge}`}>
                    {item.tag}
                  </span>
                </div>

                {/* Title & Handle */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    {item.description}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-emerald-800 transition-colors leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-gray-500">
                    {item.handle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.subDescription}
                </p>

                {/* Key Content Highlights */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <p className="text-[11px] font-bold text-gray-700">Konten Tersedia:</p>
                  <ul className="space-y-1">
                    {item.features.map((f, idx) => (
                      <li key={idx} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink(item.url);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${item.accentColor.btn}`}
                  title={`Buka ${item.name}`}
                >
                  <span>Buka {item.platform}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleCopyLink(e, item.id, item.url)}
                  className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition flex items-center justify-center cursor-pointer ${
                    isCopied ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''
                  }`}
                  title="Salin Tautan Media Sosial"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info & Android Device Guide Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 rounded-3xl border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-xs text-emerald-950 max-w-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <h4 className="font-extrabold text-sm text-emerald-900">
              Petunjuk Akses Media di Smartphone Android & Komputer
            </h4>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Ketika Anda menekan tombol di atas melalui perangkat Android, aplikasi resmi (Facebook, YouTube, atau Instagram) akan terbuka secara otomatis jika sudah terpasang di HP Anda. Jika aplikasi belum terpasang, tautan akan terbuka melalui peramban (browser) Anda.
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold pt-1">
            Dukung dakwah Al-Qur'an dengan memberikan <em>Like</em>, <em>Subscribe</em>, <em>Follow</em>, dan membagikan konten positif santri RTQ Cendikia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <a
            href="https://youtube.com/@rtqcendekiabaznasofficial?si=aENcqebny1iW-2oV"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Youtube className="w-4 h-4" />
            <span>Subscribe YouTube</span>
          </a>
          <a
            href="https://www.instagram.com/rtq_cendikia_baznas?igsh=c3Y5a3VzeXVmdXNj"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow Instagram</span>
          </a>
        </div>
      </div>

    </div>
  );
};
