import React, { useState } from 'react';
import { PatientCase } from '../types/clinical';

interface SimulationModalProps {
  patient: PatientCase;
  isOpen: boolean;
  onClose: () => void;
  onApplySimulation: (updatedPatient: PatientCase) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onApplySimulation
}) => {
  if (!isOpen) return null;

  const [simEgfr, setSimEgfr] = useState<number>(patient.organStatus.renal.egfr);
  const [simScr, setSimScr] = useState<number>(patient.organStatus.renal.scr);
  const [simK, setSimK] = useState<number>(patient.organStatus.cardiovascular.potassium);
  const [simMetforminDose, setSimMetforminDose] = useState<string>('1000 mg BID (2000 mg/day)');
  const [simAkiEvent, setSimAkiEvent] = useState<boolean>(false);

  const handleApply = () => {
    // Clone and adjust patient case
    const updated: PatientCase = JSON.parse(JSON.stringify(patient));

    updated.organStatus.renal.egfr = simEgfr;
    updated.organStatus.renal.scr = simScr;
    updated.organStatus.cardiovascular.potassium = simK;

    // Evaluate renal status
    if (simEgfr < 30) {
      updated.organStatus.renal.stage = 'Stage 4 / 5 (Severe)';
      updated.organStatus.renal.badge = 'METFORMIN CONTRAINDICATED';
      updated.organStatus.renal.status = 'compromised';
      updated.pkData.predictedPeak = '3.90 mcg/mL';
      updated.pkData.pctVsReference = '+95% (Severe Toxicity Zone)';
      updated.pkData.halfLifeCurrent = '22.4h (Critical Accumulation)';
    } else if (simEgfr <= 44) {
      updated.organStatus.renal.stage = 'Stage 3b (Moderate-Severe)';
      updated.organStatus.renal.badge = 'DOSE REDUCTION REQUIRED';
      updated.organStatus.renal.status = 'compromised';
      updated.pkData.predictedPeak = '2.85 mcg/mL';
      updated.pkData.pctVsReference = '+42% vs Reference';
      updated.pkData.halfLifeCurrent = '14.8h in CKD 3b';
    } else if (simEgfr <= 59) {
      updated.organStatus.renal.stage = 'Stage 3a (Mild-Moderate)';
      updated.organStatus.renal.badge = 'REGULAR MONITORING';
      updated.organStatus.renal.status = 'caution';
      updated.pkData.predictedPeak = '2.10 mcg/mL';
      updated.pkData.pctVsReference = '+5% vs Reference';
      updated.pkData.halfLifeCurrent = '9.4h in CKD 3a';
    } else {
      updated.organStatus.renal.stage = 'Stage 2 / Normal';
      updated.organStatus.renal.badge = 'STANDARD DOSING';
      updated.organStatus.renal.status = 'normal';
      updated.pkData.predictedPeak = '1.70 mcg/mL';
      updated.pkData.pctVsReference = 'Normal Target Range';
      updated.pkData.halfLifeCurrent = '6.2h Baseline';
    }

    if (simK >= 5.2) {
      updated.organStatus.cardiovascular.badge = 'HYPERKALEMIA RISK';
    }

    onApplySimulation(updated);
    onClose();
  };

  const handleQuickPreset = (preset: 'aki' | 'recovered' | 'baseline') => {
    if (preset === 'aki') {
      setSimEgfr(24);
      setSimScr(2.6);
      setSimK(5.5);
      setSimAkiEvent(true);
    } else if (preset === 'recovered') {
      setSimEgfr(52);
      setSimScr(1.4);
      setSimK(4.4);
      setSimAkiEvent(false);
    } else {
      setSimEgfr(42);
      setSimScr(1.8);
      setSimK(4.9);
      setSimAkiEvent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-[#E5DDD0] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#0d1c32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#15803D] text-[22px]">science</span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base">
                Pharmacokinetic &amp; Renal Twin Simulator
              </h3>
              <p className="text-xs text-[#76849f]">
                Real-time dynamic stress test for {patient.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#76849f] hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quick Scenario Presets */}
          <div>
            <label className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block mb-2">
              Instant Simulation Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('aki')}
                className="p-2 rounded border border-[#fecaca] bg-[#fee2e2]/50 hover:bg-[#fee2e2] text-[#991b1b] font-medium text-left transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Acute AKI Insult
                </div>
                <div className="text-[10px] text-[#991b1b]/80">eGFR 24 • K+ 5.5</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('baseline')}
                className="p-2 rounded border border-[#fde68a] bg-[#fef3c7]/50 hover:bg-[#fef3c7] text-[#92400e] font-medium text-left transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  Active Case 3b
                </div>
                <div className="text-[10px] text-[#92400e]/80">eGFR 42 • SCr 1.8</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('recovered')}
                className="p-2 rounded border border-[#a7f3d0] bg-[#d1fae5]/50 hover:bg-[#d1fae5] text-[#065f46] font-medium text-left transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Partial Recovery
                </div>
                <div className="text-[10px] text-[#065f46]/80">eGFR 52 • SCr 1.4</div>
              </button>
            </div>
          </div>

          {/* eGFR Slider */}
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#1E3A8A]">Estimated GFR (mL/min/1.73m²):</span>
              <span className={`text-base font-bold font-mono px-2 py-0.5 rounded ${
                simEgfr < 30 ? 'bg-[#fee2e2] text-[#991b1b]' : simEgfr < 45 ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#d1fae5] text-[#065f46]'
              }`}>
                {simEgfr} mL/min
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={simEgfr}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSimEgfr(val);
                // approximate reciprocal SCr
                setSimScr(Number((75 / Math.max(15, val)).toFixed(2)));
              }}
              className="w-full accent-[#15803D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#4B6584]">
              <span>15 (Severe CKD 4/5)</span>
              <span>30 (Contraindicated)</span>
              <span>45 (Threshold)</span>
              <span>60 (Mild)</span>
              <span>90 (Normal)</span>
            </div>
          </div>

          {/* Serum Creatinine & Potassium Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-1">
              <label className="font-bold text-[#1E3A8A] block">Serum Creatinine (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6.0"
                value={simScr}
                onChange={(e) => setSimScr(Number(e.target.value))}
                className="w-full p-2 rounded border border-[#cbd5e1] font-mono text-sm bg-white"
              />
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-1">
              <label className="font-bold text-[#1E3A8A] block">Serum Potassium (mEq/L)</label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="6.5"
                value={simK}
                onChange={(e) => setSimK(Number(e.target.value))}
                className="w-full p-2 rounded border border-[#cbd5e1] font-mono text-sm bg-white"
              />
            </div>
          </div>

          {/* Metformin Dose Selection */}
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0] space-y-1.5">
            <label className="font-bold text-[#1E3A8A] block">Simulated Metformin Regimen</label>
            <div className="grid grid-cols-2 gap-2">
              {['1000 mg BID (2000 mg/day)', '500 mg BID (1000 mg/day)', '500 mg Daily (500 mg/day)', 'Discontinue (0 mg)'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSimMetforminDose(opt)}
                  className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                    simMetforminDose === opt
                      ? 'border-[#15803D] bg-[#15803D]/10 text-[#15803D] font-bold'
                      : 'border-[#cbd5e1] bg-white text-[#4B6584] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Rule Preview Banner */}
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            simEgfr < 30
              ? 'bg-[#fee2e2] border-[#fecaca] text-[#991b1b]'
              : simEgfr < 45
              ? 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]'
              : 'bg-[#d1fae5] border-[#a7f3d0] text-[#065f46]'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {simEgfr < 30 ? 'dangerous' : simEgfr < 45 ? 'warning' : 'task_alt'}
            </span>
            <div className="font-medium">
              {simEgfr < 30
                ? 'CRITICAL ALERT: Metformin strictly contraindicated (eGFR <30 mL/min). Stop immediately!'
                : simEgfr < 45
                ? 'CAUTION: Metformin max 1000 mg/day recommended. SGLT2i preferential switch candidate.'
                : 'NORMAL: Renal function adequate for full metformin dosing.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4EFE6] border-t border-[#E5DDD0] flex items-center justify-between">
          <button
            onClick={() => handleQuickPreset('baseline')}
            className="text-xs text-[#4B6584] hover:underline"
          >
            Reset to Case Baseline
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[#1E3A8A] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded bg-[#15803D] text-white hover:bg-[#006f66] text-xs font-semibold cursor-pointer shadow-xs"
            >
              Apply Simulation to Twin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
