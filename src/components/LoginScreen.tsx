import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  LogIn,
  GraduationCap
} from 'lucide-react';
import { Logo } from './Logo';

export const LoginScreen: React.FC = () => {
  const { login, appLogo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username atau password tidak sesuai. Silakan periksa kembali.');
      return;
    }

    const res = login(username.trim(), password.trim(), rememberMe);
    if (!res.success) {
      setErrorMsg('Username atau password tidak sesuai. Silakan periksa kembali.');
    }
  };

  return (
    <div id="login-container" className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Background Decorative Islamic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-800/30 backdrop-blur-sm">
        
        {/* Top Gold & Emerald Accent Header Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-700"></div>

        <div className="p-6 sm:p-8">
          
          {/* 1. Logo Resmi RTQ Cendekia di Bagian Atas */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-white rounded-2xl border-2 border-amber-400/40 shadow-lg shadow-emerald-950/10 flex items-center justify-center mb-3.5 transition-transform hover:scale-105 duration-300">
              <Logo size="2xl" />
            </div>
            
            {/* Islamic Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gradient-to-r from-emerald-50 to-amber-50 text-emerald-900 text-[11px] font-bold rounded-full border border-amber-300/60 shadow-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="tracking-wide">RTQ CENDIKIA BAZNAS</span>
            </div>

            {/* 2. Judul & Subjudul Resmi */}
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {isAdminMode ? 'Login Pengurus & Admin' : 'Login Wali Santri'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium max-w-xs">
              {isAdminMode 
                ? 'Silakan masuk untuk mengelola data sistem pesantren' 
                : 'Silakan masuk untuk melihat informasi santri'}
            </p>
          </div>

          {/* Error Message Notification */}
          {errorMsg && (
            <div 
              id="login-error-alert"
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start space-x-3 animate-shake shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-bold text-xs mt-0.5">
                !
              </div>
              <div className="flex-1">
                <p className="font-semibold text-rose-800">Akses Masuk Ditolak</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            
            {/* Kolom 1: Nama Santri / Username */}
            <div>
              <label 
                htmlFor="login-username" 
                className="block text-xs font-bold text-emerald-950 mb-1.5 flex items-center justify-between"
              >
                <span>{isAdminMode ? 'Username Pengurus / Admin' : 'Nama Lengkap Santri / Anak'}</span>
                {!isAdminMode && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Sesuai Nama Terdaftar
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-emerald-600 pointer-events-none">
                  {isAdminMode ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                </div>
                <input
                  id="login-username"
                  name="santri_login_identity"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAdminMode ? 'Masukkan username admin...' : 'Username'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-gray-50/90 border border-emerald-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition font-medium text-gray-900 placeholder:text-gray-400 shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Kolom 2: Password */}
            <div>
              <label 
                htmlFor="login-password" 
                className="block text-xs font-bold text-emerald-950 mb-1.5"
              >
                Kata Sandi / Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-emerald-600 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="santri_login_secret"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-gray-50/90 border border-emerald-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition font-medium text-gray-900 placeholder:text-gray-400 shadow-xs"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-emerald-700 transition"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Opsi Ingat Saya */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                />
                <span className="font-medium text-gray-700 text-[11px] sm:text-xs">Ingat Saya di HP / perangkat ini</span>
              </label>
            </div>

            {/* Tombol Masuk */}
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/25 flex items-center justify-center space-x-2 cursor-pointer mt-3 border border-amber-400/30"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Masuk ke Dashboard Santri</span>
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setErrorMsg('');
              }}
              className="text-[11px] font-semibold text-gray-500 hover:text-emerald-700 transition"
            >
              {isAdminMode ? '← Kembali ke Login Wali Santri' : 'Masuk sebagai Pengurus / Ustadz?'}
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              &copy; 2026 RTQ Cendikia BAZNAS - Masjid Agung Darussalam
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
