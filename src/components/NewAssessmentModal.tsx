import React, { useState } from 'react';
import { PatientCase } from '../types/clinical';
import {
  calculateCKDEPI2021,
  calculateCockcroftGault,
  calculateIBW,
  calculateBMI,
  calculateBSA
} from '../utils/clinicalMath';
import { useClinicianAuth } from '../context/AuthContext';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAssessment: (newCase: PatientCase) => void;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSaveAssessment
}) => {
  const { clinician } = useClinicianAuth();
  if (!isOpen) return null;

  const [id, setId] = useState(`DEMO-PT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [age, setAge] = useState<number>(65);
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [raceEthnicity, setRaceEthnicity] = useState<string>('Caucasian / European Ancestry');
  const [smoking, setSmoking] = useState<'Non-smoker' | 'Former smoker' | 'Current smoker'>('Non-smoker');
  const [albumin, setAlbumin] = useState<number>(4.0);
  const [systolicBp, setSystolicBp] = useState<number>(134);
  const [diastolicBp, setDiastolicBp] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [scr, setScr] = useState<number>(1.6);
  const [kSerum, setKSerum] = useState<number>(4.8);
  const [hba1c, setHba1c] = useState<number>(7.9);
  const [primaryCondition, setPrimaryCondition] = useState<string>('T2D + CKD Stage 3');
  const [drugs, setDrugs] = useState<string>('Metformin 1000mg BID, Lisinopril 20mg Daily, Atorvastatin 20mg');

  // Real-time deterministic clinical calculations
  const calculatedEgfr = calculateCKDEPI2021(age, scr, sex).egfr;
  const cg = calculateCockcroftGault(age, weightKg, heightCm, scr, sex, 'Auto');
  const bmiInfo = calculateBMI(weightKg, heightCm);
  const ibwKg = calculateIBW(heightCm, sex);
  const bsaM2 = calculateBSA(weightKg, heightCm);

  // Pharmacokinetic volume of distribution estimate based on actual weight & albumin
  // Normal albumin = 4.0 g/dL. Lower albumin expands free fraction (fu) and apparent Vd
  const albuminRatio = Math.max(0.6, Math.min(1.4, albumin / 4.0));
  const estimatedVdLiters = Number(((0.65 * weightKg) / albuminRatio).toFixed(1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCompromised = calculatedEgfr < 45;
    const isObese = bmiInfo.bmi >= 30;

    const newCase: PatientCase = {
      id,
      tier: 'Tier-4',
      nameAlias: `Synthetic Case ${id.replace('DEMO-PT-', '')}`,
      summary: `${age}Y ${sex === 'Male' ? 'M' : 'F'} • ${weightKg}kg (BMI ${bmiInfo.bmi}) • eGFR ${calculatedEgfr} • ${primaryCondition}`,
      biometrics: {
        age,
        sex,
        heightCm,
        weightKg,
        bmi: bmiInfo.bmi,
        ibwKg,
        smoking,
        allergies: ['NKDA (Verified)'],
        diagnoses: [primaryCondition, systolicBp >= 130 ? 'Hypertension' : 'Normotensive'],
        raceEthnicity,
        bsaM2,
        serumAlbuminGdl: albumin
      },
      organStatus: {
        renal: {
          status: isCompromised ? 'compromised' : 'normal',
          egfr: calculatedEgfr,
          egfrMethod: 'CKD-EPI 2021',
          scr,
          bun: Math.round(scr * 15),
          crcl: cg.crcl,
          badge: isCompromised ? 'DOSE REDUCTION REQUIRED' : 'NORMAL CLEARANCE',
          stage: calculatedEgfr < 30 ? 'Stage 4' : calculatedEgfr < 60 ? 'Stage 3' : 'Stage 2'
        },
        hepatic: {
          status: smoking === 'Current smoker' ? 'caution' : 'normal',
          cypStatus: smoking === 'Current smoker' ? 'CYP1A2 Hyper-Induced (Smoking) • CYP450 Normal' : 'CYP450 Normal',
          childPugh: 'Child-Pugh Class A',
          alt: 20,
          ast: 22,
          totalBili: 0.7,
          badge: smoking === 'Current smoker' ? 'CYP1A2 ACCELERATED' : 'UNRESTRICTED CLEARANCE'
        },
        cardiovascular: {
          status: kSerum > 5.0 ? 'caution' : 'normal',
          bp: `${systolicBp}/${diastolicBp}`,
          bpStage: systolicBp >= 140 ? 'Stage 2 HTN' : systolicBp >= 130 ? 'Stage 1 HTN' : 'Normal BP',
          targetBp: '<130/80',
          heartRate,
          rhythm: 'NSR',
          potassium: kSerum,
          badge: kSerum > 5.0 ? 'ELEVATED POTASSIUM' : 'NORMAL'
        },
        glycemic: {
          status: hba1c > 8.0 ? 'suboptimal' : 'controlled',
          hba1c,
          controlText: hba1c > 8.0 ? 'Sub-optimal' : 'Target Achieved',
          fastingGlucose: Math.round(hba1c * 20),
          uacr: 120,
          badge: hba1c > 8.0 ? 'SWITCH THERAPY CANDIDATE' : 'CONTROLLED'
        }
      },
      medications: [
        {
          id: `med-${Date.now()}-1`,
          name: 'Metformin HCl',
          dose: '1000 mg Oral Tablet',
          frequency: 'BID with meals',
          route: 'Oral',
          totalDailyDose: '2000 mg/day',
          therapeuticClass: 'Biguanide / Antidiabetic',
          metabolism: '90% Renal Tubular Elimination',
          metabolismDetail: `Elimination dependent on eGFR ${calculatedEgfr} mL/min and weight ${weightKg} kg`,
          safetyStatus: isCompromised ? 'flagged' : 'optimal',
          safetyEvaluation: isCompromised ? 'Reduce to 500mg BID max' : 'Standard Dose',
          guidelineCitation: 'KDIGO 2023 Sec 1.3',
          guidelineUrl: 'https://kdigo.org'
        },
        {
          id: `med-${Date.now()}-2`,
          name: 'Lisinopril',
          dose: '20 mg Oral Tablet',
          frequency: 'Once Daily',
          route: 'Oral',
          totalDailyDose: '20 mg/day',
          therapeuticClass: 'ACE Inhibitor',
          metabolism: 'Renal excretion',
          metabolismDetail: `Current K+: ${kSerum} mEq/L • BP: ${systolicBp}/${diastolicBp}`,
          safetyStatus: kSerum > 5.0 ? 'flagged' : 'monitor',
          safetyEvaluation: kSerum > 5.0 ? 'Hyperkalemia Risk; Recheck' : 'Renoprotective',
          guidelineCitation: 'AHA/ACC 2022',
          guidelineUrl: 'https://ahajournals.org'
        }
      ],
      priorityTriage: {
        id: `triage-${Date.now()}`,
        title: `Metformin in eGFR ${calculatedEgfr} (${primaryCondition})`,
        currentDoseSummary: '1000 mg BID (2000 mg/day)',
        level: isCompromised ? 'HIGH PRIORITY' : 'MODERATE',
        discrepancyText: isCompromised
          ? `Current daily dose exceeds safe clearance threshold for eGFR ${calculatedEgfr} mL/min in patient weighing ${weightKg}kg.`
          : 'Prescribed dose matches renal dosing guideline bounds.',
        options: [
          {
            id: 'opt-new-1',
            title: 'Option A: Dose Reduction',
            description: 'Reduce to 500 mg PO BID max, recheck renal labs in 30 days.'
          },
          {
            id: 'opt-new-2',
            title: 'Option B: Cardiorenal SGLT2i Switch',
            description: 'Initiate Empagliflozin 10 mg daily for targeted renal protection.'
          }
        ],
        defaultSelectedOption: 'opt-new-1',
        defaultNote: `New assessment generated for ${age}y ${sex} • Weight ${weightKg}kg • eGFR ${calculatedEgfr} mL/min.`
      },
      kpis: {
        activeAgentsCount: 3,
        reconciliationSynced: 'Just now',
        actionAlertsCount: isCompromised ? 2 : 0,
        alertSummary: isCompromised ? 'Renal clearance alert flagged' : 'No acute contraindications',
        pendingLabsCount: 2,
        nextDraw: 'Serum BMP in 14 days',
        evidenceLinksCount: 12,
        guidelinesSummary: 'KDIGO 2023 • ADA 2024'
      },
      pkData: {
        drugName: 'Metformin',
        halfLifeBaseline: '6.2h',
        halfLifeCurrent: `${(6.2 * (80 / Math.max(20, calculatedEgfr))).toFixed(1)}h in eGFR ${calculatedEgfr}`,
        predictedPeak: `${(1.8 * (60 / Math.max(20, calculatedEgfr))).toFixed(2)} mcg/mL`,
        pctVsReference: isCompromised ? '+38% vs Reference' : 'Within Normal Bounds',
        upperSafetyThreshold: 2.5,
        targetMin: 1.0,
        targetMax: 2.0,
        currentPeakValue: Number((1.8 * (60 / Math.max(20, calculatedEgfr))).toFixed(2))
      },
      rulesTriggered: [
        {
          id: 'rule-new-1',
          ruleCode: 'Rule #REN-MET-03',
          name: 'FDA Rule: Metformin & Renal Bounds',
          category: 'FDA Black Box',
          text: `In eGFR 30–45 mL/min, restrict dose to max 1000 mg/day. (Calculated eGFR: ${calculatedEgfr})`
        }
      ]
    };

    onSaveAssessment(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#E5DDD0] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#0d1c32] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#15803D]/20 border border-[#15803D]/40 flex items-center justify-center text-[#34D399]">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base">
                New Synthetic Patient Twin Assessment
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Configure patient demographics and clinical biometrics for pharmacokinetic simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Identity & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E3A8A] block mb-1">
                Patient Identifier / Alias <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#cbd5e1] font-mono text-xs focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Synthetic de-identified token</span>
            </div>
            <div>
              <label className="font-bold text-[#1E3A8A] block mb-1">
                Primary Indication / Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={primaryCondition}
                onChange={(e) => setPrimaryCondition(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#cbd5e1] text-xs focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. Type 2 Diabetes, CKD, Hypertension</span>
            </div>
          </div>

          {/* Core Demographics Section (Age, Weight, Height, Sex) */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DDD0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-2">
              <span className="font-bold text-[#1E3A8A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#15803D]">accessibility_new</span>
                Patient Demographics &amp; Anthropometrics
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {age >= 65 ? '👴 Geriatric' : '🧑 Adult'} • {bmiInfo.classification}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(18, Math.min(115, Number(e.target.value))))}
                    className="w-full p-2 rounded border border-[#cbd5e1] bg-white font-mono text-xs font-bold text-[#1E3A8A]"
                    min="18"
                    max="115"
                    required
                  />
                  <span className="text-[11px] font-mono text-slate-500">yr</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {age >= 65 ? 'Renal reserve ↓' : 'Adult baseline'}
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Biological Sex <span className="text-red-500">*</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                  className="w-full p-2 rounded border border-[#cbd5e1] bg-white text-xs font-semibold text-[#1E3A8A]"
                >
                  <option value="Male">Male (CrCl factor 1.0)</option>
                  <option value="Female">Female (CrCl factor 0.85)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cockcroft-Gault scalar</span>
              </div>

              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Total Weight (kg) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Math.max(30, Math.min(300, Number(e.target.value))))}
                    className="w-full p-2 rounded border border-[#cbd5e1] bg-white font-mono text-xs font-bold text-[#1E3A8A]"
                    min="30"
                    max="300"
                    required
                  />
                  <span className="text-[11px] font-mono text-slate-500">kg</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  IBW: {ibwKg} kg
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(100, Math.min(230, Number(e.target.value))))}
                    className="w-full p-2 rounded border border-[#cbd5e1] bg-white font-mono text-xs font-bold text-[#1E3A8A]"
                    min="100"
                    max="230"
                    required
                  />
                  <span className="text-[11px] font-mono text-slate-500">cm</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  BSA: {bsaM2} m²
                </span>
              </div>
            </div>

            {/* Additional Demographic Accuracy Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E5DDD0]/70">
              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Population Ancestry / PGx Prior
                </label>
                <select
                  value={raceEthnicity}
                  onChange={(e) => setRaceEthnicity(e.target.value)}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] bg-white text-xs"
                >
                  <option value="Caucasian / European Ancestry">Caucasian / European Ancestry</option>
                  <option value="East Asian Ancestry">East Asian Ancestry (CYP2C19 *2/*3 higher prior)</option>
                  <option value="African / African American Ancestry">African / African American Ancestry</option>
                  <option value="South Asian Ancestry">South Asian Ancestry (Cardiometabolic prior)</option>
                  <option value="Hispanic / Latino Ancestry">Hispanic / Latino Ancestry</option>
                  <option value="Other / Admixed Ancestry">Other / Admixed Ancestry</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-0.5">Informs initial PGx allele priors &amp; clearance distribution</span>
              </div>

              <div>
                <label className="font-semibold text-[#1E3A5F] block mb-1">
                  Smoking / Nicotine Status (CYP1A2 Induction)
                </label>
                <select
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value as any)}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] bg-white text-xs"
                >
                  <option value="Non-smoker">Non-smoker (Baseline enzyme activity)</option>
                  <option value="Former smoker">Former smoker (Resolved enzyme induction)</option>
                  <option value="Current smoker">Current smoker (Induces CYP1A2 clearance +45%)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-0.5">Hydrocarbons induce hepatic CYP1A2 metabolic velocity</span>
              </div>
            </div>
          </div>

          {/* Real-time Digital Twin Telemetry Preview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white rounded-xl border border-[#CBE4CB] shadow-2xs font-mono">
            <div className="p-2 bg-[#EEF7EE]/60 rounded-lg border border-[#CBE4CB]/60">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">BMI &amp; Class</span>
              <span className="text-xs font-bold text-[#15803D] block mt-0.5">{bmiInfo.bmi} kg/m²</span>
              <span className="text-[9px] text-slate-500 font-sans truncate block">{bmiInfo.classification}</span>
            </div>

            <div className="p-2 bg-[#EEF7EE]/60 rounded-lg border border-[#CBE4CB]/60">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Cockcroft-Gault CrCl</span>
              <span className="text-xs font-bold text-[#1E3A8A] block mt-0.5">{cg.crcl} mL/min</span>
              <span className="text-[9px] text-slate-500 font-sans block">Wt: {cg.weightUsed} kg</span>
            </div>

            <div className="p-2 bg-[#EEF7EE]/60 rounded-lg border border-[#CBE4CB]/60">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">2021 CKD-EPI eGFR</span>
              <span className={`text-xs font-bold block mt-0.5 ${calculatedEgfr < 45 ? 'text-amber-700' : 'text-[#15803D]'}`}>
                {calculatedEgfr} mL/min
              </span>
              <span className="text-[9px] text-slate-500 font-sans block">
                {calculatedEgfr < 30 ? 'Stage 4/5' : calculatedEgfr < 60 ? 'Stage 3' : 'Normal'}
              </span>
            </div>

            <div className="p-2 bg-[#EEF7EE]/60 rounded-lg border border-[#CBE4CB]/60">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Est. Vd (Volume)</span>
              <span className="text-xs font-bold text-[#1E3A8A] block mt-0.5">{estimatedVdLiters} L</span>
              <span className="text-[9px] text-slate-500 font-sans block">{(estimatedVdLiters / weightKg).toFixed(2)} L/kg</span>
            </div>
          </div>

          {/* Clinical Chemistry & Organ Biomarkers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
              <label className="font-bold text-[#1E3A8A] block mb-1">Serum Creatinine</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  value={scr}
                  onChange={(e) => setScr(Math.max(0.2, Number(e.target.value)))}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs bg-white"
                />
                <span className="text-[10px] text-slate-500 font-mono">mg/dL</span>
              </div>
              <span className="text-[10px] text-[#15803D] font-bold block mt-1">
                eGFR: {calculatedEgfr} mL/min
              </span>
            </div>

            <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
              <label className="font-bold text-[#1E3A8A] block mb-1">Serum Albumin</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={albumin}
                  onChange={(e) => setAlbumin(Math.max(1.5, Math.min(6.0, Number(e.target.value))))}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs bg-white"
                />
                <span className="text-[10px] text-slate-500 font-mono">g/dL</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {albumin < 3.5 ? '⚠️ Hypoalbuminemia' : 'Normal Binding'}
              </span>
            </div>

            <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
              <label className="font-bold text-[#1E3A8A] block mb-1">Serum Potassium</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={kSerum}
                  onChange={(e) => setKSerum(Math.max(2.0, Math.min(8.5, Number(e.target.value))))}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs bg-white"
                />
                <span className="text-[10px] text-slate-500 font-mono">mEq/L</span>
              </div>
              <span className={`text-[10px] block mt-1 ${kSerum >= 5.0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                {kSerum >= 5.0 ? '⚠️ High K+ Alert' : 'Target <5.0'}
              </span>
            </div>

            <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
              <label className="font-bold text-[#1E3A8A] block mb-1">HbA1c (%)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(Math.max(4.0, Math.min(16.0, Number(e.target.value))))}
                  className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs bg-white"
                />
                <span className="text-[10px] text-slate-500 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {hba1c > 8.0 ? 'Suboptimal control' : 'Target <7.0%'}
              </span>
            </div>
          </div>

          {/* Baseline Vitals (Blood Pressure & Heart Rate) */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DDD0] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#1E3A5F] block mb-1">Resting Blood Pressure (BP)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-16 p-1.5 rounded border border-[#cbd5e1] bg-white font-mono text-xs"
                  placeholder="Sys"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(Number(e.target.value))}
                  className="w-16 p-1.5 rounded border border-[#cbd5e1] bg-white font-mono text-xs"
                  placeholder="Dia"
                />
                <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#1E3A5F] block mb-1">Resting Heart Rate</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-20 p-1.5 rounded border border-[#cbd5e1] bg-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 font-mono">bpm (NSR)</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#1E3A5F] block mb-1">Initial Regimen String</label>
              <input
                type="text"
                value={drugs}
                onChange={(e) => setDrugs(e.target.value)}
                className="w-full p-1.5 rounded border border-[#cbd5e1] bg-white text-xs truncate"
                placeholder="Drugs list"
              />
            </div>
          </div>

          {/* Form Footer Bar */}
          <div className="p-4 bg-[#F4EFE6] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-4 border-t border-[#E5DDD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              <span>Signed by: <strong className="text-slate-900">{clinician?.name || 'Dr. A. Miller'}</strong> ({clinician?.credentials || 'PharmD, BCPS'})</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#1E3A8A] text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span>Instantiate Digital Twin</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
