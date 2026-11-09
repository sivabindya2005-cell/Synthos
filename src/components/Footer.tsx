import React from 'react';

interface FooterProps {
  onOpenAdminDatabase?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminDatabase }) => {
  return (
    <footer className="fixed bottom-0 left-0 lg:left-72 right-0 h-8 bg-[#FFFDF9]/95 dark:bg-[#0D1926]/95 text-[#1E3A5F] dark:text-[#8DA4BE] z-30 border-t border-[#E5DDD0] dark:border-[#1F3B5C] flex items-center justify-between px-4 sm:px-6 text-[11px] font-medium tracking-wide transition-colors backdrop-blur-xs">
      <div className="flex items-center gap-2 sm:gap-3 truncate">
        <span className="flex items-center gap-1.5 text-[#15803D] dark:text-[#34D399] shrink-0 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          Pharmacotherapy Twin
        </span>
        <span className="text-[#DDD4C5] dark:text-[#1F3B5C] hidden sm:inline">|</span>
        <span className="hidden sm:inline truncate">Rule-based physiological simulation</span>
        <span className="text-[#DDD4C5] dark:text-[#1F3B5C] hidden md:inline">|</span>
        <span className="hidden md:inline truncate">Educational &amp; Decision Support</span>
      </div>

      <div className="flex items-center gap-3 text-[#1E3A5F] dark:text-[#8DA4BE] font-mono text-[11px] shrink-0">
        {onOpenAdminDatabase && (
          <button
            type="button"
            onClick={onOpenAdminDatabase}
            className="text-[10px] text-[#15803D] dark:text-[#34D399] hover:text-[#1E3A8A] dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors bg-[#EEF7EE] dark:bg-[#13253A] px-2 py-0.5 rounded border border-[#CBE4CB] dark:border-[#1F3B5C]"
            title="Open Simulation Telemetry Database (Admin Tracking Only)"
          >
            <span className="material-symbols-outlined text-[13px] text-[#15803D]">database</span>
            <span>Admin DB</span>
          </button>
        )}
      </div>
    </footer>
  );
};
