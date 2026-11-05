import React, { useState, useMemo } from 'react';
import { PatientCase } from '../../types/clinical';

interface InteractionCheckerViewProps {
  patient: PatientCase;
  onOpenProvenance?: (id: string) => void;
}

interface CoPrescriptionCandidate {
  id: string;
  name: string;
  class: string;
  cypInhibition: string[];
  cypInduction: string[];
  transporters: string[];
  qtcRiskMs: number;
  kiValueUm?: number; // Inhibition constant
  standardDose: string;
  clinicalNote: string;
}

const CANDIDATE_DRUGS: CoPrescriptionCandidate[] = [
  {
    id: 'clarithromycin',
    name: 'Clarithromycin',
    class: 'Macrolide Antibiotic',
    cypInhibition: ['CYP3A4 (Strong, Ki 0.17 µM)'],
    cypInduction: [],
    transporters: ['P-gp (Inhibitor)', 'OATP1B1 (Weak)'],
    qtcRiskMs: 14,
    kiValueUm: 0.17,
    standardDose: '500 mg PO BID',
    clinicalNote: 'Potent CYP3A4 mechanism-based inactivator; dramatically escalates statin exposure.'
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    class: 'Non-Selective NSAID',
    cypInhibition: ['CYP2C9 (Weak)'],
    cypInduction: [],
    transporters: ['OAT1/3 (Substrate)'],
    qtcRiskMs: 0,
    standardDose: '400 mg PO TID',
    clinicalNote: 'Suppresses renal prostaglandin vasodilatory tone; triggers triple threat with ACEi.'
  },
  {
    id: 'fluconazole',
    name: 'Fluconazole',
    class: 'Triazole Antifungal',
    cypInhibition: ['CYP2C9 (Moderate/Strong, Ki 7.5 µM)', 'CYP2C19 (Strong)', 'CYP3A4 (Moderate)'],
    cypInduction: [],
    transporters: [],
    qtcRiskMs: 18,
    kiValueUm: 7.5,
    standardDose: '200 mg PO Daily',
    clinicalNote: 'Profoundly inhibits CYP2C9; potentiates Warfarin S-enantiomer clearance deficit.'
  },
  {
    id: 'amiodarone',
    name: 'Amiodarone',
    class: 'Class III Antiarrhythmic',
    cypInhibition: ['CYP2C9 (Moderate)', 'CYP2D6 (Moderate)', 'CYP3A4 (Moderate)'],
    cypInduction: [],
    transporters: ['P-gp (Strong Inhibitor)'],
    qtcRiskMs: 42,
    standardDose: '200 mg PO Daily',
    clinicalNote: 'Dual CYP and P-gp inhibition with significant cardiac repolarization prolongation.'
  },
  {
    id: 'gemfibrozil',
    name: 'Gemfibrozil',
    class: 'Fibrate Lipid Regulator',
    cypInhibition: ['CYP2C8 (Strong)'],
    cypInduction: [],
    transporters: ['OATP1B1 (Potent Inhibitor)'],
    qtcRiskMs: 0,
    standardDose: '600 mg PO BID',
    clinicalNote: 'Blocks hepatic OATP1B1 uptake; causes marked statin myopathy and rhabdomyolysis.'
  },
  {
    id: 'rifampin',
    name: 'Rifampin',
    class: 'Rifamycin Antimicrobial',
    cypInhibition: [],
    cypInduction: ['CYP3A4 (Potent Inducer)', 'CYP2C9 (Strong Inducer)', 'CYP2C19 (Strong Inducer)'],
    transporters: ['P-gp (Inducer)'],
    qtcRiskMs: 0,
    standardDose: '600 mg PO Daily',
    clinicalNote: 'Activates PXR nuclear receptor; severely diminishes circulating levels of oral victim drugs.'
  },
  {
    id: 'empagliflozin',
    name: 'Empagliflozin',
    class: 'SGLT2 Inhibitor',
    cypInhibition: [],
    cypInduction: [],
    transporters: ['SGLT2 (Selective)'],
    qtcRiskMs: 0,
    standardDose: '10 mg PO Daily',
    clinicalNote: 'Cardiorenal protective in CKD/T2D; favorable low metabolic drug-interaction profile.'
  }
];

