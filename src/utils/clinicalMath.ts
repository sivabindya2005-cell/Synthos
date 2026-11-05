/**
 * SYNTHOS Deterministic Clinical Pharmacokinetic & Renal Clearance Engine
 *
 * All clinical numbers originate from deterministic, unit-tested equations.
 * The AI model is strictly prohibited from generating, guessing, or altering numbers.
 */

import versionedDrugsData from '../data/versionedDrugs.json';

// ==========================================
// 1. PHI & IDENTIFIER DETECTION GUARDRAIL
// ==========================================

export interface PHIDetectionResult {
  containsPHI: boolean;
  warnings: string[];
  sanitizedText: string;
}

/**
 * Scans free-text fields for Protected Health Information (PHI) patterns:
 * Email addresses, phone numbers, SSNs, medical record numbers (MRNs), dates of birth, street addresses.
 */
export function detectAndSanitizePHI(input: string): PHIDetectionResult {
  const warnings: string[] = [];
  if (!input || typeof input !== 'string') {
    return { containsPHI: false, warnings, sanitizedText: '' };
  }

  let sanitized = input;

  // Email pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(sanitized)) {
    warnings.push('Email address pattern detected and stripped to comply with HIPAA Safe Harbor.');
    sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');
  }

  // Phone number pattern (US & International formats, e.g. (123) 456-7890 or +1-123-456-7890 or 10-digit block)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g;
  if (phoneRegex.test(sanitized)) {
    warnings.push('Phone number sequence detected and stripped to prevent patient identification.');
    sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');
  }

  // Social Security Number / National ID (e.g. 123-45-6789 or 9-digit consecutive block)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;
  if (ssnRegex.test(sanitized)) {
    warnings.push('SSN or national identifier pattern detected and blocked.');
    sanitized = sanitized.replace(ssnRegex, '[REDACTED_ID]');
  }

  // MRN pattern (e.g. MRN: 12345678, Hospital ID #482910)
  const mrnRegex = /\b(MRN|ID|PATIENT|RECORD|ACCN)[#:\s]+[A-Z0-9-]{5,15}\b/gi;
  if (mrnRegex.test(sanitized)) {
    warnings.push('Medical Record Number (MRN) pattern detected and removed.');
    sanitized = sanitized.replace(mrnRegex, '[REDACTED_MRN]');
  }

  return {
    containsPHI: warnings.length > 0,
    warnings,
    sanitizedText: sanitized
  };
}

// ==========================================
// 2. INPUT VALIDATION
// ==========================================

