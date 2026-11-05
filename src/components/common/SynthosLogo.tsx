import React from 'react';

export interface SynthosLogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal' | 'stacked';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
}

export const SynthosLogo: React.FC<SynthosLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'auto',
  showTagline = true
}) => {
  // Dimension presets
  const sizeMap: Record<string, { icon: number; text: string; sub: string }> = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 84, text: 'text-3xl', sub: 'text-sm' }
  };

  const dim = typeof size === 'number'
    ? { icon: size, text: 'text-base', sub: 'text-[10px]' }
    : sizeMap[size] || sizeMap.md;

  const isDarkBg = theme === 'dark';

  // SVG Emblem reproducing the new logo:
  // - Flowing 'S' ribbon figure-8
  // - Top loop: purple-to-blue gradient with 3 light cyan horizontal DNA rungs
  // - Bottom loop: teal-to-emerald gradient with 3 light cyan horizontal DNA rungs
  // - Center human silhouette head/body integrated on the spine
  // - Tilted orbital electron ring with glowing orbiting nodes
  const renderEmblem = (s: number) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      <defs>
        {/* Top Purple-to-Indigo Ribbon Gradient */}
        <linearGradient id="topRibbonGrad" x1="60" y1="20" x2="160" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Bottom Teal-to-Cyan-to-Emerald Ribbon Gradient */}
        <linearGradient id="botRibbonGrad" x1="140" y1="90" x2="40" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="35%" stopColor="#0ea5e9" />
          <stop offset="70%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Central Human Silhouette Gradient */}
        <linearGradient id="humanGrad" x1="70" y1="50" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Orbital Ring Diagonal Gradient */}
        <linearGradient id="orbitGrad" x1="20" y1="120" x2="180" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
        </linearGradient>

        {/* Target 'O' Iris Gradient */}
        <radialGradient id="targetIrisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </radialGradient>
      </defs>

      {/* 1. Tilted Orbital Electron Ellipse */}
      <ellipse
        cx="100"
        cy="100"
        rx="86"
        ry="28"
        transform="rotate(-24 100 100)"
        stroke="url(#orbitGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="180 8 4 8"
      />

      {/* Left Orbiting Electron / Atom (Teal/Mint) */}
      <circle
        cx="22"
        cy="114"
        r="6"
        fill="#2dd4bf"
        filter="drop-shadow(0 0 4px rgba(45,212,191,0.6))"
      />

      {/* Right Orbiting Electron / Atom (Lavender/Purple) */}
      <circle
        cx="178"
        cy="86"
        r="5.5"
        fill="#c084fc"
        filter="drop-shadow(0 0 4px rgba(192,132,252,0.6))"
      />

      {/* 2. Top Loop: DNA Horizontal Rungs (3 bars with rounded pill ends) */}
      <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" opacity="0.95">
        <line x1="102" y1="52" x2="136" y2="52" />
        <circle cx="102" cy="52" r="3.5" fill="#38bdf8" />
        <circle cx="136" cy="52" r="3.5" fill="#38bdf8" />

        <line x1="104" y1="68" x2="142" y2="68" />
        <circle cx="104" cy="68" r="3.5" fill="#38bdf8" />
        <circle cx="142" cy="68" r="3.5" fill="#38bdf8" />

        <line x1="106" y1="84" x2="138" y2="84" />
        <circle cx="106" cy="84" r="3.5" fill="#38bdf8" />
        <circle cx="138" cy="84" r="3.5" fill="#38bdf8" />
      </g>

      {/* 3. Bottom Loop: DNA Horizontal Rungs (3 bars with rounded pill ends) */}
      <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" opacity="0.95">
        <line x1="62" y1="122" x2="98" y2="122" />
        <circle cx="62" cy="122" r="3.5" fill="#38bdf8" />
        <circle cx="98" cy="122" r="3.5" fill="#38bdf8" />

        <line x1="58" y1="138" x2="96" y2="138" />
        <circle cx="58" cy="138" r="3.5" fill="#38bdf8" />
        <circle cx="96" cy="138" r="3.5" fill="#38bdf8" />

        <line x1="64" y1="154" x2="94" y2="154" />
        <circle cx="64" cy="154" r="3.5" fill="#38bdf8" />
        <circle cx="94" cy="154" r="3.5" fill="#38bdf8" />
      </g>

      {/* 4. The Human Silhouette Profile on Inner Spine */}
      {/* Head */}
      <circle cx="78" cy="68" r="9" fill="url(#humanGrad)" />
      {/* Neck & Shoulder Silhouette */}
      <path
        d="M 78,80 C 78,86 70,96 70,105 C 70,115 80,122 88,118 C 96,114 94,102 90,92 C 86,82 78,80 78,80 Z"
        fill="url(#humanGrad)"
      />

      {/* 5. Main Flowing 'S' Ribbon (Top Purple Loop + Bottom Teal Loop) */}
      {/* Top Arc and Outer Loop */}
      <path
        d="M 92,102 C 104,116 122,126 138,114 C 158,98 160,60 142,38 C 126,18 94,18 84,36 C 76,50 84,72 96,86 C 108,100 126,116 124,136 C 122,156 102,174 76,172 C 52,170 42,148 46,128 C 48,118 54,112 56,110"
        stroke="url(#topRibbonGrad)"
        strokeWidth="19"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom Arc Accent for high-depth overlap */}
      <path
        d="M 96,86 C 108,100 126,116 124,136 C 122,156 102,174 76,172 C 52,170 42,148 46,128 C 48,118 54,112 56,110 C 60,128 72,148 94,146 C 114,144 116,130 114,122 C 110,108 92,94 84,82"
        stroke="url(#botRibbonGrad)"
        strokeWidth="19"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  // Stylized Wordmark:
  // "SYNTHOS" with stylized target/iris 'O'
  const renderWordmark = () => (
    <div className="flex flex-col">
      <div className="flex items-center tracking-[0.22em] font-extrabold uppercase select-none leading-none">
        <span className={isDarkBg ? 'text-white' : 'text-slate-900'}>S</span>
        {/* Stylized Y with subtle cyan accent */}
        <span className="text-[#14B8A6] font-black">Y</span>
        <span className={isDarkBg ? 'text-white' : 'text-slate-900'}>NTH</span>
        {/* Stylized 'O' target iris */}
        <span className="relative inline-flex items-center justify-center mx-[0.04em]">
          <span className={isDarkBg ? 'text-white' : 'text-slate-900'}>O</span>
          <span className="absolute w-[38%] h-[38%] rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
        </span>
        <span className={isDarkBg ? 'text-white' : 'text-slate-900'}>S</span>
      </div>

      {showTagline && (
        <span
          className={`font-['Plus_Jakarta_Sans'] font-medium tracking-wide mt-1 select-none leading-tight ${dim.sub} ${
            isDarkBg ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Where Biology Meets Its Other Self.
        </span>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(dim.icon)}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        {renderEmblem(dim.icon)}
        {renderWordmark()}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {renderEmblem(dim.icon)}
      <div className={`${dim.text}`}>
        {renderWordmark()}
      </div>
    </div>
  );
};
