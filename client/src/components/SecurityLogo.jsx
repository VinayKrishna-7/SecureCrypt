import React from 'react';

export const SecurityLogo = ({ className = 'w-7 h-7', showGlow = false }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {showGlow && (
        <span className="absolute inset-0 rounded-full bg-emerald-500/25 blur-sm animate-pulse" />
      )}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm select-none"
      >
        {/* Outer Shield with emerald gradient */}
        <path
          d="M32 4L12 12V28C12 43.2 20.6 54.4 32 59C43.4 54.4 52 43.2 52 28V12L32 4Z"
          fill="url(#shield_grad_logo)"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Shackle */}
        <path
          d="M26 29V23C26 19.6863 28.6863 17 32 17C35.3137 17 38 19.6863 38 23V29"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Padlock Body */}
        <rect
          x="22"
          y="29"
          width="20"
          height="16"
          rx="4"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="2.5"
        />
        
        {/* Keyhole */}
        <circle cx="32" cy="36" r="2" fill="#044e3b" />
        <path d="M32 38V41" stroke="#044e3b" strokeWidth="2" strokeLinecap="round" />

        {/* Cyber accents */}
        <circle cx="20" cy="18" r="1.5" fill="#6ee7b7" />
        <circle cx="44" cy="18" r="1.5" fill="#6ee7b7" />
        <path d="M20 18H24M44 18H40" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />

        <defs>
          <linearGradient id="shield_grad_logo" x1="12" y1="4" x2="52" y2="59" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SecurityLogo;
