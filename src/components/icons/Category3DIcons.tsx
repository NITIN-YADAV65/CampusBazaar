import React from 'react';

export interface CategoryIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// ============================================================================
// 1. BOOKS & STUDY MATERIAL
// Stack of colorful textbooks + notebook + pencil + gold ribbon bookmark
// ============================================================================
export const BooksStudyIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Books and Study Material"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="bk-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Bottom Book (Deep Sapphire Blue) */}
        <linearGradient id="bk-b-cover" x1="16" y1="52" x2="80" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.4" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="bk-b-spine" x1="16" y1="52" x2="24" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="bk-b-pages" x1="72" y1="54" x2="82" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Middle Book (Rich Forest Teal / Emerald) */}
        <linearGradient id="bk-m-cover" x1="18" y1="38" x2="78" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="0.5" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
        <linearGradient id="bk-m-spine" x1="18" y1="38" x2="26" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="bk-m-pages" x1="70" y1="40" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Top Book (Vibrant Crimson / Coral) */}
        <linearGradient id="bk-t-cover" x1="22" y1="23" x2="74" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="0.45" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="bk-t-spine" x1="22" y1="23" x2="30" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="bk-t-pages" x1="68" y1="26" x2="76" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>

        {/* Spiral Notebook (Lilac / Periwinkle) */}
        <linearGradient id="bk-nb-cover" x1="28" y1="12" x2="68" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Gold Ribbon Bookmark */}
        <linearGradient id="bk-ribbon" x1="42" y1="26" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="0.5" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Pencil Body & Tip */}
        <linearGradient id="bk-penc-body" x1="66" y1="14" x2="86" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="bk-penc-ferrule" x1="82" y1="14" x2="88" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="bk-penc-eraser" x1="86" y1="12" x2="90" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>

      {/* Ground Soft Contact Shadow */}
      <ellipse cx="50" cy="71" rx="38" ry="6" fill="url(#bk-floor-shd)" />

      {/* BOTTOM BOOK (Navy) */}
      <g>
        <rect x="18" y="54" width="58" height="13" rx="3" fill="url(#bk-b-cover)" />
        {/* Spine Curvature & Highlight */}
        <path d="M18 57C18 55.3 19.3 54 21 54H25V67H21C19.3 67 18 65.7 18 64V57Z" fill="url(#bk-b-spine)" />
        {/* Page Block Edge */}
        <path d="M72 55.5H79C80.1 55.5 81 56.4 81 57.5V63.5C81 64.6 80.1 65.5 79 65.5H72V55.5Z" fill="url(#bk-b-pages)" />
        <line x1="74" y1="58" x2="79" y2="58" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="74" y1="61" x2="79" y2="61" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="74" y1="64" x2="78" y2="64" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        {/* Cover Gold Emboss Lines */}
        <line x1="28" y1="58.5" x2="68" y2="58.5" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
        <line x1="28" y1="62.5" x2="52" y2="62.5" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      </g>

      {/* MIDDLE BOOK (Teal, shifted slightly left) */}
      <g>
        <rect x="15" y="40" width="59" height="13" rx="3" fill="url(#bk-m-cover)" />
        {/* Spine */}
        <path d="M15 43C15 41.3 16.3 40 18 40H22V53H18C16.3 53 15 51.7 15 50V43Z" fill="url(#bk-m-spine)" />
        {/* Pages */}
        <path d="M70 41.5H77C78.1 41.5 79 42.4 79 43.5V49.5C79 50.6 78.1 51.5 77 51.5H70V41.5Z" fill="url(#bk-m-pages)" />
        <line x1="72" y1="44.5" x2="77" y2="44.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="72" y1="47.5" x2="77" y2="47.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="72" y1="50.5" x2="76" y2="50.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
        {/* Spine Decor */}
        <line x1="25" y1="44.5" x2="66" y2="44.5" stroke="#5eead4" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
        <line x1="25" y1="48.5" x2="50" y2="48.5" stroke="#2dd4bf" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      </g>

      {/* TOP BOOK (Coral, rotated slightly) */}
      <g transform="rotate(-3 44 32)">
        <rect x="20" y="26" width="53" height="12" rx="2.5" fill="url(#bk-t-cover)" />
        {/* Spine */}
        <path d="M20 28.5C20 27.1 21.1 26 22.5 26H26V38H22.5C21.1 38 20 36.9 20 35.5V28.5Z" fill="url(#bk-t-spine)" />
        {/* Pages */}
        <path d="M69 27.5H75C76.1 27.5 77 28.4 77 29.5V34.5C77 35.6 76.1 36.5 75 36.5H69V27.5Z" fill="url(#bk-t-pages)" />
        <line x1="71" y1="30" x2="75" y2="30" stroke="#fdba74" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="71" y1="33" x2="75" y2="33" stroke="#fdba74" strokeWidth="0.8" strokeLinecap="round" />
        {/* Highlights */}
        <line x1="28" y1="30" x2="65" y2="30" stroke="#ffedd5" strokeWidth="1" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="28" y1="34" x2="48" y2="34" stroke="#fed7aa" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      </g>

      {/* SLANTED SPIRAL NOTEBOOK ON TOP */}
      <g transform="rotate(4 48 18)">
        <rect x="27" y="14" width="42" height="10" rx="2" fill="url(#bk-nb-cover)" />
        <rect x="27" y="14" width="6" height="10" rx="1.5" fill="#4338ca" />
        {/* Spiral Rings */}
        <circle cx="28.5" cy="16" r="1.1" fill="#e2e8f0" />
        <circle cx="28.5" cy="19" r="1.1" fill="#e2e8f0" />
        <circle cx="28.5" cy="22" r="1.1" fill="#e2e8f0" />
        {/* Notebook Title Stripe */}
        <rect x="36" y="16.5" width="28" height="5" rx="1" fill="#ffffff" fillOpacity="0.85" />
        <line x1="39" y1="19" x2="58" y2="19" stroke="#6366f1" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* GOLDEN BOOKMARK RIBBON (hanging from top book down) */}
      <path
        d="M44 26V49L47.5 46L51 49V26H44Z"
        fill="url(#bk-ribbon)"
        filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
      />

      {/* PENCIL (Angled diagonally on right) */}
      <g transform="rotate(-36 78 30)">
        {/* Main Body */}
        <rect x="68" y="27" width="22" height="3.5" rx="0.5" fill="url(#bk-penc-body)" />
        {/* Sharpened Wood Point */}
        <polygon points="68,27 63,28.75 68,30.5" fill="#fde68a" />
        {/* Graphite Tip */}
        <polygon points="64.5,28.2 63,28.75 64.5,29.3" fill="#334155" />
        {/* Silver Ferrule */}
        <rect x="90" y="27" width="3" height="3.5" fill="url(#bk-penc-ferrule)" />
        {/* Pink Eraser */}
        <rect x="93" y="27" width="2.5" height="3.5" rx="1" fill="url(#bk-penc-eraser)" />
      </g>

      {/* Study Sparkle */}
      <path
        d="M21 21L22.2 24.8L26 26L22.2 27.2L21 31L19.8 27.2L16 26L19.8 24.8L21 21Z"
        fill="#fde047"
        opacity="0.9"
      />
    </svg>
  );
};

