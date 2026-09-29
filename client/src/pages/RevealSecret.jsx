import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Flame,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getSecretStatus, revealSecret } from '../services/api';
import { decryptPayload } from '../utils/crypto';
import { Loading } from '../components/Loading';
import { useToast } from '../components/Toast';
import SecurityLogo from '../components/SecurityLogo';

export const RevealSecret = () => {
  const { id } = useParams();
  const { addToast } = useToast();

  const [statusLoading, setStatusLoading] = useState(true);
  const [messageMeta, setMessageMeta] = useState(null);
  const [isBurned, setIsBurned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [keyString, setKeyString] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState(null);
  const [revealedMeta, setRevealedMeta] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      setKeyString(hash);
    }
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setStatusLoading(true);
        setIsBurned(false);
        setErrorMsg('');

        const res = await getSecretStatus(id);
        if (res.success && res.data) {
          setMessageMeta(res.data);
        }
      } catch (err) {
        setIsBurned(true);
        setErrorMsg(err.message || 'This message has already self-destructed.');
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, [id]);

  const handleReveal = async () => {
    try {
      setIsDecrypting(true);

      // Atomically retrieve and wipe from server
      const res = await revealSecret(id);
      if (!res.success || !res.data?.ciphertext) {
        throw new Error('Secret not found or already destroyed.');
      }

      // Decrypt in browser memory
      const plaintext = await decryptPayload({
        ciphertext: res.data.ciphertext,
        iv: res.data.iv,
        keyString,
        passphrase: pin.trim(),
        saltString: res.data.salt,
      });

      setDecryptedText(plaintext);
      setRevealedMeta(res.data);
      addToast('Secret decrypted. Database copy incinerated.', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Decryption failed. Invalid passcode or link.', 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!decryptedText) return;
    try {
      await navigator.clipboard.writeText(decryptedText);
      setCopied(true);
      addToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const handleEraseNow = () => {
    setDecryptedText(null);
    setRevealedMeta(null);
    setIsBurned(true);
    addToast('Secret erased from your screen.', 'info');
  };

  if (statusLoading) {
    return <Loading fullScreen text="Checking secret status..." />;
  }

  // ALREADY BURNED SCREEN
  if (isBurned && !decryptedText) {
    return (
      <div className="relative z-10 max-w-md mx-auto px-4 py-16 sm:py-20 text-center font-sans">
        <div className="ambient-glow" />
        
        <div className="glass-panel rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Flame className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">This secret has self-destructed.</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {errorMsg || 'This secret was opened and permanently incinerated from the database. It no longer exists.'}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
          >
            <span>Send a secret with SecureCrypt</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // REVEALED SECRET SCREEN
  if (decryptedText) {
    return (
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 sm:py-16 font-sans">
        <div className="ambient-glow" />

        {/* Destruction Notice Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Incinerated from database · Reloading will erase this forever</span>
          </div>
          <span className="font-mono text-[11px] text-rose-700 dark:text-rose-400 font-semibold hidden sm:inline">
            {new Date(revealedMeta?.burnedAt || Date.now()).toLocaleTimeString()}
          </span>
        </div>

        {/* Secret Card */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl space-y-4 p-6 sm:p-8">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06] text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Decrypted Secret</span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:border-transparent dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleEraseNow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-300 dark:border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase screen</span>
              </button>
            </div>
          </div>

          <div className="text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-wrap select-text font-sans py-2">
            {decryptedText}
          </div>

        </div>

        <div className="mt-8 text-center text-xs">
          <Link to="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors">
            ← Send a secret with SecureCrypt
          </Link>
        </div>

      </div>
    );
  }

  // PRE-REVEAL GATE
  return (
    <div className="relative z-10 max-w-md mx-auto px-4 py-14 sm:py-16 text-center font-sans">
      <div className="ambient-glow" />

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <SecurityLogo className="w-8 h-8" showGlow={true} />
        </div>

        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 uppercase mb-2">
            Single View Limit
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            A confidential secret is waiting.
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This secret will be permanently deleted from the database the moment you reveal it.
          </p>
        </div>

        {/* Passcode Input if required */}
        {messageMeta?.hasPassphrase && (
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400">
              Enter Passcode to Decrypt
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Passcode..."
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleReveal}
          disabled={isDecrypting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isDecrypting ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              <span>Decrypting & Wiping...</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Reveal Secret (Destroys Link)</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default RevealSecret;
