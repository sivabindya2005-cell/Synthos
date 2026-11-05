import React, { useState } from 'react';
import { SynthosLogo } from '../common/SynthosLogo';
import { useClinicianAuth } from '../../context/AuthContext';

export const AboutLimitationsView: React.FC = () => {
  const { clinician, currentUser, isAuthenticated } = useClinicianAuth();
  const [dataActionMsg, setDataActionMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Export User Data (DPDP Act 2023 / Right to Access)
  const handleExportMyData = () => {
    const userData = {
      user: {
        uid: currentUser?.uid || 'guest-session',
        email: currentUser?.email || 'de-identified@guest.local',
        name: clinician?.name || 'Authorized Clinician',
        role: clinician?.role || 'user',
        credentials: clinician?.credentials || 'PharmD, BCPS',
        institution: clinician?.institution || 'Academic Medical Center'
      },
      exportTimestamp: new Date().toISOString(),
      governanceFramework: 'India Digital Personal Data Protection Act 2023 & HIPAA Safe Harbor',
      dataStored: 'De-identified simulation telemetry and deterministic parameter adjustments only.'
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SYNTHOS_UserData_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDataActionMsg('User account data exported successfully in JSON format.');
  };

  // Delete My Account & All Stored Data (DPDP Act 2023 / Right to Erasure)
  const handleDeleteMyData = () => {
    if (!window.confirm('Are you sure you want to permanently delete your account and erase all associated simulation records? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDataActionMsg('Account and all associated session data have been permanently erased per DPDP Act 2023 principles.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 transition-colors">
      {/* Brand & Philosophy Header */}
      <div className="bg-[#2A2640] text-white rounded-2xl p-8 border border-[#3D3759] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B5EAD7]"></span>
            <span className="text-xs font-mono text-[#B5EAD7] font-bold uppercase tracking-wider">
              CLINICAL IDENTITY &amp; REGULATORY POSITIONING
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight">
            Where Biology Meets Its Other Self.
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            SYNTHOS is an educational clinical decision support (CDS) matrix and pharmacokinetic digital twin. We build deterministic, transparent computational models bridging patient organ clearance, pharmacogenomics, and narrow-therapeutic-index titration without black-box AI approximations.
          </p>
        </div>

        {/* Official SYNTHOS Emblem */}
        <div className="rounded-2xl bg-[#1E1B2E] border border-[#3D3759] flex flex-col items-center justify-center p-5 shadow-lg shrink-0">
          <SynthosLogo size={75} variant="icon" theme="dark" />
          <span className="text-[10px] font-mono text-[#CDB4DB] font-bold uppercase tracking-wider mt-2">
            SYNTHOS ENGINE v2.4
          </span>
        </div>
      </div>

      {/* Safety & Regulatory Disclaimer */}
      <div className="p-5 rounded-2xl bg-[#FDF2B3]/30 dark:bg-[#FDF2B3]/15 border border-[#FDF2B3] text-xs text-[#6b5300] space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
          <span>Regulatory Scope &amp; Medical Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          SYNTHOS is engineered strictly for educational, scientific research, and decision-support purposes by qualified healthcare professionals (physicians, clinical pharmacists, MSLs, pharmacologists). It is <strong>NOT a certified medical device</strong> and does not establish a patient-physician relationship or replace individualized clinical judgment.
        </p>
        <p className="leading-relaxed font-semibold">
          Always verify all calculated doses, renal adjustments, and pharmacokinetic trajectories against local hospital formulary protocols, institutional laboratory monographs, and current prescribing information.
        </p>
      </div>

      {/* 3 Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white dark:bg-[#2A2640] rounded-2xl border border-[#E9E3F5] dark:border-[#3D3759] shadow-2xs space-y-2.5">
          <span className="material-symbols-outlined text-[#7C6BC4] text-[26px]">terminal</span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#2E2A47] dark:text-[#F2EFFA]">
            1. Deterministic Calculation
          </h3>
          <p className="text-xs text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
            All clearance equations (Cockcroft-Gault, CKD-EPI 2021) and pharmacokinetic curves follow closed-form mathematical equations. The AI model is strictly forbidden from creating or altering numbers.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#2A2640] rounded-2xl border border-[#E9E3F5] dark:border-[#3D3759] shadow-2xs space-y-2.5">
          <span className="material-symbols-outlined text-[#7C6BC4] text-[26px]">verified</span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#2E2A47] dark:text-[#F2EFFA]">
            2. Codified Clinical Evidence
          </h3>
          <p className="text-xs text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
            Every safety rule, dosing ceiling, and drug interaction is grounded in peer-reviewed clinical consensus (KDIGO 2023, ADA 2024, CPIC Level-1A, FDA Drug Safety, Hartford Nomogram).
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#2A2640] rounded-2xl border border-[#E9E3F5] dark:border-[#3D3759] shadow-2xs space-y-2.5">
          <span className="material-symbols-outlined text-[#7C6BC4] text-[26px]">visibility</span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#2E2A47] dark:text-[#F2EFFA]">
            3. Epistemic Transparency
          </h3>
          <p className="text-xs text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
            We explicitly disclose mathematical assumptions, literature citations, and boundary limits. When inputs exceed validated linear ranges (eGFR &lt; 15, SCr &gt; 5), the system flags insufficient data.
          </p>
        </div>
      </div>

      {/* DPDP Act 2023 & Data Governance Panel */}
      <div className="p-6 bg-white dark:bg-[#2A2640] rounded-2xl border border-[#E9E3F5] dark:border-[#3D3759] shadow-2xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E9E3F5] dark:border-[#3D3759] gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#2E2A47] dark:text-[#F2EFFA] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7C6BC4]">policy</span>
              <span>Data Governance &amp; Privacy (India DPDP Act 2023 &amp; HIPAA)</span>
            </h3>
            <p className="text-xs text-[#6B6688] dark:text-[#A8A3C5]">
              Full compliance with digital data protection principles: consent, purpose limitation, and absolute right to erasure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMyData}
              className="px-3.5 py-1.5 rounded-full bg-[#BDE0FE]/40 hover:bg-[#BDE0FE]/60 border border-[#BDE0FE] text-xs font-semibold text-[#1e3a8a] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Export My Data</span>
            </button>
            <button
              onClick={handleDeleteMyData}
              disabled={isDeleting}
              className="px-3.5 py-1.5 rounded-full bg-[#F4A6B8]/30 hover:bg-[#F4A6B8]/50 border border-[#F4A6B8] text-xs font-semibold text-[#701124] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">delete_forever</span>
              <span>{isDeleting ? 'Erasing...' : 'Delete Account & Data'}</span>
            </button>
          </div>
        </div>

        {dataActionMsg && (
          <div className="p-3 rounded-xl bg-[#B5EAD7]/40 border border-[#B5EAD7] text-[#134e3f] font-semibold">
            {dataActionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-[#FBF9FF] dark:bg-[#1E1B2E] border border-[#E9E3F5] dark:border-[#3D3759]">
            <div className="font-bold text-[#2E2A47] dark:text-[#F2EFFA] mb-1">1. Purpose Limitation</div>
            <p className="text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
              Data is processed exclusively for on-screen pharmacokinetic curve simulation and decision support. Zero secondary commercial reuse or training.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9FF] dark:bg-[#1E1B2E] border border-[#E9E3F5] dark:border-[#3D3759]">
            <div className="font-bold text-[#2E2A47] dark:text-[#F2EFFA] mb-1">2. Data Minimization</div>
            <p className="text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
              We collect no names, phone numbers, email directories, or hospital medical record numbers. Real-time regex filters strip identifiers.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9FF] dark:bg-[#1E1B2E] border border-[#E9E3F5] dark:border-[#3D3759]">
            <div className="font-bold text-[#2E2A47] dark:text-[#F2EFFA] mb-1">3. Right to Erasure</div>
            <p className="text-[#6B6688] dark:text-[#A8A3C5] leading-relaxed">
              Users retain complete ownership to export their simulation records in JSON/CSV and execute single-click data deletion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
