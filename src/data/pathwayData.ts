import { PathwayNode, PathwayEdge } from '../types/clinical';

export interface SpecialtyPathwayGroup {
  id: 'cardiometabolic' | 'oncology' | 'neurology';
  name: string;
  tagline: string;
  description: string;
  nodes: PathwayNode[];
  edges: PathwayEdge[];
}

export const SPECIALTY_PATHWAYS: Record<string, SpecialtyPathwayGroup> = {
  cardiometabolic: {
    id: 'cardiometabolic',
    name: 'Cardiometabolic & Renal Therapeutics',
    tagline: 'Glycemic Regulation, Hemodynamic Glomerular Pressure & Nephroprotection',
    description: 'Traces the multi-organ molecular cascades of Metformin, SGLT2 inhibitors (Empagliflozin), and ACE inhibitors (Lisinopril) across hepatic gluconeogenesis, proximal tubular glucose reabsorption, and intraglomerular hemodynamics.',
    nodes: [
      // Column 1: Drugs (x: 80)
      {
        id: 'node-met',
        label: 'Metformin HCl',
        sublabel: 'Biguanide Antidiabetic',
        type: 'drug',
        specialty: 'cardiometabolic',
        x: 80,
        y: 80,
        description: 'First-line biguanide oral agent that suppresses hepatic glucose output and activates metabolic sensors without causing hypoglycemia.',
        evidenceTier: 'established',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'node-empa',
        label: 'Empagliflozin',
        sublabel: 'SGLT2 Inhibitor',
        type: 'drug',
        specialty: 'cardiometabolic',
        x: 80,
        y: 220,
        description: 'Selective sodium-glucose co-transporter 2 inhibitor providing cardiorenal protection and reducing intraglomerular hyperfiltration.',
        evidenceTier: 'established',
        provenanceId: 'prov-sglt2-kdigo'
      },
      {
        id: 'node-lis',
        label: 'Lisinopril',
        sublabel: 'ACE Inhibitor',
        type: 'drug',
        specialty: 'cardiometabolic',
        x: 80,
        y: 360,
        description: 'Competitive inhibitor of angiotensin-converting enzyme that prevents conversion of Angiotensin I to the vasoconstrictor Angiotensin II.',
        evidenceTier: 'established',
        provenanceId: 'prov-lis-acei'
      },

      // Column 2: Molecular Targets (x: 320)
      {
        id: 'node-complex1',
        label: 'Mitochondrial Complex I & AMPK',
        sublabel: 'Respiratory Chain / Energy Sensor',
        type: 'target',
        specialty: 'cardiometabolic',
        x: 320,
        y: 80,
        description: 'Metformin inhibits respiratory complex I, altering AMP/ATP ratio and activating 5′-adenosine monophosphate-activated protein kinase (AMPK).',
        evidenceTier: 'established',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'node-sglt2-target',
        label: 'SGLT2 (SLC5A2)',
        sublabel: 'Proximal Tubule S1 Segment',
        type: 'target',
        specialty: 'cardiometabolic',
        x: 320,
        y: 220,
        description: 'High-capacity, low-affinity glucose and sodium transporter responsible for 90% of filtered glucose reabsorption in the kidney.',
        evidenceTier: 'established',
        provenanceId: 'prov-sglt2-kdigo'
      },
      {
        id: 'node-ace-target',
        label: 'ACE (Kininase II)',
        sublabel: 'Vascular Endothelial Peptidase',
        type: 'target',
        specialty: 'cardiometabolic',
        x: 320,
        y: 360,
        description: 'Zinc metallopeptidase converting Ang I to Ang II and hydrolyzing vasodilator bradykinin into inactive fragments.',
        evidenceTier: 'established',
        provenanceId: 'prov-lis-acei'
      },

      // Column 3: Pathways & Cascade (x: 580)
      {
        id: 'node-gluconeo',
        label: 'Hepatic Gluconeogenesis Suppression',
        sublabel: 'FBPase & PEPCK Downregulation',
        type: 'pathway',
        specialty: 'cardiometabolic',
        x: 580,
        y: 80,
        description: 'Reduced mitochondrial ATP production downregulates key gluconeogenic enzymes and sensitizes peripheral tissue to circulating insulin.',
        evidenceTier: 'established',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'node-tubuloglomerular',
        label: 'Tubuloglomerular Feedback (TGF)',
        sublabel: 'Macula Densa Adenosine Release',
        type: 'pathway',
        specialty: 'cardiometabolic',
        x: 580,
        y: 220,
        description: 'Increased luminal sodium reaching the macula densa triggers adenosine release, inducing afferent arteriolar constriction and normalizing hyperfiltration.',
        evidenceTier: 'established',
        provenanceId: 'prov-sglt2-kdigo'
      },
      {
        id: 'node-efferent-dilation',
        label: 'Efferent Arteriolar Vasodilation',
        sublabel: 'Renin-Angiotensin Cascade Block',
        type: 'pathway',
        specialty: 'cardiometabolic',
        x: 580,
        y: 360,
        description: 'Diminished Angiotensin II relieves efferent arteriolar tone, decreasing intraglomerular capillary hydrostatic pressure and slowing glomerulosclerosis.',
        evidenceTier: 'established',
        provenanceId: 'prov-lis-acei'
      },

      // Column 4: Clinical Effects (x: 840)
      {
        id: 'node-effect-a1c',
        label: 'Glycemic Control & Weight Neutrality',
        sublabel: 'Fasting Plasma Glucose Reduction',
        type: 'effect',
        specialty: 'cardiometabolic',
        x: 840,
        y: 80,
        description: 'Lowers baseline HbA1c by 1.0–1.5% with minimal hypoglycemia risk; dependent on renal clearance to avoid lactic acidosis.',
        evidenceTier: 'established',
        provenanceId: 'prov-met-renal'
      },
      {
        id: 'node-effect-nephro',
        label: 'Sustained Nephroprotection & CV Benefit',
        sublabel: '28% Reduction in CKD Progression',
        type: 'effect',
        specialty: 'cardiometabolic',
        x: 840,
        y: 220,
        description: 'Verified reduction in kidney failure, heart failure hospitalization, and cardiovascular death across CKD stages 2 to 4.',
        evidenceTier: 'established',
        provenanceId: 'prov-sglt2-kdigo'
      },
      {
        id: 'node-effect-uacr',
        label: 'Proteinuria & BP Reduction',
        sublabel: 'Albuminuria Lowered >30%',
        type: 'effect',
        specialty: 'cardiometabolic',
        x: 840,
        y: 360,
        description: 'Reduces systemic blood pressure and preserves filtration membrane architecture, requiring potassium surveillance.',
        evidenceTier: 'established',
        provenanceId: 'prov-lis-acei'
      }
    ],
    edges: [
      { id: 'e1', source: 'node-met', target: 'node-complex1', relationship: 'inhibits', isEstablished: true },
      { id: 'e2', source: 'node-complex1', target: 'node-gluconeo', relationship: 'modulates', isEstablished: true },
      { id: 'e3', source: 'node-gluconeo', target: 'node-effect-a1c', relationship: 'activates', isEstablished: true },

      { id: 'e4', source: 'node-empa', target: 'node-sglt2-target', relationship: 'inhibits', isEstablished: true },
      { id: 'e5', source: 'node-sglt2-target', target: 'node-tubuloglomerular', relationship: 'activates', isEstablished: true },
      { id: 'e6', source: 'node-tubuloglomerular', target: 'node-effect-nephro', relationship: 'activates', isEstablished: true },

      { id: 'e7', source: 'node-lis', target: 'node-ace-target', relationship: 'inhibits', isEstablished: true },
      { id: 'e8', source: 'node-ace-target', target: 'node-efferent-dilation', relationship: 'activates', isEstablished: true },
      { id: 'e9', source: 'node-efferent-dilation', target: 'node-effect-uacr', relationship: 'activates', isEstablished: true }
    ]
  },

  oncology: {
    id: 'oncology',
    name: 'Oncology & Targeted Kinase Signaling',
    tagline: 'Oncogenic Driver Mutations, ATP-Pocket Inhibition & Acquired Resistance',
    description: 'Models targeted small-molecule inhibitors in chronic myeloid leukemia (Imatinib targeting BCR-ABL1) and mutant EGFR non-small cell lung cancer (Osimertinib targeting T790M).',
    nodes: [
      // Drugs
      {
        id: 'node-ima',
        label: 'Imatinib Mesylate',
        sublabel: '1st-Gen TKI (ST1571)',
        type: 'drug',
        specialty: 'oncology',
        x: 80,
        y: 120,
        description: 'Competitive ATP-binding site tyrosine kinase inhibitor revolutionized standard of care in Philadelphia chromosome-positive CML.',
        evidenceTier: 'established',
        provenanceId: 'prov-ima-cml'
      },
      {
        id: 'node-osi',
        label: 'Osimertinib',
        sublabel: '3rd-Gen Irreversible TKI',
        type: 'drug',
        specialty: 'oncology',
        x: 80,
        y: 300,
        description: 'Covalent, mutant-selective EGFR inhibitor engineered specifically to penetrate the blood-brain barrier and overcome T790M resistance.',
        evidenceTier: 'established',
        provenanceId: 'prov-osi-egfr'
      },

      // Targets
      {
        id: 'node-bcr-abl',
        label: 'BCR-ABL1 Fusion Kinase',
        sublabel: 't(9;22) Translocation Product',
        type: 'target',
        specialty: 'oncology',
        x: 320,
        y: 120,
        description: 'Constitutively active cytoplasmic tyrosine kinase driving autonomous hematopoiesis, genomic instability, and apoptosis evasion.',
        evidenceTier: 'established',
        provenanceId: 'prov-ima-cml'
      },
      {
        id: 'node-egfr-mutant',
        label: 'EGFR T790M / Exon 19 Del',
        sublabel: 'Receptor Tyrosine Kinase',
        type: 'target',
        specialty: 'oncology',
        x: 320,
        y: 300,
        description: 'Sensitizing activating mutations in the EGFR kinase domain, including the T790M steric gatekeeper resistance mutation.',
        evidenceTier: 'established',
        provenanceId: 'prov-osi-egfr'
      },

      // Pathways
      {
        id: 'node-stat5-akt',
        label: 'STAT5, CRKL & PI3K/AKT Cascade',
        sublabel: 'Survival Signaling Blockade',
        type: 'pathway',
        specialty: 'oncology',
        x: 580,
        y: 120,
        description: 'BCR-ABL inhibition prevents phosphorylation of CRKL and STAT5, halting downstream transcription of anti-apoptotic Bcl-xL.',
        evidenceTier: 'established',
        provenanceId: 'prov-ima-cml'
      },
      {
        id: 'node-mapk-erk',
        label: 'RAS/RAF/MEK/ERK Axis Suppression',
        sublabel: 'Cell Cycle G1 Arrest',
        type: 'pathway',
        specialty: 'oncology',
        x: 580,
        y: 300,
        description: 'Blockade of EGFR autophosphorylation shuts down mitogenic signaling, inducing p27-dependent cell cycle arrest and apoptosis.',
        evidenceTier: 'established',
        provenanceId: 'prov-osi-egfr'
      },

      // Effects
      {
        id: 'node-cml-remission',
        label: 'Major Molecular Response (MMR)',
        sublabel: 'BCR-ABL1 ≤ 0.1% (IS)',
        type: 'effect',
        specialty: 'oncology',
        x: 840,
        y: 120,
        description: 'Achieves durable 10-year overall survival exceeding 85% in chronic phase CML; monitoring required for T315I resistance mutations.',
        evidenceTier: 'established',
        provenanceId: 'prov-ima-cml'
      },
      {
        id: 'node-nsclc-pfs',
        label: 'PFS Prolongation & CNS Disease Control',
        sublabel: '18.9 Months Median PFS',
        type: 'effect',
        specialty: 'oncology',
        x: 840,
        y: 300,
        description: 'Substantially reduces central nervous system progression with lower toxicity against wild-type EGFR cutaneous tissues.',
        evidenceTier: 'established',
        provenanceId: 'prov-osi-egfr'
      }
    ],
    edges: [
      { id: 'eo1', source: 'node-ima', target: 'node-bcr-abl', relationship: 'inhibits', isEstablished: true },
      { id: 'eo2', source: 'node-bcr-abl', target: 'node-stat5-akt', relationship: 'inhibits', isEstablished: true },
      { id: 'eo3', source: 'node-stat5-akt', target: 'node-cml-remission', relationship: 'activates', isEstablished: true },

      { id: 'eo4', source: 'node-osi', target: 'node-egfr-mutant', relationship: 'inhibits', isEstablished: true },
      { id: 'eo5', source: 'node-egfr-mutant', target: 'node-mapk-erk', relationship: 'inhibits', isEstablished: true },
      { id: 'eo6', source: 'node-mapk-erk', target: 'node-nsclc-pfs', relationship: 'activates', isEstablished: true }
    ]
  },

  neurology: {
    id: 'neurology',
    name: 'Neurology & Neuropsychiatry',
    tagline: 'Synaptic Monoamine Dynamics & Central Cholinergic Enhancement',
    description: 'Explores neurochemical transmission targets: Serotonin Transporter (SERT) inhibition by Citalopram and Acetylcholinesterase (AChE) inhibition by Donepezil in cognitive impairment.',
    nodes: [
      {
        id: 'node-cit',
        label: 'Citalopram HBr',
        sublabel: 'Selective Serotonin Reuptake Inhibitor',
        type: 'drug',
        specialty: 'neurology',
        x: 80,
        y: 120,
        description: 'Highly selective SSRI that blocks presynaptic reuptake of 5-HT; metabolized by CYP2C19 with geriatric dose limits.',
        evidenceTier: 'established',
        provenanceId: 'prov-cit-geriatric'
      },
      {
        id: 'node-don',
        label: 'Donepezil HCl',
        sublabel: 'AChE Inhibitor',
        type: 'drug',
        specialty: 'neurology',
        x: 80,
        y: 300,
        description: 'Reversible, non-competitive centrally active piperidine acetylcholinesterase inhibitor used in Alzheimer disease management.',
        evidenceTier: 'established',
        provenanceId: 'prov-done-beers'
      },

      {
        id: 'node-sert',
        label: 'SERT (SLC6A4)',
        sublabel: 'Presynaptic 5-HT Transporter',
        type: 'target',
        specialty: 'neurology',
        x: 320,
        y: 120,
        description: '12-transmembrane domain transporter responsible for clearing serotonin from the synaptic cleft into presynaptic terminals.',
        evidenceTier: 'established',
        provenanceId: 'prov-cit-geriatric'
      },
      {
        id: 'node-ache',
        label: 'Acetylcholinesterase (AChE)',
        sublabel: 'Synaptic Hydrolase',
        type: 'target',
        specialty: 'neurology',
        x: 320,
        y: 300,
        description: 'Enzyme terminating cholinergic neurotransmission by hydrolyzing acetylcholine into choline and acetate.',
        evidenceTier: 'established',
        provenanceId: 'prov-done-beers'
      },

      {
        id: 'node-5ht-synapse',
        label: 'Synaptic 5-HT Availability & Desensitization',
        sublabel: '5-HT1A Autoreceptor Downregulation',
        type: 'pathway',
        specialty: 'neurology',
        x: 580,
        y: 120,
        description: 'Prolonged exposure downregulates inhibitory somatodendritic 5-HT1A autoreceptors, restoring serotonergic firing to terminal fields.',
        evidenceTier: 'established',
        provenanceId: 'prov-cit-geriatric'
      },
      {
        id: 'node-cholinergic-tone',
        label: 'Cortical & Hippocampal Cholinergic Tone',
        sublabel: 'Nicotinic/Muscarinic Receptor Stimulation',
        type: 'pathway',
        specialty: 'neurology',
        x: 580,
        y: 300,
        description: 'Enhanced synaptic residency of acetylcholine bolsters long-term potentiation and network synchronization in basal forebrain circuits.',
        evidenceTier: 'established',
        provenanceId: 'prov-done-beers'
      },

      {
        id: 'node-effect-depr',
        label: 'Antidepressant Efficacy & Cardiac QTc Trade-off',
        sublabel: 'Dose-Dependent HERG Channel Block',
        type: 'effect',
        specialty: 'neurology',
        x: 840,
        y: 120,
        description: 'Remission of major depressive symptoms; carries dose-dependent risk of delaying ventricular repolarization (QTc prolongation).',
        evidenceTier: 'established',
        provenanceId: 'prov-cit-geriatric'
      },
      {
        id: 'node-effect-cognition',
        label: 'Stabilization of Cognitive Decline & ADLs',
        sublabel: 'ADAS-Cog / MMSE Improvement',
        type: 'effect',
        specialty: 'neurology',
        x: 840,
        y: 300,
        description: 'Modest, temporary stabilization of cognitive trajectory; requires monitoring for parasympathetic bradycardia and syncopal falls.',
        evidenceTier: 'established',
        provenanceId: 'prov-done-beers'
      }
    ],
    edges: [
      { id: 'en1', source: 'node-cit', target: 'node-sert', relationship: 'inhibits', isEstablished: true },
      { id: 'en2', source: 'node-sert', target: 'node-5ht-synapse', relationship: 'activates', isEstablished: true },
      { id: 'en3', source: 'node-5ht-synapse', target: 'node-effect-depr', relationship: 'modulates', isEstablished: true },

      { id: 'en4', source: 'node-don', target: 'node-ache', relationship: 'inhibits', isEstablished: true },
      { id: 'en5', source: 'node-ache', target: 'node-cholinergic-tone', relationship: 'activates', isEstablished: true },
      { id: 'en6', source: 'node-cholinergic-tone', target: 'node-effect-cognition', relationship: 'activates', isEstablished: true }
    ]
  }
};
