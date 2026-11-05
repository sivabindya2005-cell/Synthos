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
  const { clinician, isAuthenticated, signOut, openAuthModal } = useAuth();

  // Section 1: Core Decision Support
  const coreClinicalItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Clinical Portal Home', icon: 'home' },
    { id: 'overview', label: 'Triage & Risk Matrix', icon: 'grid_view' },
    { id: 'twin', label: 'Digital Twin Simulation', icon: 'tune' },
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel with Deep Teal, Navy, Pale Mint & Slate Hierarchy */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#071321] z-50 flex flex-col justify-between border-r border-slate-200 dark:border-[#1E3A5A] shadow-[0_1px_4px_rgba(11,37,69,0.04)] transition-transform duration-250 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Application navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#1E3A5A] bg-white/95 dark:bg-[#071321]/95 backdrop-blur-sm">
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
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-[#0B2545] dark:hover:text-white hover:bg-[#E6F4F1] dark:hover:bg-[#0F2137] cursor-pointer"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Patient Quick Card - Pale Mint Tint Container */}
          <div className="p-3">
            <div className="bg-[#E6F4F1] dark:bg-[#0F2137] rounded-xl p-3 border border-[#BEE3DB] dark:border-[#1E3A5A] shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#0B2545] dark:text-[#F8FAFC] tracking-wider">
                    {activePatient.id}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">· Synthetic</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#071321] text-[#0F766E] dark:text-[#14B8A6] border border-[#BEE3DB] dark:border-[#1E3A5A] font-bold">
                  {activePatient.tier}
                </span>
              </div>
              <div className="text-xs text-[#334155] dark:text-slate-300 font-medium">
                {activePatient.biometrics.age} Y {activePatient.biometrics.sex} · SCr {activePatient.organStatus.renal.scr.toFixed(2)} mg/dL
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-[#BEE3DB]/80 dark:border-[#1E3A5A] flex items-center justify-between">
                <span className="text-[11px] text-[#334155] dark:text-slate-400 font-medium">eGFR (CKD-EPI)</span>
                <span className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-bold font-mono">
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
                  className="w-full mt-2.5 py-1.5 px-2 rounded-lg bg-white dark:bg-[#132B42] hover:bg-[#D4ECE6] dark:hover:bg-[#1E3A5A] border border-[#BEE3DB] dark:border-[#1E3A5A] text-[#0F766E] dark:text-[#14B8A6] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Personalize and titrate patient-specific medications"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#0F766E] dark:text-[#14B8A6]">tune</span>
                  <span>Personalize Regimen</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-2.5 overflow-y-auto space-y-3.5 pb-4">
            {/* Section 1: Core Decision Support */}
            <div className="space-y-0.5">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0B2545] dark:text-slate-400 font-mono">
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
                        ? 'bg-[#E6F4F1] dark:bg-[#132B42] text-[#0F766E] dark:text-[#14B8A6] font-bold border border-[#BEE3DB] dark:border-[#1E3A5A] shadow-2xs'
                        : 'text-[#334155] dark:text-slate-300 hover:bg-[#E6F4F1]/60 dark:hover:bg-[#0F2137] hover:text-[#0B2545] dark:hover:text-[#F8FAFC] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 2: Diagnostics & Informatics */}
            <div className="space-y-0.5 pt-2 border-t border-slate-200/90 dark:border-[#1E3A5A]">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0B2545] dark:text-slate-400 font-mono">
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
                        ? 'bg-[#E6F4F1] dark:bg-[#132B42] text-[#0F766E] dark:text-[#14B8A6] font-bold border border-[#BEE3DB] dark:border-[#1E3A5A] shadow-2xs'
                        : 'text-[#334155] dark:text-slate-300 hover:bg-[#E6F4F1]/60 dark:hover:bg-[#0F2137] hover:text-[#0B2545] dark:hover:text-[#F8FAFC] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 3: Evidence & Compendium */}
            <div className="space-y-0.5 pt-2 border-t border-slate-200/90 dark:border-[#1E3A5A]">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0B2545] dark:text-slate-400 font-mono">
                Evidence &amp; Compendium
              </div>
              {evidenceGovernanceItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-all rounded-lg text-left text-xs cursor-pointer ${
                      isActive
                        ? 'bg-[#E6F4F1] dark:bg-[#132B42] text-[#0F766E] dark:text-[#14B8A6] font-bold border border-[#BEE3DB] dark:border-[#1E3A5A] shadow-2xs'
                        : 'text-[#334155] dark:text-slate-300 hover:bg-[#E6F4F1]/60 dark:hover:bg-[#0F2137] hover:text-[#0B2545] dark:hover:text-[#F8FAFC] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-slate-400 dark:text-slate-500'
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

        {/* Footer User & Admin Area */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E3A5A] bg-white/95 dark:bg-[#071321]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#E6F4F1] dark:bg-[#0F2137] text-[#0F766E] dark:text-[#14B8A6] border border-[#BEE3DB] dark:border-[#1E3A5A] flex items-center justify-center font-bold text-xs shrink-0">
                {isAuthenticated ? (clinician?.name ? clinician.name.charAt(0) : 'C') : 'G'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#0B2545] dark:text-[#F8FAFC] truncate">
                  {isAuthenticated ? clinician?.name || 'Authorized Clinician' : 'Clinician Guest'}
                </div>
                <span className="text-[10px] text-[#334155] dark:text-slate-400 truncate block">
                  {isAuthenticated
                    ? `${clinician?.credentials || 'PharmD, BCPS'} · Evaluator`
                    : 'Sandbox evaluation mode'}
                </span>
              </div>
            </div>

            {isAuthenticated ? (
              <button
                onClick={signOut}
                type="button"
                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-[#DC2626] hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#1E3A5A] rounded-md transition-colors shrink-0 cursor-pointer"
                title="Sign Out to Guest Mode"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => openAuthModal()}
                type="button"
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#14B8A6] hover:bg-[#0F766E] rounded-md transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Sign In with Clinician Credentials"
              >
                <span className="material-symbols-outlined text-[13px]">lock_open</span>
                <span>Sign In</span>
              </button>
            )}
          </div>

          {onOpenAdminDatabase && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/90 dark:border-[#1E3A5A] flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Vault Storage</span>
              <button
                onClick={() => {
                  onOpenAdminDatabase();
                  if (onCloseMobile) onCloseMobile();
                }}
                type="button"
                className="text-[10px] font-medium text-[#0F766E] hover:text-[#0B2545] dark:text-[#14B8A6] flex items-center gap-1 cursor-pointer transition-colors"
                title="Simulation Telemetry Database (Admin Tracking Only)"
              >
                <span className="material-symbols-outlined text-[13px] text-[#14B8A6]">database</span>
                <span>Admin DB (⌘⇧D)</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