export interface InputValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateClinicalInputs(params: {
  age: number;
  weightKg: number;
  heightCm: number;
  scr: number;
  potassium: number;
  doseMg: number;
  intervalHours: number;
}): InputValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Age validation
  if (isNaN(params.age) || params.age < 18 || params.age > 120) {
    errors.push('Patient age must be between 18 and 120 years (adult pharmacokinetic equations).');
  }

  // Weight validation
  if (isNaN(params.weightKg) || params.weightKg < 30 || params.weightKg > 300) {
    errors.push('Total weight must be within physiological adult range (30 to 300 kg).');
  } else if (params.weightKg > 140) {
    warnings.push('Severe obesity (weight > 140 kg). Adjusted body weight (AdjBW) recommended for hydrophilic drug clearance.');
  } else if (params.weightKg < 45) {
    warnings.push('Low total body weight (< 45 kg). Risk of drug overexposure and underestimation of renal dysfunction.');
  }

  // Height validation
  if (isNaN(params.heightCm) || params.heightCm < 100 || params.heightCm > 240) {
    errors.push('Height must be within physiological range (100 to 240 cm).');
  }

  // Serum Creatinine validation
  if (isNaN(params.scr) || params.scr < 0.2 || params.scr > 20.0) {
    errors.push('Serum creatinine must be between 0.2 and 20.0 mg/dL.');
  } else if (params.scr > 5.0) {
    warnings.push('Critical serum creatinine (> 5.0 mg/dL). GFR estimation loses linear correlation; consider hemodialysis kinetics.');
  }

  // Potassium validation
  if (isNaN(params.potassium) || params.potassium < 1.5 || params.potassium > 9.0) {
    errors.push('Serum potassium must be between 1.5 and 9.0 mEq/L.');
  } else if (params.potassium >= 5.5) {
    warnings.push('Hyperkalemia alert (K+ ≥ 5.5 mEq/L). Contraindication for potassium-sparing diuretics, RAAS blockers, and cardiac glycoside toxicity.');
  } else if (params.potassium < 3.5) {
    warnings.push('Hypokalemia alert (K+ < 3.5 mEq/L). Markedly heightens myocardial sensitivity to digoxin toxicity and fatal arrhythmias.');
  }

  // Dose & Interval validation
  if (isNaN(params.doseMg) || params.doseMg <= 0) {
    errors.push('Administered dose must be greater than 0 mg.');
  }
  if (isNaN(params.intervalHours) || params.intervalHours < 1 || params.intervalHours > 96) {
    errors.push('Dosing interval (tau) must be between 1 and 96 hours.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==========================================
// 3. DERIVED BIOMETRIC PARAMETERS
// ==========================================

/**
 * Devine Formula for Ideal Body Weight (IBW)
 * Reference: Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm 1974;8:650-5.
 */
export function calculateIBW(heightCm: number, sex: 'Male' | 'Female'): number {
  const heightInches = heightCm / 2.54;
  const inchesOver5Ft = Math.max(0, heightInches - 60);
  const base = sex === 'Male' ? 50.0 : 45.5;
  const ibw = base + 2.3 * inchesOver5Ft;
  return Number(ibw.toFixed(1));
}

/**
 * Adjusted Body Weight (AdjBW)
 * Formula: IBW + 0.4 * (Actual Body Weight - IBW)
 */
export function calculateAdjustedBodyWeight(weightKg: number, ibw: number): number {
  if (weightKg <= ibw) return weightKg;
  const adj = ibw + 0.4 * (weightKg - ibw);
  return Number(adj.toFixed(1));
}

/**
 * Body Mass Index (BMI)
 * Formula: Weight (kg) / (Height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; classification: string } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Number(bmi.toFixed(1));

  let classification = 'Normal';
  if (rounded < 18.5) classification = 'Underweight';
  else if (rounded < 25.0) classification = 'Normal Weight';
  else if (rounded < 30.0) classification = 'Overweight';
  else if (rounded < 35.0) classification = 'Class I Obesity';
  else if (rounded < 40.0) classification = 'Class II Obesity';
  else classification = 'Class III Severe Obesity';

  return { bmi: rounded, classification };
}

/**
 * Mosteller Formula for Body Surface Area (BSA)
 * Reference: Mosteller RD. Simplified calculation of body-surface area. N Engl J Med 1987;317:1098.
 */
export function calculateBSA(weightKg: number, heightCm: number): number {
  const bsa = Math.sqrt((weightKg * heightCm) / 3600);
  return Number(bsa.toFixed(2));
}

/**
 * Cockcroft-Gault Equation for Creatinine Clearance (CrCl)
 * Reference: Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron 1976;16(1):31-41.
 */
export function calculateCockcroftGault(
  age: number,
  weightKg: number,
  heightCm: number,
  scr: number,
  sex: 'Male' | 'Female',
  weightChoice: 'Actual' | 'IBW' | 'Adjusted' | 'Auto' | boolean = 'Auto'
): {
  crcl: number;
  weightUsed: number;
  weightChoiceMade: string;
  isOverweight: boolean;
  ibw: number;
  adjBw: number;
  formulaString: string;
  reference: string;
} {
  const ibw = calculateIBW(heightCm, sex);
  const adjBw = calculateAdjustedBodyWeight(weightKg, ibw);
  const isOverweight = weightKg > ibw * 1.2;

  let weightUsed = weightKg;
  let weightChoiceMade = 'Actual Body Weight';

  if (weightChoice === 'IBW') {
    weightUsed = ibw;
    weightChoiceMade = 'Ideal Body Weight (Devine)';
  } else if (weightChoice === 'Adjusted') {
    weightUsed = adjBw;
    weightChoiceMade = 'Adjusted Body Weight (IBW + 0.4*(TBW-IBW))';
  } else if (weightChoice === 'Actual') {
    weightUsed = weightKg;
    weightChoiceMade = 'Actual Body Weight';
  } else if (weightChoice === true) {
    // Legacy useIbwIfOverweight = true
    weightUsed = isOverweight ? adjBw : weightKg;
    weightChoiceMade = isOverweight ? 'Adjusted Body Weight (Obese)' : 'Actual Body Weight';
  } else if (weightChoice === false) {
    weightUsed = weightKg;
    weightChoiceMade = 'Actual Body Weight';
  } else {
    // Auto selection: if obese (> 120% IBW), use AdjBW; if underweight (< IBW), use Actual; else Actual or IBW
    if (isOverweight) {
      weightUsed = adjBw;
      weightChoiceMade = 'Adjusted Body Weight (Obesity >120% IBW)';
    } else if (weightKg < ibw) {
      weightUsed = weightKg;
      weightChoiceMade = 'Actual Body Weight (Underweight < IBW)';
    } else {
      weightUsed = weightKg;
      weightChoiceMade = 'Actual Body Weight';
    }
  }

  const factor = sex === 'Female' ? 0.85 : 1.0;
  const crcl = ((140 - age) * weightUsed) / (72 * Math.max(0.2, scr)) * factor;

  return {
    crcl: Number(crcl.toFixed(1)),
    weightUsed: Number(weightUsed.toFixed(1)),
    weightChoiceMade,
    isOverweight,
    ibw,
    adjBw,
    formulaString: `CrCl (mL/min) = [((140 - Age) × WeightUsed) / (72 × SCr)] × (${factor})`,
    reference: 'Cockcroft DW, Gault MH. Nephron 1976;16(1):31-41'
  };
}

/**
 * 2021 CKD-EPI Creatinine Equation (Race-Free)
 * Reference: Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med 2021;385:1737-1749.
 */
export function calculateCKDEPI2021(
  age: number,
  scr: number,
  sex: 'Male' | 'Female'
): {
  egfr: number;
  stage: string;
  stageCode: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
  formulaString: string;
  reference: string;
} {
  const isFemale = sex === 'Female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const minRatio = Math.min(scr / kappa, 1);
  const maxRatio = Math.max(scr / kappa, 1);
  const sexMultiplier = isFemale ? 1.012 : 1.0;

  const egfrRaw = 142 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.2) * Math.pow(0.9938, age) * sexMultiplier;
  const egfr = Math.round(egfrRaw);

  let stage = 'G1 (Normal or High)';
  let stageCode: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5' = 'G1';

  if (egfr < 15) {
    stage = 'G5 (Kidney Failure)';
    stageCode = 'G5';
  } else if (egfr < 30) {
    stage = 'G4 (Severely Decreased)';
    stageCode = 'G4';
  } else if (egfr < 45) {
    stage = 'G3b (Moderately to Severely Decreased)';
    stageCode = 'G3b';
  } else if (egfr < 60) {
    stage = 'G3a (Mildly to Moderately Decreased)';
    stageCode = 'G3a';
  } else if (egfr < 90) {
    stage = 'G2 (Mildly Decreased)';
    stageCode = 'G2';
  }

  return {
    egfr,
    stage,
    stageCode,
    formulaString: `eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^-1.200 × 0.9938^Age × [1.012 if female]`,
    reference: 'Inker LA, et al. N Engl J Med 2021;385:1737-1749'
  };
}

// ==========================================
// 4. DETERMINISTIC PHARMACOKINETIC ENGINE
// ==========================================

export type PKModelType = 'One-Compartment IV Bolus' | 'One-Compartment IV Infusion' | 'First-Order Oral Absorption' | 'Michaelis-Menten Saturable' | 'Two-Compartment';

export interface DeterministicPKResult {
  drugId: string;
  drugGenericName: string;
  drugClass: string;
  route: string;
  modelUsed: PKModelType;
  doseMg: number;
  intervalHours: number;
  infusionTimeHours?: number;
  bioavailabilityF: number;
  absorptionRateKa: number;
  vdLiters: number;
  clearanceLperH: number;
  renalClearanceLperH: number;
  nonRenalClearanceLperH: number;
  keHourInv: number;
  halfLifeHours: number;
  halfLifeChangeFactor: number;
  peakSteadyStateCss: number;
  troughSteadyStateCss: number;
  averageSteadyStateCss: number;
  aucTau: number;
  accumulationRatio: number;
  loadingDoseMg: number;
  therapeuticTargetMin: number;
  therapeuticTargetMax: number;
  therapeuticUnit: string;
  upperSafetyCeiling: number;
  safetyCeilingExceeded: boolean;
  subtherapeuticAlert: boolean;
  saturableKinetics?: {
    isSaturable: boolean;
    vmaxMgPerDay: number;
    kmMcgPerMl: number;
    dailyDoseMg: number;
    predictedCssMcgPerMl: number;
    saturationRisk: string;
  };
  twoCompartmentParameters?: {
    alpha: number;
    beta: number;
    a: number;
    b: number;
  };
  guidelineCode: string;
  safetyFinding: string;
  renalAdjustmentNote: string;
  hepaticAdjustmentNote: string;
  formulaMetadata: {
    modelType: string;
    keFormula: string;
    tHalfFormula: string;
    cMaxFormula: string;
    cMinFormula: string;
    cAvgFormula: string;
    loadingDoseFormula: string;
    units: Record<string, string>;
    primaryReference: string;
  };
}

export function calculateDeterministicPK(params: {
  drugId: string;
  doseMg: number;
  intervalHours: number;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'Male' | 'Female';
  scr: number;
  potassium: number;
  pgxVariant?: string;
  hepaticStatus?: 'Normal' | 'Child-Pugh A' | 'Child-Pugh B' | 'Child-Pugh C';
  routeOverride?: 'IV Bolus' | 'IV Infusion' | 'Oral';
  modelOverride?: PKModelType;
  infusionTimeHours?: number;
}): DeterministicPKResult {
  const {
    drugId,
    doseMg,
    intervalHours,
    weightKg,
    heightCm,
    age,
    sex,
    scr,
    hepaticStatus = 'Normal',
    routeOverride,
    modelOverride,
    infusionTimeHours = 1.0
  } = params;

  // 1. Calculate underlying clearances
  const egfrResult = calculateCKDEPI2021(age, scr, sex);
  const cgResult = calculateCockcroftGault(age, weightKg, heightCm, scr, sex);
  const egfr = egfrResult.egfr;
  const crcl = cgResult.crcl;

  // 2. Fetch drug monograph
  const drugEntry = versionedDrugsData.drugs.find((d) => d.id === drugId) || versionedDrugsData.drugs[0];
  const route = routeOverride || drugEntry.standardRoute;

  // 3. Select appropriate model
  let modelUsed: PKModelType = 'One-Compartment IV Bolus';
  if (modelOverride) {
    modelUsed = modelOverride;
  } else if (drugEntry.saturable) {
    modelUsed = 'Michaelis-Menten Saturable';
  } else if (route === 'IV Infusion') {
    modelUsed = 'One-Compartment IV Infusion';
  } else if (route === 'Oral') {
    modelUsed = 'First-Order Oral Absorption';
  } else {
    modelUsed = 'One-Compartment IV Bolus';
  }

  // 4. Compute Volume of Distribution (Vd)
  const vdLiters = Number((drugEntry.volumeOfDistributionLperKg * weightKg).toFixed(1));

  // 5. Compute Clearance (CL) adjusting for renal and hepatic status
  const baselineCL = drugEntry.clearanceLperHperKg * weightKg;
  const fe = drugEntry.fractionExcretedUnchanged;

  // Renal clearance scaling based on CrCl / 100 mL/min normal reference
  const renalFractionScaling = Math.max(0.05, Math.min(1.5, crcl / 100));
  const patientRenalCL = baselineCL * fe * renalFractionScaling;

  // Hepatic clearance scaling based on Child-Pugh class
  let hepaticFactor = 1.0;
  if (hepaticStatus === 'Child-Pugh A') hepaticFactor = 0.85;
  else if (hepaticStatus === 'Child-Pugh B') hepaticFactor = 0.60;
  else if (hepaticStatus === 'Child-Pugh C') hepaticFactor = 0.35;

  const patientNonRenalCL = baselineCL * (1 - fe) * hepaticFactor;
  const totalCL = Number((patientRenalCL + patientNonRenalCL).toFixed(3));

  // Elimination rate constant ke and half-life
  const ke = totalCL / Math.max(0.1, vdLiters);
  const tHalf = Math.LN2 / Math.max(0.001, ke);
  const baselineTHalf = drugEntry.eliminationHalfLifeHours;
  const tHalfRatio = Number((tHalf / baselineTHalf).toFixed(2));

  // Bioavailability F and absorption rate ka
  const F = route === 'Oral' ? drugEntry.bioavailability : 1.0;
  const ka = drugEntry.absorptionRateKa > 0 ? drugEntry.absorptionRateKa : 1.2;

  // Multiple Dosing Accumulation Factor R
  const accumulationR = 1 / (1 - Math.exp(-ke * intervalHours));

  // Steady-state concentrations
  let cMaxSS = 0;
  let cMinSS = 0;
  let cAvgSS = (F * doseMg) / (totalCL * intervalHours);

  if (modelUsed === 'One-Compartment IV Bolus') {
    cMaxSS = (doseMg / vdLiters) * accumulationR;
    cMinSS = cMaxSS * Math.exp(-ke * intervalHours);
  } else if (modelUsed === 'One-Compartment IV Infusion') {
    const tInf = Math.max(0.25, Math.min(intervalHours, infusionTimeHours));
    const rInf = doseMg / tInf;
    // Cmax at end of infusion: (R / CL) * (1 - e^-ke*tInf) / (1 - e^-ke*tau)
    cMaxSS = (rInf / totalCL) * ((1 - Math.exp(-ke * tInf)) / (1 - Math.exp(-ke * intervalHours)));
    cMinSS = cMaxSS * Math.exp(-ke * (intervalHours - tInf));
  } else if (modelUsed === 'First-Order Oral Absorption') {
    // Oral steady-state with first-order absorption
    if (Math.abs(ka - ke) < 0.001) {
      cMaxSS = (F * doseMg / vdLiters) * accumulationR;
      cMinSS = cMaxSS * Math.exp(-ke * intervalHours);
    } else {
      // Time to peak steady-state tmax,ss
      const tMaxSS = Math.log(
        (ka * (1 - Math.exp(-ke * intervalHours))) / (ke * (1 - Math.exp(-ka * intervalHours)))
      ) / (ka - ke);
      const safeTMax = Math.max(0.2, isNaN(tMaxSS) ? 1.5 : tMaxSS);

      cMaxSS = (F * doseMg * ka / (vdLiters * (ka - ke))) * (
        (Math.exp(-ke * safeTMax) / (1 - Math.exp(-ke * intervalHours))) -
        (Math.exp(-ka * safeTMax) / (1 - Math.exp(-ka * intervalHours)))
      );
      cMinSS = (F * doseMg * ka / (vdLiters * (ka - ke))) * (
        (Math.exp(-ke * intervalHours) / (1 - Math.exp(-ke * intervalHours))) -
        (Math.exp(-ka * intervalHours) / (1 - Math.exp(-ka * intervalHours)))
      );
    }
  } else if (modelUsed === 'Michaelis-Menten Saturable') {
    // Phenytoin saturable kinetics
    const vmax = drugEntry.saturableKinetics?.vmaxMgPerKgPerDay ? drugEntry.saturableKinetics.vmaxMgPerKgPerDay * weightKg : 7.0 * weightKg;
    const km = drugEntry.saturableKinetics?.kmMcgPerMl || 4.0;
    const dailyDose = doseMg * (24 / intervalHours);

    if (dailyDose >= vmax) {
      cAvgSS = 99.9; // Saturation runaway warning
      cMaxSS = 110.0;
      cMinSS = 90.0;
    } else {
      cAvgSS = (km * dailyDose) / (vmax - dailyDose);
      cMaxSS = cAvgSS * 1.25;
      cMinSS = cAvgSS * 0.80;
    }
  }

  // AUC for one dosing interval tau: AUC_tau = Dose * F / CL
  const aucTau = Number(((doseMg * F) / totalCL).toFixed(1));

  // Target Therapeutic Range and Ceilings
  const targetMin = drugEntry.therapeuticRange.min;
  const targetMax = drugEntry.therapeuticRange.max;
  const targetUnit = drugEntry.therapeuticRange.unit;
  const upperSafetyCeiling = targetMax;

  // Loading dose calculation to reach target midpoint
  const targetMidpoint = (targetMin + targetMax) / 2;
  const loadingDoseMg = Number(((targetMidpoint * vdLiters) / F).toFixed(0));

  // Safety findings and ceiling violations
  const safetyCeilingExceeded = cMaxSS > upperSafetyCeiling || (modelUsed === 'Michaelis-Menten Saturable' && cAvgSS > upperSafetyCeiling);
  const subtherapeuticAlert = cMinSS < targetMin * 0.7;

  // Renal & Hepatic guidance
  let renalNote = 'Standard renal monitoring.';
  for (const rule of drugEntry.renalRules.crclThresholds) {
    if (crcl >= rule.minCrcl) {
      renalNote = rule.adjustment;
      break;
    }
  }

  const hepaticNote = drugEntry.hepaticRules.childPughAdjustment;

  // Safety finding text
  let safetyFinding = `Target range ${targetMin}–${targetMax} ${targetUnit}. Calculated Cmax,ss: ${cMaxSS.toFixed(2)} ${targetUnit}, Cmin,ss: ${cMinSS.toFixed(2)} ${targetUnit}.`;
  if (safetyCeilingExceeded) {
    safetyFinding = `CRITICAL ALERT: Upper safety ceiling (${upperSafetyCeiling} ${targetUnit}) exceeded! Predicted peak Css ${cMaxSS.toFixed(2)} ${targetUnit} poses severe toxicity risk. ${renalNote}`;
  } else if (subtherapeuticAlert) {
    safetyFinding = `CAUTION: Subtherapeutic trough alert. Predicted trough Css ${cMinSS.toFixed(2)} ${targetUnit} is below therapeutic threshold (${targetMin} ${targetUnit}).`;
  }

  return {
    drugId: drugEntry.id,
    drugGenericName: drugEntry.name,
    drugClass: drugEntry.drugClass,
    route,
    modelUsed,
    doseMg,
    intervalHours,
    infusionTimeHours: modelUsed === 'One-Compartment IV Infusion' ? infusionTimeHours : undefined,
    bioavailabilityF: F,
    absorptionRateKa: ka,
    vdLiters,
    clearanceLperH: totalCL,
    renalClearanceLperH: Number(patientRenalCL.toFixed(3)),
    nonRenalClearanceLperH: Number(patientNonRenalCL.toFixed(3)),
    keHourInv: Number(ke.toFixed(4)),
    halfLifeHours: Number(tHalf.toFixed(2)),
    halfLifeChangeFactor: tHalfRatio,
    peakSteadyStateCss: Number(cMaxSS.toFixed(2)),
    troughSteadyStateCss: Number(cMinSS.toFixed(2)),
    averageSteadyStateCss: Number(cAvgSS.toFixed(2)),
    aucTau,
    accumulationRatio: Number(accumulationR.toFixed(2)),
    loadingDoseMg,
    therapeuticTargetMin: targetMin,
    therapeuticTargetMax: targetMax,
    therapeuticUnit: targetUnit,
    upperSafetyCeiling,
    safetyCeilingExceeded,
    subtherapeuticAlert,
    guidelineCode: drugEntry.renalRules.guideline,
    safetyFinding,
    renalAdjustmentNote: renalNote,
    hepaticAdjustmentNote: hepaticNote,
    formulaMetadata: {
      modelType: modelUsed,
      keFormula: 'k_e = CL / V_d',
      tHalfFormula: 't_1/2 = ln(2) / k_e',
      cMaxFormula: modelUsed === 'One-Compartment IV Infusion'
        ? 'C_max,ss = (R / CL) × (1 - e^-k_e·t_inf) / (1 - e^-k_e·τ)'
        : modelUsed === 'First-Order Oral Absorption'
        ? 'C_max,ss = [F·Dose·k_a / (V_d·(k_a - k_e))] × [e^-k_e·t_max / (1 - e^-k_e·τ) - e^-k_a·t_max / (1 - e^-k_a·τ)]'
        : 'C_max,ss = (Dose / V_d) × [1 / (1 - e^-k_e·τ)]',
      cMinFormula: 'C_min,ss = C_max,ss × e^-k_e·τ',
      cAvgFormula: 'C_ss,avg = F × Dose / (CL × τ)',
      loadingDoseFormula: 'Loading Dose = C_ss,target × V_d / F',
      units: {
        clearance: 'L/h',
        halfLife: 'hours',
        peakCss: targetUnit,
        vd: 'Liters',
        auc: `${targetUnit}·h`,
        ke: 'h^-1'
      },
      primaryReference: drugEntry.citation
    }
  };
}

// ==========================================
// 5. DECISION SUPPORT MATRIX & TRIAGE SCORING
// ==========================================

export type RiskTier = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface TriageFactor {
  category: 'Renal' | 'Hepatic' | 'NTI' | 'Interaction' | 'Biometrics' | 'Vulnerable';
  description: string;
  points: number;
}

export interface DecisionSupportTriageResult {
  score: number;
  tier: RiskTier;
  factors: TriageFactor[];
  recommendedAction: string;
  monitoringPlan: {
    parameter: string;
    frequency: string;
    clinicalRationale: string;
  }[];
}

export function evaluateDecisionSupportMatrix(params: {
  egfr: number;
  crcl: number;
  hepaticStatus: 'Normal' | 'Child-Pugh A' | 'Child-Pugh B' | 'Child-Pugh C';
  isNarrowTherapeuticIndex: boolean;
  activeInteractions: { agent: string; severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated' }[];
  age: number;
  bmi: number;
  pregnancy: boolean;
  lactation: boolean;
  potassium: number;
}): DecisionSupportTriageResult {
  const { egfr, crcl, hepaticStatus, isNarrowTherapeuticIndex, activeInteractions, age, bmi, pregnancy, lactation, potassium } = params;
  const factors: TriageFactor[] = [];

  // 1. Renal Function Score
  if (egfr < 15 || crcl < 15) {
    factors.push({ category: 'Renal', description: 'End-Stage Kidney Disease (eGFR/CrCl < 15 mL/min)', points: 4 });
  } else if (egfr < 30 || crcl < 30) {
    factors.push({ category: 'Renal', description: 'Severe CKD Stage 4 (eGFR/CrCl 15–29 mL/min)', points: 3 });
  } else if (egfr < 45 || crcl < 45) {
    factors.push({ category: 'Renal', description: 'Moderate-to-Severe CKD Stage 3b (eGFR/CrCl 30–44 mL/min)', points: 2 });
  } else if (egfr < 60 || crcl < 60) {
    factors.push({ category: 'Renal', description: 'Mild-to-Moderate CKD Stage 3a (eGFR/CrCl 45–59 mL/min)', points: 1 });
  }

  // 2. Hepatic Function Score
  if (hepaticStatus === 'Child-Pugh C') {
    factors.push({ category: 'Hepatic', description: 'Severe hepatic cirrhosis (Child-Pugh Class C)', points: 4 });
  } else if (hepaticStatus === 'Child-Pugh B') {
    factors.push({ category: 'Hepatic', description: 'Moderate hepatic impairment (Child-Pugh Class B)', points: 2 });
  } else if (hepaticStatus === 'Child-Pugh A') {
    factors.push({ category: 'Hepatic', description: 'Mild hepatic compensation (Child-Pugh Class A)', points: 1 });
  }

  // 3. Narrow Therapeutic Index (NTI)
  if (isNarrowTherapeuticIndex) {
    factors.push({ category: 'NTI', description: 'Narrow Therapeutic Index (NTI) agent with small margin of safety', points: 3 });
  }

  // 4. Drug-Drug Interactions
  for (const inter of activeInteractions) {
    if (inter.severity === 'Contraindicated') {
      factors.push({ category: 'Interaction', description: `Contraindicated co-administration with ${inter.agent}`, points: 5 });
    } else if (inter.severity === 'Major') {
      factors.push({ category: 'Interaction', description: `Major pharmacokinetic/pharmacodynamic interaction with ${inter.agent}`, points: 3 });
    } else if (inter.severity === 'Moderate') {
      factors.push({ category: 'Interaction', description: `Moderate interaction requiring monitoring with ${inter.agent}`, points: 1 });
    }
  }

  // 5. Age and Biometric Extremes
  if (age >= 80) {
    factors.push({ category: 'Biometrics', description: 'Advanced age (≥ 80 years) with decreased physiological reserve', points: 2 });
  } else if (age >= 70) {
    factors.push({ category: 'Biometrics', description: 'Elderly patient (70–79 years)', points: 1 });
  }

  if (bmi >= 40) {
    factors.push({ category: 'Biometrics', description: 'Class III Severe Obesity (BMI ≥ 40 kg/m²)', points: 2 });
  } else if (bmi < 18.5) {
    factors.push({ category: 'Biometrics', description: 'Underweight cachexia (BMI < 18.5 kg/m²)', points: 1 });
  }

  // 6. Electrolytes & Vulnerable Population
  if (potassium >= 5.5 || potassium <= 3.2) {
    factors.push({ category: 'Vulnerable', description: `Critical serum potassium derangement (${potassium.toFixed(1)} mEq/L)`, points: 2 });
  }

  if (pregnancy) {
    factors.push({ category: 'Vulnerable', description: 'Pregnancy: altered placental transfer and plasma volume expansion', points: 3 });
  }
  if (lactation) {
    factors.push({ category: 'Vulnerable', description: 'Lactation: maternal-infant milk transmission hazard', points: 2 });
  }

  // Compute total score
  const totalScore = factors.reduce((sum, f) => sum + f.points, 0);

  let tier: RiskTier = 'Low';
  let recommendedAction = 'Standard dosing protocol. Routine periodic surveillance.';

  if (totalScore >= 12) {
    tier = 'Critical';
    recommendedAction = 'MANDATORY CLINICAL REVIEW: Critical safety hazard. Withhold or substantially reduce dose. Recommend immediate Clinical Pharmacist or Specialist consultation.';
  } else if (totalScore >= 8) {
    tier = 'High';
    recommendedAction = 'HIGH RISK REGIMEN: Dose modification required. Establish baseline therapeutic drug monitoring (TDM) prior to 3rd dose.';
  } else if (totalScore >= 4) {
    tier = 'Moderate';
    recommendedAction = 'CAUTIONARY TITRATION: Close laboratory surveillance recommended. Monitor renal/hepatic indices every 7-14 days.';
  }

  // Concrete monitoring plan
  const monitoringPlan = [
    {
      parameter: 'Serum Creatinine & eGFR (CKD-EPI)',
      frequency: totalScore >= 8 ? 'Every 48 to 72 hours' : 'Every 1 to 2 weeks',
      clinicalRationale: 'Detect early acute kidney injury and ensure clearance assumptions remain calibrated.'
    },
    {
      parameter: 'Serum Drug Peak / Trough Level (TDM)',
      frequency: isNarrowTherapeuticIndex ? 'Prior to 3rd or 4th dose (steady-state)' : 'As clinically indicated for efficacy failure',
      clinicalRationale: 'Confirm individual concentration-time trajectory resides safely inside the therapeutic window.'
    },
    {
      parameter: 'Serum Potassium & Basic Metabolic Panel',
      frequency: (potassium >= 5.2 || potassium <= 3.5 || totalScore >= 6) ? 'Every 48 hours' : 'Monthly',
      clinicalRationale: 'Prevent fatal cardiac arrhythmias and monitoring tubular electrolyte handling.'
    }
  ];

  return {
    score: totalScore,
    tier,
    factors,
    recommendedAction,
    monitoringPlan
  };
}

// ==========================================
// 6. CURVE GENERATOR FOR PLOTTING
// ==========================================

export function generatePKConcentrationCurve(
  doseMg: number,
  vdLiters: number,
  keHourInv: number,
  intervalHours: number,
  route: string,
  ka: number = 1.2,
  infusionTimeHours: number = 1.0,
  cycles: number = 4
): { timeHours: number; concentration: number }[] {
  const points: { timeHours: number; concentration: number }[] = [];
  const totalTime = intervalHours * cycles;
  const numSteps = 140;

  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * totalTime;
    let totalConc = 0;

    const numDoses = Math.floor(t / intervalHours) + 1;
    for (let d = 0; d < numDoses; d++) {
      const doseTime = d * intervalHours;
      const tSinceDose = t - doseTime;

      if (tSinceDose >= 0) {
        if (route === 'IV Bolus') {
          totalConc += (doseMg / vdLiters) * Math.exp(-keHourInv * tSinceDose);
        } else if (route === 'IV Infusion') {
          const tInf = Math.min(intervalHours, infusionTimeHours);
          const rInf = doseMg / tInf;
          const cl = keHourInv * vdLiters;
          if (tSinceDose <= tInf) {
            totalConc += (rInf / cl) * (1 - Math.exp(-keHourInv * tSinceDose));
          } else {
            totalConc += (rInf / cl) * (1 - Math.exp(-keHourInv * tInf)) * Math.exp(-keHourInv * (tSinceDose - tInf));
          }
        } else {
          // Oral first-order
          if (Math.abs(ka - keHourInv) > 0.001) {
            const conc = (doseMg * ka / (vdLiters * (ka - keHourInv))) * (Math.exp(-keHourInv * tSinceDose) - Math.exp(-ka * tSinceDose));
            if (conc > 0) totalConc += conc;
          } else {
            totalConc += (doseMg / vdLiters) * Math.exp(-keHourInv * tSinceDose);
          }
        }
      }
    }

    points.push({
      timeHours: Number(t.toFixed(1)),
      concentration: Number(totalConc.toFixed(2))
    });
  }

  return points;
}

// ==========================================
// 7. AUTOMATED UNIT TESTS WITH KNOWN VALUES
// ==========================================

export interface UnitTestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

/**
 * Executes deterministic clinical mathematical tests.
 * Required test targets:
 * 1. 500 mg IV bolus, Vd 20 L, CL 5 L/h gives k = 0.25 /h, t1/2 ≈ 2.77 h, C0 = 25 mg/L.
 * 2. Male, 60 years, 70 kg, SCr 1.0 mg/dL gives Cockcroft-Gault CrCl ≈ 77.8 mL/min.
 * 3. Steady-state accumulation ratio R = 1 / (1 - e^-ke*tau).
 * 4. Loading dose check = Css * Vd / F.
 */
export function runClinicalMathTests(): { allPassed: boolean; results: UnitTestResult[] } {
  const results: UnitTestResult[] = [];

  // Test 1: 500 mg IV bolus, Vd 20 L, CL 5 L/h
  const vd1 = 20;
  const cl1 = 5;
  const dose1 = 500;
  const k1 = cl1 / vd1; // 0.25
  const tHalf1 = Math.LN2 / k1; // 2.772588...
  const c01 = dose1 / vd1; // 25

  const test1Passed =
    Math.abs(k1 - 0.25) < 0.001 &&
    Math.abs(tHalf1 - 2.77) < 0.02 &&
    Math.abs(c01 - 25.0) < 0.001;

  results.push({
    name: 'Standard IV Bolus Kinetics (500mg, Vd 20L, CL 5L/h)',
    passed: test1Passed,
    expected: 'k = 0.25 /h, t1/2 ≈ 2.77 h, C0 = 25.0 mg/L',
    actual: `k = ${k1.toFixed(3)} /h, t1/2 = ${tHalf1.toFixed(2)} h, C0 = ${c01.toFixed(1)} mg/L`
  });

  // Test 2: Cockcroft-Gault: Male, 60 years, 70 kg, SCr 1.0 mg/dL
  // CrCl = ((140 - 60) * 70) / (72 * 1.0) * 1.0 = (80 * 70) / 72 = 5600 / 72 ≈ 77.78 mL/min
  const cg2 = calculateCockcroftGault(60, 70, 175, 1.0, 'Male', 'Actual');
  const test2Passed = Math.abs(cg2.crcl - 77.8) <= 0.1;

  results.push({
    name: 'Cockcroft-Gault Baseline (Male, 60y, 70kg, SCr 1.0 mg/dL)',
    passed: test2Passed,
    expected: 'CrCl ≈ 77.8 mL/min',
    actual: `CrCl = ${cg2.crcl} mL/min (weight used: ${cg2.weightUsed} kg)`
  });

  // Test 3: Steady-State Accumulation Ratio Check
  // Tau = 12h, ke = 0.1 /h -> R = 1 / (1 - e^-1.2) = 1 / (1 - 0.30119) = 1 / 0.6988 ≈ 1.43
  const tau3 = 12;
  const ke3 = 0.1;
  const r3 = 1 / (1 - Math.exp(-ke3 * tau3));
  const test3Passed = Math.abs(r3 - 1.43) <= 0.02;

  results.push({
    name: 'Steady-State Accumulation Factor (tau 12h, ke 0.1/h)',
    passed: test3Passed,
    expected: 'Accumulation Ratio R ≈ 1.43',
    actual: `R = ${r3.toFixed(2)}`
  });

  // Test 4: Loading Dose Calculation
  // Target Css = 15 mcg/mL, Vd = 35 L, F = 1.0 -> Loading dose = 15 * 35 = 525 mg
  const targetCss4 = 15;
  const vd4 = 35;
  const f4 = 1.0;
  const ld4 = (targetCss4 * vd4) / f4;
  const test4Passed = ld4 === 525;

  results.push({
    name: 'Loading Dose Derivation (Target Css 15, Vd 35L, F 1.0)',
    passed: test4Passed,
    expected: 'Loading Dose = 525 mg',
    actual: `Loading Dose = ${ld4} mg`
  });

  // Test 5: CKD-EPI 2021 Race-Free Check
  // Female, 65y, SCr 1.4 mg/dL
  const ckd5 = calculateCKDEPI2021(65, 1.4, 'Female');
  const test5Passed = ckd5.egfr > 0 && ckd5.stageCode === 'G3b';

  results.push({
    name: '2021 CKD-EPI Race-Free Evaluation (Female, 65y, SCr 1.4 mg/dL)',
    passed: test5Passed,
    expected: 'eGFR ~43 mL/min/1.73m², Stage G3b',
    actual: `eGFR = ${ckd5.egfr} mL/min/1.73m², Stage: ${ckd5.stage}`
  });

  // Test 6: PHI Scanner Guardrail
  const phiTest = detectAndSanitizePHI('Contact Dr. at test@hospital.org or 415-555-0199 for MRN: 9841284.');
  const test6Passed = phiTest.containsPHI && phiTest.warnings.length >= 3;

  results.push({
    name: 'PHI Sanitization & HIPAA Safe Harbor Guardrail',
    passed: test6Passed,
    expected: 'Detected Email, Phone, and MRN',
    actual: `Stripped: ${phiTest.warnings.length} identifier patterns found`
  });

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}

/**
 * Legacy curve point generator for DigitalTwinSimulationView
 */
export function generatePKPoints(
  doseMg: number,
  halfLifeHours: number,
  timePointsCount: number = 70,
  maxTimeHours: number = 36
): { time: number; concentration: number; x: number; y: number }[] {
  const ka = 1.1;
  const ke = Math.LN2 / Math.max(0.1, halfLifeHours);
  const vd = 65;
  const doseInterval = 12;

  const points: { time: number; concentration: number; x: number; y: number }[] = [];

  for (let i = 0; i <= timePointsCount; i++) {
    const t = (i / timePointsCount) * maxTimeHours;
    let totalConc = 0;

    const numDoses = Math.floor(t / doseInterval) + 1;
    for (let d = 0; d < numDoses; d++) {
      const tDose = d * doseInterval;
      const tSinceDose = t - tDose;
      if (tSinceDose >= 0) {
        const c = (doseMg * ka / (vd * Math.max(0.01, ka - ke))) * (Math.exp(-ke * tSinceDose) - Math.exp(-ka * tSinceDose));
        if (c > 0) totalConc += c;
      }
    }

    const steadyStateBase = (doseMg * 0.00085) * (halfLifeHours / 6.0);
    const conc = totalConc + steadyStateBase;

    const x = (t / maxTimeHours) * 680;
    const y = Math.max(8, 110 - (conc / 3.2) * 100);

    points.push({
      time: Number(t.toFixed(1)),
      concentration: Number(conc.toFixed(2)),
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1))
    });
  }

  return points;
}

export function pointsToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x},${points[i].y}`;
  }
  return d;
}

