import React, { useState } from 'react';
import {
  Lock,
  Flame,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Dice5
} from 'lucide-react';
import { encryptPayload, generateSecurePin } from '../utils/crypto';
import { createSecret, deleteSecret } from '../services/api';
import { useToast } from '../components/Toast';
import SecurityLogo from '../components/SecurityLogo';

export const Home = () => {
  const { addToast } = useToast();

  const [message, setMessage] = useState('');
  const [enablePin, setEnablePin] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleGeneratePin = () => {
    const randomPin = generateSecurePin();
    setPin(randomPin);
    setShowPin(true);
    addToast('Generated random 6-digit passcode', 'info');
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();

    if (!message.trim()) {
      addToast('Please enter your secret message before encrypting.', 'error');
      return;
    }

    if (enablePin && !pin.trim()) {
      addToast('Please enter a passcode or disable the option.', 'error');
      return;
    }

    try {
      setIsEncrypting(true);

      // Client-side AES-256-GCM zero-knowledge encryption
      const { ciphertext, iv, keyString, saltString } = await encryptPayload(
        message.trim(),
        enablePin ? pin.trim() : ''
      );

      // Send ciphertext to server
      const res = await createSecret({
        ciphertext,
        iv,
        salt: saltString,
        hasPassphrase: enablePin,
      });

      if (res.success && res.data?.id) {
        const origin = window.location.origin;
        // Key resides strictly in URL fragment
        const secretUrl = `${origin}/v/${res.data.id}#${keyString}`;

        setCreatedResult({
          id: res.data.id,
          url: secretUrl,
          hasPin: enablePin,
          pinValue: pin.trim(),
          senderToken: res.data.senderToken,
        });

        addToast('Encrypted with AES-256! One-time link created.', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Encryption failed', 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdResult?.url) return;
    try {
      await navigator.clipboard.writeText(createdResult.url);
      setCopiedLink(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleCopyPin = async () => {
    if (!createdResult?.pinValue) return;
    try {
      await navigator.clipboard.writeText(createdResult.pinValue);
      setCopiedPin(true);
      addToast('Passcode copied to clipboard!', 'success');
      setTimeout(() => setCopiedPin(false), 2000);
    } catch {
      addToast('Failed to copy passcode', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!createdResult?.id || !createdResult?.senderToken) return;
    if (!window.confirm('Destroy this secret now before it is opened?')) return;

    try {
      setIsRevoking(true);
      await deleteSecret(createdResult.id, createdResult.senderToken);
      addToast('Secret revoked and destroyed.', 'success');
      setCreatedResult(null);
      setMessage('');
      setPin('');
      setEnablePin(false);
    } catch (err) {
      addToast(err.message || 'Failed to revoke', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setMessage('');
    setPin('');
    setEnablePin(false);
  };

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 sm:py-14">
      
      {/* Ambient Radial Mesh */}
      <div className="ambient-glow" />

      {/* Hero Section */}
      <div className="text-center mb-9">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
          <SecurityLogo className="w-3.5 h-3.5" />
          <span>SecureCrypt · Strict View-Once · Zero-Knowledge AES-256</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.18]">
          Share encrypted secrets that <span className="text-emerald-600 dark:text-emerald-400">self-destruct</span>.
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          End-to-end encrypted in your browser. Decrypted and permanently destroyed the second it is opened.
        </p>
      </div>

      {/* Generated Result Card */}
      {createdResult ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Your encrypted link is ready</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Share this link. It will self-destruct after 1 view.</p>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
              <input
                type="text"
                readOnly
                value={createdResult.url}
                className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm font-mono text-emerald-700 dark:text-emerald-400 select-all outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Passcode (if configured) */}
          {createdResult.hasPin && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 dark:text-amber-400 font-semibold block">Decryption Passcode</span>
                <span className="text-lg font-mono font-bold text-slate-950 dark:text-white tracking-widest">{createdResult.pinValue}</span>
              </div>
              <button
                onClick={handleCopyPin}
                className="px-3.5 py-1.5 rounded-xl bg-amber-200/70 hover:bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedPin ? 'Copied' : 'Copy Passcode'}
              </button>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs">
            <Flame className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>
              This link is strictly single-use. The ciphertext is purged from the database the moment the recipient reveals it.
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/[0.06] text-xs">
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isRevoking ? 'Revoking...' : 'Revoke & destroy now'}</span>
            </button>

            <button
              onClick={handleReset}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              Create another secret →
            </button>
          </div>

        </div>
      ) : (
        /* The Minimalist Composer */
        <form onSubmit={handleCreate} className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          
          {/* Main Textarea */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your confidential secret, passwords, private keys, or tokens..."
              rows={8}
              maxLength={50000}
              spellCheck={false}
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y outline-none leading-relaxed text-sm sm:text-base font-sans"
            />
          </div>

          {/* Optional Passcode Drawer */}
          {enablePin && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs animate-in fade-in duration-150">
              <div className="relative flex-1 w-full">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 text-xs sm:text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleGeneratePin}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                <Dice5 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Generate Passcode</span>
              </button>
            </div>
          )}

          {/* Bottom Toolbar & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
            
            {/* Options Toggle */}
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setEnablePin(!enablePin)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer font-medium ${
                  enablePin
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{enablePin ? 'Passcode Enabled' : 'Add Passcode'}</span>
              </button>

              <span className="text-slate-500 text-[11px] font-mono">
                {message.length.toLocaleString()} chars
              </span>
            </div>

            {/* Primary Submit */}
            <button
              type="submit"
              disabled={isEncrypting || !message.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isEncrypting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <span>Create Encrypted Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

        </form>
      )}

      {/* Trust Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>AES-256-GCM · Decryption key never touches server · 1 View Limit</span>
      </div>

    </div>
  );
};

export default Home;