// ============================================================================
// 2. ELECTRONICS
// Modern open laptop + studio over-ear headphones + true-wireless gadget
// ============================================================================
export const ElectronicsIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Electronics"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="el-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Laptop Screen & Deck */}
        <linearGradient id="el-screen-bezel" x1="14" y1="20" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="el-screen-glow" x1="17" y1="23" x2="53" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="el-deck" x1="10" y1="49" x2="60" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e2e8f0" />
          <stop offset="0.5" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Headphones Headband & Earcups */}
        <linearGradient id="el-hp-band" x1="56" y1="15" x2="88" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="0.5" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="el-cup-l" x1="50" y1="36" x2="64" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="el-cup-r" x1="78" y1="36" x2="92" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Wireless Gadget / Earbuds Pebble */}
        <linearGradient id="el-pod-body" x1="50" y1="56" x2="66" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="50" cy="71" rx="42" ry="6.5" fill="url(#el-floor-shd)" />

      {/* 1. MODERN LAPTOP (Positioned Left/Center) */}
      <g>
        {/* Screen Bezel (Tilted slightly) */}
        <rect x="15" y="21" width="40" height="28" rx="2.5" fill="url(#el-screen-bezel)" />
        {/* Vivid Screen Wallpaper */}
        <rect x="17" y="23" width="36" height="24" rx="1.5" fill="url(#el-screen-glow)" />
        {/* Screen Wallpaper Waves */}
        <path d="M17 38C23 34 29 42 36 37C43 32 49 41 53 36V47H17V38Z" fill="#3b82f6" fillOpacity="0.55" />
        <path d="M17 42C24 37 32 44 40 39C47 35 50 43 53 40V47H17V42Z" fill="#ec4899" fillOpacity="0.45" />
        {/* Camera Dot */}
        <circle cx="35" cy="22" r="0.6" fill="#64748b" />

        {/* Lower Base Deck (Perspective trapezoid) */}
        <polygon points="12,52 58,52 64,57 6,57" fill="url(#el-deck)" />
        {/* Trackpad */}
        <rect x="30" y="53.5" width="10" height="2.2" rx="0.5" fill="#64748b" fillOpacity="0.5" />
        {/* Deck Front Lip */}
        <polygon points="6,57 64,57 63,58.5 7,58.5" fill="#64748b" />
      </g>

      {/* 2. OVER-EAR STUDIO HEADPHONES (Positioned Right/Foreground) */}
      <g>
        {/* Headband Arc */}
        <path
          d="M58 42C58 26 66 18 76 18C86 18 94 26 94 42"
          stroke="url(#el-hp-band)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Inner Comfort Padding */}
        <path
          d="M62 38C62 27 68 21 76 21C84 21 90 27 90 38"
          stroke="#4f46e5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* Left Earcup Slider & Gimbal */}
        <rect x="56" y="38" width="4" height="6" rx="1" fill="#94a3b8" />
        {/* Left Earcup */}
        <g>
          <ellipse cx="58" cy="47" rx="5.5" ry="9" fill="url(#el-cup-l)" />
          {/* Cushion */}
          <ellipse cx="60.5" cy="47" rx="2" ry="7.5" fill="#1e1b4b" />
          {/* Metallic Center Ring */}
          <ellipse cx="57" cy="47" rx="2.5" ry="5" fill="#6366f1" />
          <circle cx="57" cy="47" r="1.2" fill="#a5b4fc" />
        </g>

        {/* Right Earcup Slider & Gimbal */}
        <rect x="88" y="38" width="4" height="6" rx="1" fill="#94a3b8" />
        {/* Right Earcup */}
        <g>
          <ellipse cx="90" cy="47" rx="5.5" ry="9" fill="url(#el-cup-r)" />
          {/* Cushion */}
          <ellipse cx="87.5" cy="47" rx="2" ry="7.5" fill="#1e1b4b" />
          {/* Metallic Center Ring */}
          <ellipse cx="91" cy="47" rx="2.5" ry="5" fill="#6366f1" />
          <circle cx="91" cy="47" r="1.2" fill="#a5b4fc" />
        </g>
      </g>

      {/* 3. WIRELESS GADGET (Pebble Earbuds Case in Foreground) */}
      <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
        {/* Pebble Body */}
        <rect x="42" y="58" width="22" height="12" rx="6" fill="url(#el-pod-body)" />
        {/* Lid Seam */}
        <line x1="43" y1="62.5" x2="63" y2="62.5" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Glowing Status LED */}
        <circle cx="53" cy="65.5" r="1" fill="#06b6d4" />
        <circle cx="53" cy="65.5" r="2.2" fill="#22d3ee" fillOpacity="0.4" />
      </g>

      {/* Cyan Tech Sparkle */}
      <path
        d="M26 14L27 17.5L30.5 18.5L27 19.5L26 23L25 19.5L21.5 18.5L25 17.5L26 14Z"
        fill="#38bdf8"
      />
    </svg>
  );
};

// ============================================================================
// 3. MOBILES
// Two modern smartphones arranged at a stylish angle (Rear & Front views)
// ============================================================================
export const MobilesIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mobiles"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="mb-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Phone 1 (Back View - Space Black/Titanium) */}
        <linearGradient id="mb-p1-body" x1="24" y1="16" x2="52" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.4" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mb-p1-island" x1="27" y1="19" x2="41" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mb-lens" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" />
          <stop offset="0.5" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Phone 2 (Front View - Glowing Vibrant Screen) */}
        <linearGradient id="mb-p2-frame" x1="45" y1="18" x2="77" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="mb-p2-screen" x1="48" y1="20" x2="74" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="0.45" stopColor="#d946ef" />
          <stop offset="0.8" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Screen Sheen Glass Reflection */}
        <linearGradient id="mb-p2-sheen" x1="46" y1="20" x2="74" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="50" cy="71" rx="38" ry="6" fill="url(#mb-floor-shd)" />

      {/* PHONE 1: Rear View (Titanium Dark, angled left) */}
      <g transform="rotate(-6 38 41)">
        {/* Chassis Body */}
        <rect x="25" y="16" width="28" height="50" rx="6" fill="url(#mb-p1-body)" stroke="#475569" strokeWidth="0.8" />
        
        {/* Rear Camera Island */}
        <rect x="27.5" y="19" width="13" height="15" rx="3.5" fill="url(#mb-p1-island)" stroke="#334155" strokeWidth="0.6" />
        
        {/* Lens 1 (Top Left) */}
        <circle cx="32" cy="23.5" r="3" fill="url(#mb-lens)" stroke="#64748b" strokeWidth="0.7" />
        <circle cx="32" cy="23.5" r="1.3" fill="#0284c7" fillOpacity="0.8" />
        <circle cx="31.2" cy="22.7" r="0.6" fill="#ffffff" />

        {/* Lens 2 (Bottom Left) */}
        <circle cx="32" cy="29.5" r="3" fill="url(#mb-lens)" stroke="#64748b" strokeWidth="0.7" />
        <circle cx="32" cy="29.5" r="1.3" fill="#0284c7" fillOpacity="0.8" />
        <circle cx="31.2" cy="28.7" r="0.6" fill="#ffffff" />

        {/* Lens 3 (Right Center) */}
        <circle cx="37" cy="26.5" r="3" fill="url(#mb-lens)" stroke="#64748b" strokeWidth="0.7" />
        <circle cx="37" cy="26.5" r="1.3" fill="#0284c7" fillOpacity="0.8" />
        <circle cx="36.2" cy="25.7" r="0.6" fill="#ffffff" />

        {/* True-Tone Flash */}
        <circle cx="37" cy="21.5" r="1.2" fill="#fef08a" />
      </g>

      {/* PHONE 2: Front View (Vibrant OLED Screen, angled right & overlapping) */}
      <g transform="rotate(7 62 43)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))">
        {/* Outer Metal Frame */}
        <rect x="47" y="17" width="28" height="50" rx="6" fill="url(#mb-p2-frame)" stroke="#94a3b8" strokeWidth="0.8" />
        
        {/* Bezel Screen Area */}
        <rect x="48.5" y="18.5" width="25" height="47" rx="4.5" fill="#0f172a" />
        
        {/* Colorful OLED Wallpaper */}
        <rect x="49" y="19" width="24" height="46" rx="4" fill="url(#mb-p2-screen)" />

        {/* Wallpaper Abstract Flow Curves */}
        <path d="M49 38C54 32 63 44 73 36V65H49V38Z" fill="#a855f7" fillOpacity="0.45" />
        <path d="M49 46C56 40 65 50 73 45V65H49V46Z" fill="#fb7185" fillOpacity="0.4" />

        {/* Dynamic Island Pill Notch at Top */}
        <rect x="56" y="20.5" width="10" height="2.8" rx="1.4" fill="#000000" />
        <circle cx="63" cy="21.9" r="0.6" fill="#1e293b" />

        {/* Subtle Diagonal Glass Sheen Highlight */}
        <polygon points="49,19 73,19 49,42" fill="url(#mb-p2-sheen)" />

        {/* Bottom Home Indicator Bar */}
        <rect x="56.5" y="62.5" width="9" height="1" rx="0.5" fill="#ffffff" fillOpacity="0.75" />
      </g>

      {/* Sparkles / Connectivity Accents */}
      <path
        d="M78 14L79 17.5L82.5 18.5L79 19.5L78 23L77 19.5L73.5 18.5L77 17.5L78 14Z"
        fill="#f43f5e"
      />
      <circle cx="21" cy="28" r="1.2" fill="#ec4899" opacity="0.8" />
    </svg>
  );
};

