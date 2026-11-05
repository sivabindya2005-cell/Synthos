import React, { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K', label: 'Global Clinical Search', desc: 'Search 305+ drugs, enzymes, pathways, and CPIC rules' },
    { key: '⌘ 1', label: 'Triage Overview', desc: 'Jump to active patient triage decision matrix' },
    { key: '⌘ 2', label: 'Digital Twin Simulator', desc: 'Open interactive pharmacokinetic organ clearance twin' },
    { key: '⌘ 3', label: 'Drug Intelligence', desc: 'Explore pharmacokinetics, clearance, and drug monographs' },
    { key: '⌘ 4', label: 'Clinical Evidence Search', desc: 'Open real-time literature and UpToDate search grounding' },
    { key: '⌘ ⇧ D', label: 'Admin Telemetry Vault', desc: 'Unlock administrative simulation tracking store' },
    { key: '⌘ /', label: 'Keyboard Shortcuts', desc: 'Open this shortcut reference overlay' },
    { key: 'ESC', label: 'Dismiss Modal / Drawer', desc: 'Close any active modal or slide-over drawer' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-in text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#14B8A6] dark:text-teal-400 text-[22px]">keyboard</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{s.label}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate block">{s.desc}</span>
              </div>
              <kbd className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:divide-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Pro tip: Press <kbd className="font-mono font-bold">⌘K</kbd> anywhere for universal search</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
