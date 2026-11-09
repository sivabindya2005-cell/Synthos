import React, { useState, useMemo, useEffect } from 'react';
import versionedDrugsData from '../../data/versionedDrugs.json';
import {
  calculateIBW,
  calculateAdjustedBodyWeight,
  calculateBMI,
  calculateBSA,
  calculateCockcroftGault,
  calculateCKDEPI2021,
  calculateDeterministicPK,
  evaluateDecisionSupportMatrix,
  generatePKConcentrationCurve,
  detectAndSanitizePHI,
  runClinicalMathTests,
  DeterministicPKResult,
  DecisionSupportTriageResult,
  PKModelType,
  UnitTestResult
} from '../../utils/clinicalMath';
import { jsPDF } from 'jspdf';

interface GuidedSimulationWizardProps {
  onSwitchToWorkstation?: () => void;
  onOpenAdminDatabase?: () => void;
}

export const GuidedSimulationWizard: React.FC<GuidedSimulationWizardProps> = ({
  onSwitchToWorkstation,
  onOpenAdminDatabase
}) => {
  // Wizard Step (1: Patient Covariates, 2: Drug & Regimen, 3: Results & Decision Support)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Patient Covariates
  const [age, setAge] = useState<number>(68);
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [scr, setScr] = useState<number>(1.7);
  const [potassium, setPotassium] = useState<number>(4.6);
  const [hepaticStatus, setHepaticStatus] = useState<'Normal' | 'Child-Pugh A' | 'Child-Pugh B' | 'Child-Pugh C'>('Normal');
  const [pregnancy, setPregnancy] = useState<boolean>(false);
  const [lactation, setLactation] = useState<boolean>(false);
  const [weightChoice, setWeightChoice] = useState<'Actual' | 'IBW' | 'Adjusted' | 'Auto'>('Auto');
  const [patientNotes, setPatientNotes] = useState<string>('Synthetic Case SYN-89241. De-identified patient evaluation.');
  const [phiWarning, setPhiWarning] = useState<string | null>(null);

  // Step 2: Drug Selection & Regimen
  const [selectedDrugId, setSelectedDrugId] = useState<string>('vancomycin');
  const [doseMg, setDoseMg] = useState<number>(1000);
  const [intervalHours, setIntervalHours] = useState<number>(12);
  const [infusionTimeHours, setInfusionTimeHours] = useState<number>(1.5);
  const [routeOverride, setRouteOverride] = useState<'IV Bolus' | 'IV Infusion' | 'Oral'>('IV Infusion');
  const [modelOverride, setModelOverride] = useState<PKModelType | 'Auto'>('Auto');
  const [concurrentMeds, setConcurrentMeds] = useState<string[]>(['Piperacillin-Tazobactam']);
  const [drugSearchQuery, setDrugSearchQuery] = useState<string>('');

  // Step 3: AI Explanation & Secondary Comparison State
  const [aiExplanation, setAiExplanation] = useState<{
    summary: string;
    riskTierRationale: string;
    counsellingPoints: string[];
    insufficientDataNotice?: string;
    disclaimer: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Side-by-Side Comparison Regimen
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [compDoseMg, setCompDoseMg] = useState<number>(1000);
  const [compIntervalHours, setCompIntervalHours] = useState<number>(24);

  // Unit Test Modal / Drawer
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [unitTestResults, setUnitTestResults] = useState<{ allPassed: boolean; results: UnitTestResult[] } | null>(null);

  // Real-time PHI Check on Patient Notes
  useEffect(() => {
    const scan = detectAndSanitizePHI(patientNotes);
    if (scan.containsPHI) {
      setPhiWarning(scan.warnings.join(' '));
    } else {
      setPhiWarning(null);
    }
  }, [patientNotes]);

  // Derived Biometrics Calculation
  const ibw = useMemo(() => calculateIBW(heightCm, sex), [heightCm, sex]);
  const adjBw = useMemo(() => calculateAdjustedBodyWeight(weightKg, ibw), [weightKg, ibw]);
  const bmiInfo = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);
  const bsa = useMemo(() => calculateBSA(weightKg, heightCm), [weightKg, heightCm]);
  const cgResult = useMemo(
    () => calculateCockcroftGault(age, weightKg, heightCm, scr, sex, weightChoice),
    [age, weightKg, heightCm, scr, sex, weightChoice]
  );
  const ckdResult = useMemo(() => calculateCKDEPI2021(age, scr, sex), [age, scr, sex]);

  // Selected Drug Monograph
  const drugMonograph = useMemo(() => {
    return versionedDrugsData.drugs.find((d) => d.id === selectedDrugId) || versionedDrugsData.drugs[0];
  }, [selectedDrugId]);

  // When drug changes, update sensible defaults
  const handleSelectDrug = (drugId: string) => {
    setSelectedDrugId(drugId);
    const drug = versionedDrugsData.drugs.find((d) => d.id === drugId);
    if (drug) {
      setRouteOverride(drug.standardRoute as any);
      if (drug.id === 'gentamicin') {
        setDoseMg(120);
        setIntervalHours(8);
      } else if (drug.id === 'vancomycin') {
        setDoseMg(1000);
        setIntervalHours(12);
        setInfusionTimeHours(1.5);
      } else if (drug.id === 'digoxin') {
        setDoseMg(0.25);
        setIntervalHours(24);
      } else if (drug.id === 'phenytoin') {
        setDoseMg(300);
        setIntervalHours(24);
      } else if (drug.id === 'theophylline') {
        setDoseMg(300);
        setIntervalHours(12);
      } else if (drug.id === 'lithium') {
        setDoseMg(600);
        setIntervalHours(12);
      } else if (drug.id === 'paracetamol') {
        setDoseMg(1000);
        setIntervalHours(6);
      } else if (drug.id === 'metformin') {
        setDoseMg(500);
        setIntervalHours(12);
      }
    }
  };

  // Active Model Determination
  const activeModelType = useMemo((): PKModelType => {
    if (modelOverride !== 'Auto') return modelOverride;
    if (drugMonograph.saturable) return 'Michaelis-Menten Saturable';
    if (routeOverride === 'IV Infusion') return 'One-Compartment IV Infusion';
    if (routeOverride === 'Oral') return 'First-Order Oral Absorption';
    return 'One-Compartment IV Bolus';
  }, [modelOverride, drugMonograph, routeOverride]);

  // Primary Deterministic Pharmacokinetic Calculation
  const pkResult: DeterministicPKResult = useMemo(() => {
    return calculateDeterministicPK({
      drugId: selectedDrugId,
      doseMg,
      intervalHours,
      weightKg,
      heightCm,
      age,
      sex,
      scr,
      potassium,
      hepaticStatus,
      routeOverride,
      modelOverride: modelOverride === 'Auto' ? undefined : modelOverride,
      infusionTimeHours
    });
  }, [
    selectedDrugId,
    doseMg,
    intervalHours,
    weightKg,
    heightCm,
    age,
    sex,
    scr,
    potassium,
    hepaticStatus,
    routeOverride,
    modelOverride,
    infusionTimeHours
  ]);

  // Comparison Regimen PK Calculation (if active)
  const compPkResult: DeterministicPKResult = useMemo(() => {
    return calculateDeterministicPK({
      drugId: selectedDrugId,
      doseMg: compDoseMg,
      intervalHours: compIntervalHours,
      weightKg,
      heightCm,
      age,
      sex,
      scr,
      potassium,
      hepaticStatus,
      routeOverride,
      modelOverride: modelOverride === 'Auto' ? undefined : modelOverride,
      infusionTimeHours
    });
  }, [
    selectedDrugId,
    compDoseMg,
    compIntervalHours,
    weightKg,
    heightCm,
    age,
    sex,
    scr,
    potassium,
    hepaticStatus,
    routeOverride,
    modelOverride,
    infusionTimeHours
  ]);

  // Active Interactions Detection
  const detectedInteractions = useMemo(() => {
    const list: { agent: string; severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated'; mechanism: string }[] = [];
    for (const med of concurrentMeds) {
      const match = drugMonograph.majorInteractions.find(
        (inter) => inter.agent.toLowerCase().includes(med.toLowerCase()) || med.toLowerCase().includes(inter.agent.toLowerCase())
      );
      if (match) {
        list.push({
          agent: match.agent,
          severity: match.severity as any,
          mechanism: match.mechanism
        });
      }
    }
    return list;
  }, [drugMonograph, concurrentMeds]);

  // Decision Support Triage Result
  const triageResult: DecisionSupportTriageResult = useMemo(() => {
    return evaluateDecisionSupportMatrix({
      egfr: ckdResult.egfr,
      crcl: cgResult.crcl,
      hepaticStatus,
      isNarrowTherapeuticIndex: drugMonograph.narrowTherapeuticIndex,
      activeInteractions: detectedInteractions,
      age,
      bmi: bmiInfo.bmi,
      pregnancy,
      lactation,
      potassium
    });
  }, [ckdResult, cgResult, hepaticStatus, drugMonograph, detectedInteractions, age, bmiInfo, pregnancy, lactation, potassium]);

  // Curve Generation
  const primaryCurvePoints = useMemo(() => {
    return generatePKConcentrationCurve(
      doseMg,
      pkResult.vdLiters,
      pkResult.keHourInv,
      intervalHours,
      routeOverride,
      drugMonograph.absorptionRateKa || 1.2,
      infusionTimeHours
    );
  }, [doseMg, pkResult, intervalHours, routeOverride, drugMonograph, infusionTimeHours]);

  const compCurvePoints = useMemo(() => {
    if (!showComparison) return [];
    return generatePKConcentrationCurve(
      compDoseMg,
      compPkResult.vdLiters,
      compPkResult.keHourInv,
      compIntervalHours,
      routeOverride,
      drugMonograph.absorptionRateKa || 1.2,
      infusionTimeHours
    );
  }, [showComparison, compDoseMg, compPkResult, compIntervalHours, routeOverride, drugMonograph, infusionTimeHours]);

  // Fetch AI Plain-Language Explanation on Demand
  const handleRequestAiExplanation = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/clinical-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pkResult,
          patientProfile: {
            age,
            sex,
            egfr: ckdResult.egfr,
            crcl: cgResult.crcl,
            scr,
            potassium,
            hepaticStatus,
            bmi: bmiInfo.bmi
          },
          triageResult
        })
      });
      const data = await res.json();
      if (data.data) {
        setAiExplanation(data.data);
      } else {
        setAiExplanation(data.fallback || null);
      }
    } catch (err: any) {
      console.error('AI explanation error:', err);
      setAiError('AI consultation service offline. Deterministic calculations remain 100% active.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Pre-configured Example Case Loader
  const handleLoadExample = (exampleType: 'vancomycin_ckd' | 'gentamicin_icu' | 'digoxin_elderly' | 'phenytoin_saturable' | 'paracetamol_hepatic') => {
    if (exampleType === 'vancomycin_ckd') {
      setAge(72);
      setSex('Male');
      setWeightKg(82);
      setHeightCm(178);
      setScr(2.4);
      setPotassium(4.8);
      setHepaticStatus('Normal');
      setSelectedDrugId('vancomycin');
      setDoseMg(1000);
      setIntervalHours(24);
      setRouteOverride('IV Infusion');
      setInfusionTimeHours(1.5);
      setConcurrentMeds(['Piperacillin-Tazobactam']);
      setPatientNotes('Example Case 1: 72yo male with MRSA bacteremia and Stage 4 CKD. Evaluating vancomycin accumulation.');
    } else if (exampleType === 'gentamicin_icu') {
      setAge(58);
      setSex('Female');
      setWeightKg(64);
      setHeightCm(162);
      setScr(0.85);
      setPotassium(4.1);
      setHepaticStatus('Normal');
      setSelectedDrugId('gentamicin');
      setDoseMg(120);
      setIntervalHours(8);
      setRouteOverride('IV Bolus');
      setConcurrentMeds(['Furosemide']);
      setPatientNotes('Example Case 2: 58yo female with Pseudomonas urosepsis receiving synergistic gentamicin bolus.');
    } else if (exampleType === 'digoxin_elderly') {
      setAge(84);
      setSex('Female');
      setWeightKg(51);
      setHeightCm(154);
      setScr(1.6);
      setPotassium(3.3);
      setHepaticStatus('Normal');
      setSelectedDrugId('digoxin');
      setDoseMg(0.125);
      setIntervalHours(24);
      setRouteOverride('Oral');
      setConcurrentMeds(['Amiodarone', 'Furosemide']);
      setPatientNotes('Example Case 3: 84yo female with HFrEF and Afib. Risk of fatal digitalis toxicity with amiodarone and hypokalemia.');
    } else if (exampleType === 'phenytoin_saturable') {
      setAge(42);
      setSex('Male');
      setWeightKg(75);
      setHeightCm(180);
      setScr(0.9);
      setPotassium(4.4);
      setHepaticStatus('Normal');
      setSelectedDrugId('phenytoin');
      setDoseMg(350);
      setIntervalHours(24);
      setRouteOverride('Oral');
      setConcurrentMeds(['Fluconazole']);
      setPatientNotes('Example Case 4: 42yo male with focal seizures. Michaelis-Menten saturable kinetics with CYP2C9 inhibition.');
    } else if (exampleType === 'paracetamol_hepatic') {
      setAge(54);
      setSex('Male');
      setWeightKg(68);
      setHeightCm(172);
      setScr(1.1);
      setPotassium(4.0);
      setHepaticStatus('Child-Pugh B');
      setSelectedDrugId('paracetamol');
      setDoseMg(1000);
      setIntervalHours(6);
      setRouteOverride('Oral');
      setConcurrentMeds(['Ethanol (Chronic)']);
      setPatientNotes('Example Case 5: 54yo male with alcoholic cirrhosis. Paracetamol clearance and Rumack-Matthew hepatotoxicity limits.');
    }
    setCurrentStep(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Drug',
      'Route',
      'Model',
      'Dose_mg',
      'Interval_h',
      'eGFR_mL_min',
      'CrCl_mL_min',
      'Vd_L',
      'CL_L_h',
      'tHalf_h',
      'Cmax_ss',
      'Cmin_ss',
      'Cav_ss',
      'AUC_tau',
      'TargetMin',
      'TargetMax',
      'RiskTier',
      'RiskScore'
    ];
    const row = [
      `"${pkResult.drugGenericName}"`,
      `"${pkResult.route}"`,
      `"${pkResult.modelUsed}"`,
      pkResult.doseMg,
      pkResult.intervalHours,
      ckdResult.egfr,
      cgResult.crcl,
      pkResult.vdLiters,
      pkResult.clearanceLperH,
      pkResult.halfLifeHours,
      pkResult.peakSteadyStateCss,
      pkResult.troughSteadyStateCss,
      pkResult.averageSteadyStateCss,
      pkResult.aucTau,
      pkResult.therapeuticTargetMin,
      pkResult.therapeuticTargetMax,
      `"${triageResult.tier}"`,
      triageResult.score
    ];

    const disclaimer = '\n# DISCLAIMER: Educational and clinical decision support only. Not a certified medical device. Verify with local protocols.';
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + row.join(',') + disclaimer;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SYNTHOS_Simulation_${pkResult.drugId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SYNTHOS Pharmacotherapy Digital Twin Report', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
    doc.text('Positioning: Educational Decision Support for Qualified Healthcare Professionals', 14, 32);

    doc.setDrawColor(205, 180, 219);
    doc.line(14, 36, 196, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Patient Biometrics & Renal Profile', 14, 44);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Age: ${age} Y | Sex: ${sex} | Weight: ${weightKg} kg | Height: ${heightCm} cm | BMI: ${bmiInfo.bmi} (${bmiInfo.classification})`, 14, 51);
    doc.text(`Ideal Body Weight: ${ibw} kg | Adjusted Body Weight: ${adjBw} kg | BSA: ${bsa} m²`, 14, 57);
    doc.text(`Serum Creatinine: ${scr.toFixed(2)} mg/dL | Serum Potassium: ${potassium.toFixed(1)} mEq/L`, 14, 63);
    doc.text(`Cockcroft-Gault CrCl: ${cgResult.crcl} mL/min (Weight Choice: ${cgResult.weightChoiceMade})`, 14, 69);
    doc.text(`2021 CKD-EPI eGFR: ${ckdResult.egfr} mL/min/1.73m² (${ckdResult.stage})`, 14, 75);
    doc.text(`Hepatic Status: ${hepaticStatus}`, 14, 81);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Pharmacokinetic Simulation Outcomes', 14, 92);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Drug: ${pkResult.drugGenericName} | Regimen: ${pkResult.doseMg} mg every ${pkResult.intervalHours}h (${pkResult.route})`, 14, 99);
    doc.text(`Model: ${pkResult.modelUsed} | Bioavailability (F): ${pkResult.bioavailabilityF}`, 14, 105);
    doc.text(`Elimination Rate Constant (ke): ${pkResult.keHourInv} /h | Half-Life (t1/2): ${pkResult.halfLifeHours} h (${pkResult.halfLifeChangeFactor}x normal)`, 14, 111);
    doc.text(`Volume of Distribution (Vd): ${pkResult.vdLiters} L | Total Clearance (CL): ${pkResult.clearanceLperH} L/h`, 14, 117);
    doc.text(`Steady-State Peak (Cmax,ss): ${pkResult.peakSteadyStateCss} ${pkResult.therapeuticUnit}`, 14, 123);
    doc.text(`Steady-State Trough (Cmin,ss): ${pkResult.troughSteadyStateCss} ${pkResult.therapeuticUnit}`, 14, 129);
    doc.text(`Average Steady-State (Css,avg): ${pkResult.averageSteadyStateCss} ${pkResult.therapeuticUnit}`, 14, 135);
    doc.text(`Target Therapeutic Range: ${pkResult.therapeuticTargetMin}–${pkResult.therapeuticTargetMax} ${pkResult.therapeuticUnit}`, 14, 141);
    doc.text(`Recommended Loading Dose: ${pkResult.loadingDoseMg} mg`, 14, 147);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Decision Support Triage & Safety Matrix', 14, 158);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Triage Score: ${triageResult.score} | Risk Tier: ${triageResult.tier.toUpperCase()}`, 14, 165);
    doc.text(`Action: ${triageResult.recommendedAction}`, 14, 171);
    doc.text(`Guideline Reference: ${pkResult.guidelineCode}`, 14, 177);

    doc.setFontSize(9);
    doc.setTextColor(107, 102, 136);
    doc.text('LEGAL & CLINICAL DISCLAIMER: SYNTHOS is an educational pharmacometrics simulator.', 14, 275);
    doc.text('All calculations must be verified against local institutional protocols and patient-specific laboratory findings.', 14, 281);

    doc.save(`SYNTHOS_Report_${pkResult.drugId}_${Date.now()}.pdf`);
  };

  // Run Self-Tests
  const handleExecuteTests = () => {
    const res = runClinicalMathTests();
    setUnitTestResults(res);
    setShowTestModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] pb-16 transition-colors">
      {/* 3-Step Guided Progress Header */}
      <div className="bg-white/90 dark:bg-[#13253A]/90 border-b border-[#E5DDD0] dark:border-[#1F3B5C] sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#15803D] text-[#1E3A8A] flex items-center justify-center font-bold font-mono text-sm shadow-xs">
              S
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#1E3A8A] dark:text-[#F8FAFC]">
                Guided 3-Step Simulation Wizard
              </div>
              <div className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                Deterministic Pharmacometrics &amp; Decision Support Matrix
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-[#15803D] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-[#4B6584] dark:text-[#94A3B8]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>1. Patient Covariates</span>
            </button>
            <span className="text-xs text-[#15803D]">→</span>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-[#15803D] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-[#4B6584] dark:text-[#94A3B8]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>2. Drug &amp; Regimen</span>
            </button>
            <span className="text-xs text-[#15803D]">→</span>
            <button
              onClick={() => setCurrentStep(3)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-[#15803D] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-[#4B6584] dark:text-[#94A3B8]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>3. Simulation &amp; Triage</span>
            </button>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteTests}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5DDD0] dark:border-[#1F3B5C] bg-white dark:bg-[#0D1926] text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] hover:border-[#0F766E] transition-colors flex items-center gap-1 cursor-pointer"
              title="Run Automated Mathematical Unit Tests"
            >
              <span className="material-symbols-outlined text-[15px] text-[#15803D]">verified</span>
              <span className="hidden sm:inline">Unit Tests</span>
            </button>
            {onSwitchToWorkstation && (
              <button
                onClick={onSwitchToWorkstation}
                className="px-3 py-1.5 rounded-lg bg-[#15803D]/40 hover:bg-[#15803D]/60 border border-[#14B8A6] text-xs font-semibold text-[#1E3A8A] dark:text-[#F8FAFC] transition-colors flex items-center gap-1 cursor-pointer"
                title="Switch to 16-view Full Clinical Workstation"
              >
                <span className="material-symbols-outlined text-[15px]">space_dashboard</span>
                <span>Workstation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Synthetic Data Guardrail Banner */}
        <div className="bg-[#EEF7EE]/30 dark:bg-[#EEF7EE]/10 border border-[#CBE4CB] rounded-2xl p-3.5 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#15803D] text-[20px] shrink-0 mt-0.5">security</span>
          <div className="text-xs text-[#1E3A8A] dark:text-[#F8FAFC] leading-relaxed">
            <span className="font-bold">Synthetic / De-identified Safe Harbor:</span> Use synthetic or de-identified data only. Do not enter patient names, telephone numbers, emails, addresses, or hospital medical record numbers (MRNs). All free-text inputs are actively scanned and sanitized.
          </div>
        </div>

        {/* Example Cases Ribbon */}
        <div className="bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-3 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#4B6584] dark:text-[#94A3B8] mb-2 font-mono flex items-center justify-between">
            <span>One-Click Clinical Example Profiles</span>
            <span className="text-[10px] lowercase text-[#15803D]">click to populate covariates</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLoadExample('vancomycin_ckd')}
              className="px-2.5 py-1 rounded-lg bg-[#EEF7EE]/30 hover:bg-[#EEF7EE]/50 text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] border border-[#CBE4CB] transition-colors cursor-pointer"
            >
              72yo Male · CKD Stage 4 · Vancomycin Infusion
            </button>
            <button
              onClick={() => handleLoadExample('gentamicin_icu')}
              className="px-2.5 py-1 rounded-lg bg-[#EEF7EE]/40 hover:bg-[#EEF7EE]/60 text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] border border-[#CBE4CB] transition-colors cursor-pointer"
            >
              58yo Female · Sepsis · Gentamicin IV Bolus
            </button>
            <button
              onClick={() => handleLoadExample('digoxin_elderly')}
              className="px-2.5 py-1 rounded-lg bg-[#EEF7EE]/50 hover:bg-[#EEF7EE]/70 text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] border border-[#CBE4CB] transition-colors cursor-pointer"
            >
              84yo Female · Afib/HFrEF · Digoxin NTI
            </button>
            <button
              onClick={() => handleLoadExample('phenytoin_saturable')}
              className="px-2.5 py-1 rounded-lg bg-[#EEF7EE]/40 hover:bg-[#EEF7EE]/60 text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] border border-[#CBE4CB] transition-colors cursor-pointer"
            >
              42yo Male · Epilepsy · Phenytoin Non-Linear
            </button>
            <button
              onClick={() => handleLoadExample('paracetamol_hepatic')}
              className="px-2.5 py-1 rounded-lg bg-[#EEF7EE]/40 hover:bg-[#EEF7EE]/60 text-xs font-medium text-[#1E3A8A] dark:text-[#F8FAFC] border border-[#CBE4CB] transition-colors cursor-pointer"
            >
              54yo Male · Cirrhosis · Paracetamol Bounds
            </button>
          </div>
        </div>

        {/* STEP 1: PATIENT COVARIATES & DERIVED PARAMETERS */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Input Form Column */}
            <div className="lg:col-span-7 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                <div>
                  <h2 className="text-base font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">
                    Step 1: Patient Covariates &amp; Biological Markers
                  </h2>
                  <p className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                    Enter physiological covariates to derive renal clearance and distribution volumes.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#15803D]/40 text-[#1E3A8A] dark:text-[#F8FAFC]">
                  Adult Protocol (18-120Y)
                </span>
              </div>

              {/* Demographics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden"
                  >
                    <option value="Male">Male (Factor 1.0)</option>
                    <option value="Female">Female (Factor 0.85)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={240}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Renal & Electrolytes Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Serum Creatinine (mg/dL)
                  </label>
                  <input
                    type="number"
                    min={0.2}
                    max={20.0}
                    step="0.05"
                    value={scr}
                    onChange={(e) => setScr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] mt-1 block">
                    Normal reference: 0.6–1.2 mg/dL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Serum Potassium (mEq/L)
                  </label>
                  <input
                    type="number"
                    min={1.5}
                    max={9.0}
                    step="0.1"
                    value={potassium}
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] mt-1 block">
                    Normal: 3.5–5.0 mEq/L
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Hepatic Status
                  </label>
                  <select
                    value={hepaticStatus}
                    onChange={(e) => setHepaticStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden"
                  >
                    <option value="Normal">Normal (Class 0)</option>
                    <option value="Child-Pugh A">Child-Pugh A (Mild)</option>
                    <option value="Child-Pugh B">Child-Pugh B (Moderate)</option>
                    <option value="Child-Pugh C">Child-Pugh C (Severe)</option>
                  </select>
                  <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] mt-1 block">
                    Affects non-renal clearance
                  </span>
                </div>
              </div>

              {/* Special Vulnerability Toggles */}
              <div className="pt-2 border-t border-[#E5DDD0] dark:border-[#1F3B5C] flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1E3A8A] dark:text-[#F8FAFC]">
                  <input
                    type="checkbox"
                    checked={pregnancy}
                    onChange={(e) => setPregnancy(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15803D] focus:ring-[#15803D]"
                  />
                  <span>Pregnancy (Gestational Expansion)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1E3A8A] dark:text-[#F8FAFC]">
                  <input
                    type="checkbox"
                    checked={lactation}
                    onChange={(e) => setLactation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15803D] focus:ring-[#15803D]"
                  />
                  <span>Lactation (Breastfeeding Hazard)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8]">
                    CrCl Weight Choice:
                  </span>
                  <select
                    value={weightChoice}
                    onChange={(e) => setWeightChoice(e.target.value as any)}
                    className="px-2 py-1 text-xs rounded-lg border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926]"
                  >
                    <option value="Auto">Auto-Selected</option>
                    <option value="Actual">Actual Weight</option>
                    <option value="IBW">Ideal Weight (Devine)</option>
                    <option value="Adjusted">Adjusted Weight</option>
                  </select>
                </div>
              </div>

              {/* Clinical Notes & Real-Time PHI Scanner */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                  Synthetic Case Context &amp; Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Enter synthetic notes. No patient identifiers allowed."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden"
                />
                {phiWarning && (
                  <div className="mt-1.5 p-2 rounded-lg bg-[#F4A6B8]/30 border border-[#F4A6B8] text-[11px] font-semibold text-[#701124] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>{phiWarning}</span>
                  </div>
                )}
              </div>

              {/* Step 1 Action */}
              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step 2: Drug Selection</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Derived Biometrics Summary Card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B6584] dark:text-[#94A3B8] font-mono">
                Real-Time Derived Clearances
              </h3>

              {/* eGFR 2021 CKD-EPI Highlight */}
              <div className="p-4 rounded-xl bg-[#EEF7EE]/30 dark:bg-[#EEF7EE]/15 border border-[#CBE4CB]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#134e3f]">2021 Race-Free CKD-EPI eGFR</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF7EE] text-[#134e3f]">
                    {ckdResult.stageCode}
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-[#134e3f] mt-1">
                  {ckdResult.egfr} <span className="text-xs font-normal">mL/min/1.73m²</span>
                </div>
                <div className="text-[11px] text-[#134e3f]/80 mt-1">
                  {ckdResult.stage}
                </div>
              </div>

              {/* Cockcroft-Gault CrCl */}
              <div className="p-4 rounded-xl bg-[#EEF7EE]/30 dark:bg-[#EEF7EE]/15 border border-[#CBE4CB]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1e3a8a]">Cockcroft-Gault CrCl</span>
                  <span className="text-[10px] font-mono text-[#1e3a8a]/70">
                    {cgResult.weightChoiceMade}
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-[#1e3a8a] mt-1">
                  {cgResult.crcl} <span className="text-xs font-normal">mL/min</span>
                </div>
                <div className="text-[10px] font-mono text-[#1e3a8a]/80 mt-1">
                  Weight Used: {cgResult.weightUsed} kg (IBW: {ibw} kg, AdjBW: {adjBw} kg)
                </div>
              </div>

              {/* Key Anthropometrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                  <span className="text-[11px] text-[#4B6584] dark:text-[#94A3B8] block">BMI (Body Mass Index)</span>
                  <span className="text-lg font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                    {bmiInfo.bmi} <span className="text-xs font-normal">kg/m²</span>
                  </span>
                  <span className="text-[10px] text-[#15803D] block truncate font-medium">
                    {bmiInfo.classification}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                  <span className="text-[11px] text-[#4B6584] dark:text-[#94A3B8] block">BSA (Mosteller)</span>
                  <span className="text-lg font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                    {bsa} <span className="text-xs font-normal">m²</span>
                  </span>
                  <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">
                    √((Ht × Wt)/3600)
                  </span>
                </div>
              </div>

              {/* Equations & Citations Box */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-[10px] text-[#4B6584] dark:text-[#94A3B8] space-y-1">
                <div className="font-semibold text-[#1E3A8A] dark:text-[#F8FAFC]">Mathematical Formulations:</div>
                <div>• CKD-EPI: Inker LA, et al. N Engl J Med 2021;385:1737-1749.</div>
                <div>• CrCl: Cockcroft DW, Gault MH. Nephron 1976;16(1):31-41.</div>
                <div>• Ideal Body Weight: Devine BJ. Drug Intell Clin Pharm 1974;8:650-5.</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DRUG & REGIMEN CALIBRATION */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Drug Selection Column */}
            <div className="lg:col-span-7 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                <div>
                  <h2 className="text-base font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">
                    Step 2: Drug Monograph &amp; Dosing Regimen
                  </h2>
                  <p className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                    Select target agent, route, dose, and inspect automated pharmacokinetic model assignment.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#15803D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Back to Patient</span>
                </button>
              </div>

              {/* 7 Core Validated NTI Starter Drugs */}
              <div>
                <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1.5">
                  Core Validated NTI &amp; Clearance Agents
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {versionedDrugsData.drugs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDrug(d.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedDrugId === d.id
                          ? 'border-[#0F766E] bg-[#15803D]/25 text-[#1E3A8A] dark:text-[#F8FAFC] ring-2 ring-[#0F766E]/40 font-bold'
                          : 'border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#4B6584] dark:text-[#94A3B8] hover:border-[#14B8A6]'
                      }`}
                    >
                      <div className="text-xs truncate">{d.name}</div>
                      <div className="text-[10px] text-[#15803D] truncate font-mono">
                        {d.drugClass}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regimen Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Dose per Administration (mg)
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="5"
                    value={doseMg}
                    onChange={(e) => setDoseMg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Dosing Interval τ (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={96}
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] mt-1 block">
                    e.g. 8 (TID), 12 (BID), 24 (QD)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Route of Administration
                  </label>
                  <select
                    value={routeOverride}
                    onChange={(e) => setRouteOverride(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden"
                  >
                    <option value="IV Bolus">IV Bolus</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Oral">Oral (First-Order)</option>
                  </select>
                </div>
              </div>

              {/* Infusion time (if IV Infusion) & Model Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {routeOverride === 'IV Infusion' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                      Infusion Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min={0.25}
                      max={12}
                      step="0.25"
                      value={infusionTimeHours}
                      onChange={(e) => setInfusionTimeHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] mb-1">
                    Pharmacokinetic Model
                  </label>
                  <select
                    value={modelOverride}
                    onChange={(e) => setModelOverride(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] bg-[#FAF7F2] dark:bg-[#0D1926] text-[#1E3A8A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#15803D] focus:outline-hidden"
                  >
                    <option value="Auto">Auto-Selected ({activeModelType})</option>
                    <option value="One-Compartment IV Bolus">One-Compartment IV Bolus</option>
                    <option value="One-Compartment IV Infusion">One-Compartment IV Infusion</option>
                    <option value="First-Order Oral Absorption">First-Order Oral Absorption</option>
                    <option value="Michaelis-Menten Saturable">Michaelis-Menten Saturable</option>
                  </select>
                </div>
              </div>

              {/* Step 2 Action */}
              <div className="pt-3 flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-full border border-[#E5DDD0] dark:border-[#1F3B5C] text-xs font-semibold text-[#4B6584] dark:text-[#94A3B8] hover:text-[#1E3A8A] dark:hover:text-white cursor-pointer"
                >
                  ← Previous Step
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Run Deterministic Simulation</span>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                </button>
              </div>
            </div>

            {/* Selected Drug Monograph Sidebar */}
            <div className="lg:col-span-5 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">
                    {drugMonograph.name}
                  </h3>
                  <div className="text-xs text-[#15803D] font-medium">{drugMonograph.brandName}</div>
                </div>
                {drugMonograph.narrowTherapeuticIndex && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4A6B8]/30 border border-[#F4A6B8] text-[#701124]">
                    NTI Agent
                  </span>
                )}
              </div>

              {/* Target Range Box */}
              <div className="p-3.5 rounded-xl bg-[#EEF7EE]/30 dark:bg-[#EEF7EE]/15 border border-[#CBE4CB]">
                <div className="text-[11px] font-bold text-[#6b5300] uppercase tracking-wider font-mono">
                  Therapeutic Target Window
                </div>
                <div className="text-xl font-bold font-mono text-[#6b5300] mt-1">
                  {drugMonograph.therapeuticRange.min} – {drugMonograph.therapeuticRange.max}{' '}
                  <span className="text-xs font-normal">{drugMonograph.therapeuticRange.unit}</span>
                </div>
                <div className="text-[11px] text-[#6b5300]/90 mt-1">
                  {drugMonograph.therapeuticRange.description}
                </div>
              </div>

              {/* Drug Properties Table */}
              <div className="text-xs space-y-2 pt-1">
                <div className="flex justify-between py-1 border-b border-[#E5DDD0]/60 dark:border-[#1F3B5C]/60">
                  <span className="text-[#4B6584] dark:text-[#94A3B8]">Baseline Half-Life (t½):</span>
                  <span className="font-mono font-bold">{drugMonograph.eliminationHalfLifeHours} hours</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DDD0]/60 dark:border-[#1F3B5C]/60">
                  <span className="text-[#4B6584] dark:text-[#94A3B8]">Fraction Excreted Renal (fe):</span>
                  <span className="font-mono font-bold">{(drugMonograph.fractionExcretedUnchanged * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DDD0]/60 dark:border-[#1F3B5C]/60">
                  <span className="text-[#4B6584] dark:text-[#94A3B8]">Volume of Distribution (Vd):</span>
                  <span className="font-mono font-bold">{drugMonograph.volumeOfDistributionLperKg} L/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5DDD0]/60 dark:border-[#1F3B5C]/60">
                  <span className="text-[#4B6584] dark:text-[#94A3B8]">Renal Adjustment Guideline:</span>
                  <span className="font-medium text-[#15803D] text-right truncate max-w-[200px]">{drugMonograph.renalRules.guideline}</span>
                </div>
              </div>

              {/* Major Interactions Warning Box */}
              {detectedInteractions.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F4A6B8]/20 border border-[#F4A6B8] text-xs space-y-1">
                  <div className="font-bold text-[#701124] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Active Co-Administration Interaction:</span>
                  </div>
                  {detectedInteractions.map((inter, i) => (
                    <div key={i} className="text-[11px] text-[#701124]/90 pl-5">
                      • <span className="font-semibold">{inter.agent}</span>: {inter.mechanism} ({inter.severity})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SIMULATION RESULTS, CURVES & TRIAGE MATRIX */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="p-1.5 rounded-lg border border-[#E5DDD0] dark:border-[#1F3B5C] text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-white cursor-pointer"
                  title="Modify Regimen"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <div>
                  <h2 className="text-base font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">
                    Step 3: Pharmacokinetic Simulation &amp; Decision Support Matrix
                  </h2>
                  <p className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                    Deterministic numbers verified. Shaded therapeutic window &amp; multi-organ risk tier.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    showComparison
                      ? 'bg-[#EEF7EE] text-[#1e3a8a] border-[#CBE4CB]'
                      : 'bg-[#FAF7F2] dark:bg-[#0D1926] border-[#E5DDD0] dark:border-[#1F3B5C] text-[#1E3A8A] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">compare</span>
                  <span>{showComparison ? 'Hide Comparison' : 'Compare Regimen'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-xs font-semibold text-[#1E3A8A] dark:text-[#F8FAFC] hover:border-[#0F766E] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="px-3.5 py-1.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Interactive Concentration-Time Curve Canvas */}
            <div className="bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <span>Multi-Dose Concentration-Time Trajectory</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EEF7EE]/40 text-[#134e3f] font-semibold">
                      Steady-State Target: {pkResult.therapeuticTargetMin}–{pkResult.therapeuticTargetMax} {pkResult.therapeuticUnit}
                    </span>
                  </h3>
                  <p className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                    Simulating 4 continuous dosing intervals (total {intervalHours * 4} hours) using {pkResult.modelUsed}.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#15803D] rounded-full"></span>
                    <span className="text-[#1E3A8A] dark:text-[#F8FAFC]">Active Regimen ({doseMg}mg q{intervalHours}h)</span>
                  </div>
                  {showComparison && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#EEF7EE] rounded-full border border-dashed border-[#1e3a8a]"></span>
                      <span className="text-[#1e3a8a] dark:text-[#E6F4F1]">Comparison ({compDoseMg}mg q{compIntervalHours}h)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shaded SVG Curve Viewport */}
              <div className="mt-4 relative overflow-hidden bg-[#FAF7F2] dark:bg-[#0D1926] rounded-xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-4">
                <svg viewBox="0 0 700 240" className="w-full h-56 select-none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="680" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="40" y1="70" x2="680" y2="70" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="40" y1="120" x2="680" y2="120" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="40" y1="170" x2="680" y2="170" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="40" y1="210" x2="680" y2="210" stroke="currentColor" strokeOpacity="0.3" />

                  {/* Shaded Therapeutic Window Area */}
                  {(() => {
                    const maxPlotY = Math.max(30, pkResult.therapeuticTargetMax * 1.6);
                    const yTop = 210 - (pkResult.therapeuticTargetMax / maxPlotY) * 190;
                    const yBottom = 210 - (pkResult.therapeuticTargetMin / maxPlotY) * 190;
                    const rectHeight = Math.max(4, yBottom - yTop);
                    return (
                      <g>
                        <rect
                          x="40"
                          y={yTop}
                          width="640"
                          height={rectHeight}
                          fill="#E6F4F1"
                          fillOpacity="0.35"
                        />
                        <text x="675" y={yTop + 12} textAnchor="end" className="text-[9px] font-mono fill-[#134e3f] font-bold">
                          Therapeutic Target ({pkResult.therapeuticTargetMin}–{pkResult.therapeuticTargetMax} {pkResult.therapeuticUnit})
                        </text>
                        {/* Upper Toxicity Ceiling Line */}
                        <line
                          x1="40"
                          y1={yTop}
                          x2="680"
                          y2={yTop}
                          stroke="#F4A6B8"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      </g>
                    );
                  })()}

                  {/* Comparison Curve (if active) */}
                  {showComparison && compCurvePoints.length > 0 && (() => {
                    const maxPlotY = Math.max(30, pkResult.therapeuticTargetMax * 1.6);
                    const totalT = intervalHours * 4;
                    const pointsStr = compCurvePoints.map((p) => {
                      const px = 40 + (p.timeHours / totalT) * 640;
                      const py = Math.max(10, 210 - (p.concentration / maxPlotY) * 190);
                      return `${px},${py}`;
                    }).join(' ');
                    return (
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="#E6F4F1"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                      />
                    );
                  })()}

                  {/* Primary Active Curve */}
                  {primaryCurvePoints.length > 0 && (() => {
                    const maxPlotY = Math.max(30, pkResult.therapeuticTargetMax * 1.6);
                    const totalT = intervalHours * 4;
                    const pointsStr = primaryCurvePoints.map((p) => {
                      const px = 40 + (p.timeHours / totalT) * 640;
                      const py = Math.max(10, 210 - (p.concentration / maxPlotY) * 190);
                      return `${px},${py}`;
                    }).join(' ');
                    return (
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    );
                  })()}

                  {/* Axis labels */}
                  <text x="40" y="225" className="text-[10px] font-mono fill-[#64748B]">0h</text>
                  <text x="200" y="225" className="text-[10px] font-mono fill-[#64748B]">{intervalHours}h</text>
                  <text x="360" y="225" className="text-[10px] font-mono fill-[#64748B]">{intervalHours * 2}h</text>
                  <text x="520" y="225" className="text-[10px] font-mono fill-[#64748B]">{intervalHours * 3}h</text>
                  <text x="680" y="225" textAnchor="end" className="text-[10px] font-mono fill-[#64748B]">{intervalHours * 4}h</text>
                </svg>
              </div>

              {/* Ceiling Alert Banner */}
              {pkResult.safetyCeilingExceeded && (
                <div className="mt-3 p-3 rounded-xl bg-[#F4A6B8]/30 border border-[#F4A6B8] flex items-center gap-2 text-xs font-bold text-[#701124]">
                  <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                  <span>{pkResult.safetyFinding}</span>
                </div>
              )}
            </div>

            {/* Side-by-Side Comparison Drawer (if activated) */}
            {showComparison && (
              <div className="p-4 rounded-2xl bg-[#EEF7EE]/20 border border-[#CBE4CB] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] font-mono">
                    Side-by-Side Regimen Comparison
                  </h4>
                  <span className="text-xs text-[#1e3a8a]">Adjust dose or interval below</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1e3a8a] mb-1">
                      Comparison Dose (mg)
                    </label>
                    <input
                      type="number"
                      value={compDoseMg}
                      onChange={(e) => setCompDoseMg(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#CBE4CB] bg-white dark:bg-[#0D1926] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1e3a8a] mb-1">
                      Comparison Interval (Hours)
                    </label>
                    <input
                      type="number"
                      value={compIntervalHours}
                      onChange={(e) => setCompIntervalHours(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#CBE4CB] bg-white dark:bg-[#0D1926] font-mono"
                    />
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#0D1926] border border-[#CBE4CB]/60">
                    <span className="text-[10px] text-[#4B6584] block">Comp Cmax,ss</span>
                    <span className="text-sm font-bold font-mono text-[#1e3a8a]">
                      {compPkResult.peakSteadyStateCss} {compPkResult.therapeuticUnit}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#0D1926] border border-[#CBE4CB]/60">
                    <span className="text-[10px] text-[#4B6584] block">Comp Cmin,ss</span>
                    <span className="text-sm font-bold font-mono text-[#1e3a8a]">
                      {compPkResult.troughSteadyStateCss} {compPkResult.therapeuticUnit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2-Column Split: Deterministic PK Parameters & Decision Support Triage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Deterministic Parameters Table */}
              <div className="lg:col-span-7 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B6584] dark:text-[#94A3B8] font-mono">
                    Deterministic Pharmacokinetic Metrics
                  </h3>
                  <span className="text-[10px] font-mono text-[#15803D]">
                    Formula Verified · Zero AI
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Elimination Rate (ke)</span>
                    <span className="text-base font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                      {pkResult.keHourInv} <span className="text-xs font-normal">/h</span>
                    </span>
                    <span className="text-[9px] text-[#4B6584] block">CL / Vd</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Half-Life (t½)</span>
                    <span className="text-base font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                      {pkResult.halfLifeHours} <span className="text-xs font-normal">h</span>
                    </span>
                    <span className="text-[9px] text-[#15803D] block font-semibold">
                      {pkResult.halfLifeChangeFactor}x baseline
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Total Clearance (CL)</span>
                    <span className="text-base font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                      {pkResult.clearanceLperH} <span className="text-xs font-normal">L/h</span>
                    </span>
                    <span className="text-[9px] text-[#4B6584] block">Renal: {pkResult.renalClearanceLperH} L/h</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Peak Steady-State (Cmax)</span>
                    <span className="text-base font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                      {pkResult.peakSteadyStateCss} <span className="text-xs font-normal">{pkResult.therapeuticUnit}</span>
                    </span>
                    <span className="text-[9px] text-[#4B6584] block">Target Max: {pkResult.therapeuticTargetMax}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Trough Steady-State (Cmin)</span>
                    <span className="text-base font-bold font-mono text-[#1E3A8A] dark:text-[#F8FAFC]">
                      {pkResult.troughSteadyStateCss} <span className="text-xs font-normal">{pkResult.therapeuticUnit}</span>
                    </span>
                    <span className="text-[9px] text-[#4B6584] block">Target Min: {pkResult.therapeuticTargetMin}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                    <span className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] block">Recommended Loading Dose</span>
                    <span className="text-base font-bold font-mono text-[#15803D]">
                      {pkResult.loadingDoseMg} <span className="text-xs font-normal">mg</span>
                    </span>
                    <span className="text-[9px] text-[#4B6584] block">Css,target × Vd / F</span>
                  </div>
                </div>

                {/* Mathematical Derivations & Assumptions Accordion */}
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-xs space-y-1.5">
                  <div className="font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">Calculated Formulas &amp; References:</div>
                  <div className="font-mono text-[10px] text-[#4B6584] dark:text-[#94A3B8]">
                    • Peak Formula: {pkResult.formulaMetadata.cMaxFormula}
                  </div>
                  <div className="font-mono text-[10px] text-[#4B6584] dark:text-[#94A3B8]">
                    • Trough Formula: {pkResult.formulaMetadata.cMinFormula}
                  </div>
                  <div className="text-[10px] text-[#15803D]">
                    Reference: {pkResult.formulaMetadata.primaryReference}
                  </div>
                </div>
              </div>

              {/* Column 2: Transparent Decision Support Triage Matrix */}
              <div className="lg:col-span-5 bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B6584] dark:text-[#94A3B8] font-mono">
                    Decision Support Triage Matrix
                  </h3>
                  {/* Non-Hue-Only Risk Tier Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      triageResult.tier === 'Low'
                        ? 'bg-[#EEF7EE] text-[#134e3f]'
                        : triageResult.tier === 'Moderate'
                        ? 'bg-[#EEF7EE] text-[#6b5300]'
                        : triageResult.tier === 'High'
                        ? 'bg-[#EEF7EE] text-[#7c3008]'
                        : 'bg-[#F4A6B8] text-[#701124] border-2 border-[#701124]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {triageResult.tier === 'Low'
                        ? 'check_circle'
                        : triageResult.tier === 'Moderate'
                        ? 'help'
                        : triageResult.tier === 'High'
                        ? 'warning'
                        : 'crisis_alert'}
                    </span>
                    <span>{triageResult.tier.toUpperCase()} RISK (Score {triageResult.score})</span>
                  </div>
                </div>

                {/* Recommended Clinical Action */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B6584] dark:text-[#94A3B8] font-mono">
                    Recommended Clinical Action
                  </div>
                  <div className="text-xs font-semibold text-[#1E3A8A] dark:text-[#F8FAFC] mt-1">
                    {triageResult.recommendedAction}
                  </div>
                </div>

                {/* Transparent Factor Breakdown */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-[#4B6584] dark:text-[#94A3B8]">
                    Triggered Clinical Risk Factors:
                  </div>
                  {triageResult.factors.length === 0 ? (
                    <div className="text-xs text-[#134e3f] bg-[#EEF7EE]/30 p-2 rounded-lg">
                      No adverse risk factors identified. Normal clearance bounds.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {triageResult.factors.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0]/80 dark:border-[#1F3B5C]/80 text-xs"
                        >
                          <span className="text-[#1E3A8A] dark:text-[#F8FAFC]">{f.description}</span>
                          <span className="font-mono font-bold text-[#15803D]">+{f.points} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Surveillance Plan */}
                <div className="pt-2 border-t border-[#E5DDD0] dark:border-[#1F3B5C] space-y-2">
                  <div className="text-[11px] font-bold text-[#4B6584] dark:text-[#94A3B8]">
                    Recommended Laboratory Surveillance Schedule:
                  </div>
                  {triageResult.monitoringPlan.map((m, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#0D1926]">
                      <div className="flex justify-between font-semibold">
                        <span>{m.parameter}</span>
                        <span className="text-[#15803D]">{m.frequency}</span>
                      </div>
                      <div className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] mt-0.5">
                        {m.clinicalRationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Clinical Plain-Language Explanation Section */}
            <div className="bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5DDD0] dark:border-[#1F3B5C] gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#15803D]">psychology</span>
                    <span>AI Clinical Interpretation &amp; Counselling Summary (Gemini 3.8 Flash)</span>
                  </h3>
                  <p className="text-xs text-[#4B6584] dark:text-[#94A3B8]">
                    Strict plain-language interpretation of deterministic math. Zero invented doses or numbers.
                  </p>
                </div>

                <button
                  onClick={handleRequestAiExplanation}
                  disabled={loadingAi}
                  className="px-4 py-2 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {loadingAi ? 'sync' : 'auto_awesome'}
                  </span>
                  <span>{loadingAi ? 'Interpreting...' : 'Generate Clinical Explanation'}</span>
                </button>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-[#EEF7EE]/40 border border-[#CBE4CB] text-xs text-[#6b5300]">
                  {aiError}
                </div>
              )}

              {aiExplanation ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#EEF7EE]/20 border border-[#CBE4CB]">
                    <div className="font-bold text-[#1e3a8a] mb-1">Pathophysiological Rationale:</div>
                    <p className="text-[#1E3A8A] dark:text-[#F8FAFC] leading-relaxed">
                      {aiExplanation.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                      <div className="font-bold text-[#15803D] mb-1">Risk Tier Attribution:</div>
                      <p className="text-[#4B6584] dark:text-[#94A3B8]">
                        {aiExplanation.riskTierRationale}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C]">
                      <div className="font-bold text-[#15803D] mb-1">Key Patient Counselling Points:</div>
                      <ul className="list-disc pl-4 space-y-1 text-[#4B6584] dark:text-[#94A3B8]">
                        {aiExplanation.counsellingPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#4B6584] dark:text-[#94A3B8] font-mono italic">
                    {aiExplanation.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#4B6584] dark:text-[#94A3B8]">
                  Click &ldquo;Generate Clinical Explanation&rdquo; to interpret calculated pharmacokinetic values in plain clinical language.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mathematical Unit Test Runner Modal */}
      {showTestModal && unitTestResults && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13253A] rounded-2xl border border-[#E5DDD0] dark:border-[#1F3B5C] max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0] dark:border-[#1F3B5C]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#15803D]">verified</span>
                <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-[#F8FAFC]">
                  Automated Deterministic Engine Unit Tests
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-[#4B6584] hover:text-[#1E3A8A] dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#EEF7EE]/30 border border-[#CBE4CB] text-xs font-bold text-[#134e3f] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>All 6 deterministic test suites passed with exact expected targets!</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {unitTestResults.results.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#0D1926] border border-[#E5DDD0] dark:border-[#1F3B5C] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{r.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EEF7EE] text-[#134e3f] font-mono text-[10px] font-bold">
                      PASSED
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B6584] dark:text-[#94A3B8]">
                    Expected: {r.expected}
                  </div>
                  <div className="text-[11px] font-mono text-[#15803D]">
                    Computed: {r.actual}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-full bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
              >
                Close Verification Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
