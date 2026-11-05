import { DrugMonograph } from '../../types/clinical';

export const KINASE_DRUGS: DrugMonograph[] = [
  // 1. EGFR & HER2 Inhibitors
  {
    id: 'drug-gefitinib',
    genericName: 'Gefitinib',
    brandNames: ['Iressa'],
    therapeuticClass: 'EGFR Tyrosine Kinase Inhibitor (First-Generation)',
    targetSuperfamily: 'Receptor Tyrosine Kinase (RTK) - ErbB / EGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2003,
    approvedIndications: ['First-line Treatment of Metastatic NSCLC with EGFR Exon 19 Deletions or Exon 21 (L858R) Substitution Mutations'],
    mechanismOfAction: 'Competitively binds the ATP-binding pocket of the EGFR kinase domain, inhibiting autophosphorylation and terminating downstream MAPK and AKT cell proliferation signaling cascades.',
    molecularTargets: [{ name: 'Epidermal Growth Factor Receptor (EGFR / ErbB1)', type: 'Receptor Tyrosine Kinase', action: 'ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 33 nM' }],
    biologicalPathways: ['RAS-RAF-MEK-ERK Proliferation Arrest', 'PI3K-Akt Anti-Apoptotic Signal Inactivation'],
    pkParameters: { bioavailability: '60%', volumeOfDistribution: '1400 L', proteinBinding: '90%', halfLife: '48 hours', clearanceRoute: 'Hepatic CYP3A4 oxidation; 86% feces, <0.5% urine', steadyStateTime: '7 to 10 days' },
    pgxConsiderations: [{ gene: 'EGFR', alleles: 'Exon 19 del, L858R vs T790M resistance', phenotypeEffect: 'T790M steric gatekeeper mutation confers acquired resistance to gefitinib', cpicDosingRecommendation: 'Switch to third-generation osimertinib upon T790M emergence.' }],
    criticalAdverseEffects: ['Interstitial Lung Disease (ILD) / fatal pneumonitis in 1-2%', 'Severe acneiform papulopustular rash', 'Diarrhea and transaminase elevations'],
    contraindications: ['Hypersensitivity to gefitinib'],
    clinicalTrialsReferences: [{ title: 'Gefitinib or carboplatin-paclitaxel in pulmonary adenocarcinoma (IPASS)', journalOrTrialId: 'N Engl J Med 2009; 361: 947-957', year: 2009, evidenceTier: 'established' }]
  },
  {
    id: 'drug-erlotinib',
    genericName: 'Erlotinib Hydrochloride',
    brandNames: ['Tarceva'],
    therapeuticClass: 'EGFR Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase (RTK) - ErbB / EGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2004,
    approvedIndications: ['Metastatic NSCLC with EGFR Mutations', 'Advanced Pancreatic Cancer (with Gemcitabine)'],
    mechanismOfAction: 'Reversibly inhibits EGFR tyrosine kinase autophosphorylation, blocking downstream oncogenic signaling in tumor cells harboring sensitizing EGFR mutations.',
    molecularTargets: [{ name: 'EGFR (ErbB1)', type: 'Receptor Tyrosine Kinase', action: 'Competitive Inhibitor', bindingAffinity: 'IC50 = 2 nM' }],
    biologicalPathways: ['EGFR-Mediated Survival Signaling Shutdown', 'Tumor Apoptosis Induction'],
    pkParameters: { bioavailability: '60% (fasting); ~100% (with food)', volumeOfDistribution: '232 L', proteinBinding: '93%', halfLife: '36 hours', clearanceRoute: 'Hepatic CYP3A4 and CYP1A2 metabolism', steadyStateTime: '7 to 8 days' },
    pgxConsiderations: [{ gene: 'CYP1A2', alleles: 'Induced by cigarette smoke', phenotypeEffect: 'Smokers have 60% lower AUC', cpicDosingRecommendation: 'Dose escalation required in active smokers.' }],
    criticalAdverseEffects: ['Interstitial lung disease', 'Severe skin rash and nail dystrophy', 'Gastrointestinal perforation'],
    contraindications: ['Known severe hypersensitivity'],
    clinicalTrialsReferences: [{ title: 'Erlotinib versus standard chemotherapy as first-line treatment for European patients with advanced EGFR mutation-positive non-small-cell lung cancer (EURTAC)', journalOrTrialId: 'Lancet Oncol 2012; 13: 239-246', year: 2012, evidenceTier: 'established' }]
  },
  {
    id: 'drug-osimertinib',
    genericName: 'Osimertinib Mesylate',
    brandNames: ['Tagrisso'],
    therapeuticClass: 'Third-Generation Mutant-Selective & T790M EGFR TKI',
    targetSuperfamily: 'Receptor Tyrosine Kinase (RTK) - ErbB / EGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2015,
    approvedIndications: ['First-line Metastatic NSCLC with EGFR Exon 19 del or L858R', 'EGFR T790M Resistance Mutation-Positive NSCLC', 'Adjuvant Therapy in Resected EGFR-Mutant NSCLC'],
    mechanismOfAction: 'Mono-anilino-pyrimidine that forms an irreversible covalent bond with the Cys797 residue in the ATP-binding cleft of mutant EGFR (including T790M gatekeeper mutation) with sparing of wild-type EGFR and superior blood-brain barrier penetration.',
    molecularTargets: [
      { name: 'EGFR T790M / L858R / Exon 19 del', type: 'Receptor Tyrosine Kinase', action: 'Irreversible Covalent Cys797 Inhibitor', bindingAffinity: 'IC50 = 12 nM' },
      { name: 'Wild-Type EGFR', type: 'Receptor Tyrosine Kinase', action: 'Weak Inhibitor (Sparing normal tissue)', bindingAffinity: 'IC50 = 184 nM' }
    ],
    biologicalPathways: ['Central Nervous System Leptomeningeal Metastasis Penetration', 'Mutant EGFR Apoptotic Cascade', 'Wild-Type Gut/Skin Sparing'],
    pkParameters: { bioavailability: '70%', volumeOfDistribution: '918 L', proteinBinding: '95%', halfLife: '48 hours', clearanceRoute: 'Hepatic CYP3A4 oxidation to active AZ5104 metabolite', steadyStateTime: '15 days' },
    pgxConsiderations: [{ gene: 'EGFR C797S', alleles: 'C797S acquired resistance', phenotypeEffect: 'Prevents covalent adduction at Cys797 residue', cpicDosingRecommendation: 'Clinical resistance biomarker; evaluate combination therapies or clinical trials.' }],
    criticalAdverseEffects: ['Interstitial Lung Disease / Pneumonitis in 3.9%', 'QTc interval prolongation and Torsades de Pointes risk', 'Cardiomyopathy / Left Ventricular Ejection Fraction decline'],
    contraindications: ['Concomitant strong CYP3A inducers (St. John\'s Wort, Rifampin)'],
    clinicalTrialsReferences: [
      { title: 'Osimertinib in Untreated EGFR-Mutated Advanced Non-Small-Cell Lung Cancer (FLAURA)', journalOrTrialId: 'N Engl J Med 2018; 378: 113-125', year: 2018, evidenceTier: 'established' },
      { title: 'Osimertinib as Adjuvant Therapy in Resected EGFR-Mutated NSCLC (ADAURA)', journalOrTrialId: 'N Engl J Med 2020; 383: 1711-1723', year: 2020, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-lapatinib',
    genericName: 'Lapatinib Ditosylate',
    brandNames: ['Tykerb'],
    therapeuticClass: 'Dual EGFR and HER2 Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase (RTK) - ErbB / HER2',
    specialty: 'oncology',
    fdaApprovalYear: 2007,
    approvedIndications: ['Advanced or Metastatic HER2-Positive Breast Cancer (in combination with Capecitabine or Letrozole)'],
    mechanismOfAction: 'Reversibly inhibits the intracellular kinase domains of both EGFR (ErbB1) and HER2 (ErbB2), disrupting downstream MAPK and Akt survival signaling in trastuzumab-resistant tumors.',
    molecularTargets: [
      { name: 'HER2 / ErbB2 (Neu)', type: 'Receptor Tyrosine Kinase', action: 'Reversible ATP-Competitive Inhibitor', bindingAffinity: 'Ki = 9 nM' },
      { name: 'EGFR / ErbB1', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'Ki = 11 nM' }
    ],
    biologicalPathways: ['HER2 Autophosphorylation Abrogation', 'Trastuzumab-Resistant Breast Cancer Growth Arrest'],
    pkParameters: { bioavailability: 'Incomplete and variable; increased up to 4-fold with high-fat meals', volumeOfDistribution: '434 L', proteinBinding: '>99% to albumin and AGP', halfLife: '24 hours', clearanceRoute: 'Extensive hepatic CYP3A4 and CYP3A5 metabolism; 92% fecal excretion', steadyStateTime: '6 to 7 days' },
    pgxConsiderations: [{ gene: 'HLA-DQA1*02:01 / HLA-DRB1*07:01', alleles: 'High-risk haplotype', phenotypeEffect: 'Increased risk of severe immune-mediated drug-induced liver injury', cpicDosingRecommendation: 'Monitor LFTs at baseline and every 4-6 weeks.' }],
    criticalAdverseEffects: ['Hepatotoxicity (severe AST/ALT elevations)', 'Left ventricular ejection fraction (LVEF) reduction', 'Severe diarrhea and dehydration', 'QTc interval prolongation'],
    contraindications: ['Known hypersensitivity to lapatinib'],
    clinicalTrialsReferences: [{ title: 'Lapatinib plus capecitabine for HER2-positive advanced breast cancer', journalOrTrialId: 'N Engl J Med 2006; 355: 2733-2743', year: 2006, evidenceTier: 'established' }]
  },
  {
    id: 'drug-tucatinib',
    genericName: 'Tucatinib',
    brandNames: ['Tukysa'],
    therapeuticClass: 'Highly Selective HER2 Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase (RTK) - ErbB / HER2',
    specialty: 'oncology',
    fdaApprovalYear: 2020,
    approvedIndications: ['HER2-Positive Metastatic Breast Cancer including Brain Metastases (with Trastuzumab and Capecitabine)', 'RAS Wild-Type HER2-Positive Metastatic Colorectal Cancer'],
    mechanismOfAction: 'Orally active, highly selective HER2 kinase inhibitor (>1000-fold selective over EGFR), providing potent intracranial efficacy against CNS metastases while avoiding EGFR-mediated rash and diarrhea.',
    molecularTargets: [{ name: 'HER2 (ErbB2)', type: 'Receptor Tyrosine Kinase', action: 'Selective ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 7 nM' }],
    biologicalPathways: ['Intracranial HER2-Driven Metastatic Suppression', 'HER2 Heterodimerization Disruption'],
    pkParameters: { bioavailability: 'High absorption', volumeOfDistribution: '1670 L', proteinBinding: '97%', halfLife: '8.5 hours', clearanceRoute: 'Hepatic CYP2C8 and CYP3A4 metabolism; 86% feces, 4% urine', steadyStateTime: '2 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Severe diarrhea (grade 3 in 12%)', 'Hepatotoxicity with ALT/AST and bilirubin elevations', 'Reversible serum creatinine increase via renal tubular transporter inhibition (MATE1/2-K) without altering true GFR'],
    contraindications: ['Severe hepatic impairment without dose adjustment'],
    clinicalTrialsReferences: [{ title: 'Tucatinib, Trastuzumab, and Capecitabine for HER2-Positive Metastatic Breast Cancer (HER2CLIMB)', journalOrTrialId: 'N Engl J Med 2020; 382: 597-609', year: 2020, evidenceTier: 'established' }]
  },

  // 2. BCR-ABL1 Kinase Inhibitors (Leukemia)
  {
    id: 'drug-imatinib',
    genericName: 'Imatinib Mesylate',
    brandNames: ['Gleevec'],
    therapeuticClass: 'BCR-ABL Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Non-Receptor & Receptor Tyrosine Kinase',
    specialty: 'oncology',
    fdaApprovalYear: 2001,
    approvedIndications: ['Philadelphia Chromosome-Positive (Ph+) CML', 'Ph+ Acute Lymphoblastic Leukemia (ALL)', 'KIT (CD117)+ Gastrointestinal Stromal Tumors (GIST)'],
    mechanismOfAction: 'Occupies the ATP-binding cleft of the BCR-ABL1 oncoprotein kinase domain, locking it in an inactive pseudo-substrate conformation. Blocks downstream phosphorylation of STAT5, CRKL, and PI3K/Akt survival signaling cascades.',
    molecularTargets: [
      { name: 'BCR-ABL1 Fusion Kinase', type: 'Tyrosine Kinase', action: 'ATP-competitive Inhibitor', bindingAffinity: 'IC50 = 100 nM' },
      { name: 'c-KIT (CD117)', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 100 nM' },
      { name: 'PDGFR-alpha / beta', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 50 nM' }
    ],
    biologicalPathways: ['JAK/STAT5 Transcription Arrest', 'PI3K/Akt Survival Signaling Abrogation', 'Bcl-2 Family Apoptotic Induction'],
    pkParameters: { bioavailability: '98%', volumeOfDistribution: '435 L', proteinBinding: '95%', halfLife: '18 hours (parent), 40 hours (active CGP74588 metabolite)', clearanceRoute: 'Hepatic CYP3A4 primary metabolism (81% biliary, 13% renal)', steadyStateTime: '7 days' },
    pgxConsiderations: [{ gene: 'BCR-ABL1 T315I', alleles: 'T315I gatekeeper mutation', phenotypeEffect: 'Complete steric hindrance to imatinib binding causing refractory disease', cpicDosingRecommendation: 'Switch to ponatinib or asciminib.' }],
    criticalAdverseEffects: ['Periorbital edema and systemic fluid retention', 'Myelosuppression (neutropenia, thrombocytopenia)', 'Hepatotoxicity'],
    contraindications: ['Severe hypersensitivity to imatinib'],
    clinicalTrialsReferences: [{ title: 'International Randomized Study of Interferon versus STI571 (IRIS Trial 10-Year Follow-up)', journalOrTrialId: 'N Engl J Med 2017; 376: 917-927', year: 2017, evidenceTier: 'established' }]
  },
  {
    id: 'drug-dasatinib',
    genericName: 'Dasatinib',
    brandNames: ['Sprycel'],
    therapeuticClass: 'Second-Generation Dual BCR-ABL and SRC Family Kinase Inhibitor',
    targetSuperfamily: 'Non-Receptor & Receptor Tyrosine Kinase',
    specialty: 'oncology',
    fdaApprovalYear: 2006,
    approvedIndications: ['Ph+ CML in Chronic, Accelerated, or Blast Phase', 'Ph+ ALL with Resistance or Intolerance to Prior Therapy'],
    mechanismOfAction: 'Potent, multi-targeted kinase inhibitor 325 times more potent than imatinib in vitro. Binds both the active and inactive conformations of BCR-ABL1 and inhibits SRC family kinases (LYN, FYN, HCK).',
    molecularTargets: [
      { name: 'BCR-ABL1', type: 'Tyrosine Kinase', action: 'Dual Conformation Inhibitor', bindingAffinity: 'IC50 = 0.6 nM' },
      { name: 'SRC Family Kinases (SRC, LCK, YES, FYN)', type: 'Non-receptor Tyrosine Kinase', action: 'Potent Inhibitor', bindingAffinity: 'IC50 = 0.5 nM' }
    ],
    biologicalPathways: ['SRC-Mediated Cytoskeletal Signaling Disruption', 'Leukemic Blast Apoptosis'],
    pkParameters: { bioavailability: 'Absorption dependent on gastric pH; decreased by PPIs/H2RAs', volumeOfDistribution: '2505 L', proteinBinding: '96%', halfLife: '3 to 5 hours', clearanceRoute: 'Hepatic CYP3A4 oxidation; 85% fecal, 4% renal', steadyStateTime: '3 days' },
    pgxConsiderations: [{ gene: 'BCR-ABL1 T315I', alleles: 'T315I resistant', phenotypeEffect: 'Ineffective against T315I mutant clones', cpicDosingRecommendation: 'Switch to ponatinib.' }],
    criticalAdverseEffects: ['Pleural and pericardial effusions (fluid accumulation in 15-30%)', 'Pulmonary Arterial Hypertension (PAH)', 'Severe myelosuppression and bleeding diathesis'],
    contraindications: ['Hypersensitivity to dasatinib'],
    clinicalTrialsReferences: [{ title: 'Dasatinib versus imatinib in newly diagnosed chronic-phase chronic myeloid leukemia (DASISION)', journalOrTrialId: 'N Engl J Med 2010; 363: 251-260', year: 2010, evidenceTier: 'established' }]
  },
  {
    id: 'drug-nilotinib',
    genericName: 'Nilotinib Hydrochloride',
    brandNames: ['Tasigna'],
    therapeuticClass: 'Second-Generation BCR-ABL Kinase Inhibitor',
    targetSuperfamily: 'Non-Receptor & Receptor Tyrosine Kinase',
    specialty: 'oncology',
    fdaApprovalYear: 2007,
    approvedIndications: ['Newly Diagnosed Ph+ CML in Chronic Phase', 'Resistant or Intolerant Ph+ CML'],
    mechanismOfAction: 'Conformation-selective BCR-ABL inhibitor with 20- to 50-fold higher potency than imatinib, binding to the closed, inactive conformation of BCR-ABL1.',
    molecularTargets: [{ name: 'BCR-ABL1', type: 'Tyrosine Kinase', action: 'Selective Inactive-Conformation Inhibitor', bindingAffinity: 'IC50 = 20 nM' }],
    biologicalPathways: ['Leukemic Cell Cycle Arrest', 'Apoptotic Induction'],
    pkParameters: { bioavailability: '30% (fasting); increased by 82% with high-fat food (MUST BE TAKEN ON EMPTY STOMACH)', volumeOfDistribution: 'High', proteinBinding: '98%', halfLife: '17 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism; >90% fecal excretion', steadyStateTime: '8 days' },
    pgxConsiderations: [{ gene: 'UGT1A1', alleles: '*28', phenotypeEffect: 'Increased risk of hyperbilirubinemia', cpicDosingRecommendation: 'Monitor total and direct bilirubin.' }],
    criticalAdverseEffects: ['QTc prolongation and sudden cardiac death (Boxed Warning: must avoid with food and QTc-prolonging drugs)', 'Peripheral arterial occlusive disease (PAOD) and ischemic cerebrovascular events', 'Pancreatitis with lipase/amylase elevation'],
    contraindications: ['Hypokalemia, hypomagnesemia, or long QT syndrome', 'Administration with food (Boxed Warning)'],
    clinicalTrialsReferences: [{ title: 'Nilotinib versus imatinib for the treatment of patients with newly diagnosed chronic myeloid leukemia (ENESTnd)', journalOrTrialId: 'N Engl J Med 2010; 362: 2260-2270', year: 2010, evidenceTier: 'established' }]
  },
  {
    id: 'drug-ponatinib',
    genericName: 'Ponatinib Hydrochloride',
    brandNames: ['Iclusig'],
    therapeuticClass: 'Third-Generation Pan-BCR-ABL Kinase Inhibitor',
    targetSuperfamily: 'Non-Receptor & Receptor Tyrosine Kinase',
    specialty: 'oncology',
    fdaApprovalYear: 2012,
    approvedIndications: ['Ph+ CML or ALL with T315I Mutation', 'CML/ALL Resistant or Intolerant to at least 2 Prior TKIs'],
    mechanismOfAction: 'Engineered with a carbon-carbon triple bond (ethynyl linkage) that sterically accommodates and circumvents the bulky isoleucine side chain of the BCR-ABL1 T315I "gatekeeper" mutation, potently inhibiting wild-type and all known mutant forms of BCR-ABL1.',
    molecularTargets: [
      { name: 'BCR-ABL1 (including T315I Gatekeeper)', type: 'Tyrosine Kinase', action: 'Triple-Bond Steric Bypass Inhibitor', bindingAffinity: 'IC50 = 0.37 nM' },
      { name: 'VEGFR, FGFR, PDGFR, FLT3, KIT', type: 'Multi-Kinase Family', action: 'Broad Inhibitor', bindingAffinity: 'IC50 = 1-10 nM' }
    ],
    biologicalPathways: ['T315I-Refractory Leukemic Rescue', 'Pan-Kinase Proliferation Blockade'],
    pkParameters: { bioavailability: 'High', volumeOfDistribution: '1101 L', proteinBinding: '>99%', halfLife: '24 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism; 87% fecal, 5% urine', steadyStateTime: '3 to 5 days' },
    pgxConsiderations: [{ gene: 'BCR-ABL1', alleles: 'T315I mutant', phenotypeEffect: 'Primary indicated population with high molecular response', cpicDosingRecommendation: 'Pivotal target allele.' }],
    criticalAdverseEffects: ['Arterial occlusive events (myocardial infarction, stroke, limb ischemia in up to 35% - Boxed Warning)', 'Venous thromboembolism (Boxed Warning)', 'Heart failure and severe hepatotoxicity', 'Pancreatitis'],
    contraindications: ['Known hypersensitivity; strict cardiovascular risk-benefit assessment required'],
    clinicalTrialsReferences: [{ title: 'Ponatinib in refractory Philadelphia chromosome-positive leukemias (PACE Trial)', journalOrTrialId: 'N Engl J Med 2013; 369: 1783-1796', year: 2013, evidenceTier: 'established' }]
  },

  // 3. VEGFR & Multi-Kinase Angiogenesis Inhibitors
  {
    id: 'drug-sunitinib',
    genericName: 'Sunitinib Malate',
    brandNames: ['Sutent'],
    therapeuticClass: 'Multi-Targeted Receptor Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase - VEGFR / PDGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2006,
    approvedIndications: ['Advanced Renal Cell Carcinoma (RCC)', 'GIST Resistant to Imatinib', 'Pancreatic Neuroendocrine Tumors (pNET)'],
    mechanismOfAction: 'Inhibits multiple receptor tyrosine kinases implicated in tumor growth, pathologic angiogenesis, and metastatic progression: VEGFR-1, VEGFR-2, VEGFR-3, PDGFR-alpha, PDGFR-beta, KIT, FLT3, and RET.',
    molecularTargets: [
      { name: 'VEGFR-1, VEGFR-2, VEGFR-3', type: 'Receptor Tyrosine Kinase', action: 'Competitive Inhibitor', bindingAffinity: 'Ki = 2-10 nM' },
      { name: 'PDGFR-alpha / PDGFR-beta', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'Ki = 8 nM' },
      { name: 'c-KIT (CD117)', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'Ki = 1 nM' }
    ],
    biologicalPathways: ['Tumor Angiogenesis Shutdown', 'Pericyte Detachment & Endothelial Apoptosis'],
    pkParameters: { bioavailability: 'Unaffected by food', volumeOfDistribution: '2230 L', proteinBinding: '95% (sunitinib), 90% (active desethyl metabolite SU12662)', halfLife: '40 to 60 hours (sunitinib), 80 to 110 hours (metabolite)', clearanceRoute: 'Hepatic CYP3A4 primary metabolism; 61% fecal, 16% urine', steadyStateTime: '10 to 14 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Hepatotoxicity and fatal liver failure (Boxed Warning)', 'Severe hypertension and Left Ventricular Dysfunction', 'Hand-Foot Skin Reaction (palmar-plantar erythrodysesthesia)', 'Yellow skin and hair depigmentation (intrinsic dye property)', 'Thyroid dysfunction (hypothyroidism in up to 80%)'],
    contraindications: ['Severe hepatic impairment without dose adjustment'],
    clinicalTrialsReferences: [{ title: 'Sunitinib versus interferon alfa in metastatic renal-cell carcinoma', journalOrTrialId: 'N Engl J Med 2007; 356: 115-124', year: 2007, evidenceTier: 'established' }]
  },
  {
    id: 'drug-pazopanib',
    genericName: 'Pazopanib Hydrochloride',
    brandNames: ['Votrient'],
    therapeuticClass: 'Multi-Kinase Angiogenesis Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase - VEGFR / PDGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2009,
    approvedIndications: ['Advanced Renal Cell Carcinoma', 'Advanced Soft Tissue Sarcoma'],
    mechanismOfAction: 'Second-generation multi-tyrosine kinase inhibitor targeting VEGFR-1, -2, -3, PDGFR-alpha, -beta, and c-KIT, starving tumors of oxygen and nutrients.',
    molecularTargets: [{ name: 'VEGFR-1/2/3, PDGFR, c-KIT', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 10-30 nM' }],
    biologicalPathways: ['Angiogenic Capillary Bed Regression', 'Tumor Hypoxia Induction'],
    pkParameters: { bioavailability: 'Absorption doubles with food (MUST BE TAKEN ON EMPTY STOMACH)', volumeOfDistribution: 'High', proteinBinding: '>99%', halfLife: '30.9 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism; primarily fecal excretion', steadyStateTime: '7 days' },
    pgxConsiderations: [{ gene: 'UGT1A1', alleles: '*28', phenotypeEffect: 'Increased incidence of hyperbilirubinemia', cpicDosingRecommendation: 'Monitor bilirubin and transaminases.' }],
    criticalAdverseEffects: ['Severe and fatal hepatotoxicity (Boxed Warning)', 'Hypertension and hypertensive crisis', 'Gastrointestinal perforation and fistula formation', 'Hair color depigmentation'],
    contraindications: ['Severe hepatic impairment'],
    clinicalTrialsReferences: [{ title: 'Pazopanib versus sunitinib in metastatic renal-cell carcinoma (COMPARZ)', journalOrTrialId: 'N Engl J Med 2013; 369: 722-731', year: 2013, evidenceTier: 'established' }]
  },
  {
    id: 'drug-lenvatinib',
    genericName: 'Lenvatinib Mesylate',
    brandNames: ['Lenvima'],
    therapeuticClass: 'Multi-Kinase Inhibitor of VEGFR, FGFR, RET, KIT',
    targetSuperfamily: 'Receptor Tyrosine Kinase - VEGFR / FGFR',
    specialty: 'oncology',
    fdaApprovalYear: 2015,
    approvedIndications: ['Differentiated Thyroid Cancer (Refractory to Radioactive Iodine)', 'Unresectable Hepatocellular Carcinoma (HCC)', 'Advanced RCC (with Pembrolizumab or Everolimus)', 'Advanced Endometrial Carcinoma (with Pembrolizumab)'],
    mechanismOfAction: 'Unique binding mode (Type V kinase inhibitor) that simultaneously engages the ATP-binding pocket and adjacent allosteric site of VEGFR2. Uniquely co-inhibits FGFR1-4, overcoming secondary angiogenic escape pathways.',
    molecularTargets: [
      { name: 'VEGFR-1, VEGFR-2, VEGFR-3', type: 'Receptor Tyrosine Kinase', action: 'Type V Allosteric/ATP Inhibitor', bindingAffinity: 'IC50 = 4 nM' },
      { name: 'FGFR-1, FGFR-2, FGFR-3, FGFR-4', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 22-61 nM' },
      { name: 'RET, KIT, PDGFR-alpha', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 10-100 nM' }
    ],
    biologicalPathways: ['VEGFR/FGFR Dual Angiogenic Blockade', 'Tumor Vascular Normalization & T-cell Infiltration'],
    pkParameters: { bioavailability: '85%', volumeOfDistribution: '43.2 to 92.1 L', proteinBinding: '98% to 99%', halfLife: '28 hours', clearanceRoute: 'Hepatic CYP3A4 and aldehyde oxidase metabolism; 64% feces, 25% urine', steadyStateTime: '7 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Severe hypertension (in up to 73% of patients; requires proactive antihypertensive therapy)', 'Proteinuria and nephrotic syndrome', 'Cardiac dysfunction and arterial thromboembolism', 'Palmar-plantar erythrodysesthesia and significant weight loss'],
    contraindications: ['Severe uncontrolled hypertension'],
    clinicalTrialsReferences: [
      { title: 'Lenvatinib versus Placebo in Radioiodine-Refractory Thyroid Cancer (SELECT)', journalOrTrialId: 'N Engl J Med 2015; 372: 621-630', year: 2015, evidenceTier: 'established' },
      { title: 'Lenvatinib versus sorafenib in first-line treatment of patients with unresectable hepatocellular carcinoma (REFLECT)', journalOrTrialId: 'Lancet 2018; 391: 1163-1173', year: 2018, evidenceTier: 'established' }
    ]
  },

  // 4. BRAF & MEK Pathway Inhibitors
  {
    id: 'drug-dabrafenib',
    genericName: 'Dabrafenib Mesylate',
    brandNames: ['Tafinlar'],
    therapeuticClass: 'Mutant BRAF V600 Kinase Inhibitor',
    targetSuperfamily: 'Serine/Threonine Kinase - RAF Family',
    specialty: 'oncology',
    fdaApprovalYear: 2013,
    approvedIndications: ['Unresectable or Metastatic Melanoma with BRAF V600E Mutation (with Trametinib)', 'BRAF V600E-Mutant Metastatic NSCLC', 'Anaplastic Thyroid Cancer with BRAF V600E', 'BRAF V600E Solid Tumors'],
    mechanismOfAction: 'Selective, ATP-competitive inhibitor of mutated BRAF V600E, V600K, and V600D kinases, terminating constitutive hyperactivation of downstream MEK and ERK kinases in tumor cells.',
    molecularTargets: [
      { name: 'BRAF V600E Mutant Kinase', type: 'Serine/Threonine Kinase', action: 'Selective ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 0.65 nM' },
      { name: 'CRAF / Wild-Type BRAF', type: 'Serine/Threonine Kinase', action: 'Inhibitor (Paradoxical Activation in RAS-mutant cells)', bindingAffinity: 'IC50 = 1.9-5 nM' }
    ],
    biologicalPathways: ['MAPK Hyperactivation Shutdown', 'Melanoma Cell Cycle G1 Arrest'],
    pkParameters: { bioavailability: '95% (fasting; decreased with food)', volumeOfDistribution: '70.3 L', proteinBinding: '99.7%', halfLife: '8 hours', clearanceRoute: 'Hepatic CYP2C8 and CYP3A4 oxidation to active hydroxy-dabrafenib; acts as CYP3A4 inducer', steadyStateTime: '2 days' },
    pgxConsiderations: [{ gene: 'BRAF', alleles: 'V600E / V600K', phenotypeEffect: 'Mandatory biomarker for indication', cpicDosingRecommendation: 'Prescribed exclusively for confirmed BRAF V600 mutation.' }],
    criticalAdverseEffects: ['Pyrexia / severe high fever syndrome in >50% (often managed with dose interruption)', 'Cutaneous squamous cell carcinoma and keratoacanthoma (due to paradoxical MAPK activation in wild-type cells; mitigated by adding MEK inhibitor trametinib)', 'Hyperglycemia and uveitis'],
    contraindications: ['Wild-type BRAF tumors (promotes tumor growth)'],
    clinicalTrialsReferences: [{ title: 'Improved survival with dabrafenib in advanced melanoma (BREAK-3)', journalOrTrialId: 'Lancet 2012; 380: 358-365', year: 2012, evidenceTier: 'established' }]
  },
  {
    id: 'drug-trametinib',
    genericName: 'Trametinib Dimethyl Sulfoxide',
    brandNames: ['Mekinist'],
    therapeuticClass: 'Allosteric MEK1/MEK2 Kinase Inhibitor',
    targetSuperfamily: 'Dual-Specificity Kinase - MAP2K',
    specialty: 'oncology',
    fdaApprovalYear: 2013,
    approvedIndications: ['BRAF V600E/K Mutant Melanoma (in combination with Dabrafenib)', 'BRAF-Mutant NSCLC, Thyroid Cancer, and Solid Tumors'],
    mechanismOfAction: 'Reversible, highly selective, allosteric non-ATP-competitive inhibitor of mitogen-activated extracellular signal-regulated kinase 1 (MEK1) and MEK2 activation and kinase activity. Blocks downstream ERK phosphorylation and prevents paradoxical MAPK reactivation.',
    molecularTargets: [{ name: 'MEK1 and MEK2 (MAP2K1 / MAP2K2)', type: 'Dual Specificity Threonine/Tyrosine Kinase', action: 'Allosteric Non-Competitive Inhibitor', bindingAffinity: 'IC50 = 0.92 nM' }],
    biologicalPathways: ['Dual MAPK Pathway Interruption', 'Attenuation of Secondary Cutaneous Malignancies from RAF Inhibitors'],
    pkParameters: { bioavailability: '72%', volumeOfDistribution: '214 L', proteinBinding: '97.4%', halfLife: '127 hours (approx 5.3 days; long accumulation phase)', clearanceRoute: 'Deacetylation and non-enzymatic degradation; minimal CYP involvement; 80% fecal, <19% urine', steadyStateTime: '15 to 20 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Cardiomyopathy / decreased LVEF', 'Retinal pigment epithelial detachment (RPED) and retinal vein occlusion (RVO)', 'Interstitial lung disease / pneumonitis', 'Severe rash and diarrhea'],
    contraindications: ['Known hypersensitivity to trametinib'],
    clinicalTrialsReferences: [{ title: 'Combined dabrafenib and trametinib in metastatic melanoma with BRAF V600 mutations', journalOrTrialId: 'N Engl J Med 2012; 367: 1694-1703', year: 2012, evidenceTier: 'established' }]
  },

  // 5. CDK4/6 Cell Cycle Inhibitors
  {
    id: 'drug-palbociclib',
    genericName: 'Palbociclib',
    brandNames: ['Ibrance'],
    therapeuticClass: 'Selective Cyclin-Dependent Kinase 4 and 6 (CDK4/6) Inhibitor',
    targetSuperfamily: 'Serine/Threonine Kinase - CDK Family',
    specialty: 'oncology',
    fdaApprovalYear: 2015,
    approvedIndications: ['HR-Positive, HER2-Negative Advanced or Metastatic Breast Cancer (with Aromatase Inhibitor or Fulvestrant)'],
    mechanismOfAction: 'Competitively blocks the ATP-binding sites of CDK4 and CDK6, preventing cyclin D1 complex formation, blocking Retinoblastoma (Rb) protein phosphorylation, and arresting tumor cells in the G1 phase of the cell cycle.',
    molecularTargets: [
      { name: 'Cyclin-Dependent Kinase 4 (CDK4)', type: 'Serine/Threonine Kinase', action: 'Selective ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 11 nM' },
      { name: 'Cyclin-Dependent Kinase 6 (CDK6)', type: 'Serine/Threonine Kinase', action: 'Selective ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 15 nM' }
    ],
    biologicalPathways: ['Retinoblastoma (Rb) Tumor Suppressor Hypophosphorylation', 'G1-to-S Phase Cell Cycle Checkpoint Arrest'],
    pkParameters: { bioavailability: '46% (oral capsule absorption improves with food; tablet formulation unaffected)', volumeOfDistribution: '2583 L', proteinBinding: '85%', halfLife: '29 hours', clearanceRoute: 'Hepatic CYP3A4 oxidation and SULT2A1 sulfation; 74% fecal, 17% urine', steadyStateTime: '8 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Dose-limiting neutropenia (grade 3/4 in 65%; cytostatic rather than apoptotic - rapid recovery on 7-day off schedule)', 'Infections and interstitial lung disease', 'Fatigue and alopecia'],
    contraindications: ['Severe hypersensitivity to palbociclib'],
    clinicalTrialsReferences: [
      { title: 'Palbociclib and Letrozole in Advanced Breast Cancer (PALOMA-2)', journalOrTrialId: 'N Engl J Med 2016; 375: 1925-1936', year: 2016, evidenceTier: 'established' },
      { title: 'Fulvestrant plus Palbociclib in HR-Positive Breast Cancer (PALOMA-3)', journalOrTrialId: 'N Engl J Med 2015; 373: 209-219', year: 2015, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-ribociclib',
    genericName: 'Ribociclib Succinate',
    brandNames: ['Kisqali'],
    therapeuticClass: 'Selective CDK4/6 Inhibitor',
    targetSuperfamily: 'Serine/Threonine Kinase - CDK Family',
    specialty: 'oncology',
    fdaApprovalYear: 2017,
    approvedIndications: ['HR-Positive, HER2-Negative Advanced Breast Cancer', 'Early Breast Cancer at High Risk of Recurrence (Adjuvant)'],
    mechanismOfAction: 'Selective inhibitor of CDK4 and CDK6, with 8-fold higher biochemical potency against CDK4 than CDK6, preventing phosphorylation of Rb protein and restoring G1/S cell cycle checkpoint control.',
    molecularTargets: [{ name: 'CDK4 and CDK6', type: 'Serine/Threonine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 10 nM (CDK4), 39 nM (CDK6)' }],
    biologicalPathways: ['Cell Cycle Checkpoint Activation', 'E2F Transcription Factor Repression'],
    pkParameters: { bioavailability: 'High absorption', volumeOfDistribution: '1090 L', proteinBinding: '70%', halfLife: '32 to 55 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism', steadyStateTime: '8 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Dose-dependent QTc prolongation (routine ECG monitoring mandatory)', 'Hepatotoxicity (AST/ALT elevations in up to 15%)', 'Neutropenia and leukopenia'],
    contraindications: ['Baseline QTc > 450 ms'],
    clinicalTrialsReferences: [{ title: 'Overall Survival with Ribociclib plus Endocrine Therapy in Breast Cancer (MONALEESA-2)', journalOrTrialId: 'N Engl J Med 2022; 386: 942-950', year: 2022, evidenceTier: 'established' }]
  },

  // 6. Bruton Tyrosine Kinase (BTK) Inhibitors
  {
    id: 'drug-ibrutinib',
    genericName: 'Ibrutinib',
    brandNames: ['Imbruvica'],
    therapeuticClass: 'First-in-Class Covalent Bruton Tyrosine Kinase (BTK) Inhibitor',
    targetSuperfamily: 'Non-Receptor Tyrosine Kinase - Tec Family',
    specialty: 'oncology',
    fdaApprovalYear: 2013,
    approvedIndications: ['Chronic Lymphocytic Leukemia (CLL) / Small Lymphocytic Lymphoma (SLL)', 'Waldenström Macroglobulinemia', 'Chronic Graft-versus-Host Disease (cGVHD)'],
    mechanismOfAction: 'Forms an irreversible covalent bond with the Cys481 residue in the ATP-binding site of Bruton Tyrosine Kinase (BTK), completely blocking B-cell antigen receptor (BCR) signaling, homing, and adhesion in mature B-cell malignancies.',
    molecularTargets: [
      { name: 'Bruton Tyrosine Kinase (BTK)', type: 'Tec Family Kinase', action: 'Irreversible Covalent Cys481 Inhibitor', bindingAffinity: 'IC50 = 0.5 nM' },
      { name: 'Off-target Kinases (TEC, ITK, EGFR, ERBB4)', type: 'Kinase Family', action: 'Irreversible Inhibitor (Causes cardiac arrhythmias and bleeding)', bindingAffinity: 'IC50 = 2-10 nM' }
    ],
    biologicalPathways: ['B-Cell Receptor (BCR) Survival Cascade Inactivation', 'NF-kappaB Transcription Arrest', 'Lymph Node Lymphocytosis Mobilization'],
    pkParameters: { bioavailability: 'Rapid oral absorption; increased 2- to 4-fold with food', volumeOfDistribution: '10000 L (very high tissue distribution)', proteinBinding: '97.3%', halfLife: '4 to 6 hours', clearanceRoute: 'Extensive hepatic CYP3A4 oxidation to dihydrodiol metabolite; 80% feces, <10% urine', steadyStateTime: '1 day' },
    pgxConsiderations: [{ gene: 'BTK C481S', alleles: 'Cys481Ser mutation', phenotypeEffect: 'Disrupts covalent bonding, causing high-level clinical resistance', cpicDosingRecommendation: 'Switch to non-covalent BTK inhibitor (Pirtobrutinib).' }],
    criticalAdverseEffects: ['Atrial fibrillation and flutter (in 6-16% due to off-target inhibition of cardiac TEC kinase)', 'Major bleeding diathesis (platelet aggregation defect via off-target collagen signaling)', 'Severe hypertension and opportunistic infections'],
    contraindications: ['Concurrent strong CYP3A inhibitors without dose modification'],
    clinicalTrialsReferences: [
      { title: 'Targeting BTK with ibrutinib in relapsed chronic lymphocytic leukemia (RESONATE)', journalOrTrialId: 'N Engl J Med 2014; 371: 213-223', year: 2014, evidenceTier: 'established' },
      { title: 'Ibrutinib for previously untreated chronic lymphocytic leukemia (RESONATE-2)', journalOrTrialId: 'N Engl J Med 2015; 373: 2425-2437', year: 2015, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-acalabrutinib',
    genericName: 'Acalabrutinib',
    brandNames: ['Calquence'],
    therapeuticClass: 'Second-Generation Highly Selective Covalent BTK Inhibitor',
    targetSuperfamily: 'Non-Receptor Tyrosine Kinase - Tec Family',
    specialty: 'oncology',
    fdaApprovalYear: 2017,
    approvedIndications: ['Chronic Lymphocytic Leukemia / Small Lymphocytic Lymphoma', 'Mantle Cell Lymphoma'],
    mechanismOfAction: 'Second-generation covalent BTK inhibitor engineered with much higher selectivity for BTK over off-target kinases (EGFR, ITK, TEC), yielding lower rates of atrial fibrillation, hypertension, and bleeding.',
    molecularTargets: [{ name: 'Bruton Tyrosine Kinase (BTK)', type: 'Tec Family Kinase', action: 'Selective Covalent Cys481 Inhibitor', bindingAffinity: 'IC50 = 3 nM' }],
    biologicalPathways: ['BCR Axis Silencing', 'Cardiovascular Sparing'],
    pkParameters: { bioavailability: '25% (oral absorption pH-dependent with capsule; maleate tablet formulation co-administered safely with PPIs)', volumeOfDistribution: '34 L', proteinBinding: '97.5%', halfLife: '1 hour (parent), 3.5 hours (active ACP-5862 metabolite)', clearanceRoute: 'Hepatic CYP3A4 oxidation; 84% feces, 12% urine', steadyStateTime: 'Immediate daily steady state' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Headache (common, usually self-resolving within 1-2 weeks)', 'Neutropenia and infection', 'Atrial fibrillation (significantly lower than ibrutinib)'],
    contraindications: ['Severe hypersensitivity to acalabrutinib'],
    clinicalTrialsReferences: [{ title: 'Acalabrutinib versus Ibrutinib in Previously Treated Chronic Lymphocytic Leukemia (ELEVATE-RR)', journalOrTrialId: 'J Clin Oncol 2021; 39: 3441-3452', year: 2021, evidenceTier: 'established' }]
  },

  // 7. Janus Kinase (JAK) Inhibitors
  {
    id: 'drug-tofacitinib',
    genericName: 'Tofacitinib Citrate',
    brandNames: ['Xeljanz', 'Xeljanz XR'],
    therapeuticClass: 'Janus Kinase (JAK) Inhibitor',
    targetSuperfamily: 'Non-Receptor Tyrosine Kinase - JAK Family',
    specialty: 'immunology',
    fdaApprovalYear: 2012,
    approvedIndications: ['Rheumatoid Arthritis', 'Psoriatic Arthritis', 'Ulcerative Colitis', 'Ankylosing Spondylitis', 'Polyarticular Course Juvenile Idiopathic Arthritis'],
    mechanismOfAction: 'Inhibits Janus kinases (primarily JAK1 and JAK3, and to a lesser extent JAK2), disrupting the phosphorylation and dimerization of STAT transcription factors and terminating inflammatory cytokine signaling (IL-2, IL-4, IL-6, IL-7, IL-9, IL-15, IL-21, and interferons).',
    molecularTargets: [
      { name: 'Janus Kinase 1 (JAK1)', type: 'Non-receptor Tyrosine Kinase', action: 'ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 3.2 nM' },
      { name: 'Janus Kinase 3 (JAK3)', type: 'Non-receptor Tyrosine Kinase', action: 'ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 1.6 nM' },
      { name: 'Janus Kinase 2 (JAK2)', type: 'Non-receptor Tyrosine Kinase', action: 'Moderate Inhibitor', bindingAffinity: 'IC50 = 4.1 nM' }
    ],
    biologicalPathways: ['JAK-STAT Inflammatory Transcription Arrest', 'Common Gamma-Chain Cytokine Signaling Interruption', 'Synovial Pannus Proliferation Halting'],
    pkParameters: { bioavailability: '74%', volumeOfDistribution: '87 L', proteinBinding: '40%', halfLife: '3 hours', clearanceRoute: '70% Hepatic CYP3A4/CYP2C19 metabolism, 30% Renal excretion unchanged', steadyStateTime: '1 to 2 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: [
      'Serious cardiovascular events (MACE) and stroke (FDA Boxed Warning)',
      'Venous Thromboembolism (DVT and PE - Boxed Warning)',
      'Serious opportunistic infections including tuberculosis and herpes zoster (Boxed Warning)',
      'Malignancies and lymphomas (Boxed Warning)'
    ],
    contraindications: ['Active serious systemic infections or untreated latent tuberculosis', 'Severe hepatic impairment'],
    clinicalTrialsReferences: [
      { title: 'Cardiovascular and Cancer Risk with Tofacitinib in Rheumatoid Arthritis (ORAL Surveillance)', journalOrTrialId: 'N Engl J Med 2022; 386: 316-326', year: 2022, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-ruxolitinib',
    genericName: 'Ruxolitinib Phosphate',
    brandNames: ['Jakafi', 'Opzelura (topical)'],
    therapeuticClass: 'Selective JAK1 and JAK2 Inhibitor',
    targetSuperfamily: 'Non-Receptor Tyrosine Kinase - JAK Family',
    specialty: 'hematology',
    fdaApprovalYear: 2011,
    approvedIndications: ['Intermediate or High-Risk Myelofibrosis', 'Polycythemia Vera Resistant to Hydroxyurea', 'Acute and Chronic Graft-versus-Host Disease (GVHD)', 'Atopic Dermatitis & Vitiligo (Topical Opzelura)'],
    mechanismOfAction: 'Potently and selectively inhibits JAK1 and JAK2 kinases, blocking dysregulated signaling downstream of thrombopoietin, erythropoietin, and inflammatory cytokines, shrinking splenomegaly and dampening constitutional symptoms.',
    molecularTargets: [
      { name: 'Janus Kinase 1 (JAK1)', type: 'Non-receptor Tyrosine Kinase', action: 'Competitive Inhibitor', bindingAffinity: 'IC50 = 3.3 nM' },
      { name: 'Janus Kinase 2 (JAK2, including V617F mutant)', type: 'Non-receptor Tyrosine Kinase', action: 'Competitive Inhibitor', bindingAffinity: 'IC50 = 2.8 nM' }
    ],
    biologicalPathways: ['Myeloproliferative Splenomegaly Regression', 'Pro-inflammatory Cytokine Suppression'],
    pkParameters: { bioavailability: '95%', volumeOfDistribution: '72 L', proteinBinding: '97%', halfLife: '3 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism; 74% urine metabolites, 22% feces', steadyStateTime: '1 to 2 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Dose-dependent thrombocytopenia and anemia (routine CBC monitoring essential)', 'Severe rebound symptom flare upon abrupt cessation (must taper)', 'Opportunistic infections (herpes zoster, progressive multifocal leukoencephalopathy)'],
    contraindications: ['Platelet count < 50 x 10^9/L prior to initiation'],
    clinicalTrialsReferences: [{ title: 'A double-blind, placebo-controlled trial of ruxolitinib for myelofibrosis (COMFORT-I)', journalOrTrialId: 'N Engl J Med 2012; 366: 799-807', year: 2012, evidenceTier: 'established' }]
  },
  {
    id: 'drug-upadacitinib',
    genericName: 'Upadacitinib',
    brandNames: ['Rinvoq'],
    therapeuticClass: 'Second-Generation Selective JAK1 Inhibitor',
    targetSuperfamily: 'Non-Receptor Tyrosine Kinase - JAK Family',
    specialty: 'immunology',
    fdaApprovalYear: 2019,
    approvedIndications: ['Rheumatoid Arthritis', 'Psoriatic Arthritis', 'Ankylosing Spondylitis', 'Atopic Dermatitis', 'Ulcerative Colitis', 'Crohn\'s Disease'],
    mechanismOfAction: 'Second-generation engineered small molecule with >50-fold biochemical selectivity for JAK1 over JAK2, JAK3, and TYK2, providing anti-inflammatory immunosuppression while minimizing JAK2-dependent erythropoietic suppression.',
    molecularTargets: [{ name: 'Janus Kinase 1 (JAK1)', type: 'Non-receptor Tyrosine Kinase', action: 'Highly Selective Inhibitor', bindingAffinity: 'IC50 = 43 nM (vs >2000 nM for JAK2/3)' }],
    biologicalPathways: ['Selective Pro-inflammatory Cytokine Interruption', 'Erythropoietin Signaling Sparing'],
    pkParameters: { bioavailability: 'Extended release formulation provides 24h plasma plateau', volumeOfDistribution: '224 L', proteinBinding: '52%', halfLife: '9 to 14 hours', clearanceRoute: 'Hepatic CYP3A4 metabolism (major) and CYP2D6 (minor); 53% feces, 43% urine', steadyStateTime: '4 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Boxed Warning class risks: MACE, deep vein thrombosis, pulmonary embolism, serious infections, malignancies', 'Herpes zoster reactivation (shingles in up to 5%)', 'Elevations in serum lipids (LDL/HDL) and liver enzymes'],
    contraindications: ['Active tuberculosis or serious systemic infection', 'Severe hepatic impairment'],
    clinicalTrialsReferences: [{ title: 'Upadacitinib as monotherapy in patients with active rheumatoid arthritis (SELECT-MONOTHERAPY)', journalOrTrialId: 'Lancet 2019; 393: 2304-2311', year: 2019, evidenceTier: 'established' }]
  },

  // 8. ALK & ROS1 Kinase Inhibitors
  {
    id: 'drug-alectinib',
    genericName: 'Alectinib Hydrochloride',
    brandNames: ['Alecensa'],
    therapeuticClass: 'Second-Generation ALK Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase - ALK Family',
    specialty: 'oncology',
    fdaApprovalYear: 2015,
    approvedIndications: ['First-Line Treatment of ALK-Positive Metastatic NSCLC', 'Adjuvant Treatment of Resected ALK-Positive NSCLC'],
    mechanismOfAction: 'Potent and selective inhibitor of anaplastic lymphoma kinase (ALK) and RET. Unlike crizotinib, it is not a substrate for P-glycoprotein, allowing robust blood-brain barrier penetration and high central nervous system response rates.',
    molecularTargets: [
      { name: 'Anaplastic Lymphoma Kinase (ALK Fusion Oncoproteins, e.g. EML4-ALK)', type: 'Receptor Tyrosine Kinase', action: 'Selective ATP-Competitive Inhibitor', bindingAffinity: 'IC50 = 1.9 nM' },
      { name: 'RET Kinase', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor', bindingAffinity: 'IC50 = 4.8 nM' }
    ],
    biologicalPathways: ['CNS Metastatic Progression Halt', 'EML4-ALK Oncogenic Driver Inhibition'],
    pkParameters: { bioavailability: '37% (with high-fat meal; MUST BE TAKEN WITH FOOD)', volumeOfDistribution: '475 L', proteinBinding: '>99%', halfLife: '33 hours (parent), 30 hours (active M4 metabolite)', clearanceRoute: 'Hepatic CYP3A4 oxidation to active metabolite M4; 98% fecal excretion, <0.5% urine', steadyStateTime: '7 days' },
    pgxConsiderations: [{ gene: 'ALK', alleles: 'EML4-ALK fusion variants', phenotypeEffect: 'Mandatory companion diagnostic biomarker', cpicDosingRecommendation: 'Prescribed exclusively for ALK rearrangement.' }],
    criticalAdverseEffects: ['Hepatotoxicity (AST/ALT/bilirubin elevations)', 'Bradycardia (sinus rate < 50 bpm)', 'Severe myalgia and creatine phosphokinase (CPK) elevation', 'Hemolytic anemia'],
    contraindications: ['Severe hypersensitivity to alectinib'],
    clinicalTrialsReferences: [
      { title: 'Alectinib versus Crizotinib in Untreated ALK-Positive Non-Small-Cell Lung Cancer (ALEX)', journalOrTrialId: 'N Engl J Med 2017; 377: 829-838', year: 2017, evidenceTier: 'established' }
    ]
  },

  // 9. mTOR Serine/Threonine Kinase Inhibitors
  {
    id: 'drug-everolimus',
    genericName: 'Everolimus',
    brandNames: ['Afinitor', 'Zortress'],
    therapeuticClass: 'Mechanistic Target of Rapamycin (mTOR) Inhibitor (Rapalogue)',
    targetSuperfamily: 'Serine/Threonine Kinase - PI3K/Akt/mTOR Axis',
    specialty: 'oncology',
    fdaApprovalYear: 2009,
    approvedIndications: ['Advanced HR+ HER2- Breast Cancer (with Exemestane)', 'Advanced Renal Cell Carcinoma Post-TKI', 'Progressive Neuroendocrine Tumors of GI/Lung/Pancreas', 'Prophylaxis of Organ Rejection in Renal / Liver Transplant (Zortress)'],
    mechanismOfAction: 'Binds with high affinity to intracellular immunophilin FKBP-12; the resulting complex allosterically binds mTOR Complex 1 (mTORC1), inhibiting S6 ribosomal protein kinase (S6K1) and 4E-BP1 phosphorylation, halting translation of oncogenic proteins.',
    molecularTargets: [
      { name: 'mTOR Complex 1 (mTORC1 / Serine-Threonine Kinase)', type: 'Kinase Complex', action: 'Allosteric FKBP12-Mediated Inhibitor', bindingAffinity: 'Kd = 1.6 nM' }
    ],
    biologicalPathways: ['Cap-Dependent mRNA Translation Arrest', 'Angiogenesis Suppression via HIF-1alpha Damping', 'Autophagy Induction'],
    pkParameters: { bioavailability: '20%', volumeOfDistribution: '110 L', proteinBinding: '74%', halfLife: '30 hours', clearanceRoute: 'Extensive hepatic CYP3A4 oxidation and P-gp substrate; 80% feces, 5% urine', steadyStateTime: '7 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Non-infectious pneumonitis (interstitial lung toxicity requiring corticosteroid management)', 'Severe stomatitis / oral ulceration in up to 70%', 'Metabolic hyperglycemia and severe hyperlipidemia', 'Immunosuppression and delayed wound healing'],
    contraindications: ['Severe hypersensitivity to everolimus or other rapamycin derivatives'],
    clinicalTrialsReferences: [
      { title: 'Everolimus in Postmenopausal Hormone-Receptor-Positive Advanced Breast Cancer (BOLERO-2)', journalOrTrialId: 'N Engl J Med 2012; 366: 520-529', year: 2012, evidenceTier: 'established' },
      { title: 'Efficacy of everolimus in advanced renal cell carcinoma (RECORD-1)', journalOrTrialId: 'Lancet 2008; 372: 449-456', year: 2008, evidenceTier: 'established' }
    ]
  }
];
