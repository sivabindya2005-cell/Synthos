import React from 'react';
import { PatientCase } from '../types/clinical';
import { useTheme } from '../context/ThemeContext';
import { useClinicianAuth } from '../context/AuthContext';

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
  const { isAuthenticated, clinician, openAuthModal, openPersonalizedModal, savedCases } = useClinicianAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#FFFDF9]/95 dark:bg-[#0D1926]/95 backdrop-blur-md z-40 border-b border-[#E5DDD0] dark:border-[#1F3B5C] shadow-[0_1px_4px_rgba(30,58,138,0.04)] transition-colors">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Breadcrumb & Search */}
        <div className="flex items-center gap-3 min-w-0 max-w-xl flex-1">
          {/* Mobile hamburger menu button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F4EFE6] dark:hover:bg-[#13253A] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-[#1E3A5F] dark:text-[#D8E2ED] text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px] text-[#15803D] dark:text-[#34D399]">folder_shared</span>
            <span>Triage</span>
            <span className="text-[#DDD4C5] dark:text-[#1F3B5C]">/</span>
            <span className="text-[#1E3A8A] dark:text-[#FAF7F2] font-bold font-mono">{activePatient.id}</span>
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <button
              onClick={onOpenSearch}
              type="button"
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-[#FAF7F2] dark:bg-[#13253A] text-left text-xs text-[#1E3A5F] dark:text-[#FAF7F2] border border-[#E5DDD0] dark:border-[#1F3B5C] hover:border-[#15803D] hover:bg-white dark:hover:bg-[#172D47] transition-all flex items-center cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4B6584] dark:text-[#8DA4BE] text-[18px]">
                search
              </span>
              <span className="truncate">
                Search drugs, enzymes, guidelines... (⌘K)
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#15803D] dark:text-[#34D399] bg-[#EEF7EE] dark:bg-[#0D1926] px-1.5 py-0.5 rounded font-mono border border-[#CBE4CB] dark:border-[#1F3B5C] hidden sm:inline">
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
            className="h-9 w-9 rounded-lg bg-[#FAF7F2] dark:bg-[#13253A] text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F4EFE6] dark:hover:bg-[#172D47] border border-[#E5DDD0] dark:border-[#1F3B5C] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            <span className="material-symbols-outlined text-[18px] text-[#15803D] dark:text-[#34D399]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Keyboard Shortcuts Dialog */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              type="button"
              className="h-9 w-9 rounded-lg bg-[#FAF7F2] dark:bg-[#13253A] text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F4EFE6] dark:hover:bg-[#172D47] border border-[#E5DDD0] dark:border-[#1F3B5C] transition-colors hidden sm:flex items-center justify-center cursor-pointer shadow-2xs"
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
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#EEF7EE] dark:bg-[#172D47] text-[#15803D] dark:text-[#34D399] border border-[#CBE4CB] dark:border-[#1F3B5C] hover:bg-[#DCF0DC] text-xs font-semibold transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Watch Video Overview (01:05)"
            >
              <span className="material-symbols-outlined text-[16px] text-[#15803D] dark:text-[#34D399]">play_circle</span>
              <span className="hidden md:inline">Tour</span>
            </button>
          )}

          {onOpenGuidedWizard && (
            <button
              onClick={onOpenGuidedWizard}
              type="button"
              className="h-9 px-3 rounded-lg bg-gradient-to-r from-[#15803D] to-[#1E3A8A] hover:from-[#166534] hover:to-[#0F2F57] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Launch Guided 3-Step Simulation Wizard"
            >
              <span className="material-symbols-outlined text-[16px] text-[#A7F3D0]">auto_awesome</span>
              <span>3-Step Wizard</span>
            </button>
          )}

          <button
            onClick={onReturnToHome}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-white dark:bg-[#13253A] text-[#1E3A5F] dark:text-[#D8E2ED] border border-[#E5DDD0] dark:border-[#1F3B5C] hover:bg-[#F4EFE6] dark:hover:bg-[#172D47] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Return to Clinical Portal Home"
          >
            <span className="material-symbols-outlined text-[16px] text-[#1E3A8A] dark:text-[#60A5FA]">home</span>
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={onOpenPatientSelect}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-white dark:bg-[#13253A] text-[#1E3A5F] dark:text-[#D8E2ED] border border-[#E5DDD0] dark:border-[#1F3B5C] hover:bg-[#F4EFE6] dark:hover:bg-[#172D47] text-xs font-semibold transition-colors hidden md:flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#15803D] dark:text-[#34D399]">switch_account</span>
            <span>Switch Case</span>
          </button>

          {onOpenPersonalizeRegimen && (
            <button
              onClick={onOpenPersonalizeRegimen}
              type="button"
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#EEF7EE] dark:bg-[#172D47] text-[#15803D] dark:text-[#34D399] border border-[#CBE4CB] dark:border-[#1F3B5C] hover:bg-[#DCF0DC] text-xs font-bold transition-all hidden xl:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Personalize Medication Regimen specifically for this patient"
            >
              <span className="material-symbols-outlined text-[16px] text-[#15803D] dark:text-[#34D399]">tune</span>
              <span>Personalize</span>
            </button>
          )}

          <button
            onClick={onOpenSimulator}
            type="button"
            className="h-9 px-3 sm:px-3.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Simulate Pharmacokinetic Organ Clearance"
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            <span>Simulator</span>
          </button>

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              type="button"
              className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#13253A] text-[#1E3A5F] dark:text-[#D8E2ED] border border-[#E5DDD0] dark:border-[#1F3B5C] hover:bg-[#F4EFE6] dark:hover:bg-[#172D47] text-xs font-semibold transition-colors hidden lg:flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export Structured Clinical PDF Report"
            >
              <span className="material-symbols-outlined text-[16px] text-[#1E3A8A] dark:text-[#60A5FA]">picture_as_pdf</span>
              <span className="hidden xl:inline">Export PDF</span>
            </button>
          )}

          <button
            onClick={onOpenNewAssessment}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#0F2F57] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ring-1 ring-[#15803D]/40"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">New Case</span>
          </button>

          {/* Personalized Cases & Workspace Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                openPersonalizedModal();
              } else {
                openAuthModal();
              }
            }}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 dark:bg-teal-500/20 dark:hover:bg-teal-500/30 text-teal-800 dark:text-teal-300 border border-teal-600/30 dark:border-teal-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={isAuthenticated ? `Open Personalized Workspace (${savedCases.length} saved cases)` : 'Create account or sign in to access personalized patient twins'}
          >
            <span className="material-symbols-outlined text-[16px] text-teal-700 dark:text-teal-300">
              folder_special
            </span>
            <span className="hidden lg:inline">My Cases</span>
            {isAuthenticated && savedCases.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-900 font-bold font-mono">
                {savedCases.length}
              </span>
            )}
          </button>

          {/* Clinician Account / Sign-In Button */}
          <button
            onClick={() => openAuthModal()}
            type="button"
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#1E3A5F] dark:text-white border border-[#E5DDD0] dark:border-white/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={isAuthenticated ? `Signed in as @${clinician.username || clinician.name} (${clinician.role})` : 'Sign in or create account'}
          >
            {isAuthenticated ? (
              <>
                <span className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px] font-bold">
                  {clinician.name ? clinician.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="hidden md:inline text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300 truncate max-w-[110px]">
                  @{clinician.username || clinician.name}
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">account_circle</span>
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
