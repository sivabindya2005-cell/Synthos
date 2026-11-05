import React from 'react';
import { useClinicianAuth } from '../../context/AuthContext';

export const DisclaimerModal: React.FC = () => {
  const { disclaimerAccepted, acceptDisclaimer } = useClinicianAuth();

  if (disclaimerAccepted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Clinical Decision Support Terms & Disclaimer"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-scale-in">
        {/* Banner */}
        <div className="p-6 bg-[#0f2b38] dark:bg-[#07131a] text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-teal-300 font-bold">
              PROFESSIONAL CLINICAL DECISION SUPPORT
            </span>
          </div>

          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Important Medical &amp; Regulatory Positioning
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Please read and acknowledge the positioning of SYNTHOS before proceeding.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] shrink-0 mt-0.5">
              shield
            </span>
            <div>
              <strong className="font-bold block text-sm">Educational Decision Support Only</strong>
              <span>
                SYNTHOS is designed exclusively as an educational and research clinical decision support tool for qualified healthcare professionals (pharmacists, physicians, clinical pharmacologists, and supervised trainees).
              </span>
            </div>
          </div>

          <div className="space-y-2 text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
              Key Principles &amp; Limitations:
            </h4>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Not a Substitute for Clinical Judgment:</strong> This platform does not provide autonomous prescribing directives. All dosage titrations and pharmacokinetic simulations must be corroborated against formal prescribing information and institutional protocols.
              </li>
              <li>
                <strong>Synthetic &amp; De-identified Data Only:</strong> Users must never input Protected Health Information (PHI) including patient names, initials, medical record numbers, dates of birth, or addresses.
              </li>
              <li>
                <strong>Deterministic Math:</strong> All calculations (Cockcroft-Gault, CKD-EPI 2021, one-compartment half-life prolongation, steady-state peaks) are generated deterministically by algorithmic equations, not generative AI.
              </li>
              <li>
                <strong>AI Role:</strong> AI features are strictly limited to plain-language evidence synthesis and clinical guideline clarification grounded in verified medical literature.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Regulatory Classification: FDA Non-Device CDS (21 U.S.C. 360j(o)(1)(E)) &amp; HIPAA Safe Harbor (45 CFR § 164.514).
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={acceptDisclaimer}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>I Acknowledge &amp; Accept Terms</span>
          </button>
        </div>
      </div>
    </div>
  );
};
