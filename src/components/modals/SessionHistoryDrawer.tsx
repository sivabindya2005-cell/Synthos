import React, { useState, useEffect } from 'react';
import {
  AnonymizedSimulationRecord,
  getStoredSimulationRecords,
  exportSimulationVaultToCsv,
  exportSimulationVaultToJson,
  clearSimulationVault
} from '../../utils/simulationStorage';

interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecordIntoTwin?: (record: AnonymizedSimulationRecord) => void;
}

export const SessionHistoryDrawer: React.FC<SessionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadRecordIntoTwin
}) => {
  const [records, setRecords] = useState<AnonymizedSimulationRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecords(getStoredSimulationRecords());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyRecord = (r: AnonymizedSimulationRecord) => {
    const summary = `SYNTHOS Simulation Record ${r.id}
Drug: ${r.simulationParameters.drugGenericName} (${r.simulationParameters.simulatedDose})
Patient Organ Status: eGFR ${r.primaryOrganProfile.egfr} mL/min (${r.primaryOrganProfile.egfrStage}), SCr ${r.primaryOrganProfile.scr} mg/dL, CYP: ${r.primaryOrganProfile.cypGenotype}
Pharmacokinetics: Simulated t1/2: ${r.pharmacokineticOutcomes.simulatedHalfLife}h (${r.pharmacokineticOutcomes.halfLifeChangeFactor}x baseline), Peak Css: ${r.pharmacokineticOutcomes.predictedPeakCss} mcg/mL (Ceiling: ${r.pharmacokineticOutcomes.upperSafetyCeiling} mcg/mL)
Safety Status: ${r.pharmacokineticOutcomes.safetyCeilingExceeded ? 'EXCEEDED CEILING' : 'OPTIMAL / TOLERATED'}
Rule Finding: ${r.pharmacokineticOutcomes.primarySafetyFinding}
Timestamp: ${r.timestamp}`;

    navigator.clipboard.writeText(summary);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClear = () => {
    if (window.confirm('Clear your local recent simulation history? (Factory benchmarks will remain)')) {
      clearSimulationVault();
      setRecords(getStoredSimulationRecords());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Simulation Session History"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-slide-in-right text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] dark:bg-teal-950 border border-[#BEE3DB] dark:border-teal-800 flex items-center justify-center text-[#0F766E] dark:text-teal-300">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm">Recent Simulation History</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {records.length} recent titrations &amp; PK runs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label="Close History"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={exportSimulationVaultToCsv}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Download CSV"
            >
              <span className="material-symbols-outlined text-[14px]">table_view</span>
              <span>CSV</span>
            </button>
            <button
              onClick={exportSimulationVaultToJson}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Download JSON"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={handleClear}
            className="text-[11px] text-[#DC2626] dark:text-rose-400 hover:underline cursor-pointer"
          >
            Clear History
          </button>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent simulations recorded yet. Run a simulation in the Digital Twin to start tracking!
            </div>
          ) : (
            records.map((r) => {
              const isViolation = r.pharmacokineticOutcomes.safetyCeilingExceeded;
              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-2xs space-y-2 hover:border-[#14B8A6]/50 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                      {r.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isViolation
                          ? 'bg-rose-50 text-[#DC2626] dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isViolation ? 'Ceiling Violation' : 'Safe Titration'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{r.simulationParameters.drugGenericName}</span>
                    <span className="font-mono">{r.simulationParameters.simulatedDose}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>eGFR {r.primaryOrganProfile.egfr} · t1/2 {r.pharmacokineticOutcomes.simulatedHalfLife}h</span>
                    <span className="font-mono">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                    {r.pharmacokineticOutcomes.primarySafetyFinding}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyRecord(r)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      <span>{copiedId === r.id ? 'Copied!' : 'Copy Summary'}</span>
                    </button>

                    {onLoadRecordIntoTwin && (
                      <button
                        onClick={() => {
                          onLoadRecordIntoTwin(r);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-[#0F766E] text-white hover:bg-[#14B8A6] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[13px]">tune</span>
                        <span>Re-simulate</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <span>De-identified session cache (HIPAA compliant)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
