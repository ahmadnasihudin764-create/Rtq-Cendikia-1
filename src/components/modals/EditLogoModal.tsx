import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  Link as LinkIcon,
  FileCheck,
  RotateCcw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../Logo';

export const EditLogoModal: React.FC = () => {
  const { 
    currentUser, 
    appLogo, 
    updateAppLogo, 
    resetAppLogo, 
    isEditLogoModalOpen, 
    setIsEditLogoModalOpen,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'preset'>('upload');
  const [previewLogo, setPreviewLogo] = useState<string>(appLogo || '/assets/logo.png');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light' | 'rapor'>('light');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isEditLogoModalOpen) {
      setPreviewLogo(appLogo || '/assets/logo.png');
      setInputUrl(appLogo?.startsWith('http') ? appLogo : '');
      setSelectedFile(null);
    }
  }, [isEditLogoModalOpen, appLogo]);

  if (!isEditLogoModalOpen) return null;

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Pengajar';

  const handleFileProcess = (file: File) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Format file tidak didukung. Harap gunakan format PNG, JPG, WEBP, atau SVG.', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar (maksimal 5MB).', 'error');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      
      // If SVG or small image, use directly
      if (file.type === 'image/svg+xml' || file.size < 500 * 1024) {
        setPreviewLogo(rawDataUrl);
        return;
      }

      // Optimize image using Canvas to ensure it stores cleanly in localStorage
      const img = new Image();
      img.onload = () => {
        const maxDim = 800; // 800px is more than enough for ultra-sharp logo display
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((maxDim / targetWidth) * targetHeight);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((maxDim / targetHeight) * targetWidth);
            targetHeight = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const optimizedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
          setPreviewLogo(optimizedDataUrl);
        } else {
          setPreviewLogo(rawDataUrl);
        }
      };
      img.onerror = () => {
        setPreviewLogo(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) {
      showToast('Masukkan URL gambar logo yang valid.', 'error');
      return;
    }
    setPreviewLogo(inputUrl.trim());
    showToast('Pratinjau URL logo dimuat. Klik "Simpan & Terapkan" untuk menyimpan.', 'info');
  };

  const handleSaveLogo = () => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mengubah logo.', 'error');
      return;
    }

    if (!previewLogo) {
      showToast('Pilih atau upload gambar logo terlebih dahulu.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = updateAppLogo(previewLogo);
      if (res.success) {
        setIsEditLogoModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat mereset logo.', 'error');
      return;
    }

    if (window.confirm('Kembalikan logo aplikasi ke Logo Resmi Standar RTQ Cendikia BAZNAS?')) {
      resetAppLogo();
      setPreviewLogo('/assets/logo.png');
      setSelectedFile(null);
      setInputUrl('');
      setIsEditLogoModalOpen(false);
    }
  };

  return (
    <div 
      id="modal-edit-logo-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="modal-edit-logo-card"
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-emerald-900/20 my-auto text-gray-800"
      >
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md shadow-emerald-950/20 flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  Pengaturan & Edit Logo Resmi Lembaga
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950">
                  Khusus Admin
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Ubah logo institusi yang tampil di Header, Sidebar, Login, Cetak Rapor, dan Kartu Santri
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditLogoModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Guard Notice if not Admin */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Akses Terbatas Administrator</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Fitur penggantian logo resmi aplikasi hanya dapat diakses dan diubah oleh akun dengan hak akses <strong>Super Admin</strong> atau <strong>Admin</strong>.
              </p>
            </div>
            <button
              onClick={() => setIsEditLogoModalOpen(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center space-x-2 transition ${
                  activeTab === 'upload' 
                    ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File Gambar</span>
              </button>

              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center space-x-2 transition ${
                  activeTab === 'url' 
                    ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Input URL Gambar</span>
              </button>

              <button
                onClick={() => setActiveTab('preset')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center space-x-2 transition ${
                  activeTab === 'preset' 
                    ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Preset & Default</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4">
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-700 bg-emerald-50 scale-101'
                      : 'border-gray-300 hover:border-emerald-600 hover:bg-gray-50/80 bg-gray-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                    Klik untuk memilih file logo atau Tarik & Lepas disini
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Mendukung format PNG (transparan disarankan), JPG, WEBP, atau SVG (Maks. 5MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    Tautan / URL Gambar Logo Online:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/logo-rtq.png"
                      className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition"
                    >
                      Muat URL
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pastikan tautan dapat diakses secara publik dan memiliki ekstensi gambar (.png / .jpg / .svg).
                  </p>
                </div>
              )}

              {activeTab === 'preset' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => {
                      setPreviewLogo('/assets/logo.png');
                      setSelectedFile(null);
                      setInputUrl('');
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center space-x-3 ${
                      previewLogo === '/assets/logo.png' 
                        ? 'border-emerald-700 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-xl p-1 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <img src="/assets/logo.png" alt="Logo RTQ" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-gray-900">Logo Resmi RTQ Cendikia</h5>
                      <p className="text-[10px] text-gray-500">Logo standar BAZNAS & Masjid Agung Darussalam</p>
                    </div>
                    {previewLogo === '/assets/logo.png' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    )}
                  </div>

                  <div 
                    onClick={handleResetToDefault}
                    className="p-3.5 rounded-2xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50/60 cursor-pointer transition flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-rose-900">Reset Total Logo</h5>
                      <p className="text-[10px] text-rose-600">Hapus kustomisasi & kembalikan ke default</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE PREVIEW STUDIO */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Studio Pratinjau Tampilan Logo
                  </h4>
                </div>

                {/* Theme Selector for Preview */}
                <div className="flex items-center bg-gray-200/80 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setPreviewTheme('light')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      previewTheme === 'light' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Header (Terang)
                  </button>
                  <button
                    onClick={() => setPreviewTheme('dark')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      previewTheme === 'dark' ? 'bg-emerald-950 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sidebar (Gelap)
                  </button>
                  <button
                    onClick={() => setPreviewTheme('rapor')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      previewTheme === 'rapor' ? 'bg-white text-emerald-950 border border-emerald-300 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Kop Rapor
                  </button>
                </div>
              </div>

              {/* Dynamic Preview Canvas */}
              <div className="flex items-center justify-center p-4 rounded-xl transition-all duration-200 overflow-hidden">
                
                {/* 1. Header Look */}
                {previewTheme === 'light' && (
                  <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                        <img 
                          src={previewLogo} 
                          alt="Pratinjau Logo" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 block">
                          SISTEM INFORMASI PESANTREN
                        </span>
                        <h4 className="text-sm font-black text-gray-900 leading-tight">
                          RTQ CENDIKIA BAZNAS
                        </h4>
                        <p className="text-[10px] text-gray-500">Masjid Agung Darussalam</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                      T.A 2026/2027
                    </span>
                  </div>
                )}

                {/* 2. Sidebar Dark Look */}
                {previewTheme === 'dark' && (
                  <div className="w-full bg-emerald-950 p-4 rounded-2xl border border-emerald-800 shadow-inner flex items-center space-x-3 text-white">
                    <div className="w-12 h-12 bg-white/10 rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-white/10">
                      <img 
                        src={previewLogo} 
                        alt="Pratinjau Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-300 block">
                        SISTEM INFORMASI PESANTREN
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight">
                        RTQ CENDIKIA BAZNAS
                      </h4>
                      <p className="text-[10px] text-emerald-200">Masjid Agung Darussalam</p>
                    </div>
                  </div>
                )}

                {/* 3. Kop Rapor Look */}
                {previewTheme === 'rapor' && (
                  <div className="w-full bg-white p-4 rounded-xl border border-emerald-800 shadow-xs">
                    <div className="border-b-2 border-emerald-900 pb-2.5 flex items-center justify-between gap-3">
                      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <img 
                          src={previewLogo} 
                          alt="Pratinjau Kop Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-emerald-950 uppercase">
                          RTQ CENDIKIA BAZNAS
                        </h4>
                        <h5 className="text-[11px] font-bold text-emerald-900 uppercase">
                          MASJID AGUNG DARUSSALAM
                        </h5>
                        <p className="text-[9px] text-gray-500 font-sans mt-0.5">
                          Jln. Pangeran Mohammad Amin, Desa Muara Beliti Baru, Musi Rawas
                        </p>
                      </div>
                      <div className="w-10 h-10 border border-emerald-300 rounded flex items-center justify-center text-[7px] text-emerald-900 font-mono">
                        QR PASS
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Multi Size Grid */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-around text-center text-[10px] text-gray-500">
                <div className="space-y-1">
                  <div className="w-6 h-6 mx-auto flex items-center justify-center">
                    <img src={previewLogo} alt="Size xs" className="w-full h-full object-contain" />
                  </div>
                  <span>Kecil (24px)</span>
                </div>
                <div className="space-y-1">
                  <div className="w-9 h-9 mx-auto flex items-center justify-center">
                    <img src={previewLogo} alt="Size md" className="w-full h-full object-contain" />
                  </div>
                  <span>Sedang (36px)</span>
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-12 mx-auto flex items-center justify-center">
                    <img src={previewLogo} alt="Size lg" className="w-full h-full object-contain" />
                  </div>
                  <span>Besar (48px)</span>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center">
                    <img src={previewLogo} alt="Size xl" className="w-full h-full object-contain" />
                  </div>
                  <span>Ekstra Besar (64px)</span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gunakan Logo Default</span>
              </button>

              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditLogoModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-yellow-300" />
                  <span>Simpan & Terapkan Logo</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