// ============================================================================
// 4. LAPTOPS
// Premium open slim laptop with vibrant wallpaper display (3D perspective)
// ============================================================================
export const LaptopsIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Laptops"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="lp-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Display Lid Frame & Screen */}
        <linearGradient id="lp-lid-outer" x1="20" y1="15" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="lp-screen-bg" x1="23" y1="18" x2="77" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="0.35" stopColor="#6366f1" />
          <stop offset="0.7" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        {/* Laptop Base Deck */}
        <linearGradient id="lp-base-top" x1="12" y1="49" x2="88" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="lp-base-front" x1="10" y1="64" x2="90" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Ground Soft Shadow */}
      <ellipse cx="50" cy="71" rx="44" ry="6.5" fill="url(#lp-floor-shd)" />

      {/* TOP DISPLAY (Slightly angled back in 3D perspective) */}
      <g>
        {/* Outer Aluminum Lid */}
        <rect x="20" y="16" width="60" height="35" rx="3.5" fill="url(#lp-lid-outer)" stroke="#475569" strokeWidth="0.8" />
        
        {/* Screen Display Bezel */}
        <rect x="22.5" y="18.5" width="55" height="30" rx="2" fill="url(#lp-screen-bg)" />

        {/* Screen Wallpaper Landscape Waves */}
        <path d="M22.5 36C32 30 42 42 53 35C64 28 72 38 77.5 33V48.5H22.5V36Z" fill="#3b82f6" fillOpacity="0.5" />
        <path d="M22.5 41C34 35 46 45 58 39C68 34 74 43 77.5 40V48.5H22.5V41Z" fill="#f43f5e" fillOpacity="0.45" />

        {/* Web Camera Dot & Mic */}
        <circle cx="50" cy="17.2" r="0.6" fill="#94a3b8" />
        <circle cx="52" cy="17.2" r="0.3" fill="#64748b" />

        {/* Display Glass Sheen Angle Line */}
        <polygon points="22.5,18.5 46,18.5 22.5,42" fill="#ffffff" fillOpacity="0.16" />
      </g>

      {/* HINGE CYLINDER */}
      <rect x="34" y="49" width="32" height="2.5" rx="1.2" fill="#1e293b" />

      {/* LOWER BASE UNIT (3D Perspective Deck) */}
      <g>
        {/* Base Surface (Isometric perspective trapezoid) */}
        <polygon points="12,51 88,51 94,64 6,64" fill="url(#lp-base-top)" />
        
        {/* Recessed Keyboard Well */}
        <polygon points="18,52.5 82,52.5 86,59 14,59" fill="#334155" />
        
        {/* Keyboard Key Rows (Stylized sharp rows) */}
        <line x1="19" y1="54" x2="81" y2="54" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="17" y1="56" x2="83" y2="56" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="15.5" y1="58" x2="84.5" y2="58" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

        {/* Centered Glass Trackpad */}
        <polygon points="42,60 58,60 59,63.2 41,63.2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />

        {/* Base Front Lip & Display Notch */}
        <polygon points="6,64 94,64 93,66.5 7,66.5" fill="url(#lp-base-front)" />
        <rect x="46" y="64" width="8" height="1.2" rx="0.5" fill="#cbd5e1" />
      </g>

      {/* Floating Modern Star Sparkle */}
      <path
        d="M84 15L85 18L88 19L85 20L84 23L83 20L80 19L83 18L84 15Z"
        fill="#f59e0b"
      />
    </svg>
  );
};

// ============================================================================
// 5. CYCLES
// Modern sport bicycle in 3D perspective with spoke wheels and athletic frame
// ============================================================================
export const CyclesIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cycles"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="cy-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Metallic Frame (Athletic Teal / Forest Green) */}
        <linearGradient id="cy-frame" x1="28" y1="24" x2="74" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="0.4" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Wheels & Tires */}
        <linearGradient id="cy-tire" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="72" rx="42" ry="5.5" fill="url(#cy-floor-shd)" />

      {/* REAR WHEEL (Left) */}
      <g>
        {/* Tire */}
        <circle cx="27" cy="50" r="17" stroke="url(#cy-tire)" strokeWidth="3" />
        {/* Rim */}
        <circle cx="27" cy="50" r="15" stroke="#94a3b8" strokeWidth="0.9" />
        {/* Hub */}
        <circle cx="27" cy="50" r="2.8" fill="#475569" />
        <circle cx="27" cy="50" r="1.2" fill="#cbd5e1" />
        {/* Spokes */}
        <line x1="27" y1="35" x2="27" y2="65" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="12" y1="50" x2="42" y2="50" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="16.4" y1="39.4" x2="37.6" y2="60.6" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="16.4" y1="60.6" x2="37.6" y2="39.4" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
      </g>

      {/* FRONT WHEEL (Right) */}
      <g>
        {/* Tire */}
        <circle cx="73" cy="50" r="17" stroke="url(#cy-tire)" strokeWidth="3" />
        {/* Rim */}
        <circle cx="73" cy="50" r="15" stroke="#94a3b8" strokeWidth="0.9" />
        {/* Hub */}
        <circle cx="73" cy="50" r="2.8" fill="#475569" />
        <circle cx="73" cy="50" r="1.2" fill="#cbd5e1" />
        {/* Spokes */}
        <line x1="73" y1="35" x2="73" y2="65" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="58" y1="50" x2="88" y2="50" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="62.4" y1="39.4" x2="83.6" y2="60.6" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
        <line x1="62.4" y1="60.6" x2="83.6" y2="39.4" stroke="#cbd5e1" strokeWidth="0.6" strokeOpacity="0.85" />
      </g>

      {/* BICYCLE FRAME TUBES */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Chainstay: Rear Hub to Bottom Bracket */}
        <line x1="27" y1="50" x2="48" y2="50" stroke="url(#cy-frame)" strokeWidth="2.8" />
        
        {/* Seatstay: Rear Hub to Seat Cluster */}
        <line x1="27" y1="50" x2="42" y2="30" stroke="url(#cy-frame)" strokeWidth="2.6" />
        
        {/* Seat Tube: Bottom Bracket through Seat Cluster to Saddle */}
        <line x1="48" y1="50" x2="40" y2="25" stroke="url(#cy-frame)" strokeWidth="2.8" />
        
        {/* Down Tube: Bottom Bracket to Head Tube */}
        <line x1="48" y1="50" x2="66" y2="28" stroke="url(#cy-frame)" strokeWidth="3.2" />
        
        {/* Top Tube: Seat Cluster to Head Tube */}
        <line x1="42" y1="30" x2="66" y2="28" stroke="url(#cy-frame)" strokeWidth="2.8" />

        {/* Front Fork: Head Tube to Front Hub */}
        <line x1="66" y1="28" x2="73" y2="50" stroke="url(#cy-frame)" strokeWidth="3" />
        
        {/* Handlebar Stem & Bar */}
        <line x1="66" y1="28" x2="65" y2="20" stroke="#334155" strokeWidth="2.5" />
        <path d="M60 20H69C70.5 20 71.5 21 71.5 22.5" stroke="#1e293b" strokeWidth="3" />
        <circle cx="71.5" cy="22.5" r="1.5" fill="#0d9488" />

        {/* Saddle / Seat */}
        <path d="M35 24C37 24 45 23.5 47 24.5C48 25 47.5 26.5 45.5 26.5H36C34.5 26.5 34 25.5 35 24Z" fill="#0f172a" />
      </g>

      {/* CRANKSET, CHAINRING & PEDALS */}
      <g>
        <circle cx="48" cy="50" r="4.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="48" cy="50" r="2" fill="#0f172a" />
        {/* Pedal Arm & Pedal */}
        <line x1="48" y1="50" x2="52" y2="57" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <rect x="50" y="56" width="5" height="2" rx="0.5" fill="#1e293b" />
      </g>

      {/* Mint Dynamic Motion Accents (Reference Image Style) */}
      <path d="M78 20L82 17" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M82 25L86 24" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M79 30L84 31" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

