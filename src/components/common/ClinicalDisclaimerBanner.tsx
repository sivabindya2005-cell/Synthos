import React from 'react';

interface ClinicalDisclaimerBannerProps {
  className?: string;
  compact?: boolean;
}

export const ClinicalDisclaimerBanner: React.FC<ClinicalDisclaimerBannerProps> = ({
  className = '',
  compact = false
}) => {
  if (compact) {
    return (
      <div
        className={`px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2 ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="material-symbols-outlined text-[#0F766E] dark:text-teal-400 text-[15px] shrink-0">
            shield
          </span>
          <span className="truncate">
            <strong>Educational CDS:</strong> For qualified healthcare professionals. Not for autonomous prescribing.
          </span>
        </div>
        <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 shrink-0">
          Do not enter identifiable patient info
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#0F766E] dark:text-teal-400 text-[18px] shrink-0">
          verified_user
        </span>
        <span className="leading-relaxed">
          <strong>Clinical Decision Support Disclaimer:</strong> Algorithmic mathematical outputs are calibrated for research &amp; educational triage. Corroborate all drug titrations with official FDA labeling and patient lab monitoring.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
          No PHI · De-identified Only
        </span>
      </div>
    </div>
  );
};
