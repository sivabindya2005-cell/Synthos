import type { AnonymousCaseRecord } from '../firebase';
import {
  calculateDeterministicPK,
  calculateCockcroftGault,
  calculateCKDEPI2021,
} from './clinicalMath';
import catalog from '../data/versionedDrugs.json';

export type TwinInputs = AnonymousCaseRecord['inputs'];
export function evaluateTwin(inputs: TwinInputs, sex: 'Female' | 'Male') {
  const { selectedDrug, cypGenotype, ...values } = inputs;
  const pk = calculateDeterministicPK({
    ...values,
    sex,
    drugId: selectedDrug,
    pgxVariant: cypGenotype,
  });
  const outputs = {
    egfr: calculateCKDEPI2021(inputs.age, inputs.scr, sex).egfr,
    crcl: calculateCockcroftGault(
      inputs.age,
      inputs.weightKg,
      inputs.heightCm,
      inputs.scr,
      sex,
      true,
    ).crcl,
    simulatedHalfLife: pk.halfLifeHours,
    halfLifeChangeFactor: pk.halfLifeChangeFactor,
    predictedPeakCss: pk.peakSteadyStateCss,
    upperSafetyCeiling: pk.upperSafetyCeiling,
    safetyCeilingExceeded: pk.safetyCeilingExceeded,
    primarySafetyFinding: pk.safetyFinding,
    guidelineViolationCode: pk.guidelineCode,
  };
  return {
    pk,
    outputs,
    inputs,
    biologicalSex: sex,
    engineVersion: 'synthos-twin/' + catalog.version,
  };
}
export function snapshotOf(run: ReturnType<typeof evaluateTwin>, note: string) {
  const decade = Math.floor(run.inputs.age / 10) * 10;
  return {
    anonymousCaseId: 'CASE-' + crypto.randomUUID(),
    engineVersion: run.engineVersion,
    demographicDecade: decade + '–' + (decade + 9),
    biologicalSex: run.biologicalSex,
    inputs: run.inputs,
    outputs: run.outputs,
    clinicianNotes: note,
  };
}

export function exportSavedRun(record: AnonymousCaseRecord) {
  return JSON.stringify(
    {
      case: record.anonymousCaseId,
      engineVersion: record.engineVersion,
      biologicalSex: record.biologicalSex,
      inputs: record.inputs,
      outputs: record.outputs,
    },
    null,
    2,
  );
}
