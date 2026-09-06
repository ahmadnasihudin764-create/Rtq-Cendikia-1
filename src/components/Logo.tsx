import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Edit3 } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  lightText?: boolean;
  centerText?: boolean;
  customSrc?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false,
  lightText = false,
  centerText = false,
  customSrc,
  editable = false,
  onEdit
}) => {
  const [imgError, setImgError] = useState(false);

  // Safely extract context if rendered inside AppProvider
  let appLogo = '/assets/logo.png';
  let isAdmin = false;
  let triggerEditModal: (() => void) | undefined = onEdit;

  try {
    const app = useApp();
    if (app) {
      appLogo = app.appLogo || '/assets/logo.png';
      isAdmin = app.currentUser?.role === 'Super Admin' || app.currentUser?.role === 'Admin' || app.currentUser?.role === 'Pengajar';
      if (!triggerEditModal) {
        triggerEditModal = () => app.setIsEditLogoModalOpen(true);
      }
    }
  } catch {
    // Rendered outside AppContext (e.g. standalone tests)
  }

  const effectiveSrc = customSrc !== undefined ? customSrc : (appLogo || '/assets/logo.png');

  // Reset error state when logo source changes
  React.useEffect(() => {
    setImgError(false);
  }, [effectiveSrc]);

  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
    '3xl': 'w-36 h-36'
  };

  const showEditButton = (editable || isAdmin) && triggerEditModal && (size === 'lg' || size === 'xl' || size === '2xl' || size === '3xl');

  return (
    <div className={`inline-flex ${centerText ? 'flex-col items-center text-center space-y-2' : 'items-center space-x-3'} ${className}`}>
      {/* Official RTQ Logo with Garuda Pancasila, Islamic Star & Al-Quran */}
      <div className={`${sizeMap[size]} flex-shrink-0 relative flex items-center justify-center group`}>
        {!imgError ? (
          <img 
            src={effectiveSrc} 
            alt="Logo Resmi RTQ Cendikia BAZNAS" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-sm select-none transition-transform duration-200 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="eager"
            decoding="async"
          />
        ) : (
          /* High-fidelity Vector Fallback */
          <svg 
            viewBox="0 0 500 500" 
            className="w-full h-full drop-shadow-sm" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Islamic 8-pointed star geometric pattern (Gold & Green) */}
            <g strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M250 25 L310 80 L385 60 L395 138 L470 165 L445 240 L495 300 L430 345 L440 425 L360 420 L320 485 L250 445 L180 485 L140 420 L60 425 L70 345 L5 300 L55 240 L30 165 L105 138 L115 60 L190 80 Z"
                stroke="#EAB308"
                strokeWidth="14"
                fill="#FFFFFF"
              />
              <path
                d="M250 55 L300 100 L360 85 L370 145 L430 170 L410 230 L450 280 L400 315 L405 375 L345 370 L310 420 L250 390 L190 420 L155 370 L95 375 L100 315 L50 280 L90 230 L70 170 L130 145 L140 85 L200 100 Z"
                stroke="#15803D"
                strokeWidth="14"
                fill="#FFFFFF"
              />
            </g>

            {/* Central Garuda Pancasila Emblem in Gold & Color */}
            <g id="garuda-emblem" transform="translate(135, 120) scale(0.46)">
              <path d="M70 200 C30 140 10 70 0 10 C30 30 70 70 100 120 C105 140 110 180 120 230 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="4"/>
              <path d="M430 200 C470 140 490 70 500 10 C470 30 430 70 400 120 C395 140 390 180 380 230 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="4"/>
              <path d="M120 230 C90 170 70 100 60 50 C90 80 120 130 140 180 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="4"/>
              <path d="M380 230 C410 170 430 100 440 50 C410 80 380 130 360 180 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="4"/>

              <path d="M250 40 C230 40 220 60 220 80 C220 110 230 130 250 140 C270 130 280 110 280 80 C280 60 270 40 250 40 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="4"/>
              <path d="M260 70 Q300 80 310 95 Q285 105 265 100 Z" fill="#CA8A04"/>
              <circle cx="260" cy="75" r="4" fill="#000"/>

              <path d="M180 150 L320 150 L320 250 Q320 320 250 350 Q180 320 180 250 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="8"/>
              <path d="M184 154 L250 154 L250 246 L184 246 Z" fill="#DC2626"/>
              <path d="M250 154 L316 154 L316 246 L250 246 Z" fill="#FFFFFF"/>
              <path d="M184 246 L250 246 L250 330 Q200 310 184 260 Z" fill="#FFFFFF"/>
              <path d="M250 246 L316 246 Q300 310 250 330 Z" fill="#DC2626"/>
              
              <path d="M225 220 L275 220 L275 270 L225 270 Z" fill="#000000"/>
              <polygon points="250,225 255,240 270,240 258,250 262,265 250,255 238,265 242,250 230,240 245,240" fill="#FACC15"/>

              <path d="M230 350 L210 430 L250 420 L290 430 L270 350 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="4"/>

              <path d="M150 390 Q250 410 350 390 Q370 420 350 430 Q250 440 150 430 Q130 420 150 390 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="4"/>
              <text x="250" y="416" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#000000" fontFamily="sans-serif">BHINNEKA TUNGGAL IKA</text>
            </g>

            <g id="open-quran" transform="translate(0, 310)">
              <path
                d="M250 110 C180 60 90 60 10 115 C70 90 160 85 240 115 Z"
                fill="#15803D"
              />
              <path
                d="M250 125 C170 75 90 80 20 135 C80 105 170 100 245 130 Z"
                fill="#16A34A"
              />
              <path
                d="M250 110 C320 60 410 60 490 115 C430 90 340 85 260 115 Z"
                fill="#15803D"
              />
              <path
                d="M250 125 C330 75 410 80 480 135 C420 105 330 100 255 130 Z"
                fill="#16A34A"
              />
              <path
                d="M244 110 L256 110 L253 145 L247 145 Z"
                fill="#14532D"
              />
            </g>
          </svg>
        )}

        {/* Quick Edit Overlay Button for Admin if enabled */}
        {showEditButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerEditModal?.();
            }}
            title="Edit Logo Aplikasi (Khusus Admin)"
            className="absolute -bottom-1 -right-1 p-1 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
          >
            <Edit3 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {showText && (
        <div className="leading-tight">
          <span className={`text-[10px] font-bold tracking-widest uppercase block ${lightText ? 'text-yellow-300' : 'text-emerald-700'}`}>
            Sistem Informasi Terpadu
          </span>
          <h1 className={`font-black tracking-tight leading-tight ${size === 'lg' || size === 'xl' || size === '2xl' || size === '3xl' ? 'text-lg' : 'text-sm'} ${lightText ? 'text-white' : 'text-gray-900'}`}>
            RTQ CENDIKIA BAZNAS
          </h1>
          <p className={`text-[11px] ${lightText ? 'text-emerald-200' : 'text-gray-500'}`}>
            Masjid Agung Darussalam
          </p>
        </div>
      )}
    </div>
  );
};
