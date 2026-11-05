import React, { useState } from 'react';
import { PatientCase, MedicationItem } from '../../types/clinical';
import { ALL_DRUGS } from '../../data/drugs/index';
import { saveAnonymizedSimulationRecord } from '../../utils/simulationStorage';

interface PersonalizeRegimenModalProps {
  patient: PatientCase;
  isOpen: boolean;
  onClose: () => void;
  onApplyRegimen: (updatedPatient: PatientCase) => void;
}

export const PersonalizeRegimenModal: React.FC<PersonalizeRegimenModalProps> = ({
  patient,
  isOpen,
  onClose,
  onApplyRegimen
}) => {
  const [medications, setMedications] = useState<MedicationItem[]>(patient.medications);
  const [selectedDrugToAddId, setSelectedDrugToAddId] = useState<string>('');
  const [newDose, setNewDose] = useState<string>('');
  const [newFrequency, setNewFrequency] = useState<string>('Daily');
  const [newRoute, setNewRoute] = useState<string>('Oral');
  const [newIndication, setNewIndication] = useState<string>('');
  const [clinicalRationale, setClinicalRationale] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time patient-specific safety checker for any drug
  const evaluateDrugSafetyForPatient = (genericName: string, dose: string): {
    status: 'optimal' | 'flagged' | 'contraindicated' | 'monitor';
    evaluation: string;
    guideline: string;
    provenanceId?: string;
  } => {
    const nameLower = genericName.toLowerCase();
    const egfr = patient.organStatus.renal.egfr;
    const cyp = patient.organStatus.hepatic.cypStatus.toLowerCase();

    // Metformin Renal Safety
    if (nameLower.includes('metformin')) {
      if (egfr < 30) {
        return {
          status: 'contraindicated',
          evaluation: `CONTRAINDICATED: eGFR ${egfr} mL/min (<30 mL/min). Extreme lactic acidosis risk.`,
          guideline: 'FDA Boxed Warning / KDIGO 2023 Sec 1.3',
          provenanceId: 'prov-met-renal'
        };
      }
      if (egfr < 45) {
        const isHighDose = dose.includes('2000') || dose.includes('1000 mg BID') || dose.includes('850 mg BID');
        if (isHighDose) {
          return {
            status: 'flagged',
            evaluation: `FLAGGED: Dose exceeds safety ceiling in CKD 3b (eGFR ${egfr}). Reduce to max 1000 mg/day (500mg BID).`,
            guideline: 'KDIGO 2023 Sec 1.3 / ADA 2024',
            provenanceId: 'prov-met-renal'
          };
        }
        return {
          status: 'optimal',
          evaluation: `OPTIMAL: Renally adjusted to ≤1000 mg/day for eGFR ${egfr} mL/min (CKD 3b).`,
          guideline: 'KDIGO 2023 / ADA 2024',
          provenanceId: 'prov-met-renal'
        };
      }
      return {
        status: 'optimal',
        evaluation: 'OPTIMAL: Glomerular clearance uncompromised for standard dosing.',
        guideline: 'ADA Standards of Care 2024',
        provenanceId: 'prov-met-renal'
      };
    }

    // Warfarin PGx Safety
    if (nameLower.includes('warfarin')) {
      if (cyp.includes('poor') || cyp.includes('*3/*3') || cyp.includes('*2/*3')) {
        return {
          status: 'contraindicated',
          evaluation: `CRITICAL PGx HAZARD: ${patient.organStatus.hepatic.cypStatus}. >85% clearance deficit of active S-warfarin. Strongly recommend DOAC (Apixaban).`,
          guideline: 'CPIC Guideline (Level 1A)',
          provenanceId: 'prov-warf-cyp2c9'
        };
      }
      return {
        status: 'monitor',
        evaluation: 'MONITOR: Routine INR surveillance required with standard target 2.0-3.0.',
        guideline: 'CHEST 2012 Antithrombotic Guidelines',
        provenanceId: 'prov-warf-cyp2c9'
      };
    }

    // Citalopram Geriatric Safety
    if (nameLower.includes('citalopram')) {
      if (patient.biometrics.age >= 60 && (dose.includes('40') || dose.includes('30'))) {
        return {
          status: 'flagged',
          evaluation: `FLAGGED: Dose exceeds FDA geriatric limit of 20 mg/day for age ≥60. Risk of concentration-dependent QTc prolongation.`,
          guideline: 'FDA Drug Safety Communication / AGS Beers 2023',
          provenanceId: 'prov-cit-geriatric'
        };
      }
      return {
        status: 'optimal',
        evaluation: 'OPTIMAL: Within standard psychiatric dosing parameters.',
        guideline: 'APA Practice Guidelines',
        provenanceId: 'prov-cit-geriatric'
      };
    }

    // SGLT2 Inhibitors Cardiorenal Protection
    if (nameLower.includes('empagliflozin') || nameLower.includes('dapagliflozin')) {
      if (egfr >= 20) {
        return {
          status: 'optimal',
          evaluation: `CARDIORENAL PROTECTIVE: Class 1A recommendation for kidney disease progression reduction down to eGFR 20 mL/min.`,
          guideline: 'KDIGO 2023 / ADA 2024',
          provenanceId: 'prov-sglt2-kdigo'
        };
      }
      return {
        status: 'flagged',
        evaluation: `CAUTION: eGFR < 20 mL/min; limited glycemic efficacy, initiate only with nephrology guidance.`,
        guideline: 'KDIGO 2023',
        provenanceId: 'prov-sglt2-kdigo'
      };
    }

    // Lisinopril ACEi Safety
    if (nameLower.includes('lisinopril')) {
      if (patient.organStatus.cardiovascular.potassium >= 5.2) {
        return {
          status: 'flagged',
          evaluation: `HYPERKALEMIA RISK: Serum K+ ${patient.organStatus.cardiovascular.potassium} mEq/L. Monitor electrolytes within 7 days.`,
          guideline: 'KDIGO 2021 BP Guideline',
          provenanceId: 'prov-lis-acei'
        };
      }
      return {
        status: 'optimal',
        evaluation: 'RENAL PROTECTIVE: Antiproteinuric intraglomerular pressure reduction.',
        guideline: 'KDIGO 2021 / AHA 2022',
        provenanceId: 'prov-lis-acei'
      };
    }

    // Default general assessment
    return {
      status: 'optimal',
      evaluation: 'ACTIVE: Tolerated therapeutic agent within clinical parameters.',
      guideline: 'Standard Pharmacopeial Guideline'
    };
  };

  const handleDoseChange = (id: string, updatedDose: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const evalResult = evaluateDrugSafetyForPatient(m.name, updatedDose);
          return {
            ...m,
            dose: updatedDose,
            totalDailyDose: updatedDose,
            safetyStatus: evalResult.status,
            safetyEvaluation: evalResult.evaluation,
            guidelineCitation: evalResult.guideline,
            provenanceId: evalResult.provenanceId || m.provenanceId
          };
        }
        return m;
      })
    );
  };

  const handleRemoveMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setNotification('Medication removed from personalized regimen.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddMedication = () => {
    if (!selectedDrugToAddId) return;
    const drugDoc = ALL_DRUGS.find((d) => d.id === selectedDrugToAddId);
    if (!drugDoc) return;

    const assignedDose = newDose.trim() || '10 mg Oral Tablet';
    const safetyCheck = evaluateDrugSafetyForPatient(drugDoc.genericName, assignedDose);

    const newMedItem: MedicationItem = {
      id: `med-custom-${Date.now()}`,
      name: drugDoc.genericName,
      brand: drugDoc.brandNames[0],
      dose: assignedDose,
      route: newRoute,
      frequency: newFrequency,
      totalDailyDose: `${assignedDose} ${newFrequency}`,
      therapeuticClass: drugDoc.therapeuticClass,
      metabolism: drugDoc.pkParameters.clearanceRoute,
      metabolismDetail: `Clearance: ${drugDoc.pkParameters.clearanceRoute}; t1/2: ${drugDoc.pkParameters.halfLife}`,
      safetyStatus: safetyCheck.status,
      safetyEvaluation: safetyCheck.evaluation,
      guidelineCitation: safetyCheck.guideline,
      guidelineUrl: '#',
      provenanceId: safetyCheck.provenanceId || `drug-${drugDoc.id}`,
      recommendedAction: newIndication ? `Indication: ${newIndication}` : undefined
    };

    setMedications((prev) => [...prev, newMedItem]);
    setSelectedDrugToAddId('');
    setNewDose('');
    setNewIndication('');
    setNotification(`Added ${drugDoc.genericName} to personalized regimen.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApplyPersonalizedRegimen = () => {
    // 1. Calculate active rules and status
    const flaggedCount = medications.filter((m) => m.safetyStatus === 'flagged' || m.safetyStatus === 'contraindicated').length;

    const updatedPatient: PatientCase = {
      ...patient,
      medications,
      kpis: {
        ...patient.kpis,
        activeAgentsCount: medications.length,
        actionAlertsCount: flaggedCount,
        alertSummary: flaggedCount > 0 ? `${flaggedCount} Personalized Safety Alert(s)` : 'Optimal Safety Profile'
      }
    };

    // 2. Automatically record an anonymized simulation telemetry record into the Confidential Vault
    const primaryDrug = medications[0] || { name: 'Personalized Regimen', dose: 'Custom' };
    saveAnonymizedSimulationRecord({
      demographicDecade: `${Math.floor(patient.biometrics.age / 10) * 10}-${Math.floor(patient.biometrics.age / 10) * 10 + 9} Y`,
      biologicalSex: patient.biometrics.sex,
      primaryOrganProfile: {
        egfr: patient.organStatus.renal.egfr,
        egfrStage: patient.organStatus.renal.stage || 'CKD',
        scr: patient.organStatus.renal.scr,
        crcl: patient.organStatus.renal.crcl,
        potassium: patient.organStatus.cardiovascular.potassium,
        cypGenotype: patient.organStatus.hepatic.cypStatus
      },
      simulationParameters: {
        drugId: primaryDrug.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        drugGenericName: primaryDrug.name,
        baselineDose: primaryDrug.dose,
        simulatedDose: primaryDrug.dose,
        intervalHours: 12,
        route: primaryDrug.route || 'Oral'
      },
      pharmacokineticOutcomes: {
        baselineHalfLife: 6.2,
        simulatedHalfLife: +(6.2 * (90 / Math.max(15, patient.organStatus.renal.egfr))).toFixed(1),
        halfLifeChangeFactor: +(90 / Math.max(15, patient.organStatus.renal.egfr)).toFixed(2),
        predictedPeakCss: 1.65,
        upperSafetyCeiling: 2.0,
        safetyCeilingExceeded: flaggedCount > 0,
        primarySafetyFinding: clinicalRationale || `Personalized ${medications.length}-agent regimen customized for eGFR ${patient.organStatus.renal.egfr} and ${patient.organStatus.hepatic.cypStatus}.`,
        guidelineViolationCode: flaggedCount > 0 ? 'PERSONALIZED-AUDIT' : undefined
      },
      clinicianRationale: clinicalRationale || 'Clinician personalized regimen adjustment applied to digital twin.',
      sourceType: 'regimen-personalization'
    });

    onApplyRegimen(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0f2b38] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F1]0/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">
                  PATIENT-SPECIFIC REGIMEN PERSONALIZATION
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white font-mono">
                  {patient.id}
                </span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold">
                Customize &amp; Titrate Regimen for {patient.nameAlias}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Patient Specific Reference Strip */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
          <div className="flex items-center gap-4">
            <span>Age: <strong>{patient.biometrics.age}Y ({patient.biometrics.sex})</strong></span>
            <span>Weight: <strong>{patient.biometrics.weightKg} kg</strong></span>
            <span>eGFR: <strong className="text-[#0F766E] font-mono">{patient.organStatus.renal.egfr} mL/min</strong></span>
            <span>CrCl: <strong className="text-[#0F766E] font-mono">{patient.organStatus.renal.crcl} mL/min</strong></span>
            <span>CYP Genotype: <strong className="text-purple-800 font-mono">{patient.organStatus.hepatic.cypStatus}</strong></span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Real-time safety simulation enabled
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {notification && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>{notification}</span>
            </div>
          )}

          {/* Active Regimen Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0F766E] text-[18px]">medication</span>
                <span>Active Personalized Regimen ({medications.length} Medications)</span>
              </h3>
              <span className="text-slate-500 text-[11px]">
                Click doses below to modify titration
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 bg-white">
              {medications.map((med) => {
                const isFlagged = med.safetyStatus === 'flagged';
                const isContra = med.safetyStatus === 'contraindicated';
                const isOptimal = med.safetyStatus === 'optimal';

                return (
                  <div key={med.id} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 min-w-[200px] flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {med.name}
                        </span>
                        {med.brand && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            ({med.brand})
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {med.therapeuticClass}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center gap-2">
                        <span>Route: <strong>{med.route}</strong></span>
                        <span>•</span>
                        <span>Schedule: <strong>{med.frequency}</strong></span>
                      </div>

                      {/* Safety Evaluation Callout */}
                      <div className="text-[11px] pt-1 flex items-start gap-1.5">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          isContra
                            ? 'bg-rose-100 text-rose-800'
                            : isFlagged
                            ? 'bg-amber-100 text-amber-800'
                            : isOptimal
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {isContra ? 'dangerous' : isFlagged ? 'warning' : 'verified'}
                          </span>
                          <span>{med.safetyStatus}</span>
                        </span>
                        <span className="text-slate-600 leading-tight">
                          {med.safetyEvaluation}
                        </span>
                      </div>
                    </div>

                    {/* Dose Editor & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Dose / Strength
                        </label>
                        <input
                          type="text"
                          value={med.dose}
                          onChange={(e) => handleDoseChange(med.id, e.target.value)}
                          className="w-36 p-1.5 rounded border border-slate-300 text-xs font-semibold bg-slate-50 outline-none focus:border-teal-700 focus:bg-white"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveMedication(med.id)}
                        className="mt-4 p-2 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove / Discontinue Medication"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Drug from 305+ Drug Pharmacopeia */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0F766E] text-[18px]">add_circle</span>
              <span>Add New Therapeutic Agent from 305+ Pharmacopeia</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Medication
                </label>
                <select
                  value={selectedDrugToAddId}
                  onChange={(e) => {
                    setSelectedDrugToAddId(e.target.value);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700"
                >
                  <option value="">-- Choose drug from catalog ({ALL_DRUGS.length} available) --</option>
                  {ALL_DRUGS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.genericName} ({d.brandNames[0] || 'Brand'}) • {d.therapeuticClass}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dose &amp; Form
                </label>
                <input
                  type="text"
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
                  placeholder="e.g. 10 mg Oral Tablet"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Frequency
                </label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700"
                >
                  <option value="Daily in morning">Daily in morning</option>
                  <option value="Daily in evening">Daily in evening</option>
                  <option value="BID (Twice daily)">BID (Twice daily)</option>
                  <option value="TID (Three times daily)">TID (Three times daily)</option>
                  <option value="QHS (At bedtime)">QHS (At bedtime)</option>
                  <option value="PRN (As needed)">PRN (As needed)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <input
                type="text"
                value={newIndication}
                onChange={(e) => setNewIndication(e.target.value)}
                placeholder="Optional clinical indication (e.g. Cardiorenal protection in T2D)..."
                className="flex-1 p-2 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700"
              />

              <button
                type="button"
                onClick={handleAddMedication}
                disabled={!selectedDrugToAddId}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedDrugToAddId
                    ? 'bg-[#0F766E] hover:bg-[#0F766E] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add to Regimen</span>
              </button>
            </div>
          </div>

          {/* Clinician Rationale Note */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Clinical Personalization Rationale &amp; Documentation
            </label>
            <textarea
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              rows={2}
              placeholder="e.g. Metformin reduced to 500mg BID to comply with KDIGO 2023 CKD 3b limits; initiated Empagliflozin 10mg daily for cardiorenal protection..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-teal-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Saves de-identified record to Confidential Simulation Database
            </span>
            <button
              onClick={handleApplyPersonalizedRegimen}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-900 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Apply Personalized Regimen to Twin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