// ============================================================================
// 6. FURNITURE
// Student study desk + ergonomic mesh chair + small desk lamp + succulent
// ============================================================================
export const FurnitureIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Furniture"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="fn-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Oak Wooden Desk Top & Drawers */}
        <linearGradient id="fn-desk-top" x1="12" y1="36" x2="62" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="fn-drawers" x1="14" y1="40" x2="34" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Ergonomic Office Chair Mesh & Cushion */}
        <linearGradient id="fn-chair-back" x1="62" y1="20" x2="88" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="72" rx="44" ry="6" fill="url(#fn-floor-shd)" />

      {/* 1. STUDENT WOODEN STUDY DESK (Left) */}
      <g>
        {/* Tabletop Surface */}
        <rect x="12" y="36" width="50" height="4" rx="1.5" fill="url(#fn-desk-top)" />
        
        {/* Drawer Unit (Left side cabinet) */}
        <rect x="15" y="40" width="18" height="23" rx="1" fill="url(#fn-drawers)" stroke="#b45309" strokeWidth="0.6" />
        
        {/* Drawers: 3 compartments with handles */}
        <line x1="15" y1="47.5" x2="33" y2="47.5" stroke="#b45309" strokeWidth="0.8" />
        <line x1="15" y1="55" x2="33" y2="55" stroke="#b45309" strokeWidth="0.8" />
        
        {/* Silver Pull Handles */}
        <rect x="22" y="43" width="4" height="1.2" rx="0.4" fill="#cbd5e1" />
        <rect x="22" y="50.5" width="4" height="1.2" rx="0.4" fill="#cbd5e1" />
        <rect x="22" y="58" width="4" height="1.2" rx="0.4" fill="#cbd5e1" />

        {/* Right Wooden Desk Legs */}
        <rect x="56" y="40" width="3" height="26" rx="1" fill="#b45309" />
        <rect x="16" y="63" width="2.5" height="4" fill="#92400e" />
        <rect x="29" y="63" width="2.5" height="4" fill="#92400e" />
      </g>

      {/* 2. MODERN GOOSENECK DESK LAMP (On Tabletop) */}
      <g>
        {/* Lamp Base */}
        <ellipse cx="23" cy="36" rx="3.5" ry="1.2" fill="#0f172a" />
        {/* Curved Neck */}
        <path d="M23 35C23 26 27 23 32 24" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        {/* Lamp Shade Dome */}
        <path d="M30 22C31 20 35 20 36 22L38 27H29L30 22Z" fill="#0f172a" />
        {/* Warm Light Glow Beam */}
        <polygon points="30,27 37,27 43,36 27,36" fill="#fde047" fillOpacity="0.25" />
      </g>

      {/* 3. TINY SUCCULENT PLANT ON DESK */}
      <g>
        <rect x="44" y="32.5" width="5" height="3.5" rx="0.8" fill="#f97316" />
        <circle cx="45.5" cy="31" r="1.8" fill="#10b981" />
        <circle cx="47.5" cy="31" r="1.8" fill="#059669" />
        <circle cx="46.5" cy="29.5" r="1.6" fill="#34d399" />
      </g>

      {/* 4. ERGONOMIC MESH OFFICE CHAIR (Right) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
        {/* Contoured High Backrest */}
        <rect x="68" y="19" width="18" height="26" rx="5" fill="url(#fn-chair-back)" stroke="#475569" strokeWidth="0.8" />
        {/* Mesh Texture Pattern */}
        <line x1="72" y1="24" x2="82" y2="24" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="71" y1="29" x2="83" y2="29" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="72" y1="34" x2="82" y2="34" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="73" y1="39" x2="81" y2="39" stroke="#64748b" strokeWidth="0.8" strokeLinecap="round" />

        {/* Padded Seat Cushion */}
        <ellipse cx="77" cy="46" rx="11" ry="3.5" fill="#1e293b" />
        <ellipse cx="77" cy="45" rx="10" ry="2.8" fill="#334155" />

        {/* Armrests */}
        <path d="M66 38V43H70" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M88 38V43H84" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Center Hydraulic Spindle */}
        <rect x="75.5" y="48" width="3" height="12" fill="#475569" />

        {/* 5-Star Caster Base */}
        <line x1="77" y1="60" x2="68" y2="66" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="60" x2="86" y2="66" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="60" x2="77" y2="67" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Wheels */}
        <circle cx="68" cy="67" r="1.4" fill="#0f172a" />
        <circle cx="86" cy="67" r="1.4" fill="#0f172a" />
        <circle cx="77" cy="68" r="1.4" fill="#0f172a" />
      </g>

      {/* Cozy Sparkle */}
      <path
        d="M87 14L88 17L91 18L88 19L87 22L86 19L83 18L86 17L87 14Z"
        fill="#f43f5e"
      />
    </svg>
  );
};

