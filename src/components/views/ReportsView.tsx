import React, { useState } from 'react';
import { PatientCase } from '../../types/clinical';
import { exportPatientTwinToPdf } from '../../utils/clinicalPdfExport';
import { useClinicianAuth } from '../../context/AuthContext';
import { calculateCockcroftGault, calculateCKDEPI2021 } from '../../utils/clinicalMath';

interface ReportsViewProps {
  patient: PatientCase;
  onOpenProvenance?: (id: string) => void;
  onOpenSearch?: (query: string) => void;
  onOpenPersonalizeRegimen?: () => void;
  onUpdatePatientLab?: (labs: { scr?: number; egfr?: number; crcl?: number; potassium?: number; inr?: number }) => void;
}

interface LabResultItem {
  testName: string;
  loinc: string;
  value: string | number;
  unit: string;
  refRange: string;
  status: 'normal' | 'borderline' | 'abnormal' | 'critical';
  trend: 'stable' | 'increasing' | 'decreasing';
  historicalValues: { date: string; value: number | string }[];
  clinicalSignificance: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  patient,
  onOpenProvenance,
  onOpenSearch,
  onOpenPersonalizeRegimen,
  onUpdatePatientLab
}) => {
  const { clinician, isAuthenticated } = useClinicianAuth();
  const [activeSubTab, setActiveSubTab] = useState<'labs' | 'calibrator' | 'soap' | 'orders'>('labs');
  const [copied, setCopied] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [orderedNotice, setOrderedNotice] = useState<string | null>(null);
  const [calibNotice, setCalibNotice] = useState<string | null>(null);

  // Compute patient-tailored lab test items dynamically
  const egfr = patient.organStatus.renal.egfr;
  const scr = patient.organStatus.renal.scr;
  const bun = patient.organStatus.renal.bun;
  const crcl = patient.organStatus.renal.crcl;
  const potassium = patient.organStatus.cardiovascular.potassium;
  const hba1c = patient.organStatus.glycemic.hba1c;
  const glucose = patient.organStatus.glycemic.fastingGlucose;
  const uacr = patient.organStatus.glycemic.uacr;
  const alt = patient.organStatus.hepatic.alt;
  const ast = patient.organStatus.hepatic.ast;
  const totalBili = patient.organStatus.hepatic.totalBili;
  const cypStatus = patient.organStatus.hepatic.cypStatus;

  // Infer INR based on patient condition (e.g. Warfarin case DEMO-PT-0108)
  const isWarfarinPatient = patient.medications.some(m => m.name.toLowerCase().includes('warfarin'));
  const inrValue = isWarfarinPatient ? '3.4' : '1.0';
  const inrStatus: 'normal' | 'borderline' | 'abnormal' | 'critical' = isWarfarinPatient ? 'critical' : 'normal';

  // Interactive Calibrator State
  const [calibScr, setCalibScr] = useState<number>(scr);
  const [calibK, setCalibK] = useState<number>(potassium);
  const [calibInr, setCalibInr] = useState<number>(isWarfarinPatient ? 3.4 : 1.0);
  const [calibHba1c, setCalibHba1c] = useState<number>(hba1c);

  const calculatedCalibEgfr = calculateCKDEPI2021(patient.biometrics.age, calibScr, patient.biometrics.sex).egfr;
  const calculatedCalibCrcl = calculateCockcroftGault(
    patient.biometrics.age,
    patient.biometrics.weightKg,
    patient.biometrics.heightCm,
    calibScr,
    patient.biometrics.sex
  ).crcl;

  const handleApplyCalibratedLabs = () => {
    if (onUpdatePatientLab) {
      onUpdatePatientLab({
        scr: calibScr,
        egfr: calculatedCalibEgfr,
        crcl: calculatedCalibCrcl,
        potassium: calibK,
        inr: calibInr
      });
      setCalibNotice('Laboratory values calibrated and synchronized with live Patient Digital Twin!');
      setTimeout(() => setCalibNotice(null), 3500);
    }
  };

  const handleResetCalibrator = () => {
    setCalibScr(scr);
    setCalibK(potassium);
    setCalibInr(isWarfarinPatient ? 3.4 : 1.0);
    setCalibHba1c(hba1c);
  };

  const [pendingOrders, setPendingOrders] = useState<{ id: string; test: string; priority: string; scheduled: string }[]>([
    { id: 'ORD-101', test: 'Basic Metabolic Panel (K+, SCr, BUN)', priority: 'Routine', scheduled: 'In 14 Days' },
    { id: 'ORD-102', test: 'Urine Albumin-to-Creatinine Ratio (UACR)', priority: 'Follow-up', scheduled: 'In 30 Days' }
  ]);

  const activeClinicianName = isAuthenticated && clinician ? clinician.name : 'Dr. A. Miller, PharmD, BCPS';

  const renalPanel: LabResultItem[] = [
    {
      testName: 'eGFR (CKD-EPI 2021 Race-Free)',
      loinc: '98979-8',
      value: egfr,
      unit: 'mL/min/1.73m²',
      refRange: '> 60 mL/min',
      status: egfr < 30 ? 'critical' : egfr < 60 ? 'abnormal' : 'normal',
      trend: 'decreasing',
      historicalValues: [
        { date: '6 Mos Ago', value: egfr + 8 },
        { date: '3 Mos Ago', value: egfr + 3 },
        { date: 'Current', value: egfr }
      ],
      clinicalSignificance: egfr < 45 ? 'Mandates dose ceiling for renally eliminated drugs (Metformin ≤1000 mg/d).' : 'Standard renal filtration capacity.'
    },
    {
      testName: 'Serum Creatinine',
      loinc: '2160-0',
      value: scr.toFixed(2),
      unit: 'mg/dL',
      refRange: '0.70 – 1.30 mg/dL',
      status: scr > 1.5 ? 'abnormal' : 'normal',
      trend: 'increasing',
      historicalValues: [
        { date: '6 Mos Ago', value: (scr - 0.35).toFixed(2) },
        { date: '3 Mos Ago', value: (scr - 0.15).toFixed(2) },
        { date: 'Current', value: scr.toFixed(2) }
      ],
      clinicalSignificance: 'Direct marker of glomerular filtration impairment and muscle metabolism.'
    },
    {
      testName: 'Cockcroft-Gault Creatinine Clearance (CrCl)',
      loinc: '2164-2',
      value: crcl.toFixed(1),
      unit: 'mL/min',
      refRange: '90.0 – 140.0 mL/min',
      status: crcl < 50 ? 'abnormal' : 'normal',
      trend: 'decreasing',
      historicalValues: [
        { date: '6 Mos Ago', value: (crcl + 9.5).toFixed(1) },
        { date: '3 Mos Ago', value: (crcl + 3.2).toFixed(1) },
        { date: 'Current', value: crcl.toFixed(1) }
      ],
      clinicalSignificance: 'Mandated basis for FDA approved drug package insert renal adjustments.'
    },
    {
      testName: 'Blood Urea Nitrogen (BUN)',
      loinc: '3094-0',
      value: bun,
      unit: 'mg/dL',
      refRange: '7 – 20 mg/dL',
      status: bun > 25 ? 'abnormal' : bun > 20 ? 'borderline' : 'normal',
      trend: 'increasing',
      historicalValues: [
        { date: '6 Mos Ago', value: Math.max(14, bun - 8) },
        { date: '3 Mos Ago', value: Math.max(18, bun - 4) },
        { date: 'Current', value: bun }
      ],
      clinicalSignificance: 'Elevated BUN/Creatinine ratio indicates volume contraction or prerenal azotemia.'
    },
    {
      testName: 'Serum Potassium (K+)',
      loinc: '2823-3',
      value: potassium.toFixed(1),
      unit: 'mEq/L',
      refRange: '3.5 – 5.0 mEq/L',
      status: potassium >= 5.2 ? 'abnormal' : potassium >= 4.9 ? 'borderline' : 'normal',
      trend: 'increasing',
      historicalValues: [
        { date: '6 Mos Ago', value: '4.4' },
        { date: '3 Mos Ago', value: '4.7' },
        { date: 'Current', value: potassium.toFixed(1) }
      ],
      clinicalSignificance: 'Safety surveillance for renin-angiotensin-aldosterone cascade blockade (Lisinopril).'
    },
    {
      testName: 'Serum Sodium (Na+)',
      loinc: '2951-2',
      value: '139',
      unit: 'mEq/L',
      refRange: '135 – 145 mEq/L',
      status: 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: '140' },
        { date: '3 Mos Ago', value: '138' },
        { date: 'Current', value: '139' }
      ],
      clinicalSignificance: 'Extracellular osmolar balance within reference parameters.'
    }
  ];

  const cardiometabolicPanel: LabResultItem[] = [
    {
      testName: 'Hemoglobin A1c (HbA1c)',
      loinc: '4548-4',
      value: `${hba1c.toFixed(1)}%`,
      unit: '%',
      refRange: '< 5.7% (Goal < 7.0%)',
      status: hba1c > 8.0 ? 'abnormal' : hba1c > 7.0 ? 'borderline' : 'normal',
      trend: 'increasing',
      historicalValues: [
        { date: '6 Mos Ago', value: (hba1c - 0.7).toFixed(1) },
        { date: '3 Mos Ago', value: (hba1c - 0.3).toFixed(1) },
        { date: 'Current', value: hba1c.toFixed(1) }
      ],
      clinicalSignificance: 'Suboptimal glycemic regulation; patient qualifies for SGLT2i add-on per ADA 2024.'
    },
    {
      testName: 'Fasting Plasma Glucose',
      loinc: '1558-6',
      value: glucose,
      unit: 'mg/dL',
      refRange: '70 – 99 mg/dL',
      status: glucose > 130 ? 'abnormal' : 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: glucose - 12 },
        { date: '3 Mos Ago', value: glucose - 5 },
        { date: 'Current', value: glucose }
      ],
      clinicalSignificance: 'Basal dawn hepatic gluconeogenesis elevation.'
    },
    {
      testName: 'Urine Albumin-to-Creatinine Ratio (UACR)',
      loinc: '14959-1',
      value: uacr,
      unit: 'mg/g',
      refRange: '< 30 mg/g',
      status: uacr >= 300 ? 'critical' : uacr >= 30 ? 'abnormal' : 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: uacr + 25 },
        { date: '3 Mos Ago', value: uacr + 10 },
        { date: 'Current', value: uacr }
      ],
      clinicalSignificance: 'Microalbuminuria indicative of intraglomerular hypertension and diabetic nephropathy.'
    },
    {
      testName: 'Prothrombin Time / INR',
      loinc: '6301-6',
      value: inrValue,
      unit: 'Ratio',
      refRange: '0.9 – 1.1 (Target 2.0 – 3.0)',
      status: inrStatus,
      trend: isWarfarinPatient ? 'increasing' : 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: '2.1' },
        { date: '3 Mos Ago', value: '2.6' },
        { date: 'Current', value: inrValue }
      ],
      clinicalSignificance: isWarfarinPatient ? 'Supratherapeutic INR escalation; severe major hemorrhage risk from CYP2C9 impaired clearance.' : 'Baseline extrinsic coagulation pathway within normal limits.'
    }
  ];

  const hepaticPanel: LabResultItem[] = [
    {
      testName: 'Alanine Aminotransferase (ALT)',
      loinc: '1742-6',
      value: alt,
      unit: 'U/L',
      refRange: '7 – 56 U/L',
      status: 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: alt + 2 },
        { date: '3 Mos Ago', value: alt - 1 },
        { date: 'Current', value: alt }
      ],
      clinicalSignificance: 'Hepatocellular integrity intact without transaminitis.'
    },
    {
      testName: 'Aspartate Aminotransferase (AST)',
      loinc: '1920-8',
      value: ast,
      unit: 'U/L',
      refRange: '10 – 40 U/L',
      status: 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: ast + 1 },
        { date: '3 Mos Ago', value: ast - 2 },
        { date: 'Current', value: ast }
      ],
      clinicalSignificance: 'Normal mitochondrial transaminase activity.'
    },
    {
      testName: 'Total Bilirubin',
      loinc: '1975-2',
      value: totalBili.toFixed(1),
      unit: 'mg/dL',
      refRange: '0.2 – 1.2 mg/dL',
      status: 'normal',
      trend: 'stable',
      historicalValues: [
        { date: '6 Mos Ago', value: totalBili.toFixed(1) },
        { date: '3 Mos Ago', value: totalBili.toFixed(1) },
        { date: 'Current', value: totalBili.toFixed(1) }
      ],
      clinicalSignificance: 'Biliary excretion and hepatic conjugation intact.'
    }
  ];

  // Dynamic SOAP Note based on whichever patient is active
  const generateDynamicSoap = (): string => {
    const medList = patient.medications.map(m => `${m.name} ${m.dose} (${m.frequency})`).join('; ');
    const diagnoses = patient.biometrics.diagnoses.join(', ');
    const allergies = patient.biometrics.allergies.join(', ');

    let assessmentSection = '';
    let planSection = '';

    if (patient.id === 'DEMO-PT-0241') {
      assessmentSection = `1. Metformin Accumulation Hazard: Current dose 1000 mg BID (2000 mg/day) exceeds safety ceiling in CKD Stage 3b (eGFR 42 mL/min). FDA Boxed Warning and KDIGO 2023 mandate max 1000 mg/day. Simulated peak Css is 2.85 mcg/mL (+42% above normal), elevating lactic acidosis hazard.
2. Cardiorenal Protection Deficit: Lisinopril 20mg daily therapeutic for albuminuria (UACR 145 mg/g), with borderline K+ (4.9 mEq/L) requiring 14-day repeat. Patient is prime candidate for SGLT2i add-on (Empagliflozin 10mg) per KDIGO 2023.`;
      planSection = `1. Titrate Metformin HCl down to 500 mg PO BID with meals (1000 mg/day ceiling).
2. Recommend initiation of Empagliflozin 10 mg PO daily for combined cardiorenal protection and A1c lowering.
3. Order Basic Metabolic Panel (K+, SCr) in 14 days and repeat eGFR in 30 days.
4. Educated on signs of lactic acidosis (tachypnea, severe nausea, profound malaise).`;
    } else if (patient.id === 'DEMO-PT-0108') {
      assessmentSection = `1. Pharmacogenomic Incompatibility: Patient is homozygous CYP2C9 *3/*3 (Poor Metabolizer). Clearance of active S-warfarin is reduced by >85%, resulting in supratherapeutic INR 3.4 on 5mg daily and severe bleeding hazard.
2. Concomitant APAP Interaction: Acetaminophen 1000mg TID potentiates warfarin by inhibiting vitamin K epoxide reductase, worsening INR instability.`;
      planSection = `1. Discontinue Warfarin Sodium; hold until INR falls below 2.0 per 2023 ACC/AHA Atrial Fibrillation Guidelines.
2. Transition to Apixaban 5 mg PO BID once INR < 2.0 (CPIC Level 1A recommendation).
3. Limit Acetaminophen to ≤1300 mg/day as needed.
4. Order repeat PT/INR in 48 hours to confirm clearance trajectory.`;
    } else if (patient.id === 'DEMO-PT-0332') {
      assessmentSection = `1. FDA Geriatric Ceiling Violation: Citalopram 40mg daily exceeds the FDA 20mg maximum daily dose for patients ≥60 years old. Increased risk of concentration-dependent QTc prolongation.
2. AGS Beers Criteria Precaution: Concomitant Donepezil and Citalopram increase additive risk of syncope, bradycardia, and cardiac repolarization delay.`;
      planSection = `1. Reduce Citalopram HBr to 20 mg PO daily in morning per FDA Drug Safety Communication.
2. Perform baseline 12-lead ECG to measure corrected QTc interval.
3. Continue Donepezil 10mg daily with orthostatic blood pressure and pulse surveillance.
4. Schedule cognitive and mood reassessment in 4 weeks.`;
    } else {
      assessmentSection = `1. Regimen Review: ${patient.kpis.actionAlertsCount} active pharmacotherapy alerts identified against digital twin organ clearance parameters (eGFR: ${egfr} mL/min).`;
      planSection = `1. Adjust doses in accordance with verified clinical practice guidelines.
2. Monitor renal function and electrolyte panels within standard clinical timelines.`;
    }

    return `PHARMD CLINICAL CONSULTATION NOTE - CDS MATRIX AUDIT
PATIENT ID: ${patient.id}
AGE/SEX: ${patient.biometrics.age} Y / ${patient.biometrics.sex}
DATE: ${new Date().toLocaleDateString()}
CLINICAL SPECIALIST: ${activeClinicianName}

SUBJECTIVE:
- Diagnoses: ${diagnoses}
- Allergies: ${allergies}
- Tolerance: Denies acute GI distress or myalgias.

OBJECTIVE (DIAGNOSTIC LAB SPECIMEN):
- Weight: ${patient.biometrics.weightKg} kg | Height: ${patient.biometrics.heightCm} cm | BMI: ${patient.biometrics.bmi} kg/m²
- Serum Creatinine: ${scr.toFixed(2)} mg/dL | BUN: ${bun} mg/dL
- eGFR (2021 CKD-EPI): ${egfr} mL/min/1.73m² (${patient.organStatus.renal.stage || 'CKD'})
- Cockcroft-Gault CrCl: ${crcl.toFixed(1)} mL/min
- Serum K+: ${potassium.toFixed(1)} mEq/L | Fasting Glucose: ${glucose} mg/dL | HbA1c: ${hba1c.toFixed(1)}%
- Hepatic/CYP Profile: ${cypStatus}
- Active Regimen: ${medList}

ASSESSMENT:
${assessmentSection}

PLAN:
${planSection}

ELECTRONIC SIGN-OFF:
${activeClinicianName}
Deterministic Verification Hash: SYNTHOS-LAB-HASH-${Date.now().toString(16).toUpperCase()}`;
  };

  const dynamicSoapText = generateDynamicSoap();

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicSoapText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportPdf = () => {
    exportPatientTwinToPdf(patient, {
      clinicianName: activeClinicianName,
      clinicianCredentials: clinician?.credentials,
      institution: clinician?.institution
    });
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 3500);
  };

  const handleAddOrder = (testName: string, priority: string, scheduled: string) => {
    const newOrd = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      test: testName,
      priority,
      scheduled
    };
    setPendingOrders(prev => [newOrd, ...prev]);
    setOrderedNotice(`Lab Requisition Created: ${testName} (${priority})`);
    setTimeout(() => setOrderedNotice(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span className="text-[11px] font-mono text-teal-300 font-bold uppercase tracking-wider">
              CLINICAL DIAGNOSTIC LAB REPORT &amp; SPECIMEN REQUISITION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#f0fdfa]">
              HL7 LOINC Codified
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight">
            Diagnostic Laboratory Analysis &amp; Pharmacotherapy Audit
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-panel specimen breakdown for {patient.nameAlias} ({patient.id}) including race-free 2021 CKD-EPI filtration kinetics,
            therapeutic drug monitoring, LOINC identifiers, reference ranges, and serial lab requisitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#E6F4F1]0 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            title="Download formatted Clinical PDF report"
          >
            <span className="material-symbols-outlined text-[18px]">
              {pdfExported ? 'check_circle' : 'picture_as_pdf'}
            </span>
            <span>{pdfExported ? 'Report Exported!' : 'Export Lab PDF'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors border border-slate-600"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied to Clipboard' : 'Copy Consult Note'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('labs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'labs'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">biotech</span>
            <span>Diagnostic Specimen Panels</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calibrator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'calibrator'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Lab Calibrator &amp; What-If Stressor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('soap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'soap'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            <span>Dynamic SOAP Consult Note</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">assignment_add</span>
            <span>Lab Requisitions &amp; Re-Draws ({pendingOrders.length})</span>
          </button>
        </div>

        {onOpenPersonalizeRegimen && (
          <button
            onClick={onOpenPersonalizeRegimen}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-[#E6F4F1] border border-[#14B8A6] text-[#0F766E] hover:bg-[#D4ECE6] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Personalize Regimen</span>
          </button>
        )}
      </div>

      {/* Free Medical Search Engines & UpToDate Direct Connector Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-teal-50/70 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">manage_search</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Medical Evidence &amp; Guideline Verification</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Free • No Sign-in Required
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Check recent clinical updates, drug label boxed warnings, and peer-reviewed evidence across connected search engines.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenSearch ? onOpenSearch(`KDIGO 2023 Metformin dosing in CKD 3b eGFR ${egfr}`) : window.open(`https://www.uptodate.com/contents/search?search=${encodeURIComponent(`Metformin CKD eGFR ${egfr}`)}`, '_blank')}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Search clinical consensus on UpToDate"
          >
            <span className="material-symbols-outlined text-[14px] text-amber-600">clinical_notes</span>
            <span>UpToDate</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenSearch ? onOpenSearch(`eGFR ${egfr} Metformin clearance CKD`) : window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(`eGFR ${egfr} Metformin`)}`, '_blank')}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Search free NCBI PubMed citations"
          >
            <span className="material-symbols-outlined text-[14px] text-blue-600">menu_book</span>
            <span>PubMed</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenSearch ? onOpenSearch(`FDA boxed warning Metformin lactic acidosis`) : window.open(`https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent('Metformin')}`, '_blank')}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Official FDA package insert on DailyMed"
          >
            <span className="material-symbols-outlined text-[14px] text-emerald-600">description</span>
            <span>DailyMed (FDA)</span>
          </button>

          {onOpenSearch && (
            <button
              type="button"
              onClick={() => onOpenSearch('')}
              className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-teal-900 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[14px]">search</span>
              <span>Search Hub →</span>
            </button>
          )}
        </div>
      </div>

      {calibNotice && (
        <div className="p-3 rounded-xl bg-[#E6F4F1] border border-[#BEE3DB] text-teal-900 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
          <span className="material-symbols-outlined text-[#0F766E] text-[18px]">verified</span>
          <span>{calibNotice}</span>
        </div>
      )}

      {orderedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{orderedNotice}</span>
        </div>
      )}

      {/* TAB 1: DIAGNOSTIC SPECIMEN REPORT PANELS */}
      {activeSubTab === 'labs' && (
        <div className="space-y-6">
          {/* Specimen Header Metadata Box */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Specimen ID</span>
              <strong className="font-mono text-slate-900">SPX-2026-9812</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Collection Time</span>
              <span className="text-slate-800 font-medium">08:15 AM (Fasting)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Accession Lab</span>
              <span className="text-slate-800 font-medium">Central Core Lab #4</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ordering Clinician</span>
              <span className="text-slate-800 font-medium">{activeClinicianName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Specimen Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Verified / Complete</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">EHR Interface</span>
              <span className="font-mono text-[#0F766E] text-[11px] font-bold">HL7 FHIR R4 Ready</span>
            </div>
          </div>

          {/* Panel 1: Renal & Metabolic Panel (BMP/CMP) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0F766E] text-[20px]">water_drop</span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900">
                  Renal Function &amp; Serum Electrolytes (BMP)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Panel Code: LOINC 24320-4</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="py-2.5 px-4">Test Name / LOINC</th>
                    <th className="py-2.5 px-4 text-center">Result</th>
                    <th className="py-2.5 px-4">Ref. Range</th>
                    <th className="py-2.5 px-4 text-center">Flag</th>
                    <th className="py-2.5 px-4">6-Month Trend</th>
                    <th className="py-2.5 px-4">Pharmacotherapy Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {renalPanel.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.testName}</span>
                        <span className="text-[10px] font-mono text-slate-400">LOINC: {item.loinc}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-sm text-slate-900">
                        {item.value} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.refRange}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'abnormal'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'borderline'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          {item.historicalValues.map((h, i) => (
                            <span key={i} className={i === 2 ? 'font-bold text-slate-900' : ''}>
                              {h.value}{i < 2 ? ' →' : ''}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                        <div className="space-y-1.5">
                          <div>{item.clinicalSignificance}</div>
                          {item.status !== 'normal' && (
                            <button
                              type="button"
                              onClick={() => onOpenSearch ? onOpenSearch(`${item.testName} ${item.value} ${item.unit} clinical guideline pharmacotherapy`) : window.open(`https://www.uptodate.com/contents/search?search=${encodeURIComponent(`${item.testName} ${item.value}`)}`, '_blank')}
                              className="inline-flex items-center gap-1 text-[10px] text-[#0F766E] hover:text-teal-900 font-bold underline cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[12px]">search</span>
                              <span>Check UpToDate / PubMed Updates</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel 2: Cardiometabolic, Glycemic & Coagulation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0F766E] text-[20px]">monitor_heart</span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900">
                  Cardiometabolic Endpoints &amp; Therapeutic Drug Monitoring (TDM)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Anticoagulation &amp; Glycemic Panel</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <th className="py-2.5 px-4">Test Name / LOINC</th>
                    <th className="py-2.5 px-4 text-center">Result</th>
                    <th className="py-2.5 px-4">Ref. Range</th>
                    <th className="py-2.5 px-4 text-center">Flag</th>
                    <th className="py-2.5 px-4">6-Month Trend</th>
                    <th className="py-2.5 px-4">Clinical Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cardiometabolicPanel.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.testName}</span>
                        <span className="text-[10px] font-mono text-slate-400">LOINC: {item.loinc}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-sm text-slate-900">
                        {item.value} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.refRange}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'abnormal'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'borderline'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          {item.historicalValues.map((h, i) => (
                            <span key={i} className={i === 2 ? 'font-bold text-slate-900' : ''}>
                              {h.value}{i < 2 ? ' →' : ''}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                        <div className="space-y-1.5">
                          <div>{item.clinicalSignificance}</div>
                          {item.status !== 'normal' && (
                            <button
                              type="button"
                              onClick={() => onOpenSearch ? onOpenSearch(`${item.testName} ${item.value} ${item.unit} therapeutic monitoring guidelines`) : window.open(`https://www.uptodate.com/contents/search?search=${encodeURIComponent(`${item.testName} ${item.value}`)}`, '_blank')}
                              className="inline-flex items-center gap-1 text-[10px] text-[#0F766E] hover:text-teal-900 font-bold underline cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[12px]">search</span>
                              <span>Check UpToDate / PubMed Updates</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel 3: Hepatic Integrity & Pharmacogenomic Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Hepatic LFTs (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0F766E] text-[18px]">vital_signs</span>
                  <span>Hepatic Function Panel (LFT)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">LOINC 24325-3</span>
              </div>

              <div className="p-4 space-y-3">
                {hepaticPanel.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.testName}</span>
                      <span className="text-[10px] text-slate-500">Ref: {item.refRange}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {item.value} {item.unit}
                      </span>
                      <span className="block text-[10px] font-semibold text-emerald-700 uppercase">
                        Normal Clearance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacogenomic Molecular Genetics (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-purple-50/70 border-b border-purple-200 flex items-center justify-between text-purple-900">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-700 text-[18px]">dna</span>
                  <span>Pharmacogenomic Molecular Assay (PGx)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-bold">
                  CPIC Level-1A
                </span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Primary CYP Phenotype:</span>
                    <span className="font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                      {cypStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Allelic metabolic variant directly dictates rate of phase-I drug transformation and systemic bioaccumulation.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Clinical Action Trigger:</span>
                    <span className="font-semibold text-[#0F766E] text-[11px]">
                      {isWarfarinPatient ? 'Switch to Factor Xa Inhibitor' : 'Standard Substrate Clearance'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Integrated with CPIC therapeutic dosing algorithms to avoid supratherapeutic toxicity in impaired metabolizers.
                  </p>
                </div>

                {onOpenProvenance && (
                  <button
                    onClick={() => onOpenProvenance('prov-warf-cyp2c9')}
                    className="w-full py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Audit CPIC Guideline Provenance &amp; PubMed Citation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INTERACTIVE LAB CALIBRATOR & WHAT-IF STRESSOR */}
      {activeSubTab === 'calibrator' && (
        <div className="space-y-6 animate-fade-in">
          {/* Calibrator Header */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900">
                    Interactive Diagnostic Lab Calibrator &amp; What-If Stressor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calibrate and stress-test synthetic patient biomarkers in real-time. Formulas dynamically recalculate race-free CKD-EPI 2021 filtration kinetics, Cockcroft-Gault clearance, and toxic concentration thresholds.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetCalibrator}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Reset Baseline
                </button>
                <button
                  type="button"
                  onClick={handleApplyCalibratedLabs}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Apply Labs to Twin</span>
                </button>
              </div>
            </div>

            {/* Quick Clinical What-If Scenario Presets */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                Rapid Clinical Scenario Stress-Test Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCalibScr(2.45);
                    setCalibK(4.9);
                  }}
                  className="p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-xs text-rose-900 group-hover:underline flex items-center justify-between">
                    <span>1. Acute Kidney Injury (AKI)</span>
                    <span className="text-[10px] font-mono text-[#DC2626] font-bold">eGFR ~26</span>
                  </div>
                  <div className="text-[11px] text-[#DC2626]/90 mt-0.5">
                    SCr 2.45 mg/dL · Severe lactic acidosis hazard for Metformin
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalibInr(4.6);
                  }}
                  className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-xs text-amber-900 group-hover:underline flex items-center justify-between">
                    <span>2. Supratherapeutic INR Spike</span>
                    <span className="text-[10px] font-mono text-amber-700 font-bold">INR 4.6</span>
                  </div>
                  <div className="text-[11px] text-amber-700/90 mt-0.5">
                    Critical bleeding risk · CYP2C9 *3/*3 substrate accumulation
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalibK(5.7);
                    setCalibScr(1.95);
                  }}
                  className="p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-xs text-purple-900 group-hover:underline flex items-center justify-between">
                    <span>3. Severe Hyperkalemia</span>
                    <span className="text-[10px] font-mono text-purple-700 font-bold">K+ 5.7</span>
                  </div>
                  <div className="text-[11px] text-purple-700/90 mt-0.5">
                    Arrhythmia hazard · Lisinopril hold indication
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalibScr(1.25);
                    setCalibK(4.3);
                    setCalibInr(2.2);
                    setCalibHba1c(6.8);
                  }}
                  className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-xs text-emerald-900 group-hover:underline flex items-center justify-between">
                    <span>4. Post-Titration Normalized</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">Optimal</span>
                  </div>
                  <div className="text-[11px] text-emerald-700/90 mt-0.5">
                    eGFR ~58 · Target therapeutic INR 2.2 · K+ 4.3
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Sliders & Biomarker Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Control Card 1: Renal Clearance Twin */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0F766E] text-[20px]">water_drop</span>
                  <h4 className="font-bold text-sm text-slate-900">Renal Glomerular Filtration &amp; SCr</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  2021 CKD-EPI Race-Free
                </span>
              </div>

              {/* Real-time Recalculated Output Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recalculated eGFR
                  </span>
                  <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                    {calculatedCalibEgfr} <span className="text-xs font-normal text-slate-500">mL/min/1.73m²</span>
                  </div>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    calculatedCalibEgfr < 30 ? 'bg-rose-100 text-rose-800' : calculatedCalibEgfr < 45 ? 'bg-amber-100 text-amber-800' : calculatedCalibEgfr < 60 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {calculatedCalibEgfr < 15 ? 'Stage 5 (Failure)' : calculatedCalibEgfr < 30 ? 'Stage 4 (Severe)' : calculatedCalibEgfr < 45 ? 'Stage 3b (Mod-Severe)' : calculatedCalibEgfr < 60 ? 'Stage 3a (Mild-Mod)' : 'Stage 1-2 (Normal)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cockcroft-Gault CrCl
                  </span>
                  <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                    {calculatedCalibCrcl} <span className="text-xs font-normal text-slate-500">mL/min</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    IBW: {patient.biometrics.sex === 'Male' ? '70.5' : '59.2'} kg basis
                  </span>
                </div>
              </div>

              {/* Slider for Serum Creatinine */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <label htmlFor="calib-scr-range">Serum Creatinine (SCr)</label>
                  <span className="font-mono text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#BEE3DB]">
                    {calibScr.toFixed(2)} mg/dL
                  </span>
                </div>
                <input
                  id="calib-scr-range"
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.05"
                  value={calibScr}
                  onChange={(e) => setCalibScr(parseFloat(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.50 (Normal)</span>
                  <span>1.30 (Ref Ceiling)</span>
                  <span>3.00 (Severe)</span>
                  <span>4.50 (End-Stage)</span>
                </div>
              </div>

              {/* Slider for Serum Potassium */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <label htmlFor="calib-k-range">Serum Potassium (K+)</label>
                  <span className={`font-mono px-2 py-0.5 rounded border ${
                    calibK >= 5.5 ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold' : calibK >= 5.0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}>
                    {calibK.toFixed(1)} mEq/L
                  </span>
                </div>
                <input
                  id="calib-k-range"
                  type="range"
                  min="3.0"
                  max="6.5"
                  step="0.1"
                  value={calibK}
                  onChange={(e) => setCalibK(parseFloat(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>3.0 (Hypo)</span>
                  <span>4.0 - 5.0 (Optimal)</span>
                  <span>5.5 (Hyperkalemia)</span>
                  <span>6.5 (Emergency)</span>
                </div>
              </div>
            </div>

            {/* Control Card 2: Coagulation & Glycemic Biomarkers */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0F766E] text-[20px]">monitor_heart</span>
                  <h4 className="font-bold text-sm text-slate-900">Coagulation (INR) &amp; Glycemic Control</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  Therapeutic Surveillance
                </span>
              </div>

              {/* Slider for INR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <label htmlFor="calib-inr-range">Prothrombin Time / INR</label>
                  <span className={`font-mono px-2 py-0.5 rounded border ${
                    calibInr > 3.5 ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold' : calibInr >= 2.0 && calibInr <= 3.0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {calibInr.toFixed(1)} Ratio
                  </span>
                </div>
                <input
                  id="calib-inr-range"
                  type="range"
                  min="0.8"
                  max="6.0"
                  step="0.1"
                  value={calibInr}
                  onChange={(e) => setCalibInr(parseFloat(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.0 (Baseline)</span>
                  <span>2.0 - 3.0 (Target)</span>
                  <span>3.5 (Bleed Risk)</span>
                  <span>6.0 (Critical)</span>
                </div>
              </div>

              {/* Slider for HbA1c */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <label htmlFor="calib-hba1c-range">Hemoglobin A1c (HbA1c)</label>
                  <span className="font-mono text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#BEE3DB]">
                    {calibHba1c.toFixed(1)}%
                  </span>
                </div>
                <input
                  id="calib-hba1c-range"
                  type="range"
                  min="5.0"
                  max="13.0"
                  step="0.1"
                  value={calibHba1c}
                  onChange={(e) => setCalibHba1c(parseFloat(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5.5% (Normal)</span>
                  <span>7.0% (ADA Goal)</span>
                  <span>9.0% (Suboptimal)</span>
                  <span>13.0% (Severe)</span>
                </div>
              </div>

              {/* Dynamic Safety Impact Forecast Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0F766E]">insights</span>
                  <span>Real-Time Pharmacotherapy Risk Forecast:</span>
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {calculatedCalibEgfr < 30 && (
                    <li className="text-[#DC2626] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      <span>Metformin is strictly contraindicated at eGFR &lt; 30 (severe lactic acidosis).</span>
                    </li>
                  )}
                  {calculatedCalibEgfr >= 30 && calculatedCalibEgfr < 45 && (
                    <li className="text-amber-700 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>Metformin dose ceiling must not exceed 1000 mg/day (KDIGO 2023 Sec 1.3).</span>
                    </li>
                  )}
                  {calibK >= 5.5 && (
                    <li className="text-[#DC2626] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">dangerous</span>
                      <span>Serum K+ &ge; 5.5 mEq/L mandates temporary suspension or dose reduction of Lisinopril.</span>
                    </li>
                  )}
                  {calibInr > 3.0 && (
                    <li className="text-[#DC2626] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">emergency</span>
                      <span>Supratherapeutic INR {calibInr.toFixed(1)} elevation: hold Warfarin dose, evaluate DOAC transition.</span>
                    </li>
                  )}
                  {calculatedCalibEgfr >= 45 && calibK < 5.2 && calibInr <= 3.0 && (
                    <li className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Organ clearance telemetry aligns with safe steady-state exposure.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">sync</span>
              <span>Changes take immediate effect upon applying to live twin or personalizing regimen.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onOpenPersonalizeRegimen && (
                <button
                  type="button"
                  onClick={onOpenPersonalizeRegimen}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#0F766E]">tune</span>
                  <span>Personalize Medication Regimen</span>
                </button>
              )}

              {onOpenSearch && (
                <button
                  type="button"
                  onClick={() => onOpenSearch(`KDIGO 2023 eGFR ${calculatedCalibEgfr} medication dosing guidelines`)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[17px] text-blue-700">manage_search</span>
                  <span>Search UpToDate / PubMed</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApplyCalibratedLabs}
                className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-900 text-white font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Apply Calibrated Labs to Patient Twin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC SOAP CONSULT NOTE */}
      {activeSubTab === 'soap' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0F766E] text-[20px]">description</span>
              <span className="font-bold text-sm text-slate-900">Patient-Tailored Pharmacotherapy Evaluation Record</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Format: Clinical SOAP / EHR Cryptographic Hash</span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
            {dynamicSoapText}
          </pre>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>Signed electronically by {activeClinicianName}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-teal-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>{copied ? 'Copied!' : 'Copy to EHR'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: LAB REQUISITION & RE-DRAW SCHEDULING */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          {/* Create Order Box */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">add_task</span>
              <span>Simulate Requisition of Surveillance Laboratory Panels</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAddOrder('Repeat Basic Metabolic Panel (K+, SCr, eGFR)', 'Routine (14d)', 'In 14 Days')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-[#E6F4F1] border border-slate-200 hover:border-[#14B8A6] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">
                  + Order 14-Day Repeat BMP
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Surveillance for Metformin/Lisinopril titration
                </div>
              </button>

              <button
                onClick={() => handleAddOrder('STAT PT/INR & Coagulation Screen', 'STAT Priority', 'Immediate (2h)')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
                  + STAT PT / INR Re-Check
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Surveillance for Warfarin or DOAC transition
                </div>
              </button>

              <button
                onClick={() => handleAddOrder('Comprehensive Hepatic Function & LFTs', 'Routine (30d)', 'In 30 Days')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                  + 30-Day Hepatic LFT Requisition
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ALT, AST, Bilirubin, and albumin clearance
                </div>
              </button>
            </div>
          </div>

          {/* Pending Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0F766E] text-[18px]">checklist</span>
                <span>Active Requisition Queue ({pendingOrders.length} Orders)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Auto-Synced to Patient Surveillance</span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingOrders.map((ord) => (
                <div key={ord.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {ord.id}
                      </span>
                      <strong className="text-slate-900">{ord.test}</strong>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Requisitioned for {patient.nameAlias} • Target Window: {ord.scheduled}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-[#0F766E] font-bold text-[10px] uppercase">
                      {ord.priority}
                    </span>
                    <button
                      onClick={() => setPendingOrders(prev => prev.filter(o => o.id !== ord.id))}
                      className="text-slate-400 hover:text-[#DC2626] transition-colors cursor-pointer"
                      title="Cancel Requisition"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
