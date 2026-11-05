import React from 'react';
import { PatientCase } from '../types/clinical';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activePatient: PatientCase;
  onOpenSearch: () => void;
  onOpenPatientSelect: () => void;
  onOpenSimulator: () => void;
  onOpenNewAssessment: () => void;
  onReturnToHome: () => void;
  onOpenGuidedWizard?: () => void;
  onOpenVideoIntro?: () => void;
  onExportPdf?: () => void;
  onOpenPersonalizeRegimen?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePatient,
  onOpenSearch,
  onOpenPatientSelect,
  onOpenSimulator,
  onOpenNewAssessment,
  onReturnToHome,
  onOpenGuidedWizard,
  onOpenVideoIntro,
  onExportPdf,
  onOpenPersonalizeRegimen,
  onToggleMobileMenu,
  onOpenShortcuts
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 dark:bg-[#071321]/95 backdrop-blur-md z-40 border-b border-slate-200/90 dark:border-[#1E3A5A] shadow-[0_1px_4px_rgba(11,37,69,0.04)] transition-colors">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Breadcrumb & Search */}
        <div className="flex items-center gap-3 min-w-0 max-w-xl flex-1">
          {/* Mobile hamburger menu button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#334155] dark:text-slate-300 hover:bg-[#E6F4F1] dark:hover:bg-[#0F2137] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-[#334155] dark:text-slate-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">folder_shared</span>
            <span>Triage</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[#0B2545] dark:text-[#F8FAFC] font-bold font-mono">{activePatient.id}</span>
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <button
              onClick={onOpenSearch}
              type="button"
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-[#F8FAFC] dark:bg-[#0F2137] text-left text-xs text-[#334155] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#1E3A5A] hover:border-[#14B8A6] hover:bg-white dark:hover:bg-[#132B42] transition-all flex items-center cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">
                search
              </span>
              <span className="truncate">
                Search drugs, enzymes, guidelines... (⌘K)
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] bg-[#E6F4F1] dark:bg-[#071321] px-1.5 py-0.5 rounded font-mono border border-[#BEE3DB] dark:border-[#1E3A5A] hidden sm:inline">
                ⌘K
              </span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="h-9 w-9 rounded-lg bg-[#F8FAFC] dark:bg-[#0F2137] text-[#334155] dark:text-slate-200 hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] border border-slate-200 dark:border-[#1E3A5A] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0F766E] dark:text-[#14B8A6]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Keyboard Shortcuts Dialog */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              type="button"
              className="h-9 w-9 rounded-lg bg-[#F8FAFC] dark:bg-[#0F2137] text-[#334155] dark:text-slate-200 hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] border border-slate-200 dark:border-[#1E3A5A] transition-colors hidden sm:flex items-center justify-center cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts (⌘/)"
              aria-label="View keyboard shortcuts"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard</span>
            </button>
          )}

          {onOpenVideoIntro && (
            <button
              onClick={onOpenVideoIntro}
              type="button"
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#E6F4F1] dark:bg-[#132B42] text-[#0F766E] dark:text-[#14B8A6] border border-[#BEE3DB] dark:border-[#1E3A5A] hover:bg-[#D4ECE6] text-xs font-semibold transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Watch Video Overview (01:05)"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">play_circle</span>
              <span className="hidden md:inline">Tour</span>
            </button>
          )}

          {onOpenGuidedWizard && (
            <button
              onClick={onOpenGuidedWizard}
              type="button"
              className="h-9 px-3 rounded-lg bg-gradient-to-r from-[#0F766E] to-[#0B2545] hover:from-[#0D645D] hover:to-[#081B33] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Launch Guided 3-Step Simulation Wizard"
            >
              <span className="material-symbols-outlined text-[16px] text-[#14B8A6]">auto_awesome</span>
              <span>3-Step Wizard</span>
            </button>
          )}

          <button
            onClick={onReturnToHome}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-white dark:bg-[#0F2137] text-[#334155] dark:text-slate-200 border border-slate-200 dark:border-[#1E3A5A] hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Return to Clinical Portal Home"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">home</span>
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={onOpenPatientSelect}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-white dark:bg-[#0F2137] text-[#334155] dark:text-slate-200 border border-slate-200 dark:border-[#1E3A5A] hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] text-xs font-semibold transition-colors hidden md:flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">switch_account</span>
            <span>Switch Case</span>
          </button>

          {onOpenPersonalizeRegimen && (
            <button
              onClick={onOpenPersonalizeRegimen}
              type="button"
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#E6F4F1] dark:bg-[#132B42] text-[#0F766E] dark:text-[#14B8A6] border border-[#BEE3DB] dark:border-[#1E3A5A] hover:bg-[#D4ECE6] text-xs font-bold transition-all hidden xl:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Personalize Medication Regimen specifically for this patient"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">tune</span>
              <span>Personalize</span>
            </button>
          )}

          <button
            onClick={onOpenSimulator}
            type="button"
            className="h-9 px-3 sm:px-3.5 rounded-lg bg-[#14B8A6] hover:bg-[#0F766E] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Simulate Pharmacokinetic Organ Clearance"
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            <span>Simulator</span>
          </button>

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              type="button"
              className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#0F2137] text-[#334155] dark:text-slate-200 border border-slate-200 dark:border-[#1E3A5A] hover:bg-[#E6F4F1] dark:hover:bg-[#132B42] text-xs font-semibold transition-colors hidden lg:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export Structured Clinical PDF Report"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0F766E] dark:text-[#14B8A6]">picture_as_pdf</span>
              <span className="hidden xl:inline">Export PDF</span>
            </button>
          )}

          <button
            onClick={onOpenNewAssessment}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#0B2545] hover:bg-[#071930] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ring-1 ring-[#14B8A6]/30"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">New Case</span>
          </button>
        </div>
      </div>
    </header>
  );
};