// ============================================================================
// 7. HOSTEL ESSENTIALS
// Plush pillow + folded quilt blanket + dorm storage bin + stainless flask + hanger
// ============================================================================
export const HostelEssentialsIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Hostel Essentials"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="hs-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Cozy Dark Blue Pillow */}
        <linearGradient id="hs-pillow" x1="16" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.5" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Folded Quilt / Blanket (Navy / Royal Indigo) */}
        <linearGradient id="hs-blanket" x1="14" y1="44" x2="52" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Dorm Storage Box (Warm Craft Beige) */}
        <linearGradient id="hs-box-body" x1="42" y1="48" x2="68" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="hs-box-lid" x1="40" y1="46" x2="70" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Stainless Steel Water Bottle */}
        <linearGradient id="hs-flask" x1="68" y1="26" x2="86" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#e2e8f0" />
          <stop offset="0.75" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="71" rx="42" ry="6" fill="url(#hs-floor-shd)" />

      {/* CLOTHES HANGER (Floating / Hanging background) */}
      <g>
        {/* Hook */}
        <path d="M48 18C48 15 51 14 52.5 15.5C54 17 53 19 51 20V23" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {/* Triangle Wire */}
        <polygon points="51,23 34,31 68,31" stroke="#94a3b8" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      </g>

      {/* 1. PLUSH HOSTEL PILLOW (Standing upright left) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
        <rect x="18" y="24" width="26" height="24" rx="8" fill="url(#hs-pillow)" />
        {/* Pillow Piping Perimeter & Button Tuft */}
        <rect x="20" y="26" width="22" height="20" rx="6" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
        <circle cx="31" cy="36" r="1.5" fill="#475569" />
      </g>

      {/* 2. NEATLY FOLDED BLANKET / FLEECE */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
        {/* Fold 1 (Top) */}
        <rect x="14" y="44" width="34" height="7" rx="3.5" fill="url(#hs-blanket)" />
        {/* Fold 2 (Middle) */}
        <rect x="14" y="50" width="34" height="7" rx="3.5" fill="url(#hs-blanket)" />
        {/* Fold 3 (Bottom) */}
        <rect x="14" y="56" width="34" height="8" rx="3.5" fill="url(#hs-blanket)" />
        {/* Quilt Grid / Plaid Stitch Lines */}
        <line x1="22" y1="45" x2="22" y2="63" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.6" />
        <line x1="32" y1="45" x2="32" y2="63" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.6" />
        <line x1="42" y1="45" x2="42" y2="63" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.6" />
      </g>

      {/* 3. DORM STORAGE BOX (Under-bed organizer) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        {/* Box Body */}
        <rect x="44" y="52" width="25" height="15" rx="2" fill="url(#hs-box-body)" stroke="#b45309" strokeWidth="0.6" />
        {/* Fitted Lid */}
        <rect x="42.5" y="48.5" width="28" height="5" rx="1.5" fill="url(#hs-box-lid)" />
        {/* Front Handle Cutout / Rivet */}
        <rect x="52.5" y="56" width="8" height="3" rx="1.5" fill="#78350f" />
        <circle cx="56.5" cy="57.5" r="0.8" fill="#fde68a" />
      </g>

      {/* 4. STAINLESS STEEL INSULATED FLASK */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))">
        {/* Flask Cylindrical Body */}
        <rect x="73" y="34" width="12" height="33" rx="5" fill="url(#hs-flask)" />
        {/* Silver Reflective Specular Stripe */}
        <line x1="75.5" y1="36" x2="75.5" y2="65" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.85" />
        {/* Grip Ring Bands */}
        <line x1="73" y1="44" x2="85" y2="44" stroke="#94a3b8" strokeWidth="0.7" />
        <line x1="73" y1="46" x2="85" y2="46" stroke="#94a3b8" strokeWidth="0.7" />
        {/* Bottle Neck */}
        <rect x="75.5" y="30" width="7" height="4" fill="#cbd5e1" />
        {/* Chrome Screw Cap with Carry Handle */}
        <rect x="74" y="26" width="10" height="5" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.6" />
        <path d="M77 26C77 23 81 23 81 26" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
      </g>

      {/* Fresh Clean Sparkle */}
      <path
        d="M82 17L83 20L86 21L83 22L82 25L81 22L78 21L81 20L82 17Z"
        fill="#38bdf8"
      />
    </svg>
  );
};

// ============================================================================
// 8. FASHION
// Relaxed hoodie (no text/logos) + crisp white sneakers + baseball cap
// ============================================================================
export const FashionIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Fashion"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="fa-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Deep Emerald / Teal Hoodie */}
        <linearGradient id="fa-hoodie-body" x1="28" y1="16" x2="68" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="0.35" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>
        <linearGradient id="fa-hoodie-hood" x1="38" y1="14" x2="58" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        {/* Crisp White Sneaker */}
        <linearGradient id="fa-shoe-upper" x1="20" y1="52" x2="52" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Baseball Cap */}
        <linearGradient id="fa-cap" x1="58" y1="46" x2="88" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="71" rx="42" ry="6" fill="url(#fa-floor-shd)" />

      {/* 1. STYLISH STREETWEAR HOODIE (Background / Center) */}
      <g>
        {/* Shoulders & Torso */}
        <path
          d="M32 26L20 38L27 43L33 36V57H63V36L69 43L76 38L64 26C58 24 38 24 32 26Z"
          fill="url(#fa-hoodie-body)"
        />

        {/* Hood Structure */}
        <path
          d="M36 24C36 15 42 14 48 14C54 14 60 15 60 24C57 26 53 28 48 28C43 28 39 26 36 24Z"
          fill="url(#fa-hoodie-hood)"
        />
        <path
          d="M41 22C43 18 45 17 48 17C51 17 53 18 55 22C53 23.5 51 24 48 24C45 24 43 23.5 41 22Z"
          fill="#042f2e"
        />

        {/* White Braided Drawstrings */}
        <path d="M44 26V36" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="44" cy="37" r="0.9" fill="#94a3b8" />
        <path d="M52 26V38" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="52" cy="39" r="0.9" fill="#94a3b8" />

        {/* Kangaroo Front Pocket */}
        <path
          d="M37 44H59L61 54H35L37 44Z"
          fill="#0d9488"
          stroke="#042f2e"
          strokeWidth="0.8"
        />

        {/* Ribbed Waistband */}
        <rect x="33" y="55" width="30" height="3" rx="0.5" fill="#0f766e" />
      </g>

      {/* 2. CRISP WHITE CAMPUS SNEAKER (Foreground Left) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.22))">
        {/* Thick Rubber Outsole */}
        <path
          d="M18 64C20 64 48 64 50 64C52 64 53 66 51 67.5C49 68 20 68 18 68C16.5 68 16 66 18 64Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="0.7"
        />
        {/* Leather Upper Shoe Silhouette */}
        <path
          d="M18 64C17 61 19 58 23 57L31 54C34 52 38 52 40 55L44 57C48 58 50 61 50 64H18Z"
          fill="url(#fa-shoe-upper)"
        />
        {/* Toe Cap Stitched Contour */}
        <path d="M19 63C21 59 26 59 28 64" stroke="#cbd5e1" strokeWidth="0.9" fill="none" />
        {/* Crossed Shoe Laces */}
        <line x1="31" y1="56" x2="36" y2="59" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="36" y1="56" x2="31" y2="59" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="33" y1="53" x2="38" y2="56" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* 3. BASEBALL CAP (Foreground Right) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.25))">
        {/* 6-Panel Crown Dome */}
        <path
          d="M58 58C58 48 66 45 74 45C82 45 88 48 88 58H58Z"
          fill="url(#fa-cap)"
        />
        {/* Top Button */}
        <circle cx="73.5" cy="45" r="1.5" fill="#f59e0b" />
        {/* Curved Visor / Bill */}
        <path
          d="M54 60C54 57 60 56 68 56L88 58C92 59 90 62.5 86 63C76 64 62 63.5 54 60Z"
          fill="#1e3a8a"
          stroke="#172554"
          strokeWidth="0.8"
        />
        {/* Visor Stitching Arc */}
        <path d="M58 60C66 61.5 78 61.5 85 60" stroke="#60a5fa" strokeWidth="0.7" fill="none" />
      </g>

      {/* Style Sparkle Accents */}
      <path
        d="M21 21L22 24L25 25L22 26L21 29L20 26L17 25L20 24L21 21Z"
        fill="#f59e0b"
      />
    </svg>
  );
};

