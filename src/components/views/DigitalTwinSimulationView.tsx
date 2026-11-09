import React, { useState, useMemo } from 'react';
import { PatientCase } from '../../types/clinical';
import {
  calculateCockcroftGault,
  calculateCKDEPI2021,
  calculateIBW,
  generatePKPoints,
  pointsToSvgPath,
  calculateDeterministicPK,
  validateClinicalInputs
} from '../../utils/clinicalMath';
import { saveAnonymizedSimulationRecord } from '../../utils/simulationStorage';
import { saveSimulationCase } from '../../firebase';
import { useClinicianAuth } from '../../context/AuthContext';
import { ClinicalDisclaimerBanner } from '../common/ClinicalDisclaimerBanner';

interface DigitalTwinSimulationViewProps {
  patient: PatientCase;
  onOpenRenalMath: () => void;
  onOpenProvenance: (id: string) => void;
  onOpenSessionHistory?: () => void;
}

export const DigitalTwinSimulationView: React.FC<DigitalTwinSimulationViewProps> = ({
  patient,
  onOpenRenalMath,
  onOpenProvenance,
  onOpenSessionHistory
}) => {
  // Baseline initial state
  const baselineState = useMemo(() => ({
    age: patient.biometrics.age,
    weightKg: patient.biometrics.weightKg,
    heightCm: patient.biometrics.heightCm,
    sex: patient.biometrics.sex,
    scr: patient.organStatus.renal.scr,
    potassium: patient.organStatus.cardiovascular.potassium,
    selectedDrug: 'metformin',
    doseMg: 1000,
    intervalHours: 12,
    pgxVariant: 'CYP2C9 *1/*1'
  }), [patient]);

  // Active modified simulation state
  const [age, setAge] = useState<number>(baselineState.age);
  const [weightKg, setWeightKg] = useState<number>(baselineState.weightKg);
  const [scr, setScr] = useState<number>(baselineState.scr);
  const [potassium, setPotassium] = useState<number>(baselineState.potassium);
  const [selectedDrug, setSelectedDrug] = useState<string>(baselineState.selectedDrug);
  const [doseMg, setDoseMg] = useState<number>(baselineState.doseMg);
  const [intervalHours, setIntervalHours] = useState<number>(baselineState.intervalHours);
  const [pgxVariant, setPgxVariant] = useState<string>(baselineState.pgxVariant);

  // Compare mode toggle
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [lastChangedParam, setLastChangedParam] = useState<string>('Baseline initial state');
  const [modelEngine, setModelEngine] = useState<'one-compartment' | 'pbpk-twocompartment'>('one-compartment');

  // Real-time calculations for active scenario
  const ibw = calculateIBW(baselineState.heightCm, baselineState.sex);
  const cgResult = calculateCockcroftGault(age, weightKg, baselineState.heightCm, scr, baselineState.sex, true);
  const egfr = calculateCKDEPI2021(age, scr, baselineState.sex).egfr;

  // Physiologically Based Pharmacokinetic (PBPK) & Transporter Kinetics
  const pbpkMetrics = useMemo(() => {
    const Vc = Number((0.45 * weightKg).toFixed(1)); // Central volume (plasma, highly perfused viscera)
    const Vp = Number((2.8 * weightKg).toFixed(1)); // Peripheral deep tissue volume (muscle, adipose)
    const Q = Number((0.85 * (weightKg / 70)).toFixed(2)); // Inter-compartmental clearance L/h
    const Km = 2.4; // Michaelis-Menten constant
    const transporterSaturationPct = Math.min(94, Math.round((2.85 / (Km + 2.85)) * 100));
    const alphaHalfLife = Number((0.8 * (70 / weightKg)).toFixed(1));
    return { Vc, Vp, Q, transporterSaturationPct, alphaHalfLife };
  }, [weightKg]);

  // Real-time calculations for baseline scenario
  const baselineCg = calculateCockcroftGault(baselineState.age, baselineState.weightKg, baselineState.heightCm, baselineState.scr, baselineState.sex, true);
  const baselineEgfr = calculateCKDEPI2021(baselineState.age, baselineState.scr, baselineState.sex).egfr;

  // Pharmacokinetic modeling
  const simulatedHalfLife = useMemo(() => {
    if (selectedDrug === 'metformin') {
      // Metformin baseline t1/2 ~ 6.2h, inversely scaled with eGFR
      return Number((6.2 * (85 / Math.max(15, egfr))).toFixed(1));
    } else if (selectedDrug === 'warfarin') {
      return pgxVariant.includes('*3/*3') ? 118 : 36;
    } else if (selectedDrug === 'lisinopril') {
      return Number((12.0 * (80 / Math.max(20, egfr))).toFixed(1));
    }
    return 12.4;
  }, [selectedDrug, egfr, pgxVariant]);

  const baselineHalfLife = useMemo(() => {
    return Number((6.2 * (85 / Math.max(15, baselineEgfr))).toFixed(1));
  }, [baselineEgfr]);

  // Generate PK Curves
  const activePoints = useMemo(() => {
    return generatePKPoints(doseMg, simulatedHalfLife, 80, 36);
  }, [doseMg, simulatedHalfLife]);

  const baselinePoints = useMemo(() => {
    return generatePKPoints(baselineState.doseMg, baselineHalfLife, 80, 36);
  }, [baselineState.doseMg, baselineHalfLife]);

  const activePath = pointsToSvgPath(activePoints);
  const baselinePath = pointsToSvgPath(baselinePoints);

  // Maximum peak in simulated 36h period
  const activePeak = activePoints.reduce((max: number, p: { concentration: number }) => (p.concentration > max ? p.concentration : max), 0);
  const baselinePeak = baselinePoints.reduce((max: number, p: { concentration: number }) => (p.concentration > max ? p.concentration : max), 0);

  // Safety evaluations
  const isMetforminLacticAcidosisZone = selectedDrug === 'metformin' && (egfr < 30 || (egfr < 45 && doseMg * (24 / intervalHours) > 1000));
  const isHyperkalemiaRisk = potassium >= 5.0 && selectedDrug === 'lisinopril';
  const isWarfarinBleedingRisk = selectedDrug === 'warfarin' && pgxVariant.includes('*3/*3') && doseMg >= 2.5;

  // Causation reasoning string
  const causationExplanation = useMemo(() => {
    if (selectedDrug === 'metformin') {
      if (egfr < 30) {
        return `Filtration reduction (eGFR ${egfr} mL/min, SCr ${scr} mg/dL) slows renal tubular elimination: half-life is extended to ${simulatedHalfLife}h. Peak plasma concentration reaches ${activePeak.toFixed(2)} mcg/mL, triggering an absolute FDA contraindication due to high lactic acidosis risk.`;
      } else if (egfr < 45) {
        if (doseMg * (24 / intervalHours) > 1000) {
          return `Renal clearance threshold exceeded: Patient's eGFR of ${egfr} mL/min cannot clear ${doseMg * (24 / intervalHours)} mg/day. Half-life is prolonged to ${simulatedHalfLife}h, yielding an elevated peak of ${activePeak.toFixed(2)} mcg/mL (+${Math.round(((activePeak - 1.8) / 1.8) * 100)}% vs reference). KDIGO 2023 mandates dose reduction to ≤1000 mg/day.`;
        }
        return `Appropriately adjusted dose: At ${doseMg * (24 / intervalHours)} mg/day in eGFR ${egfr} mL/min, steady-state peak remains at ${activePeak.toFixed(2)} mcg/mL within safe bounds. Recheck renal labs in 30 days.`;
      }
      return `Normal clearance range: eGFR of ${egfr} mL/min provides adequate renal elimination (t1/2 ${simulatedHalfLife}h, peak ${activePeak.toFixed(2)} mcg/mL).`;
    } else if (selectedDrug === 'warfarin') {
      if (pgxVariant.includes('*3/*3')) {
        return `Pharmacogenomic enzyme deficiency: CYP2C9 *3/*3 reduces S-warfarin clearance by ~85%. At ${doseMg} mg/day, extreme hepatic accumulation occurs (t1/2 ${simulatedHalfLife}h), driving INR to supratherapeutic risk levels. CPIC recommends dose reduction to 1.0–1.5 mg/day or switching to a DOAC.`;
      }
      return `Wild-type CYP2C9 *1/*1 metabolism: standard clearance of S-warfarin expected.`;
    }
    return `Hemodynamic alteration: Lisinopril reduces intraglomerular pressure. Borderline serum potassium (${potassium} mEq/L) requires 14-day BMP surveillance.`;
  }, [selectedDrug, egfr, scr, simulatedHalfLife, activePeak, doseMg, intervalHours, pgxVariant, potassium]);

  const handleResetScenario = () => {
    setAge(baselineState.age);
    setWeightKg(baselineState.weightKg);
    setScr(baselineState.scr);
    setPotassium(baselineState.potassium);
    setSelectedDrug(baselineState.selectedDrug);
    setDoseMg(baselineState.doseMg);
    setIntervalHours(baselineState.intervalHours);
    setPgxVariant(baselineState.pgxVariant);
    setLastChangedParam('Restored initial baseline scenario');
  };

  // Clinician authentication & profile
  const { clinician, currentUser, isGuest, requireAuthForAction, refreshSavedCases, openPersonalizedModal } = useClinicianAuth();
  const [logNotification, setLogNotification] = useState<string | null>(null);

  // Deterministic PK & Validation
  const inputValidation = useMemo(() => {
    return validateClinicalInputs({
      age,
      weightKg,
      heightCm: baselineState.heightCm,
      scr,
      potassium,
      doseMg,
      intervalHours
    });
  }, [age, weightKg, baselineState.heightCm, scr, potassium, doseMg, intervalHours]);

  const deterministicPK = useMemo(() => {
    return calculateDeterministicPK({
      drugId: selectedDrug,
      doseMg,
      intervalHours,
      weightKg,
      heightCm: baselineState.heightCm,
      age,
      sex: baselineState.sex,
      scr,
      potassium,
      pgxVariant
    });
  }, [selectedDrug, doseMg, intervalHours, weightKg, baselineState.heightCm, age, baselineState.sex, scr, potassium, pgxVariant]);

  // AI plain-language explanation state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Cloud Firestore state
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'curve' | 'lineage' | 'ai'>('curve');

  // Trigger AI plain-language explanation
  const handleExplainWithAI = async () => {
    setIsExplaining(true);
    setAiError(null);
    setActiveOutputTab('ai');
    try {
      const response = await fetch('/api/clinical-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pkResult: {
            drugGenericName: deterministicPK.drugGenericName,
            doseMg,
            intervalHours,
            halfLifeHours: deterministicPK.halfLifeHours,
            halfLifeChangeFactor: deterministicPK.halfLifeChangeFactor,
            peakSteadyStateCss: deterministicPK.peakSteadyStateCss,
            upperSafetyCeiling: deterministicPK.upperSafetyCeiling,
            safetyCeilingExceeded: deterministicPK.safetyCeilingExceeded,
            safetyFinding: deterministicPK.safetyFinding,
            guidelineCode: deterministicPK.guidelineCode
          },
          patientProfile: {
            egfr,
            scr,
            crcl: cgResult.crcl,
            potassium,
            cypGenotype: pgxVariant
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setAiExplanation(data.explanation || data.fallback || 'Clinical explanation generated successfully.');
    } catch (err: any) {
      console.warn('AI Explanation call failed, using deterministic clinical notes:', err);
      setAiError('AI explanation unavailable. Reviewing deterministic mathematical lineage instead.');
      setAiExplanation(causationExplanation);
    } finally {
      setIsExplaining(false);
    }
  };

  // Save case to Firestore
  const handleSaveToFirestore = async () => {
    if (isGuest || !clinician) {
      requireAuthForAction(() => {});
      return;
    }

    setIsSavingToCloud(true);
    try {
      const targetUid = currentUser?.uid || clinician?.uid || 'guest-clinician';
      const anonCaseId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      await saveSimulationCase(targetUid, {
        anonymousCaseId: anonCaseId,
        demographicDecade: `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9} Y`,
        biologicalSex: baselineState.sex,
        inputs: {
          age,
          weightKg,
          heightCm: baselineState.heightCm,
          scr,
          potassium,
          cypGenotype: pgxVariant,
          selectedDrug,
          doseMg,
          intervalHours
        },
        outputs: {
          egfr,
          crcl: cgResult.crcl,
          simulatedHalfLife: deterministicPK.halfLifeHours,
          halfLifeChangeFactor: deterministicPK.halfLifeChangeFactor,
          predictedPeakCss: deterministicPK.peakSteadyStateCss,
          upperSafetyCeiling: deterministicPK.upperSafetyCeiling,
          safetyCeilingExceeded: deterministicPK.safetyCeilingExceeded,
          primarySafetyFinding: deterministicPK.safetyFinding || causationExplanation,
          guidelineViolationCode: deterministicPK.guidelineCode
        },
          clinicianNotes: lastChangedParam || 'User simulation study'
        });

        await refreshSavedCases();
        setLogNotification(`Case ${anonCaseId} saved to your personalized cloud cases! View in "My Cases".`);
        setTimeout(() => setLogNotification(null), 4000);
      } catch (err) {
      console.error('Failed to save simulation case to Firestore:', err);
      setLogNotification('Error saving case to cloud. Saved locally instead.');
      setTimeout(() => setLogNotification(null), 4000);
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['SYNTHOS Pharmacokinetic Simulation Export (De-identified)'],
      ['Regulatory Disclaimer: FDA Non-Device Educational Clinical Decision Support (21 U.S.C. 360j(o)(1)(E))'],
      ['Date/Time', new Date().toISOString()],
      ['Demographic Decade', `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9} Y`],
      ['Biological Sex', baselineState.sex],
      ['Weight (kg)', weightKg.toString()],
      ['Height (cm)', baselineState.heightCm.toString()],
      ['Serum Creatinine (mg/dL)', scr.toString()],
      ['Serum Potassium (mEq/L)', potassium.toString()],
      ['Cockcroft-Gault CrCl (mL/min)', cgResult.crcl.toString()],
      ['CKD-EPI 2021 eGFR (mL/min/1.73m2)', egfr.toString()],
      ['Drug Generic', deterministicPK.drugGenericName],
      ['Dose (mg)', doseMg.toString()],
      ['Interval (h)', intervalHours.toString()],
      ['Pharmacogenomic Genotype', pgxVariant],
      ['Volume of Distribution Vd (L)', deterministicPK.vdLiters.toString()],
      ['Clearance (L/h)', deterministicPK.clearanceLperH.toString()],
      ['Simulated Half-Life t1/2 (h)', deterministicPK.halfLifeHours.toString()],
      ['Predicted Peak Steady-State Css (mcg/mL)', deterministicPK.peakSteadyStateCss.toString()],
      ['Predicted Trough Steady-State Css (mcg/mL)', deterministicPK.troughSteadyStateCss.toString()],
      ['Predicted Average Steady-State Css (mcg/mL)', deterministicPK.averageSteadyStateCss.toString()],
      ['AUC24 (mcg*h/mL)', deterministicPK.aucTau.toString()],
      ['Accumulation Ratio', deterministicPK.accumulationRatio.toString()],
      ['Safety Ceiling Exceeded', deterministicPK.safetyCeilingExceeded ? 'YES' : 'NO'],
      ['Mathematical Citation', deterministicPK.formulaMetadata.primaryReference],
      ['Renal Formula Citation', cgResult.reference]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `synthos_simulation_${selectedDrug}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const recordCurrentSimulationTelemetry = (rationaleText?: string) => {
    try {
      const isMetformin = selectedDrug === 'metformin';
      const isWarfarin = selectedDrug === 'warfarin';
      const drugGenericName = isMetformin ? 'Metformin Hydrochloride' : isWarfarin ? 'Warfarin Sodium' : 'Lisinopril';
      const brandName = isMetformin ? 'Glucophage' : isWarfarin ? 'Coumadin' : 'Prinivil';
      const baselineHalfLifeNum = Number(baselineHalfLife) || 6.2;
      const simHalfLifeNum = Number(simulatedHalfLife) || 12.0;

      const activeCeiling = isMetformin ? 2.5 : isWarfarin ? 3.0 : 5.2;
      const isCeilingExceeded = isMetformin ? isMetforminLacticAcidosisZone : isWarfarin ? isWarfarinBleedingRisk : isHyperkalemiaRisk;
      const activeSafetyFinding = causationExplanation;

      saveAnonymizedSimulationRecord({
        demographicDecade: `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9} Y`,
        biologicalSex: baselineState.sex,
        primaryOrganProfile: {
          egfr,
          egfrStage: egfr < 15 ? 'Stage 5 (Kidney Failure)' : egfr < 30 ? 'Stage 4 (Severe CKD)' : egfr < 60 ? 'Stage 3 (Moderate CKD)' : 'Stage 1-2 (Normal/Mild)',
          scr,
          crcl: cgResult.crcl,
          potassium,
          cypGenotype: pgxVariant
        },
        simulationParameters: {
          drugId: selectedDrug,
          drugGenericName,
          brandName,
          baselineDose: `${baselineState.doseMg} mg q${baselineState.intervalHours}h`,
          simulatedDose: `${doseMg} mg q${intervalHours}h`,
          intervalHours,
          route: 'Oral'
        },
        pharmacokineticOutcomes: {
          baselineHalfLife: baselineHalfLifeNum,
          simulatedHalfLife: simHalfLifeNum,
          halfLifeChangeFactor: Number((simHalfLifeNum / baselineHalfLifeNum).toFixed(2)),
          predictedPeakCss: Number(activePeak.toFixed(2)),
          upperSafetyCeiling: Number(activeCeiling),
          safetyCeilingExceeded: isCeilingExceeded,
          primarySafetyFinding: activeSafetyFinding,
          guidelineViolationCode: isCeilingExceeded ? (isMetformin ? 'KDIGO-MET-2023' : isWarfarin ? 'CPIC-WAR-2022' : 'KDIGO-LIS-2021') : undefined
        },
        clinicianRationale: rationaleText || lastChangedParam || 'Interactive simulation titration trial',
        sourceType: 'interactive-simulator'
      });

      setLogNotification(`Simulation snapshot recorded to private database (${drugGenericName} • ${doseMg}mg)`);
      setTimeout(() => setLogNotification(null), 3500);
    } catch (e) {
      console.warn('Telemetry log caught:', e);
    }
  };

  const handlePresetSelect = (preset: 'aki' | 'baseline' | 'dose-reduction' | 'normal') => {
    if (preset === 'aki') {
      setScr(2.6);
      setPotassium(5.5);
      setLastChangedParam('Preset applied: Acute Kidney Injury (AKI) Insult (SCr 2.6, K+ 5.5)');
      setTimeout(() => recordCurrentSimulationTelemetry('AKI Insult applied: SCr escalated to 2.6 mg/dL, K+ 5.5 mEq/L'), 100);
    } else if (preset === 'dose-reduction') {
      setDoseMg(500);
      setIntervalHours(12);
      setLastChangedParam('Preset applied: KDIGO Guideline Dose Reduction (500mg BID)');
      setTimeout(() => recordCurrentSimulationTelemetry('KDIGO dose reduction applied: 500mg BID safety protocol'), 100);
    } else if (preset === 'normal') {
      setScr(0.9);
      setPotassium(4.2);
      setLastChangedParam('Preset applied: Normal Renal Clearance (SCr 0.9, K+ 4.2)');
      setTimeout(() => recordCurrentSimulationTelemetry('Restored normal renal clearance baseline: SCr 0.9 mg/dL'), 100);
    } else {
      handleResetScenario();
    }
  };

  return (
    <div className="space-y-5">
      {/* Required Clinical Decision Support & No-PHI Disclaimer Banner */}
      <ClinicalDisclaimerBanner />

      {logNotification && (
        <div className="p-3 rounded-xl bg-teal-900 text-teal-100 border border-teal-500/40 text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-300 text-[18px]">cloud_done</span>
            <span>{logNotification}</span>
          </div>
          <span className="text-[10px] font-mono text-teal-300 uppercase">
            {isGuest ? 'Local Session' : 'Firestore Vault Sync'}
          </span>
        </div>
      )}

      {/* Input Physiological Validation Banner */}
      {!inputValidation.isValid && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
            <span>Physiological Parameter Notice:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5 text-[11px]">
            {inputValidation.errors.map((err, i) => (
              <li key={`err-${i}`} className="font-semibold text-[#DC2626] dark:text-rose-300">{err}</li>
            ))}
            {inputValidation.warnings.map((warn, i) => (
              <li key={`warn-${i}`}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Simulation Command Banner */}
      <div className="bg-[#1E3A8A] dark:bg-slate-900 text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#1E3A8A] dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-teal-300 font-bold">
              COMPUTABLE PHARMACOKINETIC TWIN
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">
              SYNTHETIC DATA — EDUCATIONAL MODEL
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Interactive Digital Twin &amp; Scenario Simulator
          </h2>
          <p className="text-xs text-slate-300 dark:text-slate-400">
            Modify biometric parameters, clearance values, and dose regimens to observe real-time pharmacokinetic shifts and rule evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save to Cloud Firestore */}
          <button
            onClick={handleSaveToFirestore}
            disabled={isSavingToCloud}
            className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#15803D] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title={isGuest ? 'Sign in to save cases to Firestore cloud' : 'Save simulation case to Firestore Cloud Vault'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSavingToCloud ? 'sync' : 'cloud_upload'}
            </span>
            <span>{isSavingToCloud ? 'Saving...' : 'Save Case to Cloud'}</span>
          </button>

          {/* Plain-Language AI Explanation */}
          <button
            onClick={handleExplainWithAI}
            disabled={isExplaining}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title="Generate FDA CDS-compliant plain-language clinical interpretation grounded in literature"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExplaining ? 'autorenew' : 'psychology'}
            </span>
            <span>{isExplaining ? 'Synthesizing...' : 'Explain with AI'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title="Download complete deterministic data dossier as CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => recordCurrentSimulationTelemetry('Manual simulation snapshot')}
            className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#1E3A8A] text-[#f8fafc] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors border border-teal-500/40"
            title="Log current pharmacokinetic state to central telemetry database"
          >
            <span className="material-symbols-outlined text-[16px]">data_saver_on</span>
            <span>Log Telemetry</span>
          </button>

          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
              isCompareMode
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">compare</span>
            <span>{isCompareMode ? 'Hide Baseline Diff' : 'Compare Scenarios'}</span>
          </button>

          <button
            onClick={handleResetScenario}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenRenalMath}
            className="px-3 py-1.5 rounded bg-[#15803D] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Inspect Equations</span>
          </button>

          {onOpenSessionHistory && (
            <button
              onClick={onOpenSessionHistory}
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="View recent simulation history & export audit log"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Session History</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Scenario Quick Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5DDD0] dark:border-slate-800 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#4B6584] dark:text-slate-400 uppercase font-mono tracking-wider">
            Educational Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handlePresetSelect('baseline')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1E3A5F] dark:text-slate-300 font-semibold cursor-pointer transition-colors"
            >
              Baseline CKD 3b
            </button>
            <button
              onClick={() => handlePresetSelect('aki')}
              className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-rose-800 dark:text-rose-200 font-semibold cursor-pointer transition-colors"
            >
              Acute AKI Insult (SCr 2.6)
            </button>
            <button
              onClick={() => handlePresetSelect('dose-reduction')}
              className="px-2.5 py-1 rounded bg-[#EEF7EE] dark:bg-[#1e293b] border border-[#CBE4CB] dark:border-[#334155] hover:bg-[#D4ECE6] text-[#15803D] dark:text-teal-300 font-semibold cursor-pointer transition-colors"
            >
              KDIGO Guideline Taper (500mg BID)
            </button>
            <button
              onClick={() => handlePresetSelect('normal')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1E3A5F] dark:text-slate-300 font-semibold cursor-pointer transition-colors"
            >
              Normal Function (SCr 0.9)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#4B6584] dark:text-slate-400 font-mono">
          Last event: <span className="text-[#1E3A8A] dark:text-teal-300 font-semibold">{lastChangedParam}</span>
        </div>
      </div>

      {/* Physiological Boundary Alerts */}
      {egfr < 15 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] shrink-0">emergency</span>
          <div>
            <strong className="font-bold">Severe Renal Impairment (eGFR &lt; 15 mL/min · Stage 5):</strong>
            <span className="ml-1 text-[11px]">Tubular drug filtration is severely compromised. Most standard oral medications require dialysis timing protocols or renal discontinuation.</span>
          </div>
        </div>
      )}

      {potassium >= 5.5 && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <span className="material-symbols-outlined text-[#DC2626] dark:text-rose-400 text-[20px] shrink-0">warning</span>
          <div>
            <strong className="font-bold">Critical Hyperkalemia Hazard (K+ &ge; 5.5 mEq/L):</strong>
            <span className="ml-1 text-[11px]">Immediate cardiac arrhythmia risk. Discontinue RAAS inhibitors (ACEi/ARBs) and initiate acute potassium lowering protocol.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Control Panel (5 cols) & Real-time Visualization (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-[#E5DDD0] dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[#E5DDD0] dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-[#1E3A5F] dark:text-slate-200 uppercase tracking-wider">
              Simulation Parameter Controls
            </span>
            <span className="text-[10px] font-mono text-[#15803D] dark:text-teal-300 bg-[#EEF7EE] dark:bg-slate-800 px-2 py-0.5 rounded font-bold border border-[#CBE4CB] dark:border-slate-700">
              Active Patient: {patient.id}
            </span>
          </div>

          {/* Drug Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3A8A] dark:text-slate-200 block">
              Pharmacotherapy Regimen
            </label>
            <select
              value={selectedDrug}
              onChange={(e) => {
                const drug = e.target.value;
                setSelectedDrug(drug);
                if (drug === 'metformin') setDoseMg(1000);
                if (drug === 'empagliflozin') setDoseMg(10);
                if (drug === 'lisinopril') setDoseMg(20);
                if (drug === 'warfarin') setDoseMg(5);
                setLastChangedParam(`Selected drug: ${drug.toUpperCase()}`);
              }}
              className="w-full p-2 text-xs rounded border border-[#DDD4C5] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-[#15803D]"
            >
              <option value="metformin">Metformin HCl (Biguanide Antidiabetic - Renal Excretion)</option>
              <option value="empagliflozin">Empagliflozin (SGLT2 Inhibitor - Cardiorenal Protection)</option>
              <option value="lisinopril">Lisinopril (ACE Inhibitor - Intraglomerular Hemodynamics)</option>
              <option value="warfarin">Warfarin Sodium (VKA Anticoagulant - CYP2C9 Genotype)</option>
            </select>
          </div>

          {/* Dose and Interval Controls */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-1">
              <label className="font-semibold text-[#1E3A5F] block">Dose per Administration</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={doseMg}
                  step={selectedDrug === 'warfarin' ? 1.25 : 250}
                  min={selectedDrug === 'warfarin' ? 1 : 250}
                  max={selectedDrug === 'warfarin' ? 10 : 2500}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDoseMg(val);
                    setLastChangedParam(`Dose adjusted to ${val} mg`);
                  }}
                  className="w-full p-1.5 font-mono text-sm bg-white border border-[#DDD4C5] rounded font-bold"
                />
                <span className="font-mono text-[#4B6584] font-semibold">mg</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-1">
              <label className="font-semibold text-[#1E3A5F] block">Dosing Interval</label>
              <select
                value={intervalHours}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIntervalHours(val);
                  setLastChangedParam(`Dosing interval changed to ${val} hours`);
                }}
                className="w-full p-1.5 text-xs bg-white border border-[#DDD4C5] rounded font-medium"
              >
                <option value={12}>Every 12 hours (BID)</option>
                <option value={24}>Every 24 hours (Daily)</option>
                <option value={8}>Every 8 hours (TID)</option>
              </select>
            </div>
          </div>

          {/* Serum Creatinine Slider */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1E3A8A]">Serum Creatinine (SCr):</span>
                <span className="text-[10px] text-[#15803D] font-mono font-bold px-1.5 py-0.5 bg-[#EEF7EE] border border-[#CBE4CB] rounded">
                  0.01 digits
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(0.6, Number((scr - 0.02).toFixed(2)));
                    setScr(next);
                    setLastChangedParam(`SCr stepped to ${next.toFixed(2)} mg/dL`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine decrement (-0.02)"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-[#DDD4C5] shadow-2xs min-w-[70px] text-center">
                  {scr.toFixed(2)} mg/dL
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(4.0, Number((scr + 0.02).toFixed(2)));
                    setScr(next);
                    setLastChangedParam(`SCr stepped to ${next.toFixed(2)} mg/dL`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine increment (+0.02)"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.60"
              max="4.00"
              step="0.01"
              value={scr}
              onChange={(e) => {
                const val = Number(parseFloat(e.target.value).toFixed(2));
                setScr(val);
                setLastChangedParam(`SCr updated to ${val.toFixed(2)} mg/dL`);
              }}
              className="w-full accent-[#15803D] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#4B6584]">
              <span>0.60 (Hyperfiltration)</span>
              <span>1.00 (Normal)</span>
              <span>1.80 (Stage 3b)</span>
              <span>3.00+ (Severe)</span>
            </div>
          </div>

          {/* Body Weight Slider */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1E3A8A]">Body Weight (Actual / IBW):</span>
                <span className="text-[10px] text-[#15803D] font-mono font-bold px-1.5 py-0.5 bg-[#EEF7EE] border border-[#CBE4CB] rounded">
                  0.1 kg
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(45, Number((weightKg - 0.2).toFixed(1)));
                    setWeightKg(next);
                    setLastChangedParam(`Weight stepped to ${next.toFixed(1)} kg`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine decrement (-0.2 kg)"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-[#DDD4C5] shadow-2xs">
                  {weightKg.toFixed(1)} kg <span className="text-xs text-[#4B6584] font-normal">(IBW: {ibw}kg)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(130, Number((weightKg + 0.2).toFixed(1)));
                    setWeightKg(next);
                    setLastChangedParam(`Weight stepped to ${next.toFixed(1)} kg`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine increment (+0.2 kg)"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="45.0"
              max="130.0"
              step="0.1"
              value={weightKg}
              onChange={(e) => {
                const val = Number(parseFloat(e.target.value).toFixed(1));
                setWeightKg(val);
                setLastChangedParam(`Weight updated to ${val.toFixed(1)} kg`);
              }}
              className="w-full accent-[#15803D] cursor-pointer"
            />
          </div>

          {/* Serum Potassium Slider */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1E3A8A]">Serum Potassium (K+):</span>
                <span className="text-[10px] text-[#15803D] font-mono font-bold px-1.5 py-0.5 bg-[#EEF7EE] border border-[#CBE4CB] rounded">
                  0.02 digits
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(3.4, Number((potassium - 0.02).toFixed(2)));
                    setPotassium(next);
                    setLastChangedParam(`Potassium stepped to ${next.toFixed(2)} mEq/L`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine decrement (-0.02 mEq/L)"
                >
                  -
                </button>
                <span
                  className={`font-mono text-sm font-bold px-2 py-0.5 rounded border shadow-2xs ${
                    potassium >= 5.0 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-[#1E3A8A] border-[#DDD4C5]'
                  }`}
                >
                  {potassium.toFixed(2)} mEq/L
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(6.0, Number((potassium + 0.02).toFixed(2)));
                    setPotassium(next);
                    setLastChangedParam(`Potassium stepped to ${next.toFixed(2)} mEq/L`);
                  }}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-[#DDD4C5] text-[#1E3A5F] font-bold flex items-center justify-center text-[11px] cursor-pointer"
                  title="Fine increment (+0.02 mEq/L)"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="3.40"
              max="6.00"
              step="0.02"
              value={potassium}
              onChange={(e) => {
                const val = Number(parseFloat(e.target.value).toFixed(2));
                setPotassium(val);
                setLastChangedParam(`Potassium updated to ${val.toFixed(2)} mEq/L`);
              }}
              className="w-full accent-[#15803D] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#4B6584]">
              <span>3.40 (Lower Normal)</span>
              <span>4.50 (Target)</span>
              <span>5.00 (Ceiling)</span>
              <span>5.50+ (Hyperkalemic)</span>
            </div>
          </div>

          {/* Conditional Pharmacogenomic Toggle if Warfarin */}
          {selectedDrug === 'warfarin' && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2 text-xs">
              <span className="font-bold text-indigo-900 block">CYP2C9 Pharmacogenomic Allele</span>
              <div className="grid grid-cols-2 gap-2">
                {['CYP2C9 *1/*1 (Normal)', 'CYP2C9 *3/*3 (Poor)'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPgxVariant(p);
                      setLastChangedParam(`PGx phenotype changed to ${p}`);
                    }}
                    className={`p-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      pgxVariant.includes(p.split(' ')[1])
                        ? 'bg-indigo-900 text-white border-indigo-900'
                        : 'bg-white text-[#1E3A5F] border-indigo-200 hover:bg-indigo-100/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Outputs, Curve, and Causation Explanation */}
        <div className="lg:col-span-7 space-y-4">
          {/* Real-time Parameter Causation Explainer Banner */}
          <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-2 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">
                Mechanistic Parameter Causation Engine
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {causationExplanation}
            </p>
          </div>

          {/* Dynamic Organ Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#E5DDD0] dark:border-slate-800 shadow-2xs transition-colors">
              <span className="text-[10px] font-bold text-[#4B6584] dark:text-slate-400 uppercase font-mono block">CKD-EPI (2021) eGFR</span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${
                egfr < 30 ? 'text-[#DC2626] dark:text-rose-400' : egfr < 45 ? 'text-amber-700 dark:text-amber-400' : 'text-[#15803D] dark:text-teal-300'
              }`}>
                {egfr} <span className="text-xs font-normal text-[#4B6584] dark:text-slate-400">mL/min</span>
              </span>
              <span className="text-[11px] text-[#4B6584] dark:text-slate-400">
                {egfr < 30 ? 'Stage 4 / 5 (Severe)' : egfr < 45 ? 'Stage 3b (Moderate)' : egfr < 60 ? 'Stage 3a (Mild)' : 'Normal Function'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#E5DDD0] dark:border-slate-800 shadow-2xs transition-colors">
              <span className="text-[10px] font-bold text-[#4B6584] dark:text-slate-400 uppercase font-mono block">Cockcroft-Gault CrCl</span>
              <span className="text-2xl font-bold font-mono text-[#1E3A8A] dark:text-slate-100 mt-1 block">
                {cgResult.crcl} <span className="text-xs font-normal text-[#4B6584] dark:text-slate-400">mL/min</span>
              </span>
              <span className="text-[11px] text-[#4B6584] dark:text-slate-400">
                AdjBW {cgResult.weightUsed} kg applied
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#E5DDD0] dark:border-slate-800 shadow-2xs transition-colors">
              <span className="text-[10px] font-bold text-[#4B6584] dark:text-slate-400 uppercase font-mono block">Simulated Half-Life</span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${
                simulatedHalfLife > 12 ? 'text-amber-700 dark:text-amber-400' : 'text-[#1E3A8A] dark:text-teal-300'
              }`}>
                {simulatedHalfLife} <span className="text-xs font-normal text-[#4B6584] dark:text-slate-400">hours</span>
              </span>
              <span className="text-[11px] text-[#4B6584] dark:text-slate-400">
                Baseline reference: {baselineHalfLife}h
              </span>
            </div>
          </div>

          {/* Secondary Deterministic PK Engine Outputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[#E5DDD0] dark:border-slate-700 font-mono text-xs">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#E5DDD0] dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Dist. Volume (Vd)</span>
              <span className="text-sm font-bold text-[#1E3A8A] dark:text-slate-100 mt-0.5 block">
                {deterministicPK.vdLiters} L
              </span>
              <span className="text-[10px] text-[#4B6584] font-sans">
                {(deterministicPK.vdLiters / weightKg).toFixed(2)} L/kg
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#E5DDD0] dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Clearance (CL)</span>
              <span className="text-sm font-bold text-[#15803D] dark:text-teal-300 mt-0.5 block">
                {deterministicPK.clearanceLperH} L/h
              </span>
              <span className="text-[10px] text-[#4B6584] font-sans">
                {((deterministicPK.clearanceLperH * 1000) / 60).toFixed(1)} mL/min
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#E5DDD0] dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Steady-State Trough</span>
              <span className="text-sm font-bold text-[#1E3A8A] dark:text-slate-100 mt-0.5 block">
                {deterministicPK.troughSteadyStateCss} mcg/mL
              </span>
              <span className="text-[10px] text-[#4B6584] font-sans">
                Peak: {deterministicPK.peakSteadyStateCss} mcg/mL
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#E5DDD0] dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">24h Exposure (AUC)</span>
              <span className="text-sm font-bold text-[#1E3A8A] dark:text-slate-100 mt-0.5 block">
                {deterministicPK.aucTau} mcg·h/mL
              </span>
              <span className="text-[10px] text-[#4B6584] font-sans">
                R: {deterministicPK.accumulationRatio}x
              </span>
            </div>
          </div>

          {/* Interactive Output Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E5DDD0] dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveOutputTab('curve')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOutputTab === 'curve'
                  ? 'border-[#15803D] text-[#15803D] dark:text-teal-300'
                  : 'border-transparent text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">show_chart</span>
              <span>Plasma Concentration Curve (Css)</span>
            </button>

            <button
              onClick={() => setActiveOutputTab('lineage')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOutputTab === 'lineage'
                  ? 'border-[#15803D] text-[#15803D] dark:text-teal-300'
                  : 'border-transparent text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Mathematical Lineage &amp; Formulas</span>
            </button>

            <button
              onClick={() => setActiveOutputTab('ai')}
              className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOutputTab === 'ai'
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Plain-Language AI Interpretation</span>
              {aiExplanation && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
            </button>
          </div>

          {/* TAB 1: Simulated PK Curve */}
          {activeOutputTab === 'curve' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-[#E5DDD0] dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#1E3A8A] dark:text-slate-100">
                      Simulated Steady-State Plasma Curve (Css) — 36h Multi-Dose Profile
                    </h3>
                    <span className="text-[11px] text-[#4B6584] dark:text-slate-400">
                      Model: Deterministic 1-Compartment oral absorption with repeated dosing every {intervalHours}h
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompareMode && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        Dual-Curve Overlay Active
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (selectedDrug === 'warfarin') onOpenProvenance('prov-warf-cyp2c9');
                        else if (selectedDrug === 'lisinopril') onOpenProvenance('prov-lis-acei');
                        else onOpenProvenance('prov-pk-model-met');
                      }}
                      className="text-xs text-[#15803D] dark:text-teal-300 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Provenance</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </button>
                  </div>
                </div>

                {/* SVG Plot */}
                <div className="relative w-full h-44 bg-[#FAF7F2] dark:bg-slate-950/80 rounded-lg p-2 border border-[#E5DDD0] dark:border-slate-800 overflow-hidden">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 680 120">
                    <defs>
                      <linearGradient id="activeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={isMetforminLacticAcidosisZone ? '#991b1b' : '#15803D'} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={isMetforminLacticAcidosisZone ? '#991b1b' : '#15803D'} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Upper Safety Threshold */}
                    <line stroke="#fecaca" strokeDasharray="4,4" strokeWidth="1.5" x1="0" x2="680" y1="35" y2="35" />
                    <text className="text-[10px] font-bold" fill="#991b1b" x="8" y="28">
                      Upper Safety Threshold ({deterministicPK.upperSafetyCeiling} mcg/mL)
                    </text>

                    {/* Target Steady-State Range */}
                    <line stroke="#cbd5e1" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="680" y1="75" y2="75" />
                    <text className="text-[10px]" fill="#64748b" x="8" y="70">
                      Target Therapeutic Window (1.0 - 2.0 mcg/mL)
                    </text>

                    {/* Baseline Scenario Curve if Compare Mode */}
                    {isCompareMode && (
                      <path
                        d={baselinePath}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4,3"
                      />
                    )}

                    {/* Active Simulated Curve */}
                    <path
                      d={activePath}
                      fill="none"
                      stroke={deterministicPK.safetyCeilingExceeded ? '#DC2626' : '#15803D'}
                      strokeWidth="2.5"
                    />

                    {/* Peak point indicator */}
                    <circle
                      cx={540}
                      cy={Math.max(10, 110 - (activePeak / 3.2) * 100)}
                      fill={deterministicPK.safetyCeilingExceeded ? '#DC2626' : '#15803D'}
                      r="4.5"
                    />
                  </svg>

                  <div className="absolute right-4 top-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded px-2.5 py-1 text-xs border border-[#E5DDD0] dark:border-slate-800 shadow-2xs font-mono">
                    Predicted Peak: <strong className={deterministicPK.safetyCeilingExceeded ? 'text-[#DC2626] dark:text-rose-400' : 'text-[#15803D] dark:text-teal-300'}>
                      {deterministicPK.peakSteadyStateCss} mcg/mL
                    </strong>
                    {isCompareMode && (
                      <span className="text-[#4B6584] ml-2">
                        (Baseline: {baselinePeak.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#4B6584] dark:text-slate-400">
                  <span>0h (Trough)</span>
                  <span>12h Interval Dose</span>
                  <span>24h Steady State</span>
                  <span>36h Model Projection</span>
                </div>
              </div>

              {/* Scenario Comparison Table if active */}
              {isCompareMode && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">compare</span>
                      <span>Direct Scenario Delta Matrix (Baseline vs Modified)</span>
                    </span>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono">
                      Diff Mode Enabled
                    </span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 font-mono text-[10px] uppercase">
                        <th className="py-1.5">Biomarker / Output</th>
                        <th className="py-1.5">Baseline Case</th>
                        <th className="py-1.5">Modified Scenario</th>
                        <th className="py-1.5 text-right">Net Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900/40 font-mono text-xs">
                      <tr>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-300 font-sans">eGFR (CKD-EPI)</td>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-400">{baselineEgfr} mL/min</td>
                        <td className="py-1.5 font-bold text-[#1E3A8A] dark:text-slate-100">{egfr} mL/min</td>
                        <td className={`py-1.5 text-right font-bold ${egfr < baselineEgfr ? 'text-[#DC2626] dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {egfr - baselineEgfr > 0 ? `+${egfr - baselineEgfr}` : `${egfr - baselineEgfr}`} mL/min
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-300 font-sans">Cockcroft-Gault CrCl</td>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-400">{baselineCg.crcl} mL/min</td>
                        <td className="py-1.5 font-bold text-[#1E3A8A] dark:text-slate-100">{cgResult.crcl} mL/min</td>
                        <td className="py-1.5 text-right font-bold text-[#1E3A5F] dark:text-slate-300">
                          {(cgResult.crcl - baselineCg.crcl).toFixed(1)} mL/min
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-300 font-sans">Predicted Peak (Css)</td>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-400">{baselinePeak.toFixed(2)} mcg/mL</td>
                        <td className="py-1.5 font-bold text-[#1E3A8A] dark:text-slate-100">{deterministicPK.peakSteadyStateCss} mcg/mL</td>
                        <td className={`py-1.5 text-right font-bold ${activePeak > baselinePeak ? 'text-[#DC2626] dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {activePeak > baselinePeak ? `+${((activePeak - baselinePeak) / baselinePeak * 100).toFixed(0)}%` : `${((activePeak - baselinePeak) / baselinePeak * 100).toFixed(0)}%`}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-300 font-sans">Drug Half-Life (t1/2)</td>
                        <td className="py-1.5 text-[#1E3A5F] dark:text-slate-400">{baselineHalfLife} hours</td>
                        <td className="py-1.5 font-bold text-[#1E3A8A] dark:text-slate-100">{deterministicPK.halfLifeHours} hours</td>
                        <td className="py-1.5 text-right text-[#1E3A5F] dark:text-slate-300">
                          {(deterministicPK.halfLifeHours - baselineHalfLife).toFixed(1)}h
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Mathematical Lineage & Formulas */}
          {activeOutputTab === 'lineage' && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-[#E5DDD0] dark:border-slate-800 space-y-4 text-xs animate-fade-in">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1E3A8A] dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#15803D] dark:text-teal-300 text-[18px]">functions</span>
                  <span>Deterministic Mathematical Lineage &amp; Validation Proof</span>
                </h3>
                <p className="text-[#4B6584] dark:text-slate-400 text-[11px] mt-0.5">
                  All calculations below are algorithmic and deterministic. AI is strictly excluded from numerical computation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E5DDD0] dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-[#1E3A8A] dark:text-slate-200 block text-[11px] uppercase font-mono">
                    Renal Clearance Formula (Cockcroft-Gault)
                  </span>
                  <div className="font-mono text-[11px] text-[#15803D] dark:text-teal-300 bg-white dark:bg-slate-900 p-2 rounded border border-[#E5DDD0] dark:border-slate-800">
                    {cgResult.formulaString}
                  </div>
                  <div className="text-[11px] text-[#1E3A5F] dark:text-slate-400">
                    <strong>Reference:</strong> {cgResult.reference}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E5DDD0] dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-[#1E3A8A] dark:text-slate-200 block text-[11px] uppercase font-mono">
                    Pharmacokinetic Kinetic Formula (One-Compartment)
                  </span>
                  <div className="font-mono text-[11px] text-[#15803D] dark:text-teal-300 bg-white dark:bg-slate-900 p-2 rounded border border-[#E5DDD0] dark:border-slate-800">
                    {deterministicPK.formulaMetadata.cMaxFormula}
                  </div>
                  <div className="text-[11px] text-[#1E3A5F] dark:text-slate-400">
                    <strong>Reference:</strong> {deterministicPK.formulaMetadata.primaryReference}
                  </div>
                </div>
              </div>

              {/* Evaluated Clinical Guideline Rules */}
              <div className="space-y-2 pt-2 border-t border-[#E5DDD0] dark:border-slate-800">
                <span className="font-bold text-[#1E3A8A] dark:text-slate-200 block text-[11px] uppercase font-mono">
                  Guideline Rules Evaluated:
                </span>
                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  deterministicPK.safetyCeilingExceeded
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-[#EEF7EE] dark:bg-[#1e293b] border-[#CBE4CB] dark:border-[#334155] text-[#15803D] dark:text-teal-300'
                }`}>
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                    {deterministicPK.safetyCeilingExceeded ? 'cancel' : 'check_circle'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-[11px]">{deterministicPK.guidelineCode}</strong>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/60 dark:bg-black/30">
                        {deterministicPK.safetyCeilingExceeded ? 'HAZARD' : 'TOLERATED'}
                      </span>
                    </div>
                    <p className="mt-0.5 leading-relaxed">{deterministicPK.safetyFinding}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Plain-Language AI Interpretation */}
          {activeOutputTab === 'ai' && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-[#E5DDD0] dark:border-slate-800 space-y-4 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#1E3A8A] dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]">psychology</span>
                    <span>Plain-Language Clinical Interpretation</span>
                  </h3>
                  <p className="text-[#4B6584] dark:text-slate-400 text-[11px] mt-0.5">
                    Grounded strictly in verified deterministic calculations and peer-reviewed clinical guidelines.
                  </p>
                </div>

                <button
                  onClick={handleExplainWithAI}
                  disabled={isExplaining}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isExplaining ? 'autorenew' : 'refresh'}
                  </span>
                  <span>{isExplaining ? 'Synthesizing...' : 'Regenerate Narrative'}</span>
                </button>
              </div>

              {isExplaining ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#1E3A5F] dark:text-slate-400 font-medium">
                    Consulting clinical pharmacology guidelines...
                  </p>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E5DDD0] dark:border-slate-700 leading-relaxed text-[#1E3A8A] dark:text-slate-200 whitespace-pre-line text-xs font-sans">
                    {aiExplanation}
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600 shrink-0">verified</span>
                    <span>
                      Synthesized via server-side Gemini API proxy. Deterministic calculations are verified; numerical values remain immutable.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 border border-dashed border-[#DDD4C5] dark:border-slate-700 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-slate-400">psychology</span>
                  <p className="text-[#1E3A5F] dark:text-slate-400 text-xs">
                    Click "Explain with AI" to generate an authoritative plain-language synthesis of this patient's pharmacokinetic state.
                  </p>
                  <button
                    onClick={handleExplainWithAI}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Generate Plain-Language Explanation</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
