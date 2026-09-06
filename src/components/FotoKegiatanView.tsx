import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Images, 
  Image as ImageIcon,
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  ZoomIn, 
  Download, 
  Search, 
  Eye, 
  Sparkles, 
  Check, 
  AlertCircle, 
  UploadCloud, 
  Layers,
  ArrowLeft,
  MessageCircle,
  Heart,
  Send,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkle,
  Smile,
  CornerDownRight,
  Filter,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  Maximize2
} from 'lucide-react';
import { FotoKegiatanRecord, FotoKomentar } from '../types';
import { processImageFile } from '../utils/imageStorage';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=800&auto=format&fit=crop&q=80';

export const FotoKegiatanView: React.FC = () => {
  const { 
    fotoKegiatanList, 
    addFotoKegiatan, 
    updateFotoKegiatan, 
    deleteFotoKegiatan, 
    addFotoKomentar,
    deleteFotoKomentar,
    toggleLikeFotoKomentar,
    toggleLikeFotoKegiatan,
    jadwalList,
    currentUser,
    santriList,
    showToast 
  } = useApp();

  // Role permissions
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Pengajar';
  const isWaliSantri = currentUser?.role === 'Wali Santri';

  // Find linked santri for Wali Santri if available
  const linkedSantri = currentUser?.santriNIS 
    ? santriList.find(s => s.NIS === currentUser.santriNIS)
    : (currentUser?.namaSantri ? santriList.find(s => s.Nama_Lengkap.toLowerCase() === currentUser.namaSantri?.toLowerCase()) : null);

  // Modal State for Add / Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FotoKegiatanRecord | null>(null);

  // Form inputs for Album
  const [formJudul, setFormJudul] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formKategori, setFormKategori] = useState<FotoKegiatanRecord['kategori']>('Wisuda & Tasmi\'');
  const [formLokasi, setFormLokasi] = useState('');
  const [formAgendaTerkait, setFormAgendaTerkait] = useState('');
  const [formJadwalId, setFormJadwalId] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formFotoList, setFormFotoList] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDetailOptions, setShowDetailOptions] = useState(false);

  // Lightbox / Detail Viewer State
  const [activeAlbum, setActiveAlbum] = useState<FotoKegiatanRecord | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showInfoSidebar, setShowInfoSidebar] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'komentar' | 'info'>('komentar');
  const [lightboxViewMode, setLightboxViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Comment Form State
  const [komentarText, setKomentarText] = useState('');
  const [customSenderName, setCustomSenderName] = useState('');
  const [isEditingSenderName, setIsEditingSenderName] = useState(false);
  const [tagToActivePhoto, setTagToActivePhoto] = useState(true);
  const [commentFilterPhoto, setCommentFilterPhoto] = useState<'all' | 'current'>('all');
  
  // Ref for auto-scroll comments
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Delete Confirmation State
  const [albumToDelete, setAlbumToDelete] = useState<FotoKegiatanRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default sender name calculation
  const defaultSenderName = isWaliSantri
    ? (currentUser?.nama ? `${currentUser.nama} (Wali dari ${linkedSantri?.Nama_Lengkap || currentUser?.namaSantri || 'Santri'})` : 'Wali Santri')
    : (currentUser?.nama || 'Pengunjung RTQ');

  const defaultSenderRole = currentUser?.role || 'Wali Santri';
  const defaultSantriInfo = isWaliSantri && linkedSantri
    ? `Wali dari ${linkedSantri.Nama_Lengkap} (${linkedSantri.NIS})`
    : (currentUser?.namaSantri ? `Wali dari ${currentUser.namaSantri}` : undefined);

  // Categories list
  const kategoriList = [
    'Semua',
    'Wisuda & Tasmi\'',
    'Halaqah & Pembelajaran',
    'Kajian & Tarbiyah',
    'Lomba & Prestasi',
    'Sosial & BAZNAS',
    'Lainnya'
  ];

  // Quick Doa / Apresiasi Chips
  const quickDoaPresets = [
    '🤲 Masya Allah Barakallah fiikum',
    '🌸 Alhamdulillah ananda membanggakan',
    '📖 Semangat muroja\'ah terus nak',
    '💖 Terima kasih Ustadz & Ustadzah atas bimbingannya',
    '🏆 Semoga istiqomah hafalan Al-Qur\'annya'
  ];

  // Curated Preset Photos for Quick Insert if desired
  const presetPhotos = [
    { label: 'Wisuda Santri', url: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Al-Qur\'an & Tasbih', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Halaqah Belajar', url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Doa Bersama', url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Masjid & Kajian', url: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Outbound Santri', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80' }
  ];

  // Keep activeAlbum synced with fotoKegiatanList in real time
  const currentAlbum = activeAlbum 
    ? fotoKegiatanList.find(a => a.id === activeAlbum.id) || activeAlbum 
    : null;

  // Handle Multi-file Upload from Local Device (File -> Optimized High Quality Base64)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray: File[] = Array.from(files);

    try {
      showToast(`Sedang memproses & mengoptimalkan ${fileArray.length} foto...`, 'info');
      const results = await Promise.all(
        fileArray.map((file) => processImageFile(file, 1920))
      );
      const newUrls = results.map((r) => r.url).filter(Boolean);

      if (newUrls.length > 0) {
        setFormFotoList((prev) => [...prev, ...newUrls]);
        showToast(`Alhamdulillah, ${newUrls.length} foto kegiatan berhasil ditambahkan ke formulir!`, 'success');
      } else {
        showToast('Tidak ada foto yang berhasil diproses. Mohon periksa format file.', 'warning');
      }
    } catch (err) {
      console.error('Error processing photo uploads:', err);
      showToast('Gagal memproses foto. Pastikan format file adalah gambar valid (JPG, PNG, WEBP).', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add URL Photo
  const handleAddUrlPhoto = () => {
    if (!customImageUrl.trim()) return;
    setFormFotoList(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    showToast('Tautan foto berhasil ditambahkan.', 'success');
  };

  // Remove single photo from form list
  const handleRemovePhotoFromForm = (index: number) => {
    setFormFotoList(prev => prev.filter((_, idx) => idx !== index));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormJudul('');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormKategori('Wisuda & Tasmi\'');
    setFormLokasi('Masjid Agung Darussalam');
    setFormAgendaTerkait('');
    setFormJadwalId('');
    setFormKeterangan('');
    setFormFotoList([]);
    setCustomImageUrl('');
    setShowDetailOptions(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: FotoKegiatanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormJudul(item.judul);
    setFormTanggal(item.tanggal);
    setFormKategori(item.kategori);
    setFormLokasi(item.lokasi || 'Masjid Agung Darussalam');
    setFormAgendaTerkait(item.agendaTerkait || '');
    setFormJadwalId(item.jadwalId || '');
    setFormKeterangan(item.keterangan || item.judul);
    setFormFotoList([...item.fotoList]);
    setCustomImageUrl('');
    setShowDetailOptions(false);
    setIsAddModalOpen(true);
  };

  // Handle Save / Submit Album
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) {
      showToast('Judul kegiatan wajib diisi!', 'warning');
      return;
    }
    if (formFotoList.length === 0) {
      showToast('Harap pilih atau upload minimal 1 foto kegiatan!', 'warning');
      return;
    }

    const tgl = formTanggal || new Date().toISOString().split('T')[0];
    const ket = formKeterangan.trim() || formJudul.trim();
    const lok = formLokasi.trim() || 'Masjid Agung Darussalam';
    const kat = formKategori || 'Wisuda & Tasmi\'';

    if (editingItem) {
      updateFotoKegiatan(editingItem.id, {
        judul: formJudul.trim(),
        tanggal: tgl,
        kategori: kat,
        lokasi: lok,
        agendaTerkait: formAgendaTerkait.trim() || undefined,
        jadwalId: formJadwalId || undefined,
        keterangan: ket,
        fotoList: formFotoList
      });
      if (activeAlbum?.id === editingItem.id) {
        setActiveAlbum({
          ...editingItem,
          judul: formJudul.trim(),
          tanggal: tgl,
          kategori: kat,
          lokasi: lok,
          agendaTerkait: formAgendaTerkait.trim() || undefined,
          jadwalId: formJadwalId || undefined,
          keterangan: ket,
          fotoList: formFotoList
        });
      }
      showToast('Perubahan foto kegiatan berhasil disimpan.', 'success');
    } else {
      const newAlbum: FotoKegiatanRecord = {
        id: 'FTO_' + Date.now(),
        judul: formJudul.trim(),
        tanggal: tgl,
        kategori: kat,
        lokasi: lok,
        agendaTerkait: formAgendaTerkait.trim() || undefined,
        jadwalId: formJadwalId || undefined,
        keterangan: ket,
        fotoList: formFotoList,
        penulis: currentUser?.nama || 'Admin RTQ',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        likes: 0,
        likedBy: [],
        komentarList: []
      };
      addFotoKegiatan(newAlbum);
      showToast('Foto kegiatan berhasil dipublikasikan!', 'success');
    }

    setIsAddModalOpen(false);
  };

  // Handle Request Delete Album
  const handleRequestDeleteAlbum = (album: FotoKegiatanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlbumToDelete(album);
    setIsDeleteModalOpen(true);
  };

  // Handle Confirm Delete Album
  const handleConfirmDeleteAlbum = () => {
    if (!albumToDelete) return;
    const albumId = albumToDelete.id;
    deleteFotoKegiatan(albumId);
    if (activeAlbum?.id === albumId) {
      setActiveAlbum(null);
    }
    if (editingItem?.id === albumId) {
      setIsAddModalOpen(false);
      setEditingItem(null);
    }
    setAlbumToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle Delete Currently Viewed Photo in Lightbox
  const handleDeleteCurrentPhotoInLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentAlbum) return;

    if (currentAlbum.fotoList.length <= 1) {
      handleRequestDeleteAlbum(currentAlbum);
      return;
    }

    const newFotoList = currentAlbum.fotoList.filter((_, idx) => idx !== activePhotoIndex);
    const updatedAlbum: FotoKegiatanRecord = {
      ...currentAlbum,
      fotoList: newFotoList
    };

    updateFotoKegiatan(currentAlbum.id, { fotoList: newFotoList });
    setActiveAlbum(updatedAlbum);
    setActivePhotoIndex(prev => (prev >= newFotoList.length ? Math.max(0, newFotoList.length - 1) : prev));
    showToast(`1 foto berhasil dihapus dari album. Sisa ${newFotoList.length} foto.`, 'info');
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!currentAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex(prev => (prev === currentAlbum.fotoList.length - 1 ? 0 : prev + 1));
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIndex(prev => (prev === 0 ? currentAlbum.fotoList.length - 1 : prev - 1));
        setZoomLevel(1);
      } else if (e.key === 'Escape') {
        handleCloseLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAlbum]);

  // Open Lightbox with specific Tab
  const handleOpenLightbox = (album: FotoKegiatanRecord, photoIndex = 0, initialTab: 'komentar' | 'info' = 'komentar', viewMode: 'carousel' | 'grid' = 'carousel') => {
    setActiveAlbum(album);
    setActivePhotoIndex(photoIndex);
    setZoomLevel(1);
    setShowInfoSidebar(true);
    setSidebarTab(initialTab);
    setLightboxViewMode(viewMode);
    setTagToActivePhoto(true);
  };

  // Close Lightbox
  const handleCloseLightbox = () => {
    setActiveAlbum(null);
    setActivePhotoIndex(0);
    setZoomLevel(1);
    setLightboxViewMode('carousel');
    setKomentarText('');
  };

  // Next & Prev Photo navigation
  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentAlbum || currentAlbum.fotoList.length <= 1) return;
    setActivePhotoIndex(prev => (prev === 0 ? currentAlbum.fotoList.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentAlbum || currentAlbum.fotoList.length <= 1) return;
    setActivePhotoIndex(prev => (prev === currentAlbum.fotoList.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  // Download / Save current photo
  const handleDownloadPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentAlbum) return;
    const currentPhoto = currentAlbum.fotoList[activePhotoIndex];
    if (!currentPhoto) return;

    try {
      const link = document.createElement('a');
      link.href = currentPhoto;
      link.download = `RTQ_${currentAlbum.judul.replace(/\s+/g, '_')}_Foto_${activePhotoIndex + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Mengunduh foto kegiatan...', 'info');
    } catch {
      window.open(currentPhoto, '_blank');
    }
  };

  // Submit Comment Handler
  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentAlbum) return;
    if (!komentarText.trim()) {
      showToast('Tuliskan komentar atau doa Anda terlebih dahulu!', 'warning');
      return;
    }

    const sender = customSenderName.trim() || defaultSenderName;
    addFotoKomentar(currentAlbum.id, {
      photoIndex: tagToActivePhoto ? activePhotoIndex : undefined,
      namaPengirim: sender,
      role: defaultSenderRole,
      santriInfo: defaultSantriInfo,
      pesan: komentarText.trim()
    });

    setKomentarText('');
    showToast(`Komentar Anda terkirim ${tagToActivePhoto ? `pada Foto #${activePhotoIndex + 1}` : 'pada Album'}!`, 'success');

    // Auto-scroll comments to bottom
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Quick Append Doa Preset
  const handleAddQuickDoa = (doa: string) => {
    setKomentarText(prev => prev ? `${prev} ${doa}` : doa);
  };

  // Filter comments for active album
  const albumComments: FotoKomentar[] = currentAlbum?.komentarList || [];
  const currentPhotoComments = albumComments.filter(k => k.photoIndex === activePhotoIndex);
  const generalOrOtherComments = albumComments.filter(k => k.photoIndex === undefined);

  const displayedComments = commentFilterPhoto === 'current'
    ? currentPhotoComments
    : albumComments;

  // Check if current user liked active album
  const currentUserId = currentUser?.username || currentUser?.nama || 'guest';
  const isAlbumLikedByMe = currentAlbum?.likedBy?.includes(currentUserId);

  return (
    <div id="foto-kegiatan-container" className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 p-6 sm:p-7 rounded-3xl text-white shadow-lg border border-emerald-700/60 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
          <Images className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-semibold border border-yellow-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dokumentasi & Galeri Foto RTQ Cendikia BAZNAS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Galeri Foto Kegiatan & Kolom Komentar Santri
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            {isWaliSantri ? (
              <span>
                🌸 <strong>Khusus Wali Santri:</strong> Bapak/Ibu dapat memantau dokumentasi tasmi', halaqah, dan aktivitas ananda santri secara lengkap, serta <strong>menuliskan doa, apresiasi, dan komentar</strong> pada setiap foto kegiatan.
              </span>
            ) : (
              <span>
                Dokumentasi resmi seluruh agenda pesantren, wisuda tahfidz, dan halaqah santri. Dilengkapi kolom apresiasi dan interaksi terbuka bagi seluruh Wali Santri & Asatidz.
              </span>
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              id="btn-upload-foto-kegiatan"
              onClick={() => handleOpenAddModal()}
              className="w-full sm:w-auto px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              <span>+ Upload Foto Kegiatan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Albums Grid View */}
      {fotoKegiatanList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fotoKegiatanList.map((album) => {
            const coverPhoto = album.fotoList[0] || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=600&auto=format&fit=crop&q=80';
            const photoCount = album.fotoList.length;
            const commentsCount = album.komentarList?.length || 0;
            const likesCount = album.likes || 0;
            const isLiked = album.likedBy?.includes(currentUserId);

            return (
              <div
                key={album.id}
                id={`card-album-${album.id}`}
                onClick={() => handleOpenLightbox(album, 0, 'komentar')}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition duration-200 flex flex-col justify-between cursor-pointer relative"
              >
                {/* Image Cover Container */}
                <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                  <img
                    src={coverPhoto}
                    alt={album.judul}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition" />

                  {/* Photo Count Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-white/20">
                    <ImageIcon className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{photoCount} Foto</span>
                  </div>

                  {/* Date & Location on Image Footer */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="flex items-center space-x-3 text-[11px] text-emerald-100 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{album.tanggal}</span>
                      </span>
                      {album.lokasi && (
                        <span className="flex items-center space-x-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                          <span className="truncate">{album.lokasi}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug group-hover:text-emerald-800 transition line-clamp-2">
                      {album.judul}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {album.keterangan}
                    </p>
                  </div>

                  {/* Thumbnail Preview Bar & View All Photos Indicator */}
                  {photoCount > 1 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center space-x-1.5">
                        {album.fotoList.slice(0, 4).map((f, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLightbox(album, i);
                            }}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 bg-gray-100 flex-shrink-0 transition hover:scale-105 cursor-pointer shadow-2xs"
                            title={`Lihat Foto #${i + 1}`}
                          >
                            <img 
                              src={f} 
                              alt={`Thumbnail ${i + 1}`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          </button>
                        ))}
                        {photoCount > 4 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLightbox(album, 4, 'komentar', 'grid');
                            }}
                            className="h-10 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0 cursor-pointer transition hover:scale-105"
                            title={`Lihat seluruh ${photoCount} foto dalam galeri`}
                          >
                            +{photoCount - 4} Semua
                          </button>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Tersedia {photoCount} Foto Dokumentasi</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLightbox(album, 0, 'komentar', 'grid');
                          }}
                          className="text-emerald-800 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                        >
                          <LayoutGrid className="w-3 h-3" />
                          <span>Galeri Lengkap</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-emerald-600" />
                        <span>1 Foto Dokumentasi</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLightbox(album, 0);
                        }}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Buka Foto Penuh
                      </button>
                    </div>
                  )}

                  {/* Comments & Likes Summary Bar */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-gray-500 font-medium">
                      {/* Likes Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeFotoKegiatan(album.id);
                        }}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition cursor-pointer ${
                          isLiked ? 'text-rose-600 bg-rose-50 font-bold' : 'text-gray-500 hover:text-rose-600 hover:bg-gray-100'
                        }`}
                        title="Suka dokumentasi ini"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
                        <span>{likesCount}</span>
                      </button>

                      {/* Comments Badge */}
                      <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-bold">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{commentsCount} Komentar</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLightbox(album, 0, 'komentar');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Komentari</span>
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleOpenEditModal(album, e)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Album Foto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleRequestDeleteAlbum(album, e)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Album"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Images className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Belum Ada Foto Kegiatan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Dokumentasi foto kegiatan belum diunggah oleh pengelola pesantren.
          </p>
          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center space-x-2 cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Foto Sekarang</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX / FULLSCREEN PHOTO VIEWER DENGAN KOLOM KOMENTAR WALI      */}
      {/* ========================================================================= */}
      {currentAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full h-full flex flex-col max-h-screen overflow-hidden select-none">
            
            {/* Top Toolbar */}
            <div className="px-4 py-3 bg-black/75 border-b border-white/10 flex items-center justify-between text-white z-20">
              <div className="flex items-center space-x-3 truncate">
                <button
                  id="btn-close-lightbox-back"
                  onClick={handleCloseLightbox}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
                  title="Kembali ke Galeri"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
                <div className="truncate">
                  <h4 className="text-xs sm:text-sm font-bold truncate text-white">
                    {currentAlbum.judul}
                  </h4>
                  <p className="text-[10px] text-gray-400 flex items-center space-x-2">
                    <span>{currentAlbum.tanggal}</span>
                    <span>&bull;</span>
                    <span className="text-yellow-400 font-bold">
                      Foto {activePhotoIndex + 1} dari {currentAlbum.fotoList.length}
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {albumComments.length} Komentar
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* View Mode Toggle: Single Large Photo vs All Photos Grid */}
                {currentAlbum.fotoList.length > 1 && (
                  <button
                    onClick={() => {
                      setLightboxViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
                      setZoomLevel(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      lightboxViewMode === 'grid'
                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={lightboxViewMode === 'grid' ? "Kembali ke Tampilan Foto Besar" : `Tampilkan Semua ${currentAlbum.fotoList.length} Foto dalam Format Grid`}
                  >
                    {lightboxViewMode === 'grid' ? (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Foto Tunggal</span>
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="w-4 h-4 text-amber-300" />
                        <span className="hidden sm:inline">Semua Foto ({currentAlbum.fotoList.length})</span>
                      </>
                    )}
                  </button>
                )}

                {/* Like Album Button */}
                <button
                  onClick={() => toggleLikeFotoKegiatan(currentAlbum.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isAlbumLikedByMe ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-rose-600/80 text-white'
                  }`}
                  title="Suka Foto / Album Ini"
                >
                  <Heart className={`w-3.5 h-3.5 ${isAlbumLikedByMe ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">{currentAlbum.likes || 0} Suka</span>
                </button>

                {lightboxViewMode === 'carousel' && (
                  <button
                    onClick={() => setZoomLevel(prev => (prev < 2 ? prev + 0.25 : 1))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer text-xs"
                    title="Zoom Foto"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={handleDownloadPhoto}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer text-xs flex items-center space-x-1"
                  title="Unduh / Simpan Foto"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">Unduh</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(currentAlbum)}
                      className="p-2 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white transition cursor-pointer text-xs"
                      title="Edit Album"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteCurrentPhotoInLightbox}
                      className="p-2 rounded-xl bg-rose-600/70 hover:bg-rose-600 text-white transition cursor-pointer text-xs flex items-center space-x-1"
                      title={currentAlbum.fotoList.length > 1 ? "Hapus Foto Ini dari Album" : "Hapus Album Foto Ini"}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden lg:inline text-[11px]">Hapus Foto</span>
                    </button>
                  </>
                )}

                {/* Toggle Sidebar Button */}
                <button
                  onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                  className={`p-2 rounded-xl transition cursor-pointer text-xs flex items-center space-x-1.5 ${
                    showInfoSidebar ? 'bg-emerald-600 text-white font-bold' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Buka Kolom Komentar & Detail"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[11px] hidden sm:inline">Komentar ({albumComments.length})</span>
                </button>

                <button
                  onClick={handleCloseLightbox}
                  className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition cursor-pointer text-xs"
                  title="Tutup Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage & Sidebar */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Photo Display Stage */}
              <div className="flex-1 flex items-center justify-center p-2 sm:p-6 relative overflow-hidden bg-black/50">
                {lightboxViewMode === 'grid' ? (
                  /* ========================================================= */
                  /* ALL PHOTOS GRID GALLERY VIEW                             */
                  /* ========================================================= */
                  <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-yellow-300 flex items-center gap-2">
                          <LayoutGrid className="w-4 h-4" />
                          <span>Galeri Lengkap Dokumentasi ({currentAlbum.fotoList.length} Foto)</span>
                        </h4>
                        <p className="text-xs text-gray-400">
                          Klik pada foto manapun untuk melihat tampilan penuh, zoom, atau memberikan komentar khusus.
                        </p>
                      </div>
                      <button
                        onClick={() => setLightboxViewMode('carousel')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Tampilan Penuh</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-12">
                      {currentAlbum.fotoList.map((foto, idx) => {
                        const photoCommentsCount = albumComments.filter(k => k.photoIndex === idx).length;
                        const isCurrent = activePhotoIndex === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setActivePhotoIndex(idx);
                              setLightboxViewMode('carousel');
                              setZoomLevel(1);
                            }}
                            className={`group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 bg-zinc-900 shadow-md ${
                              isCurrent 
                                ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102' 
                                : 'border-white/10 hover:border-emerald-400 hover:scale-102'
                            }`}
                          >
                            <img
                              src={foto}
                              alt={`${currentAlbum.judul} - Foto ${idx + 1}`}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-108 transition duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition" />

                            {/* Badge Number */}
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                              <ImageIcon className="w-2.5 h-2.5 text-yellow-300" />
                              <span>#{idx + 1}</span>
                            </div>

                            {/* Comments Count Badge */}
                            {photoCommentsCount > 0 && (
                              <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <MessageCircle className="w-2.5 h-2.5" />
                                <span>{photoCommentsCount}</span>
                              </div>
                            )}

                            {/* Hover Action Overlay */}
                            <div className="absolute inset-x-2 bottom-2 text-white flex items-center justify-between text-[11px] font-bold opacity-90 group-hover:opacity-100">
                              <span className="text-yellow-300 group-hover:underline flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>Perbesar</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* SINGLE LARGE PHOTO CAROUSEL VIEW                          */
                  /* ========================================================= */
                  <>
                    {/* Navigation Left Arrow */}
                    {currentAlbum.fotoList.length > 1 && (
                      <button
                        onClick={handlePrevPhoto}
                        className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-emerald-600 text-white border border-white/20 shadow-xl transition cursor-pointer"
                        title="Foto Sebelumnya"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {/* Main Large Photo */}
                    <div 
                      className="w-full h-full flex items-center justify-center overflow-auto transition-transform duration-200 relative"
                      style={{ transform: `scale(${zoomLevel})` }}
                    >
                      <img
                        src={currentAlbum.fotoList[activePhotoIndex]}
                        alt={`${currentAlbum.judul} - Foto ${activePhotoIndex + 1}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        referrerPolicy="no-referrer"
                        className="max-h-[60vh] sm:max-h-[72vh] md:max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl transition duration-200"
                      />

                      {/* Photo Specific Tag Overlay */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 pointer-events-none">
                        <ImageIcon className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Foto #{activePhotoIndex + 1} dari {currentAlbum.fotoList.length}</span>
                        {currentPhotoComments.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] rounded-full">
                            💬 {currentPhotoComments.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Right Arrow */}
                    {currentAlbum.fotoList.length > 1 && (
                      <button
                        onClick={handleNextPhoto}
                        className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-emerald-600 text-white border border-white/20 shadow-xl transition cursor-pointer"
                        title="Foto Berikutnya"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Collapsible Info & Comments Sidebar */}
              {showInfoSidebar && (
                <div className="w-full md:w-96 lg:w-[420px] bg-zinc-950/95 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between overflow-hidden max-h-[50vh] md:max-h-full">
                  
                  {/* Sidebar Header Tabs */}
                  <div className="px-4 py-3 bg-zinc-900 border-b border-white/10 flex items-center justify-between text-white flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSidebarTab('komentar')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          sidebarTab === 'komentar'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Komentar & Doa ({albumComments.length})</span>
                      </button>

                      <button
                        onClick={() => setSidebarTab('info')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          sidebarTab === 'info'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Detail Kegiatan</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowInfoSidebar(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                      title="Sembunyikan Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TAB 1: KOMENTAR & DOA (WALI SANTRI & ASATIDZ) */}
                  {sidebarTab === 'komentar' && (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      
                      {/* Comments Filter Scope */}
                      <div className="px-4 py-2 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between text-xs text-gray-300 flex-shrink-0">
                        <div className="flex items-center space-x-1.5">
                          <Filter className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-semibold">Tampilkan:</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setCommentFilterPhoto('all')}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              commentFilterPhoto === 'all'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            Semua ({albumComments.length})
                          </button>
                          <button
                            onClick={() => setCommentFilterPhoto('current')}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              commentFilterPhoto === 'current'
                                ? 'bg-yellow-500 text-emerald-950 font-black'
                                : 'bg-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            Foto #{activePhotoIndex + 1} ({currentPhotoComments.length})
                          </button>
                        </div>
                      </div>

                      {/* Comments Scrollable List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-white">
                        {displayedComments.length > 0 ? (
                          displayedComments.map((comment) => {
                            const isMyComment = (currentUser?.id && comment.userId === currentUser.id) || 
                              (currentUser?.nama && comment.namaPengirim.includes(currentUser.nama));
                            const canDelete = isMyComment || isAdmin;
                            const isCommentLiked = comment.likedBy?.includes(currentUserId);

                            return (
                              <div
                                key={comment.id}
                                className={`p-3.5 rounded-2xl border transition ${
                                  comment.photoIndex === activePhotoIndex
                                    ? 'bg-emerald-950/40 border-emerald-600/40 shadow-xs'
                                    : 'bg-white/5 border-white/10'
                                }`}
                              >
                                {/* Comment Header */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start space-x-2.5 min-w-0">
                                    {/* Role Avatar */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ${
                                      comment.role === 'Pengajar'
                                        ? 'bg-amber-400 text-amber-950'
                                        : comment.role === 'Super Admin' || comment.role === 'Admin'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-emerald-600 text-white'
                                    }`}>
                                      {comment.role === 'Pengajar' ? (
                                        <GraduationCap className="w-4 h-4" />
                                      ) : comment.role === 'Super Admin' || comment.role === 'Admin' ? (
                                        <ShieldCheck className="w-4 h-4" />
                                      ) : (
                                        <User className="w-4 h-4" />
                                      )}
                                    </div>

                                    {/* Sender Info */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-bold text-xs text-white truncate">
                                          {comment.namaPengirim}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                          comment.role === 'Pengajar'
                                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                            : comment.role === 'Super Admin' || comment.role === 'Admin'
                                            ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                                            : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                                        }`}>
                                          {comment.role}
                                        </span>
                                      </div>

                                      {comment.santriInfo && (
                                        <p className="text-[10px] text-emerald-300 font-medium">
                                          {comment.santriInfo}
                                        </p>
                                      )}

                                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                                        <span>{comment.tanggal}</span>
                                        {comment.photoIndex !== undefined && (
                                          <>
                                            <span>&bull;</span>
                                            <button
                                              onClick={() => setActivePhotoIndex(comment.photoIndex!)}
                                              className="text-yellow-400 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                            >
                                              <ImageIcon className="w-2.5 h-2.5" />
                                              <span>Foto #{comment.photoIndex + 1}</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delete button */}
                                  {canDelete && (
                                    <button
                                      onClick={() => deleteFotoKomentar(currentAlbum.id, comment.id)}
                                      className="text-gray-500 hover:text-rose-400 p-1 rounded-lg transition cursor-pointer"
                                      title="Hapus komentar ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {/* Comment Message */}
                                <p className="text-xs text-gray-200 mt-2.5 leading-relaxed pl-10 whitespace-pre-wrap">
                                  {comment.pesan}
                                </p>

                                {/* Comment Actions Footer */}
                                <div className="mt-2.5 pt-2 border-t border-white/5 pl-10 flex items-center justify-between">
                                  <button
                                    onClick={() => toggleLikeFotoKomentar(currentAlbum.id, comment.id)}
                                    className={`flex items-center space-x-1 text-[11px] transition cursor-pointer ${
                                      isCommentLiked ? 'text-rose-400 font-bold' : 'text-gray-400 hover:text-rose-300'
                                    }`}
                                  >
                                    <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-rose-400' : ''}`} />
                                    <span>{comment.likes || 0} Suka</span>
                                  </button>

                                  {comment.photoIndex !== undefined && comment.photoIndex !== activePhotoIndex && (
                                    <button
                                      onClick={() => setActivePhotoIndex(comment.photoIndex!)}
                                      className="text-[10px] text-yellow-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                    >
                                      <span>Lihat Foto #{comment.photoIndex + 1}</span>
                                      <CornerDownRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 space-y-2 my-auto">
                            <div className="w-12 h-12 rounded-full bg-emerald-900/60 text-emerald-400 mx-auto flex items-center justify-center">
                              <MessageCircle className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-sm text-white">Belum Ada Komentar</h5>
                            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                              {commentFilterPhoto === 'current'
                                ? `Belum ada komentar khusus untuk Foto #${activePhotoIndex + 1}. Jadilah yang pertama memberikan doa!`
                                : 'Jadilah yang pertama memberikan doa dan apresiasi untuk ananda santri!'}
                            </p>
                          </div>
                        )}
                        <div ref={commentsEndRef} />
                      </div>

                      {/* Comment Input Box Section */}
                      <div className="p-3.5 bg-zinc-900 border-t border-white/10 flex-shrink-0 space-y-2.5">
                        
                        {/* Quick Doa Chips */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-yellow-300 font-bold block">
                            💡 Ucapan Cepat / Doa Santri:
                          </span>
                          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
                            {quickDoaPresets.map((doa, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleAddQuickDoa(doa)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-700 text-gray-200 hover:text-white text-[10px] whitespace-nowrap transition cursor-pointer border border-white/10"
                              >
                                {doa}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sender Identity Indicator */}
                        <div className="flex items-center justify-between text-[11px] text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="text-emerald-400 font-semibold">Berkomentar sebagai:</span>
                            {isEditingSenderName ? (
                              <input
                                type="text"
                                value={customSenderName}
                                onChange={(e) => setCustomSenderName(e.target.value)}
                                placeholder="Nama & Keterangan Wali..."
                                className="px-2 py-0.5 bg-black/60 border border-emerald-400 rounded text-white text-[11px] outline-none"
                              />
                            ) : (
                              <span className="font-bold text-white truncate">
                                {customSenderName || defaultSenderName}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isEditingSenderName && !customSenderName) {
                                setCustomSenderName(defaultSenderName);
                              }
                              setIsEditingSenderName(!isEditingSenderName);
                            }}
                            className="text-[10px] text-yellow-400 hover:underline cursor-pointer flex-shrink-0 ml-2"
                          >
                            {isEditingSenderName ? 'Simpan' : 'Ubah Nama'}
                          </button>
                        </div>

                        {/* Tag to Active Photo Checkbox */}
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tagToActivePhoto}
                              onChange={(e) => setTagToActivePhoto(e.target.checked)}
                              className="rounded accent-emerald-600"
                            />
                            <span>
                              Tandai komentar khusus untuk <strong>Foto #{activePhotoIndex + 1}</strong>
                            </span>
                          </label>

                          <span className="text-[10px] text-gray-500">
                            {tagToActivePhoto ? '📷 Foto Ini' : '🌐 Seluruh Album'}
                          </span>
                        </div>

                        {/* Input & Send Form */}
                        <form onSubmit={handleSendComment} className="flex items-end space-x-2">
                          <textarea
                            id="input-komentar-foto"
                            value={komentarText}
                            onChange={(e) => setKomentarText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment();
                              }
                            }}
                            placeholder="Tuliskan komentar, ucapan syukur, atau apresiasi untuk ananda santri..."
                            rows={2}
                            className="flex-1 p-2.5 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-gray-400 outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                          />
                          <button
                            id="btn-kirim-komentar-foto"
                            type="submit"
                            disabled={!komentarText.trim()}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md h-[54px] flex-shrink-0"
                          >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Kirim</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DETAIL KEGIATAN & JADWAL TERKAIT */}
                  {sidebarTab === 'info' && (
                    <div className="p-5 text-white flex-1 overflow-y-auto space-y-4">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-700/80 text-emerald-100 uppercase tracking-wider">
                          {currentAlbum.kategori}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2 leading-snug">
                          {currentAlbum.judul}
                        </h3>
                      </div>

                      <div className="space-y-2 text-xs text-gray-300 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span>Tanggal: <strong>{currentAlbum.tanggal}</strong></span>
                        </div>
                        {currentAlbum.lokasi && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span>Lokasi: <strong>{currentAlbum.lokasi}</strong></span>
                          </div>
                        )}
                        {currentAlbum.agendaTerkait && (
                          <div className="flex items-center space-x-2 text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Agenda: <strong>{currentAlbum.agendaTerkait}</strong></span>
                          </div>
                        )}
                        {currentAlbum.penulis && (
                          <div className="text-[11px] text-gray-400 pt-1 border-t border-white/10">
                            Dipublikasikan oleh: <strong className="text-gray-200">{currentAlbum.penulis}</strong>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <h5 className="text-[11px] font-bold text-yellow-400 mb-1.5 uppercase tracking-wider">
                          Keterangan / Ringkasan Dokumentasi
                        </h5>
                        <p className="text-xs text-gray-200 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                          {currentAlbum.keterangan}
                        </p>
                      </div>

                      {/* Photo Stats */}
                      <div className="p-3 bg-emerald-950/50 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>Statistik Album:</span>
                          <span className="text-yellow-400">{currentAlbum.fotoList.length} Foto Tersedia</span>
                        </div>
                        <p className="text-[11px] text-gray-300">
                          ❤️ <strong>{currentAlbum.likes || 0}</strong> Orang menyukai album ini &bull; 💬 <strong>{albumComments.length}</strong> Komentar & Doa dari Wali Santri.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
                        <span>Foto {activePhotoIndex + 1} dari {currentAlbum.fotoList.length}</span>
                        <button
                          onClick={() => setSidebarTab('komentar')}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Tulis Komentar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Thumbnails Carousel */}
            {currentAlbum.fotoList.length > 1 && (
              <div className="px-4 py-2 bg-black/85 border-t border-white/10 flex items-center justify-center space-x-2 overflow-x-auto scrollbar-none z-20">
                {currentAlbum.fotoList.map((foto, idx) => {
                  const photoHasComments = albumComments.some(k => k.photoIndex === idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActivePhotoIndex(idx);
                        setZoomLevel(1);
                      }}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-yellow-400 scale-105 shadow-md shadow-yellow-400/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={foto} 
                        alt={`Foto thumbnail ${idx + 1}`} 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      {photoHasComments && (
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM: UPLOAD / EDIT FOTO KEGIATAN (ADMIN ONLY)                      */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-emerald-100 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">
                    {editingItem ? 'Edit Album Foto Kegiatan' : 'Upload Foto Kegiatan Baru'}
                  </h4>
                  <p className="text-[11px] text-emerald-200">
                    Dokumentasi akan otomatis tampil di portal Wali Santri dan aplikasi RTQ.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              
              {/* Judul Kegiatan (Utama & Fokus) */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <label className="block font-bold text-gray-800 text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Judul Kegiatan
                  </span>
                  <span className="text-xs text-rose-500 font-bold">*Wajib Diisi</span>
                </label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Wisuda Tahfidz & Tasmi' Juz 30 Santri RTQ Cendikia"
                  required
                  autoFocus
                  className="w-full p-3 bg-white border border-emerald-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-bold text-gray-900 text-sm shadow-xs transition"
                />
                <p className="text-[11px] text-emerald-800 font-medium">
                  Cukup ketik judul kegiatan dan pilih foto untuk langsung mempublikasikannya.
                </p>
              </div>

              {/* Toggle Opsi Pengaturan Tambahan (Opsional) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDetailOptions(!showDetailOptions)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <span>{showDetailOptions ? '− Sembunyikan Opsi Tambahan' : '+ Opsi Tambahan (Tanggal, Kategori, Lokasi, Keterangan)'}</span>
                </button>
              </div>

              {/* Accordion Detail Tambahan */}
              {showDetailOptions && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
                  {/* Tanggal & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Tanggal Kegiatan
                      </label>
                      <input
                        type="date"
                        value={formTanggal}
                        onChange={(e) => setFormTanggal(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Kategori Kegiatan
                      </label>
                      <select
                        value={formKategori}
                        onChange={(e) => setFormKategori(e.target.value as FotoKegiatanRecord['kategori'])}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="Wisuda & Tasmi'">Wisuda & Tasmi'</option>
                        <option value="Halaqah & Pembelajaran">Halaqah & Pembelajaran</option>
                        <option value="Kajian & Tarbiyah">Kajian & Tarbiyah</option>
                        <option value="Lomba & Prestasi">Lomba & Prestasi</option>
                        <option value="Sosial & BAZNAS">Sosial & BAZNAS</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Lokasi Kegiatan */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Lokasi Kegiatan
                    </label>
                    <input
                      type="text"
                      value={formLokasi}
                      onChange={(e) => setFormLokasi(e.target.value)}
                      placeholder="Contoh: Masjid Agung Darussalam"
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Keterangan / Deskripsi */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Keterangan / Deskripsi Kegiatan (Opsional)
                    </label>
                    <textarea
                      value={formKeterangan}
                      onChange={(e) => setFormKeterangan(e.target.value)}
                      placeholder="Jika dikosongkan, akan otomatis menggunakan Judul Kegiatan..."
                      rows={2}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Koleksi Foto Kegiatan ({formFotoList.length} Terpilih)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>

                {/* Drag & Drop / File Input Trigger */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">
                      {isUploading ? 'Sedang Memproses Foto...' : 'Klik untuk Pilih Satu / Banyak Foto dari Galeri HP / Komputer'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Mendukung format JPG, PNG, WEBP (Bisa pilih beberapa foto sekaligus)
                    </p>
                  </div>
                </div>

                {/* Or add via URL */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Atau masukkan tautan URL gambar (opsional)..."
                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlPhoto}
                    disabled={!customImageUrl.trim()}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    + Tambah URL
                  </button>
                </div>

                {/* Quick Preset Samples */}
                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                    Atau gunakan contoh foto dokumentasi siap pakai:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetPhotos.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormFotoList(prev => [...prev, preset.url]);
                          showToast(`Foto ${preset.label} ditambahkan.`, 'success');
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 rounded-lg text-[10px] font-semibold text-gray-700 transition cursor-pointer border border-gray-200"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Grid of Selected Photos */}
                {formFotoList.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-700 block">
                      Daftar Foto yang akan diupload (Foto pertama jadi Cover Album):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                      {formFotoList.map((fotoUrl, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                          <img 
                            src={fotoUrl} 
                            alt={`Foto ${idx + 1}`} 
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromForm(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 hover:scale-110 transition cursor-pointer"
                            title="Hapus foto ini"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 right-1 text-center bg-black/70 text-yellow-300 text-[8px] font-bold py-0.5 rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                {editingItem && isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteAlbum(editingItem)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Album Ini</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold shadow-md cursor-pointer transition flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses Foto...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingItem ? 'Simpan Perubahan' : 'Publikasikan Foto Kegiatan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS ALBUM FOTO KEGIATAN                                */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && albumToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-rose-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Hapus Album Foto?</h4>
                  <p className="text-[11px] text-rose-200">Konfirmasi penghapusan dokumentasi</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAlbumToDelete(null);
                }}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-900 text-xs">
                    Tindakan ini tidak dapat dibatalkan!
                  </p>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Album dokumentasi beserta seluruh foto ({albumToDelete.fotoList.length} foto) akan dihapus secara permanen dari sistem galeri RTQ.
                  </p>
                </div>
              </div>

              {/* Album Preview Box */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center space-x-3">
                {albumToDelete.fotoList[0] && (
                  <img
                    src={albumToDelete.fotoList[0]}
                    alt={albumToDelete.judul}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-300 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {albumToDelete.kategori}
                  </span>
                  <p className="font-bold text-gray-900 text-xs truncate mt-1">
                    {albumToDelete.judul}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {albumToDelete.tanggal} &bull; {albumToDelete.fotoList.length} Foto
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAlbumToDelete(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer transition text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAlbum}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer transition flex items-center space-x-1.5 text-xs active:scale-98"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
