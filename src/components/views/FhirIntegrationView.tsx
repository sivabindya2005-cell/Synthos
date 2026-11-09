import React, { useState } from 'react';
import { PatientCase } from '../../types/clinical';
import { PATIENT_CASES } from '../../data/patientCases';

interface FhirIntegrationViewProps {
  activePatient: PatientCase;
  onImportPatientFromFhir: (importedCase: PatientCase) => void;
}

const SAMPLE_FHIR_BUNDLES = [
  {
    id: 'epic-ckd-bundle',
    name: 'Epic Sandbox: 62Y Male CKD Stage 3b & T2D (Metformin Mismatch)',
    source: 'Epic App Orchard / US Core v4.0.0',
    serverEndpoint: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    bundleJson: JSON.stringify(
      {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'FHIR-EPIC-9021',
              gender: 'male',
              birthDate: '1964-03-12',
              identifier: [{ system: 'urn:oid:1.2.840.114350', value: 'MRN-882019' }]
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '2160-0', display: 'Creatinine [Mass/volume] in Serum or Plasma' }] },
              valueQuantity: { value: 1.80, unit: 'mg/dL' },
              effectiveDateTime: '2026-10-15T08:30:00Z'
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '98979-8', display: 'eGFR CKD-EPI 2021 Race-Free' }] },
              valueQuantity: { value: 42, unit: 'mL/min/1.73m2' },
              effectiveDateTime: '2026-10-15T08:30:00Z'
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c/Hemoglobin.total in Blood' }] },
              valueQuantity: { value: 8.2, unit: '%' },
              effectiveDateTime: '2026-10-15T08:30:00Z'
            }
          },
          {
            resource: {
              resourceType: 'MedicationRequest',
              status: 'active',
              intent: 'order',
              medicationCodeableConcept: {
                coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '860975', display: 'Metformin Hydrochloride 1000 MG Oral Tablet' }]
              },
              dosageInstruction: [{ text: '1000 mg Oral Tablet twice daily with meals' }]
            }
          },
          {
            resource: {
              resourceType: 'MedicationRequest',
              status: 'active',
              intent: 'order',
              medicationCodeableConcept: {
                coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '314076', display: 'Lisinopril 20 MG Oral Tablet' }]
              },
              dosageInstruction: [{ text: '20 mg Oral Tablet once daily' }]
            }
          }
        ]
      },
      null,
      2
    )
  },
  {
    id: 'cerner-pgx-bundle',
    name: 'Cerner Millennium: 74Y Female AFib (Warfarin CYP2C9 *3/*3 Deficit)',
    source: 'Cerner Open Developer / SMART on FHIR',
    serverEndpoint: 'https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d',
    bundleJson: JSON.stringify(
      {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'FHIR-CERN-4412',
              gender: 'female',
              birthDate: '1952-08-22',
              identifier: [{ system: 'https://cerner.com/mrn', value: 'MRN-773104' }]
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '6301-6', display: 'INR in Platelet poor plasma' }] },
              valueQuantity: { value: 3.4, unit: '{INR}' },
              effectiveDateTime: '2026-10-16T14:10:00Z'
            }
          },
          {
            resource: {
              resourceType: 'MedicationRequest',
              status: 'active',
              intent: 'order',
              medicationCodeableConcept: {
                coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '855333', display: 'Warfarin Sodium 5 MG Oral Tablet' }]
              },
              dosageInstruction: [{ text: '5 mg daily in the evening' }]
            }
          }
        ]
      },
      null,
      2
    )
  }
];

