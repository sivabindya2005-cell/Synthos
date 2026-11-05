import { PatientCase } from '../types/clinical';

export const PATIENT_CASES: Record<string, PatientCase> = {
  'DEMO-PT-0241': {
    id: 'DEMO-PT-0241',
    tier: 'Tier-4',
    nameAlias: 'Synthetic Case 0241',
    summary: '62Y M • eGFR 42 • Metformin Signal',
    biometrics: {
      age: 62,
      sex: 'Male',
      heightCm: 178,
      weightKg: 86.4,
      bmi: 27.3,
      ibwKg: 73.0,
      smoking: 'Non-smoker',
      allergies: ['NKDA (Verified)'],
      diagnoses: ['CKD 3b', 'T2D', 'Essential HTN', 'Hyperlipidemia']
    },
    organStatus: {
      renal: {
        status: 'compromised',
        egfr: 42,
        egfrMethod: 'CKD-EPI 2021',
        scr: 1.80,
        bun: 28,
        crcl: 44.1,
        badge: 'DOSE REDUCTION REQUIRED',
        stage: 'Stage 3b'
      },
      hepatic: {
        status: 'normal',
        cypStatus: 'CYP450 Normal',
        childPugh: 'Child-Pugh Class A',
        alt: 22,
        ast: 24,
        totalBili: 0.8,
        badge: 'UNRESTRICTED CLEARANCE'
      },
      cardiovascular: {
        status: 'elevated',
        bp: '138/84',
        bpStage: 'Stage 1 HTN (Target <130)',
        targetBp: '<130/80',
        heartRate: 68,
        rhythm: 'NSR',
        potassium: 4.9,
        badge: 'MONITORING LISINOPRIL'
      },
      glycemic: {
        status: 'suboptimal',
        hba1c: 8.2,
        controlText: 'Sub-optimal Control',
        fastingGlucose: 164,
        uacr: 145,
        badge: 'SWITCH THERAPY CANDIDATE'
      }
    },
    medications: [
      {
        id: 'med-1',
        name: 'Metformin HCl',
        dose: '1000 mg Oral Tablet',
        frequency: 'BID with meals',
        route: 'Oral',
        totalDailyDose: '2000 mg/day',
        therapeuticClass: 'Biguanide / Antidiabetic',
        metabolism: '90% Renal Tubular Elimination',
        metabolismDetail: 'Half-life extended 2.4x at eGFR 42',
        safetyStatus: 'flagged',
        safetyEvaluation: 'Reduce to 500mg BID max',
        guidelineCitation: 'KDIGO 2023 Sec 1.3',
        guidelineUrl: 'https://kdigo.org/guidelines/diabetes-ckd/',
        recommendedAction: 'Reduce dose to 500 mg BID or transition to SGLT2i.',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'med-2',
        name: 'Lisinopril',
        dose: '20 mg Oral Tablet',
        frequency: 'Once Daily',
        route: 'Oral',
        totalDailyDose: '20 mg/day',
        therapeuticClass: 'ACE Inhibitor / Antihypertensive',
        metabolism: 'Renal excretion (unchanged)',
        metabolismDetail: 'Current K+: 4.9 mEq/L (borderline)',
        safetyStatus: 'monitor',
        safetyEvaluation: 'Renoprotective; Monitor K+',
        guidelineCitation: 'AHA/ACC 2022',
        guidelineUrl: 'https://www.ahajournals.org/guidelines',
        recommendedAction: 'Maintain for proteinuria reduction, monitor BMP within 14 days.',
        provenanceId: 'prov-lis-acei'
      },
      {
        id: 'med-3',
        name: 'Atorvastatin Calcium',
        dose: '40 mg Oral Tablet',
        frequency: 'Once Daily at Bedtime',
        route: 'Oral',
        totalDailyDose: '40 mg/day',
        therapeuticClass: 'HMG-CoA Reductase Inhibitor',
        metabolism: 'Hepatic CYP3A4 Substrate',
        metabolismDetail: '<2% Renal Elimination',
        safetyStatus: 'optimal',
        safetyEvaluation: 'Optimal Dose for ASCVD',
        guidelineCitation: 'ACC/AHA 2019',
        guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000678',
        recommendedAction: 'High intensity statin therapy indicated for T2D + CKD.',
        provenanceId: 'prov-ator-lipid'
      },
      {
        id: 'med-4',
        name: 'Omeprazole DR',
        dose: '20 mg Delayed Release Cap',
        frequency: 'Daily AC',
        route: 'Oral',
        totalDailyDose: '20 mg/day',
        therapeuticClass: 'Proton Pump Inhibitor',
        metabolism: 'CYP2C19 & CYP3A4 Substrate',
        metabolismDetail: 'Hypomagnesemia risk in CKD',
        safetyStatus: 'optimal',
        safetyEvaluation: 'Stable Indication (GERD)',
        guidelineCitation: 'ACG Guidelines',
        guidelineUrl: 'https://gi.org/clinical-guidelines/',
        recommendedAction: 'Periodically assess continued indication; recheck serum Mg++.',
        provenanceId: 'prov-omep-ppi'
      }
    ],
    priorityTriage: {
      id: 'triage-1',
      title: 'Metformin in CKD Stage 3b (eGFR 42)',
      currentDoseSummary: '1000 mg BID (2000 mg/day)',
      level: 'HIGH PRIORITY',
      discrepancyText: "Current prescribed daily dosage (2000 mg) exceeds safety threshold by 100% for patient's kidney clearance. Metformin-associated lactic acidosis (MALA) risk increases exponentially below eGFR 45 when unadjusted.",
      options: [
        {
          id: 'opt-a',
          title: 'Option A: Dose Reduction',
          description: 'Reduce Metformin to 500 mg PO BID (1000 mg/day total). Recheck eGFR & SCr in 30 days.',
          newDose: '500 mg PO BID'
        },
        {
          id: 'opt-b',
          title: 'Option B: Switch to SGLT2i + GLP-1 RA',
          description: 'Discontinue Metformin. Initiate Empagliflozin 10 mg PO daily for combined nephroprotection & glycemic control.',
          newDose: 'Empagliflozin 10 mg PO daily'
        }
      ],
      defaultSelectedOption: 'opt-a',
      defaultNote: 'Recommending reduction of Metformin to 500mg PO BID given eGFR 42 mL/min (CKD 3b). Discussed SGLT2i addition with attending; will repeat BMP in 30 days.'
    },
    kpis: {
      activeAgentsCount: 4,
      reconciliationSynced: '12h ago',
      actionAlertsCount: 2,
      alertSummary: '1 Moderate Renal • 1 Metabolic Risk',
      pendingLabsCount: 3,
      nextDraw: 'Serum K+ in 14 days',
      evidenceLinksCount: 14,
      guidelinesSummary: 'KDIGO 2023 • ADA 2024 • CPIC'
    },
    pkData: {
      drugName: 'Metformin',
      halfLifeBaseline: '6.2h',
      halfLifeCurrent: '14.8h in CKD 3b',
      predictedPeak: '2.85 mcg/mL',
      pctVsReference: '+42% vs Reference',
      upperSafetyThreshold: 2.5,
      targetMin: 1.0,
      targetMax: 2.0,
      currentPeakValue: 2.85
    },
    rulesTriggered: [
      {
        id: 'rule-1',
        ruleCode: 'Rule #REN-MET-03',
        name: 'FDA Black Box Rule: Metformin & Renal Impairment',
        category: 'FDA Black Box',
        text: 'Contraindicated if eGFR <30 mL/min/1.73m². In eGFR 30–45 mL/min/1.73m², initiation is not recommended; for patients already taking metformin whose eGFR falls to this range, assess benefit-risk and restrict total daily dose to maximum 1000 mg/day.',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'rule-2',
        ruleCode: 'Guideline Rec 1.3.1',
        name: 'KDIGO 2023 Clinical Practice Guideline',
        category: 'KDIGO 2023',
        text: 'In patients with T2D and CKD with eGFR 30–44 mL/min/1.73m², metformin dose must be reduced to ≤1000 mg daily. Preferential initiation of SGLT2 inhibitor (e.g., Empagliflozin 10mg) is recommended for renal and cardiovascular risk reduction.',
        provenanceId: 'prov-sglt2-kdigo'
      }
    ]
  },

  'DEMO-PT-0108': {
    id: 'DEMO-PT-0108',
    tier: 'Tier-3',
    nameAlias: 'Synthetic Case 0108',
    summary: '74Y F • AFib • Warfarin CYP2C9 *3/*3 Titration',
    biometrics: {
      age: 74,
      sex: 'Female',
      heightCm: 162,
      weightKg: 64.0,
      bmi: 24.4,
      ibwKg: 50.1,
      smoking: 'Non-smoker',
      allergies: ['Sulfa (Rash)'],
      diagnoses: ['Non-valvular Atrial Fibrillation', 'Hypertension', 'Osteoarthritis']
    },
    organStatus: {
      renal: {
        status: 'caution',
        egfr: 58,
        egfrMethod: 'CKD-EPI 2021',
        scr: 1.10,
        bun: 19,
        crcl: 48.5,
        badge: 'STAGE 3A RENAL',
        stage: 'Stage 3a'
      },
      hepatic: {
        status: 'compromised',
        cypStatus: 'CYP2C9 *3/*3 Poor Metabolizer',
        childPugh: 'Child-Pugh Class A',
        alt: 18,
        ast: 20,
        totalBili: 0.6,
        badge: 'IMPAIRED S-WARFARIN CLEARANCE'
      },
      cardiovascular: {
        status: 'normal',
        bp: '126/78',
        bpStage: 'Well-controlled',
        targetBp: '<130/80',
        heartRate: 72,
        rhythm: 'Controlled AFib',
        potassium: 4.4,
        badge: 'STABLE RATE'
      },
      glycemic: {
        status: 'controlled',
        hba1c: 5.6,
        controlText: 'Normoglycemic',
        fastingGlucose: 94,
        uacr: 18,
        badge: 'NORMAL'
      }
    },
    medications: [
      {
        id: 'med-108-1',
        name: 'Warfarin Sodium',
        dose: '5 mg Oral Tablet',
        frequency: 'Daily in evening',
        route: 'Oral',
        totalDailyDose: '5 mg/day',
        therapeuticClass: 'Vitamin K Antagonist',
        metabolism: 'CYP2C9 (S-enantiomer) & VKORC1',
        metabolismDetail: 'CYP2C9 *3/*3: 85% reduced clearance',
        safetyStatus: 'flagged',
        safetyEvaluation: 'Supratherapeutic INR (3.4) Risk',
        guidelineCitation: 'CPIC Warfarin 2017',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/',
        recommendedAction: 'CPIC recommends 60-80% dose reduction (start 1-1.5mg/day) or direct DOAC switch.',
        provenanceId: 'prov-warf-cyp2c9'
      },
      {
        id: 'med-108-2',
        name: 'Metoprolol Succinate ER',
        dose: '50 mg Oral Tablet',
        frequency: 'Once Daily',
        route: 'Oral',
        totalDailyDose: '50 mg/day',
        therapeuticClass: 'Beta-1 Adrenergic Blocker',
        metabolism: 'CYP2D6 Substrate',
        metabolismDetail: 'Normal CYP2D6 metabolizer status',
        safetyStatus: 'optimal',
        safetyEvaluation: 'Adequate Rate Control (HR 72)',
        guidelineCitation: 'AHA AFib 2023',
        guidelineUrl: 'https://www.ahajournals.org',
        recommendedAction: 'Continue current dose.',
        provenanceId: 'prov-metop-afib'
      },
      {
        id: 'med-108-3',
        name: 'Acetaminophen',
        dose: '650 mg Oral Tablet',
        frequency: 'PRN Joint Pain (TID max)',
        route: 'Oral',
        totalDailyDose: 'Up to 1950 mg/day',
        therapeuticClass: 'Non-opioid Analgesic',
        metabolism: 'Hepatic Glucuronidation',
        metabolismDetail: 'High doses potentiate Warfarin INR',
        safetyStatus: 'monitor',
        safetyEvaluation: 'Monitor INR on high intake',
        guidelineCitation: 'Chest 2012',
        guidelineUrl: 'https://journal.chestnet.org',
        recommendedAction: 'Limit to ≤2g/day to avoid potentiating anticoagulation.',
        provenanceId: 'prov-apap-warfarin'
      }
    ],
    priorityTriage: {
      id: 'triage-108',
      title: 'Pharmacogenomic Mismatch: Warfarin in CYP2C9 *3/*3',
      currentDoseSummary: '5 mg Daily (INR 3.4)',
      level: 'CRITICAL',
      discrepancyText: 'Patient is homozygous CYP2C9 *3/*3 (Poor Metabolizer). Standard 5mg starting dose leads to extreme active S-warfarin accumulation, prolonged half-life (>120h), and severe bleeding hazard with INR 3.4.',
      options: [
        {
          id: 'opt-w1',
          title: 'Option A: Switch to DOAC (Apixaban)',
          description: 'Discontinue Warfarin. Initiate Apixaban 5 mg PO BID (standard renal dosing, CrCl > 25).',
          newDose: 'Apixaban 5 mg PO BID'
        },
        {
          id: 'opt-w2',
          title: 'Option B: CPIC Pharmacogenomic Dose Taper',
          description: 'Hold Warfarin until INR < 2.5. Resume at 1.5 mg daily with twice-weekly INR monitoring.',
          newDose: 'Warfarin 1.5 mg PO Daily'
        }
      ],
      defaultSelectedOption: 'opt-w1',
      defaultNote: 'Patient CYP2C9 *3/*3 genotype confirmed. Warfarin 5mg daily resulted in supratherapeutic INR 3.4. Recommending transition to Apixaban 5mg BID once INR drops below 2.0 per 2023 ACC/AHA guidelines.'
    },
    kpis: {
      activeAgentsCount: 3,
      reconciliationSynced: '6h ago',
      actionAlertsCount: 1,
      alertSummary: '1 Critical PGx Bleeding Alert',
      pendingLabsCount: 2,
      nextDraw: 'Repeat INR in 48 hours',
      evidenceLinksCount: 18,
      guidelinesSummary: 'CPIC 2017 • CHEST 2021 • AHA 2023'
    },
    pkData: {
      drugName: 'S-Warfarin',
      halfLifeBaseline: '32h',
      halfLifeCurrent: '118h in CYP2C9 *3/*3',
      predictedPeak: '3.40 INR',
      pctVsReference: '+70% Over Target',
      upperSafetyThreshold: 3.0,
      targetMin: 2.0,
      targetMax: 3.0,
      currentPeakValue: 3.4
    },
    rulesTriggered: [
      {
        id: 'rule-pgx-1',
        ruleCode: 'CPIC-WAR-01',
        name: 'CPIC Guideline for CYP2C9 & VKORC1 Warfarin Dosing',
        category: 'Pharmacogenomics',
        text: 'Patients carrying CYP2C9 *3/*3 exhibit profound reduction in S-warfarin clearance (up to 90%). Expected maintenance dose is typically 1.0–1.5 mg/day. Strong recommendation for alternative anticoagulation (DOAC) in non-valvular AFib.',
        provenanceId: 'prov-warf-cyp2c9'
      }
    ]
  },

  'DEMO-PT-0332': {
    id: 'DEMO-PT-0332',
    tier: 'Tier-4',
    nameAlias: 'Synthetic Case 0332',
    summary: '81Y M • Polypharmacy • QTc Risk 480ms',
    biometrics: {
      age: 81,
      sex: 'Male',
      heightCm: 172,
      weightKg: 68.2,
      bmi: 23.1,
      ibwKg: 66.8,
      smoking: 'Former smoker',
      allergies: ['Penicillin (Anaphylaxis)'],
      diagnoses: ['Major Depressive Disorder', 'Mild Cognitive Impairment', 'BPH', 'GERD', 'Peripheral Neuropathy']
    },
    organStatus: {
      renal: {
        status: 'caution',
        egfr: 49,
        egfrMethod: 'CKD-EPI 2021',
        scr: 1.42,
        bun: 24,
        crcl: 39.2,
        badge: 'AGE-RELATED DECLINE',
        stage: 'Stage 3a'
      },
      hepatic: {
        status: 'normal',
        cypStatus: 'CYP2D6 Intermediate',
        childPugh: 'Child-Pugh Class A',
        alt: 16,
        ast: 19,
        totalBili: 0.5,
        badge: 'NORMAL HEPATIC PROFILE'
      },
      cardiovascular: {
        status: 'compromised',
        bp: '118/72',
        bpStage: 'Orthostatic Risk',
        targetBp: '<135/85',
        heartRate: 62,
        rhythm: 'Sinus Bradycardia, QTc 488ms',
        potassium: 3.8,
        badge: 'QTc PROLONGATION FLAG'
      },
      glycemic: {
        status: 'controlled',
        hba1c: 5.4,
        controlText: 'Normal Range',
        fastingGlucose: 88,
        uacr: 22,
        badge: 'NORMAL'
      }
    },
    medications: [
      {
        id: 'med-332-1',
        name: 'Citalopram Hydrobromide',
        dose: '40 mg Oral Tablet',
        frequency: 'Daily in morning',
        route: 'Oral',
        totalDailyDose: '40 mg/day',
        therapeuticClass: 'SSRI Antidepressant',
        metabolism: 'CYP2C19 & CYP3A4 Substrate',
        metabolismDetail: 'FDA limit 20mg/day in age >60',
        safetyStatus: 'contraindicated',
        safetyEvaluation: 'FDA Warning: Max 20mg in Age >60',
        guidelineCitation: 'FDA Drug Safety 2012',
        guidelineUrl: 'https://www.fda.gov/drugs/drug-safety-and-availability',
        recommendedAction: 'Reduce Citalopram to max 20 mg/day or substitute with Sertraline.',
        provenanceId: 'prov-cit-geriatric'
      },
      {
        id: 'med-332-2',
        name: 'Donepezil HCl',
        dose: '10 mg Oral Tablet',
        frequency: 'At bedtime',
        route: 'Oral',
        totalDailyDose: '10 mg/day',
        therapeuticClass: 'Acetylcholinesterase Inhibitor',
        metabolism: 'CYP2D6 & CYP3A4',
        metabolismDetail: 'Synergistic bradycardia & QTc prolongation',
        safetyStatus: 'flagged',
        safetyEvaluation: 'Bradycardia / QTc Additive Risk',
        guidelineCitation: 'Beers Criteria 2023',
        guidelineUrl: 'https://www.americangeriatrics.org',
        recommendedAction: 'Monitor heart rate and repeat 12-lead ECG.',
        provenanceId: 'prov-done-beers'
      },
      {
        id: 'med-332-3',
        name: 'Tamsulosin HCl',
        dose: '0.4 mg Oral Capsule',
        frequency: 'Daily with dinner',
        route: 'Oral',
        totalDailyDose: '0.4 mg/day',
        therapeuticClass: 'Alpha-1 Adrenergic Blocker',
        metabolism: 'CYP3A4 & CYP2D6',
        metabolismDetail: 'Orthostatic hypotension risk',
        safetyStatus: 'monitor',
        safetyEvaluation: 'Watch Orthostatics & Falls',
        guidelineCitation: 'AUA Guidelines',
        guidelineUrl: 'https://www.auanet.org',
        recommendedAction: 'Instruct patient on sit-to-stand precautions.',
        provenanceId: 'prov-tams-bph'
      },
      {
        id: 'med-332-4',
        name: 'Pantoprazole Sodium',
        dose: '40 mg Delayed Release',
        frequency: 'Daily AC',
        route: 'Oral',
        totalDailyDose: '40 mg/day',
        therapeuticClass: 'Proton Pump Inhibitor',
        metabolism: 'CYP2C19',
        metabolismDetail: 'Competitive CYP2C19 substrate',
        safetyStatus: 'optimal',
        safetyEvaluation: 'Preferred PPI over Omeprazole',
        guidelineCitation: 'ACG Guidelines',
        guidelineUrl: 'https://gi.org',
        recommendedAction: 'Lower drug interaction potential with CYP2C19.',
        provenanceId: 'prov-panto-geriatric'
      }
    ],
    priorityTriage: {
      id: 'triage-332',
      title: 'Dose Exceeds FDA Geriatric Safety Ceiling (Citalopram 40mg)',
      currentDoseSummary: '40 mg Daily (QTc 488ms)',
      level: 'CRITICAL',
      discrepancyText: 'FDA Boxed Alert strictly mandates maximum dose of 20 mg/day Citalopram for patients older than 60 due to lethal polymorphic ventricular tachycardia (TdP) risk. Patient QTc is currently elevated at 488ms with concurrent Donepezil.',
      options: [
        {
          id: 'opt-c1',
          title: 'Option A: Step-down to 20 mg/day immediately',
          description: 'Reduce Citalopram to 20 mg daily. Recheck baseline ECG in 14 days and check serum potassium/magnesium.',
          newDose: 'Citalopram 20 mg PO Daily'
        },
        {
          id: 'opt-c2',
          title: 'Option B: Cross-titrate to Sertraline',
          description: 'Cross-taper to Sertraline (starting 25 mg daily), which has minimal cardiac repolarization impact.',
          newDose: 'Sertraline 25 mg PO Daily'
        }
      ],
      defaultSelectedOption: 'opt-c1',
      defaultNote: 'Patient age 81 on Citalopram 40mg daily with baseline QTc 488ms and concurrent Donepezil. Contacted prescriber regarding FDA geriatric ceiling of 20mg/day to mitigate fatal arrhythmia risk. Order submitted for reduction to 20mg.'
    },
    kpis: {
      activeAgentsCount: 4,
      reconciliationSynced: '4h ago',
      actionAlertsCount: 2,
      alertSummary: '1 Critical Arrhythmia • 1 Beers Alert',
      pendingLabsCount: 2,
      nextDraw: 'ECG & Serum Mg++ in 7 days',
      evidenceLinksCount: 16,
      guidelinesSummary: 'FDA Alert 2012 • Beers 2023 • AHA QTc'
    },
    pkData: {
      drugName: 'Citalopram',
      halfLifeBaseline: '35h',
      halfLifeCurrent: '62h in Geriatric Patient',
      predictedPeak: '488 ms QTc',
      pctVsReference: '+48ms Above Normal',
      upperSafetyThreshold: 500,
      targetMin: 380,
      targetMax: 440,
      currentPeakValue: 488
    },
    rulesTriggered: [
      {
        id: 'rule-qt-1',
        ruleCode: 'FDA-CIT-01',
        name: 'FDA Drug Safety Communication: Citalopram Ceiling Dose',
        category: 'FDA Black Box',
        text: 'Citalopram causes dose-dependent QT interval prolongation. Doses greater than 20 mg per day are not recommended in patients over 60 years of age due to increased risk of Torsades de Pointes.',
        provenanceId: 'prov-cit-geriatric'
      }
    ]
  }
};
