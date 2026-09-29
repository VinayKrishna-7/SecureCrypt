import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, ShieldCheck } from 'lucide-react';
import { useTheme } from './ThemeContext';
import EncryptionModal from './EncryptionModal';
import SecurityLogo from './SecurityLogo';

export const Navbar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.06] bg-white/85 dark:bg-[#080a0f]/80 backdrop-blur-xl transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Encryption Security Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-200">
                <SecurityLogo className="w-5 h-5" showGlow={true} />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                    SecureCrypt
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                
                {/* Security Tag */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>AES-256</span>
                </span>
              </div>
            </Link>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Zero-Knowledge Proof
              </button>

              {/* Minimal Dark / Bright Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/90 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
                title={isDark ? 'Switch to Bright theme' : 'Switch to Dark theme'}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      <EncryptionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Navbar;