// ============================================================================
// 9. SPORTS & FITNESS
// Textured dumbbell + paneled soccer ball + shaker bottle + rolled yoga mat
// ============================================================================
export const SportsFitnessIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sports and Fitness"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="sp-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Cast-Iron Dumbbell Hex Heads */}
        <linearGradient id="sp-db-head" x1="12" y1="26" x2="38" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#475569" />
          <stop offset="0.5" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Soccer Ball Specular & Shadow */}
        <radialGradient id="sp-ball-glow" cx="42%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>

        {/* Rolled Fitness Yoga Mat (Vibrant Teal / Emerald) */}
        <linearGradient id="sp-mat-body" x1="45" y1="52" x2="88" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="0.45" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Protein Shaker Bottle */}
        <linearGradient id="sp-shaker" x1="68" y1="20" x2="86" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="72" rx="44" ry="6.5" fill="url(#sp-floor-shd)" />

      {/* 1. ROLLED FITNESS YOGA MAT (Lying horizontal right/background) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
        {/* Cylindrical Rolled Body */}
        <rect x="48" y="55" width="36" height="13" rx="3" fill="url(#sp-mat-body)" />
        {/* Textured Ribbing Lines */}
        <line x1="58" y1="55" x2="58" y2="68" stroke="#059669" strokeWidth="1" />
        <line x1="68" y1="55" x2="68" y2="68" stroke="#059669" strokeWidth="1" />
        <line x1="78" y1="55" x2="78" y2="68" stroke="#059669" strokeWidth="1" />
        {/* End Spiral Roll Face */}
        <ellipse cx="84" cy="61.5" rx="4" ry="6.5" fill="#047857" />
        <ellipse cx="84" cy="61.5" rx="2.5" ry="4" fill="#065f46" />
        <circle cx="84" cy="61.5" r="1.2" fill="#34d399" />
      </g>

      {/* 2. PROTEIN SHAKER BOTTLE (Standing background right) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.22))">
        {/* Shaker Cup */}
        <polygon points="72,32 84,32 82,54 74,54" fill="url(#sp-shaker)" />
        {/* Measurement Lines */}
        <line x1="77" y1="38" x2="80" y2="38" stroke="#64748b" strokeWidth="0.8" />
        <line x1="76.5" y1="42" x2="80" y2="42" stroke="#64748b" strokeWidth="0.8" />
        <line x1="76" y1="46" x2="80" y2="46" stroke="#64748b" strokeWidth="0.8" />
        {/* Lid & Flip Cap */}
        <rect x="70.5" y="27" width="15" height="5" rx="1.5" fill="#10b981" />
        <circle cx="78" cy="25" r="2.5" fill="#059669" />
      </g>

      {/* 3. HEXAGON CAST-IRON DUMBBELL (Angled 3D on Left) */}
      <g transform="rotate(-24 28 36)" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))">
        {/* Knurled Steel Grip Handle */}
        <rect x="20" y="34.5" width="22" height="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="24" y1="34.5" x2="24" y2="37.5" stroke="#64748b" strokeWidth="0.6" />
        <line x1="28" y1="34.5" x2="28" y2="37.5" stroke="#64748b" strokeWidth="0.6" />
        <line x1="32" y1="34.5" x2="32" y2="37.5" stroke="#64748b" strokeWidth="0.6" />
        <line x1="36" y1="34.5" x2="36" y2="37.5" stroke="#64748b" strokeWidth="0.6" />

        {/* Left Hex Weight Head */}
        <polygon points="14,29 20,31 20,41 14,43 10,38 10,34" fill="url(#sp-db-head)" stroke="#334155" strokeWidth="0.8" />
        
        {/* Right Hex Weight Head */}
        <polygon points="42,29 48,31 48,41 42,43 38,38 38,34" fill="url(#sp-db-head)" stroke="#334155" strokeWidth="0.8" />
      </g>

      {/* 4. CLASSIC PANELED SOCCER BALL (Foreground Center) */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))">
        {/* Ball Sphere Base */}
        <circle cx="43" cy="54" r="14" fill="url(#sp-ball-glow)" />

        {/* Center Pentagonal Black Patch */}
        <polygon points="43,48 48,52 46,57 40,57 38,52" fill="#0f172a" />
        
        {/* Surrounding Seam Lines to Edge Patches */}
        <line x1="43" y1="48" x2="43" y2="42" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="48" y1="52" x2="54" y2="50" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="46" y1="57" x2="51" y2="63" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="40" y1="57" x2="35" y2="63" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <line x1="38" y1="52" x2="32" y2="50" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

        {/* Perimeter Black Patches */}
        <polygon points="41,40 45,40 43,42" fill="#0f172a" />
        <polygon points="54,48 57,51 54,54" fill="#0f172a" />
        <polygon points="32,48 29,51 32,54" fill="#0f172a" />

        {/* Specular Spherical Highlight */}
        <ellipse cx="38" cy="46" rx="4" ry="2.5" fill="#ffffff" fillOpacity="0.5" />
      </g>

      {/* Energy Dashes (Green) */}
      <path d="M19 18L23 16" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 23L20 23" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

// ============================================================================
// 10. STATIONERY
// Notebook + pens in holder + sticky notes + calculator
// ============================================================================
export const StationeryIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Stationery"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="st-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Ceramic Pen Holder Cup */}
        <linearGradient id="st-cup" x1="18" y1="36" x2="38" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fed7aa" />
          <stop offset="0.5" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Hardcover Notebook (Slate Blue) */}
        <linearGradient id="st-notebook" x1="40" y1="18" x2="68" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Spiral Notebook (Soft Coral Pink) */}
        <linearGradient id="st-spiral-nb" x1="32" y1="24" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>

        {/* Sticky Notes Stack (Lemon Yellow) */}
        <linearGradient id="st-notes" x1="58" y1="54" x2="78" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef9c3" />
          <stop offset="0.5" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Calculator Body */}
        <linearGradient id="st-calc" x1="68" y1="32" x2="88" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="71" rx="42" ry="6" fill="url(#st-floor-shd)" />

      {/* 1. HARDCOVER NOTEBOOK (Standing tall in background) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.22))">
        <rect x="42" y="18" width="26" height="42" rx="3" fill="url(#st-notebook)" />
        {/* Book Spine */}
        <rect x="42" y="18" width="4" height="42" rx="1.5" fill="#172554" />
        {/* Bookmark Ribbon */}
        <path d="M52 18V36L55 33L58 36V18H52Z" fill="#fde047" />
        {/* Embossed Cover Design */}
        <rect x="48" y="26" width="16" height="10" rx="1" fill="#2563eb" fillOpacity="0.5" />
        <line x1="50" y1="30" x2="62" y2="30" stroke="#93c5fd" strokeWidth="0.8" />
        <line x1="50" y1="33" x2="58" y2="33" stroke="#93c5fd" strokeWidth="0.8" />
      </g>

      {/* 2. SPIRAL NOTEBOOK (Overlapping notebook) */}
      <g transform="rotate(-5 44 42)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))">
        <rect x="34" y="25" width="22" height="34" rx="2" fill="url(#st-spiral-nb)" />
        {/* Spiral Coils on Left Edge */}
        <rect x="34" y="25" width="3" height="34" fill="#9d174d" />
        <circle cx="35.5" cy="29" r="1.1" fill="#ffffff" />
        <circle cx="35.5" cy="35" r="1.1" fill="#ffffff" />
        <circle cx="35.5" cy="41" r="1.1" fill="#ffffff" />
        <circle cx="35.5" cy="47" r="1.1" fill="#ffffff" />
        <circle cx="35.5" cy="53" r="1.1" fill="#ffffff" />
      </g>

      {/* 3. CERAMIC PEN HOLDER MUG WITH WRITING INSTRUMENTS */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.22))">
        {/* Pens & Rulers protruding from Cup */}
        {/* Wooden Ruler */}
        <rect x="22" y="15" width="4" height="25" rx="0.5" fill="#fde68a" stroke="#d97706" strokeWidth="0.5" />
        <line x1="22" y1="18" x2="24" y2="18" stroke="#92400e" strokeWidth="0.6" />
        <line x1="22" y1="21" x2="24" y2="21" stroke="#92400e" strokeWidth="0.6" />
        <line x1="22" y1="24" x2="24" y2="24" stroke="#92400e" strokeWidth="0.6" />
        
        {/* Blue Gel Pen */}
        <rect x="27" y="12" width="2.5" height="28" rx="0.8" fill="#2563eb" />
        <rect x="27" y="16" width="1" height="6" rx="0.5" fill="#93c5fd" />

        {/* Yellow Chisel Highlighter */}
        <rect x="31" y="18" width="4.5" height="22" rx="1.2" fill="#facc15" />
        <polygon points="31.5,18 35,18 34,14 32.5,14" fill="#a16207" />

        {/* Ceramic Cup Body */}
        <path d="M19 37H37L35 66H21L19 37Z" fill="url(#st-cup)" stroke="#ea580c" strokeWidth="0.7" />
        {/* Rim Specular Highlight */}
        <ellipse cx="28" cy="37" rx="9" ry="2" fill="#fed7aa" />
      </g>

      {/* 4. STUDENT POCKET CALCULATOR (Right) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <rect x="68" y="32" width="20" height="28" rx="3" fill="url(#st-calc)" stroke="#94a3b8" strokeWidth="0.6" />
        {/* Solar Panel & LCD Screen */}
        <rect x="71" y="34.5" width="6" height="2" fill="#475569" />
        <rect x="71" y="38" width="14" height="6" rx="1" fill="#0f172a" />
        <text x="73" y="42.5" fill="#34d399" fontSize="3.5" fontFamily="monospace" fontWeight="bold">0.</text>
        {/* Keypad Buttons Grid */}
        <circle cx="73.5" cy="47.5" r="1.2" fill="#94a3b8" />
        <circle cx="78" cy="47.5" r="1.2" fill="#94a3b8" />
        <circle cx="82.5" cy="47.5" r="1.2" fill="#f97316" />
        <circle cx="73.5" cy="51.5" r="1.2" fill="#94a3b8" />
        <circle cx="78" cy="51.5" r="1.2" fill="#94a3b8" />
        <circle cx="82.5" cy="51.5" r="1.2" fill="#f97316" />
        <circle cx="73.5" cy="55.5" r="1.2" fill="#94a3b8" />
        <circle cx="78" cy="55.5" r="1.2" fill="#94a3b8" />
        <circle cx="82.5" cy="55.5" r="1.2" fill="#10b981" />
      </g>

      {/* 5. STACK OF PASTEL STICKY NOTES (Foreground) */}
      <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.18))">
        {/* Bottom Pink Pad */}
        <rect x="58" y="59" width="18" height="8" rx="1" fill="#f472b6" />
        {/* Top Yellow Pad */}
        <rect x="57" y="55" width="18" height="6" rx="1" fill="url(#st-notes)" />
        {/* Peeling Top Leaf */}
        <path d="M71 55H75C75 55 74 53 72 53C70 53 71 55 71 55Z" fill="#fef08a" />
      </g>

      {/* Creative Purple Sparkle */}
      <path
        d="M84 18L85 21L88 22L85 23L84 26L83 23L80 22L83 21L84 18Z"
        fill="#a855f7"
      />
    </svg>
  );
};

