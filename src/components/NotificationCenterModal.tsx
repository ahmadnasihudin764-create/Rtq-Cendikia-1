import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  X, 
  Clock, 
  User, 
  FileText, 
  MessageCircle, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  ShieldAlert, 
  UserCheck, 
  CreditCard, 
  BookOpen,
  Send
} from 'lucide-react';
import { AppNotification } from '../types';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setActiveMenu,
    updatePerizinan,
    perizinanList,
    addNotification,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'semua' | 'izin' | 'komentar' | 'profil' | 'sistem'>('semua');

  if (!isNotificationCenterOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'izin') return n.kategori === 'izin';
    if (activeTab === 'komentar') return n.kategori === 'komentar';
    if (activeTab === 'profil') return n.kategori === 'profil';
    if (activeTab === 'sistem') return n.kategori === 'sistem' || n.kategori === 'spp' || n.kategori === 'tahfidz';
    return true;
  });

  const handleActionClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetMenu) {
      setActiveMenu(notif.targetMenu);
      setIsNotificationCenterOpen(false);
    }
  };

  const handleApproveIzin = (e: React.MouseEvent, notif: AppNotification) => {
    e.stopPropagation();
    if (notif.targetId) {
      const match = perizinanList.find(p => p.id === notif.targetId);
      if (match) {
        updatePerizinan(match.id, { 
          status: 'Disetujui',
          disetujuiOleh: 'Admin / Pengasuh RTQ',
          catatanUstadz: 'Disetujui melalui notifikasi langsung.'
        });
        markNotificationAsRead(notif.id);
        showToast(`Izin santri ${match.namaSantri} berhasil disetujui!`, 'success');
        return;
      }
    }
    markNotificationAsRead(notif.id);
    setActiveMenu('perizinan');
    setIsNotificationCenterOpen(false);
  };

  const getCategoryBadge = (kategori: AppNotification['kategori']) => {
    switch (kategori) {
      case 'izin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <FileText className="w-3 h-3 text-amber-700" />
            Permohonan Izin
          </span>
        );
      case 'komentar':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            <MessageCircle className="w-3 h-3 text-emerald-700" />
            Komentar Wali
          </span>
        );
      case 'profil':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-700" />
            Pembaruan Profil
          </span>
        );
      case 'spp':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
            <CreditCard className="w-3 h-3 text-purple-700" />
            Infaq / SPP
          </span>
        );
      case 'tahfidz':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
            <BookOpen className="w-3 h-3 text-teal-700" />
            Setoran Tahfidz
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            <Sparkles className="w-3 h-3 text-gray-600" />
            Sistem
          </span>
        );
    }
  };

  return (
    <div 
      id="notification-center-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsNotificationCenterOpen(false)}
    >
      <div 
        id="notification-center-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative p-2.5 bg-emerald-700/60 rounded-xl border border-emerald-500/30 text-amber-300">
              <BellRing className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-emerald-900 animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">Pemberitahuan & Notifikasi Admin</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} Baru
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Pantau langsung permohonan izin, komentar foto, dan pembaruan dari Wali Santri
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationCenterOpen(false)}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-xl transition cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'semua'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('izin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'izin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Izin Santri ({notifications.filter(n => n.kategori === 'izin').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('komentar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'komentar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Komentar Wali ({notifications.filter(n => n.kategori === 'komentar').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profil'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profil ({notifications.filter(n => n.kategori === 'profil').length})</span>
            </button>
          </div>

          {/* Action Button: Mark all as read */}
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100/70 hover:bg-emerald-200/70 rounded-lg transition cursor-pointer"
              title="Tandai semua notifikasi telah dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="font-bold text-sm text-gray-900">Belum ada notifikasi baru</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Semua aktivitas permohonan izin santri, komentar galeri, dan pembaruan data dari Wali Santri akan muncul di sini secara otomatis.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isIzinPending = notif.kategori === 'izin' && !notif.dibaca;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleActionClick(notif)}
                  className={`pt-3 first:pt-0 group relative p-3.5 rounded-xl transition-all cursor-pointer border ${
                    !notif.dibaca
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/80 shadow-xs'
                      : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Left Icon */}
                    <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                      notif.kategori === 'izin'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : notif.kategori === 'komentar'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : notif.kategori === 'profil'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {notif.kategori === 'izin' ? (
                        <FileText className="w-4 h-4" />
                      ) : notif.kategori === 'komentar' ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : notif.kategori === 'profil' ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {getCategoryBadge(notif.kategori)}
                          {!notif.dibaca && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Belum Dibaca" />
                          )}
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notif.waktu}
                          </span>
                        </div>

                        {/* Top action: delete / mark read */}
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          {!notif.dibaca && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notif.id);
                              }}
                              className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                              title="Tandai dibaca"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                        {notif.judul}
                      </h4>

                      <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                        {notif.pesan}
                      </p>

                      {notif.senderName && (
                        <div className="mt-2 flex items-center space-x-2 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <User className="w-3 h-3" />
                            {notif.senderName} ({notif.senderRole || 'Wali Santri'})
                          </span>
                        </div>
                      )}

                      {/* Action Bar for Izin & Komentar */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100/80 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center space-x-2">
                          {isIzinPending && (
                            <button
                              onClick={(e) => handleApproveIzin(e, notif)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Setujui Izin</span>
                            </button>
                          )}

                          {notif.targetMenu && (
                            <button
                              onClick={() => handleActionClick(notif)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>
                                {notif.kategori === 'izin' 
                                  ? 'Buka Menu Perizinan' 
                                  : notif.kategori === 'komentar' 
                                  ? 'Buka Galeri Foto & Balas' 
                                  : notif.kategori === 'profil'
                                  ? 'Lihat Data Santri'
                                  : 'Lihat Detail'}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {!notif.dibaca && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                            Perlu Perhatian
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sistem Pemantauan Notifikasi RTQ Cendikia Aktif</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Real-time update</span>
        </div>
      </div>
    </div>
  );
};
