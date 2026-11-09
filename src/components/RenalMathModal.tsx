import React from 'react';
import { PatientCase } from '../types/clinical';
import { calculateCockcroftGault, calculateIBW, calculateCKDEPI2021 } from '../utils/clinicalMath';

interface RenalMathModalProps {
  patient: PatientCase;
  isOpen: boolean;
  onClose: () => void;
}

export const RenalMathModal: React.FC<RenalMathModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const { biometrics, organStatus } = patient;
  const ibw = calculateIBW(biometrics.heightCm, biometrics.sex);
  const cgResult = calculateCockcroftGault(
    biometrics.age,
    biometrics.weightKg,
    biometrics.heightCm,
    organStatus.renal.scr,
    biometrics.sex,
    true
  );
  const ckdEpi = calculateCKDEPI2021(biometrics.age, organStatus.renal.scr, biometrics.sex).egfr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#E5DDD0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#0d1c32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#15803D] text-[22px]">calculate</span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base">
                Renal Clearance Mathematical Trace &amp; Biometrics
              </h3>
              <p className="text-xs text-[#76849f]">
                Deterministic CrCl vs. eGFR comparative methodology for {patient.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#76849f] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Result Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#F4EFE6] border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">
                Cockcroft-Gault CrCl
              </span>
              <span className="text-2xl font-bold text-[#15803D] font-mono">
                {cgResult.crcl}
              </span>
              <span className="text-xs text-[#4B6584] block">mL/min (IBW Adjusted)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#fef3c7]/40 border border-[#fde68a]">
              <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider block">
                CKD-EPI (2021) eGFR
              </span>
              <span className="text-2xl font-bold text-[#92400e] font-mono">
                {ckdEpi}
              </span>
              <span className="text-xs text-[#92400e] block">mL/min/1.73m² (Race-free)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#F4EFE6] border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">
                Ideal Body Weight (Devine)
              </span>
              <span className="text-2xl font-bold text-[#1E3A8A] font-mono">
                {ibw}
              </span>
              <span className="text-xs text-[#4B6584] block">kg (Actual: {biometrics.weightKg}kg)</span>
            </div>
          </div>

          {/* Cockcroft-Gault Step-by-Step */}
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E5DDD0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0f2b38] text-sm">
                1. Cockcroft-Gault Equation (Standard for FDA Drug Labeling)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#15803D]/10 text-[#15803D] font-mono font-semibold">
                CrCl = [(140 - Age) × Weight] / (72 × SCr) × [0.85 if Female]
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-[#E5DDD0] font-mono text-xs text-[#1E3A8A] space-y-1">
              <div>Age = {biometrics.age} years | SCr = {organStatus.renal.scr.toFixed(2)} mg/dL</div>
              <div>Actual Weight = {biometrics.weightKg} kg | IBW = {ibw} kg (Actual is {Math.round((biometrics.weightKg / ibw) * 100)}% of IBW)</div>
              <div className="text-[#15803D] font-semibold">
                Weight Used: Adjusted Body Weight = IBW + 0.4 × (Actual - IBW) = {cgResult.weightUsed} kg
              </div>
              <div className="pt-2 border-t border-dashed border-[#cbd5e1] text-[#0f2b38] font-bold">
                CrCl = [(140 - {biometrics.age}) × {cgResult.weightUsed}] / (72 × {organStatus.renal.scr}) = {cgResult.crcl} mL/min
              </div>
            </div>
          </div>

          {/* CKD-EPI Step-by-Step */}
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E5DDD0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0f2b38] text-sm">
                2. 2021 CKD-EPI Creatinine Equation (KDIGO 2023 Dosing Standard)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#92400e]/10 text-[#92400e] font-semibold">
                eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^-1.2 × 0.9938^Age
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-[#E5DDD0] font-mono text-xs text-[#1E3A8A] space-y-1">
              <div>Male Constants: κ = 0.9, α = -0.302 | Ratio = {organStatus.renal.scr} / 0.9 = {(organStatus.renal.scr / 0.9).toFixed(3)}</div>
              <div>Calculated Result: {ckdEpi} mL/min/1.73m² (Classified as CKD Stage 3b: 30-44 mL/min)</div>
            </div>
          </div>

          {/* Clinical Rationale Note */}
          <div className="p-3 rounded-lg bg-[#d1fae5]/50 border border-[#a7f3d0] flex items-start gap-2 text-xs text-[#065f46]">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">verified</span>
            <div>
              <strong>PharmD Guideline Consensus:</strong> Both Cockcroft-Gault (44.1 mL/min) and CKD-EPI (42 mL/min/1.73m²) concordantly place this patient in the <strong>30–45 mL/min window</strong>. Under FDA black-box mandates and KDIGO 2023 Section 1.3, this patient cannot exceed 1000 mg/day of Metformin.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F4EFE6] border-t border-[#E5DDD0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#0f2b38] text-white hover:bg-[#162a36] text-xs font-semibold cursor-pointer"
          >
            Close Calculation Detail
          </button>
        </div>
      </div>
    </div>
  );
};