// ============================================================================
// 11. APPLIANCES
// Desk table fan + stainless electric kettle + extension board
// ============================================================================
export const AppliancesIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Appliances"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="ap-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* Fan Body (Clean Crisp White/Slate) */}
        <linearGradient id="ap-fan-housing" x1="16" y1="18" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Polished Stainless Steel Kettle Body */}
        <linearGradient id="ap-kettle" x1="62" y1="28" x2="88" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#e2e8f0" />
          <stop offset="0.75" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Multi-Plug Extension Board */}
        <linearGradient id="ap-ext-board" x1="40" y1="58" x2="76" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="50" cy="72" rx="44" ry="6.5" fill="url(#ap-floor-shd)" />

      {/* 1. DESK TABLE FAN (Left) */}
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.22))">
        {/* Round Pedestal Base */}
        <ellipse cx="28" cy="62" rx="12" ry="3.5" fill="url(#ap-fan-housing)" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Speed Buttons on Base */}
        <circle cx="24" cy="61.5" r="1.1" fill="#0f172a" />
        <circle cx="28" cy="61.5" r="1.1" fill="#2563eb" />
        <circle cx="32" cy="61.5" r="1.1" fill="#cbd5e1" />

        {/* Fan Upright Neck Pillar */}
        <rect x="26.5" y="44" width="3" height="17" rx="1.5" fill="#cbd5e1" />

        {/* Circular Wire Safety Cage Grill */}
        <circle cx="28" cy="32" r="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="28" cy="32" r="12" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="2 2" fill="none" />
        
        {/* Aerodynamic 3-Blade Impeller */}
        <path d="M28 32C28 24 33 21 34 26C35 30 29 32 28 32Z" fill="#38bdf8" />
        <path d="M28 32C22 36 18 33 22 29C25 26 27 31 28 32Z" fill="#38bdf8" />
        <path d="M28 32C33 37 31 42 27 40C24 38 27 33 28 32Z" fill="#38bdf8" />
        
        {/* Center Motor Hub Cap */}
        <circle cx="28" cy="32" r="3.2" fill="#0f172a" />
        <circle cx="28" cy="32" r="1.4" fill="#38bdf8" />
      </g>

      {/* 2. ELECTRIC STAINLESS KETTLE (Right) */}
      <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))">
        {/* 360-Degree Power Heating Base */}
        <ellipse cx="74" cy="60" rx="11" ry="2.8" fill="#1e293b" />

        {/* Stainless Steel Carafe Vessel */}
        <path
          d="M66 34C66 31 82 31 82 34L85 58C85 59.5 83 60 74 60C65 60 63 59.5 63 58L66 34Z"
          fill="url(#ap-kettle)"
          stroke="#94a3b8"
          strokeWidth="0.6"
        />

        {/* Curved Pour Spout */}
        <path d="M65 37L59 34L64 42" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Water Level Window Stripe */}
        <rect x="73" y="42" width="2" height="12" rx="1" fill="#0284c7" fillOpacity="0.75" />

        {/* Stay-Cool Black Ergonomic Handle */}
        <path
          d="M83 34H88C90 34 91 36 91 39V51C91 54 89 56 86 56H84"
          stroke="#0f172a"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Kettle Lid & Handle Knob */}
        <ellipse cx="74" cy="33" rx="7.5" ry="2" fill="#1e293b" />
        <ellipse cx="74" cy="31.5" rx="2" ry="1" fill="#475569" />
      </g>

      {/* 3. MULTI-PLUG EXTENSION SPIKE GUARD (Foreground) */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">
        {/* Extension Strip Case */}
        <rect x="42" y="58" width="30" height="10" rx="2" fill="url(#ap-ext-board)" stroke="#cbd5e1" strokeWidth="0.6" />
        
        {/* Red Illuminated Power Switch */}
        <rect x="44.5" y="61" width="3" height="4" rx="0.5" fill="#ef4444" />
        
        {/* 3 Socket Groups (3-Pin format) */}
        {/* Socket 1 */}
        <circle cx="52" cy="61.5" r="0.8" fill="#334155" />
        <circle cx="50.8" cy="64.5" r="0.6" fill="#334155" />
        <circle cx="53.2" cy="64.5" r="0.6" fill="#334155" />

        {/* Socket 2 */}
        <circle cx="59" cy="61.5" r="0.8" fill="#334155" />
        <circle cx="57.8" cy="64.5" r="0.6" fill="#334155" />
        <circle cx="60.2" cy="64.5" r="0.6" fill="#334155" />

        {/* Socket 3 */}
        <circle cx="66" cy="61.5" r="0.8" fill="#334155" />
        <circle cx="64.8" cy="64.5" r="0.6" fill="#334155" />
        <circle cx="67.2" cy="64.5" r="0.6" fill="#334155" />
      </g>

      {/* Breeze / Steam Freshness Accents */}
      <path d="M12 26C14 24 16 28 18 26" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M11 32C13 30 15 34 17 32" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
};

