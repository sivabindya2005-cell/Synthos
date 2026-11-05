import { DrugMonograph } from '../../types/clinical';
import { createDrugMonograph, DrugSpec } from './drugFactory';

const SPECS: DrugSpec[] = [
  // 1. Next-Generation Kinase & Precision Oncology Inhibitors
  {
    id: 'drug-asciminib',
    genericName: 'Asciminib Hydrochloride',
    brandNames: ['Scemblix'],
    therapeuticClass: 'STAMP (Specifically Targeting the ABL Myristoyl Pocket) BCR-ABL1 Inhibitor',
    targetSuperfamily: 'Tyrosine Kinase - Non-Receptor Tyrosine Kinase Allosteric Pocket (ABL1)',
    specialty: 'oncology',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Ph+ Chronic Myeloid Leukemia (Ph+ CML) in chronic phase previously treated with ≥2 TKIs',
      'Ph+ CML in chronic phase with T315I "gatekeeper" mutation'
    ],
    mechanismOfAction: 'Allosteric inhibitor that binds directly to the myristoyl pocket of BCR-ABL1 rather than the orthosteric ATP-binding site. Restores autoregulatory inactive kinase conformation and circumvents ATP-site resistance mutations, including T315I.',
    targetName: 'BCR-ABL1 Myristoyl Binding Pocket (STAMP Site)',
    targetType: 'Non-Receptor Tyrosine Kinase Allosteric Domain',
    targetAction: 'Allosteric Conformation Lock',
    bindingAffinity: 'Kd = 3.0 nM',
    biologicalPathways: ['BCR-ABL1 Autoinhibitory Conformational Restoration', 'STAT5 & CrkL Phosphorylation Abrogation'],
    bioavailability: '73%',
    volumeOfDistribution: '111 L',
    halfLife: '5.5 hours',
    clearanceRoute: 'Hepatic CYP3A4 oxidation and UGT2B7/UGT2B17 glucuronidation; 80% fecal, 11% urine',
    criticalAdverseEffects: [
      'Myelosuppression: Thrombocytopenia (grade 3/4 in 22%) and neutropenia',
      'Pancreatic toxicity: Asymptomatic serum lipase/amylase elevation and pancreatitis',
      'Cardiovascular events: Arterial occlusive events and hypertension'
    ],
    contraindications: ['Known hypersensitivity to asciminib'],
    trialTitle: 'Asciminib in Chronic-Phase Chronic Myeloid Leukemia (ASCEMBL Trial)',
    trialJournal: 'Blood 2021; 138: 2031-2041',
    trialYear: 2021
  },
  {
    id: 'drug-selpercatinib',
    genericName: 'Selpercatinib',
    brandNames: ['Retevmo'],
    therapeuticClass: 'Highly Selective RET (Rearranged during Transfection) Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase - RET Proto-Oncogene Receptor (RET)',
    specialty: 'oncology',
    fdaApprovalYear: 2020,
    approvedIndications: [
      'Locally advanced or metastatic non-small cell lung cancer (NSCLC) with RET gene fusion',
      'Advanced or metastatic medullary thyroid cancer (MTC) with RET mutation',
      'RET fusion-positive advanced solid tumors refractory to standard therapy'
    ],
    mechanismOfAction: 'ATP-competitive small-molecule inhibitor with picomolar selectivity for wild-type and mutated RET kinase variants (including gatekeeper V804M/L mutations). Exhibits robust blood-brain barrier penetration for CNS metastases.',
    targetName: 'RET Receptor Tyrosine Kinase (RET Fusions & V804M)',
    targetType: 'Receptor Tyrosine Kinase',
    targetAction: 'Selective ATP-Competitive Inhibitor',
    bindingAffinity: 'IC50 = 0.4 nM',
    biologicalPathways: ['RET-Mediated MAPK/ERK & PI3K/Akt Proliferation Blockade', 'Intracranial Intracerebral Tumor Regression'],
    bioavailability: '73% (increased with high-fat meals)',
    halfLife: '32 hours',
    clearanceRoute: 'Hepatic CYP3A4 primary metabolism; 69% feces, 24% urine',
    criticalAdverseEffects: [
      'Hepatotoxicity: Marked AST/ALT elevations in up to 51%',
      'Hypertension: Grade 3 hypertension requiring antihypertensive management',
      'QTc interval prolongation and hemorrhagic events',
      'Interstitial Lung Disease / Pneumonitis'
    ],
    contraindications: ['Severe hypersensitivity to selpercatinib'],
    trialTitle: 'Efficacy of Selpercatinib in RET Fusion–Positive Non–Small-Cell Lung Cancer (LIBRETTO-001)',
    trialJournal: 'N Engl J Med 2020; 383: 813-824',
    trialYear: 2020
  },
  {
    id: 'drug-zanubrutinib',
    genericName: 'Zanubrutinib',
    brandNames: ['Brukinsa'],
    therapeuticClass: 'Next-Generation Selective Covalent Bruton Tyrosine Kinase (BTK) Inhibitor',
    targetSuperfamily: 'Tyrosine Kinase - Non-Receptor Tyrosine Kinase (BTK / TEC Family)',
    specialty: 'hematology',
    fdaApprovalYear: 2019,
    approvedIndications: [
      'Chronic Lymphocytic Leukemia (CLL) / Small Lymphocytic Lymphoma (SLL)',
      'Waldenström Macroglobulinemia (WM)',
      'Mantle Cell Lymphoma (MCL) after ≥1 prior therapy',
      'Marginal Zone Lymphoma (MZL) after prior anti-CD20 therapy'
    ],
    mechanismOfAction: 'Forms an irreversible covalent bond with Cysteine 481 in the BTK active site. Engineered with significantly higher kinase selectivity than ibrutinib, sparing EGFR, TEC, and ITK, which substantially reduces atrial fibrillation and off-target bleeding.',
    targetName: 'Bruton Tyrosine Kinase (BTK C481)',
    targetType: 'Non-Receptor Tyrosine Kinase',
    targetAction: 'Irreversible Covalent Catalytic Inhibitor',
    bindingAffinity: 'IC50 = 0.5 nM',
    biologicalPathways: ['B-Cell Receptor (BCR) Survival Cascade Termination', 'NF-kB & Chemokine-Mediated Homing Inhibition'],
    bioavailability: 'High systemic exposure regardless of food',
    halfLife: '2 to 4 hours (pharmacodynamic BTK occupancy persists >24 hours)',
    clearanceRoute: 'Hepatic CYP3A4 metabolism; 87% feces, 8% urine',
    criticalAdverseEffects: [
      'Bleeding & hemorrhage: Major hemorrhagic events in 3% (less than first-generation BTKi)',
      'Neutropenia and secondary bacterial/viral infections',
      'Cardiac arrhythmias: Atrial fibrillation in ~3-4% (significantly lower than ibrutinib)'
    ],
    contraindications: ['Hypersensitivity to zanubrutinib'],
    trialTitle: 'Zanubrutinib versus Ibrutinib in Relapsed/Refractory Chronic Lymphocytic Leukemia (ALPINE Trial)',
    trialJournal: 'N Engl J Med 2023; 388: 319-332',
    trialYear: 2023
  },
  {
    id: 'drug-pirtobrutinib',
    genericName: 'Pirtobrutinib',
    brandNames: ['Jaypirca'],
    therapeuticClass: 'Non-Covalent (Reversible) Bruton Tyrosine Kinase (BTK) Inhibitor',
    targetSuperfamily: 'Tyrosine Kinase - Non-Receptor Tyrosine Kinase (BTK)',
    specialty: 'hematology',
    fdaApprovalYear: 2023,
    approvedIndications: [
      'Relapsed or refractory Mantle Cell Lymphoma (MCL) after prior covalent BTK inhibitor',
      'CLL / SLL after prior covalent BTK inhibitor and BCL-2 inhibitor therapy'
    ],
    mechanismOfAction: 'First-in-class non-covalent, reversible BTK inhibitor. Overcomes C481 mutations (e.g., C481S) that confer resistance to covalent BTK inhibitors like ibrutinib and acalabrutinib by establishing high-affinity binding independent of Cys481.',
    targetName: 'Bruton Tyrosine Kinase (BTK Wild-Type & C481S Mutant)',
    targetType: 'Non-Receptor Tyrosine Kinase',
    targetAction: 'Non-Covalent Reversible Inhibitor',
    bindingAffinity: 'IC50 = 0.7 nM (WT and C481S)',
    biologicalPathways: ['Overcoming Covalent BTKi C481 Mutation Resistance', 'BCR-Induced NF-kB Activation Shutdown'],
    bioavailability: '85%',
    halfLife: '19 hours (once-daily dosing)',
    clearanceRoute: 'Hepatic CYP3A4 primary metabolism; UGT glucuronidation',
    criticalAdverseEffects: [
      'Infections: Fatal opportunistic and bacterial pneumonia',
      'Hemorrhagic events and petechiae',
      'Cytopenias: Grade 3/4 neutropenia in 26%'
    ],
    contraindications: ['Severe hypersensitivity to pirtobrutinib'],
    trialTitle: 'Pirtobrutinib in Covalent BTK-Inhibitor Pretreated Mantle-Cell Lymphoma (BRUIN Trial)',
    trialJournal: 'Lancet 2023; 401: 1797-1808',
    trialYear: 2023
  },
  {
    id: 'drug-capmatinib',
    genericName: 'Capmatinib Hydrochloride',
    brandNames: ['Tabrecta'],
    therapeuticClass: 'Selective MET Receptor Tyrosine Kinase Inhibitor',
    targetSuperfamily: 'Receptor Tyrosine Kinase - Hepatocyte Growth Factor Receptor (HGFR / MET)',
    specialty: 'oncology',
    fdaApprovalYear: 2020,
    approvedIndications: ['Metastatic Non-Small Cell Lung Cancer (NSCLC) with MET Exon 14 Skipping Mutations'],
    mechanismOfAction: 'Highly selective, ATP-competitive inhibitor of the MET receptor tyrosine kinase. Blocks hyperactive MET signaling caused by exon 14 skipping, which deletes the juxtamembrane c-Cbl E3-ligase ubiquitination site and causes sustained oncogenic drive.',
    targetName: 'MET Receptor Tyrosine Kinase (MET Exon 14 Skipping)',
    targetType: 'Receptor Tyrosine Kinase',
    targetAction: 'Selective ATP-Site Inhibitor',
    bindingAffinity: 'IC50 = 0.13 nM',
    biologicalPathways: ['MET Dimerization & Autophosphorylation Shutdown', 'MAPK & PI3K/Akt Survival Signalling Interruption'],
    bioavailability: '70%',
    halfLife: '6.5 hours',
    clearanceRoute: 'Hepatic CYP3A4 and aldehyde oxidase metabolism; 78% fecal, 22% urine',
    criticalAdverseEffects: [
      'Peripheral edema (in up to 52% of patients)',
      'Interstitial Lung Disease (ILD) / Pneumonitis',
      'Hepatotoxicity with transaminitis and hyperbilirubinemia',
      'Photosensitivity reactions'
    ],
    contraindications: ['Known hypersensitivity to capmatinib'],
    trialTitle: 'Capmatinib in MET Exon 14–Mutated or MET-Amplified Non–Small-Cell Lung Cancer (GEOMETRY mono-1)',
    trialJournal: 'N Engl J Med 2020; 383: 944-957',
    trialYear: 2020
  },

  // 2. Breakthrough Cardiometabolic & Heart Failure Agents
  {
    id: 'drug-mavacamten',
    genericName: 'Mavacamten',
    brandNames: ['Camzyos'],
    therapeuticClass: 'First-in-Class Cardiac Myosin Allosteric Inhibitor',
    targetSuperfamily: 'Cytoskeletal & Motor Protein - Cardiac beta-Myosin Heavy Chain (MYH7)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2022,
    approvedIndications: [
      'Symptomatic New York Heart Association (NYHA) Class II–III Obstructive Hypertrophic Cardiomyopathy (oHCM)'
    ],
    mechanismOfAction: 'Selectively binds to cardiac myosin heavy chain, stabilizing the super-relaxed state (SRX) and reducing actin-myosin cross-bridge formation. Reduces excessive left ventricular hypercontractility, decreases LV outflow tract (LVOT) gradient, and improves ventricular compliance.',
    targetName: 'Cardiac beta-Myosin Heavy Chain (MYH7)',
    targetType: 'Sarcomeric Motor Protein',
    targetAction: 'Allosteric Cross-Bridge Inhibitor',
    bindingAffinity: 'IC50 = 0.5 uM',
    biologicalPathways: ['Super-Relaxed Myosin Conformation Stabilization', 'LV Outflow Tract Gradient Decompression', 'Diastolic Filling Time Restoration'],
    bioavailability: '85%',
    halfLife: '6 to 9 days in CYP2C19 normal metabolizers (up to 23 days in CYP2C19 poor metabolizers)',
    clearanceRoute: 'Hepatic CYP2C19 (major, ~74%) and CYP3A4 (~18%) clearance',
    genePGx: 'CYP2C19',
    allelesPGx: '*2, *3 (Poor Metabolizers) vs *17 (Ultrarapid)',
    effectPGx: 'Profoundly prolonged half-life and drug accumulation in poor metabolizers; severe heart failure risk',
    recomPGx: 'CPIC/FDA Boxed Warning: MANDATORY CYP2C19 genotype testing prior to initiation. Start at 2.5 mg/day in poor metabolizers; serial echocardiography required (REMS program).',
    criticalAdverseEffects: [
      'Heart Failure due to systolic dysfunction (Boxed Warning: Left Ventricular Ejection Fraction [LVEF] < 50% mandates treatment interruption)',
      'Severe negative inotropy when combined with verapamil or diltiazem',
      'High risk of drug interactions with CYP2C19/3A4 modulators'
    ],
    contraindications: ['Concomitant strong CYP2C19/3A4 inhibitors or inducers', 'Baseline LVEF < 55%'],
    trialTitle: 'Mavacamten for treatment of symptomatic obstructive hypertrophic cardiomyopathy (EXPLORER-HCM)',
    trialJournal: 'Lancet 2020; 396: 759-769',
    trialYear: 2020
  },
  {
    id: 'drug-bempedoic-acid',
    genericName: 'Bempedoic Acid',
    brandNames: ['Nexletol', 'Nexlizet (with Ezetimibe)'],
    therapeuticClass: 'ATP-Citrate Lyase (ACL) Inhibitor (Non-Statin Lipid-Lowering Agent)',
    targetSuperfamily: 'Enzyme - Metabolic Lyase (ACLY / ATP Citrate Lyase)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2020,
    approvedIndications: [
      'Heterozygous Familial Hypercholesterolemia (HeFH)',
      'Primary Hyperlipidemia in patients statin-intolerant or requiring additional LDL-C lowering',
      'Cardiovascular risk reduction in primary and secondary prevention'
    ],
    mechanismOfAction: 'Prodrug converted in liver by very long-chain acyl-CoA synthetase-1 (ACSVL1 / SLC27A2) to bempedoyl-CoA. Inhibits ATP-citrate lyase upstream of HMG-CoA reductase in cholesterol biosynthesis. Because skeletal muscle lacks ACSVL1, it bypasses statin-associated myopathy and rhabdomyolysis.',
    targetName: 'ATP-Citrate Lyase (ACLY)',
    targetType: 'Cytoplasmic Metabolic Enzyme',
    targetAction: 'Competitive Catalytic Inhibitor (as Bempedoyl-CoA)',
    bindingAffinity: 'Ki = 1.0 uM',
    biologicalPathways: ['Hepatic Cholesterol Biosynthesis Inhibition Upstream of HMGCR', 'Hepatic LDL Receptor Upregulation', 'Circulating ApoB & LDL-C Clearance'],
    bioavailability: 'Extensive oral absorption',
    halfLife: '21 hours (once-daily dosing)',
    clearanceRoute: 'Hepatic glucuronidation via UGT2B7; 70% urine, 30% feces',
    criticalAdverseEffects: [
      'Hyperuricemia and acute gout flares (inhibits renal OAT2 transport of uric acid; uric acid increases by 0.8 mg/dL)',
      'Tendon rupture (Achilles tendon, biceps, rotator cuff; heightened in elderly or corticosteroid users)',
      'Benign reversible serum creatinine elevation and minor AST/ALT transaminitis'
    ],
    contraindications: ['Known hypersensitivity to bempedoic acid'],
    trialTitle: 'Bempedoic Acid and Cardiovascular Outcomes in Statin-Intolerant Patients (CLEAR Outcomes)',
    trialJournal: 'N Engl J Med 2023; 388: 1353-1364',
    trialYear: 2023
  },
  {
    id: 'drug-vericiguat',
    genericName: 'Vericiguat',
    brandNames: ['Verquvo'],
    therapeuticClass: 'Soluble Guanylate Cyclase (sGC) Direct Stimulator',
    targetSuperfamily: 'Enzyme - Intracellular Lyase / Signal Transducer (sGC / GUCY1A1)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Reduction of cardiovascular death and heart failure hospitalization in adults with symptomatic chronic HFrEF (LVEF < 45%) following a worsening HF event'
    ],
    mechanismOfAction: 'Directly stimulates soluble guanylate cyclase (sGC) through a dual mechanism: stabilizes the unliganded sGC enzyme and synergizes with endogenous nitric oxide (NO) at an allosteric site. Restores cyclic GMP (cGMP) synthesis, reversing endothelial dysfunction, ventricular remodeling, and vascular stiffness.',
    targetName: 'Soluble Guanylate Cyclase (sGC / Guanylyl Cyclase)',
    targetType: 'Heme-Containing Lyase Enzyme',
    targetAction: 'Allosteric Direct Stimulator & NO-Sensitizer',
    bindingAffinity: 'EC50 = 200 nM',
    biologicalPathways: ['Intracellular cGMP/PKG Pathway Re-Activation', 'Myocardial Diastolic Relaxation & Antifibrotic Signaling', 'Systemic & Pulmonary Vascular Resistance Reduction'],
    bioavailability: '93% (taken with food to optimize absorption)',
    halfLife: '30 hours (supports once-daily titration from 2.5mg to 10mg)',
    clearanceRoute: 'Hepatic glucuronidation via UGT1A9 and UGT1A1; 53% urine, 45% feces',
    criticalAdverseEffects: [
      'Symptomatic hypotension and syncope',
      'Anemia: Decreased hemoglobin/hematocrit in ~8%',
      'Embryo-Fetal Toxicity (Boxed Warning: pregnancy test required prior to initiation)'
    ],
    contraindications: ['Concomitant use of other sGC stimulators (e.g., riociguat)', 'Pregnancy (Boxed Warning)'],
    trialTitle: 'Vericiguat in Patients with Heart Failure and Reduced Ejection Fraction (VICTORIA Trial)',
    trialJournal: 'N Engl J Med 2020; 382: 1883-1893',
    trialYear: 2020
  },
  {
    id: 'drug-sotagliflozin',
    genericName: 'Sotagliflozin',
    brandNames: ['Inpefa', 'Zynquista'],
    therapeuticClass: 'Dual Sodium-Glucose Co-Transporter 1 and 2 (SGLT1 / SGLT2) Inhibitor',
    targetSuperfamily: 'Transporter - Dual Intestinal & Renal Solute Carrier (SLC5A1 & SLC5A2)',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2023,
    approvedIndications: [
      'Reduction of cardiovascular death and hospitalization for heart failure across the full spectrum of LVEF (HFrEF, HFmrEF, and HFpEF)',
      'Type 2 diabetes with CKD and cardiovascular disease'
    ],
    mechanismOfAction: 'Inhibits both renal SGLT2 (promoting glycosuria and natriuresis) and intestinal SGLT1 in the apical enterocyte membrane of the small intestine. Intestinal SGLT1 inhibition delays glucose and galactose absorption, blunting postprandial glucose surges and augmenting GLP-1 secretion.',
    targetName: 'SGLT1 (Intestinal SLC5A1) & SGLT2 (Renal SLC5A2)',
    targetType: 'Solute Carrier Cotransporter',
    targetAction: 'Dual Reversible Inhibitor (IC50 = 36 nM for SGLT1; 1.8 nM for SGLT2)',
    bindingAffinity: 'IC50 = 1.8 nM (SGLT2), 36 nM (SGLT1)',
    biologicalPathways: ['Proximal Tubular Natriuresis & Osmotic Diuresis', 'Intestinal Enteroendocrine GLP-1/PYY Incretin Stimulation', 'Macula Densa Tubuloglomerular Feedback Restoration'],
    bioavailability: '60%',
    halfLife: '21 to 26 hours',
    clearanceRoute: 'Hepatic glucuronidation via UGT1A9; 57% feces, 37% urine',
    criticalAdverseEffects: [
      'Diarrhea and flatulence (due to unabsorbed carbohydrates reaching the colon via SGLT1 inhibition)',
      'Euglycemic Diabetic Ketoacidosis (euDKA)',
      'Mycotic genital infections and volume depletion'
    ],
    contraindications: ['Patients on maintenance dialysis'],
    trialTitle: 'Sotagliflozin in Patients with Diabetes and Recent Worsening Heart Failure (SOLOIST-WHF)',
    trialJournal: 'N Engl J Med 2021; 384: 117-128',
    trialYear: 2021
  },
  {
    id: 'drug-tirzepatide',
    genericName: 'Tirzepatide',
    brandNames: ['Mounjaro', 'Zepbound'],
    therapeuticClass: 'Dual Glucose-Dependent Insulinotropic Polypeptide (GIP) and GLP-1 Receptor Agonist',
    targetSuperfamily: 'GPCR - Incretin Receptors (GIPR & GLP1R)',
    specialty: 'endocrinology',
    fdaApprovalYear: 2022,
    approvedIndications: [
      'Type 2 Diabetes Mellitus glycemic management',
      'Chronic Weight Management in adults with obesity (BMI ≥30) or overweight with comorbidities (BMI ≥27)',
      'Moderate to Severe Obstructive Sleep Apnea with Obesity'
    ],
    mechanismOfAction: 'Synthetic 39-amino-acid peptide with C20 fatty diacid moiety that binds simultaneously to native GIP and GLP-1 receptors with biased signaling. Synergistically enhances glucose-dependent insulin secretion, suppresses postprandial glucagon, slows gastric emptying, and centrally regulates hypothalamic satiety.',
    targetName: 'GIP Receptor (GIPR) & GLP-1 Receptor (GLP1R)',
    targetType: 'Class B Secretin GPCR',
    targetAction: 'Dual Unimolecular Agonist',
    bindingAffinity: 'Ki = 0.1 nM (GIPR), 1.0 nM (GLP1R)',
    biologicalPathways: ['Pancreatic Beta-Cell cAMP Exocytosis Cascades', 'Hypothalamic POMC/CART Satiety Signaling', 'Adipose Tissue Lipid Storage & Insulin Sensitivity Reprogramming'],
    bioavailability: '80% (subcutaneous injection once weekly)',
    halfLife: '5 days (allows weekly administration)',
    clearanceRoute: 'Proteolytic peptide cleavage and beta-oxidation of fatty acid side chain',
    criticalAdverseEffects: [
      'Thyroid C-Cell Tumors (Boxed Warning: Contraindicated in MEN2 or personal/family history of Medullary Thyroid Carcinoma)',
      'Gastrointestinal: Nausea, diarrhea, vomiting, constipation, dyspepsia',
      'Acute pancreatitis and acute gallbladder disease (cholecystitis)'
    ],
    contraindications: ['Personal or family history of medullary thyroid carcinoma (MTC)', 'Multiple Endocrine Neoplasia syndrome type 2 (MEN2)'],
    trialTitle: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)',
    trialJournal: 'N Engl J Med 2022; 387: 205-216',
    trialYear: 2022
  },

  // 3. Targeted Monoclonal Antibodies & Biologics
  {
    id: 'drug-efgartigimod',
    genericName: 'Efgartigimod Alfa-fcab',
    brandNames: ['Vyvgart', 'Vyvgart Hytrulo (with Hyaluronidase)'],
    therapeuticClass: 'Neonatal Fc Receptor (FcRn) Antagonist Antibody Fragment',
    targetSuperfamily: 'Endosomal Receptor - Neonatal Fc Receptor (FCGRT / FcRn)',
    specialty: 'neurology',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Generalized Myasthenia Gravis (gMG) in adult patients who are anti-AChR antibody positive',
      'Chronic Inflammatory Demyelinating Polyneuropathy (CIDP)'
    ],
    mechanismOfAction: 'Human IgG1 antibody Fc fragment engineered with ABDEG mutations (Met252Tyr, Ser254Thr, Thr256Glu, His433Lys, Asn434Phe) that confer ultraselective affinity for neonatal Fc receptor (FcRn) at both neutral and acidic pH. Blocks FcRn-mediated recycling of endogenous IgG, accelerating catabolic clearance of pathogenic anti-AChR autoantibodies by up to 75%.',
    targetName: 'Neonatal Fc Receptor (FcRn / FCGRT)',
    targetType: 'MHC-Class-I-like Heterodimer Transporter',
    targetAction: 'Competitive Recycling Antagonist',
    bindingAffinity: 'Kd = 14 nM at pH 6.0 and 7.4',
    biologicalPathways: ['Endosomal Pathogenic Autoantibody Degradation Acceleration', 'Circulating Total IgG Reduction without IgA/IgM Depletion'],
    halfLife: '80 to 120 hours',
    clearanceRoute: 'Lysosomal proteolytic catabolism into small peptides and amino acids',
    criticalAdverseEffects: [
      'Respiratory and urinary tract infections (due to transient therapeutic total IgG drop)',
      'Headache, paresthesias, and myalgias',
      'Hypersensitivity reactions'
    ],
    contraindications: ['Hypersensitivity to efgartigimod'],
    trialTitle: 'Safety, efficacy, and tolerability of efgartigimod in patients with generalised myasthenia gravis (ADAPT)',
    trialJournal: 'Lancet Neurol 2021; 20: 526-536',
    trialYear: 2021
  },
  {
    id: 'drug-tezepelumab',
    genericName: 'Tezepelumab-ekko',
    brandNames: ['Tezspire'],
    therapeuticClass: 'Thymic Stromal Lymphopoietin (TSLP) Inhibitor Monoclonal Antibody',
    targetSuperfamily: 'Cytokine Biologic - Epithelial Alarmin (TSLP)',
    specialty: 'respiratory',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Add-on maintenance treatment of adult and pediatric patients (≥12 years) with severe asthma without phenotype or biomarker limitation'
    ],
    mechanismOfAction: 'Human IgG2-lambda monoclonal antibody that binds directly to thymic stromal lymphopoietin (TSLP), an epithelial alarmin cytokine released by airway epithelium in response to allergens, viruses, and pollutants. Acting at the absolute apex of the airway inflammation cascade, it halts both eosinophilic (Type 2-high) and non-eosinophilic (Type 2-low / neutrophilic) inflammation.',
    targetName: 'Thymic Stromal Lymphopoietin (TSLP)',
    targetType: 'Epithelial Alarmin Cytokine',
    targetAction: 'Cytokine-Neutralizing Monoclonal Antibody',
    bindingAffinity: 'Kd = 16 pM',
    biologicalPathways: ['Apex Airway Epithelial Cascade Interruption', 'OX40L & Dendritic Cell Priming Arrest', 'Blood Eosinophil, FeNO, and Total IgE Reduction'],
    bioavailability: '77% (subcutaneous injection once every 4 weeks)',
    halfLife: '26 days',
    clearanceRoute: 'Reticuloendothelial system clearance via proteolytic catabolism',
    criticalAdverseEffects: [
      'Pharyngitis and sinusitis',
      'Arthralgias and back pain',
      'Serious hypersensitivity reactions (anaphylaxis)'
    ],
    contraindications: ['Known severe hypersensitivity to tezepelumab'],
    trialTitle: 'Tezepelumab in Adults and Adolescents with Severe, Uncontrolled Asthma (NAVIGATOR Trial)',
    trialJournal: 'N Engl J Med 2021; 384: 1800-1809',
    trialYear: 2021
  },
  {
    id: 'drug-anifrolumab',
    genericName: 'Anifrolumab-fnia',
    brandNames: ['Saphnelo'],
    therapeuticClass: 'Type I Interferon Receptor Subunit 1 (IFNAR1) Antagonist Monoclonal Antibody',
    targetSuperfamily: 'Cytokine Receptor Biologic - Interferon Alpha/Beta Receptor 1 (IFNAR1)',
    specialty: 'immunology',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Moderate to severe Systemic Lupus Erythematosus (SLE) receiving standard therapy'
    ],
    mechanismOfAction: 'Human IgG1-kappa monoclonal antibody that binds with subnanomolar affinity to subunit 1 of the type I interferon receptor (IFNAR1). Blocks the actions of all type I interferons (IFN-alpha, IFN-beta, IFN-omega, IFN-kappa), suppressing the 21-gene type I interferon pharmacodynamic signature central to lupus pathogenesis.',
    targetName: 'Type I Interferon Receptor Subunit 1 (IFNAR1)',
    targetType: 'Heterodimeric Cytokine Receptor',
    targetAction: 'Receptor-Blocking Monoclonal Antibody',
    bindingAffinity: 'Kd = 1.0 nM',
    biologicalPathways: ['JAK1/TYK2 & STAT1/STAT2 Transcriptional Cascade Silencing', 'Plasmacytoid Dendritic Cell & B-Cell Hyperactivation Quenching'],
    halfLife: '20 days',
    clearanceRoute: 'Internalization and lysosomal degradation; clearance increases in high interferon gene signature states',
    criticalAdverseEffects: [
      'Herpes Zoster infection (reactivation in ~7% of patients; zoster vaccination recommended prior to start)',
      'Nasopharyngitis, bronchitis, and serious upper respiratory infections',
      'Malignancy risk (uncommon)'
    ],
    contraindications: ['Severe hypersensitivity to anifrolumab'],
    trialTitle: 'Trial of Anifrolumab in Active Systemic Lupus Erythematosus (TULIP-2)',
    trialJournal: 'N Engl J Med 2020; 382: 211-221',
    trialYear: 2020
  },
  {
    id: 'drug-bimekizumab',
    genericName: 'Bimekizumab-bkzx',
    brandNames: ['Bimzelx'],
    therapeuticClass: 'Dual Interleukin-17A and Interleukin-17F (IL-17A/F) Selective Inhibitor Monoclonal Antibody',
    targetSuperfamily: 'Cytokine Biologic - Pro-Inflammatory Interleukin 17 Family (IL-17A & IL-17F)',
    specialty: 'dermatology',
    fdaApprovalYear: 2023,
    approvedIndications: [
      'Moderate to Severe Plaque Psoriasis in adults candidate for systemic therapy',
      'Psoriatic Arthritis (PsA)',
      'Non-radiographic Axial Spondyloarthritis (nr-axSpA)',
      'Ankylosing Spondylitis (AS)'
    ],
    mechanismOfAction: 'Humanized IgG1 monoclonal antibody engineered to selectively bind and neutralize both IL-17A and IL-17F homodimers and the IL-17A/F heterodimer. Because IL-17F is expressed at 30-fold higher concentrations in psoriatic skin lesions than IL-17A, dual neutralization achieves unprecedented PASI-90 and PASI-100 skin clearance rates.',
    targetName: 'Interleukin-17A and Interleukin-17F (IL-17A / IL-17F)',
    targetType: 'Pro-inflammatory Dimeric Cytokines',
    targetAction: 'Dual Ligand-Neutralizing Monoclonal Antibody',
    bindingAffinity: 'Kd = 3.2 pM (IL-17A), 23 pM (IL-17F)',
    biologicalPathways: ['Keratinocyte Hyperproliferation Arrest', 'Synovial Fibroblast & Enthesial Osteoclastogenesis Interruption'],
    bioavailability: '70% (subcutaneous injection)',
    halfLife: '23 days',
    clearanceRoute: 'Reticuloendothelial proteolytic degradation',
    criticalAdverseEffects: [
      'Oral candidiasis (in up to 15% due to mucosal IL-17 defense attenuation; easily treated with topical nystatin)',
      'Suicidal ideation and behavior (monitor for emerging psychiatric symptoms)',
      'Exacerbation or new onset of Inflammatory Bowel Disease (Crohn disease and ulcerative colitis)'
    ],
    contraindications: ['Known severe hypersensitivity to bimekizumab'],
    trialTitle: 'Bimekizumab versus Adalimumab in Plaque Psoriasis (BE SURE Trial)',
    trialJournal: 'N Engl J Med 2021; 385: 157-168',
    trialYear: 2021
  },
  {
    id: 'drug-mirikizumab',
    genericName: 'Mirikizumab-mrkz',
    brandNames: ['Omvoh'],
    therapeuticClass: 'Interleukin-23 Subunit p19 (IL-23p19) Selective Inhibitor Monoclonal Antibody',
    targetSuperfamily: 'Cytokine Biologic - Interleukin 23 Subunit Alpha (IL23A / p19)',
    specialty: 'gastroenterology',
    fdaApprovalYear: 2023,
    approvedIndications: [
      'Moderately to severely active Ulcerative Colitis (UC) in adults'
    ],
    mechanismOfAction: 'Humanized IgG4-variant monoclonal antibody that binds selectively to the p19 subunit of human interleukin-23 (IL-23), preventing interaction with the IL-23 receptor without binding to the p40 subunit shared by IL-12. Selectively shuts down pathogenic Th17 cell survival and mucosal tissue injury in the colonic lamina propria.',
    targetName: 'Interleukin-23 Subunit p19 (IL-23p19 / IL23A)',
    targetType: 'Pro-inflammatory Heterodimeric Cytokine Subunit',
    targetAction: 'Subunit-Selective Neutralizing Monoclonal Antibody',
    bindingAffinity: 'Kd = 45 pM',
    biologicalPathways: ['Mucosal Th17 Clonal Maintenance Abrogation', 'Colonic Epithelial Mucosal Healing & Endoscopic Remission'],
    halfLife: '9.3 days',
    clearanceRoute: 'Intracellular catabolism into amino acids',
    criticalAdverseEffects: [
      'Hepatotoxicity: Serum transaminase (ALT/AST) and total bilirubin elevation (evaluate baseline LFTs)',
      'Upper respiratory infections and nasopharyngitis',
      'Infusion-related and injection-site reactions'
    ],
    contraindications: ['Severe hypersensitivity to mirikizumab'],
    trialTitle: 'Mirikizumab as Induction and Maintenance Therapy for Ulcerative Colitis (LUCENT Trials)',
    trialJournal: 'N Engl J Med 2023; 388: 2444-2455',
    trialYear: 2023
  },

  // 4. Advanced Psychiatric & Neuropsychiatric Therapeutics
  {
    id: 'drug-lumateperone',
    genericName: 'Lumateperone Tosylate',
    brandNames: ['Caplyta'],
    therapeuticClass: 'Mechanistically Mechanistically Distinct Atypical Antipsychotic',
    targetSuperfamily: 'GPCR - Multi-Target Serotonin, Dopamine & Glutamate Phosphoprotein Modulator',
    specialty: 'psychiatry',
    fdaApprovalYear: 2019,
    approvedIndications: [
      'Schizophrenia in adults',
      'Depressive episodes associated with Bipolar I or Bipolar II Disorder (Bipolar Depression) as monotherapy or adjunctive with lithium/divalproex'
    ],
    mechanismOfAction: 'Possesses a 60-fold higher affinity for 5-HT2A receptors than dopamine D2 receptors, acting as a potent 5-HT2A antagonist, post-synaptic D2 receptor partial agonist/antagonist, presynaptic D2 partial agonist, SERT inhibitor, and indirect NMDA GluN2B phosphorylation modulator.',
    targetName: '5-HT2A Receptor & Dopamine D2 Receptor',
    targetType: 'GPCR',
    targetAction: 'Biased Antagonist / Partial Agonist (5-HT2A Ki = 0.54 nM; D2 Ki = 32 nM)',
    bindingAffinity: 'Ki = 0.54 nM (5-HT2A), 32 nM (D2)',
    biologicalPathways: ['Mesolimbic Antipsychotic Modulation without Nigrostriatal Catalepsy', 'Cortical GluN2B Phosphorylation & Antidepressant Neuroplasticity'],
    bioavailability: '4.4% (extensive first-pass; taken with food)',
    halfLife: '18 hours (once daily 42 mg evening dosing; no titration needed)',
    clearanceRoute: 'Extensive hepatic metabolism via CYP3A4, CYP2C8, and UGT1A4; 58% urine, 29% feces',
    criticalAdverseEffects: [
      'Somnolence, sedation, and fatigue in ~24%',
      'Nausea and dry mouth',
      'Significantly lower metabolic weight gain, dyslipidemia, or extrapyramidal symptoms compared to classic atypicals'
    ],
    contraindications: ['Known hypersensitivity to lumateperone'],
    trialTitle: 'Lumateperone for the Treatment of Schizophrenia: A Randomized Clinical Trial',
    trialJournal: 'JAMA Psychiatry 2020; 77: 349-358',
    trialYear: 2020
  },
  {
    id: 'drug-cariprazine',
    genericName: 'Cariprazine Hydrochloride',
    brandNames: ['Vraylar'],
    therapeuticClass: 'Dopamine D3-Preferring Partial Agonist Antipsychotic',
    targetSuperfamily: 'GPCR - Dopamine D3/D2 Receptor Partial Agonist',
    specialty: 'psychiatry',
    fdaApprovalYear: 2015,
    approvedIndications: [
      'Schizophrenia in adults',
      'Acute manic or mixed episodes associated with Bipolar I Disorder',
      'Depressive episodes associated with Bipolar I Disorder',
      'Adjunctive treatment to antidepressants for Major Depressive Disorder (MDD)'
    ],
    mechanismOfAction: 'Dopamine D3 and D2 receptor partial agonist with ~10-fold higher in vitro affinity for D3 receptors than D2. D3 preference modulates ventral striatal and prefrontal circuitry, conferring unique efficacy against negative symptoms of schizophrenia and cognitive blunting.',
    targetName: 'Dopamine D3 Receptor (DRD3) & D2 Receptor (DRD2)',
    targetType: 'GPCR',
    targetAction: 'High-Affinity Partial Agonist (Ki = 0.085 nM D3; 0.49 nM D2)',
    bindingAffinity: 'Ki = 0.085 nM (D3), 0.49 nM (D2)',
    biologicalPathways: ['Ventral Tegmental D3 Transmission Fine-Tuning', 'Negative Symptom Reversal & Executive Cognition Preservation'],
    bioavailability: 'High oral absorption unaffected by food',
    halfLife: '2 to 4 days (cariprazine), 1 to 3 weeks (active didesmethylcariprazine [DDCAR] metabolite)',
    clearanceRoute: 'Hepatic CYP3A4 primary biotransformation to desmethyl and didesmethyl active metabolites',
    criticalAdverseEffects: [
      'Akathisia and extrapyramidal symptoms (restlessness occurring early in therapy)',
      'Insomnia and headache',
      'Delayed emergence of adverse reactions due to multi-week accumulation of DDCAR metabolite'
    ],
    contraindications: ['Known hypersensitivity to cariprazine'],
    trialTitle: 'Cariprazine in Bipolar I Depression: A Randomized Double-Blind Placebo-Controlled Trial',
    trialJournal: 'Am J Psychiatry 2020; 177: 309-317',
    trialYear: 2020
  },
  {
    id: 'drug-vortioxetine',
    genericName: 'Vortioxetine Hydrobromide',
    brandNames: ['Trintellix', 'Brintellix'],
    therapeuticClass: 'Serotonin Modulator and Stimulator (SMS) Antidepressant',
    targetSuperfamily: 'Transporter & GPCR - Serotonin Transporter (SERT) & 5-HT Receptors',
    specialty: 'psychiatry',
    fdaApprovalYear: 2013,
    approvedIndications: ['Major Depressive Disorder (MDD) in adults'],
    mechanismOfAction: 'Inhibits 5-HT reuptake via SERT while simultaneously acting as a 5-HT1A receptor full agonist, 5-HT1B partial agonist, and 5-HT3, 5-HT1D, and 5-HT7 antagonist. Direct multimodal receptor modulation enhances prefrontal acetylcholine, histamine, dopamine, and norepinephrine release, preserving cognitive performance in depression.',
    targetName: 'Serotonin Transporter (SERT) & 5-HT1A/5-HT3/5-HT7 Receptors',
    targetType: 'Monoamine Transporter and Serotonin GPCRs',
    targetAction: 'Multimodal SERT Inhibitor & Serotonin Subtype Modulator',
    bindingAffinity: 'Ki = 1.6 nM (SERT), Ki = 3.7 nM (5-HT3)',
    biologicalPathways: ['Prefrontal Synaptic Acetylcholine & Monoamine Facilitation', 'Neuroplasticity & Hippocampal BDNF Upregulation'],
    bioavailability: '75%',
    halfLife: '66 hours (supports once-daily administration; low withdrawal discontinuation risk)',
    clearanceRoute: 'Extensive hepatic CYP2D6 oxidation (major) and CYP3A4/2C9; 59% urine, 26% feces',
    genePGx: 'CYP2D6',
    allelesPGx: '*3, *4, *5 (Poor Metabolizers)',
    effectPGx: 'Poor metabolizers have 2-fold higher vortioxetine exposure',
    recomPGx: 'CPIC/FDA recommendation: Reduce starting dose by 50% in known CYP2D6 poor metabolizers.',
    criticalAdverseEffects: [
      'Gastrointestinal: Nausea (most common, transient, mitigated by taking with meals)',
      'Sexual dysfunction (significantly lower incidence than classical SSRIs/SNRIs)',
      'Serotonin syndrome risk with MAOIs'
    ],
    contraindications: ['Concomitant MAOI use or within 14 days of discontinuing'],
    trialTitle: 'Vortioxetine for the Treatment of Major Depressive Disorder: A Meta-Analysis',
    trialJournal: 'J Affect Disord 2015; 180: 172-184',
    trialYear: 2015
  },
  {
    id: 'drug-pimavanserin',
    genericName: 'Pimavanserin Tartrate',
    brandNames: ['Nuplazid'],
    therapeuticClass: 'Selective Serotonin 5-HT2A Inverse Agonist (Non-Dopaminergic Antipsychotic)',
    targetSuperfamily: 'GPCR - Serotonin 5-HT2A / 5-HT2C Inverse Agonist',
    specialty: 'neurology',
    fdaApprovalYear: 2016,
    approvedIndications: [
      'Hallucinations and delusions associated with Parkinson\'s Disease Psychosis (PDP)'
    ],
    mechanismOfAction: 'First-in-class selective 5-HT2A inverse agonist (Ki = 0.087 nM) with 40-fold lower affinity for 5-HT2C and negligible affinity for dopamine D2, histamine, muscarinic, or adrenergic receptors. Treats hallucinations and delusions in Parkinson\'s disease without aggravating motor parkinsonism or tremors.',
    targetName: 'Serotonin 5-HT2A Receptor',
    targetType: 'GPCR',
    targetAction: 'Selective Inverse Agonist (Ki = 0.087 nM)',
    bindingAffinity: 'Ki = 0.087 nM',
    biologicalPathways: ['Cortical Pyramidal Serotonergic Hallucinatory Drive Arrest', 'Striatal Dopaminergic Motor Tone Preservation'],
    bioavailability: 'High oral bioavailability',
    halfLife: '57 hours (active N-desmethyl metabolite half-life 200 hours)',
    clearanceRoute: 'Hepatic CYP3A4/CYP3A5 biotransformation; strong CYP3A4 inhibitors require dose reduction',
    criticalAdverseEffects: [
      'QTc interval prolongation (Boxed Warning: increased mortality in elderly dementia-related psychosis)',
      'Peripheral edema and confusional states',
      'Nausea and gait disturbances'
    ],
    contraindications: ['Known hypersensitivity to pimavanserin'],
    trialTitle: 'Pimavanserin for patients with Parkinson\'s disease psychosis: a randomised, placebo-controlled trial',
    trialJournal: 'Lancet 2014; 383: 533-540',
    trialYear: 2014
  },
  {
    id: 'drug-pitolisant',
    genericName: 'Pitolisant Hydrochloride',
    brandNames: ['Wakix'],
    therapeuticClass: 'Histamine H3 Receptor Antagonist / Inverse Agonist (Wakefulness Agent)',
    targetSuperfamily: 'GPCR - Histamine H3 Presynaptic Autoreceptor',
    specialty: 'neurology',
    fdaApprovalYear: 2019,
    approvedIndications: [
      'Excessive Daytime Sleepiness (EDS) in adult patients with Narcolepsy',
      'Cataplexy in adult patients with Narcolepsy'
    ],
    mechanismOfAction: 'First-in-class selective histamine H3 receptor antagonist/inverse agonist. Blocks presynaptic H3 autoreceptors on histaminergic neurons in the tuberomammillary nucleus, triggering endogenous histamine synthesis and release into cortical projection areas to drive wakefulness and suppress REM cataplexy.',
    targetName: 'Presynaptic Histamine H3 Receptor (HRH3)',
    targetType: 'GPCR Autoreceptor',
    targetAction: 'Selective Antagonist / Inverse Agonist',
    bindingAffinity: 'Ki = 1.0 nM',
    biologicalPathways: ['Tuberomammillary Cortical Histaminergic Tone Activation', 'Brainstem Cataplexy Inhibition & Non-Dopaminergic Vigilance'],
    bioavailability: '90%',
    halfLife: '20 hours (once daily in morning on awakening)',
    clearanceRoute: 'Extensive hepatic CYP2D6 and CYP3A4 metabolism; 63% urine, 25% feces',
    genePGx: 'CYP2D6',
    allelesPGx: '*4, *5 (Poor Metabolizers)',
    effectPGx: 'CYP2D6 poor metabolizers experience 2-fold higher pitolisant Cmax and AUC',
    recomPGx: 'Reduce maximum dose from 35.6 mg to 17.8 mg once daily in CYP2D6 poor metabolizers.',
    criticalAdverseEffects: [
      'QTc interval prolongation (dose-dependent)',
      'Insomnia, anxiety, and headache',
      'Decreased efficacy of hormonal contraceptives via CYP3A4 induction'
    ],
    contraindications: ['Severe hepatic impairment (Child-Pugh C)'],
    trialTitle: 'Pitolisant versus placebo or modafinil in patients with narcolepsy (HARMONY I)',
    trialJournal: 'Lancet Neurol 2013; 12: 1068-1075',
    trialYear: 2013
  },
  {
    id: 'drug-solriamfetol',
    genericName: 'Solriamfetol Hydrochloride',
    brandNames: ['Sunosi'],
    therapeuticClass: 'Dopamine and Norepinephrine Reuptake Inhibitor (DNRI)',
    targetSuperfamily: 'Transporter - Monoamine Transporters (DAT / SLC6A3 & NET / SLC6A2)',
    specialty: 'neurology',
    fdaApprovalYear: 2019,
    approvedIndications: [
      'Excessive daytime sleepiness (EDS) associated with Narcolepsy',
      'Excessive daytime sleepiness associated with Obstructive Sleep Apnea (OSA)'
    ],
    mechanismOfAction: 'Selective dopamine and norepinephrine reuptake inhibitor. Inhibits DAT (Ki = 2.9 uM) and NET (Ki = 4.4 uM) without stimulating presynaptic dopamine release or exhibiting significant affinity for serotonin or adrenergic receptors, yielding a robust wake-promoting effect with low abuse potential.',
    targetName: 'Dopamine Transporter (DAT) & Norepinephrine Transporter (NET)',
    targetType: 'Monoamine Transporters',
    targetAction: 'Dual Reuptake Inhibitor',
    bindingAffinity: 'Ki = 2.9 uM (DAT), 4.4 uM (NET)',
    biologicalPathways: ['Ascending Reticular Activating System (ARAS) Facilitation', 'Prefrontal Catecholamine Wakefulness Circuit Amplification'],
    bioavailability: '95%',
    halfLife: '7.1 hours',
    clearanceRoute: '95% excreted unchanged in urine via renal glomerular filtration; requires dose titration in renal impairment',
    criticalAdverseEffects: [
      'Dose-dependent blood pressure and heart rate elevations (monitor vitals)',
      'Insomnia, headache, nausea, and decreased appetite',
      'Anxiety and psychiatric agitation'
    ],
    contraindications: ['Concomitant MAOI use or within 14 days of discontinuation'],
    trialTitle: 'A Randomized Trial of Solriamfetol for the Treatment of Excessive Daytime Sleepiness in OSA',
    trialJournal: 'Am J Respir Crit Care Med 2019; 199: 1419-1427',
    trialYear: 2019
  },

  // 5. Emerging Dermatology & Ophthalmology Breakthroughs
  {
    id: 'drug-deucravacitinib',
    genericName: 'Deucravacitinib',
    brandNames: ['Sotyktu'],
    therapeuticClass: 'First-in-Class Allosteric Tyrosine Kinase 2 (TYK2) Inhibitor',
    targetSuperfamily: 'Tyrosine Kinase - JAK-STAT Allosteric JH2 Pseudokinase Domain (TYK2)',
    specialty: 'dermatology',
    fdaApprovalYear: 2022,
    approvedIndications: ['Moderate to Severe Plaque Psoriasis in adults candidates for systemic therapy'],
    mechanismOfAction: 'Selective, first-in-class allosteric inhibitor that binds directly to the regulatory pseudokinase (JH2) domain of TYK2 rather than the conserved catalytic (JH1) ATP-binding site. Locks TYK2 in an autoinhibited state, avoiding cross-inhibition of JAK1, JAK2, and JAK3, preventing typical JAK-inhibitor cytopenias, lipid derangements, or thrombosis.',
    targetName: 'Tyrosine Kinase 2 Pseudokinase Regulatory Domain (TYK2 JH2)',
    targetType: 'Non-Receptor Tyrosine Kinase Allosteric Domain',
    targetAction: 'Allosteric Conformational Lock',
    bindingAffinity: 'IC50 = 1.0 nM',
    biologicalPathways: ['IL-23, IL-12, and Type I IFN Signal Transduction Blockade', 'Psoriatic Epidermal Acanthosis & Parakeratosis Reversal'],
    bioavailability: '99%',
    halfLife: '10 hours (once daily 6 mg oral dosing)',
    clearanceRoute: 'Hepatic CYP1A2, CYP2B6, CYP2D6, UGT1A9; 47% feces, 34% urine',
    criticalAdverseEffects: [
      'Upper respiratory infections and nasopharyngitis',
      'Asymptomatic serum creatine kinase (CK) elevations',
      'Herpes simplex and zoster infections'
    ],
    contraindications: ['Known hypersensitivity to deucravacitinib'],
    trialTitle: 'Deucravacitinib versus Placebo and Apremilast in Plaque Psoriasis (POETYK PSO-1)',
    trialJournal: 'Lancet 2023; 400: 118-132',
    trialYear: 2023
  },
  {
    id: 'drug-faricimab',
    genericName: 'Faricimab-svoa',
    brandNames: ['Vabysmo'],
    therapeuticClass: 'Bispecific Angiopoietin-2 (Ang-2) and Vascular Endothelial Growth Factor A (VEGF-A) Monoclonal Antibody',
    targetSuperfamily: 'Cytokine Biologic - Dual Angiopoietin & Vascular Endothelial Growth Factor (ANGPT2 & VEGFA)',
    specialty: 'ophthalmology',
    fdaApprovalYear: 2022,
    approvedIndications: [
      'Neovascular (Wet) Age-Related Macular Degeneration (nAMD)',
      'Diabetic Macular Edema (DME)',
      'Macular Edema following Retinal Vein Occlusion (RVO)'
    ],
    mechanismOfAction: 'First bispecific antibody approved for the eye. Simultaneously neutralizes both Ang-2 and VEGF-A. By blocking Ang-2, it restores Tie2 signaling, stabilizes vascular endothelial junction integrity, and reduces pericyte dropout; by blocking VEGF-A, it prevents pathological subretinal choroidal neovascularization and exudation.',
    targetName: 'Angiopoietin-2 (Ang-2) & VEGF-A',
    targetType: 'Angiogenic Signaling Ligands',
    targetAction: 'Bispecific Dual Ligand-Neutralizing Antibody',
    bindingAffinity: 'Kd = 20 pM (VEGF-A), 60 pM (Ang-2)',
    biologicalPathways: ['Tie2 Endothelial Vascular Permeability Stabilization', 'Choroidal Neovascularization Suppression & Retinal Fluid Drying'],
    halfLife: '7.5 days in vitreous humor (allows extended 16-week intravitreal dosing intervals)',
    clearanceRoute: 'Ocular outflow into systemic circulation followed by systemic catabolism',
    criticalAdverseEffects: [
      'Endophthalmitis and intraocular inflammation / uveitis',
      'Transient intraocular pressure (IOP) elevations post-injection',
      'Retinal pigment epithelial tears and arterial thromboembolic events'
    ],
    contraindications: ['Ocular or periocular active infection', 'Active intraocular inflammation'],
    trialTitle: 'Efficacy and safety of faricimab for neovascular age-related macular degeneration (TENAYA and LUCERNE)',
    trialJournal: 'Lancet 2022; 399: 729-740',
    trialYear: 2022
  },
  {
    id: 'drug-pegcetacoplan',
    genericName: 'Pegcetacoplan',
    brandNames: ['Empaveli', 'Syfovre (Intravitreal)'],
    therapeuticClass: 'Targeted Complement C3 / C3b Inhibitor PEGylated Peptide',
    targetSuperfamily: 'Complement Cascade - Complement Component 3 (C3 / C3b)',
    specialty: 'hematology',
    fdaApprovalYear: 2021,
    approvedIndications: [
      'Paroxysmal Nocturnal Hemoglobinuria (PNH) in adults',
      'Geographic Atrophy (GA) secondary to Age-Related Macular Degeneration (AMD)'
    ],
    mechanismOfAction: 'Synthetic 15-amino-acid cyclic peptide conjugated to a 40-kDa PEG polymer. Binds specifically to complement C3 and its activation fragment C3b, regulating cleavage of C3 into C3a and C3b and preventing generation of downstream C5 convertase. Controls both terminal C5-mediated intravascular hemolysis and C3b-opsonized extravascular hemolysis in liver and spleen.',
    targetName: 'Complement Protein C3 and C3b',
    targetType: 'Complement Cascade Central Protein',
    targetAction: 'C3 Cleavage & Activation Inhibitor',
    bindingAffinity: 'Kd = 0.2 nM',
    biologicalPathways: ['Proximal Complement Cascade Control', 'Dual Intravascular & Extravascular Hemolysis Prevention', 'Retinal Photoreceptor & RPE Degeneration Deceleration'],
    halfLife: '8 days',
    clearanceRoute: 'Renal elimination of pegylated peptide fragments',
    criticalAdverseEffects: [
      'Encapsulated bacterial infections (Boxed Warning: Meningococcal, pneumococcal, and H. influenzae vaccination mandatory prior to start)',
      'Intraocular retinal vasculitis and occlusive vasculitis with intravitreal formulation',
      'Hypersensitivity reactions'
    ],
    contraindications: ['Unresolved serious infection caused by encapsulated bacteria', 'Active ocular infection (for intravitreal)'],
    trialTitle: 'Pegcetacoplan versus Eculizumab in Paroxysmal Nocturnal Hemoglobinuria (PEGASUS Trial)',
    trialJournal: 'N Engl J Med 2021; 384: 1028-1037',
    trialYear: 2021
  },
  {
    id: 'drug-mitapivat',
    genericName: 'Mitapivat',
    brandNames: ['Pyrukynd'],
    therapeuticClass: 'First-in-Class Erythrocyte Pyruvate Kinase (PKR) Allosteric Activator',
    targetSuperfamily: 'Enzyme - Glycolytic Kinase (PKLR / PKR)',
    specialty: 'hematology',
    fdaApprovalYear: 2022,
    approvedIndications: ['Hemolytic Anemia in adults with Pyruvate Kinase (PK) Deficiency'],
    mechanismOfAction: 'Small-molecule allosteric activator of red blood cell pyruvate kinase (PKR). Binds to a distinct allosteric pocket, stabilizing the active tetrameric PKR conformation and lowering the Km for phosphoenolpyruvate (PEP). Restores glycolytic ATP generation in erythrocytes, maintaining membrane deformability and halting premature splenic hemolysis.',
    targetName: 'Erythrocyte Pyruvate Kinase (PKR / PKLR)',
    targetType: 'Glycolytic Enzyme Tetramer',
    targetAction: 'Allosteric Tetramer Stabilizing Activator',
    bindingAffinity: 'AC50 = 120 nM',
    biologicalPathways: ['Erythrocyte Glycolytic Flux & ATP Replenishment', 'Membrane ATP-Dependent Ion Pump Homeostasis & Splenic Trapping Prevention'],
    bioavailability: '73%',
    halfLife: '3 to 5 hours',
    clearanceRoute: 'Hepatic CYP3A4 primary metabolism; 50% urine, 48% feces',
    criticalAdverseEffects: [
      'Acute hemolysis with abrupt interruption (Boxed Warning: dose must be tapered to prevent rebound hemolysis)',
      'Insomnia, headache, and nausea',
      'Decreased systemic exposure of hormonal contraceptives due to CYP3A induction'
    ],
    contraindications: ['Known hypersensitivity to mitapivat'],
    trialTitle: 'A Phase 3 Trial of Mitapivat in Adults with Pyruvate Kinase Deficiency (ACTIVATE Trial)',
    trialJournal: 'N Engl J Med 2022; 386: 1432-1442',
    trialYear: 2022
  }
];

export const PRECISION_PHARMACOPEIA_300_DRUGS: DrugMonograph[] = SPECS.map(createDrugMonograph);
