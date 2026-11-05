import { DrugMonograph } from '../../types/clinical';

export const ENZYME_DRUGS: DrugMonograph[] = [
  // 1. HMG-CoA Reductase Inhibitors (Statins)
  {
    id: 'drug-atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor', 'Caduet (with Amlodipine)'],
    therapeuticClass: 'HMG-CoA Reductase Inhibitor (Synthetic Statin)',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1996,
    approvedIndications: ['Hypercholesterolemia and Mixed Dyslipidemia', 'Prevention of Cardiovascular Disease in High-Risk Patients', 'Secondary Prevention Post-Acute Coronary Syndrome'],
    mechanismOfAction: 'Competitively inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase, the rate-limiting enzyme in cholesterol biosynthesis. Depletes intracellular hepatic cholesterol, upregulating cell-surface LDL receptors and accelerating plasma LDL-C clearance.',
    molecularTargets: [{ name: 'HMG-CoA Reductase (HMGCR)', type: 'Enzyme (Oxidoreductase)', action: 'Potent Competitive Inhibitor', bindingAffinity: 'Ki = 8 nM' }],
    biologicalPathways: ['Hepatic Mevalonate Pathway Suppression', 'LDL Receptor SREBP-2 Mediated Upregulation', 'Endothelial Nitric Oxide Bioavailability Improvement'],
    pkParameters: { bioavailability: '14% (extensive first-pass mucosal/hepatic extraction)', volumeOfDistribution: '381 L', proteinBinding: '>=98% to albumin', halfLife: '14 hours (active ortho- and parahydroxylated metabolites prolong HMG-CoA inhibitory activity to 20-30 hours)', clearanceRoute: 'Hepatic CYP3A4 primary oxidation; <2% renal excretion', steadyStateTime: '3 days' },
    pgxConsiderations: [{ gene: 'SLCO1B1', alleles: '521T>C (rs4149056)', phenotypeEffect: 'Impaired hepatic OATP1B1 uptake elevates systemic plasma exposure, significantly increasing statin-associated myopathy and rhabdomyolysis risk', cpicDosingRecommendation: 'Limit maximum daily dose to 20-40 mg in SLCO1B1 poor function phenotypes.' }],
    criticalAdverseEffects: ['Statin-associated muscle symptoms (SAMS) and rhabdomyolysis with acute renal failure', 'Hepatotoxicity with serum transaminase elevations >= 3x ULN', 'Dose-dependent slight elevation in fasting blood glucose and HbA1c'],
    contraindications: ['Active liver disease or unexplained persistent transaminase elevations', 'Pregnancy and lactation (historical contraindication; individualized in high-risk patients)'],
    clinicalTrialsReferences: [
      { title: 'Intensive versus Moderate Lipid Lowering with Statins after Acute Coronary Syndromes (PROVE IT-TIMI 22)', journalOrTrialId: 'N Engl J Med 2004; 350: 1495-1504', year: 2004, evidenceTier: 'established' },
      { title: 'Prevention of cardiovascular events with an HMG-CoA reductase inhibitor in patients with diabetes (CARDS)', journalOrTrialId: 'Lancet 2004; 364: 685-696', year: 2004, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-rosuvastatin',
    genericName: 'Rosuvastatin Calcium',
    brandNames: ['Crestor', 'Ezallor Sprinkle'],
    therapeuticClass: 'High-Intensity Hydrophilic HMG-CoA Reductase Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2003,
    approvedIndications: ['Primary Hyperlipidemia and Mixed Dyslipidemia', 'Primary Prevention of Cardiovascular Disease (JUPITER criteria)', 'Homozygous Familial Hypercholesterolemia'],
    mechanismOfAction: 'Enantiomerically pure synthetic statin that binds HMG-CoA reductase with polar methane sulfonamide interactions, delivering the highest LDL-C lowering efficacy (~55-65% at 20-40mg) with minimal CYP3A4 involvement.',
    molecularTargets: [{ name: 'HMG-CoA Reductase (HMGCR)', type: 'Enzyme', action: 'Competitive Inhibitor (High Potency)', bindingAffinity: 'Ki = 0.1 nM' }],
    biologicalPathways: ['Atherosclerotic Plaque Stabilization', 'High-Sensitivity C-Reactive Protein (hs-CRP) Reduction'],
    pkParameters: { bioavailability: '20%', volumeOfDistribution: '134 L', proteinBinding: '88% (substantially less protein-bound than atorvastatin)', halfLife: '19 hours', clearanceRoute: '90% Biliary/Fecal excretion unchanged; 10% Hepatic CYP2C9 metabolism', steadyStateTime: '3 to 5 days' },
    pgxConsiderations: [
      { gene: 'SLCO1B1', alleles: '*5 (521T>C)', phenotypeEffect: 'Increased plasma exposure', cpicDosingRecommendation: 'Prescribe lower initial starting dose (5-10 mg).' },
      { gene: 'ABCG2 (BCRP)', alleles: '421C>A (rs2231142)', phenotypeEffect: 'Doubles rosuvastatin plasma AUC in East Asian descent', cpicDosingRecommendation: 'Initiate therapy at 5 mg daily in East Asian ancestry.' }
    ],
    criticalAdverseEffects: ['Myopathy and rhabdomyolysis', 'Transient benign tubular proteinuria (usually Dipstick 2+ without true nephropathy)', 'Hepatic transaminitis'],
    contraindications: ['Active liver disease', 'Severe renal impairment (CrCl < 30 mL/min) without dose reduction'],
    clinicalTrialsReferences: [{ title: 'Rosuvastatin to Prevent Vascular Events in Men and Women with Elevated C-Reactive Protein (JUPITER)', journalOrTrialId: 'N Engl J Med 2008; 359: 2195-2207', year: 2008, evidenceTier: 'established' }]
  },
  {
    id: 'drug-simvastatin',
    genericName: 'Simvastatin',
    brandNames: ['Zocor', 'Vytorin (with Ezetimibe)'],
    therapeuticClass: 'Lipophilic Statin Prodrug',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1991,
    approvedIndications: ['Hyperlipidemia', 'Cardiovascular Event Reduction in Coronary Heart Disease'],
    mechanismOfAction: 'Inactive lactone prodrug enzymatically hydrolyzed in vivo to the active beta-hydroxyacid, which competitively inhibits HMG-CoA reductase.',
    molecularTargets: [{ name: 'HMG-CoA Reductase (HMGCR)', type: 'Enzyme', action: 'Competitive Inhibitor', bindingAffinity: 'Ki = 1.2 nM' }],
    biologicalPathways: ['Cholesterol Biosynthesis Inhibition', 'Atheroma Stabilization'],
    pkParameters: { bioavailability: '<5% (marked hepatic first-pass extraction)', volumeOfDistribution: 'Extensive tissue distribution', proteinBinding: '95%', halfLife: '3 hours', clearanceRoute: 'Heavy hepatic CYP3A4 metabolism; 60% feces, 13% urine', steadyStateTime: '2 days' },
    pgxConsiderations: [{ gene: 'SLCO1B1', alleles: '521T>C (rs4149056)', phenotypeEffect: 'CC homozygotes have 221% higher AUC and >15-fold higher rhabdomyolysis hazard with 80mg dose', cpicDosingRecommendation: 'Avoid 80 mg dose; CPIC recommends alternative statin or <=20 mg in SLCO1B1 variant carriers.' }],
    criticalAdverseEffects: ['Severe rhabdomyolysis (highest rate among common statins at 80mg dose; 80mg initiation banned by FDA)', 'Drug-drug interactions with CYP3A4 inhibitors (Amiodarone, Amlodipine, Diltiazem, Verapamil)'],
    contraindications: ['Concomitant strong CYP3A4 inhibitors (Ketoconazole, Clarithromycin, HIV protease inhibitors)', 'Active liver disease'],
    clinicalTrialsReferences: [{ title: 'Randomised trial of cholesterol lowering in 4444 patients with coronary heart disease: the Scandinavian Simvastatin Survival Study (4S)', journalOrTrialId: 'Lancet 1994; 344: 1383-1389', year: 1994, evidenceTier: 'established' }]
  },
  {
    id: 'drug-pravastatin',
    genericName: 'Pravastatin Sodium',
    brandNames: ['Pravachol'],
    therapeuticClass: 'Hydrophilic Statin',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1991,
    approvedIndications: ['Primary and Secondary Prevention of Cardiovascular Disease', 'Hyperlipidemia'],
    mechanismOfAction: 'Administered in its active open-ring hydroxyacid form. Highly hydrophilic statin that does not require CYP3A4 metabolism, drastically lowering drug interaction potential.',
    molecularTargets: [{ name: 'HMG-CoA Reductase (HMGCR)', type: 'Enzyme', action: 'Competitive Inhibitor', bindingAffinity: 'Ki = 2.3 nM' }],
    biologicalPathways: ['Hepatic Cholesterol Clearance Acceleration'],
    pkParameters: { bioavailability: '17%', volumeOfDistribution: '0.5 L/kg', proteinBinding: '50%', halfLife: '1.5 to 2 hours', clearanceRoute: 'Dual non-CYP elimination: 70% fecal/biliary, 20% renal unchanged', steadyStateTime: '1 to 2 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Myalgia (substantially lower incidence than lipophilic statins)', 'Mild transaminase elevation'],
    contraindications: ['Active liver disease'],
    clinicalTrialsReferences: [{ title: 'Prevention of cardiovascular events and death with pravastatin in patients with coronary heart disease (LIPID Study)', journalOrTrialId: 'N Engl J Med 1998; 339: 1349-1357', year: 1998, evidenceTier: 'established' }]
  },

  // 2. Angiotensin-Converting Enzyme (ACE) Inhibitors
  {
    id: 'drug-lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril', 'Qbrelis'],
    therapeuticClass: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
    targetSuperfamily: 'Enzyme - Peptidase / Hydrolase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1987,
    approvedIndications: ['Hypertension', 'Heart Failure with Reduced Ejection Fraction (HFrEF)', 'Acute Myocardial Infarction Post-Stabilization Survival Improvement'],
    mechanismOfAction: 'Synthetic lysine derivative of enalaprilat that directly and competitively inhibits zinc-metallopeptidase ACE without requiring prodrug ester hydrolysis. Blocks conversion of Angiotensin I to Angiotensin II and prevents bradykinin degradation.',
    molecularTargets: [{ name: 'Angiotensin-Converting Enzyme (ACE / Kininase II)', type: 'Zinc Metallopeptidase', action: 'Competitive Transition-State Inhibitor', bindingAffinity: 'Ki = 0.1 nM' }],
    biologicalPathways: ['Angiotensin II Mediated Efferent Arteriolar Vasoconstriction Relief', 'Bradykinin Kallikrein-Kinin Vasodilator Amplification', 'Aldosterone Secretion Suppression'],
    pkParameters: { bioavailability: '25% (unaffected by food)', volumeOfDistribution: '124 L', proteinBinding: 'Negligible (only bound to circulating ACE enzyme)', halfLife: '12 hours (effective accumulation half-life)', clearanceRoute: '100% Renal excretion (Unchanged parent drug in urine)', steadyStateTime: '3 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: [
      'Intractable dry nonproductive bradykinin cough (in 10-20% of patients; requires switch to ARB)',
      'Life-threatening angioedema (swelling of tongue, glottis, larynx; up to 5x higher in Black patients)',
      'Hyperkalemia (especially with CKD or K-sparing diuretics)',
      'Fetal Toxicity in 2nd/3rd trimester (Boxed Warning)'
    ],
    contraindications: ['History of ACE-inhibitor-induced angioedema (Black Box Warning)', 'Pregnancy (Black Box Warning)', 'Concomitant use with sacubitril (requires 36-hour washout to prevent fatal angioedema)'],
    clinicalTrialsReferences: [
      { title: 'Comparative effects of low and high doses of the angiotensin-converting enzyme inhibitor, lisinopril, in heart failure (ATLAS)', journalOrTrialId: 'Circulation 1999; 100: 2312-2318', year: 1999, evidenceTier: 'established' },
      { title: 'Effects of lisinopril on mortality in acute myocardial infarction (GISSI-3)', journalOrTrialId: 'Lancet 1994; 343: 1115-1122', year: 1994, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-enalapril',
    genericName: 'Enalapril Maleate',
    brandNames: ['Vasotec', 'Epaned'],
    therapeuticClass: 'ACE Inhibitor (Prodrug)',
    targetSuperfamily: 'Enzyme - Peptidase / Hydrolase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1985,
    approvedIndications: ['Hypertension', 'Symptomatic Heart Failure (NYHA Class II-IV)', 'Asymptomatic Left Ventricular Dysfunction (EF <= 35%)'],
    mechanismOfAction: 'Ethyl ester prodrug de-esterified by hepatic carboxylesterases into enalaprilat, a potent inhibitor of ACE that decreases systemic vascular resistance and reduces cardiac ventricular remodeling.',
    molecularTargets: [{ name: 'Angiotensin-Converting Enzyme (ACE)', type: 'Zinc Metallopeptidase', action: 'Inhibitor (Enalaprilat)', bindingAffinity: 'Ki = 0.2 nM' }],
    biologicalPathways: ['RAAS Axis Suppression', 'Left Ventricular Remodeling Prevention'],
    pkParameters: { bioavailability: '60% (enalapril absorption)', volumeOfDistribution: '0.2 L/kg', proteinBinding: '50%', halfLife: '11 hours (enalaprilat)', clearanceRoute: 'Renal excretion (90% as enalaprilat and enalapril)', steadyStateTime: '3 to 4 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Dry cough (bradykinin accumulation)', 'Angioedema', 'First-dose hypotension in volume-depleted patients', 'Fetal toxicity (Boxed Warning)'],
    contraindications: ['History of angioedema', 'Pregnancy', 'Concurrent sacubitril within 36 hours'],
    clinicalTrialsReferences: [{ title: 'Effect of enalapril on survival in patients with reduced left ventricular ejection fractions and congestive heart failure (SOLVD)', journalOrTrialId: 'N Engl J Med 1991; 325: 293-302', year: 1991, evidenceTier: 'established' }]
  },
  {
    id: 'drug-ramipril',
    genericName: 'Ramipril',
    brandNames: ['Altace'],
    therapeuticClass: 'Lipophilic Tissue-Active ACE Inhibitor',
    targetSuperfamily: 'Enzyme - Peptidase / Hydrolase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1991,
    approvedIndications: ['Hypertension', 'Cardiovascular Risk Reduction in Patients >= 55 Years with Vascular Disease', 'Heart Failure Post-Myocardial Infarction'],
    mechanismOfAction: 'Lipophilic prodrug rapidly converted by liver esterases to ramiprilat, which exhibits potent and tight-binding inhibition of both plasma and local tissue ACE (vascular wall, myocardium, and kidney).',
    molecularTargets: [{ name: 'ACE (Kininase II)', type: 'Zinc Metallopeptidase', action: 'Tight-Binding Inhibitor', bindingAffinity: 'Ki = 0.07 nM' }],
    biologicalPathways: ['Endothelial Nitric Oxide Restoration', 'Atherosclerotic Plaque Vulnerability Damping'],
    pkParameters: { bioavailability: '50% to 60%', volumeOfDistribution: 'High tissue penetration', proteinBinding: '56% (ramipril), 73% (ramiprilat)', halfLife: 'Triphasic: terminal elimination half-life 13-17 hours (represents slow dissociation from tissue ACE)', clearanceRoute: '60% Renal, 40% Biliary excretion of ramiprilat and glucuronides', steadyStateTime: '4 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Dry persistent cough', 'Angioedema', 'Hyperkalemia', 'Fetal harm (Boxed Warning)'],
    contraindications: ['Pregnancy', 'Angioedema history', 'Concomitant sacubitril'],
    clinicalTrialsReferences: [{ title: 'Effects of an angiotensin-converting-enzyme inhibitor, ramipril, on cardiovascular events in high-risk patients (HOPE Trial)', journalOrTrialId: 'N Engl J Med 2000; 342: 145-153', year: 2000, evidenceTier: 'established' }]
  },

  // 3. Cyclooxygenase (COX-1 / COX-2) Inhibitors (NSAIDs)
  {
    id: 'drug-ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Caldolor (IV)'],
    therapeuticClass: 'Non-Selective Nonsteroidal Anti-Inflammatory Drug (NSAID)',
    targetSuperfamily: 'Enzyme - Oxidoreductase / Peroxidase',
    specialty: 'analgesia',
    fdaApprovalYear: 1974,
    approvedIndications: ['Mild to Moderate Pain and Dysmenorrhea', 'Osteoarthritis and Rheumatoid Arthritis', 'Fever Reduction', 'Patent Ductus Arteriosus Closure in Preterm Infants (IV NeoProfen)'],
    mechanismOfAction: 'Reversibly and nonselectively inhibits cyclooxygenase-1 (COX-1) and cyclooxygenase-2 (COX-2) enzymes, terminating conversion of arachidonic acid to pro-inflammatory prostaglandins (PGE2, PGD2) and thromboxane A2 (TXA2).',
    molecularTargets: [
      { name: 'Cyclooxygenase-1 (PTGS1 / COX-1)', type: 'Enzyme', action: 'Reversible Competitive Inhibitor', bindingAffinity: 'IC50 = 2.6 uM' },
      { name: 'Cyclooxygenase-2 (PTGS2 / COX-2)', type: 'Enzyme', action: 'Reversible Competitive Inhibitor', bindingAffinity: 'IC50 = 1.5 uM' }
    ],
    biologicalPathways: ['Peripheral Nociceptor Prostaglandin Sensitization Reversal', 'Thermoregulatory Hypothalamic PGE2 Suppression', 'Renal Afferent Arteriolar Vasodilatory Prostaglandin Inhibition'],
    pkParameters: { bioavailability: '80% (rapid GI absorption)', volumeOfDistribution: '0.12 L/kg', proteinBinding: '99% to albumin', halfLife: '1.8 to 2 hours', clearanceRoute: 'Hepatic CYP2C9 oxidation to inactive hydroxy- and carboxy-ibuprofen metabolites; 90% renal', steadyStateTime: '1 day' },
    pgxConsiderations: [{ gene: 'CYP2C9', alleles: '*2, *3 (Poor Metabolizers)', phenotypeEffect: 'Significantly prolonged drug clearance and 2- to 3-fold higher AUC, elevating gastrointestinal bleeding risk', cpicDosingRecommendation: 'CPIC Guideline recommends 50% dose reduction in CYP2C9 intermediate metabolizers and alternative non-NSAID in poor metabolizers.' }],
    criticalAdverseEffects: [
      'Gastrointestinal bleeding, ulceration, and perforation (Boxed Warning: fatal GI events can occur without warning)',
      'Cardiovascular thrombotic events, myocardial infarction, and stroke (Boxed Warning: risk starts within first weeks of use)',
      'Acute Kidney Injury via afferent arteriolar constriction (Triple Whammy when combined with ACEI and diuretic)',
      'Fluid retention and blunting of antihypertensive medications'
    ],
    contraindications: ['In the setting of CABG surgery (Black Box Warning)', 'Active peptic ulcer disease or GI bleeding', 'Severe renal impairment (eGFR < 30 mL/min)', 'Aspirin-induced asthma / Samter\'s Triad'],
    clinicalTrialsReferences: [{ title: 'Cardiovascular safety of celecoxib, naproxen, or ibuprofen for arthritis (PRECISION Trial)', journalOrTrialId: 'N Engl J Med 2016; 375: 2519-2529', year: 2016, evidenceTier: 'established' }]
  },
  {
    id: 'drug-celecoxib',
    genericName: 'Celecoxib',
    brandNames: ['Celebrex', 'Elyxyb'],
    therapeuticClass: 'Selective Cyclooxygenase-2 (COX-2) Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase / Peroxidase',
    specialty: 'analgesia',
    fdaApprovalYear: 1998,
    approvedIndications: ['Osteoarthritis and Rheumatoid Arthritis', 'Ankylosing Spondylitis', 'Acute Pain and Primary Dysmenorrhea'],
    mechanismOfAction: 'Possesses a bulky sulfonamide side-chain that selectively lodges in the distinct hydrophilic side-pocket of COX-2 (~30-fold selectivity over COX-1), suppressing inflammatory prostaglandins while sparing gastroprotective COX-1 prostaglandins in gastric mucosa.',
    molecularTargets: [
      { name: 'Cyclooxygenase-2 (PTGS2 / COX-2)', type: 'Enzyme', action: 'Selective Competitive Inhibitor', bindingAffinity: 'IC50 = 0.04 uM' },
      { name: 'Cyclooxygenase-1 (PTGS1 / COX-1)', type: 'Enzyme', action: 'Weak Inhibitor (Sparing gastric mucosa)', bindingAffinity: 'IC50 = 1.2 uM' }
    ],
    biologicalPathways: ['Inflammatory Synovial PGE2 Synthesis Abolition', 'Gastric Mucosal Prostaglandin Preservation'],
    pkParameters: { bioavailability: 'Peak plasma levels at 3 hours; increased with high-fat meals', volumeOfDistribution: '400 L', proteinBinding: '97%', halfLife: '11 hours', clearanceRoute: 'Hepatic CYP2C9 methyl hydroxylation to inactive metabolites; <3% renal', steadyStateTime: '5 days' },
    pgxConsiderations: [{ gene: 'CYP2C9', alleles: '*2, *3 (rs1057910)', phenotypeEffect: 'CYP2C9*3/*3 poor metabolizers exhibit 3-fold higher plasma exposure and drastically delayed clearance', cpicDosingRecommendation: 'CPIC recommends 50% dose reduction in intermediate metabolizers; avoid or use lowest dose in poor metabolizers.' }],
    criticalAdverseEffects: ['Cardiovascular thrombotic risk (Boxed Warning: unhindered platelet COX-1 TXA2 synthesis without endothelial COX-2 PGI2 balancing)', 'Hypertension and edema', 'Sulfa allergic cross-reactivity'],
    contraindications: ['History of asthma, urticaria, or allergic-type reactions after aspirin or sulfonamides', 'In setting of CABG surgery'],
    clinicalTrialsReferences: [{ title: 'Gastrointestinal Toxicity with Celecoxib vs Nonsteroidal Anti-inflammatory Drugs (CLASS Study)', journalOrTrialId: 'JAMA 2000; 284: 1247-1255', year: 2000, evidenceTier: 'established' }]
  },
  {
    id: 'drug-aspirin',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    brandNames: ['Bayer Aspirin', 'Ecotrin', 'Durlaza'],
    therapeuticClass: 'Irreversible COX-1/COX-2 Inhibitor & Antiplatelet Agent',
    targetSuperfamily: 'Enzyme - Oxidoreductase / Peroxidase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1899,
    approvedIndications: ['Acute Coronary Syndromes (NSTEMI, STEMI, Unstable Angina)', 'Secondary Prevention of MI and Ischemic Stroke', 'Analgesia and Anti-inflammatory Antipyresis'],
    mechanismOfAction: 'Covalently acetylates Serine-529 in COX-1 and Serine-516 in COX-2. Because platelets lack nuclei and cannot synthesize new protein, platelet COX-1 inhibition and thromboxane A2 suppression persist for the entire 7-10 day lifespan of the platelet.',
    molecularTargets: [
      { name: 'Cyclooxygenase-1 (COX-1 / PTGS1)', type: 'Enzyme', action: 'Irreversible Covalent Ser529 Acetylator', bindingAffinity: 'IC50 = 1.7 uM' },
      { name: 'Cyclooxygenase-2 (COX-2 / PTGS2)', type: 'Enzyme', action: 'Irreversible Covalent Ser516 Acetylator (Switches COX-2 to generate 15-epi-lipoxin A4)', bindingAffinity: 'IC50 = 100 uM' }
    ],
    biologicalPathways: ['Platelet Thromboxane A2 Aggregation Silencing', 'Aspirin-Triggered Resolvin and Lipoxin Synthesis', 'Gastric Bicarbonate Mucus Barrier Depletion'],
    pkParameters: { bioavailability: '50% to 75% (rapid gastric and upper small intestinal absorption)', volumeOfDistribution: '0.15 L/kg', proteinBinding: '90% (salicylate)', halfLife: '15 to 20 minutes (aspirin), 2 to 30 hours (salicylate, dose-dependent saturable kinetics)', clearanceRoute: 'Rapid plasma esterase hydrolysis to salicylic acid; hepatic conjugation with glycine (salicyluric acid)', steadyStateTime: 'Platelet inhibition achieved within 30 minutes of chewable dose' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Upper gastrointestinal ulceration and erosive gastritis', 'Major bleeding diathesis', 'Aspirin-Exacerbated Respiratory Disease (AERD / Samter\'s Triad: severe bronchospasm in asthmatics)', 'Reye\'s Syndrome in pediatric viral infections'],
    contraindications: ['Children or teenagers with viral illness (chickenpox/influenza) due to Reye\'s Syndrome risk', 'Active GI bleeding', 'Known aspirin hypersensitivity'],
    clinicalTrialsReferences: [{ title: 'Collaborative meta-analysis of randomised trials of antiplatelet therapy for prevention of death, myocardial infarction, and stroke in high risk patients', journalOrTrialId: 'BMJ 2002; 324: 71-86', year: 2002, evidenceTier: 'established' }]
  },

  // 4. Phosphodiesterase (PDE) Inhibitors
  {
    id: 'drug-sildenafil',
    genericName: 'Sildenafil Citrate',
    brandNames: ['Viagra', 'Revatio'],
    therapeuticClass: 'Phosphodiesterase-5 (PDE5) Inhibitor',
    targetSuperfamily: 'Enzyme - Hydrolase / Phosphodiesterase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 1998,
    approvedIndications: ['Erectile Dysfunction (Viagra)', 'Pulmonary Arterial Hypertension (Revatio, WHO Group 1)'],
    mechanismOfAction: 'Selective and competitive inhibitor of cyclic guanosine monophosphate (cGMP)-specific phosphodiesterase type 5 (PDE5). Prevents cGMP degradation in the corpus cavernosum and pulmonary arterial smooth muscle, enhancing nitric oxide (NO)-mediated vasodilation.',
    molecularTargets: [
      { name: 'Phosphodiesterase-5A (PDE5A)', type: 'Enzyme (cAMP/cGMP Hydrolase)', action: 'Potent Competitive Inhibitor', bindingAffinity: 'IC50 = 3.5 nM' },
      { name: 'Phosphodiesterase-6 (PDE6 / Retinal Photoreceptor)', type: 'Enzyme', action: 'Moderate Inhibitor (Causes blue-tinted vision / cyanopsia)', bindingAffinity: 'IC50 = 34 nM' }
    ],
    biologicalPathways: ['Nitric Oxide / cGMP / Protein Kinase G Vasodilatory Axis', 'Pulmonary Arteriole Pressure Reduction', 'Corpus Cavernosum Smooth Muscle Relaxation'],
    pkParameters: { bioavailability: '40% (high first-pass metabolism; high-fat meal delays Tmax by 60 min)', volumeOfDistribution: '105 L', proteinBinding: '96%', halfLife: '4 hours', clearanceRoute: 'Hepatic CYP3A4 (major 80%) and CYP2C9 (minor) oxidation to active N-desmethyl metabolite (UK-103,320); 80% feces, 13% urine', steadyStateTime: 'Immediate clinical pharmacodynamic window: 30-120 minutes' },
    pgxConsiderations: [],
    criticalAdverseEffects: [
      'Profound, life-threatening refractory hypotension when co-administered with organic nitrates (Nitroglycerin, Isosorbide)',
      'Non-Arteritic Anterior Ischemic Optic Neuropathy (NAION / sudden vision loss)',
      'Cyanopsia (blue-tinged vision due to retinal PDE6 cross-inhibition)',
      'Priapism (>4 hours duration requiring urgent urological decompression)'
    ],
    contraindications: ['Concomitant use of organic nitrates or nitric oxide donors in any form (Absolute Contraindication)', 'Concomitant soluble guanylate cyclase stimulators (Riociguat)'],
    clinicalTrialsReferences: [
      { title: 'Sildenafil for the treatment of erectile dysfunction', journalOrTrialId: 'N Engl J Med 1998; 338: 1397-1404', year: 1998, evidenceTier: 'established' },
      { title: 'Sildenafil Citrate Therapy for Pulmonary Arterial Hypertension (SUPER-1)', journalOrTrialId: 'N Engl J Med 2005; 353: 2148-2157', year: 2005, evidenceTier: 'established' }
    ]
  },
  {
    id: 'drug-tadalafil',
    genericName: 'Tadalafil',
    brandNames: ['Cialis', 'Adcirca', 'Alyq'],
    therapeuticClass: 'Long-Acting Phosphodiesterase-5 Inhibitor',
    targetSuperfamily: 'Enzyme - Hydrolase / Phosphodiesterase',
    specialty: 'cardiometabolic',
    fdaApprovalYear: 2003,
    approvedIndications: ['Erectile Dysfunction', 'Benign Prostatic Hyperplasia (BPH) Lower Urinary Tract Symptoms', 'Pulmonary Arterial Hypertension (Adcirca)'],
    mechanismOfAction: 'Selective PDE5 inhibitor with exceptionally long half-life (17.5 hours) allowing daily dosing. Exhibits >10,000-fold selectivity for PDE5 over retinal PDE6 (no cyanopsia), but modest affinity for skeletal muscle PDE11.',
    molecularTargets: [
      { name: 'Phosphodiesterase-5A (PDE5A)', type: 'Enzyme', action: 'Selective Competitive Inhibitor', bindingAffinity: 'IC50 = 0.94 nM' },
      { name: 'Phosphodiesterase-11A (PDE11A)', type: 'Enzyme', action: 'Moderate Inhibitor (Causes myalgias/back pain)', bindingAffinity: 'IC50 = 10 nM' }
    ],
    biologicalPathways: ['cGMP-Dependent Prostatic Smooth Muscle Relaxation', 'Prolonged Vascular Nitric Oxide Amplification'],
    pkParameters: { bioavailability: 'Rapidly absorbed, unaffected by food', volumeOfDistribution: '63 L', proteinBinding: '94%', halfLife: '17.5 hours', clearanceRoute: 'Hepatic CYP3A4 to catechol/methylcatechol glucuronides; 61% feces, 36% urine', steadyStateTime: '5 days of once-daily dosing' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Catastrophic hypotension with organic nitrates (requires minimum 48-hour separation)', 'Lower back pain and myalgias (due to PDE11 inhibition)', 'NAION and sudden sensorineural hearing loss'],
    contraindications: ['Organic nitrates (Nitroglycerin, Isosorbide Mononitrate)', 'Riociguat'],
    clinicalTrialsReferences: [{ title: 'Tadalafil for the treatment of erectile dysfunction', journalOrTrialId: 'Eur Urol 2004; 45: 639-646', year: 2004, evidenceTier: 'established' }]
  },
  {
    id: 'drug-apremilast',
    genericName: 'Apremilast',
    brandNames: ['Otezla'],
    therapeuticClass: 'Small-Molecule Phosphodiesterase-4 (PDE4) Inhibitor',
    targetSuperfamily: 'Enzyme - Hydrolase / Phosphodiesterase',
    specialty: 'dermatology',
    fdaApprovalYear: 2014,
    approvedIndications: ['Plaque Psoriasis in Adult Candidates for Systemic Therapy', 'Active Psoriatic Arthritis', 'Behçet\'s Disease Oral Ulcers'],
    mechanismOfAction: 'Inhibits PDE4, the major cAMP-metabolizing enzyme in immune and inflammatory cells. Elevates intracellular cyclic AMP, activating protein kinase A (PKA) to downregulate pro-inflammatory cytokines (TNF-alpha, IL-17, IL-23, IFN-gamma) and upregulate anti-inflammatory IL-10.',
    molecularTargets: [{ name: 'Phosphodiesterase-4 (PDE4A, 4B, 4C, 4D)', type: 'Enzyme', action: 'Allosteric / Catalytic Site Inhibitor', bindingAffinity: 'IC50 = 74 nM' }],
    biologicalPathways: ['cAMP-Mediated Pro-inflammatory Cytokine Suppression', 'Keratinocyte Hyperproliferation Reversal'],
    pkParameters: { bioavailability: '73%', volumeOfDistribution: '87 L', proteinBinding: '68%', halfLife: '6 to 9 hours', clearanceRoute: 'Multiple non-enzymatic cleavage pathways and hepatic CYP3A4 metabolism; 58% urine, 39% feces', steadyStateTime: '3 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Severe gastrointestinal intolerance (nausea and diarrhea in up to 17% during titration)', 'Depression, mood changes, and suicidal thoughts', 'Weight loss (5-10% of body weight)'],
    contraindications: ['Known hypersensitivity to apremilast'],
    clinicalTrialsReferences: [{ title: 'Apremilast for patients with moderate to severe plaque psoriasis (ESTEEM 1)', journalOrTrialId: 'Lancet 2015; 386: 559-572', year: 2015, evidenceTier: 'established' }]
  },

  // 5. Dipeptidyl Peptidase-4 (DPP-4) Inhibitors (Gliptins)
  {
    id: 'drug-sitagliptin',
    genericName: 'Sitagliptin Phosphate',
    brandNames: ['Januvia', 'Janumet (with Metformin)'],
    therapeuticClass: 'Dipeptidyl Peptidase-4 (DPP-4) Inhibitor (Gliptin)',
    targetSuperfamily: 'Enzyme - Peptidase / Hydrolase',
    specialty: 'endocrinology',
    fdaApprovalYear: 2006,
    approvedIndications: ['Type 2 Diabetes Mellitus Glycemic Control (Monotherapy and Combination)'],
    mechanismOfAction: 'Competitively inhibits dipeptidyl peptidase-4 (DPP-4), an enzyme that rapidly cleaves and inactivates incretin hormones GLP-1 and GIP. Prolongs endogenous active incretin levels, stimulating glucose-dependent insulin secretion from pancreatic beta cells and inhibiting inappropriately elevated glucagon.',
    molecularTargets: [{ name: 'Dipeptidyl Peptidase-4 (DPP-4 / CD26)', type: 'Serine Exopeptidase', action: 'Potent Competitive Inhibitor', bindingAffinity: 'IC50 = 18 nM (>2600-fold selective over DPP-8/9)' }],
    biologicalPathways: ['Endogenous Incretin Hormone Stabilization', 'Glucose-Dependent Beta-Cell Insulin Release', 'Alpha-Cell Glucagon Suppression'],
    pkParameters: { bioavailability: '87%', volumeOfDistribution: '198 L', proteinBinding: '38%', halfLife: '12.4 hours', clearanceRoute: '79% Renal excretion (Active tubular secretion via OAT3 and ABCB1); minimal CYP3A4/CYP2C8 metabolism', steadyStateTime: '2 to 3 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: [
      'Severe disabling arthralgia / joint pain (FDA Drug Safety Warning)',
      'Acute pancreatitis (including necrotizing forms)',
      'Bullous pemphigoid (autoimmune blistering skin condition requiring discontinuation)',
      'Drug accumulation in renal impairment (requires dose reduction to 50mg if eGFR 30-45, 25mg if eGFR < 30)'
    ],
    contraindications: ['History of serious hypersensitivity (anaphylaxis, angioedema, Stevens-Johnson syndrome)'],
    clinicalTrialsReferences: [{ title: 'Effect of Sitagliptin on Cardiovascular Outcomes in Type 2 Diabetes (TECOS)', journalOrTrialId: 'N Engl J Med 2015; 373: 232-242', year: 2015, evidenceTier: 'established' }]
  },
  {
    id: 'drug-linagliptin',
    genericName: 'Linagliptin',
    brandNames: ['Tradjenta', 'Jentadueto (with Metformin)'],
    therapeuticClass: 'Non-Renally Cleared DPP-4 Inhibitor',
    targetSuperfamily: 'Enzyme - Peptidase / Hydrolase',
    specialty: 'endocrinology',
    fdaApprovalYear: 2011,
    approvedIndications: ['Type 2 Diabetes Mellitus (requires NO dose adjustments across all stages of renal or hepatic impairment)'],
    mechanismOfAction: 'Highly potent, xanthine-based DPP-4 inhibitor. Uniquely eliminated via the biliary/fecal route, eliminating any requirement for dose adjustment in patients with chronic kidney disease or renal failure.',
    molecularTargets: [{ name: 'Dipeptidyl Peptidase-4 (DPP-4)', type: 'Serine Exopeptidase', action: 'High-Affinity Inhibitor', bindingAffinity: 'IC50 = 1 nM' }],
    biologicalPathways: ['Incretin Prolongation without Renal Excretion Dependency'],
    pkParameters: { bioavailability: '30%', volumeOfDistribution: '1110 L (extensive tissue binding)', proteinBinding: 'Concentration-dependent (99% at low therapeutic concentrations)', halfLife: 'Terminal elimination half-life >100 hours (reflects tight binding to DPP-4 enzyme)', clearanceRoute: '80% Enterohepatic / Biliary excretion in feces unchanged; <5% renal excretion', steadyStateTime: '3 to 4 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: ['Acute pancreatitis', 'Severe joint pain', 'Nasopharyngitis'],
    contraindications: ['Known hypersensitivity to linagliptin'],
    clinicalTrialsReferences: [{ title: 'Cardiovascular and Renal Outcomes with Linagliptin in Type 2 Diabetes (CARMELINA)', journalOrTrialId: 'JAMA 2019; 321: 69-79', year: 2019, evidenceTier: 'established' }]
  },

  // 6. Xanthine Oxidase Inhibitors (Gout)
  {
    id: 'drug-allopurinol',
    genericName: 'Allopurinol',
    brandNames: ['Zyloprim', 'Aloprim (IV)'],
    therapeuticClass: 'Xanthine Oxidase Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'immunology',
    fdaApprovalYear: 1966,
    approvedIndications: ['Chronic Gout Prophylaxis and Hyperuricemia', 'Tumor Lysis Syndrome Prophylaxis during Chemotherapy', 'Recurrent Calcium Oxalate Renal Calculi'],
    mechanismOfAction: 'Purine analog that is oxidized by xanthine oxidase to its active metabolite oxypurinol (alloxanthine). Both allopurinol and oxypurinol inhibit xanthine oxidase, halting the conversion of hypoxanthine to xanthine and xanthine to uric acid.',
    molecularTargets: [
      { name: 'Xanthine Oxidase (XOR / XO)', type: 'Molybdenum Enzyme', action: 'Competitive Inhibitor (Allopurinol) & Noncompetitive Transition-State Inhibitor (Oxypurinol)', bindingAffinity: 'Ki = 0.5 uM' }
    ],
    biologicalPathways: ['Purine Catabolic Uric Acid Formation Halt', 'Intracellular Hypoxanthine Salvage Recycling via HGPRT'],
    pkParameters: { bioavailability: '80%', volumeOfDistribution: '1.6 L/kg', proteinBinding: '0%', halfLife: '1 to 2 hours (allopurinol), 18 to 30 hours (active metabolite oxypurinol; accumulates dramatically in renal impairment)', clearanceRoute: 'Renal excretion of oxypurinol (active tubular reabsorption in proximal tubule)', steadyStateTime: '7 days' },
    pgxConsiderations: [{
      gene: 'HLA-B',
      alleles: 'HLA-B*58:01',
      phenotypeEffect: 'Extreme genetic predisposition to fatal Allopurinol Hypersensitivity Syndrome (AHS: DRESS, Stevens-Johnson Syndrome, Toxic Epidermal Necrolysis; ~80-fold hazard ratio)',
      cpicDosingRecommendation: 'CPIC Guideline: HLA-B*58:01 screening strongly recommended in patients of Southeast Asian, African American, and Han Chinese descent. Do NOT prescribe allopurinol if HLA-B*58:01 positive.'
    }],
    criticalAdverseEffects: [
      'Allopurinol Hypersensitivity Syndrome (AHS: fever, toxic skin desquamation, eosinophilia, acute renal/hepatic failure - mortality 20-25%)',
      'Acute gout flares during treatment initiation (due to rapid dissolution of synovial tophi; requires colchicine/NSAID prophylaxis)',
      'Severe drug interaction with Azathioprine / 6-Mercaptopurine (inhibits 6-MP catabolism, causing lethal bone marrow aplasia unless 6-MP dose reduced by 75%)'
    ],
    contraindications: ['Known carriers of HLA-B*58:01 allele', 'Severe previous hypersensitivity reaction to allopurinol'],
    clinicalTrialsReferences: [{ title: 'Allopurinol versus usual care in patients with chronic kidney disease (CKD-FIX)', journalOrTrialId: 'N Engl J Med 2020; 382: 2494-2504', year: 2020, evidenceTier: 'established' }]
  },

  // 7. Dihydrofolate Reductase (DHFR) Inhibitors
  {
    id: 'drug-methotrexate',
    genericName: 'Methotrexate Sodium',
    brandNames: ['Trexall', 'Rasuvo', 'Otrexup'],
    therapeuticClass: 'Antifolate Antimetabolite & DHFR Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'immunology',
    fdaApprovalYear: 1953,
    approvedIndications: ['Rheumatoid Arthritis (once-weekly regimen)', 'Severe Psoriasis', 'Acute Lymphoblastic Leukemia (ALL)', 'Osteosarcoma & Choriocarcinoma'],
    mechanismOfAction: 'Folic acid congener that undergoes intracellular polyglutamylation. Irreversibly binds and inhibits dihydrofolate reductase (DHFR) with 1000-fold higher affinity than folate, depleting tetrahydrofolate (THF) cofactors required for thymidylate (dTMP) and de novo purine synthesis. In RA, inhibits AICAR transformylase, accumulating adenosine to exert potent anti-inflammatory effects.',
    molecularTargets: [
      { name: 'Dihydrofolate Reductase (DHFR)', type: 'Enzyme', action: 'Pseudoirreversible Tight-Binding Inhibitor', bindingAffinity: 'Ki = 0.001 nM' },
      { name: 'AICAR Transformylase (ATIC)', type: 'Enzyme', action: 'Inhibitor (Polyglutamylated form stimulates adenosine release)', bindingAffinity: 'Ki = 5 uM' }
    ],
    biologicalPathways: ['De Novo Thymidylate & Purine Synthesis Shutdown', 'Extracellular Adenosine Anti-Inflammatory Signaling', 'S-Phase DNA Synthesis Arrest'],
    pkParameters: { bioavailability: '60% (oral low dose in RA); saturable absorption above 15 mg/m²', volumeOfDistribution: '0.4 to 0.8 L/kg (distributes into pleural effusions/ascites "third-spacing" prolonging toxicity)', proteinBinding: '50%', halfLife: '3 to 10 hours (low dose), up to 15 hours in third-spacing', clearanceRoute: '80% to 90% Renal glomerular filtration and active tubular secretion (inhibited by NSAIDs/penicillins); 10% biliary', steadyStateTime: 'Once-weekly dosing' },
    pgxConsiderations: [{ gene: 'MTHFR', alleles: '677C>T (rs1801133)', phenotypeEffect: 'Altered homocysteine and folate metabolism; increased risk of toxicity', cpicDosingRecommendation: 'Co-prescribe daily folic acid (1-5 mg) except on day of MTX.' }],
    criticalAdverseEffects: [
      'Bone marrow suppression / pancytopenia (Boxed Warning)',
      'Hepatotoxicity, fibrosis, and cirrhosis with cumulative lifetime doses (Boxed Warning: baseline and serial LFTs)',
      'Acute and chronic pulmonary interstitial pneumonitis (Boxed Warning)',
      'Fetal death and congenital malformations (Boxed Warning: Teratogenic)',
      'Severe fatal medication errors from daily rather than once-weekly administration'
    ],
    contraindications: ['Pregnancy and breastfeeding (Black Box Warning)', 'Severe renal impairment (eGFR < 30 mL/min)', 'Pre-existing blood dyscrasias or chronic liver disease'],
    clinicalTrialsReferences: [{ title: 'Low-dose methotrexate for the prevention of atherosclerotic events (CIRT)', journalOrTrialId: 'N Engl J Med 2019; 380: 752-762', year: 2019, evidenceTier: 'established' }]
  },

  // 8. Proton Pump Inhibitors (H+/K+-ATPase)
  {
    id: 'drug-omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Zegerid (with Sodium Bicarbonate)'],
    therapeuticClass: 'Proton Pump Inhibitor (Substituted Benzimidazole)',
    targetSuperfamily: 'Enzyme - P-type ATPase / Hydrolase',
    specialty: 'gastroenterology',
    fdaApprovalYear: 1989,
    approvedIndications: ['Gastroesophageal Reflux Disease (GERD)', 'Erosive Esophagitis', 'Duodenal and Gastric Ulcers', 'Helicobacter pylori Eradication (Combination Therapy)', 'Zollinger-Ellison Syndrome'],
    mechanismOfAction: 'Lipophilic weak base prodrug that concentrates in the acidic canaliculi of gastric parietal cells (pH < 1.0). Protonated into an active tetracyclic sulfenamide that forms an irreversible covalent disulfide bond with Cys813 on the alpha-subunit of the H+/K+-ATPase pump, completely arresting acid secretion.',
    molecularTargets: [{ name: 'Gastric H+/K+-ATPase (Proton Pump)', type: 'Ion-Transporting P-type ATPase', action: 'Irreversible Covalent Disulfide Cys813 Inhibitor', bindingAffinity: 'Covalent Adduct' }],
    biologicalPathways: ['Final Common Pathway of Gastric Acid Secretion Ablation', 'Gastric pH Elevation (>4.0) for Mucosal Healing'],
    pkParameters: { bioavailability: '30% to 40% (acid-labile; formulated with enteric coating); increases with repeated dosing to 60%', volumeOfDistribution: '0.3 L/kg', proteinBinding: '95%', halfLife: '0.5 to 1.0 hour (short plasma half-life contrasting with 24-72 hour pharmacological duration due to covalent pump inactivation)', clearanceRoute: 'Hepatic CYP2C19 (80%) 5-hydroxylation and CYP3A4 sulfoxidation; 80% urine, 20% feces', steadyStateTime: '3 to 5 days for maximal acid inhibition' },
    pgxConsiderations: [{
      gene: 'CYP2C19',
      alleles: '*2, *3 (Poor) vs *17 (Ultrarapid)',
      phenotypeEffect: 'Poor metabolizers have 4-fold higher AUC and higher H. pylori cure rates; ultrarapid (*17) metabolizers have lower AUC and higher rates of treatment failure',
      cpicDosingRecommendation: 'CPIC Guideline: Increase dose by 100% in CYP2C19 ultrarapid metabolizers for GERD/H. pylori; standard dosing for poor metabolizers.'
    }],
    criticalAdverseEffects: [
      'Clostridioides difficile-associated diarrhea (CDAD) due to hypochlorhydria',
      'Hypomagnesemia with secondary hypocalcemia and cardiac arrhythmias on long-term therapy (>1 year)',
      'Bone fractures (hip, wrist, spine) with high-dose or long-term use',
      'Acute interstitial nephritis (AIN) leading to chronic kidney disease',
      'Drug interaction: Competitive inhibition of CYP2C19 blunts bioactivation of clopidogrel (Plavix)'
    ],
    contraindications: ['Known hypersensitivity to substituted benzimidazoles', 'Concomitant administration with Rilpivirine'],
    clinicalTrialsReferences: [{ title: 'Omeprazole versus ranitidine in healing erosive reflux esophagitis', journalOrTrialId: 'N Engl J Med 1988; 319: 71-75', year: 1988, evidenceTier: 'established' }]
  },
  {
    id: 'drug-pantoprazole',
    genericName: 'Pantoprazole Sodium',
    brandNames: ['Protonix', 'Protonix IV'],
    therapeuticClass: 'Proton Pump Inhibitor',
    targetSuperfamily: 'Enzyme - P-type ATPase / Hydrolase',
    specialty: 'gastroenterology',
    fdaApprovalYear: 2000,
    approvedIndications: ['Erosive Esophagitis associated with GERD', 'Pathological Hypersecretory Conditions (Zollinger-Ellison)', 'Acute Upper Gastrointestinal Bleeding (IV Continuous Infusion)'],
    mechanismOfAction: 'Binds covalently to Cys813 and Cys822 on the proton pump. Exhibits highest chemical stability at neutral pH among PPIs, delivering reliable acid suppression with lowest CYP2C19 drug-interaction propensity.',
    molecularTargets: [{ name: 'H+/K+-ATPase', type: 'P-type ATPase', action: 'Irreversible Covalent Cys813/Cys822 Inhibitor', bindingAffinity: 'Covalent' }],
    biologicalPathways: ['Gastric Acid Output Shutdown', 'Clot Stabilization via Gastric Neutralization (pH > 6.0)'],
    pkParameters: { bioavailability: '77%', volumeOfDistribution: '11.5 L', proteinBinding: '98%', halfLife: '1 hour', clearanceRoute: 'Hepatic CYP2C19 demethylation and CYP3A4 sulfation; 71% urine, 18% feces', steadyStateTime: '3 to 5 days' },
    pgxConsiderations: [{ gene: 'CYP2C19', alleles: '*17 (Ultrarapid)', phenotypeEffect: 'Increased clearance; requires dose escalation in severe reflux', cpicDosingRecommendation: 'Titrate to clinical response.' }],
    criticalAdverseEffects: ['C. difficile diarrhea', 'Bone mineral density loss and fracture risk', 'Acute interstitial nephritis'],
    contraindications: ['Concomitant rilpivirine'],
    clinicalTrialsReferences: [{ title: 'Intravenous pantoprazole in prevention of recurrent ulcer bleeding', journalOrTrialId: 'N Engl J Med 2000; 343: 310-316', year: 2000, evidenceTier: 'established' }]
  },

  // 9. Poly-ADP Ribose Polymerase (PARP) Inhibitors
  {
    id: 'drug-olaparib',
    genericName: 'Olaparib',
    brandNames: ['Lynparza'],
    therapeuticClass: 'Poly (ADP-Ribose) Polymerase (PARP) Inhibitor',
    targetSuperfamily: 'Enzyme - Transferase',
    specialty: 'oncology',
    fdaApprovalYear: 2014,
    approvedIndications: ['BRCA-Mutated Advanced Ovarian Cancer', 'Germline BRCA-Mutated HER2-Negative Metastatic Breast Cancer', 'Germline BRCA-Mutated Metastatic Pancreatic Adenocarcinoma', 'HRR Gene-Mutated Metastatic Castration-Resistant Prostate Cancer'],
    mechanismOfAction: 'Inhibits PARP1 and PARP2 enzymes and traps inactive PARP-DNA complexes at single-strand DNA breaks. In tumors with homologous recombination repair (HRR) deficiencies (such as BRCA1/2 mutations), cells cannot repair double-strand breaks via homologous recombination, provoking synthetic lethality and tumor apoptosis.',
    molecularTargets: [
      { name: 'Poly [ADP-ribose] Polymerase 1 (PARP1)', type: 'DNA Repair Enzyme', action: 'Competitive Inhibitor & PARP-DNA Trapping Agent', bindingAffinity: 'IC50 = 5 nM' },
      { name: 'Poly [ADP-ribose] Polymerase 2 (PARP2)', type: 'DNA Repair Enzyme', action: 'Competitive Inhibitor', bindingAffinity: 'IC50 = 1 nM' }
    ],
    biologicalPathways: ['Synthetic Lethality in Homologous Recombination Deficient (HRD) Cells', 'Replication Fork Collapse & Chromosomal Fragmentation'],
    pkParameters: { bioavailability: 'Rapidly absorbed (tablet formulation independent of food)', volumeOfDistribution: '158 L', proteinBinding: '82%', halfLife: '15 hours', clearanceRoute: 'Hepatic CYP3A4 oxidation; 44% urine, 42% feces', steadyStateTime: '3 to 4 days' },
    pgxConsiderations: [{ gene: 'BRCA1 / BRCA2 / HRR Genes', alleles: 'Deleterious germline or somatic mutations', phenotypeEffect: 'Predictive biomarker of synthetic lethality sensitivity', cpicDosingRecommendation: 'Mandatory biomarker testing required prior to initiation.' }],
    criticalAdverseEffects: ['Myelodysplastic Syndrome / Acute Myeloid Leukemia (MDS/AML in 1.5%)', 'Pneumonitis and interstitial lung disease', 'Severe anemia and neutropenia (routine monthly CBC monitoring)'],
    contraindications: ['Concurrent strong CYP3A inducers or inhibitors without dose adjustment'],
    clinicalTrialsReferences: [
      { title: 'Maintenance Olaparib in Patients with Newly Diagnosed Advanced Ovarian Cancer (SOLO-1)', journalOrTrialId: 'N Engl J Med 2018; 379: 2495-2505', year: 2018, evidenceTier: 'established' },
      { title: 'Adjuvant Olaparib for Germline BRCA-Mutated Advanced Breast Cancer (OlympiA)', journalOrTrialId: 'N Engl J Med 2021; 384: 2394-2405', year: 2021, evidenceTier: 'established' }
    ]
  },

  // 10. Aromatase Inhibitors & Steroidogenic Enzymes
  {
    id: 'drug-anastrozole',
    genericName: 'Anastrozole',
    brandNames: ['Arimidex'],
    therapeuticClass: 'Non-Steroidal Third-Generation Aromatase Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase / Cytochrome P450',
    specialty: 'oncology',
    fdaApprovalYear: 1995,
    approvedIndications: ['Adjuvant Treatment of Postmenopausal Hormone-Receptor-Positive Early Breast Cancer', 'First-Line Advanced / Metastatic Breast Cancer in Postmenopausal Women'],
    mechanismOfAction: 'Potently and reversibly inhibits the aromatase enzyme complex (CYP19A1), which converts androstenedione to estrone and testosterone to estradiol in peripheral adipose tissues. Lowers circulating serum estradiol concentrations by >80-85% in postmenopausal women.',
    molecularTargets: [{ name: 'Aromatase / Estrogen Synthase (CYP19A1)', type: 'Cytochrome P450 Enzyme', action: 'Potent Non-Steroidal Competitive Inhibitor', bindingAffinity: 'IC50 = 15 nM' }],
    biologicalPathways: ['Peripheral Estrogen Depletion', 'Estrogen Receptor-Positive Mammary Epithelial Growth Starvation'],
    pkParameters: { bioavailability: '83% (unaffected by food)', volumeOfDistribution: 'Large', proteinBinding: '40%', halfLife: '50 hours', clearanceRoute: 'Hepatic metabolism via N-dealkylation, hydroxylation, and glucuronidation; 85% fecal/urinary metabolites', steadyStateTime: '7 to 10 days' },
    pgxConsiderations: [{ gene: 'CYP19A1', alleles: 'Polymorphisms in aromatase gene', phenotypeEffect: 'Modulates residual estradiol levels and arthralgia susceptibility', cpicDosingRecommendation: 'Standard clinical surveillance.' }],
    criticalAdverseEffects: ['Severe arthralgia and joint stiffness (aromatase inhibitor-associated musculoskeletal syndrome)', 'Accelerated bone mineral density loss and osteoporosis / fragility fractures', 'Hypercholesterolemia and hot flashes'],
    contraindications: ['Premenopausal women (ineffective and can provoke ovarian hyperstimulation)', 'Pregnancy and lactation'],
    clinicalTrialsReferences: [{ title: 'Anastrozole alone or in combination with tamoxifen versus tamoxifen alone for adjuvant treatment of postmenopausal women with early breast cancer (ATAC)', journalOrTrialId: 'Lancet 2002; 359: 2131-2139', year: 2002, evidenceTier: 'established' }]
  },
  {
    id: 'drug-finasteride',
    genericName: 'Finasteride',
    brandNames: ['Proscar', 'Propecia'],
    therapeuticClass: 'Steroid Type II 5-Alpha Reductase Inhibitor',
    targetSuperfamily: 'Enzyme - Oxidoreductase',
    specialty: 'other',
    fdaApprovalYear: 1992,
    approvedIndications: ['Benign Prostatic Hyperplasia (Proscar 5mg)', 'Male Pattern Androgenetic Alopecia (Propecia 1mg)'],
    mechanismOfAction: 'Competitive, mechanism-based (suicide) inhibitor of human steroid Type II 5-alpha reductase, blocking the NADPH-dependent reduction of testosterone into the significantly more potent androgen dihydrotestosterone (DHT). Suppresses intraprostatic and serum DHT levels by >70%.',
    molecularTargets: [{ name: 'Steroid 5-Alpha Reductase 2 (SRD5A2)', type: 'Microsomal Oxidoreductase', action: 'Irreversible Mechanism-Based Inhibitor', bindingAffinity: 'IC50 = 69 nM' }],
    biologicalPathways: ['Intraprostatic DHT Depletion & Epithelial Apoptosis', 'Scalp Hair Follicle Miniaturization Reversal'],
    pkParameters: { bioavailability: '65% (unaffected by food)', volumeOfDistribution: '76 L', proteinBinding: '90%', halfLife: '6 hours (extends to 8h in elderly)', clearanceRoute: 'Hepatic CYP3A4 oxidation to monohydroxylated metabolites; 57% feces, 39% urine', steadyStateTime: '3 days' },
    pgxConsiderations: [],
    criticalAdverseEffects: [
      'Decreases serum Prostate-Specific Antigen (PSA) by 50% (measured PSA must be multiplied by 2 to screen accurately for prostate cancer)',
      'Sexual dysfunction: erectile dysfunction, decreased libido, and ejaculatory disorders',
      'Post-Finasteride Syndrome (persistent neuropsychiatric symptoms, depression, cognitive fog)',
      'Teratogenic risk to male fetus (pregnant women must not handle crushed or broken tablets)'
    ],
    contraindications: ['Pregnancy (Category X: causes feminization of external genitalia in male fetus)', 'Hypersensitivity to finasteride'],
    clinicalTrialsReferences: [{ title: 'The effect of finasteride on the development of prostate cancer (PCPC)', journalOrTrialId: 'N Engl J Med 2003; 349: 215-224', year: 2003, evidenceTier: 'established' }]
  }
];
