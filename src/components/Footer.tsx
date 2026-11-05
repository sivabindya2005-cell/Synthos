import React from 'react';

interface FooterProps {
  onOpenAdminDatabase?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminDatabase }) => {
  return (
    <footer className="fixed bottom-0 left-0 lg:left-72 right-0 h-8 bg-white/95 dark:bg-[#071321]/95 text-[#334155] dark:text-slate-400 z-30 border-t border-slate-200 dark:border-[#1E3A5A] flex items-center justify-between px-4 sm:px-6 text-[11px] font-medium tracking-wide transition-colors backdrop-blur-xs">
      <div className="flex items-center gap-2 sm:gap-3 truncate">
        <span className="flex items-center gap-1.5 text-[#0F766E] dark:text-[#14B8A6] shrink-0 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
          Pharmacotherapy Twin
        </span>
        <span className="text-slate-300 dark:text-[#1E3A5A] hidden sm:inline">|</span>
        <span className="hidden sm:inline truncate">Rule-based physiological simulation</span>
        <span className="text-slate-300 dark:text-[#1E3A5A] hidden md:inline">|</span>
        <span className="hidden md:inline truncate">Educational &amp; Decision Support</span>
      </div>

      <div className="flex items-center gap-3 text-[#334155] dark:text-slate-400 font-mono text-[11px] shrink-0">
        {onOpenAdminDatabase && (
          <button
            type="button"
            onClick={onOpenAdminDatabase}
            className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] hover:text-[#0B2545] dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors bg-[#E6F4F1] dark:bg-[#0F2137] px-2 py-0.5 rounded border border-[#BEE3DB] dark:border-[#1E3A5A]"
            title="Open Simulation Telemetry Database (Admin Tracking Only)"
          >
            <span className="material-symbols-outlined text-[13px] text-[#14B8A6]">database</span>
            <span>Admin DB</span>
          </button>
        )}
      </div>
    </footer>
  );
};
