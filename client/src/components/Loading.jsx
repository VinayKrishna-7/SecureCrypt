import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-600 dark:text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs sm:text-sm font-medium tracking-wide font-mono">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-8 text-slate-600 dark:text-slate-400 font-sans">
      <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
      <span className="text-xs sm:text-sm font-medium">{text}</span>
    </div>
  );
};

export default Loading;
