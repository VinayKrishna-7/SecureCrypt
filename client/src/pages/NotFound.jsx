import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center font-sans">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-xl">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        
        <div className="text-4xl font-mono font-bold text-slate-900 dark:text-white mb-2">404</div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          The requested link does not exist, has expired, or has already self-destructed after its single view.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
        >
          <span>Return to SecureCrypt</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