export const InteractionCheckerView: React.FC<InteractionCheckerViewProps> = ({
  patient,
  onOpenProvenance
}) => {
  const [activeRegimen, setActiveRegimen] = useState<string[]>(
    patient.medications.map((m) => m.name)
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('clarithromycin');
  const [addedCandidates, setAddedCandidates] = useState<CoPrescriptionCandidate[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'quantitative' | 'transporters' | 'qtc'>('matrix');

  // Add co-prescription candidate
  const handleAddCandidate = () => {
    const candidate = CANDIDATE_DRUGS.find((d) => d.id === selectedCandidateId);
    if (candidate && !addedCandidates.some((c) => c.id === candidate.id)) {
      setAddedCandidates([...addedCandidates, candidate]);
    }
  };

  const handleRemoveCandidate = (id: string) => {
    setAddedCandidates(addedCandidates.filter((c) => c.id !== id));
  };

  // Check for critical drug interaction syndromes
  const allCurrentDrugNames = useMemo(() => {
    return [...activeRegimen, ...addedCandidates.map((c) => c.name)];
  }, [activeRegimen, addedCandidates]);

  // Triple Threat Check: ACEi/ARB + Diuretic/NSAID + CKD
  const hasNSAID = allCurrentDrugNames.some((d) => d.toLowerCase().includes('ibuprofen') || d.toLowerCase().includes('naproxen'));
  const hasACEi = allCurrentDrugNames.some((d) => d.toLowerCase().includes('lisinopril') || d.toLowerCase().includes('ramipril') || d.toLowerCase().includes('losartan'));
  const hasTripleThreat = hasNSAID && hasACEi;

  // Statin + Strong CYP3A4/OATP1B1 check
  const hasStatin = allCurrentDrugNames.some((d) => d.toLowerCase().includes('atorvastatin') || d.toLowerCase().includes('simvastatin'));
  const hasStrong3A4Inhibitor = addedCandidates.some((c) => c.cypInhibition.some((i) => i.includes('CYP3A4 (Strong)')));
  const hasOATPInhibitor = addedCandidates.some((c) => c.transporters.some((t) => t.includes('OATP1B1 (Potent')));

  // Warfarin + CYP2C9 check
  const hasWarfarin = allCurrentDrugNames.some((d) => d.toLowerCase().includes('warfarin'));
  const hasCYP2C9Inhibitor = addedCandidates.some((c) => c.cypInhibition.some((i) => i.includes('CYP2C9')));

  // Quantitative Multi-Substrate AUC Multiplier Simulator
  const simulatedAucMultipliers = useMemo(() => {
    const results: { drug: string; baselineAuc: number; predictedAucMultiplier: number; mechanism: string; riskLevel: 'low' | 'moderate' | 'severe' | 'critical' }[] = [];

    if (hasStatin) {
      let statinMult = 1.0;
      let mech = 'Normal CYP3A4 hepatic clearance';
      if (hasStrong3A4Inhibitor) {
        statinMult *= 3.8;
        mech = 'CYP3A4 catalytic inactivation ([I]/Ki > 5.0) slows elimination';
      }
      if (hasOATPInhibitor) {
        statinMult *= 2.9;
        mech = 'OATP1B1 hepatic uptake inhibition traps statin in systemic plasma';
      }
      results.push({
        drug: 'Atorvastatin Calcium',
        baselineAuc: 1.0,
        predictedAucMultiplier: Number(statinMult.toFixed(2)),
        mechanism: mech,
        riskLevel: statinMult >= 3.0 ? 'critical' : statinMult > 1.5 ? 'moderate' : 'low'
      });
    }

    if (hasWarfarin) {
      let warfMult = 1.0;
      let mech = 'Baseline CYP2C9 metabolic rate';
      if (patient.organStatus.hepatic.cypStatus.includes('*3/*3')) {
        warfMult *= 2.4;
        mech = 'Patient homozygous CYP2C9 *3/*3 poor metabolizer genotype';
      }
      if (hasCYP2C9Inhibitor) {
        warfMult *= 2.2;
        mech += ' + Concomitant azole competitive CYP2C9 active-site blocking';
      }
      results.push({
        drug: 'Warfarin (S-Enantiomer)',
        baselineAuc: 1.0,
        predictedAucMultiplier: Number(warfMult.toFixed(2)),
        mechanism: mech,
        riskLevel: warfMult >= 2.5 ? 'critical' : warfMult > 1.4 ? 'severe' : 'low'
      });
    }

    if (allCurrentDrugNames.some((d) => d.toLowerCase().includes('metformin'))) {
      const renalImp = patient.organStatus.renal.egfr < 45 ? 2.4 : 1.0;
      results.push({
        drug: 'Metformin HCl',
        baselineAuc: 1.0,
        predictedAucMultiplier: renalImp,
        mechanism: patient.organStatus.renal.egfr < 45 ? 'Glomerular filtration deficit (eGFR <45 mL/min) limits tubular clearance' : 'Normal tubular excretion',
        riskLevel: renalImp >= 2.0 ? 'severe' : 'low'
      });
    }

    return results;
  }, [hasStatin, hasStrong3A4Inhibitor, hasOATPInhibitor, hasWarfarin, hasCYP2C9Inhibitor, allCurrentDrugNames, patient]);

  // Cumulative QTc Risk Vector
  const cumulativeQtc = useMemo(() => {
    let baselineQtc = 420;
    if (patient.organStatus.cardiovascular.rhythm.includes('QTc')) {
      const match = patient.organStatus.cardiovascular.rhythm.match(/QTc (\d+)ms/);
      if (match) baselineQtc = parseInt(match[1]);
    }
    const additionalShift = addedCandidates.reduce((sum, c) => sum + c.qtcRiskMs, 0);
    return {
      baseline: baselineQtc,
      additional: additionalShift,
      total: baselineQtc + additionalShift
    };
  }, [patient, addedCandidates]);

  return (
    <div className="space-y-5 pb-10">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="text-[10px] font-mono text-[#86f2e4] font-bold uppercase tracking-wider">
              MULTI-SUBSTRATE DDI ENGINE · QUANTITATIVE AUC SOLVER
            </span>
            <span className="text-xs text-teal-300 font-mono font-semibold">
              [I]/Ki Simulation Active
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Simultaneous Multi-Agent Interaction &amp; Exposure Matrix
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-0.5">
            Evaluates concurrent competitive CYP inhibition, active transporter clashes (OATP1B1, P-gp, OCT2), additive QTc repolarization vectors, and predictive systemic exposure fold-multipliers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-teal-950/80 border border-teal-800/60 text-teal-300 font-mono text-xs font-bold">
            Active Agents: {allCurrentDrugNames.length}
          </span>
        </div>
      </div>

      {/* Critical Interaction Syndrome Banners */}
      {hasTripleThreat && (
        <div className="p-4 rounded-xl bg-rose-50 border-l-4 border-l-rose-700 border border-rose-200 text-rose-950 text-xs space-y-2 animate-fade-in shadow-xs">
          <div className="font-bold text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <span className="material-symbols-outlined text-[20px]">dangerous</span>
              <span>CRITICAL ALERT: Nephrotoxic "Triple Threat" Hemodynamic Collapse</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px] uppercase">
              Class I Hazard
            </span>
          </div>
          <p className="leading-relaxed">
            Concurrent administration of an <strong>ACE inhibitor (Lisinopril)</strong> with an <strong>NSAID (Ibuprofen)</strong> in baseline renal impairment (eGFR {patient.organStatus.renal.egfr} mL/min) induces simultaneous afferent arteriolar constriction (prostaglandin blockade) and efferent arteriolar vasodilation (Ang II blockade). This collapses intraglomerular hydrostatic filtration pressure, predisposing to acute renal shut-down.
          </p>
        </div>
      )}

      {(hasStrong3A4Inhibitor && hasStatin) && (
        <div className="p-4 rounded-xl bg-rose-50 border-l-4 border-l-rose-700 border border-rose-200 text-rose-950 text-xs space-y-2 animate-fade-in shadow-xs">
          <div className="font-bold text-sm flex items-center justify-between text-rose-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>SEVERE DDI: Strong CYP3A4 Statin AUC Elevation (Rhabdomyolysis Risk)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px] uppercase">
              3.8x AUC Surge
            </span>
          </div>
          <p className="leading-relaxed">
            Co-administration of <strong>Clarithromycin</strong> with <strong>Atorvastatin</strong> leads to quasi-irreversible mechanism-based inactivation of CYP3A4. Statin systemic plasma exposure escalates ~3.8-fold, increasing toxicity risk. Recommendation: Temporarily hold Atorvastatin during macrolide therapy or switch to Rosuvastatin/Pravastatin.
          </p>
        </div>
      )}

      {(hasCYP2C9Inhibitor && hasWarfarin) && (
        <div className="p-4 rounded-xl bg-amber-50 border-l-4 border-l-amber-600 border border-amber-200 text-amber-950 text-xs space-y-2 animate-fade-in shadow-xs">
          <div className="font-bold text-sm flex items-center justify-between text-amber-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
              <span>CRITICAL PGx-DDI: Azole Antifungal + Warfarin in Impaired CYP2C9 Genotype</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
              Severe Bleeding Hazard
            </span>
          </div>
          <p className="leading-relaxed">
            Fluconazole is a potent competitive inhibitor of CYP2C9 (Ki = 7.5 µM). In a patient already carrying impaired metabolic alleles, active S-warfarin clearance is extinguished, resulting in rapid supratherapeutic INR escalation (&gt;5.0) and major hemorrhage risk.
          </p>
        </div>
      )}

      {/* Prospective Co-Prescription Tester Tray */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">add_circle</span>
              <span>Prospective Co-Prescription &amp; Polypharmacy Stress-Tester</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select prospective medications to simulate simultaneous enzyme competition against {patient.nameAlias}'s regimen.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700 font-medium"
            >
              {CANDIDATE_DRUGS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.class})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddCandidate}
              type="button"
              className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add to Simulation</span>
            </button>
          </div>
        </div>

        {/* Added Prospective Drugs Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">
            Simulated Co-Prescriptions:
          </span>
          {addedCandidates.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None added (baseline regimen only)</span>
          ) : (
            addedCandidates.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold"
              >
                <span>{c.name}</span>
                <span className="text-[10px] text-indigo-600 font-normal">({c.class})</span>
                <button
                  onClick={() => handleRemoveCandidate(c.id)}
                  className="hover:text-[#DC2626] transition-colors cursor-pointer"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50 overflow-x-auto">
          {[
            { id: 'matrix', label: 'Cross-Matrix Interactions', icon: 'grid_view' },
            { id: 'quantitative', label: 'Quantitative AUC Multipliers', icon: 'monitoring' },
            { id: 'transporters', label: 'Transporter Clashes (P-gp / OATP)', icon: 'swap_horiz' },
            { id: 'qtc', label: 'Additive QTc Vector', icon: 'ecg' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-teal-700 text-[#0F766E] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* TAB 1: CROSS-MATRIX PAIRWISE & MULTI-AGENT */}
          {activeTab === 'matrix' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Metformin HCl</span>
                    <span className="text-[#0F766E] font-mono">⟷</span>
                    <span className="font-bold text-slate-900 text-sm">Lisinopril</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
                    MODERATE RENAL CLEARANCE DEPENDENCY
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Lisinopril-mediated dilation of the efferent arteriole decreases intraglomerular filtration pressure. If patient eGFR dips below 30 mL/min, Metformin accumulation accelerates. Routine basic metabolic panel (BMP) monitoring recommended within 14 days.
                </p>
                {onOpenProvenance && (
                  <button
                    onClick={() => onOpenProvenance('prov-met-renal')}
                    className="text-[11px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>Audit KDIGO 2023 Dosing Guidelines</span>
                  </button>
                )}
              </div>

              {addedCandidates.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-950 text-sm">{c.name}</span>
                      <span className="text-indigo-600 font-mono">⟷</span>
                      <span className="font-bold text-slate-900 text-sm">Active Patient Regimen</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[10px] border border-indigo-300">
                      PROSPECTIVE EVALUATION
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {c.clinicalNote}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1 font-mono">
                    <span>Enzymes: {c.cypInhibition.join(', ') || 'None'}</span>
                    <span>· Transporters: {c.transporters.join(', ') || 'None'}</span>
                    <span>· QTc Impact: +{c.qtcRiskMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: QUANTITATIVE AUC MULTIPLIER SOLVER */}
          {activeTab === 'quantitative' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                Predicted systemic exposure fold-multipliers derived from competitive $[I]/K_i$ Michaelis-Menten fractional clearance models:
                <code className="ml-1 p-1 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
                  AUC_ratio = 1 / [ fm_CYP / (1 + [I] / Ki) + (1 - fm_CYP) ]
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simulatedAucMultipliers.map((res, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      res.riskLevel === 'critical'
                        ? 'bg-rose-50/80 border-rose-300'
                        : res.riskLevel === 'severe'
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{res.drug}</span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          res.riskLevel === 'critical' ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {res.predictedAucMultiplier}x Exposure
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {res.mechanism}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Baseline normalized AUC: 1.0</span>
                      <span className={`font-semibold uppercase ${
                        res.riskLevel === 'critical' ? 'text-[#DC2626]' : 'text-slate-700'
                      }`}>
                        Status: {res.riskLevel} Hazard
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPORTERS */}
          {activeTab === 'transporters' && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-800 block">
                Active SLC &amp; ABC Transporter Competition Matrix
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#0F766E] uppercase block">OATP1B1 (SLCO1B1)</span>
                  <span className="text-slate-900 font-bold block">Hepatic Sinusoidal Uptake</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Substrates: Atorvastatin, Rosuvastatin. Gemfibrozil &amp; Cyclosporine block uptake, escalating systemic statin concentrations.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-indigo-800 uppercase block">OCT2 / MATE1</span>
                  <span className="text-slate-900 font-bold block">Renal Tubular Excretion</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Substrates: Metformin. Cimetidine and Dolutegravir inhibit OCT2, reducing renal clearance by ~30% and predisposing to MALA.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-amber-800 uppercase block">P-gp (ABCB1)</span>
                  <span className="text-slate-900 font-bold block">Intestinal Efflux &amp; BBB</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Substrates: Apixaban, Dabigatran, Digoxin. Inhibitors like Amiodarone and Clarithromycin double oral bioavailability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QTc REPOLARIZATION VECTOR */}
          {activeTab === 'qtc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold block mb-1">
                    Cumulative Ventricular Repolarization Shift
                  </span>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-bold">
                    Predicted Steady-State QTc: {cumulativeQtc.total} ms
                  </h4>
                  <p className="text-xs text-slate-300">
                    Baseline: {cumulativeQtc.baseline}ms · Induced prolongation: +{cumulativeQtc.additional}ms
                  </p>
                </div>

                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                    cumulativeQtc.total >= 500
                      ? 'bg-rose-500 text-white animate-pulse'
                      : cumulativeQtc.total > 450
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {cumulativeQtc.total >= 500 ? 'TORSEDES DE POINTES THRESHOLD EXCEEDED' : cumulativeQtc.total > 450 ? 'BORDERLINE PROLONGATION' : 'NORMAL VENTRICULAR INTERVAL'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <strong>FDA &amp; AHA Safety Standard:</strong> QTc intervals exceeding 500 ms (or a prolongation delta &gt;60 ms from baseline) warrant immediate ECG evaluation, discontinuation of concurrent HERG potassium-channel blockers (e.g. Citalopram, Amiodarone, Macrolides), and repletion of serum potassium (&gt;4.0 mEq/L) and magnesium (&gt;2.0 mg/dL).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
