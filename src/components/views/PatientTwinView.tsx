import React, { useState } from 'react';
import { PatientCase } from '../../types/clinical';
import { calculateCockcroftGault, calculateCKDEPI2021, calculateIBW } from '../../utils/clinicalMath';

interface PatientTwinViewProps {
  patient: PatientCase;
  onOpenRenalMath: () => void;
  onOpenSimulator: () => void;
}

export const PatientTwinView: React.FC<PatientTwinViewProps> = ({
  patient,
  onOpenRenalMath,
  onOpenSimulator
}) => {
  const { biometrics, organStatus } = patient;
  const ibw = calculateIBW(biometrics.heightCm, biometrics.sex);
  const cg = calculateCockcroftGault(biometrics.age, biometrics.weightKg, biometrics.heightCm, organStatus.renal.scr, biometrics.sex);
  const ckdEpi = calculateCKDEPI2021(biometrics.age, organStatus.renal.scr, biometrics.sex).egfr;

  const [activeOrganTab, setActiveOrganTab] = useState<'renal' | 'hepatic' | 'cardiac' | 'pgx'>('renal');

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse"></span>
            <span className="text-xs font-mono text-[#86f2e4] font-bold">DIGITAL ORGAN TWIN ARCHITECTURE</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white">{patient.id}</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Physiological Organ Clearance &amp; Pharmacogenomics Twin
          </h2>
          <p className="text-xs text-[#76849f]">
            Multivariate pharmacokinetic parameter modeling based on synthetic laboratory telemetry.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenRenalMath}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Verify Equations</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-3 py-1.5 rounded bg-[#006a61] hover:bg-[#006f66] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Simulate Stress Test</span>
          </button>
        </div>
      </div>

      {/* Organ Systems Navigation */}
      <div className="flex border-b border-[#e2e8f0] bg-white rounded-t-xl px-4 pt-2 gap-2 text-xs font-semibold">
        {[
          { id: 'renal', label: 'Renal Elimination (eGFR & CrCl)', icon: 'water_drop' },
          { id: 'hepatic', label: 'Hepatic Function & CYP450', icon: 'biotech' },
          { id: 'cardiac', label: 'Cardiovascular & Electrolytes', icon: 'favorite' },
          { id: 'pgx', label: 'Pharmacogenomics (PGx Panel)', icon: 'dna' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveOrganTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeOrganTab === tab.id
                ? 'border-[#006a61] text-[#006a61] font-bold bg-[#006a61]/5'
                : 'border-transparent text-[#475569] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-b-xl border border-t-0 border-[#e2e8f0] p-5 shadow-2xs">
        {activeOrganTab === 'renal' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#fef3c7]/30 border border-[#fde68a]">
                <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider block">CKD Classification</span>
                <span className="text-xl font-bold text-[#92400e] mt-1 block">Stage 3b CKD</span>
                <span className="text-xs text-[#92400e]">Moderate to Severe Impairment</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">2021 CKD-EPI eGFR</span>
                <span className="text-xl font-bold text-[#191c1e] font-mono mt-1 block">{ckdEpi} mL/min/1.73m²</span>
                <span className="text-xs text-[#475569]">Race-free standardized equation</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Cockcroft-Gault CrCl</span>
                <span className="text-xl font-bold text-[#006a61] font-mono mt-1 block">{cg.crcl} mL/min</span>
                <span className="text-xs text-[#475569]">AdjBW {cg.weightUsed} kg applied</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">BUN / SCr Ratio</span>
                <span className="text-xl font-bold text-[#191c1e] font-mono mt-1 block">
                  {(organStatus.renal.bun / organStatus.renal.scr).toFixed(1)}
                </span>
                <span className="text-xs text-[#475569]">Normal intrinsic renal ratio (&lt;20)</span>
              </div>
            </div>

            {/* Renal Clearance Drug Banding Matrix */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="p-3 bg-[#f2f4f6] font-bold text-xs text-[#191c1e] flex items-center justify-between">
                <span>Renal Dose Adjustment Banding for Current Regimen</span>
                <span className="text-[11px] text-[#006a61] font-medium">Standard of Care: FDA + KDIGO 2023</span>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#fef3c7]/40 border border-[#fde68a] flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#92400e]">Metformin Hydrochloride</span>
                    <p className="text-xs text-[#44474d] mt-1">
                      Target Range: eGFR 30–44 mL/min/1.73m². Current dose (2000 mg/day) exceeds 1000 mg/day regulatory cap.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#fef3c7] text-[#92400e] font-bold text-[11px] shrink-0 border border-[#fde68a]">
                    ACTION: Cap at 500mg BID
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#f2f4f6] border border-[#e2e8f0] flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#191c1e]">Lisinopril</span>
                    <p className="text-xs text-[#44474d] mt-1">
                      Clearance: Primary renal filtration. Dose 20mg is therapeutic for proteinuria, but monitor for hyperkalemia given K+ 4.9.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-white text-[#475569] font-medium text-[11px] shrink-0 border border-[#cbd5e1]">
                    MONITOR: Recheck BMP in 14d
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#d1fae5]/50 border border-[#a7f3d0] flex items-start justify-between">
                  <div>
                    <span className="font-bold text-[#065f46]">Atorvastatin Calcium</span>
                    <p className="text-xs text-[#44474d] mt-1">
                      Biliary/hepatic clearance (&gt;98%). No dose adjustment required in renal insufficiency.
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#d1fae5] text-[#065f46] font-bold text-[11px] shrink-0 border border-[#a7f3d0]">
                    VERIFIED: Optimal Dose
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeOrganTab === 'hepatic' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#d1fae5]/30 border border-[#a7f3d0]">
                <span className="text-[11px] font-bold text-[#065f46] uppercase tracking-wider block">Child-Pugh Score</span>
                <span className="text-2xl font-bold text-[#065f46] mt-1 block">Class A (Score 5)</span>
                <span className="text-xs text-[#065f46]">Well-compensated hepatic function</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Liver Enzymes</span>
                <span className="text-xl font-bold text-[#191c1e] font-mono mt-1 block">
                  ALT 22 U/L • AST 24 U/L
                </span>
                <span className="text-xs text-[#475569]">Baseline within normal reference</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Total Bilirubin &amp; Albumin</span>
                <span className="text-xl font-bold text-[#191c1e] font-mono mt-1 block">
                  0.8 mg/dL • 4.1 g/dL
                </span>
                <span className="text-xs text-[#475569]">Synthetic liver capacity intact</span>
              </div>
            </div>
            <p className="text-[#475569] leading-relaxed">
              Hepatic phase I oxidation and phase II glucuronidation pathways are fully functional for this patient profile. Atorvastatin clearance is unhindered; however, concurrent CYP3A4 inhibitors (e.g., Clarithromycin or Azoles) should be flagged to avoid myopathy risk.
            </p>
          </div>
        )}

        {activeOrganTab === 'cardiac' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#fef3c7]/30 border border-[#fde68a]">
                <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider block">Blood Pressure Target</span>
                <span className="text-2xl font-bold text-[#92400e] mt-1 block">138/84 mmHg</span>
                <span className="text-xs text-[#92400e]">Stage 1 HTN (Target &lt;130/80 mmHg in CKD)</span>
              </div>
              <div className="p-4 rounded-xl bg-[#fef3c7]/30 border border-[#fde68a]">
                <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider block">Serum Potassium (K+)</span>
                <span className="text-2xl font-bold text-[#92400e] font-mono mt-1 block">4.9 mEq/L</span>
                <span className="text-xs text-[#92400e]">Borderline ceiling (&gt;5.0 triggers ACEi taper)</span>
              </div>
              <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Cardiac Rhythm</span>
                <span className="text-2xl font-bold text-[#191c1e] mt-1 block">68 bpm NSR</span>
                <span className="text-xs text-[#475569]">Normal Sinus Rhythm, QTc 418ms</span>
              </div>
            </div>
          </div>
        )}

        {activeOrganTab === 'pgx' && (
          <div className="space-y-4 text-xs">
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#f2f4f6] text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Gene</th>
                    <th className="p-2.5">Genotype</th>
                    <th className="p-2.5">Phenotype</th>
                    <th className="p-2.5">Impacted Drugs</th>
                    <th className="p-2.5">CPIC Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  <tr>
                    <td className="p-2.5 font-bold text-[#191c1e]">CYP2C19</td>
                    <td className="p-2.5 font-mono">*1/*1</td>
                    <td className="p-2.5 text-[#065f46] font-semibold">Normal Metabolizer</td>
                    <td className="p-2.5">Omeprazole, Clopidogrel</td>
                    <td className="p-2.5 text-[#475569]">Standard therapeutic dosing.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#191c1e]">CYP2C9</td>
                    <td className="p-2.5 font-mono">{patient.id === 'DEMO-PT-0108' ? '*3/*3' : '*1/*1'}</td>
                    <td className={`p-2.5 font-semibold ${patient.id === 'DEMO-PT-0108' ? 'text-[#991b1b]' : 'text-[#065f46]'}`}>
                      {patient.id === 'DEMO-PT-0108' ? 'Poor Metabolizer' : 'Normal Metabolizer'}
                    </td>
                    <td className="p-2.5">Warfarin, Glipizide, Celecoxib</td>
                    <td className="p-2.5 text-[#475569]">
                      {patient.id === 'DEMO-PT-0108' ? '70-80% dose reduction required or DOAC' : 'Standard starting dose.'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#191c1e]">SLCO1B1</td>
                    <td className="p-2.5 font-mono">521T&gt;T</td>
                    <td className="p-2.5 text-[#065f46] font-semibold">Normal Transporter Function</td>
                    <td className="p-2.5">Atorvastatin, Simvastatin</td>
                    <td className="p-2.5 text-[#475569]">Low risk of statin-associated myopathy.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
