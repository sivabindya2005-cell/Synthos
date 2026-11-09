import React, { useState } from 'react';
import { useClinicianAuth } from '../../context/AuthContext';
import { AnonymousCaseRecord } from '../../firebase';

interface PersonalizedCasesModalProps {
  onLoadCaseIntoTwin?: (caseRecord: AnonymousCaseRecord) => void;
  onSaveCurrentTwin?: (title?: string) => Promise<void>;
  activePatientName?: string;
}

export const PersonalizedCasesModal: React.FC<PersonalizedCasesModalProps> = ({
  onLoadCaseIntoTwin,
  onSaveCurrentTwin,
  activePatientName
}) => {
  const {
    isPersonalizedModalOpen,
    closePersonalizedModal,
    clinician,
    profile,
    savedCases,
    isLoadingSavedCases,
    refreshSavedCases,
    deleteSavedCase,
    updateProfileData,
    exportMyData,
    openAuthModal,
    isAuthenticated
  } = useClinicianAuth();

  const [activeTab, setActiveTab] = useState<'cases' | 'regimens' | 'profile'>('cases');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [isSavingCurrent, setIsSavingCurrent] = useState<boolean>(false);
  const [customCaseNote, setCustomCaseNote] = useState<string>('');

  // Profile edit state
  const [editName, setEditName] = useState(clinician.name || '');
  const [editCredentials, setEditCredentials] = useState(clinician.credentials || '');
  const [editInstitution, setEditInstitution] = useState(clinician.institution || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  if (!isPersonalizedModalOpen) return null;

  const handleRestoreCase = (c: AnonymousCaseRecord) => {
    if (onLoadCaseIntoTwin) {
      onLoadCaseIntoTwin(c);
      setSuccessNote(`Loaded ${c.anonymousCaseId} into interactive Digital Twin Workstation!`);
      setTimeout(() => {
        setSuccessNote(null);
        closePersonalizedModal();
      }, 1200);
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!window.confirm('Delete this saved personalized case from your cloud vault?')) return;
    setDeletingId(caseId);
    try {
      await deleteSavedCase(caseId);
      setSuccessNote('Case deleted from your personal vault.');
      setTimeout(() => setSuccessNote(null), 2500);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveCurrent = async () => {
    if (!onSaveCurrentTwin) return;
    setIsSavingCurrent(true);
    try {
      await onSaveCurrentTwin(customCaseNote.trim() || undefined);
      setCustomCaseNote('');
      setSuccessNote('Current patient simulation saved to your personal cases!');
      setTimeout(() => setSuccessNote(null), 3000);
    } catch (err: any) {
      alert(`Could not save case: ${err.message}`);
    } finally {
      setIsSavingCurrent(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfileData({
        displayName: editName.trim(),
        credentials: editCredentials.trim(),
        institution: editInstitution.trim()
      });
      setSuccessNote('Profile preferences updated successfully.');
      setTimeout(() => setSuccessNote(null), 3000);
    } catch (err: any) {
      alert(`Profile update failed: ${err.message}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="My Personalized Clinical Workspace"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-scale-in max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-[#0B1528] text-white relative border-b border-cyan-500/20">
          <button
            onClick={closePersonalizedModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-teal-400 text-[18px]">workspace_premium</span>
                <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-300 font-bold">
                  PERSONALIZED WORKSPACE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-900/60 text-teal-300 border border-teal-500/30">
                  Cloud Synced
                </span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white flex items-center gap-2">
                <span>Personalized Features Hub</span>
                <span className="text-xs font-mono font-normal text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                  @{clinician.username || 'clinician'}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshSavedCases}
                disabled={isLoadingSavedCases}
                className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                title="Refresh Cloud Sync"
              >
                <span className={`material-symbols-outlined text-[15px] ${isLoadingSavedCases ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={exportMyData}
                className="h-8 px-2.5 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-white text-xs font-medium flex items-center gap-1.5 border border-teal-600/50 cursor-pointer transition-colors"
                title="Export personal dossier as JSON"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span className="hidden sm:inline">Export Dossier</span>
              </button>
            </div>
          </div>

          {/* Clinician summary pill */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{clinician.name}</span>
            <span>·</span>
            <span>{clinician.credentials}</span>
            <span>·</span>
            <span className="text-slate-400">{clinician.institution}</span>
          </div>
        </div>

        {/* Success Alert */}
        {successNote && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">check_circle</span>
            <span>{successNote}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('cases')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cases'
                ? 'border-[#15803D] text-[#15803D] dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">folder_special</span>
            <span>My Saved Patient Twins ({savedCases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('regimens')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'regimens'
                ? 'border-[#15803D] text-[#15803D] dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span>Personalized Regimens</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#15803D] text-[#15803D] dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            <span>Profile &amp; Credentials</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SAVED CASES */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              {/* Quick Save Current Active Patient Simulation */}
              {onSaveCurrentTwin && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#15803D] text-[16px]">bookmark_add</span>
                      <span>Save Current Patient Simulation to My Cases</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Active: {activePatientName || 'Current Patient Digital Twin'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCaseNote}
                      onChange={(e) => setCustomCaseNote(e.target.value)}
                      placeholder="Optional label (e.g. ICU Titration #2)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-[#15803D] min-w-[180px]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCurrent}
                      disabled={isSavingCurrent}
                      className="py-1.5 px-3 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-60 whitespace-nowrap"
                    >
                      {isSavingCurrent ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <span className="material-symbols-outlined text-[15px]">save</span>
                      )}
                      <span>Save Twin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Cases List */}
              {isLoadingSavedCases ? (
                <div className="p-10 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#15803D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Loading your saved patient twins...</div>
                </div>
              ) : savedCases.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-teal-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[24px]">folder_off</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Saved Patient Twins Yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Run any simulation in the Digital Twin Workstation and click "Save to Cloud Vault" to persist personalized cases to your account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCases.map((c) => {
                    const isCeilingBreach = c.outputs.safetyCeilingExceeded;
                    return (
                      <div
                        key={c.id || c.anonymousCaseId}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-teal-500/50 shadow-2xs transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#1E3A8A] dark:text-cyan-400">
                              {c.anonymousCaseId}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {c.demographicDecade} · {c.biologicalSex}
                            </span>
                            {c.clinicianNotes && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                                {c.clinicianNotes}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCeilingBreach
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {isCeilingBreach ? 'Ceiling Breached' : 'Optimal Titration'}
                            </span>

                            {/* Load into Workstation */}
                            {onLoadCaseIntoTwin && (
                              <button
                                type="button"
                                onClick={() => handleRestoreCase(c)}
                                className="py-1 px-2.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                title="Restore this patient into the Digital Twin Simulator"
                              >
                                <span className="material-symbols-outlined text-[14px]">tune</span>
                                <span>Load Twin</span>
                              </button>
                            )}

                            {/* Delete Case */}
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id || '')}
                              disabled={deletingId === c.id}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Delete case"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Case Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-mono">Drug Regimen</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {c.inputs.selectedDrug} {c.inputs.doseMg}mg q{c.inputs.intervalHours}h
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-mono">Renal Clearance</span>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              eGFR {c.outputs.egfr} (CrCl {c.outputs.crcl.toFixed(1)})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-mono">Simulated t1/2</span>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {c.outputs.simulatedHalfLife}h ({c.outputs.halfLifeChangeFactor}x)
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-mono">CYP Profile</span>
                            <span className="font-mono text-cyan-600 dark:text-cyan-400">
                              {c.inputs.cypGenotype || 'CYP2D6 *1/*1'}
                            </span>
                          </div>
                        </div>

                        {/* Safety finding */}
                        {c.outputs.primarySafetyFinding && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 italic flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-amber-500 shrink-0">info</span>
                            <span className="truncate">{c.outputs.primarySafetyFinding}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONALIZED REGIMENS */}
          {activeTab === 'regimens' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                  <span className="material-symbols-outlined text-[17px]">medication</span>
                  <span>Personalized Dose Titration Protocols</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  These titration presets are tailored specifically to your patient cohort parameters and guideline safety ceilings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Low-CrCl Enoxaparin Protocol</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono font-bold">
                      eGFR &lt; 30
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Recommends 30mg subcutaneously once daily (extended interval) with mandatory anti-Xa peak monitoring 4h post-dose.
                  </p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>FDA &amp; CHEST 2024 Guideline Compliant</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">CYP2C19 Poor Metabolizer Alternative</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono font-bold">
                      *2/*2 Variant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Avoid clopidogrel due to 68% prodrug activation reduction. Substitute Prasugrel 10mg QD or Ticagrelor 90mg BID.
                  </p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>CPIC Tier 1 Guideline Compliant</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Vancomycin AUC24/MIC Dosing</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-mono font-bold">
                      AUC 400-600
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Target 15-20 mg/kg q12h with deterministic Bayesian peak/trough validation to minimize AKI risk.
                  </p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>IDSA / ASHP / SIDP Consensus</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Spironolactone Hyperkalemia Safeguard</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                      K+ &gt; 5.0 mEq/L
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Hard safety ceiling trigger: suspend titration if serum potassium exceeds 5.2 mEq/L or eGFR drops below 30.
                  </p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>AHA / ACC Heart Failure Protocol</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE & CREDENTIALS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {clinician.name ? clinician.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Clinician Identity &amp; Affiliation
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Username: @{clinician.username} · Role: {clinician.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#15803D]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Clinical Credentials / Title
                  </label>
                  <input
                    type="text"
                    value={editCredentials}
                    onChange={(e) => setEditCredentials(e.target.value)}
                    placeholder="PharmD, BCPS, BCCCP"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#15803D]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institution or Practice Site
                </label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  placeholder="Department of Clinical Pharmacotherapy, General Hospital"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-[#15803D]"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="py-2.5 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                {isUpdatingProfile ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">save</span>
                )}
                <span>Save Profile Preferences</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
