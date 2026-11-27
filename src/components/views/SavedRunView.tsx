import React from 'react';
import { exportSavedRun } from '../../utils/twinSnapshot';
import type { AnonymousCaseRecord } from '../../firebase';

export function SavedRunView({
  record,
  openCases,
  resume,
}: {
  record: AnonymousCaseRecord | null;
  openCases: () => void;
  resume: () => void;
}) {
  if (!record)
    return (
      <section>
        <h1>Saved simulation</h1>
        <button className="start-link" onClick={openCases}>
          Choose a saved run
        </button>
      </section>
    );
  const { inputs, outputs } = record;
  const current = record.engineVersion?.startsWith('synthos-twin/');
  function download() {
    const url = URL.createObjectURL(
      new Blob([exportSavedRun(record!)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'synthos-saved-run.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="max-w-3xl space-y-4 p-5">
      <h1 className="text-3xl font-bold">Saved simulation</h1>
      <p>
        {record.anonymousCaseId} · {record.engineVersion || 'Earlier engine'}
      </p>
      {!current && (
        <p role="note">
          Legacy record. Earlier saves could contain placeholder results. These
          values are displayed as recorded.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-3">
        {[
          ['Drug', inputs.selectedDrug],
          [
            'Regimen',
            inputs.doseMg + ' mg every ' + inputs.intervalHours + ' hours',
          ],
          ['Age', inputs.age + ' years'],
          ['Weight', inputs.weightKg + ' kg'],
          ['Height', inputs.heightCm + ' cm'],
          ['Serum creatinine', inputs.scr + ' mg/dL'],
          ['Potassium', inputs.potassium + ' mEq/L'],
          ['Genotype', inputs.cypGenotype],
          ['Model half-life', outputs.simulatedHalfLife + ' h'],
          ['Predicted peak', outputs.predictedPeakCss],
          ['Model ceiling', outputs.upperSafetyCeiling],
          ['Ceiling exceeded', outputs.safetyCeilingExceeded ? 'Yes' : 'No'],
          ['Recorded finding', outputs.primarySafetyFinding],
        ].map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="font-semibold">{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <div className="flex gap-3 flex-wrap">
        <button className="start-link" onClick={download}>
          Export recorded values
        </button>
        {inputs.selectedDrug === 'metformin' &&
          ['Female', 'Male'].includes(record.biologicalSex) && (
            <button className="start-primary" onClick={resume}>
              Recalculate from these inputs
            </button>
          )}
      </div>
    </section>
  );
}