// ============================================================================
// 12. OTHERS
// Clean 3D isometric marketplace package box + sealing tape + shopping tag
// ============================================================================
export const OthersPackageIcon: React.FC<CategoryIconProps> = ({ size = 72, ...props }) => {
  const width = typeof size === 'number' ? Math.round(size * 1.25) : size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Others and Packages"
      {...props}
    >
      <defs>
        {/* Floor Shadow */}
        <radialGradient id="ot-floor-shd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        {/* 3D Isometric Cardboard Box Faces */}
        {/* Top Opening/Flaps */}
        <linearGradient id="ot-top" x1="24" y1="20" x2="76" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        {/* Left Front Face */}
        <linearGradient id="ot-front" x1="20" y1="36" x2="50" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        {/* Right Side Face (Shadowed) */}
        <linearGradient id="ot-side" x1="50" y1="36" x2="80" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Reinforced Sealing Tape (Campus Teal) */}
        <linearGradient id="ot-tape" x1="45" y1="20" x2="55" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2dd4bf" />
          <stop offset="0.5" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Sparkle Glow */}
        <linearGradient id="ot-sparkle" x1="72" y1="12" x2="86" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Ground Soft Contact Shadow */}
      <ellipse cx="50" cy="71" rx="42" ry="6.5" fill="url(#ot-floor-shd)" />

      {/* 3D ISOMETRIC CARDBOARD PARCEL BOX */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.22))">
        {/* Front Left Face */}
        <polygon points="20,38 50,52 50,68 20,54" fill="url(#ot-front)" />

        {/* Front Right Face (Side) */}
        <polygon points="50,52 80,38 80,54 50,68" fill="url(#ot-side)" />

        {/* Top Diamond Face (Box Top) */}
        <polygon points="50,24 80,38 50,52 20,38" fill="url(#ot-top)" />

        {/* Open Top Flaps Depth */}
        {/* Left Open Flap */}
        <polygon points="20,38 35,26 50,24 20,38" fill="#fef3c7" />
        {/* Right Open Flap */}
        <polygon points="80,38 65,26 50,24 80,38" fill="#fde68a" />

        {/* Reinforced Teal Sealing Tape */}
        {/* Tape running along top crease */}
        <polygon points="46,25.5 54,29.5 54,48 46,44" fill="url(#ot-tape)" />
        {/* Tape running down the front center joint */}
        <polygon points="47,50.5 53,53.5 53,68 47,65" fill="url(#ot-tape)" />

        {/* Shipping / Delivery Parcel Label on Left Face */}
        <polygon points="24,44 38,50.5 38,60 24,53.5" fill="#ffffff" fillOpacity="0.95" />
        <line x1="27" y1="48" x2="35" y2="51.8" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="27" y1="52" x2="33" y2="54.8" stroke="#0f172a" strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="31" cy="57" r="1.1" fill="#10b981" />

        {/* Friendly Marketplace Package Badge on Right Face */}
        <polygon points="56,48 70,41.5 70,51.5 56,58" fill="#fde68a" fillOpacity="0.35" />
        <path d="M60 48C62 50 64 50 66 48" stroke="#92400e" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>

      {/* Floating Golden Discovery Sparkles & Star Particles */}
      <path
        d="M78 12L79.5 16.5L84 18L79.5 19.5L78 24L76.5 19.5L72 18L76.5 16.5L78 12Z"
        fill="url(#ot-sparkle)"
      />
      <circle cx="68" cy="15" r="1.4" fill="#fde047" />
      <circle cx="84" cy="28" r="1.2" fill="#f59e0b" />
    </svg>
  );
};

// ============================================================================
// SOFT PASTEL BACKGROUND TINT RESOLVER
// Perfectly matches each category with a soft, clean modern pastel tone
// ============================================================================
export const getCategoryBgTint = (identifier?: string, categoryName?: string): string => {
  const key = `${identifier || ''} ${categoryName || ''}`.toLowerCase();

  // 1. Books & Study Material (Soft Sky Blue)
  if (key.includes('book') || key.includes('study') || key.includes('notes') || key.includes('exam')) {
    return '#eff6ff';
  }

  // 2. Electronics (Soft Periwinkle / Lavender)
  if (
    key.includes('electronics') ||
    key.includes('cpu') ||
    key.includes('headphone') ||
    key.includes('audio') ||
    key.includes('gadget')
  ) {
    return '#eef2ff';
  }

  // 3. Mobiles (Soft Rose / Blush Pink)
  if (key.includes('mobile') || key.includes('smartphone') || key.includes('phone')) {
    return '#fdf2f8';
  }

  // 4. Laptops (Soft Warm Amber / Cream)
  if (key.includes('laptop') || key.includes('computer') || key.includes('pc')) {
    return '#fffbeb';
  }

  // 5. Cycles (Soft Fresh Mint)
  if (key.includes('cycle') || key.includes('bike') || key.includes('bicycle')) {
    return '#ecfdf5';
  }

  // 6. Furniture (Soft Warm Peach)
  if (key.includes('furniture') || key.includes('armchair') || key.includes('chair') || key.includes('desk') || key.includes('table')) {
    return '#fff7ed';
  }

  // 7. Hostel Essentials (Soft Ice Blue)
  if (key.includes('hostel') || key.includes('home') || key.includes('dorm') || key.includes('room')) {
    return '#f0f9ff';
  }

  // 8. Fashion (Soft Coral Blush)
  if (key.includes('fashion') || key.includes('shirt') || key.includes('cloth') || key.includes('wear') || key.includes('hoodie')) {
    return '#fff1f2';
  }

  // 9. Sports & Fitness (Soft Seafoam)
  if (key.includes('sport') || key.includes('fitness') || key.includes('trophy') || key.includes('gym')) {
    return '#f0fdf4';
  }

  // 10. Stationery (Soft Lilac / Violet)
  if (
    key.includes('stationery') ||
    key.includes('pen') ||
    key.includes('notebook') ||
    key.includes('accessories') ||
    key.includes('watch')
  ) {
    return '#faf5ff';
  }

  // 11. Appliances (Soft Cyan / Sky)
  if (
    key.includes('appliance') ||
    key.includes('fan') ||
    key.includes('kettle') ||
    key.includes('vehicles') ||
    key.includes('car')
  ) {
    return '#ecfeff';
  }

  // 12. Others (Soft Warm Golden Cream)
  return '#fefce8';
};

// ============================================================================
// FLEXIBLE ICON RESOLVER
// ============================================================================
export const getCategory3DIcon = (
  identifier?: string,
  categoryName?: string,
  size: number = 72
): React.ReactElement => {
  const key = `${identifier || ''} ${categoryName || ''}`.toLowerCase();

  // 1. Books & Study Material
  if (key.includes('book') || key.includes('study') || key.includes('notes') || key.includes('exam')) {
    return <BooksStudyIcon size={size} />;
  }

  // 2. Electronics
  if (
    key.includes('electronics') ||
    key.includes('cpu') ||
    key.includes('headphone') ||
    key.includes('audio') ||
    key.includes('gadget')
  ) {
    return <ElectronicsIcon size={size} />;
  }

  // 3. Mobiles
  if (key.includes('mobile') || key.includes('smartphone') || key.includes('phone')) {
    return <MobilesIcon size={size} />;
  }

  // 4. Laptops
  if (key.includes('laptop') || key.includes('computer') || key.includes('pc')) {
    return <LaptopsIcon size={size} />;
  }

  // 5. Cycles
  if (key.includes('cycle') || key.includes('bike') || key.includes('bicycle')) {
    return <CyclesIcon size={size} />;
  }

  // 6. Furniture
  if (key.includes('furniture') || key.includes('armchair') || key.includes('chair') || key.includes('desk') || key.includes('table')) {
    return <FurnitureIcon size={size} />;
  }

  // 7. Hostel Essentials
  if (key.includes('hostel') || key.includes('home') || key.includes('dorm') || key.includes('room')) {
    return <HostelEssentialsIcon size={size} />;
  }

  // 8. Fashion
  if (key.includes('fashion') || key.includes('shirt') || key.includes('cloth') || key.includes('wear') || key.includes('hoodie')) {
    return <FashionIcon size={size} />;
  }

  // 9. Sports & Fitness
  if (key.includes('sport') || key.includes('fitness') || key.includes('trophy') || key.includes('gym')) {
    return <SportsFitnessIcon size={size} />;
  }

  // 10. Stationery
  if (
    key.includes('stationery') ||
    key.includes('pen') ||
    key.includes('notebook') ||
    key.includes('accessories') ||
    key.includes('watch')
  ) {
    return <StationeryIcon size={size} />;
  }

  // 11. Appliances
  if (
    key.includes('appliance') ||
    key.includes('fan') ||
    key.includes('kettle') ||
    key.includes('vehicles') ||
    key.includes('car')
  ) {
    return <AppliancesIcon size={size} />;
  }

  // 12. Others (fallback)
  return <OthersPackageIcon size={size} />;
};
