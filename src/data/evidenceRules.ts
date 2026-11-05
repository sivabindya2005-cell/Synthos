import { EvidenceRule } from '../types/clinical';

export const EVIDENCE_RULES: EvidenceRule[] = [
  {
    id: 'kdigo-met-2023',
    code: 'KDIGO 2023 Sec 1.3',
    title: 'KDIGO Clinical Practice Guideline for Diabetes Management in CKD: Metformin',
    organization: 'KDIGO (Kidney Disease: Improving Global Outcomes)',
    category: 'Renal',
    year: 2023,
    strengthOfRecommendation: 'Class I (Level A)',
    summary: 'Metformin dose adjustment and initiation thresholds according to eGFR.',
    fullText: 'In patients with type 2 diabetes and CKD, treat with metformin when eGFR ≥30 mL/min/1.73 m²: monitor eGFR at least annually when ≥60, and at least 2–4 times annually when 30–59 mL/min/1.73 m². Dose reduction is mandated at eGFR 30–44 mL/min/1.73 m² to a maximum of 1000 mg/day (or 500 mg BID). Metformin is strictly contraindicated if eGFR falls below 30 mL/min/1.73 m² due to excessive risk of fatal lactic acidosis.',
    appliedConditions: ['eGFR 30-44 mL/min/1.73m²', 'Type 2 Diabetes Mellitus', 'Metformin Therapy']
  },
  {
    id: 'fda-met-bbw',
    code: 'Rule #REN-MET-03',
    title: 'FDA Black Box Warning: Lactic Acidosis with Metformin in Renal Impairment',
    organization: 'U.S. Food & Drug Administration (FDA)',
    category: 'FDA Black Box',
    year: 2016,
    strengthOfRecommendation: 'FDA Boxed Warning',
    summary: 'Black box warning for risk of lactic acidosis in renal impairment.',
    fullText: 'Metformin-associated lactic acidosis (MALA) is a serious, metabolic complication that can occur due to metformin accumulation during treatment with fatal outcomes in approximately 50% of cases. Obtain eGFR prior to initiating and at least annually thereafter. In patients with eGFR 30 to 45 mL/min/1.73 m², initiation is not recommended. For patients taking metformin whose eGFR falls to this range, assess risk/benefit and cap daily dose at 1000 mg.',
    appliedConditions: ['eGFR < 45 mL/min/1.73m²', 'Metformin Hydrochloride']
  },
  {
    id: 'kdigo-sglt2i-2023',
    code: 'KDIGO 2023 Sec 1.4',
    title: 'SGLT2 Inhibitor Initiation and Nephroprotection in T2D + CKD',
    organization: 'KDIGO',
    category: 'Renal',
    year: 2023,
    strengthOfRecommendation: 'Class I (Level A)',
    summary: 'Preferential initiation of SGLT2 inhibitors (Empagliflozin, Dapagliflozin) for cardiorenal protection.',
    fullText: 'We recommend treating patients with T2D, CKD, and an eGFR ≥20 mL/min/1.73 m² with an SGLT2 inhibitor. Once initiated, continue until kidney replacement therapy unless not tolerated or contraindicated. SGLT2i provide verified nephroprotection and reduce heart failure hospitalizations regardless of baseline HbA1c.',
    appliedConditions: ['CKD Stage 3a/3b/4', 'T2D', 'Proteinuria']
  },
  {
    id: 'aha-ras-2022',
    code: 'AHA/ACC 2022',
    title: 'AHA/ACC/HFSA Guideline for the Management of Heart Failure and Proteinuric CKD',
    organization: 'American Heart Association / American College of Cardiology',
    category: 'Cardiology',
    year: 2022,
    strengthOfRecommendation: 'Class I (Level A)',
    summary: 'ACE inhibitor and ARB therapy in diabetic kidney disease and hypertension.',
    fullText: 'ACE inhibitors (e.g., Lisinopril) or ARBs are recommended first-line in patients with hypertension and albuminuria (UACR ≥30 mg/g) to reduce progression of kidney disease. Serum creatinine and potassium should be monitored within 7–14 days of initiation or dose escalation. A transient rise in SCr of up to 30% is acceptable if stable.',
    appliedConditions: ['Hypertension', 'UACR > 30 mg/g', 'Lisinopril therapy', 'CKD']
  },
  {
    id: 'cpic-warf-2017',
    code: 'CPIC-WAR-01',
    title: 'CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (CYP2C9 & VKORC1)',
    organization: 'Clinical Pharmacogenetics Implementation Consortium (CPIC)',
    category: 'Pharmacogenomics',
    year: 2017,
    strengthOfRecommendation: 'CPIC Strong',
    summary: 'Genotype-guided warfarin titration algorithm.',
    fullText: 'CYP2C9 *3/*3 homozygous individuals possess roughly 10-15% of wild-type catalytic clearance for the potent S-warfarin enantiomer. Recommended starting dose must be decreased by 70–80%, or non-vitamin K antagonist oral anticoagulants (DOACs like Apixaban) should be chosen if clinically appropriate to avoid supratherapeutic INR and catastrophic intracranial hemorrhage.',
    appliedConditions: ['CYP2C9 *3/*3', 'Warfarin Therapy', 'Atrial Fibrillation']
  },
  {
    id: 'fda-citalopram-2012',
    code: 'FDA-CIT-01',
    title: 'FDA Drug Safety Communication: Revised Ceilings for Citalopram',
    organization: 'U.S. Food & Drug Administration (FDA)',
    category: 'FDA Black Box',
    year: 2012,
    strengthOfRecommendation: 'FDA Boxed Warning',
    summary: 'Max dose 20 mg/day in elderly due to dose-dependent QT prolongation.',
    fullText: 'Citalopram causes dose-dependent QT interval prolongation, predisposing patients to Torsades de Pointes, ventricular tachycardia, and sudden cardiac death. Citalopram should no longer be prescribed at doses greater than 40 mg per day. In patients greater than 60 years of age, maximum recommended dose is 20 mg per day due to reduced hepatic clearance and heightened arrhythmogenic susceptibility.',
    appliedConditions: ['Age > 60 years', 'Citalopram therapy', 'QTc > 450 ms']
  },
  {
    id: 'acc-statin-2019',
    code: 'ACC/AHA 2019',
    title: 'ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease',
    organization: 'ACC/AHA',
    category: 'Cardiology',
    year: 2019,
    strengthOfRecommendation: 'Class I (Level A)',
    summary: 'Statin intensity recommendation for patients with diabetes and CKD.',
    fullText: 'For adults 40 to 75 years of age with diabetes mellitus, moderate-to-high intensity statin therapy (such as Atorvastatin 40–80 mg) is indicated regardless of estimated 10-year ASCVD risk. In renal impairment, Atorvastatin requires no dosage adjustment as elimination is primarily biliary/hepatic (>98%).',
    appliedConditions: ['T2D', 'Age 40-75', 'Hyperlipidemia', 'CKD']
  },
  {
    id: 'beers-2023',
    code: 'AGS Beers 2023',
    title: 'American Geriatrics Society 2023 Updated Beers Criteria',
    organization: 'American Geriatrics Society',
    category: 'Cardiology',
    year: 2023,
    strengthOfRecommendation: 'Class IIa (Level B)',
    summary: 'Potentially Inappropriate Medication Use in Older Adults.',
    fullText: 'Avoid concurrent use of 3 or more CNS-active agents or combination of agents that significantly prolong the QT interval in older adults. Periodic medication reconciliation and deprescribing audits are strongly indicated.',
    appliedConditions: ['Age ≥ 65', 'Polypharmacy', 'QT Prolonging Agents']
  }
];
