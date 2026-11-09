export type EvidenceTier = 'established' | 'preliminary' | 'model-derived';

export interface EvidenceProvenanceItem {
  id: string;
  claimTitle: string;
  subjectDrugOrBiomarker: string;
  evidenceTier: EvidenceTier;
  tierDescription: string;
  sourceOrganization: string;
  publicationYear?: number;
  pubmedId?: string;
  doi?: string;
  clinicalTrialsId?: string;
  fdaLabelSection?: string;
  summary: string;
  methodologyNotes: string;
  uncertaintyLimitations: string;
}

export interface PathwayNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'drug' | 'target' | 'pathway' | 'effect';
  specialty: 'cardiometabolic' | 'oncology' | 'neurology';
  x: number;
  y: number;
  description: string;
  evidenceTier: EvidenceTier;
  provenanceId?: string;
  isExpanded?: boolean;
}

export interface PathwayEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'inhibits' | 'activates' | 'modulates' | 'clears';
  isEstablished: boolean;
  citationDOI?: string;
}

export interface DrugMonograph {
  id: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  specialty:
    | 'cardiometabolic'
    | 'oncology'
    | 'neurology'
    | 'immunology'
    | 'infectious'
    | 'respiratory'
    | 'hematology'
    | 'gastroenterology'
    | 'endocrinology'
    | 'psychiatry'
    | 'analgesia'
    | 'dermatology'
    | 'ophthalmology'
    | string;
  targetSuperfamily?: string;
  fdaApprovalYear: number;
  approvedIndications: string[];
  mechanismOfAction: string;
  molecularTargets: {
    name: string;
    type: string;
    action: string;
    bindingAffinity?: string;
  }[];
  biologicalPathways: string[];
  pkParameters: {
    bioavailability: string;
    volumeOfDistribution: string;
    proteinBinding: string;
    halfLife: string;
    clearanceRoute: string;
    steadyStateTime: string;
  };
  pgxConsiderations: {
    gene: string;
    alleles: string;
    phenotypeEffect: string;
    cpicDosingRecommendation: string;
  }[];
  criticalAdverseEffects: string[];
  contraindications: string[];
  clinicalTrialsReferences: {
    title: string;
    journalOrTrialId: string;
    year: number;
    evidenceTier: EvidenceTier;
    doi?: string;
  }[];
}

export interface Biometrics {
  age: number;
  sex: 'Male' | 'Female';
  heightCm: number;
  weightKg: number;
  bmi: number;
  ibwKg: number;
  smoking: 'Non-smoker' | 'Former smoker' | 'Current smoker';
  allergies: string[];
  diagnoses: string[];
  raceEthnicity?: string;
  bsaM2?: number;
  serumAlbuminGdl?: number;
}

export interface OrganStatus {
  renal: {
    status: 'compromised' | 'normal' | 'caution';
    egfr: number;
    egfrMethod: string;
    scr: number;
    bun: number;
    crcl: number;
    badge: string;
    stage: string;
  };
  hepatic: {
    status: 'normal' | 'compromised' | 'caution';
    cypStatus: string;
    childPugh: string;
    alt: number;
    ast: number;
    totalBili: number;
    badge: string;
  };
  cardiovascular: {
    status: 'elevated' | 'normal' | 'caution' | 'compromised';
    bp: string;
    bpStage: string;
    targetBp: string;
    heartRate: number;
    rhythm: string;
    potassium: number;
    badge: string;
  };
  glycemic: {
    status: 'suboptimal' | 'controlled' | 'poor';
    hba1c: number;
    controlText: string;
    fastingGlucose: number;
    uacr: number;
    badge: string;
  };
}

export interface SimulationScenarioState {
  age: number;
  weightKg: number;
  scr: number;
  egfr: number;
  crcl: number;
  potassium: number;
  drugId: string;
  doseMg: number;
  intervalHours: number;
  pgxVariant: string;
  predictedCssPeak: number;
  predictedHalfLife: number;
  safetyViolation: boolean;
  causationDescription: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  brand?: string;
  dose: string;
  route: string;
  frequency: string;
  totalDailyDose: string;
  therapeuticClass: string;
  metabolism: string;
  metabolismDetail: string;
  safetyStatus: 'flagged' | 'optimal' | 'monitor' | 'contraindicated';
  safetyEvaluation: string;
  guidelineCitation: string;
  guidelineUrl: string;
  recommendedAction?: string;
  provenanceId?: string;
}

export interface PriorityTriage {
  id: string;
  title: string;
  currentDoseSummary: string;
  level: 'HIGH PRIORITY' | 'MODERATE' | 'CRITICAL';
  discrepancyText: string;
  options: {
    id: string;
    title: string;
    description: string;
    newDose?: string;
  }[];
  defaultSelectedOption: string;
  defaultNote: string;
}

export interface PatientCase {
  id: string;
  tier: string;
  nameAlias: string;
  summary: string;
  biometrics: Biometrics;
  organStatus: OrganStatus;
  medications: MedicationItem[];
  priorityTriage: PriorityTriage;
  kpis: {
    activeAgentsCount: number;
    reconciliationSynced: string;
    actionAlertsCount: number;
    alertSummary: string;
    pendingLabsCount: number;
    nextDraw: string;
    evidenceLinksCount: number;
    guidelinesSummary: string;
  };
  pkData: {
    drugName: string;
    halfLifeBaseline: string;
    halfLifeCurrent: string;
    predictedPeak: string;
    pctVsReference: string;
    upperSafetyThreshold: number;
    targetMin: number;
    targetMax: number;
    currentPeakValue: number;
  };
  rulesTriggered: {
    id: string;
    ruleCode: string;
    name: string;
    category: string;
    text: string;
    provenanceId?: string;
  }[];
}

export interface EvidenceRule {
  id: string;
  code: string;
  title: string;
  organization: string;
  category: 'Renal' | 'Pharmacogenomics' | 'Cardiology' | 'Endocrinology' | 'FDA Black Box';
  year: number;
  strengthOfRecommendation: 'Class I (Level A)' | 'Class IIa (Level B)' | 'FDA Boxed Warning' | 'CPIC Strong';
  summary: string;
  fullText: string;
  appliedConditions: string[];
  doi?: string;
}

export interface LabMonitoringItem {
  id: string;
  testName: string;
  targetTimeline: string;
  daysRemaining: number;
  indication: string;
  associatedDrug: string;
  criticalThreshold: string;
  status: 'pending' | 'scheduled' | 'completed';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  pharmacist: string;
  action: string;
  patientId: string;
  details: string;
  hash: string;
}
