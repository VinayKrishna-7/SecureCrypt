import React from 'react';
import { ShieldCheck, Lock, Key, Flame, X } from 'lucide-react';
import SecurityLogo from './SecurityLogo';

export const EncryptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 font-sans">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <SecurityLogo className="w-6 h-6" showGlow={true} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Zero-Knowledge Guarantee
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Mathematically impossible for anyone else to read your secret.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6 text-xs leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Client-Side AES-256-GCM</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              Your message is scrambled directly in your browser with AES-256-GCM. Unencrypted plaintext never touches the network.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>2. URL Fragment Key</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              The decryption key is appended after the URL hash: <code className="text-emerald-700 dark:text-emerald-400 font-mono">/v/:id#KEY</code>. RFC specs guarantee browsers never transmit URL hashes to any server.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>3. Single View Atomic Wipe</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              Upon revelation, the server permanently purges the ciphertext from database storage. Refreshing the link yields an incinerated 404 state.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Understood
        </button>

      </div>
    </div>
  );
};

export default EncryptionModal;
