import React, { useState } from 'react';
import { PatientCase, MedicationItem } from '../../types/clinical';

interface MedicationReviewViewProps {
  patient: PatientCase;
  onOpenRenalMath: () => void;
  onOpenSimulator: () => void;
  onOpenProvenance?: (id: string) => void;
  onOpenPersonalizeRegimen?: () => void;
}

export const MedicationReviewView: React.FC<MedicationReviewViewProps> = ({
  patient,
  onOpenRenalMath,
  onOpenSimulator,
  onOpenProvenance,
  onOpenPersonalizeRegimen
}) => {
  const [selectedMed, setSelectedMed] = useState<MedicationItem>(patient.medications[0]);
  const [adjustedDose, setAdjustedDose] = useState<string>('500 mg BID');
  const [stagedNotice, setStagedNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="bg-[#0d1c32] text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <span className="text-xs font-mono text-[#86f2e4] font-bold">COMPREHENSIVE REGIMEN REVIEW</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Medication Reconciliation &amp; Dosing Optimization
          </h2>
          <p className="text-xs text-[#76849f]">
            Indication verification, renal elimination banding, and evidence-grounded therapeutic drug monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          {onOpenPersonalizeRegimen && (
            <button
              onClick={onOpenPersonalizeRegimen}
              className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#EEF7EE]0 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Personalize Regimen</span>
            </button>
          )}
          <button
            onClick={onOpenRenalMath}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Renal Equations</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#006f66] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            <span>Simulate Titration</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-bold text-[#4B6584] uppercase tracking-wider px-1">
            Current Regimen ({patient.medications.length} items)
          </div>
          {patient.medications.map((med) => {
            const isSelected = selectedMed.id === med.id;
            const isFlagged = med.safetyStatus === 'flagged';
            const isContra = med.safetyStatus === 'contraindicated';

            return (
              <div
                key={med.id}
                onClick={() => setSelectedMed(med)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#15803D] bg-white shadow-sm ring-1 ring-[#15803D]'
                    : 'border-[#E5DDD0] bg-white hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#1E3A8A]">{med.name}</span>
                  {isFlagged && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] font-bold border border-[#fde68a]">
                      Dose Adjustment
                    </span>
                  )}
                  {isContra && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] font-bold border border-[#fecaca]">
                      Contraindicated
                    </span>
                  )}
                  {!isFlagged && !isContra && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#065f46] font-bold border border-[#a7f3d0]">
                      Standard Dose
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#4B6584] font-mono">{med.dose} • {med.frequency}</div>
                <div className="text-[11px] text-[#15803D] mt-1">{med.therapeuticClass}</div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5DDD0] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
            <div>
              <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">
                Drug Monograph &amp; Pharmacokinetic Profile
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#1E3A8A] mt-0.5">
                {selectedMed.name}
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-[#F4EFE6] text-[#1E3A8A] font-bold border border-[#cbd5e1]">
              Daily: {selectedMed.totalDailyDose}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0]">
              <span className="text-[10px] font-bold text-[#4B6584] uppercase block mb-1">Therapeutic Class</span>
              <span className="text-[#1E3A8A] font-semibold">{selectedMed.therapeuticClass}</span>
            </div>
            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E5DDD0]">
              <span className="text-[10px] font-bold text-[#4B6584] uppercase block mb-1">Route &amp; Frequency</span>
              <span className="text-[#1E3A8A] font-semibold">{selectedMed.route} • {selectedMed.frequency}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] text-xs space-y-2">
            <span className="font-bold text-[#0f2b38] block">Metabolic &amp; Clearance Pathway</span>
            <p className="text-[#44474d] leading-relaxed">
              <strong>Mechanism:</strong> {selectedMed.metabolism}.
            </p>
            <p className="text-[#92400e] font-medium">
              <strong>Patient-Specific Telemetry:</strong> {selectedMed.metabolismDetail}.
            </p>
          </div>

          {/* Guideline Citation Box */}
          <div className="p-3.5 bg-[#fef3c7]/30 border border-[#fde68a] rounded-lg text-xs space-y-2 text-[#92400e]">
            <div className="font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Evidence Recommendation: {selectedMed.guidelineCitation}</span>
              </div>
              {onOpenProvenance && selectedMed.provenanceId && (
                <button
                  type="button"
                  onClick={() => onOpenProvenance(selectedMed.provenanceId!)}
                  className="px-2.5 py-1 rounded bg-[#92400e]/10 hover:bg-[#92400e]/20 text-[#92400e] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">menu_book</span>
                  <span>Inspect Evidence &amp; DOI</span>
                </button>
              )}
            </div>
            <p className="leading-relaxed">
              {selectedMed.recommendedAction || selectedMed.safetyEvaluation}
            </p>
          </div>

          {/* Titration Action Form */}
          <div className="pt-2 border-t border-[#E5DDD0] space-y-2 text-xs">
            <label className="font-bold text-[#1E3A8A] block">
              Simulated Pharmacist Modification
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adjustedDose}
                onChange={(e) => setAdjustedDose(e.target.value)}
                placeholder="e.g. 500 mg PO BID"
                className="flex-1 p-2 rounded border border-[#cbd5e1] text-xs bg-[#FAF7F2] outline-none focus:border-[#15803D]"
              />
              <button
                type="button"
                onClick={() => {
                  setStagedNotice(`Proposed modification to "${adjustedDose}" staged to clinical intervention audit trail.`);
                  setTimeout(() => setStagedNotice(null), 4000);
                }}
                className="px-4 py-2 rounded bg-[#15803D] text-white hover:bg-[#006f66] font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Stage Titration Order
              </button>
            </div>
            {stagedNotice && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>{stagedNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
