export interface VideoChapter {
  id: string;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;
  narration: string;
  badge: string;
}

export const VIDEO_DURATION = 65; // 65 seconds total cinematic run

export const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 'ch-dilemma',
    title: 'The Biological Singularity',
    subtitle: 'Why Standardized Pharmacology Fails the Individual',
    startTime: 0,
    endTime: 10,
    narration: 'Every human body is a distinct biochemical universe. Yet traditional pharmacology prescribes for statistical averages. Today, we construct the individual.',
    badge: '01 / PROLOGUE'
  },
  {
    id: 'ch-genomics',
    title: 'Multi-Omic Genomic Decoding',
    subtitle: 'Pharmacogenomics: CYP450, Transporters & CPIC Alleles',
    startTime: 10,
    endTime: 22,
    narration: 'Decoding the individual genome. Uncovering polymorphic CYP enzymes and transport kinetics that dictate whether a drug transforms or triggers severe toxicity.',
    badge: '02 / PHARMACOGENOMICS'
  },
  {
    id: 'ch-twin',
    title: 'The Holographic Digital Twin',
    subtitle: 'Organ Clearance Simulation: Hepatic & Renal Phenotypes',
    startTime: 22,
    endTime: 34,
    narration: 'Synthesizing the organ clearance twin. Ingesting age, body weight, serum creatinine, and renal filtration to construct a deterministic in silico replica.',
    badge: '03 / ORGAN TWIN'
  },
  {
    id: 'ch-network',
    title: '305+ Drug Target Constellation',
    subtitle: 'GPCRs, Protein Kinases, Ion Channels & Enzymes',
    startTime: 34,
    endTime: 46,
    narration: 'Mapping 305 target-classified therapeutics. Tracing molecular mechanisms across GPCRs, protein kinases, and metabolic cascades.',
    badge: '04 / PHARMACOPEIA'
  },
  {
    id: 'ch-pk',
    title: 'Real-Time Pharmacokinetic Simulation',
    subtitle: 'Predicting Exposure, Cmax & Clearance Trajectories',
    startTime: 46,
    endTime: 56,
    narration: 'Simulating exposure-response trajectories. Predicting toxic accumulation and calibrating the therapeutic window before the patient swallows their first capsule.',
    badge: '05 / IN SILICO PK'
  },
  {
    id: 'ch-synthesis',
    title: 'Where Biology Meets Its Other Self',
    subtitle: 'SYNTHOS Precision Medicine Workspace',
    startTime: 56,
    endTime: 65,
    narration: 'SYNTHOS. Where biology meets its other self. Step inside the computational precision medicine platform.',
    badge: '06 / SYNTHESIS'
  }
];
