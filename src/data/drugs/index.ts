import { DrugMonograph } from '../../types/clinical';
import { GPCR_DRUGS } from './gpcrDrugs';
import { KINASE_DRUGS } from './kinaseDrugs';
import { ENZYME_DRUGS } from './enzymeCatalog';
import { CHANNEL_TRANSPORTER_DRUGS } from './channelTransporterCatalog';
import { BIOLOGICS_NUCLEAR_DRUGS } from './biologicsNuclearCatalog';
import { ANTIMICROBIAL_COAGULATION_DRUGS } from './antimicrobialCoagulationCatalog';
import { EXTENDED_DRUGS } from './extendedPharmacopeia';
import { TARGET_CLASSIFICATION_LIBRARY_DRUGS } from './targetClassificationLibrary';
import { TARGET_EXPANSION_DRUGS } from './pharmacopeiaExpansion';
import { MASTER_DRUG_INDEX_DRUGS } from './masterDrugIndex';
import { PRECISION_PHARMACOPEIA_300_DRUGS } from './precisionPharmacopeia300';

// Core validated benchmark drugs with exhaustive ADME & PGx dossiers
export const BENCHMARK_DRUGS: DrugMonograph[] = [
  {
    id: 'drug-metformin',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
    therapeuticClass: 'Biguanide Antihyperglycemic Agent',
    targetSuperfamily: 'Enzyme / Mitochondrial Complex - Complex I (NADH:Ubiquinone Oxidoreductase)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1994,
    approvedIndications: [
      'Type 2 Diabetes Mellitus (Monotherapy & Combination)',
      'Off-label: Polycystic Ovary Syndrome (PCOS)',
      'Off-label: Prevention of T2D in High-Risk Pre-diabetes'
    ],
    mechanismOfAction: 'Inhibits mitochondrial respiratory chain complex I, increasing cellular AMP/ATP ratio and activating 5′-AMP-activated protein kinase (AMPK). Suppresses hepatic gluconeogenesis via allosteric inhibition of fructose-1,6-bisphosphatase (FBPase-1).',
    molecularTargets: [
      { name: 'Mitochondrial Complex I (NADH:Ubiquinone Oxidoreductase)', type: 'Enzyme Complex', action: 'Inhibitor (Mild/Reversible)' },
      { name: 'AMP-activated Protein Kinase (AMPK)', type: 'Kinase', action: 'Indirect Activator' },
      { name: 'OCT2 / MATE1 / MATE2-K', type: 'Renal Transporter', action: 'Substrate' }
    ],
    biologicalPathways: [
      'Hepatic Gluconeogenesis Suppression',
      'AMPK-Mediated ACC Phosphorylation (Lipid Oxidation)',
      'GLP-1 Secretion Enhancement (L-Cells)'
    ],
    pkParameters: {
      bioavailability: '50% to 60% under fasting conditions',
      volumeOfDistribution: '654 ± 358 L (extensive tissue distribution)',
      proteinBinding: 'Negligible (<1%)',
      halfLife: '6.2 hours in normal renal function (extended to 14.8h in CKD 3b)',
      clearanceRoute: '90% Renal Tubular Secretion (Unchanged)',
      steadyStateTime: '24 to 48 hours with multiple daily doses'
    },
    pgxConsiderations: [
      {
        gene: 'SLC22A2 (OCT2)',
        alleles: '808G>T (rs316019)',
        phenotypeEffect: 'Altered renal tubular uptake and clearance',
        cpicDosingRecommendation: 'Monitor for enhanced plasma exposure; standard renal dosing bounds apply.'
      },
      {
        gene: 'SLC47A1 (MATE1)',
        alleles: 'rs2289669 G>A',
        phenotypeEffect: 'Reduced luminal extrusion into urine',
        cpicDosingRecommendation: 'Associated with heightened HbA1c response but increased GI intolerance.'
      }
    ],
    criticalAdverseEffects: [
      'Metformin-Associated Lactic Acidosis (MALA) — Risk high below eGFR 30 mL/min',
      'Vitamin B12 Deficiency with long-term use (>3 years)',
      'Gastrointestinal intolerance (diarrhea, nausea, dyspepsia) in ~20-30%'
    ],
    contraindications: [
      'eGFR < 30 mL/min/1.73m² (Absolute Contraindication)',
      'Acute or chronic metabolic acidosis (including diabetic ketoacidosis)',
      'Severe hepatic impairment or active alcohol abuse'
    ],
    clinicalTrialsReferences: [
      {
        title: 'Effect of intensive blood-glucose control with metformin on complications in overweight patients with type 2 diabetes (UKPDS 34)',
        journalOrTrialId: 'Lancet 1998; 352: 854–65',
        year: 1998,
        evidenceTier: 'established'
      },
      {
        title: 'Safety of Metformin in Patients With Chronic Kidney Disease: Systematic Review',
        journalOrTrialId: 'Ann Intern Med 2017; 166: 191–200',
        year: 2017,
        evidenceTier: 'established'
      }
    ]
  },
  {
    id: 'drug-empagliflozin',
    genericName: 'Empagliflozin',
    brandNames: ['Jardiance'],
    therapeuticClass: 'Selective Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor',
    targetSuperfamily: 'Transporter - Solute Carrier Family 5 (SLC5A2 / SGLT2)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2014,
    approvedIndications: [
      'Type 2 Diabetes Mellitus glycemic improvement',
      'Reduction of cardiovascular death in T2D and established CVD',
      'Heart Failure with reduced or preserved ejection fraction (HFrEF / HFpEF)',
      'Chronic Kidney Disease progression risk reduction (eGFR ≥20 mL/min)'
    ],
    mechanismOfAction: 'Inhibits SGLT2 in the S1 segment of renal proximal convoluted tubules, reducing renal threshold for glucose and promoting glycosuria and natriuresis. Restores tubuloglomerular feedback by increasing distal sodium delivery to the macula densa.',
    molecularTargets: [
      { name: 'SGLT2 (SLC5A2)', type: 'Transport Protein', action: 'Selective Competitive Inhibitor (IC50 = 3.1 nM)' },
      { name: 'SGLT1 (SLC5A1)', type: 'Transport Protein', action: 'Weak Inhibitor (>2500-fold selective for SGLT2)' }
    ],
    biologicalPathways: [
      'Tubuloglomerular Feedback (TGF) Activation',
      'Intraglomerular Pressure Decompression (Afferent Constriction)',
      'Renal Osmotic Diuresis & Natriuresis',
      'Myocardial Ketone Utilization Enhancement'
    ],
    pkParameters: {
      bioavailability: 'Approximately 75% rapidly absorbed',
      volumeOfDistribution: '73.8 L at steady state',
      proteinBinding: '86.2% primarily to plasma albumin',
      halfLife: '12.4 hours (consistent once-daily dosing)',
      clearanceRoute: '54.4% Fecal (Parent/Metabolites), 41.2% Urine (Glucuronidation)',
      steadyStateTime: 'Day 5 of once-daily administration'
    },
    pgxConsiderations: [
      {
        gene: 'UGT2B7 / UGT1A9',
        alleles: 'UGT2B7*2, UGT1A9*3',
        phenotypeEffect: 'Minor variations in glucuronidation clearance',
        cpicDosingRecommendation: 'No genotype-directed dose adjustments currently mandated by CPIC.'
      }
    ],
    criticalAdverseEffects: [
      'Mycotic genital infections & urinary tract infections',
      'Euglycemic Diabetic Ketoacidosis (euDKA) during surgical stress or fasting',
      'Transient volume depletion & symptomatic hypotension'
    ],
    contraindications: [
      'Patients on maintenance dialysis or end-stage kidney disease (ineffective)',
      'History of serious hypersensitivity reaction to empagliflozin'
    ],
    clinicalTrialsReferences: [
      {
        title: 'Empagliflozin in Patients with Chronic Kidney Disease (EMPA-KIDNEY)',
        journalOrTrialId: 'N Engl J Med 2023; 388: 117–127',
        year: 2023,
        evidenceTier: 'established'
      },
      {
        title: 'Empagliflozin, Cardiovascular Outcomes, and Mortality in Type 2 Diabetes (EMPA-REG OUTCOME)',
        journalOrTrialId: 'N Engl J Med 2015; 373: 2117–2128',
        year: 2015,
        evidenceTier: 'established'
      }
    ]
  },
  {
    id: 'drug-imatinib',
    genericName: 'Imatinib Mesylate',
    brandNames: ['Gleevec'],
    therapeuticClass: 'BCR-ABL Tyrosine Kinase Inhibitor (Antineoplastic)',
    targetSuperfamily: 'Tyrosine Kinase - Non-Receptor Tyrosine Kinase (BCR-ABL1 / ABL1)',
    specialty: 'oncology',
    fdaApprovalYear: 2001,
    approvedIndications: [
      'Newly diagnosed adult and pediatric Philadelphia chromosome-positive (Ph+) CML',
      'Ph+ Acute Lymphoblastic Leukemia (Ph+ ALL)',
      'c-KIT (CD117) positive Gastrointestinal Stromal Tumors (GIST)',
      'Hypereosinophilic Syndrome (HES) and Systemic Mastocytosis'
    ],
    mechanismOfAction: 'Occupies the ATP-binding cleft of the BCR-ABL1 oncoprotein kinase domain, locking it in an inactive pseudo-substrate conformation. Blocks downstream phosphorylation of STAT5, CRKL, and PI3K/Akt survival signaling cascades.',
    molecularTargets: [
      { name: 'BCR-ABL1 Fusion Kinase', type: 'Tyrosine Kinase', action: 'ATP-competitive Inhibitor (IC50 ~ 100 nM)' },
      { name: 'c-KIT (CD117)', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor' },
      { name: 'PDGFR-α and PDGFR-β', type: 'Receptor Tyrosine Kinase', action: 'Inhibitor' }
    ],
    biologicalPathways: [
      'JAK/STAT5 Transcription Arrest',
      'PI3K/Akt Survival Signaling Abrogation',
      'Bcl-2 Family Apoptotic Induction'
    ],
    pkParameters: {
      bioavailability: '98% after oral dosing',
      volumeOfDistribution: '435 L',
      proteinBinding: '95% to alpha-1-acid glycoprotein and albumin',
      halfLife: '18 hours (parent drug), 40 hours (active N-desmethyl metabolite CGP74588)',
      clearanceRoute: 'Hepatic CYP3A4 primary metabolism (81% biliary/fecal, 13% renal)',
      steadyStateTime: 'Achieved within 7 days of daily administration'
    },
    pgxConsiderations: [
      {
        gene: 'ABCB1 (P-glycoprotein / MDR1)',
        alleles: '1236C>T, 2677G>T, 3435C>T',
        phenotypeEffect: 'Altered intracellular drug accumulation in leukemic blasts',
        cpicDosingRecommendation: 'Higher molecular resistance seen in homozygous variants; monitor RT-qPCR closely.'
      },
      {
        gene: 'CYP3A4 / CYP3A5',
        alleles: 'CYP3A5*3 non-expressor',
        phenotypeEffect: 'Minor pharmacokinetic clearance variance',
        cpicDosingRecommendation: 'Avoid concurrent strong CYP3A4 inhibitors (Ketoconazole) or inducers (Rifampin).'
      }
    ],
    criticalAdverseEffects: [
      'Superficial periorbital edema and fluid retention',
      'Myelosuppression (neutropenia, thrombocytopenia, anemia)',
      'Hepatotoxicity with transaminase elevation'
    ],
    contraindications: [
      'Severe hypersensitivity to imatinib mesylate',
      'Concomitant administration with St. John\'s Wort (profoundly decreases AUC)'
    ],
    clinicalTrialsReferences: [
      {
        title: 'International Randomized Study of Interferon versus STI571 (IRIS Trial 10-Year Follow-up)',
        journalOrTrialId: 'N Engl J Med 2017; 376: 917–927',
        year: 2017,
        evidenceTier: 'established'
      }
    ]
  },
  {
    id: 'drug-citalopram',
    genericName: 'Citalopram Hydrobromide',
    brandNames: ['Celexa'],
    therapeuticClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
    targetSuperfamily: 'Transporter - Monoamine Transporter (SLC6A4 / SERT)',
    specialty: 'psychiatry',
    fdaApprovalYear: 1998,
    approvedIndications: [
      'Major Depressive Disorder (MDD) in Adults',
      'Off-label: Generalized Anxiety Disorder (GAD)',
      'Off-label: Panic Disorder with or without Agoraphobia'
    ],
    mechanismOfAction: 'Potently and selectively inhibits presynaptic neuronal reuptake of serotonin (5-HT) by blocking the serotonin transporter (SERT). Possesses minimal affinity for cholinergic, histaminergic, or alpha-adrenergic receptors.',
    molecularTargets: [
      { name: 'Serotonin Transporter (SERT / SLC6A4)', type: 'Monoamine Transporter', action: 'Inhibitor (Ki = 1.6 nM)' },
      { name: 'HERG / hERG (KCNH2)', type: 'Voltage-gated Potassium Channel', action: 'Concentration-dependent Blocker' }
    ],
    biologicalPathways: [
      'Presynaptic 5-HT Reuptake Blockade',
      'Somatodendritic 5-HT1A Autoreceptor Desensitization',
      'Cardiac Ventricular Repolarization (hERG Delay)'
    ],
    pkParameters: {
      bioavailability: '80% (independent of food)',
      volumeOfDistribution: '12 L/kg',
      proteinBinding: '80% bound to plasma proteins',
      halfLife: '35 hours (prolonged to ~60 hours in geriatric patients)',
      clearanceRoute: 'Hepatic metabolism via CYP2C19 (~35%) and CYP3A4 (~35%)',
      steadyStateTime: 'Approximately 7 days'
    },
    pgxConsiderations: [
      {
        gene: 'CYP2C19',
        alleles: '*2, *3 (Poor Metabolizers) vs *17 (Rapid Metabolizers)',
        phenotypeEffect: 'Poor metabolizers have 2-fold higher serum AUC and magnified QTc prolongation risk',
        cpicDosingRecommendation: 'CPIC Guideline recommends 50% dose reduction (max 20mg) in CYP2C19 poor metabolizers.'
      }
    ],
    criticalAdverseEffects: [
      'Dose-dependent QTc prolongation and Torsades de Pointes arrhythmia',
      'Serotonin Syndrome when combined with MAOIs, Linezolid, or Triptans',
      'Hyponatremia secondary to SIADH in elderly populations'
    ],
    contraindications: [
      'Concomitant use with MAO inhibitors or within 14 days of discontinuing',
      'Congenital long QT syndrome or baseline QTc > 500 ms',
      'Doses > 20 mg/day in patients > 60 years of age (FDA Boxed Safety Rule)'
    ],
    clinicalTrialsReferences: [
      {
        title: 'FDA Drug Safety Communication: Revised recommendations for Celexa (citalopram hydrobromide) related to a potential risk of abnormal heart rhythms',
        journalOrTrialId: 'FDA Safety Alert 2012',
        year: 2012,
        evidenceTier: 'established'
      }
    ]
  }
];

// Combine all catalogs and remove duplicate ids if any
const RAW_DRUGS: DrugMonograph[] = [
  ...BENCHMARK_DRUGS,
  ...GPCR_DRUGS,
  ...KINASE_DRUGS,
  ...ENZYME_DRUGS,
  ...CHANNEL_TRANSPORTER_DRUGS,
  ...BIOLOGICS_NUCLEAR_DRUGS,
  ...ANTIMICROBIAL_COAGULATION_DRUGS,
  ...EXTENDED_DRUGS,
  ...TARGET_CLASSIFICATION_LIBRARY_DRUGS,
  ...TARGET_EXPANSION_DRUGS,
  ...MASTER_DRUG_INDEX_DRUGS,
  ...PRECISION_PHARMACOPEIA_300_DRUGS
];

// Deduplicate by ID
const seenIds = new Set<string>();
export const ALL_DRUGS: DrugMonograph[] = [];

for (const drug of RAW_DRUGS) {
  if (!seenIds.has(drug.id)) {
    seenIds.add(drug.id);
    ALL_DRUGS.push(drug);
  }
}

// Target Superfamily categories for high-level classification
export const TARGET_SUPERFAMILIES = [
  'All Target Families',
  'G-Protein Coupled Receptors (GPCRs)',
  'Protein Kinases & Tyrosine Kinases',
  'Enzymes & Metabolic Hydrolases',
  'Ion Channels & Voltage Sensors',
  'Transporters & Solute Carriers',
  'Nuclear Hormone Receptors',
  'Biologics, Cytokines & Immune Checkpoints',
  'Ribosomal, Bacterial & Viral Targets'
];
