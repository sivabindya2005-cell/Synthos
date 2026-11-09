import React from 'react';
import { PatientCase } from '../types/clinical';
import { useAuth } from '../context/AuthContext';
import { SynthosLogo } from './common/SynthosLogo';

export type NavigationTab = string;

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activePatient: PatientCase;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenVideoIntro?: () => void;
  onOpenPersonalizeRegimen?: () => void;
  onOpenAdminDatabase?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activePatient,
  isMobileOpen = false,
  onCloseMobile,
  onOpenVideoIntro,
  onOpenPersonalizeRegimen,
  onOpenAdminDatabase
}) => {
  const { clinician, isAuthenticated, signOut, openAuthModal, openPersonalizedModal, savedCases } = useAuth();

  // Section 1: Core Decision Support
  const coreClinicalItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Clinical Portal Home', icon: 'home' },
    { id: 'overview', label: 'Triage & Risk Matrix', icon: 'grid_view' },
    { id: 'twin', label: 'Digital Twin Simulation', icon: 'tune' },
    { id: 'personalized-cases', label: `My Saved Cases (${savedCases.length})`, icon: 'folder_special' },
    { id: 'personalize', label: 'Personalize Regimen', icon: 'medication_liquid' },
    { id: 'medications', label: 'Medication Reconciliation', icon: 'medication' },
    { id: 'interactions', label: 'Drug Interaction Matrix', icon: 'swap_horiz' },
    { id: 'monitoring', label: 'Safety & Monitoring Plan', icon: 'event_repeat' },
    { id: 'scenarios', label: 'Clinical Scenarios (ICU/CKD)', icon: 'science' }
  ];

  // Section 2: Diagnostics & Informatics
  const diagnosticInformaticsItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'pathways', label: 'Pathway Explorer', icon: 'hub' },
    { id: 'genomics', label: 'CYP450 Genomic Scanner', icon: 'dna' },
    { id: 'fhir', label: 'EHR / FHIR Interop R4', icon: 'lan' },
    { id: 'search-grounding', label: 'Clinical Search Grounding', icon: 'manage_search' }
  ];

  // Section 3: Evidence, Compendium & Audit
  const evidenceGovernanceItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'evidence', label: 'Guideline Evidence Library', icon: 'menu_book' },
    { id: 'drug-intelligence', label: 'Drug Monograph Intelligence', icon: 'auto_stories' },
    { id: 'vault', label: 'Simulation Vault Storage', icon: 'archive' },
    { id: 'reports', label: 'Audit Reports & Dossier', icon: 'summarize' },
    { id: 'limitations', label: 'Methodology & Limitations', icon: 'verified' }
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    if (tabId === 'personalized-cases') {
      if (isAuthenticated) {
        openPersonalizedModal();
      } else {
        openAuthModal();
      }
      if (onCloseMobile) onCloseMobile();
      return;
    }
    if (tabId === 'personalize' && onOpenPersonalizeRegimen) {
      onOpenPersonalizeRegimen();
      if (onCloseMobile) onCloseMobile();
      return;
    }
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#0D1926]/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel with Pastel Cream & Blue / Spam Green Hierarchy */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-[#FFFDF9] dark:bg-[#0D1926] z-50 flex flex-col justify-between border-r border-[#E5DDD0] dark:border-[#1F3B5C] shadow-[0_1px_4px_rgba(30,58,138,0.04)] transition-transform duration-250 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Application navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FFFDF9]/95 dark:bg-[#0D1926]/95 backdrop-blur-sm">
            <button
              onClick={() => handleNavClick('home')}
              type="button"
              className="text-left transition-opacity hover:opacity-90 cursor-pointer flex-1"
              title="Return to Clinical Home"
            >
              <SynthosLogo size="md" variant="horizontal" theme="auto" showTagline={true} />
            </button>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                type="button"
                className="lg:hidden p-1.5 rounded-lg text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-white hover:bg-[#F4EFE6] dark:hover:bg-[#13253A] cursor-pointer"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Patient Quick Card - Pastel Cream Container */}
          <div className="p-3">
            <div className="bg-[#F4EFE6] dark:bg-[#13253A] rounded-xl p-3 border border-[#E5DDD0] dark:border-[#1F3B5C] shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#1E3A8A] dark:text-[#FAF7F2] tracking-wider">
                    {activePatient.id}
                  </span>
                  <span className="text-[10px] text-[#4B6584] font-sans">· Synthetic</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#0D1926] text-[#15803D] dark:text-[#34D399] border border-[#CBE4CB] dark:border-[#1F3B5C] font-bold">
                  {activePatient.tier}
                </span>
              </div>
              <div className="text-xs text-[#1E3A5F] dark:text-[#D8E2ED] font-medium">
                {activePatient.biometrics.age} Y {activePatient.biometrics.sex} · SCr {activePatient.organStatus.renal.scr.toFixed(2)} mg/dL
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[#DDD4C5]/80 dark:border-[#1F3B5C] flex items-center justify-between">
                <span className="text-[11px] text-[#4B6584] dark:text-[#8DA4BE] font-medium">eGFR (CKD-EPI)</span>
                <span className="text-xs text-[#15803D] dark:text-[#34D399] font-bold font-mono">
                  {activePatient.organStatus.renal.egfr} mL/min/1.73m²
                </span>
              </div>

              {onOpenPersonalizeRegimen && (
                <button
                  onClick={() => {
                    onOpenPersonalizeRegimen();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  type="button"
                  className="w-full mt-2.5 py-1.5 px-2 rounded-lg bg-white dark:bg-[#172D47] hover:bg-[#EEF7EE] dark:hover:bg-[#1F3B5C] border border-[#CBE4CB] dark:border-[#1F3B5C] text-[#15803D] dark:text-[#34D399] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Personalize and titrate patient-specific medications"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#15803D] dark:text-[#34D399]">tune</span>
                  <span>Personalize Regimen</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-2.5 overflow-y-auto space-y-3.5 pb-4">
            {/* Section 1: Core Decision Support */}
            <div className="space-y-0.5">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-[#8DA4BE] font-mono">
                Core Decision Support
              </div>
              {coreClinicalItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-all rounded-lg text-left text-xs cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF7EE] dark:bg-[#172D47] text-[#15803D] dark:text-[#34D399] font-bold border border-[#CBE4CB] dark:border-[#1F3B5C] shadow-2xs'
                        : 'text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F2ECE1] dark:hover:bg-[#13253A] hover:text-[#1E3A8A] dark:hover:text-[#FAF7F2] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#15803D] dark:text-[#34D399]' : 'text-[#4B6584] dark:text-[#8DA4BE]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 2: Diagnostics & Informatics */}
            <div className="space-y-0.5 pt-2 border-t border-[#E5DDD0] dark:border-[#1F3B5C]">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-[#8DA4BE] font-mono">
                Diagnostics &amp; EHR
              </div>
              {diagnosticInformaticsItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-all rounded-lg text-left text-xs cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF7EE] dark:bg-[#172D47] text-[#15803D] dark:text-[#34D399] font-bold border border-[#CBE4CB] dark:border-[#1F3B5C] shadow-2xs'
                        : 'text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F2ECE1] dark:hover:bg-[#13253A] hover:text-[#1E3A8A] dark:hover:text-[#FAF7F2] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#15803D] dark:text-[#34D399]' : 'text-[#4B6584] dark:text-[#8DA4BE]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 3: Evidence, Compendium & Audit */}
            <div className="space-y-0.5 pt-2 border-t border-[#E5DDD0] dark:border-[#1F3B5C]">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-[#8DA4BE] font-mono">
                Compendium &amp; Governance
              </div>
              {evidenceGovernanceItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-all rounded-lg text-left text-xs cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF7EE] dark:bg-[#172D47] text-[#15803D] dark:text-[#34D399] font-bold border border-[#CBE4CB] dark:border-[#1F3B5C] shadow-2xs'
                        : 'text-[#1E3A5F] dark:text-[#D8E2ED] hover:bg-[#F2ECE1] dark:hover:bg-[#13253A] hover:text-[#1E3A8A] dark:hover:text-[#FAF7F2] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#15803D] dark:text-[#34D399]' : 'text-[#4B6584] dark:text-[#8DA4BE]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer Area: User Profile & Admin Portal */}
        <div className="p-3 border-t border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FFFDF9] dark:bg-[#0D1926] space-y-2">
          {isAuthenticated && clinician ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4EFE6] dark:bg-[#13253A] border border-[#E5DDD0] dark:border-[#1F3B5C]">
              <button
                type="button"
                onClick={() => openPersonalizedModal()}
                className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:opacity-85 transition-opacity"
                title="Open My Personalized Workspace"
              >
                <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {clinician.name ? clinician.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-[#1E3A8A] dark:text-[#FAF7F2] truncate flex items-center gap-1">
                    <span>{clinician.name}</span>
                  </div>
                  <div className="text-[10px] text-[#4B6584] dark:text-[#8DA4BE] truncate">
                    @{clinician.username || 'clinician'} · {savedCases.length} saved
                  </div>
                </div>
              </button>
              <button
                onClick={signOut}
                type="button"
                className="p-1 rounded-lg text-[#4B6584] hover:text-[#DC2626] hover:bg-white dark:hover:bg-[#0D1926] transition-colors cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Quick link to Admin Database & Security Vault */}
          {onOpenAdminDatabase && (
            <button
              onClick={onOpenAdminDatabase}
              type="button"
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF7F2] dark:bg-[#13253A] hover:bg-[#F2ECE1] dark:hover:bg-[#172D47] border border-[#E5DDD0] dark:border-[#1F3B5C] text-[11px] font-semibold text-[#1E3A8A] dark:text-[#34D399] flex items-center justify-between transition-colors cursor-pointer"
              title="Open Anonymized Clinical Database & Admin Dashboard (⌘⇧D)"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#15803D] dark:text-[#34D399]">admin_panel_settings</span>
                <span>Admin DB</span>
              </div>
              <span className="text-[9px] font-mono text-[#4B6584] bg-[#EEF7EE] dark:bg-[#0D1926] px-1 py-0.5 rounded border border-[#CBE4CB] dark:border-[#1F3B5C]">
                ⌘⇧D
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