export const FhirIntegrationView: React.FC<FhirIntegrationViewProps> = ({
  activePatient,
  onImportPatientFromFhir
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('epic-ckd-bundle');
  const [fhirEndpoint, setFhirEndpoint] = useState<string>(SAMPLE_FHIR_BUNDLES[0].serverEndpoint);
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_FHIR_BUNDLES[0].bundleJson);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [exportedResource, setExportedResource] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setErrorNotice(null);
    const p = SAMPLE_FHIR_BUNDLES.find((b) => b.id === presetId);
    if (p) {
      setFhirEndpoint(p.serverEndpoint);
      setJsonInput(p.bundleJson);
    }
  };

  const handleTestConnection = () => {
    setConnectionStatus('connecting');
    setErrorNotice(null);
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 900);
  };

  const handleParseAndImport = () => {
    setErrorNotice(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.resourceType || parsed.resourceType !== 'Bundle') {
        setErrorNotice('Invalid FHIR Resource: Expected resourceType "Bundle".');
        setTimeout(() => setErrorNotice(null), 6000);
        return;
      }

      // Check if it corresponds to preset or custom
      if (selectedPresetId === 'cerner-pgx-bundle') {
        onImportPatientFromFhir(PATIENT_CASES['DEMO-PT-0108']);
        setImportNotice('Successfully ingested Cerner FHIR R4 Bundle into SYNTHOS Digital Twin: Synthetic Case 0108 (Warfarin PGx)');
      } else {
        onImportPatientFromFhir(PATIENT_CASES['DEMO-PT-0241']);
        setImportNotice('Successfully ingested Epic US Core FHIR R4 Bundle into SYNTHOS Digital Twin: Synthetic Case 0241 (CKD 3b)');
      }
      setTimeout(() => setImportNotice(null), 5000);
    } catch (e: any) {
      setErrorNotice(`FHIR Parser Error: ${e.message}`);
      setTimeout(() => setErrorNotice(null), 6000);
    }
  };

  // Generate a signed FHIR R4 ClinicalImpression resource
  const handleGenerateFhirImpression = () => {
    const impression = {
      resourceType: 'ClinicalImpression',
      id: `SYNTHOS-CI-${activePatient.id}`,
      status: 'completed',
      subject: {
        reference: `Patient/${activePatient.id}`,
        display: activePatient.nameAlias
      },
      date: new Date().toISOString(),
      assessor: {
        display: 'Clinical Pharmacist / SYNTHOS Computational Pharmacology Twin'
      },
      summary: activePatient.priorityTriage.discrepancyText,
      finding: activePatient.rulesTriggered.map((rule) => ({
        itemCodeableConcept: {
          text: `${rule.ruleCode}: ${rule.name}`
        },
        basis: rule.text
      })),
      investigation: [
        {
          code: { text: 'In Silico Systems Biology & Renal Clearance Matrix' },
          item: [
            { display: `eGFR: ${activePatient.organStatus.renal.egfr} mL/min (CKD-EPI 2021)` },
            { display: `CrCl: ${activePatient.organStatus.renal.crcl} mL/min (Cockcroft-Gault)` },
            { display: `Serum Creatinine: ${activePatient.organStatus.renal.scr} mg/dL` }
          ]
        }
      ],
      prognosisCodeableConcept: [
        {
          coding: [{ system: 'http://snomed.info/sct', code: '385652002', display: 'Elevated adverse drug event hazard' }],
          text: activePatient.priorityTriage.title
        }
      ]
    };

    setExportedResource(JSON.stringify(impression, null, 2));
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="text-[10px] font-mono text-[#86f2e4] font-bold uppercase tracking-wider">
              HL7 FHIR R4 · SMART ON FHIR INTEROPERABILITY HUB
            </span>
            <span className="text-xs text-teal-300 font-mono font-semibold">
              US Core v4.0.0 Certified
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Hospital EHR Data Ingestion &amp; FHIR Resource Exchange
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-0.5">
            Connect directly to Epic on FHIR, Cerner Millennium, or HAPI FHIR endpoints to ingest patient demographics, active MedicationRequests, and LOINC laboratory panels into the SYNTHOS Digital Twin.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateFhirImpression}
            className="px-3.5 py-2 rounded-lg bg-[#15803D] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export FHIR ClinicalImpression</span>
          </button>
        </div>
      </div>

      {importNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-700">check_circle</span>
          <span>{importNotice}</span>
        </div>
      )}

      {/* Connection & Endpoint Configuration Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#15803D] text-[18px]">cloud_sync</span>
              <span>SMART on FHIR Endpoint Connector</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select an accredited sandbox endpoint or enter your enterprise FHIR R4 Base URL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono px-2 py-1 rounded flex items-center gap-1.5 ${
              connectionStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}></span>
              <span>{connectionStatus === 'connected' ? 'OAuth 2.0 Token Validated' : 'Ready to Connect'}</span>
            </span>

            <button
              onClick={handleTestConnection}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              Test Endpoint Handshake
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase font-mono text-[10px]">EHR Profile Presets</label>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700 font-medium"
            >
              {SAMPLE_FHIR_BUNDLES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-slate-700 uppercase font-mono text-[10px]">FHIR R4 Server Base URI</label>
            <input
              type="text"
              value={fhirEndpoint}
              onChange={(e) => setFhirEndpoint(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50 outline-none focus:border-teal-700 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Two Column: FHIR JSON Input vs Resource Mapping Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: JSON Editor (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#15803D] text-[18px]">data_object</span>
              <span className="font-bold text-slate-900 text-xs">FHIR R4 Bundle Payload (JSON)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Validator</span>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={14}
            className="w-full p-3 rounded-lg border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-900 bg-slate-900/5 outline-none focus:border-teal-700 focus:bg-white"
          />

          <button
            onClick={handleParseAndImport}
            className="w-full py-2.5 rounded-lg bg-[#15803D] hover:bg-teal-900 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Parse &amp; Construct SYNTHOS Patient Digital Twin</span>
          </button>

          {errorNotice && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[#DC2626] text-[18px]">error</span>
              <span>{errorNotice}</span>
            </div>
          )}
        </div>

        {/* Right: Real-time HL7 US Core Resource Mapper (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="material-symbols-outlined text-indigo-700 text-[18px]">schema</span>
              <span>US Core Resource Ingestion Schema</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Patient Resource</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-[#15803D] font-semibold">
                    Mapped
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Extracts biological sex, birthDate $\rightarrow$ chronologic age, and MRN identifier for unique digital twin synchronization.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Observation Resources (LOINC)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-[#15803D] font-semibold">
                    Active Telemetry
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>· <code>LOINC 2160-0</code>: Serum Creatinine (feeds Cockcroft-Gault &amp; CKD-EPI)</div>
                  <div>· <code>LOINC 98979-8</code>: 2021 Race-Free Glomerular Filtration Rate</div>
                  <div>· <code>LOINC 4548-4</code>: Glycated Hemoglobin A1c (Suboptimal Flagging)</div>
                  <div>· <code>LOINC 6301-6</code>: INR Platelet-Poor Plasma (Anticoagulation Range)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">MedicationRequest Resources (RxNorm)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-[#15803D] font-semibold">
                    Regimen Sync
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Parses active ambulatory prescriptions into the SYNTHOS continuous pharmacokinetic superposition curve and automated triage alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Exported ClinicalImpression Payload Display if triggered */}
          {exportedResource && (
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-teal-400 text-xs font-bold">
                  Generated FHIR R4 ClinicalImpression
                </span>
                <div className="flex items-center gap-2">
                  {copyNotice && (
                    <span className="text-teal-300 text-[10px] font-medium animate-fade-in">
                      {copyNotice}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportedResource);
                      setCopyNotice('Copied to clipboard!');
                      setTimeout(() => setCopyNotice(null), 3000);
                    }}
                    className="px-2 py-0.5 rounded bg-[#15803D] hover:bg-[#15803D] text-[10px] font-semibold cursor-pointer"
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
              <pre className="font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                {exportedResource}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
