import React from 'react';
import { PATIENT_CASES } from '../../data/patientCases';
import { PatientCase } from '../../types/clinical';

interface ClinicalScenariosViewProps {
  activePatient: PatientCase;
  onSelectPatient: (patientId: string) => void;
  onOpenSimulator: () => void;
}

export const ClinicalScenariosView: React.FC<ClinicalScenariosViewProps> = ({
  activePatient,
  onSelectPatient,
  onOpenSimulator
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-[#0d1c32] text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#14b8a6]"></span>
            <span className="text-xs font-mono text-[#86f2e4] font-bold">EDUCATIONAL &amp; CLINICAL SIMULATION BENCH</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Synthetic Patient Cohort Portfolio
          </h2>
          <p className="text-xs text-[#76849f]">
            Pre-configured clinical phenotypes demonstrating renal clearance thresholds, PGx variants, and geriatric polypharmacy risks.
          </p>
        </div>
        <button
          onClick={onOpenSimulator}
          className="px-4 py-2 rounded bg-[#006a61] hover:bg-[#006f66] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Open Live Simulator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.values(PATIENT_CASES).map((caseItem) => {
          const isActive = caseItem.id === activePatient.id;
          return (
            <div
              key={caseItem.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-white border-[#006a61] shadow-md ring-2 ring-[#006a61]/20'
                  : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#14b8a6]' : 'bg-[#cbd5e1]'}`}></span>
                    <span className="font-bold text-sm text-[#191c1e]">{caseItem.id}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f2f4f6] text-[#475569]">
                    {caseItem.tier}
                  </span>
                </div>

                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#191c1e] mb-1">
                  {caseItem.nameAlias}
                </h3>
                <p className="text-xs text-[#475569] mb-3">
                  {caseItem.summary}
                </p>

                <div className="space-y-1.5 text-xs bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Primary Flag:</span>
                    <span className="font-semibold text-[#92400e] text-right truncate max-w-[150px]">
                      {caseItem.priorityTriage.title.split('(')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">eGFR / CrCl:</span>
                    <span className="font-mono text-[#191c1e]">{caseItem.organStatus.renal.egfr} / {caseItem.organStatus.renal.crcl} mL/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Regimen Agents:</span>
                    <span className="text-[#191c1e] font-mono">{caseItem.kpis.activeAgentsCount} drugs</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e2e8f0]">
                {isActive ? (
                  <div className="text-center py-1.5 text-xs font-bold text-[#006a61] bg-[#006a61]/10 rounded">
                    Currently Active Workspace
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectPatient(caseItem.id)}
                    className="w-full py-1.5 rounded bg-[#0f2b38] hover:bg-[#162a36] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Load Synthetic Case
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
