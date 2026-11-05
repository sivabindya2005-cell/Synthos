import React, { useState } from 'react';
import { PatientCase } from '../types/clinical';
import { calculateCKDEPI2021, calculateCockcroftGault } from '../utils/clinicalMath';
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
  const [age, setAge] = useState(65);
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [weightKg, setWeightKg] = useState(78);
  const [heightCm, setHeightCm] = useState(175);
  const [scr, setScr] = useState(1.6);
  const [kSerum, setKSerum] = useState(4.8);
  const [hba1c, setHba1c] = useState(7.9);
  const [primaryCondition, setPrimaryCondition] = useState('T2D + CKD Stage 3');
  const [drugs, setDrugs] = useState('Metformin 1000mg BID, Lisinopril 20mg Daily, Atorvastatin 20mg');

  const calculatedEgfr = calculateCKDEPI2021(age, scr, sex).egfr;
  const cg = calculateCockcroftGault(age, weightKg, heightCm, scr, sex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCompromised = calculatedEgfr < 45;

    const newCase: PatientCase = {
      id,
      tier: 'Tier-4',
      nameAlias: `Synthetic Case ${id.replace('DEMO-PT-', '')}`,
      summary: `${age}Y ${sex === 'Male' ? 'M' : 'F'} • eGFR ${calculatedEgfr} • ${primaryCondition}`,
      biometrics: {
        age,
        sex,
        heightCm,
        weightKg,
        bmi: Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)),
        ibwKg: cg.ibw,
        smoking: 'Non-smoker',
        allergies: ['NKDA (Verified)'],
        diagnoses: [primaryCondition, 'Hypertension']
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
          status: 'normal',
          cypStatus: 'CYP450 Normal',
          childPugh: 'Child-Pugh Class A',
          alt: 20,
          ast: 22,
          totalBili: 0.7,
          badge: 'UNRESTRICTED CLEARANCE'
        },
        cardiovascular: {
          status: kSerum > 5.0 ? 'caution' : 'normal',
          bp: '134/82',
          bpStage: 'Stage 1 HTN',
          targetBp: '<130/80',
          heartRate: 70,
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
          metabolismDetail: `Elimination dependent on eGFR ${calculatedEgfr}`,
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
          metabolismDetail: `Current K+: ${kSerum} mEq/L`,
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
          ? `Current daily dose exceeds safe clearance threshold for eGFR ${calculatedEgfr}.`
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
        defaultNote: `New assessment generated for eGFR ${calculatedEgfr} mL/min. Monitored for renal clearance.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 bg-[#0d1c32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#14b8a6] text-[22px]">add_circle</span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base">
                New Synthetic Patient Twin Assessment
              </h3>
              <p className="text-xs text-[#76849f]">
                Input clinical biometrics to instantiate CDS rules &amp; PK curve
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#76849f] hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Patient Identifier</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-2 rounded border border-[#cbd5e1] font-mono"
                required
              />
            </div>
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Primary Diagnosis</label>
              <input
                type="text"
                value={primaryCondition}
                onChange={(e) => setPrimaryCondition(e.target.value)}
                className="w-full p-2 rounded border border-[#cbd5e1]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Age (yr)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 rounded border border-[#cbd5e1]"
                min="18"
                max="105"
              />
            </div>
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                className="w-full p-2 rounded border border-[#cbd5e1] bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full p-2 rounded border border-[#cbd5e1]"
              />
            </div>
            <div>
              <label className="font-bold text-[#191c1e] block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full p-2 rounded border border-[#cbd5e1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 bg-[#f8fafc] rounded border border-[#e2e8f0]">
              <label className="font-bold text-[#191c1e] block mb-1">Serum Creatinine</label>
              <input
                type="number"
                step="0.05"
                value={scr}
                onChange={(e) => setScr(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs"
              />
              <span className="text-[10px] text-[#006a61] font-bold block mt-1">
                eGFR: {calculatedEgfr} mL/min
              </span>
            </div>

            <div className="p-2.5 bg-[#f8fafc] rounded border border-[#e2e8f0]">
              <label className="font-bold text-[#191c1e] block mb-1">Serum Potassium</label>
              <input
                type="number"
                step="0.1"
                value={kSerum}
                onChange={(e) => setKSerum(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs"
              />
              <span className="text-[10px] text-[#64748b] block mt-1">Target &lt;5.0 mEq/L</span>
            </div>

            <div className="p-2.5 bg-[#f8fafc] rounded border border-[#e2e8f0]">
              <label className="font-bold text-[#191c1e] block mb-1">HbA1c (%)</label>
              <input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHba1c(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-[#cbd5e1] font-mono text-xs"
              />
              <span className="text-[10px] text-[#64748b] block mt-1">Target &lt;7.0%</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#191c1e] block mb-1">Initial Regimen String</label>
            <input
              type="text"
              value={drugs}
              onChange={(e) => setDrugs(e.target.value)}
              className="w-full p-2 rounded border border-[#cbd5e1]"
            />
          </div>

          <div className="p-4 bg-[#f2f4f6] -mx-6 -mb-6 mt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#E6F4F1]0"></span>
              <span>Signed by: <strong className="text-slate-900">{clinician?.name || 'Dr. A. Miller'}</strong> ({clinician?.credentials || 'PharmD, BCPS'})</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[#191c1e] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#006a61] text-white hover:bg-[#006f66] text-xs font-semibold cursor-pointer shadow-xs"
              >
                Generate Digital Twin Assessment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
